import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { teacherAPI } from "../api";
import "./TeacherBatchCourses.css";

function TeacherBatchCourses() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchCourses = async () => {
    try {
      const response = await teacherAPI.getCoursesForBatch(classId);
      if (response.success) {
        setCourses(response.courses || []);
      } else {
        setError(response.message || "Failed to fetch courses");
      }
    } catch (err) {
      setError("Error fetching courses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    teacherAPI.logout();
    navigate("/teacher/login");
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="teacher-batch-courses-container">
      <nav className="teacher-batch-nav">
        <div className="nav-brand">
          <h1>📖 Assigned Courses</h1>
          <p className="teacher-name">Teacher: {teacherData.name || "Teacher"}</p>
        </div>
        <div className="nav-links">
          <Link to="/teacher/dashboard">Dashboard</Link>
          <Link to="/teacher/create-quiz">Create Quiz</Link>
          <Link to="/teacher/results">Results</Link>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="courses-content">
        {error && <div className="alert alert-error">{error}</div>}

        {courses.length === 0 ? (
          <div className="no-courses">No courses assigned for this batch.</div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <h3 className="course-title">{course.title}</h3>
                <div className="course-meta">
                  <span>Duration: {course.duration} min</span>
                  <span>Total: {course.totalMarks}</span>
                  <span>Pass: {course.passingMarks}</span>
                </div>
                <div className="course-dates">
                  <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>
                  <span>Expiry: {new Date(course.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="course-actions">
                  <Link to={`/teacher/quiz/${course._id}`} className="btn-primary">Edit Quiz</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherBatchCourses;
