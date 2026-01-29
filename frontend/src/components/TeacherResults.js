import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherAPI, teacherQuizAPI, resultAPI } from "../api";
import "./TeacherResults.css";

function TeacherResults() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesWithStats, setQuizzesWithStats] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchQuizzesForBatch(selectedBatch);
    } else {
      setQuizzes([]);
      setQuizzesWithStats([]);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const response = await teacherAPI.getAssignedBatches();
      if (response.success) {
        setBatches(response.batches);
      } else {
        setError("Failed to fetch batches");
      }
    } catch (err) {
      setError("Error fetching batches: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzesForBatch = async (batchId) => {
    try {
      const response = await teacherQuizAPI.getByClass(batchId);
      if (response.success) {
        const quizzes = response.quizzes || [];
        setQuizzes(quizzes);
        
        // Fetch attempt stats for each quiz
        const quizzesWithAttemptStats = [];
        for (const quiz of quizzes) {
          try {
            const attemptResponse = await resultAPI.getByQuiz(quiz._id);
            if (attemptResponse.success) {
              const attempts = attemptResponse.results || [];
              const pendingReview = attempts.filter(
                (a) => a.reviewStatus === "pending" || a.reviewStatus === "in-progress"
              ).length;
              
              quizzesWithAttemptStats.push({
                ...quiz,
                totalAttempts: attempts.length,
                pendingReview,
                markedAttempts: attempts.filter(
                  (a) => a.reviewStatus === "marked" || a.reviewStatus === "published"
                ).length,
              });
            }
          } catch (err) {
            quizzesWithAttemptStats.push({
              ...quiz,
              totalAttempts: 0,
              pendingReview: 0,
              markedAttempts: 0,
            });
          }
        }
        setQuizzesWithStats(quizzesWithAttemptStats);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
      setQuizzesWithStats([]);
    }
  };

  const handleLogout = () => {
    teacherAPI.logout();
    navigate("/teacher/login");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="teacher-results-container">
      <nav className="results-nav">
        <div className="nav-brand">
          <h1>📊 Results & Marking</h1>
          <p className="teacher-name">Teacher: {teacherData.name || "Teacher"}</p>
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

      <div className="results-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-section">
          <h2>Filter Quizzes</h2>

          <div className="filter-group">
            <div className="form-group">
              <label>Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">-- Select Batch --</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} - {batch.semester}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedBatch && quizzesWithStats.length > 0 && (
          <div className="quizzes-section">
            <h2>Quizzes for Review & Marking</h2>
            <div className="quizzes-grid">
              {quizzesWithStats.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="card-header">
                    <h3>{quiz.title}</h3>
                    <span className="total-marks">{quiz.totalMarks} pts</span>
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Attempts</span>
                      <span className="stat-value">{quiz.totalAttempts}</span>
                    </div>
                    <div className="stat pending">
                      <span className="stat-label">Pending</span>
                      <span className="stat-value">{quiz.pendingReview}</span>
                    </div>
                    <div className="stat marked">
                      <span className="stat-label">Marked</span>
                      <span className="stat-value">{quiz.markedAttempts}</span>
                    </div>
                  </div>

                  {quiz.totalAttempts > 0 ? (
                    <Link
                      to={`/teacher/quiz/${quiz._id}/attempts`}
                      className="btn-view-attempts"
                    >
                      Review & Mark ({quiz.totalAttempts})
                    </Link>
                  ) : (
                    <div className="no-attempts-badge">
                      No attempts yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedBatch && quizzesWithStats.length === 0 && (
          <div className="no-quizzes">
            <p>📌 No quizzes created in this batch</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherResults;
