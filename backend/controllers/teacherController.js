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
      { expiresIn: TOKEN_EXPIRES_IN }
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
    const { assignments } = req.body; // Array of {classId, quizId, subjectId}
    const adminId = req.adminId;

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assignments array is required and must not be empty",
      });
    }

    // Delete existing assignments for this teacher
    await CourseAssignment.deleteMany({ teacherId });

    // Create new assignments (teacher-course only, not tied to specific quiz)
    const createdAssignments = await CourseAssignment.insertMany(
      assignments.map((assignment) => ({
        teacherId,
        classId: assignment.classId,
        quizId: null, // Teacher will create their own quizzes
        subjectId: assignment.subjectId || null,
        assignedBy: adminId,
      }))
    );

    return res.status(201).json({
      success: true,
      message: "Courses assigned successfully",
      assignments: createdAssignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Assigned Courses for Teacher
export const getAssignedCourses = async (req, res) => {
  try {
    const teacherId = req.teacherId || req.params.teacherId;

    const assignments = await CourseAssignment.find({ teacherId })
      .populate("classId", "name semester")
      .populate("quizId", "title description duration totalMarks passingMarks startDate expiryDate")
      .populate("subjectId", "name code _id")
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

    const assignments = await CourseAssignment.find({ teacherId })
      .populate("classId", "name semester _id");

    // Get unique batches
    const batches = {};
    assignments.forEach((assignment) => {
      const classId = assignment.classId._id.toString();
      if (!batches[classId]) {
        batches[classId] = assignment.classId;
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

    // First, ensure teacher is assigned to this class
    const assignment = await CourseAssignment.findOne({ teacherId, classId });
    if (!assignment) {
      return res.status(403).json({ success: false, message: "Not assigned to this batch" });
    }

    // Return all quizzes the teacher has created for this class (their "courses")
    const quizzes = await Quiz.find({ teacherId, classId })
      .select("title description duration totalMarks passingMarks startDate expiryDate isActive")
      .sort({ createdAt: -1 });

    const courses = quizzes.map((q) => ({
      ...q.toObject(),
      subject: assignment.subjectId ? assignment.subjectId : null,
    }));

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
