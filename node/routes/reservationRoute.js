const express = require("express");
const router = express.Router();
const Reservation = require("../Schema/reservation");
const TimeSlot = require("../Schema/timeSlot");
const mongoose = require("mongoose");

// 예약 조회
router.get("/reservations", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("accomodationId", "name address price region")
      .populate("userId", "name phone")
      .sort({ startDate: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 예약 생성
router.post("/reservations/create", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { startDate, endDate } = req.body;

    // 1. 예약 가능 여부 확인
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 해당 기간의 모든 날짜 생성
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 예약 가능 여부 확인
    for (const date of dates) {
      const timeSlot = await TimeSlot.findOne({ date });
      if (timeSlot) {
        if (date.getTime() === start.getTime() && timeSlot.pm.isReserved) {
          throw new Error("체크인 날짜 PM이 이미 예약되어 있습니다.");
        }
        if (date.getTime() === end.getTime() && timeSlot.am.isReserved) {
          throw new Error("체크아웃 날짜 AM이 이미 예약되어 있습니다.");
        }
        if (
          date.getTime() !== start.getTime() &&
          date.getTime() !== end.getTime()
        ) {
          if (timeSlot.am.isReserved || timeSlot.pm.isReserved) {
            throw new Error(
              `${date.toISOString().split("T")[0]} 날짜에 이미 예약이 있습니다.`
            );
          }
        }
      }
    }

    // 2. 예약 생성
    const reservation = await Reservation.create({
      startDate: start,
      endDate: end,
    });

    // 3. TimeSlot 생성 또는 업데이트
    for (const date of dates) {
      let timeSlot = await TimeSlot.findOne({ date });
      if (!timeSlot) {
        timeSlot = new TimeSlot({ date });
      }

      if (date.getTime() === start.getTime()) {
        timeSlot.pm.isReserved = true;
        timeSlot.pm.reservationId = reservation._id;
      } else if (date.getTime() === end.getTime()) {
        timeSlot.am.isReserved = true;
        timeSlot.am.reservationId = reservation._id;
      } else {
        timeSlot.am.isReserved = true;
        timeSlot.pm.isReserved = true;
        timeSlot.am.reservationId = reservation._id;
        timeSlot.pm.reservationId = reservation._id;
      }

      await timeSlot.save();
    }

    await session.commitTransaction();
    res.status(201).json(reservation);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// 예약 수정
router.put("/reservations/update/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. 기존 예약 정보 조회
    const oldReservation = await Reservation.findById(id);
    if (!oldReservation) {
      throw new Error("예약을 찾을 수 없습니다");
    }

    // 2. 기존 타임슬롯에서 예약 정보 제거
    await TimeSlot.updateMany(
      {
        date: {
          $gte: oldReservation.startDate,
          $lte: oldReservation.endDate,
        },
        $or: [
          { "am.reservationId": oldReservation._id },
          { "pm.reservationId": oldReservation._id },
        ],
      },
      {
        $set: {
          "am.isReserved": false,
          "am.reservationId": null,
          "pm.isReserved": false,
          "pm.reservationId": null,
        },
      },
      { session }
    );

    // 3. 새로운 날짜로 예약 수정
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { startDate: start, endDate: end },
      { new: true, session }
    );

    // 4. 새로운 타임슬롯 생성 또는 업데이트
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const date of dates) {
      let timeSlot = await TimeSlot.findOne({ date }).session(session);
      if (!timeSlot) {
        timeSlot = new TimeSlot({ date });
      }

      // 체크인 날짜인 경우
      if (date.getTime() === start.getTime()) {
        timeSlot.pm.isReserved = true;
        timeSlot.pm.reservationId = updatedReservation._id;
      }
      // 체크아웃 날짜인 경우
      else if (date.getTime() === end.getTime()) {
        timeSlot.am.isReserved = true;
        timeSlot.am.reservationId = updatedReservation._id;
      }
      // 중간 날짜들
      else {
        timeSlot.am.isReserved = true;
        timeSlot.pm.isReserved = true;
        timeSlot.am.reservationId = updatedReservation._id;
        timeSlot.pm.reservationId = updatedReservation._id;
      }

      await timeSlot.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json(updatedReservation);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// 예약 삭제
router.delete("/reservations/delete/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // 1. TimeSlot에서 예약 정보 삭제
    const updateResult = await TimeSlot.updateMany(
      {
        $or: [
          { "am.reservationId": new mongoose.Types.ObjectId(id) },
          { "pm.reservationId": new mongoose.Types.ObjectId(id) },
        ],
      },
      {
        $set: {
          "am.isReserved": false,
          "am.reservationId": null,
          "pm.isReserved": false,
          "pm.reservationId": null,
        },
      },
      { session }
    );

    console.log("TimeSlot update result:", updateResult); // 디버깅용

    // 2. 예약 삭제
    const deletedReservation = await Reservation.findByIdAndDelete(id).session(
      session
    );

    if (!deletedReservation) {
      throw new Error("예약을 찾을 수 없습니다.");
    }

    console.log("Deleted reservation:", deletedReservation); // 디버깅용

    await session.commitTransaction();
    res.status(200).json({
      message: "예약이 삭제되었습니다",
      timeSlotUpdateResult: updateResult,
      deletedReservation: deletedReservation,
    });
  } catch (error) {
    console.error("Delete error:", error); // 디버깅용
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
