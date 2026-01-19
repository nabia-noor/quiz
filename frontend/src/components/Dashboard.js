import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizAPI, classAPI, resultAPI } from "../api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalClasses: 0,
    totalResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  const classOptions = ["BS", "MS", "PhD"];
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  useEffect(() => {
    fetchClasses();
    fetchAdminStats();
  }, [selectedClass, selectedYear]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      if (response.success) {
        setClasses(response.classes.filter((c) => c.isActive));
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const [quizzesRes, classesRes, resultsRes] = await Promise.all([
        quizAPI.getAll(),
        classAPI.getAll(),
        resultAPI.getAll(),
      ]);

      let filteredQuizzes = quizzesRes.quizzes || [];
      let resultsList = resultsRes.results || [];

      // Filter by selected class and year if available
      if (selectedClass && selectedYear) {
        const classData = classes.find((c) => c.name === selectedClass && c.semester === selectedYear);
        if (classData) {
          filteredQuizzes = filteredQuizzes.filter(
            (q) => q.classId._id === classData._id
          );

          const allowedQuizIds = new Set(filteredQuizzes.map((q) => q._id));
          resultsList = resultsList.filter((r) => allowedQuizIds.has(r.quizId?._id || r.quizId));
        }
      }

      setStats({
        totalQuizzes: filteredQuizzes.length,
        activeQuizzes: filteredQuizzes.filter((q) => q.isActive).length,
        totalClasses: classesRes.classes ? classesRes.classes.length : 0,
        totalResults: resultsList.length,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>📊 Quiz Admin Panel</h1>
          <p className="admin-name">Admin: {adminData.email || "Admin"}</p>
        </div>
        <div className="nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/classes">Classes</Link>
          <Link to="/admin/quizzes">Quizzes</Link>
          <Link to="/admin/questions">Questions</Link>
          <Link to="/admin/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-top">
            <div>
              <h2>Welcome Back, Admin! 👋</h2>
              <p>Manage your quiz system and track student performance</p>
            </div>
            <div className="admin-profile">
              <span>👤 {adminData.email || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h3>📊 Filter Statistics by Class</h3>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Program</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="filter-select"
              >
                <option value="">All Programs</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedClass}
                className="filter-select"
              >
                <option value="">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {selectedClass && selectedYear && (
              <button
                className="btn-clear-filter"
                onClick={() => {
                  setSelectedClass("");
                  setSelectedYear("");
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-number">{stats.totalQuizzes}</div>
                <p className="stat-label">Total Quizzes</p>
                <p className="stat-sub">{stats.activeQuizzes} Active</p>
                <Link to="/admin/quizzes" className="stat-link">
                  Manage →
                </Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏫</div>
                <div className="stat-number">{stats.totalClasses}</div>
                <p className="stat-label">Classes</p>
                <p className="stat-sub">Semesters & Courses</p>
                <Link to="/admin/classes" className="stat-link">
                  Manage →
                </Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-number">{stats.totalResults}</div>
                <p className="stat-label">Results</p>
                <p className="stat-sub">Student Performance</p>
                <Link to="/admin/results" className="stat-link">
                  View →
                </Link>
              </div>
            </div>

            <div className="admin-info">
              <h3>Admin Features</h3>
              <div className="features-list">
                <div className="feature-item">
                  <h4>📋 Quiz Management</h4>
                  <p>
                    Create, edit, and delete quizzes with start date, expiry
                    date, marks, and passing criteria
                  </p>
                </div>
                <div className="feature-item">
                  <h4>🏫 Class Management</h4>
                  <p>Manage classes, semesters, and course organization</p>
                </div>
                <div className="feature-item">
                  <h4>❓ Question Management</h4>
                  <p>Add, edit, and organize quiz questions</p>
                </div>
                <div className="feature-item">
                  <h4>📊 Results Tracking</h4>
                  <p>
                    View student performance, scores, and detailed result
                    analytics
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
