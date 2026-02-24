// Remove misplaced useEffect
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { teacherAPI, classAPI, courseAPI } from "../api";
import "./TeacherProfile.css";

function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect moved below fetchTeacher and fetchAssignments
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  // Move useEffect below useCallback definitions

  const fetchTeacher = React.useCallback(async () => {
    try {
      const response = await teacherAPI.getById(id);
      if (response.success) {
        setTeacher(response.teacher);
      } else {
        setError("Failed to fetch teacher");
      }
    } catch (err) {
      setError("Error fetching teacher: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBatches = async () => {
    try {
      const response = await classAPI.getAll();
      if (response.success) {
        setBatches(response.classes.filter((c) => c.isActive));
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      if (response.success) {
        setCourses(response.courses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchAssignments = React.useCallback(async () => {
    try {
      const response = await teacherAPI.getAssignmentsForTeacherAdmin(id);
      if (response.success) {
        // Assignments are already scoped by teacherId on the server side
        setAssignments(response.assignments || []);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchTeacher();
    fetchBatches();
    fetchCourses();
    fetchAssignments();
  }, [fetchTeacher, fetchAssignments]);

  const handleAssignCourse = async () => {
    if (!selectedBatch || !selectedCourse) {
      setError("Please select both batch and course");
      return;
    }

    // Validate selectedBatch and selectedCourse are valid IDs
    const batchValid = batches.some((b) => b._id === selectedBatch);
    const courseValid = courses.some((c) => c._id === selectedCourse);
    if (!batchValid || !courseValid) {
      setError(
        "Selected batch or course is invalid. Please select a valid option.",
      );
      return;
    }

    // Check if the assignment already exists
    const exists = assignments.some(
      (a) => a.batch?._id === selectedBatch && a.course?._id === selectedCourse,
    );
    if (exists) {
      setError("This batch and course are already assigned to this teacher");
      return;
    }

    try {
      setSubmitting(true);
      const response = await teacherAPI.assignCourses(id, {
        batchId: selectedBatch,
        courseId: selectedCourse,
      });
      if (response.success) {
        setSuccess("Batch and course assigned successfully");
        setSelectedBatch("");
        setSelectedCourse("");
        setShowAssignModal(false);
        fetchAssignments();
        setError("");
      } else {
        setError(response.message || "Failed to assign batch and course");
      }
    } catch (err) {
      setError("Error assigning batch and course: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (batchId, courseId) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        // Remove only the selected assignment
        const newAssignments = assignments
          .filter(
            (a) =>
              !(
                a.batch &&
                a.batch._id === batchId &&
                a.course &&
                a.course._id === courseId
              ),
          )
          .map((a) => ({
            batch: a.batch?._id,
            course: a.course?._id,
          }));

        // If no assignments left, send empty array to backend
        const response = await teacherAPI.assignCourses(id, newAssignments);
        if (response.success) {
          setSuccess("Assignment removed successfully");
          fetchAssignments();
          setError("");
        } else {
          setError(response.message || "Failed to remove assignment");
        }
      } catch (err) {
        setError("Error removing assignment: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="loading">Loading teacher profile...</div>;
  }

  if (!teacher) {
    return <div className="error">Teacher not found</div>;
  }

  return (
    <div className="teacher-profile-container">
      <nav className="teacher-profile-nav">
        <div className="nav-brand">
          <h1>👨‍🏫 Teacher Profile</h1>
          <p className="admin-name">Admin: {adminData.email || "Admin"}</p>
        </div>
        <div className="nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/teachers">Teachers</Link>
          <Link to="/admin/classes">Classes</Link>
          <Link to="/admin/quizzes">Quizzes</Link>
          <Link to="/admin/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="profile-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-header">
          <div className="teacher-info">
            <h2>{teacher.name}</h2>
            <p className="email">Email: {teacher.email}</p>
            <p className="contact">Contact: {teacher.contactNumber}</p>
            <p className="status">
              Status:{" "}
              <span className={teacher.isActive ? "active" : "inactive"}>
                {teacher.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          <button
            className="btn-assign-courses"
            onClick={() => setShowAssignModal(!showAssignModal)}
          >
            {showAssignModal ? "Cancel" : "🎯 Assign Courses"}
          </button>
        </div>

        {showAssignModal && (
          <div className="assign-modal">
            <h3>Assign Batch and Course to Teacher</h3>
            <div className="modal-content">
              <div className="form-group">
                <label>Select Batch *</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setSelectedCourse("");
                  }}
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.degree} {batch.program} {batch.session}{" "}
                      {batch.semester}
                    </option>
                  ))}
                </select>
              </div>
              {selectedBatch && (
                <div className="form-group">
                  <label>Select Course *</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} {course.name} ({course.creditHours})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                className="btn-assign"
                onClick={handleAssignCourse}
                disabled={submitting || !selectedBatch || !selectedCourse}
              >
                {submitting ? "Assigning..." : "Assign Course"}
              </button>
            </div>
          </div>
        )}

        <div className="assignments-section">
          <h3>Assigned Courses</h3>
          {assignments.length === 0 ? (
            <p className="no-assignments">No courses assigned yet</p>
          ) : (
            <div className="assignments-grid">
              {assignments.map((assignment, index) => (
                <div key={index} className="assignment-card">
                  <div className="card-header">
                    <h4>
                      {assignment.batch && assignment.batch.name
                        ? assignment.batch.name
                        : "Unknown Batch"}
                      {assignment.course && assignment.course.name
                        ? ` - ${assignment.course.name}`
                        : ""}
                    </h4>
                    <button
                      className="btn-remove"
                      onClick={() =>
                        handleRemoveAssignment(
                          assignment.batch && assignment.batch._id
                            ? assignment.batch._id
                            : "",
                          assignment.course && assignment.course._id
                            ? assignment.course._id
                            : "",
                        )
                      }
                      title="Remove batch assignment"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="card-content">
                    <p>
                      <strong>Batch:</strong>{" "}
                      {assignment.batch && assignment.batch.name
                        ? assignment.batch.name
                        : "Unknown Batch"}{" "}
                      -{" "}
                      {assignment.batch && assignment.batch.semester
                        ? assignment.batch.semester
                        : "Unknown Semester"}
                    </p>
                    <p>
                      <strong>Course:</strong>{" "}
                      {assignment.course && assignment.course.name
                        ? assignment.course.name
                        : "Unknown Course"}{" "}
                      (
                      {assignment.course && assignment.course.code
                        ? assignment.course.code
                        : ""}
                      )
                    </p>
                    <p className="course-note">
                      Teacher can create quizzes for this batch
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherProfile;
