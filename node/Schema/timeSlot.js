const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  am: {
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservationId: {
      // 어떤 예약에 속하는지 참조
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
  pm: {
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservationId: {
      // 어떤 예약에 속하는지 참조
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
});

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
