const express = require("express");
const router = express.Router();
const Accommodation = require("../Schema/accommodation");
const Reservation = require("../Schema/reservation");

router.get("/accommodations", async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
      .select("name address region person max_person price grade photo")
      .sort({ create_date: -1 });
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    console.log("검색 요청 받음:", req.query);
    const { region, checkIn, checkOut, person } = req.query;

    // 기본 쿼리 조건
    const query = {
      region: region,
      person: { $lte: parseInt(person) },
      max_person: { $gte: parseInt(person) },
    };

    console.log("검색 쿼리:", query);

    // 1단계: 기본 조건으로 숙소 검색
    const accommodations = await Accommodation.find(query);
    console.log("검색된 숙소 수:", accommodations.length);

    if (accommodations.length === 0) {
      return res.status(200).json([]);
    }

    // 2단계: 예약 가능 여부 확인
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    const bookedAccommodationIds = await Reservation.distinct(
      "accommodationId",
      {
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      }
    );

    // 3단계: 예약된 숙소 제외
    const availableAccommodations = accommodations.filter(
      (acc) => !bookedAccommodationIds.includes(acc._id.toString())
    );

    console.log("최종 이용 가능한 숙소 수:", availableAccommodations.length);
    res.status(200).json(availableAccommodations);
  } catch (error) {
    console.error("검색 에러:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
