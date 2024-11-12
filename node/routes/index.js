const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const url =
  "mongodb+srv://lllllls189:1234@dabat.robui.mongodb.net/?retryWrites=true&w=majority&appName=dabat";

const app = express();

app.use(cors());
app.use(morgan("dev"));

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
