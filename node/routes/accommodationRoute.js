const express = require("express");
const router = express.Router();
const Accommodation = require("../Schema/accommodation");
const Reservation = require("../Schema/reservation");
const TimeSlot = require("../Schema/timeSlot");

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

    // 1. 기본 숙소 조건 검색 (지역, 인원)
    let query = {};

    if (region && region !== "전체") {
      query.region = region;
    }

    if (person) {
      query.person = { $lte: parseInt(person) };
      query.max_person = { $gte: parseInt(person) };
    }

    // 모든 숙소 검색
    const accommodations = await Accommodation.find(query);
    console.log("기본 조건 검색된 숙소 수:", accommodations.length);

    // 날짜 조건이 없으면 바로 결과 반환
    if (!checkIn || !checkOut) {
      return res.status(200).json(accommodations);
    }

    // 2. 해당 기간의 타임슬롯 검색
    const timeSlots = await TimeSlot.find({
      date: {
        $gte: new Date(checkIn),
        $lte: new Date(checkOut),
      },
    });
    console.log("검색된 타임슬롯 수:", timeSlots.length);

    // 3. 예약된 reservationId 수집
    const reservationIds = new Set();

    timeSlots.forEach((slot) => {
      const slotDate = new Date(slot.date).toISOString().split("T")[0];

      // 체크인 날짜는 PM만 확인
      if (slotDate === checkIn) {
        if (slot.pm.isReserved) {
          reservationIds.add(slot.pm.reservationId.toString());
        }
      }
      // 체크아웃 날짜는 AM만 확인
      else if (slotDate === checkOut) {
        if (slot.am.isReserved) {
          reservationIds.add(slot.am.reservationId.toString());
        }
      }
      // 중간 날짜는 AM, PM 모두 확인
      else {
        if (slot.am.isReserved) {
          reservationIds.add(slot.am.reservationId.toString());
        }
        if (slot.pm.isReserved) {
          reservationIds.add(slot.pm.reservationId.toString());
        }
      }
    });

    console.log("예약된 reservationIds:", Array.from(reservationIds));

    // 4. 예약된 숙소 ID 찾기
    const reservations = await Reservation.find({
      _id: { $in: Array.from(reservationIds) },
    });

    const bookedAccommodationIds = new Set(
      reservations.map((res) => res.accommodationId.toString())
    );

    console.log("예약된 숙소 IDs:", Array.from(bookedAccommodationIds));

    // 5. 예약된 숙소 제외하고 결과 반환
    const availableAccommodations = accommodations.filter(
      (acc) => !bookedAccommodationIds.has(acc._id.toString())
    );

    console.log("최종 이용 가능한 숙소 수:", availableAccommodations.length);
    res.status(200).json(availableAccommodations);
  } catch (error) {
    console.error("검색 에러:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
