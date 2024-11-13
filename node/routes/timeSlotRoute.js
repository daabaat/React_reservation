const express = require("express");
const router = express.Router();
const TimeSlot = require("../Schema/timeSlot");

// 모든 TimeSlot 조회
router.get("/timeslots", async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find().sort({ date: 1 });
    res.status(200).json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 날짜의 예약 가능 여부 조회
router.get("/timeslots/availability", async (req, res) => {
  try {
    const { date } = req.query;
    const timeSlot = await TimeSlot.findOne({
      date: new Date(date),
    }).populate("am.reservationId pm.reservationId");

    if (!timeSlot) {
      return res.status(200).json({
        date,
        am: { isReserved: false, reservationId: null },
        pm: { isReserved: false, reservationId: null },
      });
    }

    res.status(200).json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 특정 기간의 예약 상태 조회
router.get("/timeslots/period", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const timeSlots = await TimeSlot.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("am.reservationId pm.reservationId")
      .sort({ date: 1 });

    res.status(200).json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
