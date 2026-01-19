import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import axios from "axios";

const UserLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    program: "",
  });

  const programOptions = ["BS", "MS", "PhD"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin && !formData.program) {
        setError("Please select a program");
        setLoading(false);
        return;
      }

      const endpoint = isLogin
        ? "http://localhost:4000/api/user/login"
        : "http://localhost:4000/api/user/register";

      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userProgram", formData.program);

        navigate("/user/dashboard");
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-container">
      <div className="user-login-card">
        <h1>Quiz Application</h1>
        <h2>{isLogin ? "User Login" : "Register"}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="program">Class (Program) *</label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required={isLogin}
            >
              <option value="">Select Class</option>
              {programOptions.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="toggle-section">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ name: "", email: "", password: "", program: "" });
              }}
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>
        </div>

        <div className="admin-link">
          <p>
            Are you an admin?{" "}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => navigate("/admin/login")}
            >
              Admin Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
