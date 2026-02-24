import Course from "../models/courseModel.js";

// Create Course
export const createCourse = async (req, res) => {
  try {
    const { name, code, creditHours } = req.body;

    if (!name || !code || !creditHours) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate code format: e.g., CS101
    if (!/^[A-Z]{2,4}\d{3}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Course code must be in format e.g. CS101, IT202.",
      });
    }

    // Validate credit hours: 1-6
    if (isNaN(creditHours) || creditHours < 1 || creditHours > 6) {
      return res.status(400).json({
        success: false,
        message: "Credit hours must be a number between 1 and 6.",
      });
    }

    // Check for duplicate code
    const exists = await Course.findOne({ code });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists.",
      });
    }

    const newCourse = new Course({
      name,
      code,
      creditHours,
    });
    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
