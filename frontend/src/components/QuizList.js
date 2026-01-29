import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizList.css";
import axios from "axios";

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("available");
  const [userResults, setUserResults] = useState({});
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    fetchQuizzes();
    fetchUserResults();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get("http://localhost:4000/api/quiz/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const quizzesData = response.data.quizzes || [];
        setQuizzes(quizzesData);

        // Fetch question count for each quiz
        quizzesData.forEach((quiz) => {
          fetchQuestionCount(quiz._id, token);
        });
      }
    } catch (err) {
      setError("Failed to load quizzes");
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionCount = async (quizId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/question/quiz/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setQuestionCounts((prev) => ({
          ...prev,
          [quizId]: response.data.questions?.length || 0,
        }));
      }
    } catch (err) {
      console.error("Error fetching question count:", err);
    }
  };

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
        const resultsMap = {};
        response.data.results.forEach((result) => {
          // quizId is populated as an object, so we need to get its _id
          if (result.quizId) {
            const quizId =
              typeof result.quizId === "object"
                ? result.quizId._id
                : result.quizId;
            resultsMap[quizId] = result;
          }
        });
        setUserResults(resultsMap);
      }
    } catch (err) {
      console.error("Error fetching user results:", err);
    }
  };

  const getQuizStatus = (quiz) => {
    if (!quiz || !quiz.startDate || !quiz.expiryDate) {
      return "expired";
    }

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const expiryDate = new Date(quiz.expiryDate);

    if (userResults[quiz._id]) {
      return "completed";
    }

    if (now < startDate) {
      return "upcoming";
    }

    if (now > expiryDate) {
      return "expired";
    }

    return "available";
  };

  const getFilteredQuizzes = () => {
    return quizzes.filter((quiz) => {
      const status = getQuizStatus(quiz);
      if (filter === "available") {
        return status === "available";
      } else if (filter === "expired") {
        return status === "expired";
      } else if (filter === "completed") {
        return status === "completed";
      } else if (filter === "upcoming") {
        return status === "upcoming";
      }
      return true;
    });
  };

  const handleStartQuiz = (quizId) => {
    const status = getQuizStatus(quizzes.find((q) => q._id === quizId));
    if (status === "available") {
      navigate(`/user/quiz/${quizId}`);
    } else if (status === "completed") {
      // Show result instead
      const result = userResults[quizId];
      navigate("/user/results", { state: { selectedResult: result._id } });
    }
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

  const getStatusBadge = (status) => {
    const badges = {
      available: { class: "status-available", text: "Available" },
      expired: { class: "status-expired", text: "Expired" },
      completed: { class: "status-completed", text: "Completed" },
      upcoming: { class: "status-upcoming", text: "Upcoming" },
    };
    return badges[status] || badges.available;
  };

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="quiz-list-container">
      {/* Header */}
      <header className="quiz-list-header">
        <div className="header-content">
          <h1>📝 Quizzes</h1>
          <button
            className="back-btn"
            onClick={() => navigate("/user/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="quiz-list-main">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "available" ? "active" : ""}`}
            onClick={() => setFilter("available")}
          >
            Available
          </button>
          <button
            className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-tab ${filter === "expired" ? "active" : ""}`}
            onClick={() => setFilter("expired")}
          >
            Expired
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading quizzes...</div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="no-quizzes">
            <p>No {filter} quizzes found.</p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {filteredQuizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              const statusBadge = getStatusBadge(status);
              const result = userResults[quiz._id];

              return (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-header">
                    <h3>{quiz.title}</h3>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <p className="quiz-description">{quiz.description}</p>

                  <div className="quiz-details">
                    <div className="detail-item">
                      <span className="detail-label">Questions:</span>
                      <span className="detail-value">
                        {questionCounts[quiz._id] || 0}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{quiz.duration} mins</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Marks:</span>
                      <span className="detail-value">{quiz.totalMarks}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Passing Marks:</span>
                      <span className="detail-value">{quiz.passingMarks}</span>
                    </div>
                  </div>

                  <div className="quiz-dates">
                    <div>
                      <strong>Start:</strong> {formatDate(quiz.startDate)}
                    </div>
                    <div>
                      <strong>End:</strong> {formatDate(quiz.expiryDate)}
                    </div>
                  </div>

                  {result && (
                    <div className="quiz-result">
                      <p>
                        <strong>Your Score:</strong> {result.obtainedMarks}/
                        {result.totalMarks} ({result.percentage.toFixed(1)}%)
                      </p>
                      <p className={result.isPassed ? "passed" : "failed"}>
                        {result.isPassed ? "✅ Passed" : "❌ Failed"}
                      </p>
                    </div>
                  )}

                  <button
                    className={`action-btn ${
                      status === "completed" ? "view-btn" : "start-btn"
                    } ${
                      status !== "available" && status !== "completed"
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() => handleStartQuiz(quiz._id)}
                    disabled={status !== "available" && status !== "completed"}
                  >
                    {status === "completed"
                      ? "View Result"
                      : status === "available"
                        ? "Start Quiz"
                        : status === "expired"
                          ? "Expired"
                          : "Upcoming"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizList;
