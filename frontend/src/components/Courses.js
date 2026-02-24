import React, { useEffect, useState } from "react";
import { courseAPI } from "../api";
import "./ClassManagement.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    creditHours: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const result = await courseAPI.getAll();
    if (result.success) setCourses(result.courses);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!formData.name || !formData.code || !formData.creditHours) {
      setError("All fields are required.");
      return false;
    }
    if (!/^[A-Z]{2,4}\d{3}$/.test(formData.code)) {
      setError("Course code must be in format e.g. CS101, IT202.");
      return false;
    }
    if (
      isNaN(formData.creditHours) ||
      Number(formData.creditHours) < 1 ||
      Number(formData.creditHours) > 6
    ) {
      setError("Credit hours must be a number between 1 and 6.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await courseAPI.create({
      name: formData.name,
      code: formData.code,
      creditHours: Number(formData.creditHours),
    });
    if (result.success) {
      fetchCourses();
      setFormData({ name: "", code: "", creditHours: "" });
      setShowForm(false);
      setError("");
    } else {
      setError(result.message || "Operation failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="page-header">
          <h2>Courses Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "Add New Course"}
          </button>
        </div>
        {showForm && (
          <div className="form-container">
            <h3>Add New Course</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="form-group">
                  <label>Credit Hours *</label>
                  <input
                    type="number"
                    name="creditHours"
                    value={formData.creditHours}
                    onChange={handleChange}
                    required
                    min={1}
                    max={6}
                  />
                </div>
              </div>
              {error && (
                <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", code: "", creditHours: "" });
                    setError("");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="table-container">
          {courses.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Credit Hours</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.creditHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No courses created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;
