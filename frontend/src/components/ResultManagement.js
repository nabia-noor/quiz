import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resultAPI, quizAPI } from "../api";
import "./ResultManagement.css";

function ResultManagement() {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      setFilteredResults(results.filter((r) => r.quizId._id === selectedQuiz));
    } else {
      setFilteredResults(results);
    }
  }, [selectedQuiz, results]);

  const fetchResults = async () => {
    try {
      const result = await resultAPI.getAll();
      if (result.success) {
        setResults(result.results);
        setFilteredResults(result.results);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        const result = await resultAPI.delete(id);
        if (result.success) {
          fetchResults();
        } else {
          alert(result.message || "Delete failed");
        }
      } catch (error) {
        alert("An error occurred");
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/results/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  const getStats = () => {
    const total = filteredResults.length;
    const passed = filteredResults.filter((r) => r.isPassed).length;
    const failed = total - passed;
    const avgPercentage =
      total > 0
        ? (
            filteredResults.reduce((sum, r) => sum + r.percentage, 0) / total
          ).toFixed(2)
        : 0;

    return { total, passed, failed, avgPercentage };
  };

  const stats = getStats();

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
          <h2>Quiz Results</h2>
          <div className="filter-section">
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="quiz-filter"
            >
              <option value="">All Quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Submissions</p>
          </div>
          <div className="stat-card">
            <h3>{stats.passed}</h3>
            <p>Passed</p>
          </div>
          <div className="stat-card">
            <h3>{stats.failed}</h3>
            <p>Failed</p>
          </div>
          <div className="stat-card">
            <h3>{stats.avgPercentage}%</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="table-container">
          {filteredResults.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result._id}>
                    <td>
                      <div>
                        <div>{result.userId?.name || "N/A"}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {result.userId?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>{result.quizId?.title || "N/A"}</td>
                    <td>{result.obtainedMarks}</td>
                    <td>{result.totalMarks}</td>
                    <td>{result.percentage.toFixed(2)}%</td>
                    <td>
                      <span
                        className={`status ${
                          result.isPassed ? "passed" : "failed"
                        }`}
                      >
                        {result.isPassed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td>{new Date(result.submittedAt).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(result._id)}
                        className="btn-view"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(result._id)}
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
            <p className="no-data">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultManagement;
