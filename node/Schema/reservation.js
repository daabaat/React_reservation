const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ["AM", "PM"],
    required: true,
  },
  isCheckIn: {
    type: Boolean,
    required: true,
  },
  isCheckOut: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
