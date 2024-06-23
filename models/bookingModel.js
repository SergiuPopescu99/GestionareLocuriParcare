import mongoose from "mongoose";
const { Schema, model } = mongoose;

const BookingSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parkingSpot: {
      type: mongoose.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Booking = model("Booking", BookingSchema);

export default Booking;
