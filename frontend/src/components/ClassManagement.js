import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { classAPI } from "../api";
import "./ClassManagement.css";

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    degree: "",
    program: "",
    session: "",
    semester: "",
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

    if (
      !formData.degree ||
      !formData.program ||
      !formData.session ||
      !formData.semester
    ) {
      alert("All fields are required");
      return;
    }

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
      }
    } catch (error) {
      alert("Error occurred");
    }
  };

  const handleEdit = (classData) => {
    setFormData({
      degree: classData.degree || "",
      program: classData.program || "",
      session: classData.session || "",
      semester: classData.semester || "",
      isActive: classData.isActive,
    });
    setEditingId(classData._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this class?")) {
      const result = await classAPI.delete(id);
      if (result.success) {
        fetchClasses();
      }
    }
  };

  const handleToggleStatus = async (cls) => {
    const payload = {
      degree: cls.degree,
      program: cls.program,
      session: cls.session,
      semester: cls.semester,
      isActive: !cls.isActive,
    };

    const result = await classAPI.update(cls._id, payload);

    if (result.success) {
      fetchClasses();
    }
  };

  const resetForm = () => {
    setFormData({
      degree: "",
      program: "",
      session: "",
      semester: "",
      isActive: true,
    });
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
                  <label>Degree</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="BS">BS</option>
                    <option value="MS">MS</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Program</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="IT">IT</option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Session</label>
                  <select
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                  </select>
                </div>
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
                  <th>Degree</th>
                  <th>Program</th>
                  <th>Session</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {classes.map((cls) => (
                  <tr key={cls._id}>
                    <td>{cls.degree}</td>
                    <td>{cls.program}</td>
                    <td>{cls.session}</td>
                    <td>{cls.semester}</td>

                    <td>{cls.isActive ? "Active" : "Inactive"}</td>

                    <td>
                      <button onClick={() => handleEdit(cls)}>Edit</button>
                      <button onClick={() => handleToggleStatus(cls)}>
                        Toggle
                      </button>
                      <button onClick={() => handleDelete(cls._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No classes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassManagement;
