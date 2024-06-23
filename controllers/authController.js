import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import sendToken from "../utils/sendToken.js";
import User from "../models/userModel.js";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/customError.js";
import { StatusCodes } from "http-status-codes";
export const register = async (req, res) => {
  const { name, email, password, location, lastName } = req.body;

  const user = {
    name: name,
    email: email,
    password: password,
    location: location,
    lastName,
  };
  const activationToken = createActivationToken(user);
  const activationUrl = `http://localhost:5100/api/v1/auth/activate/${activationToken}`;
  try {
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      text: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `Please check your email- ${user.email} to activate your account`,
    });
  } catch (err) {
    throw err;
  }
};
export const activate = async (req, res) => {
  try {
    const { activation_token } = req.params;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    if (!newUser) {
      throw new BadRequestError("Invalid token!");
    }
    const { name, email, password, location, lastName } = newUser;
    let user = await User.findOne({ email });
    if (user) {
      throw new BadRequestError("User already exists!");
    }
    const isFirstAccount = (await User.countDocuments()) === 0;
    const role = isFirstAccount ? "admin" : "user";
    user = await User.create({
      name,
      email,
      password,
      location,
      role,
      lastName,
    });
    sendToken(user, 201, res);
  } catch (err) {
    throw err;
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new UnauthenticatedError("Auth failed!");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Auth failed!");
    }

    sendToken(user, 200, res);
  } catch (err) {
    throw err;
  }
};
export const logout = (req, res) => {
  res
    .status(StatusCodes.OK)
    .cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({ msg: "User logged out!" });
};
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};
