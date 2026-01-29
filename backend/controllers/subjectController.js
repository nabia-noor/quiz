import Subject from "../models/subjectModel.js";

export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    const adminId = req.adminId;
    if (!name) {
      return res.status(400).json({ success: false, message: "Subject name is required" });
    }
    const existing = await Subject.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Subject already exists" });
    }
    const subject = await Subject.create({ name, code, createdBy: adminId });
    return res.status(201).json({ success: true, subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const searchSubjects = async (req, res) => {
  try {
    const { q } = req.query;
    const query = q ? { name: { $regex: q, $options: "i" } } : {};
    const subjects = await Subject.find(query).sort({ name: 1 }).limit(20);
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, isActive } = req.body;
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    if (name) subject.name = name;
    if (code !== undefined) subject.code = code;
    if (isActive !== undefined) subject.isActive = isActive;
    await subject.save();
    return res.status(200).json({ success: true, subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    return res.status(200).json({ success: true, message: "Subject deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
