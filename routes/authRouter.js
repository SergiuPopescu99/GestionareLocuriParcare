import { Router } from "express";
import {
  login,
  register,
  activate,
  logout,
} from "../controllers/authController.js";
const authRouter = Router();
import {
  vaildateRegisterInput,
  validateLoginInput,
} from "../middleware/validationMiddleware.js";
authRouter.get("/logout", logout);
authRouter.post("/register", vaildateRegisterInput, register);
authRouter.post("/login", validateLoginInput, login);
authRouter.get("/activate/:activation_token", activate);

export default authRouter;
