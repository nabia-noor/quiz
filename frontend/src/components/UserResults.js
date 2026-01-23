import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserResults.css";
import axios from "axios";

const UserResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, passed, failed, pending

  useEffect(() => {
    fetchUserResults();
  }, []);

  const fetchUserResults = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const userId = localStorage.getItem("userId");

      const response = await axios.get(
        `http://localhost:4000/api/result/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setResults(response.data.results);

        // If there's a selected result ID from navigation, select it
        if (location.state?.resultId) {
          const result = response.data.results.find(
            (r) => r._id === location.state.resultId,
          );
          if (result) {
            setSelectedResult(result);
          }
        }
      }
    } catch (err) {
      setError("Failed to load results");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    return results.filter((result) => {
      const pending = result.manualReviewPending;
      if (filter === "pending") return pending;
      if (filter === "passed") return !pending && result.isPassed;
      if (filter === "failed") return !pending && !result.isPassed;
      return true;
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="user-results-container">
      {/* Header */}
      <header className="results-header">
        <div className="header-content">
          <h1>📈 My Results</h1>
          <button
            className="back-btn"
            onClick={() => navigate("/user/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="results-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="no-results">
            <p>You haven't submitted any quiz yet.</p>
            <button
              className="action-btn"
              onClick={() => navigate("/user/quizzes")}
            >
              Take a Quiz
            </button>
          </div>
        ) : (
          <div className="results-content">
            {/* Results List */}
            <section className="results-list-section">
              <h2>Quiz Results</h2>

              {/* Filter Tabs */}
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All ({results.length})
                </button>
                <button
                  className={`filter-tab ${
                    filter === "pending" ? "active" : ""
                  }`}
                  onClick={() => setFilter("pending")}
                >
                  Pending ({results.filter((r) => r.manualReviewPending).length}
                  )
                </button>
                <button
                  className={`filter-tab ${
                    filter === "passed" ? "active" : ""
                  }`}
                  onClick={() => setFilter("passed")}
                >
                  Passed (
                  {
                    results.filter((r) => !r.manualReviewPending && r.isPassed)
                      .length
                  }
                  )
                </button>
                <button
                  className={`filter-tab ${
                    filter === "failed" ? "active" : ""
                  }`}
                  onClick={() => setFilter("failed")}
                >
                  Failed (
                  {
                    results.filter((r) => !r.manualReviewPending && !r.isPassed)
                      .length
                  }
                  )
                </button>
              </div>

              {filteredResults.length === 0 ? (
                <div className="no-results-filtered">
                  No results found for this filter.
                </div>
              ) : (
                <div className="results-cards">
                  {filteredResults.map((result) => (
                    <div
                      key={result._id}
                      className={`result-card ${
                        selectedResult?._id === result._id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="result-card-header">
                        <h3>{result.quizName || `Quiz - ${result.quizId}`}</h3>
                        <span
                          className={`status-badge ${
                            result.manualReviewPending
                              ? "pending"
                              : result.isPassed
                                ? "passed"
                                : "failed"
                          }`}
                        >
                          {result.manualReviewPending
                            ? "⏳ Result Pending"
                            : result.isPassed
                              ? "✅ Passed"
                              : "❌ Failed"}
                        </span>
                      </div>

                      <div className="result-card-body">
                        <div className="score-display">
                          <div className="score-circle">
                            <span className="score-value">
                              {result.manualReviewPending
                                ? "--"
                                : `${result.percentage.toFixed(1)}%`}
                            </span>
                          </div>
                          <div className="score-details">
                            <p>
                              <strong>Score:</strong> {result.obtainedMarks}/
                              {result.totalMarks}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {formatDate(result.submittedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Result Details */}
            {selectedResult && (
              <section className="result-details-section">
                <h2>Quiz Results</h2>

                <div className="details-card">
                  <div className="detail-header">
                    <h3>
                      {selectedResult.quizName ||
                        `Quiz - ${selectedResult.quizId}`}
                    </h3>
                    <span
                      className={`status-badge ${
                        selectedResult.manualReviewPending
                          ? "pending"
                          : selectedResult.isPassed
                            ? "passed"
                            : "failed"
                      }`}
                    >
                      {selectedResult.manualReviewPending
                        ? "⏳ Result Pending"
                        : selectedResult.isPassed
                          ? "✅ Passed"
                          : "❌ Failed"}
                    </span>
                  </div>

                  {selectedResult.manualReviewPending && (
                    <div className="quiz-summary">
                      <p>
                        This result is awaiting manual review for typed
                        questions. Scores and status will finalize after the
                        instructor marks them.
                      </p>
                    </div>
                  )}

                  <div className="score-overview">
                    <div className="score-item">
                      <label>Total Score</label>
                      <p>
                        {selectedResult.obtainedMarks}/
                        {selectedResult.totalMarks}
                      </p>
                    </div>
                    <div className="score-item">
                      <label>Percentage</label>
                      <p>
                        {selectedResult.manualReviewPending
                          ? "Pending"
                          : `${selectedResult.percentage.toFixed(2)}%`}
                      </p>
                    </div>
                    <div className="score-item">
                      <label>Status</label>
                      <p>
                        {selectedResult.manualReviewPending
                          ? "Result Pending"
                          : selectedResult.isPassed
                            ? "Passed"
                            : "Failed"}
                      </p>
                    </div>
                    <div className="score-item">
                      <label>Submitted On</label>
                      <p>{formatDate(selectedResult.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Answers Review */}
                  <div className="answers-section">
                    <h4>📋 Quiz Results</h4>
                    <div className="quiz-summary">
                      <p>
                        <strong>Overall Score:</strong>{" "}
                        {selectedResult.obtainedMarks}/
                        {selectedResult.totalMarks} (
                        {selectedResult.manualReviewPending
                          ? "Pending"
                          : `${selectedResult.percentage.toFixed(2)}%`}
                        )
                      </p>
                      <p
                        className={
                          selectedResult.manualReviewPending
                            ? "pending"
                            : selectedResult.isPassed
                              ? "passed"
                              : "failed"
                        }
                      >
                        <strong>Status:</strong>{" "}
                        {selectedResult.manualReviewPending
                          ? "⏳ Pending manual review"
                          : selectedResult.isPassed
                            ? "✅ Passed"
                            : "❌ Failed"}
                      </p>
                    </div>

                    <h4>❓ Question Results</h4>

                    {selectedResult.answers &&
                    selectedResult.answers.length > 0 ? (
                      <div className="answers-list">
                        {selectedResult.answers.map((answer, index) => {
                          const isPending = answer.requiresManualReview;
                          const isCorrect = answer.isCorrect === true;
                          const isIncorrect = answer.isCorrect === false;
                          const isManual =
                            !isPending && answer.isCorrect === null;

                          let rowClass = "incorrect";
                          if (isPending) rowClass = "pending";
                          else if (isManual) rowClass = "manual";
                          else if (isCorrect) rowClass = "correct";

                          let badgeClass = rowClass;
                          let badgeText = "✗ Incorrect";
                          if (isPending) {
                            badgeText = "Pending review";
                          } else if (isManual) {
                            badgeText = "Manual score";
                          } else if (isCorrect) {
                            badgeText = "✓ Correct";
                          }

                          return (
                            <div
                              key={index}
                              className={`answer-item ${rowClass}`}
                            >
                              <div className="answer-header">
                                <span className="question-no">
                                  Question {index + 1}
                                </span>
                                <span className={`answer-badge ${badgeClass}`}>
                                  {badgeText}
                                </span>
                              </div>
                              <div className="answer-body">
                                <p>
                                  <strong>Your Answer:</strong>{" "}
                                  {answer.selectedAnswer ||
                                    answer.typedAnswer ||
                                    "Not answered"}
                                </p>
                                <p>
                                  <strong>Marks Obtained:</strong>{" "}
                                  {isPending
                                    ? "Pending"
                                    : answer.marksObtained || 0}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>No answer details available.</p>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn secondary"
                      onClick={() => navigate("/user/quizzes")}
                    >
                      Take Another Quiz
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => navigate("/user/dashboard")}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserResults;
