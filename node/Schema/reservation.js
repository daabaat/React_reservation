const mongoose = require("mongoose");
const { Schema } = mongoose;

// 스키마 생성
const reservationSchema = new Schema({
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
});

module.exports = mongoose.model("Reservation", reservationSchema);
