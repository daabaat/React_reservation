const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const url =
  "mongodb+srv://lllllls189:1234@dabat.robui.mongodb.net/mydb?retryWrites=true&w=majority&appName=dabat";

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const reservationSchema = require("../Schema/reservation");

router.get("/reservations", async (req, res) => {
  try {
    const reservations = await reservationSchema.find();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
