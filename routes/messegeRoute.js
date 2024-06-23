import { Router } from "express";
const messegeRouter = Router();
import { addMessage } from "../controllers/messagesController.js";

messegeRouter.post("/:chatId", addMessage);

export default messegeRouter;
