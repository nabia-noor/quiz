import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { teacherQuizAPI, questionAPI } from "../api";
import "./TeacherQuizManagement.css";

function TeacherQuizManagement() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    questionType: "mcq",
    questionText: "",
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
    marks: 1,
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [editQuizData, setEditQuizData] = useState({
    title: "",
    description: "",
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    expiryDate: "",
  });
  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await teacherQuizAPI.getById(quizId);
      if (res.success) {
        setQuiz(res.quiz);
        await fetchQuestions();
      } else {
        setError(res.message || "Failed to load quiz");
      }
    } catch (err) {
      setError("Error loading quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await questionAPI.getByQuiz(quizId);
      if (res.success) {
        setQuestions(res.questions || []);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    // Validate options based on question type
    if (formData.questionType !== "typed") {
      const filledOptions = formData.options.filter((opt) => opt.optionText.trim());
      const hasCorrectAnswer = filledOptions.some((opt) => opt.isCorrect);

      if (filledOptions.length < 2) {
        setError(`At least 2 options are required for ${formData.questionType === 'mcq' ? 'Multiple Choice' : 'True/False'} questions`);
        return;
      }

      if (!hasCorrectAnswer) {
        setError("At least one correct answer must be selected");
        return;
      }
    }

    try {
      setSubmitting(true);

      // Prepare options based on question type
      const filledOptions = formData.questionType === "typed" 
        ? [] 
        : formData.options.filter((opt) => opt.optionText.trim());

      if (editingQuestionId) {
        // Update question
        const res = await questionAPI.update(editingQuestionId, {
          questionType: formData.questionType,
          questionText: formData.questionText,
          quizId,
          options: filledOptions,
          marks: parseInt(formData.marks),
        });
        if (res.success) {
          setSuccess("Question updated successfully!");
          resetForm();
          await fetchQuestions();
        } else {
          setError(res.message || "Failed to update question");
        }
      } else {
        // Create question
        const res = await questionAPI.create({
          questionType: formData.questionType,
          questionText: formData.questionText,
          quizId,
          options: filledOptions,
          marks: parseInt(formData.marks),
        });
        if (res.success) {
          setSuccess("Question added successfully!");
          resetForm();
          await fetchQuestions();
        } else {
          setError(res.message || "Failed to add question");
        }
      }
    } catch (err) {
      setError("Error saving question: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question._id);
    setFormData({
      questionType: question.questionType,
      questionText: question.questionText,
      options: question.options || [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      marks: question.marks || 1,
    });
    setShowQuestionForm(true);
    window.scrollTo(0, 0);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const res = await questionAPI.delete(questionId);
        if (res.success) {
          setSuccess("Question deleted successfully!");
          await fetchQuestions();
        } else {
          setError(res.message || "Failed to delete question");
        }
      } catch (err) {
        setError("Error deleting question: " + err.message);
      }
    }
  };

  const handleDeleteQuiz = async () => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        const res = await teacherQuizAPI.delete(quizId);
        if (res.success) {
          navigate("/teacher/dashboard");
        } else {
          setError(res.message || "Failed to delete quiz");
        }
      } catch (err) {
        setError("Error deleting quiz: " + err.message);
      }
    }
  };

  const handlePublishQuiz = async () => {
    if (questions.length === 0) {
      setError("Add at least one question before publishing");
      return;
    }
    if (window.confirm("Publish this quiz? Published quizzes cannot be edited.")) {
      try {
        const res = await teacherQuizAPI.update(quizId, { isActive: true });
        if (res.success) {
          setSuccess("Quiz published successfully!");
          setQuiz(res.quiz);
        } else {
          setError(res.message || "Failed to publish quiz");
        }
      } catch (err) {
        setError("Error publishing quiz: " + err.message);
      }
    }
  };

  const handleOpenEditQuiz = () => {
    setEditQuizData({
      title: quiz.title || "",
      description: quiz.description || "",
      duration: quiz.duration || 30,
      totalMarks: quiz.totalMarks || 100,
      passingMarks: quiz.passingMarks || 40,
      startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : "",
      expiryDate: quiz.expiryDate ? new Date(quiz.expiryDate).toISOString().slice(0, 16) : "",
    });
    setShowEditQuizModal(true);
  };

  const handleEditQuizInputChange = (e) => {
    const { name, value } = e.target;
    setEditQuizData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!editQuizData.title.trim()) {
      setError("Quiz title is required");
      return;
    }

    if (!editQuizData.startDate || !editQuizData.expiryDate) {
      setError("Start date and expiry date are required");
      return;
    }

    if (new Date(editQuizData.startDate) >= new Date(editQuizData.expiryDate)) {
      setError("Expiry date must be after start date");
      return;
    }

    try {
      setSubmitting(true);
      const res = await teacherQuizAPI.update(quizId, editQuizData);
      if (res.success) {
        setSuccess("Quiz updated successfully!");
        setQuiz(res.quiz);
        setShowEditQuizModal(false);
      } else {
        setError(res.message || "Failed to update quiz");
      }
    } catch (err) {
      setError("Error updating quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setShowQuestionForm(false);
    setFormData({
      questionType: "mcq",
      questionText: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      marks: 1,
    });
  };

  const handleLogout = () => {
    const teacherAPI = require("../api").teacherAPI;
    teacherAPI.logout();
    navigate("/teacher/login");
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (!quiz) {
    return (
      <div className="teacher-quiz-management-container">
        <nav className="quiz-management-nav">
          <div className="nav-brand">
            <h1>📚 Quiz Management</h1>
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
        <div className="content">
          <div className="error">Quiz not found or you do not have permission to access it</div>
          <Link to="/teacher/dashboard" className="btn-back">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-quiz-management-container">
      <nav className="quiz-management-nav">
        <div className="nav-brand">
          <h1>📚 {quiz.title}</h1>
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

      <div className="quiz-management-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showEditQuizModal && (
          <div className="modal-overlay" onClick={() => setShowEditQuizModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Quiz</h2>
              <form onSubmit={handleUpdateQuiz} className="edit-quiz-form">
                <div className="form-group">
                  <label>Quiz Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editQuizData.title}
                    onChange={handleEditQuizInputChange}
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editQuizData.description}
                    onChange={handleEditQuizInputChange}
                    placeholder="Enter quiz description (optional)"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={editQuizData.duration}
                      onChange={handleEditQuizInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Marks *</label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={editQuizData.totalMarks}
                      onChange={handleEditQuizInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Passing Marks *</label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={editQuizData.passingMarks}
                      onChange={handleEditQuizInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={editQuizData.startDate}
                      onChange={handleEditQuizInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="expiryDate"
                      value={editQuizData.expiryDate}
                      onChange={handleEditQuizInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="btn-submit">
                    {submitting ? "Updating..." : "Update Quiz"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditQuizModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="quiz-header">
          <div className="quiz-info">
            <p><strong>Batch:</strong> {quiz.classId?.name || "N/A"}</p>
            <p><strong>Duration:</strong> {quiz.duration} minutes</p>
            <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
            <p><strong>Passing Marks:</strong> {quiz.passingMarks}</p>
            <p>
              <strong>Start Date:</strong>{" "}
              {quiz.startDate ? new Date(quiz.startDate).toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Expiry Date:</strong>{" "}
              {quiz.expiryDate ? new Date(quiz.expiryDate).toLocaleString() : "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status ${quiz.isActive ? "active" : "draft"}`}>
                {quiz.isActive ? "Published" : "Draft"}
              </span>
            </p>
          </div>
          <div className="quiz-actions">
            <button className="btn-edit" onClick={handleOpenEditQuiz}>
              ✏️ Edit Quiz
            </button>
            {!quiz.isActive && (
              <button className="btn-publish" onClick={handlePublishQuiz}>
                ✓ Publish Quiz
              </button>
            )}
            <Link to="/teacher/dashboard" className="btn-back">
              ← Back
            </Link>
            <button className="btn-delete" onClick={handleDeleteQuiz}>
              🗑 Delete Quiz
            </button>
          </div>
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h2>Questions ({questions.length})</h2>
            {!quiz.isActive && (
              <button
                className="btn-add-question"
                onClick={() => {
                  resetForm();
                  setShowQuestionForm(!showQuestionForm);
                }}
              >
                {showQuestionForm ? "Cancel" : "➕ Add Question"}
              </button>
            )}
          </div>

          {showQuestionForm && !quiz.isActive && (
            <div className="question-form-container">
              <h3>{editingQuestionId ? "Edit Question" : "Add New Question"}</h3>
              <form onSubmit={handleAddQuestion} className="question-form">
                <div className="form-group">
                  <label>Question Type *</label>
                  <select
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleInputChange}
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="truefalse">True/False</option>
                    <option value="typed">Typed Answer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Question Text *</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleInputChange}
                    placeholder="Enter the question"
                    rows="3"
                  ></textarea>
                </div>

                {formData.questionType !== "typed" && (
                  <div className="options-section">
                    <label>Options *</label>
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-input">
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option.optionText}
                          onChange={(e) =>
                            handleOptionChange(index, "optionText", e.target.value)
                          }
                        />
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) =>
                              handleOptionChange(index, "isCorrect", e.target.checked)
                            }
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label>Marks *</label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="btn-submit">
                    {submitting ? "Saving..." : editingQuestionId ? "Update Question" : "Add Question"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {questions.length === 0 ? (
            <p className="no-questions">No questions added yet. {!quiz.isActive && "Add questions to your quiz."}</p>
          ) : (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question._id} className="question-card">
                  <div className="question-header">
                    <h4>Q{index + 1}: {question.questionText}</h4>
                    <span className="marks">{question.marks} mark{question.marks > 1 ? "s" : ""}</span>
                  </div>
                  <div className="question-content">
                    {question.options && question.options.length > 0 && (
                      <ul className="options-list">
                        {question.options.map((opt, idx) => (
                          <li key={idx} className={opt.isCorrect ? "correct" : ""}>
                            {opt.optionText}
                            {opt.isCorrect && " ✓"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {!quiz.isActive && (
                    <div className="question-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditQuestion(question)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherQuizManagement;
