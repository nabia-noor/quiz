import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resultAPI } from "../api";
import "./AdminResultDetail.css";

function AdminResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [awardedMarks, setAwardedMarks] = useState({});
  const [savingMap, setSavingMap] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    setError("");
    setMessage("");
    try {
      const res = await resultAPI.getById(id);
      if (res.success) {
        setResult(res.result);
        hydrateMarks(res.result);
      } else {
        setError(res.message || "Failed to load result");
      }
    } catch (err) {
      setError("Failed to load result");
    } finally {
      setLoading(false);
    }
  };

  const hydrateMarks = (resultData) => {
    const map = {};
    (resultData.answers || []).forEach((ans) => {
      const qid = ans.questionId?._id || ans.questionId;
      map[qid] = Number.isFinite(ans.marksObtained) ? ans.marksObtained : 0;
    });
    setAwardedMarks(map);
  };

  const handleSaveReview = async (questionId) => {
    setSavingMap((prev) => ({ ...prev, [questionId]: true }));
    setMessage("");
    try {
      const res = await resultAPI.review(result._id, {
        questionId,
        marksAwarded: awardedMarks[questionId] ?? 0,
      });

      if (res.success) {
        setResult(res.result);
        hydrateMarks(res.result);
        setMessage("Review saved");
      } else {
        setError(res.message || "Failed to save review");
      }
    } catch (err) {
      setError("Failed to save review");
    } finally {
      setSavingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="admin-result-detail loading">Loading result...</div>;
  }

  if (error) {
    return (
      <div className="admin-result-detail error-state">
        <p>{error}</p>
        <button onClick={fetchResult} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const manualPending = result?.manualReviewPending;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Quiz Admin Panel</h1>
        <div className="nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/classes">Classes/Semesters</Link>
          <Link to="/admin/quizzes">Quizzes</Link>
          <Link to="/admin/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content admin-result-detail">
        <div className="page-header">
          <div>
            <Link to="/admin/results" className="back-link">
              ← Back to Results
            </Link>
            <h2>Result Review</h2>
            {manualPending && (
              <span className="pending-badge">Manual review pending</span>
            )}
          </div>
          <div className="summary-pills">
            <span className="pill">
              Score: {result.obtainedMarks}/{result.totalMarks}
            </span>
            <span className={`pill ${result.isPassed ? "passed" : "failed"}`}>
              {result.isPassed ? "Passed" : "Failed"}
            </span>
            <span className="pill muted">
              Submitted: {new Date(result.submittedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {message && <div className="alert success">{message}</div>}
        {manualPending === false && (
          <div className="alert info">All manual reviews completed.</div>
        )}

        <div className="info-grid">
          <div className="info-card">
            <h4>Student</h4>
            <p>{result.userId?.name || "N/A"}</p>
            <span className="muted">{result.userId?.email || ""}</span>
          </div>
          <div className="info-card">
            <h4>Quiz</h4>
            <p>{result.quizId?.title || "N/A"}</p>
            <span className="muted">Total Marks: {result.totalMarks}</span>
          </div>
          <div className="info-card">
            <h4>Performance</h4>
            <p>{result.percentage.toFixed(2)}%</p>
            <span className="muted">Obtained: {result.obtainedMarks}</span>
          </div>
        </div>

        <div className="answers-section">
          <h3>Answers</h3>
          {(result.answers || []).map((ans, index) => {
            const q = ans.questionId || {};
            const qType = q.questionType || "mcq";
            const isText = qType === "text";
            return (
              <div key={q._id || index} className="answer-card">
                <div className="answer-header">
                  <div>
                    <span className="question-number">
                      Question {index + 1}
                    </span>
                    <h4>{q.questionText || "Question"}</h4>
                    <div className="tags">
                      <span className={`tag ${isText ? "typed" : "mcq"}`}>
                        {isText ? "Typed" : "MCQ"}
                      </span>
                      <span className="tag marks">{q.marks || 0} marks</span>
                    </div>
                  </div>
                  <div className="marks-display">
                    <span className="label">Awarded</span>
                    <strong>{ans.marksObtained || 0}</strong>
                  </div>
                </div>

                <div className="answer-body">
                  <p>
                    <strong>User Answer:</strong>{" "}
                    {ans.typedAnswer || ans.selectedAnswer || "Not answered"}
                  </p>

                  {isText ? (
                    <div className="manual-review">
                      <p className="muted">
                        Enter the marks to award for this typed answer (0 -
                        {q.marks || 0}).
                        {ans.requiresManualReview && " Pending review."}
                      </p>
                      <div className="marks-input-row">
                        <input
                          type="number"
                          min="0"
                          max={q.marks || 0}
                          step="0.5"
                          value={awardedMarks[q._id] ?? 0}
                          onChange={(e) => {
                            const parsed = Number(e.target.value);
                            setAwardedMarks((prev) => ({
                              ...prev,
                              [q._id]: Number.isFinite(parsed) ? parsed : 0,
                            }));
                          }}
                        />
                        <span className="out-of">out of {q.marks || 0}</span>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={() => handleSaveReview(q._id)}
                        disabled={savingMap[q._id]}
                      >
                        {savingMap[q._id] ? "Saving..." : "Mark This Question"}
                      </button>
                      {!ans.requiresManualReview && (
                        <div
                          className={`auto-result ${(ans.marksObtained || 0) > 0 ? "correct" : "incorrect"}`}
                        >
                          {(ans.marksObtained || 0) > 0
                            ? "Auto graded: Correct"
                            : "Auto graded: Incorrect"}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`auto-result ${(ans.marksObtained || 0) > 0 ? "correct" : "incorrect"}`}
                    >
                      {(ans.marksObtained || 0) > 0
                        ? "Auto graded: Correct"
                        : "Auto graded: Incorrect"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminResultDetail;
