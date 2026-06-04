import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import useRouteLoader from "./hooks/useRouteLoader";

import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Message from "./pages/Message";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Education from "./pages/Education.jsx";
import "./style/theme.css";

/* 🔐 Protected Route */
import { useLocation } from "react-router-dom";
import Experience from "./pages/Experience.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  useRouteLoader(); // 🔥 enable route loader

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />

      <Routes>
        <Route
          path="/"
          element={
            (localStorage.getItem("accessToken") ||
              sessionStorage.getItem("accessToken")) ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/education"
          element={
            <PrivateRoute>
              <Education />
            </PrivateRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <PrivateRoute>
              <Skills />
            </PrivateRoute>
          }
        />

        <Route
          path="/Experience"
          element={
            <PrivateRoute>
              <Experience />
            </PrivateRoute>
          }
        />

        <Route
          path="/resumeUpload"
          element={
            <PrivateRoute>
              <ResumeUpload />
            </PrivateRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Message />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;