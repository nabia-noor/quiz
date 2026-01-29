import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizByIdForTeacher,
  getQuizzesByClass,
  updateQuiz,
  deleteQuiz,
  getTeacherQuizzes,
  getTeacherQuizzesByClass,
} from "../controllers/quizController.js";
import {
  adminAuthMiddleware,
  authMiddleware,
  teacherAuthMiddleware,
} from "../middleware/authMiddleware.js";

const quizRouter = express.Router();

// Teacher routes (require teacher authentication) - MUST be before /:id routes
quizRouter.post("/teacher/create", teacherAuthMiddleware, createQuiz);
quizRouter.get("/teacher/my-quizzes", teacherAuthMiddleware, getTeacherQuizzes);
quizRouter.get("/teacher/class/:classId", teacherAuthMiddleware, getTeacherQuizzesByClass);
quizRouter.get("/teacher/:id", teacherAuthMiddleware, getQuizByIdForTeacher);
quizRouter.put("/teacher/:id", teacherAuthMiddleware, updateQuiz);
quizRouter.delete("/teacher/:id", teacherAuthMiddleware, deleteQuiz);

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
