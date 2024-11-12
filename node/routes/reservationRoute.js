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
    if (!checkin || !checkout) {
      return res
        .status(400)
        .json({ message: "필수 입력 항목이 누락되었습니다" });
    }
    const reservation = await reservationSchema.create({
      checkin,
      checkout,
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
