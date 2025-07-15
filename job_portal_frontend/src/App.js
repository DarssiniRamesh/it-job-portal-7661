import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import ApplicationTracking from "./pages/ApplicationTracking";
import Profile from "./pages/Profile";

/** 
 * PUBLIC_INTERFACE
 * Main app root. Includes theme support and router for dashboard layout.
 */
function App() {
  const [theme, setTheme] = useState("light");

  // Set theme on mount or toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Top-level routes for auth, rest use Layout (sidebar)
  return (
    <Router>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        style={{ position: 'fixed', zIndex: 9999, top: 16, right: 24 }}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<JobList />} />
                <Route path="/jobs/post" element={<PostJob />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/applications" element={<ApplicationTracking />} />
                <Route path="/profile" element={<Profile />} />
                {/* Add other portal/dash pages here */}
                <Route path="*" element={<div className="page-content"><h2>404 - Not Found</h2></div>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
