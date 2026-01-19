import express from "express";
import {
  submitQuiz,
  getAllResults,
  getResultsByQuiz,
  getUserResults,
  getUserStats,
  getResultById,
  deleteResult,
} from "../controllers/resultController.js";
import {
  authMiddleware,
  adminAuthMiddleware,
} from "../middleware/authMiddleware.js";

const resultRouter = express.Router();

// User routes
resultRouter.post("/submit", authMiddleware, submitQuiz);
resultRouter.get("/user/:userId", authMiddleware, getUserResults);
resultRouter.get("/user-stats/:userId", authMiddleware, getUserStats);
resultRouter.get("/:id", authMiddleware, getResultById);

// Admin routes
resultRouter.get("/", adminAuthMiddleware, getAllResults);
resultRouter.get("/quiz/:quizId", adminAuthMiddleware, getResultsByQuiz);
resultRouter.delete("/:id", adminAuthMiddleware, deleteResult);

export default resultRouter;
