const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const studentRouter = require("./routes/student");
const classRouter = require("./routes/class");
const { connectDB } = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/students", studentRouter);
app.use("/api/class", classRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));
