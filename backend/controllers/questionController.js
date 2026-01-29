import Question from "../models/questionModel.js";
import Quiz from "../models/quizModel.js";

// Create Question
export const createQuestion = async (req, res) => {
  try {
    const {
      quizId,
      questionText,
      options = [],
      marks,
      order,
      questionType = "mcq",
      classId,
      startDate,
      expiryDate,
      isActive = true,
    } = req.body;

    if (!quizId || !questionText) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID and question text are required",
      });
    }

    const normalizedType = questionType || "mcq";

    // Optional date validation
    if (startDate && isNaN(new Date(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (expiryDate && isNaN(new Date(expiryDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }

    if (startDate && expiryDate && new Date(startDate) > new Date(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after expiry date",
      });
    }

    if (normalizedType === "mcq" || normalizedType === "truefalse") {
      if (!options || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "MCQ and True/False questions need at least 2 options",
        });
      }

      const hasCorrectOption = options.some((opt) => opt.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({
          success: false,
          message: "Please mark one option as correct",
        });
      }
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const sanitizedOptions = (normalizedType === "mcq" || normalizedType === "truefalse") ? options : [];

    const newQuestion = new Question({
      questionType: normalizedType,
      quizId,
      classId: classId || quiz.classId,
      questionText,
      options: sanitizedOptions,
      marks,
      order,
      startDate: startDate ? new Date(startDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive,
    });

    await newQuestion.save();

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Questions for a Quiz
export const getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await Question.find({ quizId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Question by ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      options = [],
      marks,
      order,
      questionType,
      classId,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const normalizedType = questionType || existingQuestion.questionType || "mcq";

    if (startDate && isNaN(new Date(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (expiryDate && isNaN(new Date(expiryDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }

    if (startDate && expiryDate && new Date(startDate) > new Date(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after expiry date",
      });
    }

    const optionsToUseRaw = options.length ? options : existingQuestion.options;
    const optionsToUse = (normalizedType === "mcq" || normalizedType === "truefalse") ? optionsToUseRaw : [];

    if (normalizedType === "mcq" || normalizedType === "truefalse") {
      if (!optionsToUse || optionsToUse.length < 2) {
        return res.status(400).json({
          success: false,
          message: "MCQ and True/False questions need at least 2 options",
        });
      }

      const hasCorrectOption = optionsToUse.some((opt) => opt.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({
          success: false,
          message: "Please mark one option as correct",
        });
      }
    }

    existingQuestion.questionText =
      questionText ?? existingQuestion.questionText;
    existingQuestion.options = optionsToUse;
    existingQuestion.marks = marks ?? existingQuestion.marks;
    existingQuestion.order = order ?? existingQuestion.order;
    existingQuestion.questionType = normalizedType;
    existingQuestion.classId = classId ?? existingQuestion.classId;
    existingQuestion.startDate = startDate
      ? new Date(startDate)
      : existingQuestion.startDate;
    existingQuestion.expiryDate = expiryDate
      ? new Date(expiryDate)
      : existingQuestion.expiryDate;
    existingQuestion.isActive =
      typeof isActive === "boolean" ? isActive : existingQuestion.isActive;

    const updatedQuestion = await existingQuestion.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Bulk Create Questions
export const bulkCreateQuestions = async (req, res) => {
  try {
    const { quizId, questions } = req.body;

    if (
      !quizId ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID and questions array are required",
      });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    for (const q of questions) {
      const type = q.questionType === "text" ? "text" : "mcq";
      const opts = q.options || [];

      if (type === "mcq") {
        if (!opts || opts.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Every MCQ needs at least 2 options",
          });
        }
        const hasCorrectOption = opts.some((opt) => opt.isCorrect);
        if (!hasCorrectOption) {
          return res.status(400).json({
            success: false,
            message: "Every MCQ needs a correct option marked",
          });
        }
      }
    }

    const questionsToInsert = questions.map((q) => ({
      quizId,
      ...q,
      options: q.questionType === "mcq" ? q.options || [] : [],
      questionType: q.questionType === "text" ? "text" : "mcq",
    }));

    const createdQuestions = await Question.insertMany(questionsToInsert);

    return res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      questions: createdQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
