import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Page for EMPLOYERS to post a new job.
 * - Only accessible to logged-in employers.
 * - POST /jobs/ to create a job.
 * - Modern form, error and success feedback.
 */
function PostJob() {
  const { user, token, isLoggedIn, authLoading } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdJob, setCreatedJob] = useState(null);

  // Guard: Employer only
  if (!isLoggedIn || !user || !user.is_employer) {
    return (
      <div className="page-content" style={{ maxWidth: 600, margin: "2.2rem auto" }}>
        <h1>Post a New Job</h1>
        <div style={{ color: "#b06434", fontWeight: 500, padding: "1.1em 0 1.8em" }}>
          Only logged-in employers can post jobs.
        </div>
      </div>
    );
  }

  function handleInput(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(""); setSuccessMsg(""); setCreatedJob(null);
    // Validation
    if (!form.title.trim() || !form.description.trim()) {
      setApiError("Title and Description are required");
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch("/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim() || null,
          salary: form.salary.trim() || null,
          is_active: !!form.is_active,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSuccessMsg("Job posted successfully!");
        setCreatedJob(data);
        setForm({ title: "", description: "", location: "", salary: "", is_active: true });
      } else {
        let msg = "Failed to post job.";
        try {
          const d = await resp.json();
          msg += d.detail ? ` (${d.detail})` : "";
        } catch {}
        setApiError(msg);
      }
    } catch (e) {
      setApiError("Could not connect to backend.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: 620 }}>
      <h1>Post a New Job</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.3em",
          marginTop: "2em",
        }}
      >
        <div>
          <label style={{ fontWeight: 600 }}>
            Job Title<span style={{ color: "crimson" }}> *</span>
            <br />
            <input
              name="title"
              value={form.title}
              onChange={handleInput}
              required
              maxLength={50}
              placeholder="e.g. Frontend React Developer"
              autoFocus
              style={{ width: "100%", fontSize: "1.13em" }}
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>
            Job Description<span style={{ color: "crimson" }}> *</span>
            <br />
            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              required
              rows={7}
              maxLength={1800}
              placeholder="Describe job role, requirements, responsibilities, tech stacks, etc."
              style={{
                width: "100%",
                minHeight: 110,
                maxHeight: 280,
                fontSize: "1.06em",
                resize: "vertical",
                padding: "7px 8px",
              }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "1.3em", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, flex: "1 1 112px" }}>
            Location<br />
            <input
              name="location"
              value={form.location}
              onChange={handleInput}
              maxLength={40}
              placeholder="e.g. Remote, Berlin"
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontWeight: 600, flex: "1 1 100px" }}>
            Salary<br />
            <input
              name="salary"
              value={form.salary}
              onChange={handleInput}
              maxLength={25}
              placeholder="e.g. 80000-100000/year"
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontWeight: 600, display: "flex", alignItems: "center", marginTop: 8 }}>
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleInput}
              style={{ marginRight: 7 }}
            />
            Active
          </label>
        </div>
        <button
          type="submit"
          className="btn"
          style={{ width: 160, fontWeight: 700, marginTop: 8 }}
          disabled={authLoading || submitting}
        >
          {submitting ? "Posting..." : "Post Job"}
        </button>
        {apiError && (
          <div style={{ color: "crimson", fontWeight: 600, marginTop: 4 }}>
            {apiError}
          </div>
        )}
        {successMsg && (
          <div style={{ color: "#187d50", fontWeight: 700, marginTop: 4 }}>
            {successMsg} {createdJob && (
              <span>
                <a
                  href={`/jobs/${createdJob.id}`}
                  style={{
                    marginLeft: 8,
                    color: "#1857ba",
                    textDecoration: "underline",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View job posting
                </a>
              </span>
            )}
          </div>
        )}
      </form>
      <div style={{ color: "#777", fontSize: "1em", marginTop: "2.2em" }}>
        <strong>Note:</strong> Jobs posted will appear in Job Listings and in your Employer Dashboard.
      </div>
    </div>
  );
}

export default PostJob;
