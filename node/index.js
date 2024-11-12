const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const reservationRoutes = require("./routes/reservationRoute");

const app = express();

// MongoDB 연결 설정
const url =
  "mongodb+srv://lllllls189:1234@dabat.robui.mongodb.net/reservation?retryWrites=true&w=majority&appName=dabat";

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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
