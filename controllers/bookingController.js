import Booking from "../models/bookingModel.js";
import ParkingSpot from "../models/parkModel.js";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/userModel.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const isBookingConflict = async (parkingSpotId, startTime, endTime) => {
  const conflictingBooking = await Booking.findOne({
    parkingSpot: parkingSpotId,
    status: "booked",
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  });

  return conflictingBooking != null;
};

export const createPaymentIntent = async (req, res) => {
  const { parkingSpotId, startTime, endTime } = req.body;
  const userObj = JSON.stringify(await User.findById(req.user._id));

  const parkingSpot = await ParkingSpot.findById(parkingSpotId);
  if (!parkingSpot) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Parking spot not available" });
  }
  if (
    await isBookingConflict(
      parkingSpotId,
      new Date(startTime),
      new Date(endTime)
    )
  ) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "Parking spot already booked for the selected time range" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
  const totalPrice = durationHours * parkingSpot.price;

  const amountInCents = Math.round(totalPrice * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Stripe expects the amount in cents
      currency: "usd",
      metadata: { userObj, parkingSpotId, startTime, endTime },
    });

    res
      .status(StatusCodes.CREATED)
      .json({ clientSecret: paymentIntent.client_secret, amount: totalPrice });
  } catch (error) {
    console.error("Stripe error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Payment failed", error: error.message });
  }
};
export const createBooking = async (req, res) => {
  console.log(req.body);
  const { paymentIntentId } = req.body;

  console.log("Received paymentIntentId:", paymentIntentId);

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Payment not successful" });
    }

    const { userObj, parkingSpotId, startTime, endTime } =
      paymentIntent.metadata;

    console.log("Payment intent metadata:", paymentIntent.metadata);

    const newBooking = await Booking.create({
      user: JSON.parse(userObj),
      parkingSpot: parkingSpotId,
      startTime,
      endTime,
      totalPrice: paymentIntent.amount / 100,
    });

    const parkingSpot = await ParkingSpot.findById(parkingSpotId);
    parkingSpot.bookings.push(newBooking._id);
    parkingSpot.status = "reserved";
    await parkingSpot.save();

    console.log("Booking created:", newBooking);

    res.status(StatusCodes.CREATED).json({ booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal Server Error" });
  }
};
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate("parkingSpot");
  if (!booking) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "Booking not found" });
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Not authorized" });
  }

  booking.status = "cancelled";
  await booking.save();

  const parkingSpot = await ParkingSpot.findById(booking.parkingSpot._id);
  parkingSpot.status = "available";
  await parkingSpot.save();

  res.status(StatusCodes.OK).json({ msg: "Booking cancelled" });
};
export const getUserBookings = async (req, res) => {
  const userId = req.user._id;
  const bookings = await Booking.find({ user: userId }).populate("parkingSpot");
  res.status(StatusCodes.OK).json({ bookings });
};
export const getBookings = async (req, res) => {
  const bookings = await Booking.find().populate("parkingSpot");
  res.status(StatusCodes.OK).json({ bookings });
};
export const getParkingSpotBookings = async (req, res) => {
  const { parkingSpotId } = req.params;
  try {
    const bookings = await Booking.find({
      parkingSpot: parkingSpotId,
      status: "booked",
    });
    res.status(StatusCodes.OK).json({ bookings });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error fetching bookings" });
  }
};
export const showBookingStats = async (req, res) => {
  try {
    let bookingStats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const defaultBookingStats = {
      booked: 0,
      cancelled: 0,
      completed: 0,
    };
    bookingStats.forEach((stat) => {
      if (stat._id === "booked") {
        defaultBookingStats.booked = stat.count;
      } else if (stat._id === "cancelled") {
        defaultBookingStats.cancelled = stat.count;
      } else if (stat._id === "completed") {
        defaultBookingStats.completed = stat.count;
      }
    });
    let totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const revenue = totalRevenue[0]?.total || 0;
    res
      .status(StatusCodes.OK)
      .json({ bookingStats: defaultBookingStats, totalRevenue: revenue });
  } catch (err) {
    console.error("Error fetching booking stats:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error fetching booking stats" });
  }
};
