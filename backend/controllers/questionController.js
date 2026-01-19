import Question from "../models/questionModel.js";
import Quiz from "../models/quizModel.js";

// Create Question
export const createQuestion = async (req, res) => {
  try {
    const { quizId, questionText, options, marks, order } = req.body;

    if (!quizId || !questionText || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID, question text, and at least 2 options are required",
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

    const newQuestion = new Question({
      quizId,
      questionText,
      options,
      marks,
      order,
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
    const { questionText, options, marks, order } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { questionText, options, marks, order },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

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

    const questionsToInsert = questions.map((q) => ({
      quizId,
      ...q,
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
