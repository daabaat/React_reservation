const express = require("express");
const router = express.Router();
const Accommodation = require("../Schema/accommodation");

router.get("/accommodations", async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
