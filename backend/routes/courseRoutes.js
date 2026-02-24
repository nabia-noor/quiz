import express from "express";
import {
  createCourse,
  getAllCourses,
} from "../controllers/courseController.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const courseRouter = express.Router();

courseRouter.post("/", adminAuthMiddleware, createCourse);
courseRouter.get("/", adminAuthMiddleware, getAllCourses);

export default courseRouter;
