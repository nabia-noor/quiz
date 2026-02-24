import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { teacherAPI, teacherQuizAPI } from "../api";
import "./TeacherCreateQuiz.css";

function TeacherCreateQuiz() {
  const navigate = useNavigate();

  const [assignedBatches, setAssignedBatches] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);

  const [formData, setFormData] = useState({
    classId: "",
    courseId: "",
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    expiryDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);

  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, publish = false) => {
    if (e) e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.classId ||
      !formData.courseId ||
      !formData.startDate ||
      !formData.expiryDate ||
      !formData.duration ||
      !formData.totalMarks ||
      !formData.passingMarks
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.expiryDate)) {
      setError("Start date must be before expiry date");
      return;
    }

    try {
      setSubmitting(true);

      const response = await teacherQuizAPI.create({
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        courseId: formData.courseId,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        isActive: publish,
      });

      if (response.success) {
        setSuccess(
          publish
            ? "Quiz published successfully!"
            : "Quiz saved as draft successfully!",
        );

        if (!publish) {
          setShowAddQuestions(true);
          setCreatedQuizId(response.quiz?._id || response.quizId);
        } else {
          setTimeout(() => {
            navigate("/teacher/dashboard");
          }, 1500);
        }
      } else {
        setError(response.message || "Failed to create quiz");
      }
    } catch (err) {
      setError("Error creating quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    teacherAPI.logout();
    navigate("/teacher/login");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (assignedBatches.length === 0) {
    return (
      <div className="teacher-create-quiz-container">
        <nav className="create-quiz-nav">
          <div className="nav-brand">
            <h1>📝 Create Quiz</h1>
            <p className="teacher-name">
              Teacher: {teacherData.name || "Teacher"}
            </p>
          </div>

          <div className="nav-links">
            <Link to="/teacher/dashboard">Dashboard</Link>
            <Link to="/teacher/results">Results</Link>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </nav>

        <div className="content">
          <div className="error-box">
            <p>No assigned batches found. Please contact admin.</p>
            <Link to="/teacher/dashboard" className="btn-back">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-create-quiz-container">
      <nav className="create-quiz-nav">
        <div className="nav-brand">
          <h1>📝 Create Quiz</h1>
          <p className="teacher-name">
            Teacher: {teacherData.name || "Teacher"}
          </p>
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
      <div className="create-quiz-content">
        <div className="form-container">
          <h2>Create New Quiz</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={(e) => handleSubmit(e, false)} className="quiz-form">
            <div className="form-section">
              <h3>Batch & Course</h3>
              <div className="form-group">
                <label>Select Assigned Batch *</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {assignedBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.semester}
                    </option>
                  ))}
                </select>
              </div>
              {formData.classId && assignedCourses.length > 0 && (
                <div className="form-group">
                  <label>Select Assigned Course *</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {assignedCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Quiz Settings</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes) *</label>

                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="5"
                    max="300"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Marks *</label>

                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Passing Marks *</label>

                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Schedule</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time *</label>

                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date & Time *</label>

                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, true)}
              >
                {submitting ? "Publishing..." : "Publish Now"}
              </button>

              <Link to="/teacher/dashboard" className="btn-cancel">
                Cancel
              </Link>
            </div>

            {showAddQuestions && (
              <div className="add-questions-section">
                <button
                  className="btn-add-questions"
                  onClick={() => {
                    if (createdQuizId) {
                      navigate(`/teacher/quiz/${createdQuizId}/add-questions`);
                    }
                  }}
                >
                  Add Questions
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherCreateQuiz;
