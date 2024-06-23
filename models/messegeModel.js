import mongoose from "mongoose";
const { Schema, model } = mongoose;
const MessageSchema = new Schema(
  {
    text: { type: String, required: true },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Message = model("Message", MessageSchema);
export default Message;
