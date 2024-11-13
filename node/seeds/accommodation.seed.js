const mongoose = require("mongoose");
const Accommodation = require("../Schema/accommodation.js");

// MongoDB 연결
mongoose
  .connect("mongodb://localhost:27017/your_database")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// 더미 데이터
const accommodations = [
  {
    name: "서울 스카이 하우스",
    address: "서울시 강남구 테헤란로 123",
    person: 2,
    max_person: 4,
    description: "강남역 5분거리의 럭셔리 숙소",
    grade: 4.5,
    price: 150000,
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
  },
  {
    name: "부산 오션 뷰 펜션",
    address: "부산시 해운대구 해운대해변로 456",
    person: 4,
    max_person: 6,
    description: "해운대 바다가 보이는 프리미엄 펜션",
    grade: 4.8,
    price: 280000,
    images: [
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
    ],
  },
  // ... 더 많은 데이터
];

// 데이터 삽입 함수
const seedDB = async () => {
  try {
    // 기존 데이터 삭제
    await Accommodation.deleteMany({});

    // 새 데이터 삽입
    await Accommodation.insertMany(accommodations);

    console.log("데이터 시딩 완료!");
  } catch (error) {
    console.error("데이터 시딩 실패:", error);
  } finally {
    // 연결 종료
    mongoose.connection.close();
  }
};

// 시드 실행

seedDB();
