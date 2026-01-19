import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import ClassManagement from "./components/ClassManagement";
import QuizManagement from "./components/QuizManagement";
import QuestionManagement from "./components/QuestionManagement";
import ResultManagement from "./components/ResultManagement";
import UserLogin from "./components/UserLogin";
import UserDashboard from "./components/UserDashboard";
import QuizList from "./components/QuizList";
import QuizAttempt from "./components/QuizAttempt";
import UserResults from "./components/UserResults";
import "./App.css";

// Protected Route Components
function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  // Only admin can access admin pages
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user token also exists, remove it (ensure only one role at a time)
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

  // Only user can access user pages
  if (!userToken) {
    return <Navigate to="/user/login" replace />;
  }

  // If admin token also exists, remove it (ensure only one role at a time)
  if (adminToken) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  }

  return children;
}

function App() {
  // Smart redirect based on who is logged in
  const RootRedirect = () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    if (adminToken) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userToken) {
      return <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/user/login" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Smart root redirect based on login status */}
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

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
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
            path="/admin/results"
            element={
              <AdminProtectedRoute>
                <ResultManagement />
              </AdminProtectedRoute>
            }
          />

          {/* Catch all - redirect to user login */}
          <Route path="*" element={<Navigate to="/user/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
