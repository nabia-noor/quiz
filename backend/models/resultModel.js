import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedAnswer: String,
        typedAnswer: String,
        isCorrect: Boolean,
        marksObtained: {
          type: Number,
          default: 0,
        },
        requiresManualReview: {
          type: Boolean,
          default: false,
        },
        evaluatedOptions: [Number],
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    isPassed: {
      type: Boolean,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    manualReviewPending: {
      type: Boolean,
      default: false,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    markedAt: {
      type: Date,
      default: null,
    },
    manualMarksAwarded: {
      type: Number,
      default: 0,
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "in-progress", "marked", "published"],
      default: "pending",
    },
    reviewComments: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
