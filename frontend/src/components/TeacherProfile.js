import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { teacherAPI, classAPI, subjectAPI } from "../api";
import "./TeacherProfile.css";

function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  useEffect(() => {
    fetchTeacher();
    fetchClasses();
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTeacher = async () => {
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
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      if (response.success) {
        // Filter to show only available batches (BS, MS, PhD)
        const availableBatches = ["BS", "MS", "PhD"];
        const filteredClasses = response.classes.filter(
          (c) => c.isActive && availableBatches.includes(c.name)
        );
        setClasses(filteredClasses);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await teacherAPI.getAssignmentsForTeacherAdmin(id);
      if (response.success) {
        // Assignments are already scoped by teacherId on the server side
        setAssignments(response.assignments || []);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      if (response.success) {
        setSubjects(response.subjects || []);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedClass) {
      setError("Please select a batch");
      return;
    }

    // Check if this assignment already exists
    const exists = assignments.some(
      (a) => a.classId._id === selectedClass
    );

    if (exists) {
      setError("This batch is already assigned to this teacher");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create assignments for the batch and each selected subject
      const newAssignmentsList = selectedSubjects.length > 0 
        ? selectedSubjects.map((subjectId) => ({
            classId: selectedClass,
            subjectId: subjectId,
          }))
        : [{ classId: selectedClass, subjectId: null }];

      const allAssignments = [
        ...assignments.map((a) => ({
          classId: a.classId._id,
          subjectId: a.subjectId?._id || null,
        })),
        ...newAssignmentsList,
      ];

      const response = await teacherAPI.assignCourses(id, allAssignments);
      if (response.success) {
        setSuccess("Batch and courses assigned successfully");
        setSelectedClass("");
        setSelectedSubjects([]);
        setShowAssignModal(false);
        fetchAssignments();
        setError("");
      } else {
        setError(response.message || "Failed to assign batch");
      }
    } catch (err) {
      setError("Error assigning batch: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (classId, quizId) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        const newAssignments = assignments
          .filter((a) => a.classId._id !== classId)
          .map((a) => ({
            classId: a.classId._id,
            subjectId: a.subjectId?._id || null,
          }));

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
            <h3>Assign Batch and Courses to Teacher</h3>
            <div className="modal-content">
              <div className="form-group">
                <label>Select Batch *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubjects([]);
                    if (e.target.value) {
                      fetchSubjects();
                    }
                  }}
                >
                  <option value="">-- Select Batch --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.semester}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <div className="form-group">
                  <label>Select Courses (Optional)</label>
                  <div className="courses-list">
                    {subjects.length === 0 ? (
                      <p className="no-courses">No courses available</p>
                    ) : (
                      subjects.map((subject) => (
                        <label key={subject._id} className="course-checkbox">
                          <input
                            type="checkbox"
                            value={subject._id}
                            checked={selectedSubjects.includes(subject._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubjects([...selectedSubjects, subject._id]);
                              } else {
                                setSelectedSubjects(
                                  selectedSubjects.filter((id) => id !== subject._id)
                                );
                              }
                            }}
                          />
                          <span>{subject.name} ({subject.code})</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <p className="info-text">
                ℹ️ Teacher will create quizzes for this batch{selectedSubjects.length > 0 ? ` in the selected courses` : ``}
              </p>

              <button
                className="btn-assign"
                onClick={handleAssignCourse}
                disabled={submitting || !selectedClass}
              >
                {submitting ? "Assigning..." : "Assign Batch & Courses"}
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
                    <h4>{assignment.classId.name}</h4>
                    <button
                      className="btn-remove"
                      onClick={() =>
                        handleRemoveAssignment(
                          assignment.classId._id
                        )
                      }
                      title="Remove batch assignment"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="card-content">
                    <p>
                      <strong>Batch:</strong> {assignment.classId.name} -{" "}
                      {assignment.classId.semester}
                    </p>
                    <p className="course-note">Teacher can create quizzes for this batch</p>
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
