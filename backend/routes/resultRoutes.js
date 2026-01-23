import express from "express";
import {
  submitQuiz,
  getAllResults,
  getResultsByQuiz,
  getUserResults,
  getUserStats,
  getResultById,
  deleteResult,
  reviewManualAnswer,
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
resultRouter.get("/admin/:id", adminAuthMiddleware, getResultById);
resultRouter.put("/:id/review", adminAuthMiddleware, reviewManualAnswer);
resultRouter.delete("/:id", adminAuthMiddleware, deleteResult);

export default resultRouter;
