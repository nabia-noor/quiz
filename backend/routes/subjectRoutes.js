import express from "express";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";
import { createSubject, getAllSubjects, searchSubjects, updateSubject, deleteSubject } from "../controllers/subjectController.js";

const subjectRouter = express.Router();

subjectRouter.post("/", adminAuthMiddleware, createSubject);
subjectRouter.get("/", adminAuthMiddleware, getAllSubjects);
subjectRouter.get("/search", adminAuthMiddleware, searchSubjects);
subjectRouter.put("/:id", adminAuthMiddleware, updateSubject);
subjectRouter.delete("/:id", adminAuthMiddleware, deleteSubject);

export default subjectRouter;
