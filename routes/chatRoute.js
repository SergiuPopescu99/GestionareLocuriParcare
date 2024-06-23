import { Router } from "express";
const chatRouter = Router();

import {
  getChat,
  getChats,
  addChat,
  readChat,
} from "../controllers/chatController.js";
chatRouter.get("/", getChats);
chatRouter.get("/:id", getChat);
chatRouter.post("/", addChat);
chatRouter.post("/read/:id", readChat);
export default chatRouter;
