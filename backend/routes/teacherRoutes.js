import express from "express";
import {
  teacherLogin,
  getTeacherProfile,
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignCourses,
  getAssignedCourses,
  getAssignedBatches,
  getCoursesForBatch,
} from "../controllers/teacherController.js";
import { adminAuthMiddleware, teacherAuthMiddleware } from "../middleware/authMiddleware.js";

const teacherRouter = express.Router();

// Public routes
teacherRouter.post("/login", teacherLogin);

// Teacher Protected Routes
teacherRouter.get("/profile", teacherAuthMiddleware, getTeacherProfile);
teacherRouter.get("/assigned-courses", teacherAuthMiddleware, getAssignedCourses);
teacherRouter.get("/batches", teacherAuthMiddleware, getAssignedBatches);
teacherRouter.get("/courses/:classId", teacherAuthMiddleware, getCoursesForBatch);
// Teacher: Subjects assigned for a batch
teacherRouter.get("/subjects/:classId", teacherAuthMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacherId;
    const { default: CourseAssignment } = await import("../models/courseAssignmentModel.js");
    const assignments = await CourseAssignment.find({ teacherId, classId }).populate("subjectId", "name code _id");
    const subjects = [];
    const seen = new Set();
    assignments.forEach((a) => {
      if (a.subjectId) {
        const id = a.subjectId._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          subjects.push(a.subjectId);
        }
      }
    });
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Admin Protected Routes
// CRUD operations
teacherRouter.post("/", adminAuthMiddleware, createTeacher);
teacherRouter.get("/", adminAuthMiddleware, getAllTeachers);
// Admin: Get assigned courses for a specific teacher (must be before "/:id")
teacherRouter.get("/:teacherId/assigned-courses", adminAuthMiddleware, getAssignedCourses);
teacherRouter.get("/:id", adminAuthMiddleware, getTeacherById);
teacherRouter.put("/:id", adminAuthMiddleware, updateTeacher);
teacherRouter.delete("/:id", adminAuthMiddleware, deleteTeacher);

// Course Assignment
teacherRouter.post("/:teacherId/assign-courses", adminAuthMiddleware, assignCourses);

export default teacherRouter;
