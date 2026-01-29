import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { teacherResultAPI } from "../api";
import "./TeacherMarkQuiz.css";

function TeacherMarkQuiz() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [marks, setMarks] = useState({});
  const [comments, setComments] = useState("");
  const [publishAfterMark, setPublishAfterMark] = useState(false);

  useEffect(() => {
    fetchAttemptDetails();
  }, [resultId]);

  const fetchAttemptDetails = async () => {
    try {
      const response = await teacherResultAPI.getAttemptDetails(resultId);
      if (response.success) {
        setResult(response.result);
        
        // Initialize marks state
        const initialMarks = {};
        response.result.answers.forEach((ans) => {
          initialMarks[ans.questionId] = ans.marksObtained || 0;
        });
        setMarks(initialMarks);
      } else {
        setError(response.message || "Failed to load attempt details");
      }
    } catch (err) {
      setError("Error loading attempt details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (questionId, newMark, maxMarks) => {
    const mark = Math.max(0, Math.min(newMark, maxMarks));
    setMarks({
      ...marks,
      [questionId]: mark,
    });
  };

  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      
      const answerUpdates = result.answers.map((ans) => ({
        questionId: ans.questionId,
        marksAwarded: marks[ans.questionId] || 0,
      }));

      const response = await teacherResultAPI.markQuiz(resultId, {
        answers: answerUpdates,
        reviewComments: comments,
      });

      if (response.success) {
        if (publishAfterMark) {
          await publishResult();
        } else {
          setError("");
          alert("Quiz marked successfully!");
          navigate(-1);
        }
      } else {
        setError(response.message || "Failed to save marks");
      }
    } catch (err) {
      setError("Error saving marks: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const publishResult = async () => {
    try {
      const response = await teacherResultAPI.publishResult(resultId);
      if (response.success) {
        alert("Quiz marked and result published successfully!");
        navigate(-1);
      } else {
        setError(response.message || "Failed to publish result");
      }
    } catch (err) {
      setError("Error publishing result: " + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading attempt details...</div>;
  }

  if (!result) {
    return (
      <div className="error-container">
        <div className="error-message">Could not load attempt details</div>
        <Link to="/teacher/results" className="btn btn-primary">
          Back to Results
        </Link>
      </div>
    );
  }

  const totalMaxMarks = result.answers.reduce((sum, ans) => sum + ans.marks, 0);
  const totalMarksAwarded = Object.values(marks).reduce((a, b) => a + b, 0);

  return (
    <div className="teacher-mark-quiz-container">
      <div className="mark-quiz-header">
        <Link to={-1} className="btn-back">
          ← Back
        </Link>
        <div className="header-content">
          <h1>📝 Mark Quiz</h1>
          <div className="student-info">
            <div className="info-item">
              <span className="label">Student:</span>
              <span className="value">{result.studentName}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{result.studentEmail}</span>
            </div>
            <div className="info-item">
              <span className="label">Quiz:</span>
              <span className="value">{result.quizTitle}</span>
            </div>
            <div className="info-item">
              <span className="label">Submitted:</span>
              <span className="value">
                {new Date(result.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="marks-summary">
        <div className="summary-item">
          <span className="label">Original Score:</span>
          <span className="value">
            {result.obtainedMarks} / {result.totalMarks}
            <small> ({result.percentage.toFixed(2)}%)</small>
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Current Marks:</span>
          <span className="value">
            {totalMarksAwarded} / {totalMaxMarks}
            <small>
              {" "}
              ({totalMaxMarks > 0
                ? ((totalMarksAwarded / totalMaxMarks) * 100).toFixed(2)
                : 0}
              %)
            </small>
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Status:</span>
          <span className="value">
            <span className={`status-badge ${result.reviewStatus}`}>
              {result.reviewStatus.toUpperCase()}
            </span>
          </span>
        </div>
      </div>

      <div className="answers-section">
        <h2>Questions & Answers</h2>

        {result.answers.map((answer, index) => (
          <div key={answer.questionId} className="answer-card">
            <div className="question-header">
              <div className="question-number">Q{index + 1}</div>
              <div className="question-text">{answer.questionText}</div>
              <div className="question-type">
                <span className="type-badge">{answer.questionType}</span>
              </div>
            </div>

            <div className="question-content">
              {answer.questionType === "mcq" ||
              answer.questionType === "truefalse" ? (
                <div className="mcq-answer">
                  <div className="option-group">
                    <label>Options:</label>
                    <div className="options-list">
                      {answer.options?.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`option-item ${
                            opt.optionText === answer.selectedAnswer
                              ? "selected"
                              : ""
                          } ${opt.isCorrect ? "correct" : ""}`}
                        >
                          <span className="option-text">
                            {opt.optionText}
                          </span>
                          {opt.optionText === answer.selectedAnswer && (
                            <span className="selected-badge">✓ Answered</span>
                          )}
                          {opt.isCorrect && (
                            <span className="correct-badge">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="automatic-marking">
                    <span className={`correct-status ${answer.isCorrect ? "yes" : "no"}`}>
                      {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-answer">
                  <div className="answer-group">
                    <label>Student Answer:</label>
                    <div className="answer-text">{answer.typedAnswer || answer.selectedAnswer}</div>
                  </div>
                </div>
              )}

              <div className="marks-input-group">
                <label htmlFor={`marks-${answer.questionId}`}>
                  Marks: <span className="required">*</span>
                </label>
                <div className="marks-input-container">
                  <input
                    type="number"
                    id={`marks-${answer.questionId}`}
                    min="0"
                    max={answer.marks}
                    value={marks[answer.questionId] || 0}
                    onChange={(e) =>
                      handleMarkChange(
                        answer.questionId,
                        parseFloat(e.target.value) || 0,
                        answer.marks
                      )
                    }
                    className="marks-input"
                  />
                  <span className="max-marks">Max: {answer.marks}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="comments-section">
        <label htmlFor="comments">Review Comments (Optional):</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any comments about this attempt..."
          rows="4"
        />
      </div>

      <div className="action-buttons">
        <div className="publish-option">
          <input
            type="checkbox"
            id="publish-after-mark"
            checked={publishAfterMark}
            onChange={(e) => setPublishAfterMark(e.target.checked)}
          />
          <label htmlFor="publish-after-mark">
            Publish result immediately after marking
          </label>
        </div>

        <div className="button-group">
          <Link to={-1} className="btn btn-secondary">
            Cancel
          </Link>
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "Saving..." : "Save & Mark"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherMarkQuiz;
