import mongoose from "mongoose";

const courseAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a teacher can't be assigned the same course twice
courseAssignmentSchema.index(
  { teacherId: 1, classId: 1 },
  { unique: true }
);

export default mongoose.models.CourseAssignment ||
  mongoose.model("CourseAssignment", courseAssignmentSchema);
