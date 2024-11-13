// 몽구스 라이브러리 가져오기
const mongoose = require("mongoose");
// 스키마 생성 객체 가져오기
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // 회원 ID
    id: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    // 이름
    name: {
      type: String,
      require: true,
    },
    // 전화번호
    phone: {
      type: String,
      require: true,
    },
    // 회원 등급 (0:일반회원, 1:관리자)
    user_type: {
      type: Number,
      require: true,
    },
    // 회원 삭제 여부 (기본값:false)
    deleted: {
      type: Boolean,
      default: false,
    },
    // 회원 가입일
    create_date: {
      type: Date,
      default: Date.now,
    },
    // 회원 삭제일 (기본값 : null)
    delete_date: {
      type: Number,
      default: null,
    },
    // 회원 수정일 (기본값 : null)
    update_date: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
