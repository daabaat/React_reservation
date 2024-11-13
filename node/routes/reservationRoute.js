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
    const { checkin, checkout } = req.body;

    // 필수 입력 항목 검사
    if (!checkin || !checkout) {
      return res
        .status(400)
        .json({ message: "필수 입력 항목이 누락되었습니다" });
    }

    // checkin 날짜가 이미 존재하는지 검사
    const existingReservation = await reservationSchema.findOne({ checkin });
    if (existingReservation) {
      return res
        .status(400)
        .json({ message: "해당 체크인 날짜는 이미 예약되어 있습니다." });
    }

    // 예약 생성
    const reservation = await reservationSchema.create({
      checkin,
      checkout,
    });
    res.status(201).json(reservation);
  } catch (error) {
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
    const { checkin, checkout } = req.body;
    const updatedReservation = await reservationSchema.findByIdAndUpdate(
      id,

      { checkin, checkout },
      { new: true }
    );
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
