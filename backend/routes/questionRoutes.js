import express from "express";
import {
  createQuestion,
  getQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
} from "../controllers/questionController.js";
import {
  adminAuthMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

const questionRouter = express.Router();

// User routes (allow users to view questions for a quiz)
questionRouter.get("/quiz/:quizId", authMiddleware, getQuestionsByQuiz);

// Admin routes (require admin authentication)
questionRouter.post("/", adminAuthMiddleware, createQuestion);
questionRouter.post("/bulk", adminAuthMiddleware, bulkCreateQuestions);
questionRouter.get("/:id", adminAuthMiddleware, getQuestionById);
questionRouter.put("/:id", adminAuthMiddleware, updateQuestion);
questionRouter.delete("/:id", adminAuthMiddleware, deleteQuestion);

export default questionRouter;
