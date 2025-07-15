import React from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

/**
 * PUBLIC_INTERFACE
 * Central dashboard layout component with sidebar and main content area.
 */
function Layout({ children }) {
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
export default Layout;
