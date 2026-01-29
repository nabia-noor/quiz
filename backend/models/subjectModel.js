import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

subjectSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
