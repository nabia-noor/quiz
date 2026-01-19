import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { classAPI } from "../api";
import "./ClassManagement.css";

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    semester: "",
    description: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

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
        result = await classAPI.update(editingId, formData);
      } else {
        result = await classAPI.create(formData);
      }

      if (result.success) {
        fetchClasses();
        resetForm();
      } else {
        alert(result.message || "Operation failed");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEdit = (classData) => {
    setFormData({
      name: classData.name,
      semester: classData.semester,
      description: classData.description || "",
      isActive: classData.isActive,
    });
    setEditingId(classData._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        const result = await classAPI.delete(id);
        if (result.success) {
          fetchClasses();
        } else {
          alert(result.message || "Delete failed");
        }
      } catch (error) {
        alert("An error occurred");
      }
    }
  };

  const handleToggleStatus = async (cls) => {
    try {
      const payload = {
        name: cls.name,
        semester: cls.semester,
        description: cls.description,
        isActive: !cls.isActive,
      };
      const result = await classAPI.update(cls._id, payload);
      if (result.success) {
        fetchClasses();
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      alert("An error occurred while updating status");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", semester: "", description: "", isActive: true });
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
          <h2>Classes / Semesters Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "Add New Class"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h3>{editingId ? "Edit Class" : "Add New Class"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Class Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Fall 2024"
                  />
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
          {classes.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Semester</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls._id}>
                    <td>{cls.name}</td>
                    <td>{cls.semester}</td>
                    <td>{cls.description || "-"}</td>
                    <td>
                      <span
                        className={`status ${
                          cls.isActive ? "active" : "inactive"
                        }`}
                      >
                        {cls.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(cls)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cls)}
                        className={`btn-toggle ${cls.isActive ? "disable" : "enable"}`}
                      >
                        {cls.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
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
            <p className="no-data">No classes created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassManagement;
