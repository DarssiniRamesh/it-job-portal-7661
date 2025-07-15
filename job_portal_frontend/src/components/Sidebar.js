import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function Sidebar() {
  /**
   * Navigation sidebar for dashboard layout.
   * Conditionally renders auth navigation.
   */
  const { isLoggedIn, user, logout } = useContext(AuthContext);

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
        {isLoggedIn ? (
          <>
            <span style={{marginRight:"0.6em", color:"#555"}}>Logged in{user && user.email ? `: ${user.email}` : ""}</span>
            <button style={{
              background: "none", border: "none", color: "#007bff",
              fontWeight: 600, cursor: "pointer", textDecoration:"underline"
            }}
              onClick={logout}
            >Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink> /
            <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
export default Sidebar;
