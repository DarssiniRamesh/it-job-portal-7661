import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function JobDetail() {
  /**
   * Job Detail Page + Application logic.
   * - Fetches job details.
   * - Shows application UI for candidates.
   */
  const { jobId } = useParams();
  const { token, isLoggedIn, user, authLoading } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Application state
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [appStatus, setAppStatus] = useState("");
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  // Fetch job details
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

  // Fetch if user already applied to this job (only for logged-in candidates)
  useEffect(() => {
    async function checkApplication() {
      setAlreadyApplied(false);
      setApplicationId(null);
      setAppStatus("");
      setApplyError("");
      setApplySuccess("");
      if (!token || !user || user.is_employer) return; // Only candidates
      try {
        const resp = await fetch("/applications/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const apps = await resp.json();
          // Look for this job id in my applications
          const found = apps.find(a => String(a.job_id) === String(jobId));
          if (found) {
            setAlreadyApplied(true);
            setApplicationId(found.id);
            setAppStatus(found.status);
          }
        }
      } catch {}
    }
    checkApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, token, user]);

  const onSubmitApplication = async (e) => {
    e.preventDefault();
    setApplyError("");
    setApplySuccess("");
    setApplicationLoading(true);
    try {
      const resp = await fetch("/applications/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          job_id: Number(jobId),
          cover_letter: coverLetter || null,
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setAlreadyApplied(true);
        setApplicationId(data.id);
        setAppStatus(data.status);
        setCoverLetter("");
        setApplySuccess("Application submitted!");
      } else {
        let errMsg = "Failed to submit application.";
        try {
          const data = await resp.json();
          errMsg += data.detail ? ` (${data.detail})` : "";
        } catch {}
        setApplyError(errMsg);
      }
    } catch (e) {
      setApplyError("Could not connect to backend.");
    } finally {
      setApplicationLoading(false);
    }
  };

  return (
    <div className="page-content" style={{maxWidth: 600}}>
      {!job && loading && <div style={{margin:"3.5rem 0", textAlign:"center"}}>Loading job detail...</div>}
      {apiError && (
        <div style={{
          color:"crimson", margin:"1.5rem 0 2rem", fontWeight: 600
        }}>{apiError}</div>
      )}
      {/* JOB DETAIL */}
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
          {/* APPLICATION SECTION */}
          {isLoggedIn && !authLoading && user && !user.is_employer && job.is_active && (
            <div style={{
              border: "1.5px solid #e9e8ff", borderRadius: "8px",
              margin: "2em 0 1em", background: "#fafdff",
              padding: "1.15em 1.1em 1.3em 1.1em"
            }}>
              {/* If already applied, show status */}
              {alreadyApplied ? (
                <div style={{color:"#26805F", fontWeight:600, fontSize:"1.05em"}}>
                  <span role="img" aria-label="applied">✅</span>
                  &nbsp;You have applied for this job
                  {appStatus ? <> — <span style={{color:"#0b555a"}}>Status: {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}</span></> : null}
                  <div style={{marginTop:6, fontSize:"0.98em"}}>
                    <Link
                      to="/applications"
                      style={{ color: "#1976d2", textDecoration: "underline" }}
                    >
                      Track your application
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                <form onSubmit={onSubmitApplication} style={{display:"flex", flexDirection:"column", gap:"1.1em"}}>
                  <label style={{fontWeight:600}}>
                    Optional Cover Letter:
                    <textarea
                      rows={4}
                      value={coverLetter}
                      placeholder="Write a brief cover letter here..."
                      onChange={e => setCoverLetter(e.target.value)}
                      style={{
                        width: "100%", marginTop:6, fontSize:"1em",
                        resize:"vertical", padding:"6px 8px", borderRadius:"5px", border:"1px solid #efeded"
                      }}
                    />
                  </label>
                  <button type="submit"
                    disabled={applicationLoading}
                    className="btn"
                    style={{width:150, fontWeight:700}}>
                    {applicationLoading ? "Applying..." : "Apply to this job"}
                  </button>
                  {applyError && (
                    <div style={{color:"crimson", fontWeight:600, marginTop:4}}>{applyError}</div>
                  )}
                  {applySuccess && (
                    <div style={{color:"#147b26", fontWeight:600, marginTop:4}}>{applySuccess}</div>
                  )}
                </form>
                </>
              )}
            </div>
          )}
          {/* If not logged in or is employer or job not active, hint about login/apply */}
          {(!isLoggedIn || !user || user.is_employer || !job.is_active) && (
            <div style={{margin: "2.5em 0 1em", color:"#8576a3", fontSize:"0.97em"}}>
              {!isLoggedIn ?
                <div>
                  <Link to="/login" style={{ color: "#1976d2", textDecoration: "underline" }}>Log in</Link> to apply for this job.
                </div>
                : user && user.is_employer ?
                <div>
                  You are logged in as an employer. Candidate account needed to apply.
                </div>
                : !job.is_active ?
                <div>
                  This job posting is inactive. Applications are closed.
                </div>
                : null
              }
            </div>
          )}
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
