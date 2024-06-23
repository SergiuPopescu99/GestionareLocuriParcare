import { Router } from "express";
import {
  vaildateUpdateUserInput,
  validateIdParam,
} from "../middleware/validationMiddleware.js";

import upload from "../middleware/multerMiddlewear.js";
const userRouter = Router();
import {
  getCurrentUser,
  getAppStats,
  updateUser,
  getUser,
  deleteUser,
  savePost,
  getUserSpots,
  getNotificationNumber,
} from "../controllers/userController.js";

userRouter.get("/current-user", getCurrentUser);
userRouter.get("/app-stats", getAppStats);
userRouter.patch(
  "/update-user",
  upload.single("avatar"),

  updateUser
);
userRouter.post("/save", savePost);
userRouter.get("/profile", getUserSpots);
userRouter.get("/notifications", getNotificationNumber);
userRouter
  .route("/:id")
  .get(validateIdParam, getUser)
  .delete(validateIdParam, deleteUser);
export default userRouter;
