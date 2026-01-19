import express from "express";
import {
  register,
  login,
  getUserProfile,
} from "../controllers/usercontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile", authMiddleware, getUserProfile);

export default userRouter;
