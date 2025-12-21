import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db.js";
dotenv.config();
const app = express();
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
// routes
import userRoutes from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js";
import jobRoutes from "./routes/job.route.js";
app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/job", jobRoutes);
// DB
connectDB();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  res.status(statusCode).json({
    message,
    success: false,
    statusCode,
  });
});
app.listen(PORT, () => {
  console.log(`PORT IS RUNNING ON ${PORT}`);
});
