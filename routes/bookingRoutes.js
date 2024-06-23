import { Router } from "express";
import { autheticateUser } from "../middleware/authMiddlewear.js";
import {
  createPaymentIntent,
  createBooking,
  getUserBookings,
  cancelBooking,
  getParkingSpotBookings,
  showBookingStats,
} from "../controllers/bookingController.js";
import {
  validateCreateBooking,
  validateBookingIdParam,
} from "../middleware/validationMiddleware.js";
const bookingRouter = Router();
bookingRouter.post(
  "/payment-intent",
  autheticateUser,
  validateCreateBooking,
  createPaymentIntent
);
bookingRouter.post("/", autheticateUser, createBooking);

bookingRouter.get("/user", autheticateUser, getUserBookings);
bookingRouter.patch(
  "/cancel/:bookingId",
  autheticateUser,

  cancelBooking
);
bookingRouter.get("/stats", autheticateUser, showBookingStats);
bookingRouter.get("/:parkingSpotId", getParkingSpotBookings);

export default bookingRouter;
