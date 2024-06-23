import mongoose from "mongoose";
import {
  PARK_TYPE,
  PARK_STATUS,
  PARK_PAID_STATUS,
  prices,
} from "../utils/constants.js";
const { Schema, model } = mongoose;

const ParkingSpotSchema = new Schema(
  {
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PARK_TYPE), // Tipul de loc de parcare
      default: PARK_TYPE.STANDARD,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(PARK_STATUS),
      default: PARK_STATUS.AVAILABLE,
    },
    paidStatus: {
      type: String,
      enum: Object.values(PARK_PAID_STATUS),
      default: PARK_PAID_STATUS.NOT_PAID,
    },
    city: {
      type: String,
    },
    sensorData: {
      type: {
        temperature: Number,
        humidity: Number,
        occupancy: Boolean,
      },
      default: {},
    },
    image: {
      type: String,
      required: false,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    bookings: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Booking",
      },
    ],
    savedSpots: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SavedSpot",
      },
    ],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

ParkingSpotSchema.pre("save", function (next) {
  const typeKey = this.type.toUpperCase();
  if (prices.hasOwnProperty(typeKey)) {
    this.price = prices[typeKey];
  } else {
    console.error("Invalid type for price lookup:", this.type);

    next(new Error("Invalid parking spot type for pricing"));
  }
  next();
});
const ParkingSpot = model("ParkingSpot", ParkingSpotSchema);

export default ParkingSpot;
