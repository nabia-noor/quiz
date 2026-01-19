import express from "express";
import {
  adminLogin,
  adminRegister,
  getAdminProfile,
} from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

// Public routes
adminRouter.post("/register", adminRegister);
adminRouter.post("/login", adminLogin);

// Protected routes
adminRouter.get("/profile", adminAuthMiddleware, getAdminProfile);

export default adminRouter;
