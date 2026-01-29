import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { teacherAPI } from "../api";
import "./TeacherLogin.css";

function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await teacherAPI.login({ email, password });

      if (response.success) {
        // Store teacher data in localStorage
        localStorage.setItem("teacherToken", response.token);
        localStorage.setItem("teacherId", response.teacher.id);
        localStorage.setItem("teacherName", response.teacher.name);
        localStorage.setItem("teacherEmail", response.teacher.email);
        localStorage.setItem("teacherData", JSON.stringify(response.teacher));

        // Redirect to teacher dashboard
        navigate("/teacher/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError("Login error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>👨‍🏫 Teacher Login</h1>
          <p>Welcome to the Quiz Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Are you a student?{" "}
            <Link to="/user/login" className="link">
              Student Login
            </Link>
          </p>
          <p>
            Are you an admin?{" "}
            <Link to="/admin/login" className="link">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;
