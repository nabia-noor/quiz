import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserQuestions.css";
import axios from "axios";

const UserQuestions = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuestions(selectedQuizId);
    } else {
      setQuestions([]);
    }
  }, [selectedQuizId]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get("http://localhost:4000/api/quiz/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to load quizzes");
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `http://localhost:4000/api/question/quiz/${quizId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setQuestions(response.data.questions || []);
      }
    } catch (err) {
      setError("Failed to load questions");
    }
  };

  const selectedQuiz = quizzes.find((q) => q._id === selectedQuizId);

  return (
    <div className="user-questions-container">
      <header className="questions-header">
        <div className="header-content">
          <h1>❓ Questions Library</h1>
          <button
            className="back-btn"
            onClick={() => navigate("/user/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="questions-main">
        <div className="quiz-selector-section">
          <label htmlFor="quiz-select">Select Quiz to View Questions</label>
          <select
            id="quiz-select"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="quiz-select"
          >
            <option value="">-- Choose a quiz --</option>
            {quizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title} ({new Date(quiz.startDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading quizzes...</div>
        ) : !selectedQuizId ? (
          <div className="no-selection">
            <p>Select a quiz to view its questions</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="no-questions">
            <p>No questions available for this quiz yet.</p>
          </div>
        ) : (
          <div className="questions-section">
            <div className="quiz-info">
              <h2>{selectedQuiz?.title}</h2>
              <p className="quiz-details">{selectedQuiz?.description}</p>
              <div className="quiz-stats">
                <span>Total Marks: {selectedQuiz?.totalMarks}</span>
                <span>Duration: {selectedQuiz?.duration} mins</span>
                <span>Questions: {questions.length}</span>
              </div>
            </div>

            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question._id} className="question-item">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <h3>{question.questionText}</h3>
                    <div className="question-badges">
                      <span
                        className={`type-badge ${question.questionType || "mcq"}`}
                      >
                        {(question.questionType || "mcq") === "text"
                          ? "Text"
                          : "MCQ"}
                      </span>
                      <span className="marks-badge">
                        {question.marks} marks
                      </span>
                    </div>
                  </div>

                  {/* User-side question view: options are hidden (admin-only) */}
                </div>
              ))}
            </div>

            <div className="action-footer">
              <button
                className="btn-start"
                onClick={() => navigate(`/user/quiz/${selectedQuizId}`)}
              >
                🚀 Start This Quiz
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserQuestions;
