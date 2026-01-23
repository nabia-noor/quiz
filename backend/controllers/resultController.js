import Result from "../models/resultModel.js";
import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";

const calculateTotalMarks = (quizDoc, questionList = []) => {
  const quizTotal = Number(quizDoc?.totalMarks) || 0;
  const questionTotal = Array.isArray(questionList)
    ? questionList.reduce((sum, q) => sum + (Number(q?.marks) || 0), 0)
    : 0;

  return quizTotal > 0 ? quizTotal : questionTotal;
};

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
        message:
          "You have already attempted this quiz. Each quiz can only be attempted once.",
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

    console.log("Quiz submission attempt:", {
      quizId,
      quizTitle: quiz.title,
      isActive: quiz.isActive,
      startDate: quiz.startDate,
      expiryDate: quiz.expiryDate,
      currentTime: new Date(),
    });

    // Check if quiz is active and not expired
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const expiryDate = quiz.expiryDate ? new Date(quiz.expiryDate) : null;

    if (!quiz.isActive) {
      return res.status(400).json({
        success: false,
        message: "Quiz is not active",
      });
    }

    // Only check dates if they are set
    if (startDate && now < startDate) {
      return res.status(400).json({
        success: false,
        message: "Quiz has not started yet",
      });
    }

    if (expiryDate && now > expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Quiz has expired",
      });
    }

    // Get all questions for the quiz
    const questions = await Question.find({ quizId });

    // Calculate results
    let obtainedMarks = 0;
    const processedAnswers = [];
    let manualReviewNeeded = false;
    const quizTotalMarks = calculateTotalMarks(quiz, questions);

    for (const answer of answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId,
      );

      if (question) {
        const qType = question.questionType || "mcq";
        let isCorrect = false;
        let marksObtained = 0;

        if (qType === "mcq") {
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
            requiresManualReview: false,
            evaluatedOptions: [],
          });
        } else {
          // Text type question - requires manual review
          manualReviewNeeded = true;

          processedAnswers.push({
            questionId: question._id,
            selectedAnswer: answer.selectedAnswer || answer.typedAnswer || "",
            typedAnswer: answer.selectedAnswer || answer.typedAnswer || "",
            isCorrect: null,
            marksObtained: 0,
            requiresManualReview: true,
            evaluatedOptions: [],
          });
        }
      }
    }

    const percentage =
      quizTotalMarks > 0 ? (obtainedMarks / quizTotalMarks) * 100 : 0;
    const isPassed = obtainedMarks >= quiz.passingMarks;

    // Save result
    const result = new Result({
      userId,
      quizId,
      answers: processedAnswers,
      totalMarks: quizTotalMarks,
      obtainedMarks,
      percentage,
      isPassed,
      manualReviewPending: manualReviewNeeded,
    });

    await result.save();

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        totalMarks: quizTotalMarks,
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

// Manual review for typed questions
export const reviewManualAnswer = async (req, res) => {
  try {
    const { id } = req.params; // result id
    const { questionId, marksAwarded } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId is required",
      });
    }

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if ((question.questionType || "mcq") !== "text") {
      return res.status(400).json({
        success: false,
        message: "Manual review is only available for typed questions",
      });
    }

    const answerEntry = result.answers.find(
      (a) => a.questionId.toString() === questionId.toString(),
    );

    if (!answerEntry) {
      return res.status(404).json({
        success: false,
        message: "Answer entry not found in this result",
      });
    }

    const numericMarks = Number.isFinite(Number(marksAwarded))
      ? Number(marksAwarded)
      : 0;
    const clampedMarks = Math.max(0, Math.min(question.marks, numericMarks));

    answerEntry.marksObtained = Number(clampedMarks.toFixed(2));
    answerEntry.requiresManualReview = false;
    answerEntry.evaluatedOptions = [];
    answerEntry.isCorrect = null;

    // Recalculate totals
    const quiz = await Quiz.findById(result.quizId);
    const quizQuestions = await Question.find({ quizId: result.quizId });
    const totalMarks = calculateTotalMarks(quiz, quizQuestions);
    const recalculatedObtained = result.answers.reduce((sum, ans) => {
      if (ans.questionId.toString() === questionId.toString()) {
        return sum + answerEntry.marksObtained;
      }
      return sum + (Number(ans.marksObtained) || 0);
    }, 0);

    result.obtainedMarks = recalculatedObtained;
    result.percentage =
      totalMarks > 0
        ? (recalculatedObtained / totalMarks) * 100
        : result.percentage;
    result.isPassed =
      quiz && quiz.passingMarks
        ? recalculatedObtained >= quiz.passingMarks
        : result.isPassed;
    result.totalMarks = totalMarks || result.totalMarks;
    result.manualReviewPending = result.answers.some(
      (ans) => ans.requiresManualReview,
    );

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Manual review saved",
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

// Get All Results (Admin)
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("userId", "name email")
      .populate("quizId", "title totalMarks")
      .sort({ createdAt: -1 });

    const sanitizedResults = results.map((doc) => {
      const obj = doc.toObject();
      const derivedTotal = calculateTotalMarks(obj.quizId);
      if (derivedTotal > 0) {
        obj.totalMarks = derivedTotal;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      results: sanitizedResults,
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
      .populate("quizId", "title totalMarks")
      .sort({ obtainedMarks: -1 });

    const sanitizedResults = results.map((doc) => {
      const obj = doc.toObject();
      const derivedTotal = calculateTotalMarks(obj.quizId);
      if (derivedTotal > 0) {
        obj.totalMarks = derivedTotal;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      results: sanitizedResults,
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
      .populate(
        "answers.questionId",
        "questionText options questionType marks",
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const derivedTotal = calculateTotalMarks(
      result.quizId,
      (result.answers || [])
        .map((ans) => ans.questionId)
        .filter((q) => q && Object.prototype.hasOwnProperty.call(q, "marks")),
    );

    if (derivedTotal > 0 && result.totalMarks !== derivedTotal) {
      result.totalMarks = derivedTotal;
      await result.save();
    }

    return res.status(200).json({
      success: true,
      result: {
        ...result.toObject(),
        totalMarks: derivedTotal > 0 ? derivedTotal : result.totalMarks,
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
