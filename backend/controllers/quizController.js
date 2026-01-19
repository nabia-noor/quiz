import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";

// Create Quiz
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      classId,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      expiryDate,
    } = req.body;

    if (!title || !classId || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Title, class, start date, and expiry date are required",
      });
    }

    const newQuiz = new Quiz({
      title,
      description,
      classId,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      expiryDate,
      createdBy: req.adminId,
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
    const quizzes = await Quiz.find()
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

    const quiz = await Quiz.findById(id)
      .populate("classId", "name semester")
      .populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
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

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

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

    // Delete all questions associated with this quiz
    await Question.deleteMany({ quizId: id });

    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

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
