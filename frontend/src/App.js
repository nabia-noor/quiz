// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Admin Components
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import ClassManagement from "./components/ClassManagement";
import QuizManagement from "./components/QuizManagement";
import QuestionManagement from "./components/QuestionManagement";
import Courses from "./components/Courses";
import TeacherManagement from "./components/TeacherManagement";
import TeacherProfile from "./components/TeacherProfile";

// User Components
import UserLogin from "./components/UserLogin";
import UserDashboard from "./components/UserDashboard";
import QuizList from "./components/QuizList";
import QuizAttempt from "./components/QuizAttempt";
import UserResults from "./components/UserResults";
import UserQuestions from "./components/UserQuestions";

// Teacher Components
import TeacherLogin from "./components/TeacherLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherCreateQuiz from "./components/TeacherCreateQuiz";
import TeacherResults from "./components/TeacherResults";
import TeacherBatchCourses from "./components/TeacherBatchCourses";
import TeacherQuizManagement from "./components/TeacherQuizManagement";
import TeacherQuizAttempts from "./components/TeacherQuizAttempts";
import TeacherMarkQuiz from "./components/TeacherMarkQuiz";

import "./App.css";

// ------------------------ Protected Route Components ------------------------
function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  if (!adminToken) return <Navigate to="/admin/login" replace />;

  // Clear other roles
  if (userToken) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  }

  return children;
}

function UserProtectedRoute({ children }) {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  const teacherToken = localStorage.getItem("teacherToken");

  if (!userToken) return <Navigate to="/user/login" replace />;

  if (adminToken) localStorage.removeItem("adminToken");
  if (teacherToken) {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherEmail");
    localStorage.removeItem("teacherData");
  }

  return children;
}

function TeacherProtectedRoute({ children }) {
  const teacherToken = localStorage.getItem("teacherToken");
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  if (!teacherToken) return <Navigate to="/teacher/login" replace />;

  if (adminToken) localStorage.removeItem("adminToken");
  if (userToken) localStorage.removeItem("userToken");

  return children;
}

// ------------------------ App Component ------------------------
function App() {
  // Root redirect based on logged-in role
  const RootRedirect = () => {
    const adminToken = localStorage.getItem("adminToken");
    const teacherToken = localStorage.getItem("teacherToken");
    const userToken = localStorage.getItem("userToken");

    if (adminToken) return <Navigate to="/admin/dashboard" replace />;
    if (teacherToken) return <Navigate to="/teacher/dashboard" replace />;
    if (userToken) return <Navigate to="/user/dashboard" replace />;

    return <Navigate to="/user/login" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* User Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route
            path="/user/dashboard"
            element={
              <UserProtectedRoute>
                <UserDashboard />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/user/quizzes"
            element={
              <UserProtectedRoute>
                <QuizList />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/user/questions"
            element={
              <UserProtectedRoute>
                <UserQuestions />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/user/quiz/:quizId"
            element={
              <UserProtectedRoute>
                <QuizAttempt />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/user/results"
            element={
              <UserProtectedRoute>
                <UserResults />
              </UserProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <AdminProtectedRoute>
                <ClassManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminProtectedRoute>
                <Courses />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <AdminProtectedRoute>
                <QuizManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminProtectedRoute>
                <QuestionManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/:quizId/questions"
            element={
              <AdminProtectedRoute>
                <QuestionManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <AdminProtectedRoute>
                <TeacherManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/teacher/:id"
            element={
              <AdminProtectedRoute>
                <TeacherProfile />
              </AdminProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route
            path="/teacher/dashboard"
            element={
              <TeacherProtectedRoute>
                <TeacherDashboard />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-quiz"
            element={
              <TeacherProtectedRoute>
                <TeacherCreateQuiz />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/quiz/:quizId"
            element={
              <TeacherProtectedRoute>
                <TeacherQuizManagement />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/results"
            element={
              <TeacherProtectedRoute>
                <TeacherResults />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/quiz/:quizId/attempts"
            element={
              <TeacherProtectedRoute>
                <TeacherQuizAttempts />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/result/:resultId/mark"
            element={
              <TeacherProtectedRoute>
                <TeacherMarkQuiz />
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/batch/:classId"
            element={
              <TeacherProtectedRoute>
                <TeacherBatchCourses />
              </TeacherProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/user/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
