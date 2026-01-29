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
  getQuizAttemptsForTeacher,
  getStudentAnswerDetails,
  markQuizForTeacher,
  publishResultForTeacher,
} from "../controllers/resultController.js";
import {
  authMiddleware,
  adminAuthMiddleware,
  teacherAuthMiddleware,
} from "../middleware/authMiddleware.js";

const resultRouter = express.Router();

// User routes
resultRouter.post("/submit", authMiddleware, submitQuiz);
resultRouter.get("/user/:userId", authMiddleware, getUserResults);
resultRouter.get("/user-stats/:userId", authMiddleware, getUserStats);
resultRouter.get("/:id", authMiddleware, getResultById);

// Teacher routes
resultRouter.get("/teacher/quiz/:quizId", teacherAuthMiddleware, getQuizAttemptsForTeacher);
resultRouter.get("/teacher/attempt/:resultId", teacherAuthMiddleware, getStudentAnswerDetails);
resultRouter.put("/teacher/:resultId/mark", teacherAuthMiddleware, markQuizForTeacher);
resultRouter.put("/teacher/:resultId/publish", teacherAuthMiddleware, publishResultForTeacher);

// Admin routes - REMOVED: Admins should not have access to student quiz submissions
// Quiz submissions are only visible to the teacher who created the quiz
// resultRouter.get("/", adminAuthMiddleware, getAllResults);
// resultRouter.get("/quiz/:quizId", adminAuthMiddleware, getResultsByQuiz);
// resultRouter.get("/admin/:id", adminAuthMiddleware, getResultById);
// resultRouter.put("/:id/review", adminAuthMiddleware, reviewManualAnswer);
// resultRouter.delete("/:id", adminAuthMiddleware, deleteResult);

export default resultRouter;
