import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teacherAPI } from "../api";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch assigned classes/courses
      const coursesRes = await teacherAPI.getAssignedCourses();
      if (coursesRes.success) {
        setAssignments(coursesRes.assignments || []);
      }
    } catch (err) {
      setError("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    teacherAPI.logout();
    window.location.href = "/teacher/login";
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="teacher-dashboard-container">
      <nav className="teacher-dashboard-nav">
        <div className="nav-brand">
          <h1>📊 Teacher Dashboard</h1>
          <p className="teacher-name">
            Teacher: {teacherData.name || "Teacher"}
          </p>
        </div>
        <div className="nav-links">
          <Link to="/teacher/dashboard">Dashboard</Link>
          <Link to="/teacher/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Removed pendingQuizzes section as it's not used */}

        <div className="assigned-classes">
          <h2>Assigned Classes</h2>
          <div className="assignments-grid">
            {assignments.length === 0 ? (
              <div className="no-assignments">
                No courses assigned. Please contact admin.
              </div>
            ) : (
              assignments.map((assignment, idx) => (
                <div key={idx} className="assignment-card">
                  <div className="card-header">
                    <h4>
                      {assignment.batch && assignment.batch.name
                        ? assignment.batch.name
                        : "Unknown Batch"}{" "}
                      <span className="semester">
                        {assignment.batch?.semester}
                      </span>
                    </h4>
                  </div>
                  <div className="card-body">
                    <p>
                      Course:{" "}
                      {assignment.course && assignment.course.name
                        ? assignment.course.name
                        : "Unknown Course"}
                      {assignment.course && assignment.course.code
                        ? ` (${assignment.course.code})`
                        : ""}
                    </p>
                    <p className="course-note">
                      Teacher can create quizzes for this batch
                    </p>
                  </div>
                  <div className="card-actions">
                    <Link
                      to={`/teacher/create-quiz?batch=${assignment.batch?._id}&course=${assignment.course?._id}`}
                      className="btn-create-quiz"
                    >
                      Create Quiz
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
