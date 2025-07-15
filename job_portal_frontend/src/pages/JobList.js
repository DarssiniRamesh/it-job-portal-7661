import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function JobList() {
  /**
   * Job Listings Page
   * - Fetches IT jobs from backend with search/filter (title/desc/location/min_salary/only_active)
   * - Modern card/list design
   * - Handles loading, API/auth errors
   * - Integrates with AuthContext for auth token
   */
  const { token, isLoggedIn, authLoading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Keep job detail link for easy navigation in new tab
  const navigate = useNavigate();

  // Helper to build query string
  function buildQuery() {
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    if (minSalary) params.push(`min_salary=${encodeURIComponent(minSalary)}`);
    if (onlyActive) params.push(`only_active=true`);
    else params.push(`only_active=false`);
    return params.length > 0 ? `?${params.join("&")}` : "";
  }

  // Fetch jobs w/ filters
  async function fetchJobs() {
    setLoading(true);
    setApiError("");
    try {
      const resp = await fetch(`/jobs/${buildQuery()}`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      if (resp.ok) {
        const data = await resp.json();
        setJobs(data);
      } else {
        // Check for expired/invalid token hint
        let errMsg = "Failed to fetch job listings.";
        try {
          const { detail } = await resp.json();
          errMsg += detail ? ` (${detail})` : "";
        } catch {
          // ignore JSON parse error
        }
        setApiError(errMsg);
      }
    } catch (e) {
      setApiError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  // Refresh jobs on mount/filter change
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* Only on submit, not on each keystroke */]);

  // Handle filter form submit
  function handleFilter(e) {
    e.preventDefault();
    fetchJobs();
  }

  function handleClearFilters() {
    setSearch("");
    setLocation("");
    setMinSalary("");
    setOnlyActive(true);
    setTimeout(() => fetchJobs(), 10); // force reset fetch
  }

  return (
    <div className="page-content">
      <h1>Job Listings</h1>
      <form style={{
        display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end",
        margin: "1.5rem 0 2rem"
      }} onSubmit={handleFilter} aria-label="Job search and filters">
        <div>
          <label style={{ fontWeight: 600 }}>
            Keyword<br />
            <input
              name="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="e.g. React, Python, remote"
              autoComplete="off"
              style={{ width: 170, maxWidth: "100%" }}
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>
            Location<br />
            <input
              name="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. London, Remote"
              autoComplete="off"
              style={{ width: 135, maxWidth: "100%" }}
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>
            Min Salary<br />
            <input
              name="min_salary"
              value={minSalary}
              onChange={e => {
                // Only positive numbers
                if (e.target.value === "" || /^[0-9]+$/.test(e.target.value)) {
                  setMinSalary(e.target.value);
                }
              }}
              placeholder="e.g. 50000"
              autoComplete="off"
              style={{ width: 100, maxWidth: "100%" }}
              inputMode="numeric"
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>
            <input
              type="checkbox"
              name="only_active"
              checked={onlyActive}
              onChange={e => setOnlyActive(e.target.checked)}
              style={{ marginRight: 7 }}
            />
            Only Active
          </label>
        </div>
        <button type="submit" className="btn" style={{ minWidth: 80, marginBottom: 4 }}>
          Search
        </button>
        <button type="button" style={{
          marginLeft: 8, minWidth: 68, color: "#555", background: "var(--border-color)", border: "none", borderRadius: 4, padding: "7px 16px"
        }} onClick={handleClearFilters}>
          Clear
        </button>
      </form>

      {/* Show error states */}
      {apiError &&
        <div style={{ color: "crimson", margin: "1rem 0 1.5rem", fontWeight: 600 }}>
          {apiError}
        </div>
      }
      {/* Auth required for apply/favorite, but listing is public */}
      {authLoading || loading
        ? <div style={{
          margin: "3rem auto", textAlign: "center", fontSize: "1.2em"
        }}>Loading jobs...</div>
        : jobs.length === 0
          ? <div style={{ margin: "2rem 0", color: "#888" }}>
              No jobs found. Try different filters.
            </div>
          : (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem"
            }}>
              {jobs.map(job =>
                <div key={job.id} style={{
                  boxShadow: "0 2px 12px rgba(60,80,130,0.10)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  background: "var(--bg-secondary, #fcfdfe)",
                  padding: "1.3rem 1.5rem",
                  transition: "box-shadow 0.19s",
                  position: "relative"
                }}>
                  <h2 style={{
                    margin: 0, fontSize: "1.23em", fontWeight: 800,
                    letterSpacing: "-1px", color: "#1976d2"
                  }}>
                    <Link to={`/jobs/${job.id}`} style={{
                      color: "#1976d2",
                      textDecoration: "none"
                    }}>
                      {job.title}
                    </Link>
                  </h2>
                  <div style={{ fontSize: "1.03em", color: "#373757", marginTop: 2, marginBottom: 8, lineHeight: 1.32 }}>
                    <span style={{ fontWeight: 600 }}>{job.location || "Remote"}</span>
                    {job.salary &&
                      <span style={{
                        marginLeft: 18,
                        color: "#008d76",
                        fontWeight: 600
                      }}>
                        💰 {job.salary}
                      </span>
                    }
                  </div>
                  <div style={{
                    color: "#3a3a3a", fontSize: "0.97em",
                    marginBottom: 6,
                    marginTop: 4,
                    maxHeight: 54,
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {job.description?.slice(0, 140)}
                    {job.description && job.description.length > 140 && <>...</>}
                  </div>
                  <div style={{
                    display: "flex",
                    gap: 18,
                    fontSize: "0.96em",
                    color: "#888",
                    marginTop: 12
                  }}>
                    <span>Posted: {new Date(job.posted_at).toLocaleDateString()}</span>
                    <span>Status: {job.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <Link to={`/jobs/${job.id}`} style={{
                    position: "absolute",
                    bottom: 20, right: 30,
                    color: "var(--button-bg, #1976d2)",
                    fontWeight: 700,
                    fontSize: "1em",
                    textDecoration: "underline",
                    padding: "2px 8px",
                  }}>
                    View Details &rarr;
                  </Link>
                </div>
              )}
            </div>
          )
      }
    </div>
  );
}

export default JobList;
