import express from "express";
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const classRouter = express.Router();

// All routes require admin authentication
classRouter.post("/", adminAuthMiddleware, createClass);
classRouter.get("/", adminAuthMiddleware, getAllClasses);
classRouter.get("/:id", adminAuthMiddleware, getClassById);
classRouter.put("/:id", adminAuthMiddleware, updateClass);
classRouter.delete("/:id", adminAuthMiddleware, deleteClass);

export default classRouter;
