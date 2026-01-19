import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuizAttempt.css";
import axios from "axios";

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [quizId]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuizAndQuestions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const userId = localStorage.getItem("userId");

      // Check if user has already attempted this quiz
      const resultResponse = await axios.get(
        `http://localhost:4000/api/result/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resultResponse.data.success) {
        const userAttemptedQuiz = resultResponse.data.results.some((result) => {
          const quizId_ = typeof result.quizId === 'object' ? result.quizId._id : result.quizId;
          return quizId_ === quizId;
        });

        if (userAttemptedQuiz) {
          setError("You have already attempted this quiz. Each quiz can only be attempted once.");
          setLoading(false);
          return;
        }
      }

      // Fetch quiz
      const quizResponse = await axios.get(
        `http://localhost:4000/api/quiz/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (quizResponse.data.success) {
        setQuiz(quizResponse.data.quiz);
        setTimeLeft(quizResponse.data.quiz.duration * 60);
      }

      // Fetch questions
      const questionsResponse = await axios.get(
        `http://localhost:4000/api/question/quiz/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (questionsResponse.data.success) {
        setQuestions(questionsResponse.data.questions);
      }
    } catch (err) {
      setError("Failed to load quiz or questions");
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmation(false);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("userToken");
      const userId = localStorage.getItem("userId");

      // Prepare answers in the format expected by backend
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || "",
      }));

      const response = await axios.post(
        "http://localhost:4000/api/result/submit",
        {
          quizId,
          answers: formattedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Redirect to results
        navigate("/user/results", {
          state: { resultId: response.data.result.resultId },
        });
      } else {
        setError(response.data.message || "Failed to submit quiz");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
      console.error("Error submitting quiz:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return <div className="loading-container">Loading quiz...</div>;
  }

  if (error && !quiz) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/user/quizzes")}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-attempt-container">
      {/* Header */}
      <header className="attempt-header">
        <div className="header-left">
          <h1>{quiz?.title}</h1>
          <p>{quiz?.description}</p>
        </div>
        <div className="header-right">
          <div
            className="timer"
            style={{ color: timeLeft < 300 ? "#dc3545" : "white" }}
          >
            ⏱️ {formatTime(timeLeft || 0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="attempt-main">
        <div className="attempt-content">
          {/* Questions Panel */}
          <section className="questions-panel">
            {currentQuestion && (
              <>
                <div className="question-header">
                  <h2>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <span className="question-marks">
                    Marks: {currentQuestion.marks}
                  </span>
                </div>

                <div className="question-text">
                  <p>{currentQuestion.questionText}</p>
                </div>

                <div className="options-list">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option.optionText}
                        checked={
                          answers[currentQuestion._id] === option.optionText
                        }
                        onChange={() =>
                          handleSelectAnswer(
                            currentQuestion._id,
                            option.optionText,
                          )
                        }
                        className="option-input"
                      />
                      <span className="option-text">{option.optionText}</span>
                    </label>
                  ))}
                </div>

                <div className="navigation-buttons">
                  <button
                    className="nav-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button className="nav-btn primary" onClick={handleNext}>
                      Next →
                    </button>
                  ) : (
                    <button
                      className="nav-btn submit"
                      onClick={() => setShowConfirmation(true)}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Questions Summary Sidebar */}
          <aside className="summary-sidebar">
            <div className="summary-header">
              <h3>Question Summary</h3>
              <p className="answered-count">
                Answered: {answeredCount}/{questions.length}
              </p>
            </div>

            <div className="questions-grid">
              {questions.map((question, index) => (
                <button
                  key={index}
                  className={`question-btn ${
                    index === currentQuestionIndex ? "current" : ""
                  } ${answers[question._id] ? "answered" : "unanswered"}`}
                  onClick={() => handleGoToQuestion(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot answered"></span>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot unanswered"></span>
                <span>Unanswered</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot current"></span>
                <span>Current</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Quiz?</h2>
            <p>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{questions.length}</strong> questions.
            </p>
            <p className="warning">
              Once submitted, you cannot change your answers. Are you sure you
              want to submit?
            </p>
            <div className="modal-buttons">
              <button
                className="btn cancel"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn submit"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-notification">{error}</div>}
    </div>
  );
};

export default QuizAttempt;
