import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function JobDetail() {
  /**
   * Job Detail Page
   * - Fetches job details from backend by jobId (auth required)
   * - Shows job description, meta, error handling
   */
  const { jobId } = useParams();
  const { token, isLoggedIn } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      setLoading(true); setApiError(""); setJob(null);
      try {
        const resp = await fetch(`/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (resp.ok) {
          setJob(await resp.json());
        } else {
          let msg = "Failed to fetch job detail.";
          try {
            const { detail } = await resp.json();
            msg += detail ? ` (${detail})` : "";
          } catch {}
          setApiError(msg);
        }
      } catch (e) {
        setApiError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId, token]);

  return (
    <div className="page-content" style={{maxWidth: 600}}>
      {!job && loading && <div style={{margin:"3.5rem 0", textAlign:"center"}}>Loading job detail...</div>}
      {apiError && (
        <div style={{
          color:"crimson", margin:"1.5rem 0 2rem", fontWeight: 600
        }}>{apiError}</div>
      )}
      {!loading && !apiError && job && (
        <>
          <h1 style={{ marginBottom:6 }}>{job.title}</h1>
          <div style={{ color:"#222", fontWeight: 500, marginBottom: 6 }}>
            <span>{job.location || "Remote"}</span>
            {job.salary && (
              <span style={{marginLeft:20, color:"#007b62", fontWeight:600}}>
                💰 {job.salary}
              </span>
            )}
          </div>
          <div style={{
            color:"#444", fontSize:"1.07em", margin:"1.2em 0 1.6em",
            whiteSpace:"pre-line"
          }}>
            {job.description}
          </div>
          <div style={{
            color:"#888", fontSize:"0.96em", marginTop:"1em"
          }}>
            <span>Posted: {new Date(job.posted_at).toLocaleDateString()}
            </span> | <span>Status: {job.is_active ? "Active" : "Inactive"}</span>
          </div>
          <div style={{marginTop:24}}>
            <Link to="/jobs" style={{
              color: "#1976d2", textDecoration: "underline",
              fontWeight: 600, fontSize: "1em"
            }}>
              &larr; Back to job listings
            </Link>
          </div>
        </>
      )}
      {!loading && !job && !apiError && (
        <div style={{color: "#666", margin:"2.5em 0", textAlign:"center"}}>
          No such job found.
        </div>
      )}
    </div>
  );
}

export default JobDetail;
