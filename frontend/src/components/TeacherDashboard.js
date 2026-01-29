import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherAPI, teacherQuizAPI, teacherResultAPI } from "../api";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch assigned batches
      const batchesRes = await teacherAPI.getAssignedBatches();
      if (batchesRes.success) {
        setBatches(batchesRes.batches);
      }

      // Fetch assigned courses (assignments by batch)
      const coursesRes = await teacherAPI.getAssignedCourses();
      const totalCourses = coursesRes.success
        ? new Set(
            (coursesRes.assignments || [])
              .map((a) => a.classId?._id)
              .filter(Boolean)
          ).size
        : 0;

      // Fetch teacher's quizzes
      const quizzesRes = await teacherQuizAPI.getAll();
      if (quizzesRes.success) {
        setQuizzes(quizzesRes.quizzes);

        // Calculate pending reviews for each quiz
        let totalPending = 0;
        const quizzesWithPending = [];
        
        for (const quiz of quizzesRes.quizzes) {
          try {
            const attemptsRes = await teacherResultAPI.getQuizAttempts(quiz._id);
            if (attemptsRes.success) {
              const attempts = attemptsRes.attempts || [];
              const pending = attempts.filter(
                (a) => a.reviewStatus === "pending" || a.reviewStatus === "in-progress"
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

        // Calculate stats
        setStats({
          totalBatches: batchesRes.batches?.length || 0,
          totalCourses,
          totalQuizzes: quizzesRes.success ? quizzesRes.quizzes?.length || 0 : 0,
          pendingReviews: totalPending,
        });
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
          <Link to="/teacher/create-quiz">Create Quiz</Link>
          <Link to="/teacher/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalBatches}</div>
              <div className="stat-label">Assigned Batches</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalCourses}</div>
              <div className="stat-label">Assigned Courses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{quizzes.length}</div>
              <div className="stat-label">Quizzes Created</div>
            </div>
          </div>

          <div className="stat-card pending-alert">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingReviews}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/teacher/create-quiz" className="btn btn-primary">
            ➕ Create New Quiz
          </Link>
          <Link to="/teacher/results" className="btn btn-secondary">
            📊 View Results & Mark
          </Link>
        </div>

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
                      Pending: <strong className="pending-text">{quiz.pendingCount}</strong>
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

        {batches.length > 0 && (
          <div className="assigned-batches">
            <h2>Your Assigned Batches</h2>
            <div className="batch-grid">
              {batches.map((batch) => (
                <div key={batch._id} className="batch-card">
                  <h3>{batch.name}</h3>
                  <p className="semester">{batch.semester}</p>
                  <Link
                    to={`/teacher/batch/${batch._id}`}
                    className="btn-view-batch"
                  >
                    View Courses →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {quizzes.length > 0 && (
          <div className="recent-quizzes">
            <h2>Your Recent Quizzes</h2>
            <div className="quizzes-table">
              <table>
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Batch</th>
                    <th>Subject</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.slice(0, 5).map((quiz) => (
                    <tr key={quiz._id}>
                      <td>{quiz.title}</td>
                      <td>{quiz.classId?.name || "N/A"}</td>
                      <td>{quiz.subjectId?.name || "—"}</td>
                      <td>{quiz.duration} min</td>
                      <td>{quiz.totalMarks}</td>
                      <td>
                        <span
                          className={`status ${
                            quiz.isActive ? "active" : "inactive"
                          }`}
                        >
                          {quiz.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link to={`/teacher/quiz/${quiz._id}`} className="btn-edit">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
