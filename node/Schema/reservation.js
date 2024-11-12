const mongoose = require("mongoose");
const { Schema } = mongoose;

// 스키마 생성
const reservationSchema = new Schema({
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
});

// GET 요청을 처리하는 라우터 추가
// const express = require("express");
// const router = express.Router();
// router.get("/reservations", async (req, res) => {
//   try {
//     const reservations = await Reservation.find();
//     res.json(reservations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// ... 기존 코드 ...

module.exports = mongoose.model("Reservation", reservationSchema);
