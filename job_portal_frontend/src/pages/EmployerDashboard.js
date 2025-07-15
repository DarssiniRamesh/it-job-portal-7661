import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Employer Dashboard to:
 *  - List employer's own posted jobs (GET /jobs/my)
 *  - Allow editing/deleting jobs (future TODO)
 *  - Review/track applicants for each job. (GET /applications/job/{job_id}/applicants)
 *  - Update status of applications (PUT /applications/{application_id}/status)
 */
function EmployerDashboard() {
  const { user, token, isLoggedIn, authLoading } = useContext(AuthContext);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [jobsApiError, setJobsApiError] = useState("");

  // For applicants modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsApiError, setAppsApiError] = useState("");

  // Track status update
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [statusUpdateErr, setStatusUpdateErr] = useState({});

  // Fetch my jobs (as employer)
  useEffect(() => {
    if (!isLoggedIn || !user || !user.is_employer || !token) {
      setLoadingJobs(false);
      setJobs([]);
      setJobsApiError("");
      return;
    }
    setLoadingJobs(true); setJobsApiError(""); setJobs([]);
    fetch("/jobs/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async resp => {
        if (!resp.ok) {
          let msg = "Failed to load your jobs.";
          try {
            const d = await resp.json();
            msg += d.detail ? ` (${d.detail})` : "";
          } catch {}
          throw new Error(msg);
        }
        return resp.json();
      })
      .then(setJobs)
      .catch(e => setJobsApiError(e.message || "API error."))
      .finally(() => setLoadingJobs(false));
  }, [isLoggedIn, user, token]);

  // Guard: Employer only
  if (!isLoggedIn || !user || !user.is_employer) {
    return (
      <div className="page-content" style={{ maxWidth: 740, margin: "2.2rem auto" }}>
        <h1>Employer Dashboard</h1>
        <div style={{ color: "#b06434", fontWeight: 500, padding: "1.1em 0 1.8em" }}>
          Only logged-in employers can view their job posting dashboard.
        </div>
      </div>
    );
  }

  // Fetch all applicants for a job
  async function fetchApplicants(job) {
    setSelectedJob(job);
    setApplicants([]);
    setLoadingApps(true);
    setAppsApiError("");
    try {
      const resp = await fetch(`/applications/job/${job.id}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) {
        let msg = "Failed to load applicants.";
        try {
          const d = await resp.json();
          msg += d.detail ? ` (${d.detail})` : "";
        } catch {}
        throw new Error(msg);
      }
      setApplicants(await resp.json());
    } catch (e) {
      setAppsApiError(e.message || "API error.");
    } finally {
      setLoadingApps(false);
    }
  }

  // Update status for an applicant (app ID)
  async function updateStatus(application_id, newStatus) {
    setStatusUpdateLoading(prev => ({ ...prev, [application_id]: true }));
    setStatusUpdateErr(prev => ({ ...prev, [application_id]: "" }));
    try {
      const resp = await fetch(`/applications/${application_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!resp.ok) {
        let err = "Failed to update status.";
        try {
          const d = await resp.json();
          err += d.detail ? ` (${d.detail})` : "";
        } catch {}
        setStatusUpdateErr(prev => ({ ...prev, [application_id]: err }));
      } else {
        // update this applicant in applicants list
        const updatedApp = await resp.json();
        setApplicants(applicants => applicants.map(
          a => a.id === application_id ? { ...a, ...updatedApp } : a
        ));
      }
    } catch (e) {
      setStatusUpdateErr(prev => ({ ...prev, [application_id]: e.message || "API error." }));
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [application_id]: false }));
    }
  }

  // Render modal/dialog for applicants
  function renderApplicantsDialog() {
    if (!selectedJob) return null;
    return (
      <div
        style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(34,34,40,0.21)", zIndex: 3999, display: "flex", alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setSelectedJob(null)}
      >
        <div
          style={{
            background: "#fff", minWidth: 350, maxWidth: 670, width: "85vw",
            borderRadius: 10, boxShadow: "0 8px 32px #2e316618",
            padding: "2.1em 2.1em 1.6em 2.1em", position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            style={{
              position: "absolute", top: 18, right: 18, background: "#eee",
              border: "none", fontSize: "1.5em", borderRadius: "40%", width: 36, height: 36,
              color: "#313", cursor: "pointer"
            }}
            onClick={() => setSelectedJob(null)}
            title="Close"
            aria-label="Close"
          >×</button>
          <h2>Applicants for <span style={{ color: "#1857ba" }}>{selectedJob.title}</span></h2>
          {loadingApps
            ? <div style={{ margin: "2.5em 1em", textAlign: "center" }}>Loading applicants...</div>
            : appsApiError
              ? <div style={{ color: "crimson", marginBottom: 15 }}>{appsApiError}</div>
              : applicants.length === 0
                ? <div style={{ color: "#555" }}>No one has applied yet.</div>
                : (
                  <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 18 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f3f6fa" }}>
                        <th style={{ fontWeight: 700, padding: "7px 10px", textAlign: "left" }}>Candidate</th>
                        <th style={{ fontWeight: 500 }}>Status</th>
                        <th style={{ fontWeight: 500 }}>Cover Letter</th>
                        <th style={{ fontWeight: 500 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map(app => (
                        <tr key={app.id}>
                          <td style={{ padding: "7px 10px", fontSize: "1.04em" }}>
                            <div><b>{app.candidate?.email}</b></div>
                            {app.candidate?.full_name && <div style={{ fontSize: "0.93em", color: "#888" }}>{app.candidate.full_name}</div>}
                            {app.candidate?.skills && <div style={{ fontSize: "0.92em", color: "#557" }}>Skills: {app.candidate.skills}</div>}
                            {app.candidate?.resume_url &&
                              <div>
                                <a href={app.candidate.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: "#197d44" }}>
                                  Resume
                                </a>
                              </div>
                            }
                            <div style={{ fontSize: "0.90em", color: "#aaa" }}>App ID: {app.id}</div>
                          </td>
                          <td style={{ padding: "7px 10px", fontWeight: 600, color: statusColor(app.status) }}>
                            {capitalize(app.status)}
                          </td>
                          <td style={{ padding: "7px 8px", fontSize: "0.95em", maxWidth: 220 }}>
                            {app.cover_letter
                              ? <span style={{ fontStyle: "italic", color: "#317" }}>
                                  "{app.cover_letter.length > 250 ? app.cover_letter.slice(0, 250) + "..." : app.cover_letter}"
                                </span>
                              : <span style={{ color: "#aaa" }}>—</span>
                            }
                          </td>
                          <td style={{ padding: "7px 4px" }}>
                            <StatusDropdown
                              value={app.status}
                              onChange={val => updateStatus(app.id, val)}
                              loading={statusUpdateLoading[app.id]}
                              error={statusUpdateErr[app.id]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
          }
        </div>
      </div>
    );
  }

  // Status color helper
  function statusColor(status) {
    if (!status) return "#222";
    if (status === "accepted") return "#187d50";
    if (status === "rejected") return "#ad3131";
    if (status === "reviewed") return "#9a880b";
    if (status === "applied") return "#23689d";
    return "#313";
  }
  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  // Status dropdown
  function StatusDropdown({ value, onChange, loading, error }) {
    return (
      <div>
        <select
          value={value}
          disabled={loading}
          onChange={e => { if (e.target.value !== value) onChange(e.target.value); }}
          style={{
            fontSize: "1em",
            padding: "3.5px 7px",
            borderRadius: 4,
            border: "1px solid #b4b9c9",
            marginBottom: 4,
            background: loading ? "#ececec" : "#fff",
            color: statusColor(value),
            fontWeight: 600,
          }}
        >
          <option value="applied">Applied</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        {loading && <span style={{ marginLeft: 6, fontSize: "1.02em", color: "#1976d2" }}>⏳</span>}
        {error && <div style={{ color: "crimson", fontSize: "0.96em", marginTop: 3 }}>{error}</div>}
      </div>
    );
  }

  // List of jobs UI
  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      <h1>Employer Dashboard</h1>
      <div style={{ fontSize: "1.09em", color: "#333", marginBottom: "1.22em" }}>
        Post new jobs on the <a href="/jobs/post" style={{ color: "#1757e2", textDecoration: "underline" }}>Post a Job</a> page.<br />
        Manage your jobs & review applicants below.
      </div>
      {loadingJobs || authLoading
        ? <div style={{ margin: "2.7em 0", textAlign: "center" }}>Loading your jobs...</div>
        : jobsApiError
          ? <div style={{ color: "crimson", fontWeight: 600 }}>{jobsApiError}</div>
          : jobs.length === 0
            ? <div style={{ color: "#777", padding: "1.8em 0" }}>You have not posted any jobs yet.</div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.1em" }}>
                {jobs.map(job => (
                  <div
                    key={job.id}
                    style={{
                      border: "1.4px solid var(--border-color)",
                      borderRadius: 11,
                      background: "#fafdff",
                      boxShadow: "0 2px 12px rgba(60,80,140,0.09)",
                      padding: "1.7em 2em 1.6em 1.6em",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: "1.3em", fontWeight: 700, color: "#1757ba" }}>
                      {job.title}
                    </div>
                    <div style={{ margin: "6px 0 5px 0", color: "#333", fontWeight: 500 }}>
                      {job.location || "Remote"}
                      {job.salary &&
                        <span style={{ marginLeft: 32, color: "#187d50", fontWeight: 600 }}>💰 {job.salary}</span>
                      }
                    </div>
                    <div style={{ color: "#888", fontSize: "0.99em", marginTop: 2 }}>
                      Posted: {new Date(job.posted_at).toLocaleDateString()} &middot; Status: {job.is_active ? "Active" : "Inactive"}
                    </div>
                    <div style={{ marginTop: 13, fontSize: "1em", color: "#235799" }}>
                      <button
                        className="btn"
                        style={{ fontSize: "1em", padding: "7px 19px", fontWeight: 600, marginRight: 8 }}
                        onClick={() => fetchApplicants(job)}
                        aria-label="See applicants"
                      >
                        Review Applicants
                      </button>
                      <a
                        href={`/jobs/${job.id}`}
                        style={{ color: "#1976d2", textDecoration: "underline", marginLeft: 7, fontWeight: 600 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Posting
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
      }
      {renderApplicantsDialog()}
    </div>
  );
}

export default EmployerDashboard;
