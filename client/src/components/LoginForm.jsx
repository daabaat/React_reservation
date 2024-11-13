import { useState } from "react";
import { login } from "../api/authApi";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

export default function LoginForm() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(id, password);
      console.log("로그인 성공:", response);

      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", response.token);

      alert("로그인 성공!");
    } catch (error) {
      alert("로그인 실패!");
    }
  };

  // 테스트용 더미 로그인
  const handleDummyLogin = () => {
    setId("hong123"); // 더미 데이터의 ID
    setPassword("hashedPassword123"); // 더미 데이터의 비밀번호
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="아이디"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
      />
      <button type="submit">로그인</button>
      <button type="button" onClick={handleDummyLogin}>
        테스트 계정으로 채우기
      </button>
      <Link to="/">
        <button>돌아가기</button>
      </Link>
    </form>
  );
}
