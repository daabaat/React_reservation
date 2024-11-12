const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const reservationRoutes = require("./reservationRoute"); // 라우터 가져오기

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.use("/api", reservationRoutes); // '/api' 경로에 라우터 연결

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});
