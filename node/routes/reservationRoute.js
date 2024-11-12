const express = require("express");
const router = express.Router();
const app = express();
const mongoose = require("mongoose");

const url =
  "mongodb+srv://lllllls189:1234@dabat.robui.mongodb.net/mydb?retryWrites=true&w=majority&appName=dabat";

const reservationSchema = require("./Schema/reservation");
