import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherAPI, teacherQuizAPI, teacherResultAPI } from "../api";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
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

      // Fetch teacher's quizzes
      const quizzesRes = await teacherQuizAPI.getAll();
      if (quizzesRes.success) {
        setQuizzes(quizzesRes.quizzes);

        // Calculate pending reviews for each quiz
        let totalPending = 0;
        const quizzesWithPending = [];
        for (const quiz of quizzesRes.quizzes) {
          try {
            const attemptsRes = await teacherResultAPI.getQuizAttempts(
              quiz._id,
            );
            if (attemptsRes.success) {
              const attempts = attemptsRes.attempts || [];
              const pending = attempts.filter(
                (a) =>
                  a.reviewStatus === "pending" ||
                  a.reviewStatus === "in-progress",
              ).length;
              if (pending > 0) {
                totalPending += pending;
                quizzesWithPending.push({
                  ...quiz,
                  pendingCount: pending,
                  totalAttempts: attempts.length,
                });
              }
            }
          } catch (err) {
            console.error("Error fetching attempts for quiz:", quiz._id);
          }
        }
        setPendingQuizzes(quizzesWithPending);
      }
    } catch (err) {
      setError("Error loading dashboard: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    teacherAPI.logout();
    navigate("/teacher/login");
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

        {pendingQuizzes.length > 0 && (
          <div className="pending-quizzes-section">
            <h2>⏳ Quizzes Awaiting Review</h2>
            <div className="pending-quizzes-grid">
              {pendingQuizzes.map((quiz) => (
                <div key={quiz._id} className="pending-quiz-card">
                  <div className="card-header">
                    <h3>{quiz.title}</h3>
                    <span className="pending-badge">{quiz.pendingCount}</span>
                  </div>
                  <div className="card-stats">
                    <span className="stat-item">
                      Total Attempts: <strong>{quiz.totalAttempts}</strong>
                    </span>
                    <span className="stat-item">
                      Pending:{" "}
                      <strong className="pending-text">
                        {quiz.pendingCount}
                      </strong>
                    </span>
                  </div>
                  <Link
                    to={`/teacher/quiz/${quiz._id}/attempts`}
                    className="btn-review"
                  >
                    Review Now →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="assigned-classes">
          <h2>Assigned Classes</h2>
          <div className="class-grid">
            {assignments.length === 0 ? (
              <div className="no-assignments">
                No classes assigned. Please contact admin.
              </div>
            ) : (
              assignments.map((assignment, idx) => (
                <div key={idx} className="class-card">
                  <h3>{assignment.batch?.name || "Batch"}</h3>
                  <p className="semester">{assignment.batch?.semester}</p>
                  <div className="course-info">
                    <span>
                      Course:{" "}
                      {assignment.course?.code ||
                        assignment.course?.name ||
                        "Course"}
                    </span>
                  </div>
                  <Link
                    to={`/teacher/create-quiz?batch=${assignment.batch?._id}&course=${assignment.course?._id}`}
                    className="btn-create-quiz"
                  >
                    Create Quiz
                  </Link>
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
