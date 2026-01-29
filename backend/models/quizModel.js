import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 30,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 40,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false, // quizzes start as draft until published
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
