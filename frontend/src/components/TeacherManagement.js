import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { teacherAPI } from "../api";
import "./TeacherManagement.css";

function TeacherManagement() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teacherAPI.getAll();
      if (response.success) {
        setTeachers(response.teachers);
      } else {
        setError("Failed to fetch teachers");
      }
    } catch (err) {
      setError("Error fetching teachers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.contactNumber || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await teacherAPI.create({
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
      });

      if (response.success) {
        setSuccess("Teacher created successfully!");
        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          password: "",
        });
        setShowAddForm(false);
        fetchTeachers();
      } else {
        setError(response.message || "Failed to create teacher");
      }
    } catch (err) {
      setError("Error creating teacher: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const response = await teacherAPI.delete(id);
        if (response.success) {
          setSuccess("Teacher deleted successfully");
          fetchTeachers();
        } else {
          setError(response.message || "Failed to delete teacher");
        }
      } catch (err) {
        setError("Error deleting teacher: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="loading">Loading teachers...</div>;
  }

  return (
    <div className="teacher-management-container">
      <nav className="teacher-nav">
        <div className="nav-brand">
          <h1>👨‍🏫 Teacher Management</h1>
          <p className="admin-name">Admin: {adminData.email || "Admin"}</p>
        </div>
        <div className="nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/teachers">Teachers</Link>
          <Link to="/admin/classes">Classes</Link>
          <Link to="/admin/quizzes">Quizzes</Link>
          <Link to="/admin/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="teacher-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="teacher-header">
          <h2>Teachers List</h2>
          <button
            className="btn-add-teacher"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "+ Add New Teacher"}
          </button>
        </div>

        {showAddForm && (
          <div className="add-teacher-form">
            <h3>Create New Teacher</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Teacher Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter teacher name"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
              </div>

              <button type="submit" className="btn-submit">
                Create Teacher
              </button>
            </form>
          </div>
        )}

        <div className="teachers-table">
          {teachers.length === 0 ? (
            <p className="no-data">No teachers found. Click "Add New Teacher" to create one.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.contactNumber}</td>
                    <td>
                      <span className={`status ${teacher.isActive ? "active" : "inactive"}`}>
                        {teacher.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <Link
                        to={`/admin/teacher/${teacher._id}`}
                        className="btn-view"
                      >
                        View Profile
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(teacher._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherManagement;
