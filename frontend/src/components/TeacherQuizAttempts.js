import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { teacherResultAPI, teacherQuizAPI } from "../api";
import "./TeacherQuizAttempts.css";

function TeacherQuizAttempts() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalAttempts: 0,
    submittedAttempts: 0,
    pendingReview: 0,
    markedAttempts: 0,
  });

  useEffect(() => {
    fetchQuizAndAttempts();
  }, [quizId]);

  const fetchQuizAndAttempts = async () => {
    try {
      // Fetch quiz details
      const quizResponse = await teacherQuizAPI.getById(quizId);
      if (quizResponse.success) {
        setQuiz(quizResponse.quiz);
      }

      // Fetch attempts
      const attemptsResponse = await teacherResultAPI.getQuizAttempts(quizId);
      if (attemptsResponse.success) {
        setAttempts(attemptsResponse.attempts || []);

        // Calculate stats
        const total = attemptsResponse.attempts?.length || 0;
        const submitted = total;
        const pending = (attemptsResponse.attempts || []).filter(
          (a) => a.reviewStatus === "pending" || a.reviewStatus === "in-progress"
        ).length;
        const marked = (attemptsResponse.attempts || []).filter(
          (a) => a.reviewStatus === "marked" || a.reviewStatus === "published"
        ).length;

        setStats({
          totalAttempts: total,
          submittedAttempts: submitted,
          pendingReview: pending,
          markedAttempts: marked,
        });
      }
    } catch (err) {
      setError("Error loading attempts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz attempts...</div>;
  }

  return (
    <div className="teacher-quiz-attempts-container">
      <div className="attempts-header">
        <Link to="/teacher/results" className="btn-back">
          ← Back
        </Link>
        <div className="header-content">
          <h1>📋 Quiz Attempts</h1>
          {quiz && (
            <div className="quiz-info">
              <h2>{quiz.title}</h2>
              <p>Total Marks: {quiz.totalMarks}</p>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalAttempts}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.submittedAttempts}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pendingReview}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card marked">
          <div className="stat-number">{stats.markedAttempts}</div>
          <div className="stat-label">Marked</div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="no-attempts">
          <p>📌 No students have attempted this quiz yet</p>
        </div>
      ) : (
        <div className="attempts-table-container">
          <table className="attempts-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Pass/Fail</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => {
                const statusColor =
                  attempt.reviewStatus === "pending"
                    ? "status-pending"
                    : attempt.reviewStatus === "in-progress"
                    ? "status-in-progress"
                    : attempt.reviewStatus === "marked"
                    ? "status-marked"
                    : "status-published";

                const passFailColor = attempt.isPassed ? "pass" : "fail";

                return (
                  <tr key={attempt._id}>
                    <td className="student-name">{attempt.studentName}</td>
                    <td>{attempt.studentEmail}</td>
                    <td className="marks">{attempt.obtainedMarks}</td>
                    <td className="marks">{attempt.totalMarks}</td>
                    <td className="percentage">
                      {attempt.percentage.toFixed(2)}%
                    </td>
                    <td>
                      <span className={`badge ${passFailColor}`}>
                        {attempt.isPassed ? "✓ Pass" : "✗ Fail"}
                      </span>
                    </td>
                    <td>{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${statusColor}`}>
                        {attempt.reviewStatus === "pending"
                          ? "Pending"
                          : attempt.reviewStatus === "in-progress"
                          ? "In Progress"
                          : attempt.reviewStatus === "marked"
                          ? "Marked"
                          : "Published"}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/teacher/result/${attempt._id}/mark`}
                        className="btn-action"
                      >
                        {attempt.reviewStatus === "published"
                          ? "View"
                          : "Review & Mark"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherQuizAttempts;
