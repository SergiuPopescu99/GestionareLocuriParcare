import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: path.resolve(__dirname, ".env") }); // Make sure this is the first thing that runs

import "express-async-errors";
import express from "express";

import morgan from "morgan";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import { autheticateUser } from "./middleware/authMiddlewear.js";
//routers
import parkingRouter from "./routes/parkingSpotRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import bookingRouter from "./routes/bookingRoutes.js";
import chatRouter from "./routes/chatRoute.js";
import messegeRouter from "./routes/messegeRoute.js";
import "./utils/scheduler.js";

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
//middlewares

import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(morgan("dev"));

app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "Hello front end!" });
});
app.use("/api/v1/parking-spots", parkingRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", autheticateUser, userRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/chats", autheticateUser, chatRouter);
app.use("/api/v1/messages", autheticateUser, messegeRouter);
app.use("*", (req, res) => {
  return res.status(404).json({ msg: "Not Found" });
});
app.use(errorHandlerMiddleware);
try {
  await mongoose.connect(process.env.MONGO_URL);
  const port = process.env.PORT || 5100;
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (err) {
  console.log(err);
  process.exit(1);
}
