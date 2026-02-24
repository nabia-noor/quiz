import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Z]{2,4}\d{3}$/,
      unique: true,
    },
    creditHours: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
