import { StatusCodes } from "http-status-codes";
import cloudinary from "cloudinary";
import { promises as fs } from "fs";
import User from "../models/userModel.js";
import ParkingSpot from "../models/parkModel.js";
import SavedSpot from "../models/savedSpotModel.js";
import Chat from "../models/chatModel.js";
export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  res.status(StatusCodes.OK).json({ user });
};
export const getAppStats = async (req, res) => {
  const parkingSpots = await ParkingSpot.countDocuments();
  const users = await User.countDocuments();
  res.status(StatusCodes.OK).json({ users, parkingSpots });
};
export const updateUser = async (req, res) => {
  const newUser = { ...req.body };

  delete newUser.password;
  if (req.file) {
    const response = await cloudinary.v2.uploader.upload(req.file.path);
    await fs.unlink(req.file.path);
    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, newUser);

  if (req.file && updatedUser.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(updatedUser.avatarPublicId);
  }
  res.status(StatusCodes.OK).json({ msg: "update user", user: newUser });
};
export const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(StatusCodes.OK).json({ user });
};
export const savePost = async (req, res) => {
  const spotId = req.body.spotId;
  const userId = req.user._id;
  console.log(spotId, userId);
  if (!spotId || !(await ParkingSpot.findById(spotId))) {
    return res.status(400).json({ message: "No parking spot with that id" });
  }

  const savedPost = await SavedSpot.findOne({
    user: userId,
    parkingSpot: spotId,
  });
  const user = await User.findById(userId);
  if (savedPost) {
    await SavedSpot.deleteOne({ _id: savedPost._id });

    user.savedSpots = user.savedSpots.filter(
      (sp) => sp._id.toString() !== savedPost._id.toString()
    );
    await user.save();
    return res.status(200).json({ message: "Saved spot removed successfully" });
  } else {
    const savedSpot = await SavedSpot.create({
      user: userId,
      parkingSpot: spotId,
    });
    user.savedSpots.push(savedSpot);
    await user.save();
    return res.status(200).json({ message: "Saved spot added successfully" });
  }
};
export const deleteUser = async (req, res) => {};
export const getUserSpots = async (req, res) => {
  const id = req.user._id;
  const savedSpots = await SavedSpot.find({ user: id }).populate("parkingSpot");

  res.status(StatusCodes.OK).json({ savedSpots });
};

export const getNotificationNumber = async (req, res) => {
  const userId = req.user._id;
  const unseenChats = await Chat.find({
    users: { $in: [userId] },
    seenBy: { $ne: userId },
  });
  const notificationCount = unseenChats.length;
  res.status(StatusCodes.OK).json(notificationCount);
};
