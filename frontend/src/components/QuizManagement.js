import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizAPI, classAPI } from "../api";
import "./QuizManagement.css";

function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  // ...existing code...
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchClasses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const result = await quizAPI.getAll();
      if (result.success) {
        setQuizzes(result.quizzes);
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

  // ...existing code...

  // ...existing code...

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will delete all questions associated with this quiz.",
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

  // ...existing code...

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
        </div>
        {/* Admin can only view quizzes. No create/edit form. */}

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
