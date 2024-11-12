// 몽구스 라이브러리 가져오기
const mongoose = require("mongoose");

// 스키마 생성 객체 가져오기
const { Schema } = mongoose;

// userSchema 가져오기
const reservationSchema = require("./reservation"); // user.js 파일에서 userSchema를 가져옵니다.

const reservationPostSchema = new Schema({
  title: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

// 사용자 데이터 추가 함수
async function addUserData(name, age) {
  const newUser = await userSchema.create({
    name: name,
    age: age,
  });
  return newUser;
}

module.exports = {
  Post: mongoose.model("Post", postSchema),
  addUserData, // 사용자 데이터를 추가하는 함수를 내보냅니다.
};
