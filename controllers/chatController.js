import { StatusCodes } from "http-status-codes";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

export const getChats = async (req, res) => {
  console.log("get chats");
  const userId = req.user._id;
  const chats = await Chat.find({
    users: userId,
  }).populate({ path: "users", select: "name lastName email avatar" });

  const chatsWithReceivers = chats.map((chat) => {
    const receiver = chat.users.find(
      (user) => user._id.toString() !== userId.toString()
    );
    return {
      ...chat.toObject(),
      receiver,
    };
  });

  return res.status(StatusCodes.OK).json(chatsWithReceivers);
};
export const getChat = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const chat = await Chat.findOne({ _id: id, users: { $in: [userId] } })
    .populate("users", "name lastName email")
    .populate("messages");
  if (!chat) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Chat not found" });
  }
  if (!chat.seenBy.includes(userId)) {
    chat.seenBy.push(userId);
    await chat.save();
  }
  return res.status(StatusCodes.OK).json(chat);
};
export const readChat = async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;
  const chat = await Chat.findOne({ _id: chatId, users: { $in: [userId] } });
  if (!chat) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Chat not found" });
  }
  if (!chat.seenBy.includes(userId)) {
    chat.seenBy.push(userId);
    await chat.save();
  }
  res.status(StatusCodes.OK).json({ message: "Chat marked as read" });
};
export const addChat = async (req, res) => {
  const { receiverId } = req.body;
  const users = [req.user._id, receiverId];
  const chat = new Chat({ users: users });
  await chat.save();

  await User.updateMany(
    { _id: { $in: users } },
    { $push: { chats: chat._id } }
  );

  res.status(StatusCodes.CREATED).json(chat);
};
