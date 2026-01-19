import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizAPI, classAPI } from "../api";
import "./QuizManagement.css";

function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    expiryDate: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchClasses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const result = await quizAPI.getAll();
      if (result.success) {
        // Filter to show only upcoming quizzes
        const now = new Date();
        const upcomingQuizzes = result.quizzes.filter((quiz) => {
          const startDate = new Date(quiz.startDate);
          return startDate > now;
        });
        setQuizzes(upcomingQuizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await classAPI.getAll();
      if (result.success) {
        setClasses(result.classes.filter((c) => c.isActive));
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (editingId) {
        result = await quizAPI.update(editingId, formData);
      } else {
        result = await quizAPI.create(formData);
      }

      if (result.success) {
        fetchQuizzes();
        resetForm();
      } else {
        alert(result.message || "Operation failed");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEdit = (quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      classId: quiz.classId._id,
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      startDate: quiz.startDate.split("T")[0],
      expiryDate: quiz.expiryDate.split("T")[0],
      isActive: quiz.isActive,
    });
    setEditingId(quiz._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will delete all questions associated with this quiz."
      )
    ) {
      try {
        const result = await quizAPI.delete(id);
        if (result.success) {
          fetchQuizzes();
        } else {
          alert(result.message || "Delete failed");
        }
      } catch (error) {
        alert("An error occurred");
      }
    }
  };

  const handleManageQuestions = (quizId) => {
    navigate(`/admin/quizzes/${quizId}/questions`);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      classId: "",
      duration: 30,
      totalMarks: 100,
      passingMarks: 40,
      startDate: "",
      expiryDate: "",
      isActive: true,
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
          <h2>Quiz Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "Create New Quiz"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? "Edit Quiz" : "Create New Quiz"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Quiz Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Passing Marks *</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active
                </label>
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
          {quizzes.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Class</th>
                  <th>Duration</th>
                  <th>Marks</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>{quiz.title}</td>
                    <td>
                      {quiz.classId?.name} - {quiz.classId?.semester}
                    </td>
                    <td>{quiz.duration} min</td>
                    <td>{quiz.totalMarks}</td>
                    <td>{new Date(quiz.startDate).toLocaleDateString()}</td>
                    <td>{new Date(quiz.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`status ${
                          quiz.isActive ? "active" : "inactive"
                        }`}
                      >
                        {quiz.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleManageQuestions(quiz._id)}
                        className="btn-manage"
                      >
                        Questions
                      </button>
                      <button
                        onClick={() => handleEdit(quiz)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No quizzes created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizManagement;
