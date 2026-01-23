import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionType: {
      type: String,
      enum: ["mcq", "text"],
      default: "mcq",
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        optionText: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Question ||
  mongoose.model("Question", questionSchema);
