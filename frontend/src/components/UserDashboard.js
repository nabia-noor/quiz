import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name || "User");

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("userToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.log("No token or userId found");
          setLoading(false);
          return;
        }

        console.log("Fetching stats for userId:", userId);

        const response = await axios.get(
          `http://localhost:4000/api/result/user-stats/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Stats response:", response.data);

        if (response.data && response.data.success) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/user/login");
  };

  console.log("Rendering UserDashboard", { userName, loading, stats });

  return (
    <div
      className="dashboard-container"
      style={{ minHeight: "100vh", background: "#f5f5f5" }}
    >
      {/* Header */}
      <header className="user-dashboard-header">
        <div className="header-left">
          <h1>📚 Quiz Application</h1>
          <p>Welcome, <strong>{userName}</strong>!</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="nav-menu">
            <button
              className="nav-item active"
              onClick={() => navigate("/user/dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/user/quizzes")}
            >
              📝 Available Quizzes
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/user/results")}
            >
              📈 My Results
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <section className="dashboard-section">
          <h2>Dashboard Overview</h2>

          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Total Quizzes</h3>
                  <p className="stat-value">{stats.totalQuizzes || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Completed Quizzes</h3>
                  <p className="stat-value">{stats.completedQuizzes || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Average Score</h3>
                  <p className="stat-value">
                    {(stats.averageScore || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="action-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button
                className="action-btn primary"
                onClick={() => navigate("/user/quizzes")}
              >
                🚀 Start New Quiz
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate("/user/results")}
              >
                📊 View Results
              </button>
            </div>
          </div>

          <div className="info-section">
            <h3>Instructions</h3>
            <ul>
              <li>Click "Available Quizzes" to see all available quizzes</li>
              <li>
                You can only attempt quizzes that are open and not expired
              </li>
              <li>Results are shown immediately after submission</li>
              <li>Each question has equal weightage unless specified</li>
              <li>You can view all your results in "My Results" section</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
