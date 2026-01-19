import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { questionAPI, quizAPI } from "../api";
import "./QuestionManagement.css";

function QuestionManagement() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    questionText: "",
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
    marks: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const result = await quizAPI.getById(quizId);
      if (result.success) {
        setQuiz(result.quiz);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const result = await questionAPI.getByQuiz(quizId);
      if (result.success) {
        setQuestions(result.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleQuestionChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;

    // If marking an option as correct, unmark others
    if (field === "isCorrect" && value) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { optionText: "", isCorrect: false }],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      alert("Please enter question text");
      return;
    }

    const validOptions = formData.options.filter((opt) =>
      opt.optionText.trim()
    );
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    const hasCorrectAnswer = validOptions.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      alert("Please mark one option as correct");
      return;
    }

    try {
      const dataToSubmit = {
        quizId,
        questionText: formData.questionText,
        options: validOptions,
        marks: Number(formData.marks),
      };

      let result;
      if (editingId) {
        result = await questionAPI.update(editingId, dataToSubmit);
      } else {
        result = await questionAPI.create(dataToSubmit);
      }

      if (result.success) {
        fetchQuestions();
        resetForm();
      } else {
        alert(result.message || "Operation failed");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEdit = (question) => {
    setFormData({
      questionText: question.questionText,
      options:
        question.options.length > 0
          ? question.options
          : [
              { optionText: "", isCorrect: false },
              { optionText: "", isCorrect: false },
            ],
      marks: question.marks,
    });
    setEditingId(question._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const result = await questionAPI.delete(id);
        if (result.success) {
          fetchQuestions();
        } else {
          alert(result.message || "Delete failed");
        }
      } catch (error) {
        alert("An error occurred");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      marks: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

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

      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <Link to="/admin/quizzes" className="back-link">
              ← Back to Quizzes
            </Link>
            <h2>Manage Questions: {quiz?.title}</h2>
            <p className="quiz-info">
              Total Marks: {quiz?.totalMarks} | Duration: {quiz?.duration}{" "}
              minutes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "Add Question"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? "Edit Question" : "Add New Question"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleQuestionChange}
                  rows="3"
                  required
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="form-group">
                <label>Marks *</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleQuestionChange}
                  min="1"
                  required
                />
              </div>

              <div className="options-section">
                <label>Options (Mark one as correct) *</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) =>
                        handleOptionChange(index, "optionText", e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="option-input"
                    />
                    <label className="correct-label">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                      />
                      Correct
                    </label>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="btn-add-option"
                >
                  + Add Option
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <h3>Questions ({questions.length})</h3>
          {questions.length > 0 ? (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question._id} className="question-card">
                  <div className="question-header">
                    <h4>Question {index + 1}</h4>
                    <div className="question-actions">
                      <span className="marks-badge">
                        {question.marks} marks
                      </span>
                      <button
                        onClick={() => handleEdit(question)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="question-text">{question.questionText}</p>
                  <div className="options-display">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="option-display">
                        <span className="option-label">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option.optionText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">
              No questions added yet. Click "Add Question" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionManagement;
