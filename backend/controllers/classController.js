import Class from "../models/classModel.js";

// Create Class
export const createClass = async (req, res) => {
  try {
    const { name, semester, description } = req.body;

    if (!name || !semester) {
      return res.status(400).json({
        success: false,
        message: "Class name and semester are required",
      });
    }

    const newClass = new Class({
      name,
      semester,
      description,
    });

    await newClass.save();

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Class by ID
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      class: classData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Class
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, semester, description, isActive } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { name, semester, description, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
