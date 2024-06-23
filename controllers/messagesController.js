import Message from "../models/messegeModel.js";
import Chat from "../models/chatModel.js";
import { StatusCodes } from "http-status-codes";
export const addMessage = async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;
  const message = new Message({ text, chat: chatId, sender: userId });

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Chat not found!" });
  }
  chat.messages.push(message._id);
  chat.lastMessage = text;
  chat.seenBy = [userId];
  await Promise.all([chat.save(), message.save()]);
  return res.status(StatusCodes.CREATED).json(message);
};
