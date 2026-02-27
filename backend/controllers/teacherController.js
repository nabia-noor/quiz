import Teacher from "../models/teacherModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";
import Quiz from "../models/quizModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRES_IN = "7d";

// Teacher Login
export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!teacher.isActive) {
      return res.status(401).json({
        success: false,
        message: "Teacher account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { Id: teacher._id.toString(), role: "teacher" },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        contactNumber: teacher.contactNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Teacher Profile
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacherId).select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Create Teacher
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;
    const adminId = req.adminId;

    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      createdBy: adminId,
    });

    await teacher.save();

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        contactNumber: teacher.contactNumber,
        isActive: teacher.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Get All Teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Get Teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id).select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Update Teacher
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactNumber, isActive } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (contactNumber) teacher.contactNumber = contactNumber;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        contactNumber: teacher.contactNumber,
        isActive: teacher.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Delete Teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Also delete all course assignments for this teacher
    await CourseAssignment.deleteMany({ teacherId: id });

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Assign Courses to Teacher
export const assignCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { batchId, courseId } = req.body;
    const adminId = req.adminId;

    // Validate teacherId
    console.log("AssignCourses called", { teacherId, batchId, courseId });
    if (!teacherId || !teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid teacherId", teacherId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid teacherId", teacherId });
    }

    // Validate batchId and courseId
    if (!batchId || !batchId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid batchId", batchId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid batchId", batchId });
    }
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid courseId", courseId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid courseId", courseId });
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      console.error("Teacher not found", teacherId);
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found", teacherId });
    }

    // Verify batch and course exist
    const batchExists = await import("../models/classModel.js").then((m) =>
      m.default.findById(batchId),
    );
    if (!batchExists) {
      console.error("Batch not found", batchId);
      return res
        .status(404)
        .json({ success: false, message: "Batch not found", batchId });
    }
    const courseExists = await import("../models/courseModel.js").then((m) =>
      m.default.findById(courseId),
    );
    if (!courseExists) {
      console.error("Course not found", courseId);
      return res
        .status(404)
        .json({ success: false, message: "Course not found", courseId });
    }

    // Check for duplicate for this teacher, batch, course
    const exists = await CourseAssignment.findOne({
      teacher: teacherId,
      batch: batchId,
      course: courseId,
    });
    if (exists) {
      console.log("Assignment already exists", {
        teacherId,
        batchId,
        courseId,
      });
      // Already assigned, ignore and return success
      return res.status(200).json({
        success: true,
        message: "This teacher already has this batch and course assigned",
        assignment: exists,
      });
    }

    // Final check for null/undefined
    if (!teacherId || !batchId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for assignment",
        teacherId,
        batchId,
        courseId,
      });
    }
    const assignment = await CourseAssignment.create({
      teacher: teacherId,
      batch: batchId,
      course: courseId,
      assignedBy: adminId,
    });
    console.log("Assignment created", assignment);

    return res.status(201).json({
      success: true,
      message: "Course assigned successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin: Remove Course Assignment from Teacher
export const removeCourseAssignment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { batchId, courseId } = req.body;
    const adminId = req.adminId;

    // Validate IDs
    if (!teacherId || !teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid teacherId", teacherId });
    }
    if (!batchId || !batchId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid batchId", batchId });
    }
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid courseId", courseId });
    }

    // Find and delete assignment
    const deleted = await CourseAssignment.findOneAndDelete({
      teacher: teacherId,
      batch: batchId,
      course: courseId,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Assignment removed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Assigned Courses for Teacher
export const getAssignedCourses = async (req, res) => {
  try {
    const teacherId = req.teacherId || req.params.teacherId;

    const assignments = await CourseAssignment.find({ teacher: teacherId })
      .populate("batch", "name semester degree program session")
      .populate("course", "code name creditHours")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Assigned Batches for Teacher (Unique Batches)
export const getAssignedBatches = async (req, res) => {
  try {
    const teacherId = req.teacherId;

    const assignments = await CourseAssignment.find({
      teacher: teacherId,
    }).populate("batch", "name semester _id degree program session");

    // Get unique batches
    const batches = {};
    assignments.forEach((assignment) => {
      if (assignment.batch && assignment.batch._id) {
        const batchId = assignment.batch._id.toString();
        if (!batches[batchId]) {
          batches[batchId] = assignment.batch;
        }
      }
    });

    return res.status(200).json({
      success: true,
      batches: Object.values(batches),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Assigned Courses for a specific Batch (Teacher's view)
export const getCoursesForBatch = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacherId;

    // Find all course assignments for this teacher and batch
    const assignments = await CourseAssignment.find({
      teacher: teacherId,
      batch: classId,
    }).populate("course", "_id code name creditHours");

    if (!assignments || assignments.length === 0) {
      return res.status(200).json({ success: true, courses: [] });
    }

    // Return the assigned courses for this batch
    const courses = assignments.map((a) => a.course).filter(Boolean);

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
