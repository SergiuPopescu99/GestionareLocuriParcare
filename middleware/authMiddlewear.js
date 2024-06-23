import {
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/customError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
export const autheticateUser = async (req, res, next) => {
  const { token } = req.cookies;
  console.log(req.cookies);
  if (!token) {
    throw new UnauthenticatedError("Please Login to continue!");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    console.log(`User - ${req.user._id}`);
    next();
  } catch (err) {
    throw new UnauthenticatedError("Please Login to continue!");
  }
};

export const validateAdminId = async (req, res, next) => {
  if (req.user.role !== "admin")
    throw new UnauthorizedError("Only admin can perform CRUD !");
  next();
};
