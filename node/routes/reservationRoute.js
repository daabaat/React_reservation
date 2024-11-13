const express = require("express");
const router = express.Router();
const reservationSchema = require("../Schema/reservation");

router.get("/reservations", async (req, res) => {
  try {
    const reservations = await reservationSchema.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reservations/create", async (req, res) => {
  try {
    const { reservations } = req.body;

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return res
        .status(400)
        .json({ message: "예약 데이터가 올바르지 않습니다." });
    }

    // 각 날짜별 예약 상태를 확인하기 위한 검증
    for (const reservation of reservations) {
      const date = new Date(reservation.date);
      const timeSlot = reservation.timeSlot;

      // 해당 날짜의 모든 예약 조회
      const existingReservations = await reservationSchema.find({
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      });

      // 해당 날짜의 AM/PM 예약 상태 확인
      const hasAM = existingReservations.some((r) => r.timeSlot === "AM");
      const hasPM = existingReservations.some((r) => r.timeSlot === "PM");

      // 예약 가능 여부 검증
      if (timeSlot === "AM" && hasAM) {
        return res.status(400).json({
          message: `${
            date.toISOString().split("T")[0]
          } AM 시간대는 이미 예약되어 있습니다.`,
        });
      }
      if (timeSlot === "PM" && hasPM) {
        return res.status(400).json({
          message: `${
            date.toISOString().split("T")[0]
          } PM 시간대는 이미 예약되어 있습니다.`,
        });
      }

      // 체크인(PM)과 체크아웃(AM) 규칙 검증
      if (reservation.isCheckIn && timeSlot !== "PM") {
        return res.status(400).json({
          message: "체크인은 PM 시간대에만 가능합니다.",
        });
      }
      if (reservation.isCheckOut && timeSlot !== "AM") {
        return res.status(400).json({
          message: "체크아웃은 AM 시간대에만 가능합니다.",
        });
      }
    }

    // 모든 검증을 통과하면 예약 생성
    const savedReservations = await reservationSchema.insertMany(reservations);
    res.status(201).json(savedReservations);
  } catch (error) {
    console.error("Reservation creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/reservations/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await reservationSchema.findByIdAndDelete(id);
    res.status(200).json({ message: "예약이 삭제되었습니다" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reservations/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, isCheckIn, isCheckOut } = req.body;
    const updatedReservation = await reservationSchema.findByIdAndUpdate(
      id,
      { date, timeSlot, isCheckIn, isCheckOut },
      { new: true }
    );
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
