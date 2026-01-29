import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";

// Create Quiz
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      classId,
      subjectId,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    if (!title || !classId || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Title, class, start date, and expiry date are required",
      });
    }

    // Check if this is a teacher creating the quiz
    const createdBy = req.adminId || req.teacherId;
    const createdByRole = req.adminId ? "admin" : "teacher";

    // If teacher, validate that the course (classId) is assigned to them
    if (createdByRole === "teacher") {
      const { default: CourseAssignment } = await import("../models/courseAssignmentModel.js");
      const assigned = await CourseAssignment.findOne({ teacherId: req.teacherId, classId });
      if (!assigned) {
        return res.status(403).json({ success: false, message: "This course is not assigned to you" });
      }
    }

    // Draft by default for teachers; admins can choose to publish immediately
    const publishFlag = createdByRole === "admin" ? (isActive ?? true) : (isActive ?? false);

    const newQuiz = new Quiz({
      title,
      description,
      classId,
      subjectId: subjectId || null,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      expiryDate,
      createdBy: createdByRole === "admin" ? req.adminId : null,
      teacherId: createdByRole === "teacher" ? req.teacherId : null,
      isActive: publishFlag,
    });

    await newQuiz.save();

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const { classId } = req.query;
    const now = new Date();

    const filter = {
      isActive: true, // only published quizzes for students
      startDate: { $lte: now },
      expiryDate: { $gte: now },
    };

    if (classId) {
      filter.classId = classId;
    }

    const quizzes = await Quiz.find(filter)
      .populate("classId", "name semester")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const quiz = await Quiz.findById(id)
      .populate("classId", "name semester")
      .populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // If this is a student request (no teacher/admin), ensure the quiz is active and within date range
    if (!req.teacherId && !req.adminId) {
      if (!quiz.isActive || quiz.startDate > now || quiz.expiryDate < now) {
        return res.status(403).json({
          success: false,
          message: "This quiz is not available",
        });
      }
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Teacher: Get quiz by id (allows drafts) only if owned
export const getQuizByIdForTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacherId;

    const quiz = await Quiz.findById(id)
      .populate("classId", "name semester")
      .populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    if (!quiz.teacherId || quiz.teacherId.toString() !== teacherId) {
      return res.status(403).json({ success: false, message: "You do not have access to this quiz" });
    }

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Quizzes by Class
export const getQuizzesByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const quizzes = await Quiz.find({ classId })
      .populate("classId", "name semester")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      classId,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check authorization: Only admin or the teacher who created it can update
    if (req.teacherId && quiz.teacherId?.toString() !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this quiz",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        classId,
        duration,
        totalMarks,
        passingMarks,
        startDate,
        expiryDate,
        isActive,
      },
      { new: true, runValidators: true }
    ).populate("classId", "name semester");

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check authorization: Only admin or the teacher who created it can delete
    if (req.teacherId && quiz.teacherId?.toString() !== req.teacherId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this quiz",
      });
    }

    // Delete all questions associated with this quiz
    await Question.deleteMany({ quizId: id });

    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quiz and associated questions deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Teacher's Quizzes
export const getTeacherQuizzes = async (req, res) => {
  try {
    const teacherId = req.teacherId;

    const quizzes = await Quiz.find({ teacherId })
      .populate("classId", "name semester")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Teacher's Quizzes for Specific Class
export const getTeacherQuizzesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacherId;

    const quizzes = await Quiz.find({ teacherId, classId })
      .populate("classId", "name semester")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
