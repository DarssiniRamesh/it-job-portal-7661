import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
function MyApplications() {
  /**
   * Lists all applications submitted by current candidate.
   * Requires authentication. Shows job, status, submission time.
   */
  const { token, user, isLoggedIn, authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Only for candidates
    if (!token || !user || user.is_employer) {
      setLoading(false);
      setApplications([]);
      return;
    }
    async function fetchMyApplications() {
      setLoading(true);
      setApiError("");
      try {
        const resp = await fetch("/applications/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          setApplications(await resp.json());
        } else {
          let msg = "Failed to load applications.";
          try {
            const { detail } = await resp.json();
            msg += detail ? ` (${detail})` : "";
          } catch {}
          setApiError(msg);
        }
      } catch {
        setApiError("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }
    fetchMyApplications();
  }, [token, user]);

  return (
    <div className="page-content" style={{maxWidth:740}}>
      <h1>My Applications</h1>
      {!isLoggedIn || !user || user.is_employer ? (
        <div style={{color: "#964c3b", fontWeight: 500, padding:"1.4em 0"}}>
          You must be logged in as a candidate to view your job applications.
        </div>
      ) : loading || authLoading ? (
        <div style={{margin:"3em auto", textAlign:"center"}}>Loading applications...</div>
      ) : apiError ? (
        <div style={{color:"crimson", margin:"1.2em 0", fontWeight:600}}>{apiError}</div>
      ) : applications.length === 0 ? (
        <div style={{padding:"1.8em 0", color:"#666"}}>
          You have not applied for any jobs yet.
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:"1.2em"}}>
          {applications.map(app => (
            <div
              key={app.id}
              style={{
                border: "1px solid var(--border-color)",
                background: "#fafdff",
                borderRadius: "9px",
                padding: "1.15em 1.3em",
                position: "relative",
                boxShadow: "0 2px 10px rgba(60,80,130,0.06)"
              }}
            >
              <div style={{fontSize:"1.13em", fontWeight:700}}>
                <Link to={`/jobs/${app.job_id}`} style={{color: "#1d79b6", textDecoration:"underline"}}>
                  {app.job_id ? `Job #${app.job_id}` : "Job"}
                </Link>
              </div>
              <div style={{fontSize:"0.98em", color:"#333", marginTop: 2, marginBottom: 7}}>
                Applied on: {new Date(app.created_at).toLocaleString()}
              </div>
              <div style={{
                fontWeight: 600,
                marginBottom: 6,
                color: app.status === "accepted" ? "#197d44"
                      : app.status === "rejected" ? "#ad3131"
                      : app.status === "reviewed" ? "#9a880b"
                      : "#23689d"
              }}>
                Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </div>
              {app.cover_letter && (
                <div style={{
                  fontStyle: "italic",
                  color: "#6d5d4b",
                  marginBottom:8,
                  background:"#f7f3e8", borderRadius:"4px", padding:"6px 8px"
                }}>
                  &ldquo;{app.cover_letter.length > 300 ? app.cover_letter.slice(0,300) + "..." : app.cover_letter}&rdquo;
                </div>
              )}
              <div style={{position:"absolute", top:12, right:18, color:"#999", fontSize:"0.92em"}}>
                Application ID: {app.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MyApplications;
