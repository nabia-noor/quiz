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
import UserQuestions from "./components/UserQuestions";
import UserLogin from "./components/UserLogin";
import UserDashboard from "./components/UserDashboard";
import QuizList from "./components/QuizList";
import QuizAttempt from "./components/QuizAttempt";
import UserResults from "./components/UserResults";
import TeacherLogin from "./components/TeacherLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherManagement from "./components/TeacherManagement";
import TeacherProfile from "./components/TeacherProfile";
import TeacherCreateQuiz from "./components/TeacherCreateQuiz";
import TeacherResults from "./components/TeacherResults";
import TeacherBatchCourses from "./components/TeacherBatchCourses";
import TeacherQuizManagement from "./components/TeacherQuizManagement";
import TeacherQuizAttempts from "./components/TeacherQuizAttempts";
import TeacherMarkQuiz from "./components/TeacherMarkQuiz";
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
  const teacherToken = localStorage.getItem("teacherToken");

  // Only user can access user pages
  if (!userToken) {
    return <Navigate to="/user/login" replace />;
  }

  // If admin or teacher token also exists, remove it (ensure only one role at a time)
  if (adminToken) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  }
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

  // Only teacher can access teacher pages
  if (!teacherToken) {
    return <Navigate to="/teacher/login" replace />;
  }

  // If admin or user token also exists, remove it (ensure only one role at a time)
  if (adminToken) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  }
  if (userToken) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  }

  return children;
}

function App() {
  // Smart redirect based on who is logged in
  const RootRedirect = () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");
    const teacherToken = localStorage.getItem("teacherToken");

    if (adminToken) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (teacherToken) {
      return <Navigate to="/teacher/dashboard" replace />;
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
          {/* Admin Results routes REMOVED - Quiz submissions are only accessible to teachers */}
          {/* 
          <Route
            path="/admin/results"
            element={
              <AdminProtectedRoute>
                <ResultManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/results/:id"
            element={
              <AdminProtectedRoute>
                <AdminResultDetail />
              </AdminProtectedRoute>
            }
          />
          */}

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

          {/* Teacher: View courses for a specific batch */}
          <Route
            path="/teacher/batch/:classId"
            element={
              <TeacherProtectedRoute>
                <TeacherBatchCourses />
              </TeacherProtectedRoute>
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
