const mongoose = require("mongoose");

// 숙소 정보 스키마
const accommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: { type: String, required: true },
  person: { type: Number, required: true },
  max_person: { type: Number, required: true },
  description: String,
  grade: Number,
  price: Number,
  images: [String],
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
