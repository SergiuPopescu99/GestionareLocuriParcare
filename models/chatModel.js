import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ChatSchema = new Schema(
  {
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    seenBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
      },
    ],
    lastMessage: {
      type: String,
    },
  },

  { timestamps: true }
);

const Chat = model("Chat", ChatSchema);
export default Chat;
