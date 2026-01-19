import Result from "../models/resultModel.js";
import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";

// Submit Quiz and Calculate Result
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.userId;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID and answers are required",
      });
    }

    // Check if user has already attempted this quiz
    const existingResult = await Result.findOne({ userId, quizId });
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz. Each quiz can only be attempted once.",
      });
    }

    // Get quiz details
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if quiz is active and not expired
    const now = new Date();
    if (!quiz.isActive || now < quiz.startDate || now > quiz.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Quiz is not available",
      });
    }

    // Get all questions for the quiz
    const questions = await Question.find({ quizId });

    // Calculate results
    let obtainedMarks = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question) {
        let isCorrect = false;
        let marksObtained = 0;

        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (
          correctOption &&
          correctOption.optionText === answer.selectedAnswer
        ) {
          isCorrect = true;
          marksObtained = question.marks;
        }

        obtainedMarks += marksObtained;

        processedAnswers.push({
          questionId: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          marksObtained,
        });
      }
    }

    const percentage = (obtainedMarks / quiz.totalMarks) * 100;
    const isPassed = obtainedMarks >= quiz.passingMarks;

    // Save result
    const result = new Result({
      userId,
      quizId,
      answers: processedAnswers,
      totalMarks: quiz.totalMarks,
      obtainedMarks,
      percentage,
      isPassed,
    });

    await result.save();

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        totalMarks: quiz.totalMarks,
        obtainedMarks,
        percentage,
        isPassed,
        resultId: result._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Results (Admin)
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("userId", "name email")
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Results by Quiz (Admin)
export const getResultsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const results = await Result.find({ quizId })
      .populate("userId", "name email")
      .sort({ obtainedMarks: -1 });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get User's Results
export const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify that user can only access their own results
    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const results = await Result.find({ userId })
      .populate("quizId", "title description totalMarks")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get User Statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const reqUserId = req.userId;

    console.log("getUserStats called - userId from params:", userId);
    console.log("getUserStats called - req.userId from token:", reqUserId);

    // Verify that user can only access their own stats
    if (reqUserId.toString() !== userId.toString()) {
      console.log("Authorization check failed");
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const results = await Result.find({ userId: reqUserId });
    console.log("Found results:", results.length);

    const totalQuizzes = results.length;
    const completedQuizzes = results.length; // All submitted results are completed
    const passedQuizzes = results.filter((r) => r.isPassed).length;

    let totalPercentage = 0;
    if (results.length > 0) {
      totalPercentage =
        results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    }

    const response = {
      success: true,
      stats: {
        totalQuizzes,
        completedQuizzes,
        passedQuizzes,
        averageScore: totalPercentage,
      },
    };

    console.log("Sending stats response:", response);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Result by ID
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate("userId", "name email")
      .populate("quizId", "title description totalMarks")
      .populate("answers.questionId", "questionText options");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Result (Admin)
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResult = await Result.findByIdAndDelete(id);

    if (!deletedResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
