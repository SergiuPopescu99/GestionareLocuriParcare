import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customError.js";
import {
  PARK_TYPE,
  PARK_PAID_STATUS,
  PARK_SORT_BY,
} from "../utils/constants.js";
import mongoose from "mongoose";
import ParkingSpot from "../models/parkModel.js";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith("No ParkingSpot")) {
          throw new NotFoundError(errorMessages);
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};
const withValidationErrorsBookings = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};
export const validateParkSpot = withValidationErrors([
  body("location").notEmpty().withMessage("Location is required!"),
  body("type")
    .isIn(Object.values(PARK_TYPE))
    .withMessage("Invalid parking spot type"),
  body("sensorData")
    .optional()
    .isObject()
    .withMessage("Sensor data must be an object"),
  body("sensorData.temperature")
    .optional()
    .isNumeric()
    .withMessage("Temperature must be a numeric value"),
  body("sensorData.humidity")
    .optional()
    .isNumeric()
    .withMessage("Humidity must be a numeric value"),
  body("owner").optional().isMongoId().withMessage("Invalid owner ID"),

  body("paidStatus")
    .optional()
    .isIn(Object.values(PARK_PAID_STATUS))
    .withMessage("Invalid parking spot paid status"),
]);

export const validateIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) throw new BadRequestError("Invalid id!");

    const parkingSpot = await ParkingSpot.findById(value);
    if (!parkingSpot)
      throw new NotFoundError(`No ParkingSpot with id ${value}`);
  }),
]);

export const vaildateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required!"),
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email format!")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError("User already exists");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters long"),
  body("location").notEmpty().withMessage("Location is required!"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);
export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email format!"),
  body("password").notEmpty().withMessage("Password is required!"),
]);

export const vaildateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required!"),
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email format!")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user._id)
        throw new BadRequestError("User already exists");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 4 })
    .withMessage("Password should be at least 4 characters long"),
  body("location").notEmpty().withMessage("Location is required!"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);

export const validateCreateBooking = withValidationErrorsBookings([
  body("parkingSpotId").notEmpty().withMessage("Parking Spot Id is required!"),
  // .custom(async (value) => {
  //   if (!mongoose.Types.ObjectId.isValid(value)) {
  //     throw new BadRequestError("Invalid booking ID!");
  //   }

  //   const parkingSpot = await ParkingSpot.find(value);
  //   if (!parkingSpot) {
  //     throw new NotFoundError(`No ParkingSpot with ID ${value}`);
  //   }
  // }),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required!")
    .isISO8601()
    .withMessage("Invalid start time format!"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required!")
    .isISO8601()
    .withMessage("Invalid end time format!")
    .custom((value, { req }) => {
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(value);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      if (durationHours < 1) {
        throw new BadRequestError("Booking time must be at least 1 hour!");
      }
      return true;
    }),
]);
export const validateBookingIdParam = withValidationErrorsBookings([
  param("id").custom(async (value) => {
    const booking = await Booking.findById(value);
    if (!booking) {
      throw new NotFoundError(`No Booking with ID ${value}`);
    }
  }),
]);
