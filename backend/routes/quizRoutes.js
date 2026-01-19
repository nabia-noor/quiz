import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByClass,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import {
  adminAuthMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

const quizRouter = express.Router();

// User routes (no admin required)
quizRouter.get("/all", authMiddleware, getAllQuizzes); // For users to see all available quizzes

// Admin routes (require admin authentication)
quizRouter.post("/", adminAuthMiddleware, createQuiz);
quizRouter.get("/", adminAuthMiddleware, getAllQuizzes);
quizRouter.get("/:id", authMiddleware, getQuizById); // Allow both admin and users
quizRouter.get("/class/:classId", adminAuthMiddleware, getQuizzesByClass);
quizRouter.put("/:id", adminAuthMiddleware, updateQuiz);
quizRouter.delete("/:id", adminAuthMiddleware, deleteQuiz);

export default quizRouter;
