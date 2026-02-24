import mongoose from "mongoose";

const courseAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a teacher can't be assigned the same course in the same batch twice
courseAssignmentSchema.index(
  { teacher: 1, batch: 1, course: 1 },
  { unique: true },
);

export default mongoose.models.CourseAssignment ||
  mongoose.model("CourseAssignment", courseAssignmentSchema);
