import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { questionAPI, quizAPI, classAPI } from "../api";
import "./QuestionManagement.css";

function QuestionManagement() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(quizId || "");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    questionType: "mcq",
    questionText: "",
    classId: "",
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
    fetchQuizzes();
    fetchClasses();
  }, []);

  useEffect(() => {
    setSelectedQuizId(quizId || "");
  }, [quizId]);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuiz(selectedQuizId);
      fetchQuestions(selectedQuizId);
    } else {
      setQuiz(null);
      setQuestions([]);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    if (quiz?.classId && !formData.classId) {
      setFormData((prev) => ({
        ...prev,
        classId: quiz.classId._id || quiz.classId,
      }));
    }
  }, [quiz, formData.classId]);

  const classOptions =
    classes && classes.length
      ? classes
      : [
          { _id: "bs-placeholder", name: "BS", semester: "", disabled: true },
          { _id: "ms-placeholder", name: "MS", semester: "", disabled: true },
          { _id: "phd-placeholder", name: "PhD", semester: "", disabled: true },
        ];

  const fetchQuizzes = async () => {
    try {
      const result = await quizAPI.getAll();
      if (result.success) {
        setQuizzes(result.quizzes || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await classAPI.getAll();
      if (result.success) {
        setClasses(result.classes || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchQuiz = async (id) => {
    if (!id) return;
    try {
      const result = await quizAPI.getById(id);
      if (result.success) {
        setQuiz(result.quiz);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

  const fetchQuestions = async (id) => {
    if (!id) return;
    try {
      const result = await questionAPI.getByQuiz(id);
      if (result.success) {
        setQuestions(result.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleQuestionChange = (e) => {
    if (e.target.name === "questionType") {
      setFormData((prev) => ({
        ...prev,
        questionType: e.target.value,
        options:
          e.target.value === "mcq"
            ? prev.options.map((opt) => ({ ...opt, isCorrect: false }))
            : [],
      }));
      return;
    }

    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;

    // If marking an option as correct, unmark others
    if (formData.questionType === "mcq" && field === "isCorrect" && value) {
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

  const getTotalAllocatedMarks = () => {
    return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  };

  const getAvailableMarks = () => {
    if (!quiz) return 0;
    return Math.max(0, quiz.totalMarks - getTotalAllocatedMarks());
  };

  const isMarksCompleted = () => {
    if (!quiz) return false;
    return getTotalAllocatedMarks() >= quiz.totalMarks;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      alert("Please enter question text");
      return;
    }

    const quizIdToUse = selectedQuizId || quizId;

    if (!quizIdToUse) {
      alert("Please select a quiz");
      return;
    }

    // Check if marks are already completed (only for new questions, not editing)
    if (!editingId && isMarksCompleted()) {
      alert(
        "Cannot add more questions. Total marks have been completed.",
      );
      return;
    }

    // Check if the new question's marks would exceed available marks
    if (!editingId && Number(formData.marks) > getAvailableMarks()) {
      alert(
        `Cannot add this question. Only ${getAvailableMarks()} marks available. This question requires ${formData.marks} marks.`,
      );
      return;
    }

    const validOptions = formData.options.filter((opt) =>
      opt.optionText.trim(),
    );

    if (formData.questionType === "mcq") {
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options for MCQ");
        return;
      }

      const hasCorrectAnswer = validOptions.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        alert("Please mark one option as correct");
        return;
      }
    }

    try {
      const dataToSubmit = {
        quizId: quizIdToUse,
        questionType: formData.questionType,
        questionText: formData.questionText,
        classId: formData.classId || undefined,
        options: formData.questionType === "mcq" ? validOptions : [],
        marks: Number(formData.marks),
      };

      let result;
      if (editingId) {
        result = await questionAPI.update(editingId, dataToSubmit);
      } else {
        result = await questionAPI.create(dataToSubmit);
      }

      if (result.success) {
        fetchQuestions(quizIdToUse);
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
      questionType: question.questionType || "mcq",
      questionText: question.questionText,
      classId: question.classId?._id || question.classId || "",
      options:
        (question.questionType || "mcq") === "mcq" &&
        question.options.length > 0
          ? question.options
          : [],
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
          fetchQuestions(selectedQuizId);
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
      questionType: "mcq",
      questionText: "",
      classId: "",
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
            <h2>
              Manage Questions
              {quiz?.title ? `: ${quiz.title}` : ""}
            </h2>
            {selectedQuizId ? (
              <p className="quiz-info">
                Total Marks: {quiz?.totalMarks ?? "-"} | Duration:{" "}
                {quiz?.duration ?? "-"} minutes
              </p>
            ) : (
              <p className="quiz-info">
                Select a quiz to start adding questions.
              </p>
            )}

            {selectedQuizId && quiz && (
              <div className="marks-allocation" style={{ marginTop: "10px" }}>
                <div className="marks-info">
                  <span>
                    <strong>Allocated Marks:</strong> {getTotalAllocatedMarks()}/
                    {quiz.totalMarks}
                  </span>
                  <span style={{ marginLeft: "20px" }}>
                    <strong>Available Marks:</strong> {getAvailableMarks()}
                  </span>
                </div>
                {isMarksCompleted() && (
                  <div className="marks-completed-message">
                    ✓ You cannot add more questions. Total marks have been
                    completed.
                  </div>
                )}
              </div>
            )}

            <div className="quiz-selector" style={{ marginTop: "10px" }}>
              <label>Select Quiz: </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
              >
                <option value="">-- Choose a quiz --</option>
                {quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            disabled={isMarksCompleted() && !editingId && !showForm}
            title={
              isMarksCompleted() && !editingId && !showForm
                ? "Cannot add questions - total marks completed"
                : ""
            }
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
                <label>Question Type *</label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleQuestionChange}
                  required
                >
                  <option value="mcq">Multiple Choice (auto-graded)</option>
                  <option value="text">Typed (manual marking)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class (BS / MS / PhD)</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleQuestionChange}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((cls) => (
                      <option
                        key={cls._id}
                        value={cls._id}
                        disabled={cls.disabled}
                      >
                        {cls.name}
                        {cls.semester ? ` - ${cls.semester}` : ""}
                        {cls.disabled ? " (add in Classes page)" : ""}
                      </option>
                    ))}
                  </select>
                  {!classes.length && (
                    <p className="helper-text">
                      Add BS, MS, or PhD classes in the Classes/Semesters page
                      to enable selection.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Marks *</label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleQuestionChange}
                    min="1"
                    max={editingId ? undefined : getAvailableMarks()}
                    required
                  />
                  {!editingId && quiz && getAvailableMarks() < quiz.totalMarks && (
                    <p className="helper-text">
                      Available marks: {getAvailableMarks()} / {quiz.totalMarks}
                    </p>
                  )}
                </div>
              </div>

              <div className="options-section">
                {formData.questionType === "mcq" ? (
                  <>
                    <label>Options (Mark one as correct) *</label>
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-row">
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              "optionText",
                              e.target.value,
                            )
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
                                e.target.checked,
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
                  </>
                ) : (
                  <div className="typed-note">
                    Typed questions are manually graded. No options or correct
                    answers are required.
                  </div>
                )}
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
          <div className="questions-header">
            <h3>Questions ({questions.length})</h3>
            <button
              onClick={() => fetchQuestions(selectedQuizId)}
              className="btn-refresh"
            >
              🔄 Refresh
            </button>
          </div>
          {questions.length > 0 ? (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question._id} className="question-card">
                  <div className="question-header">
                    <h4>Question {index + 1}</h4>
                    <div className="question-actions">
                      <span
                        className={`type-badge ${
                          (question.questionType || "mcq") === "text"
                            ? "typed"
                            : "mcq"
                        }`}
                      >
                        {(question.questionType || "mcq") === "text"
                          ? "Typed"
                          : "MCQ"}
                      </span>
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
                  {(question.options || []).length > 0 ? (
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
                  ) : (
                    <div className="options-display muted-text">
                      Typed response question (no options).
                    </div>
                  )}
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
