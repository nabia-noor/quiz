import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizAPI, classAPI, courseAPI } from "../api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalClasses: 0,
  });

  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const quizzes = await quizAPI.getAll();
      const classes = await classAPI.getAll();
      const courses = await courseAPI.getAll();

      setStats({
        totalQuizzes: quizzes?.quizzes?.length || 0,
        activeQuizzes: quizzes?.quizzes?.filter((q) => q.isActive)?.length || 0,
        totalClasses: classes?.classes?.length || 0,
      });

      setCoursesCount(courses?.courses?.length || 0);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
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
        <h1>Quiz Admin Panel</h1>

        <div className="nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/classes">Classes</Link>
          <Link to="/admin/courses">Courses</Link>
          <Link to="/admin/quizzes">Quizzes</Link>
          <Link to="/admin/results">Results</Link>

          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Welcome Back, Admin 👋</h2>
        <div className="admin-profile">👤 {adminData.email || "Admin"}</div>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-number">{stats.totalQuizzes}</div>
              <p>Total Quizzes</p>
              <Link to="/admin/quizzes">Manage →</Link>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏫</div>
              <div className="stat-number">{stats.totalClasses}</div>
              <p>Classes</p>
              <Link to="/admin/classes">Manage →</Link>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-number">{coursesCount}</div>
              <p>Courses</p>
              <Link to="/admin/courses">Manage →</Link>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-number">—</div>
              <p>Teachers</p>
              <Link to="/admin/teachers">Manage →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
