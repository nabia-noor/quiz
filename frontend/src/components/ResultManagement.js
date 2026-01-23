import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resultAPI, quizAPI, classAPI } from "../api";
import "./ResultManagement.css";

function ResultManagement() {
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [submittedUsers, setSubmittedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
    fetchQuizzes();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const filtered = quizzes.filter(
        (quiz) => quiz.classId?.name === selectedClass,
      );
      setFilteredQuizzes(filtered);
      setSelectedQuiz("");
      setSubmittedUsers([]);
    } else {
      setFilteredQuizzes([]);
      setSelectedQuiz("");
      setSubmittedUsers([]);
    }
  }, [selectedClass, quizzes]);

  useEffect(() => {
    if (selectedQuiz) {
      const usersForQuiz = results.filter(
        (r) => r.quizId && r.quizId._id === selectedQuiz,
      );
      setSubmittedUsers(usersForQuiz);
    } else {
      setSubmittedUsers([]);
    }
  }, [selectedQuiz, results]);

  const fetchResults = async () => {
    try {
      const result = await resultAPI.getAll();
      if (result.success) {
        setResults(result.results);
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

  const fetchClasses = async () => {
    try {
      const result = await classAPI.getAll();
      if (result.success) {
        setClasses(result.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
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

  const getUniqueClassNames = () => {
    const classNames = ["BS", "MS", "PhD"];
    return classNames.filter((className) =>
      classes.some((cls) => cls.name === className),
    );
  };

  const filteredClassNames = getUniqueClassNames().filter((className) =>
    className.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        </div>

        <div className="filter-section" style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", marginRight: "10px" }}>
              Search Classes:
            </label>
            <input
              type="text"
              placeholder="Search BS, MS, PhD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "300px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", marginRight: "10px" }}>
              Select Class:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="quiz-filter"
              style={{ padding: "8px 12px", minWidth: "200px" }}
            >
              <option value="">-- Select a Class --</option>
              {filteredClassNames.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && filteredQuizzes.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold", marginRight: "10px" }}>
                Select Quiz:
              </label>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="quiz-filter"
                style={{ padding: "8px 12px", minWidth: "300px" }}
              >
                <option value="">-- Select a Quiz --</option>
                {filteredQuizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedClass && filteredQuizzes.length === 0 && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No quizzes found for {selectedClass} class.
            </p>
          )}
        </div>

        {selectedQuiz && submittedUsers.length > 0 && (
          <div className="table-container">
            <h3 style={{ marginBottom: "15px" }}>
              Students Who Submitted This Quiz ({submittedUsers.length})
            </h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Marks</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedUsers.map((result) => (
                  <tr key={result._id}>
                    <td>{result.userId?.name || "N/A"}</td>
                    <td>{result.userId?.email || "N/A"}</td>
                    <td>
                      {result.obtainedMarks}
                      {result.manualReviewPending ? " (pending)" : ""}
                    </td>
                    <td>{result.totalMarks}</td>
                    <td>
                      {result.manualReviewPending
                        ? "Pending"
                        : `${result.percentage.toFixed(2)}%`}
                    </td>
                    <td>
                      <span
                        className={`status ${
                          result.manualReviewPending
                            ? "pending"
                            : result.isPassed
                              ? "passed"
                              : "failed"
                        }`}
                      >
                        {result.manualReviewPending
                          ? "Pending"
                          : result.isPassed
                            ? "Passed"
                            : "Failed"}
                      </span>
                    </td>
                    <td>{new Date(result.submittedAt).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(result._id)}
                        className="btn-view"
                      >
                        {result.manualReviewPending
                          ? "Review Submission"
                          : "View Result"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedQuiz && submittedUsers.length === 0 && (
          <p className="no-data">No students have submitted this quiz yet.</p>
        )}

        {!selectedClass && (
          <p className="no-data">
            Please select a class to view quizzes and results.
          </p>
        )}
      </div>
    </div>
  );
}

export default ResultManagement;
