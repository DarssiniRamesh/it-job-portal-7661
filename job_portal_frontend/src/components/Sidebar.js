import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

// PUBLIC_INTERFACE
function Sidebar() {
  /**
   * Navigation sidebar for dashboard layout.
   * Shows core pages/sections of the job portal as per design spec.
   */
  // TODO: Add logo/icon if required in final styling.
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span role="img" aria-label="portal">💼</span> IT Job Portal
      </div>
      <ul className="sidebar-nav">
        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
        <li><NavLink to="/jobs" className={({ isActive }) => isActive ? "active" : ""}>Job Listings</NavLink></li>
        <li><NavLink to="/jobs/post" className={({ isActive }) => isActive ? "active" : ""}>Post a Job</NavLink></li>
        <li><NavLink to="/applications" className={({ isActive }) => isActive ? "active" : ""}>Applications</NavLink></li>
        <li><NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink></li>
      </ul>
      <div className="sidebar-auth">
        <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink> /
        <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink>
      </div>
    </nav>
  );
}
export default Sidebar;
