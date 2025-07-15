import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Profile page for both candidate and employer.
 * - Fetches user profile from backend
 * - Renders current profile (readonly or edit mode)
 * - Allows profile update for employer (company, website, description) or candidate (full name, skills, resume)
 */
function Profile() {
  const { user, token, isLoggedIn, authLoading } = useContext(AuthContext);

  const [profileLoading, setProfileLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [profileData, setProfileData] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    // On load: re-fetch profile
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchProfile() {
    setProfileLoading(true);
    setApiError("");
    setProfileData(null);
    try {
      const resp = await fetch("/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (resp.ok) {
        const data = await resp.json();
        setProfileData(data);
        setEditMode(false);
        setEditForm({});
      } else {
        let msg = "Failed to fetch profile.";
        try {
          const d = await resp.json();
          msg += d.detail ? ` (${d.detail})` : "";
        } catch {}
        setApiError(msg);
      }
    } catch {
      setApiError("Could not connect to backend.");
    } finally {
      setProfileLoading(false);
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="page-content" style={{ maxWidth: 520, margin: "2.6rem auto" }}>
        <h1>Profile</h1>
        <div style={{ color: "#964c3b", fontWeight: 500, padding: "1.4em 0" }}>
          You must be logged in to view and edit your profile.
        </div>
      </div>
    );
  }

  if (authLoading || profileLoading) {
    return (
      <div className="page-content" style={{ maxWidth: 520, margin: "2.6rem auto" }}>
        <h1>Profile</h1>
        <div style={{ margin: "2.5rem 0", textAlign: "center" }}>Loading your profile...</div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="page-content" style={{ maxWidth: 520, margin: "2.6rem auto" }}>
        <h1>Profile</h1>
        <div style={{ color: "crimson", marginBottom: 20 }}>{apiError}</div>
        <button className="btn" style={{ marginTop: 8, fontWeight: 600 }} onClick={fetchProfile}>
          Retry
        </button>
      </div>
    );
  }

  // Determine user type and current profile subobject
  const { is_employer, email } = profileData;
  const employerProfile = profileData.employer_profile;
  const candidateProfile = profileData.candidate_profile;

  // Build edit form initial state for each type
  function handleEditClick() {
    if (is_employer && employerProfile) {
      setEditForm({
        company_name: employerProfile.company_name || "",
        website: employerProfile.website || "",
        description: employerProfile.description || "",
      });
    } else if (!is_employer && candidateProfile) {
      setEditForm({
        full_name: candidateProfile.full_name || "",
        skills: candidateProfile.skills || "",
        resume_url: candidateProfile.resume_url || "",
      });
    } else {
      setEditForm({});
    }
    setEditSuccess("");
    setEditError("");
    setEditMode(true);
  }

  function handleCancelEdit() {
    setEditForm({});
    setEditMode(false);
    setEditError("");
    setEditSuccess("");
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setEditLoading(true);
    try {
      const isEmp = is_employer;
      const updateUrl = isEmp ? "/profile/employer" : "/profile/candidate";
      // Prepare body, only send explicitly supported keys
      let body = {};
      if (isEmp) {
        body = {
          company_name: (editForm.company_name || "").trim(),
          website: (editForm.website || "").trim() || null,
          description: (editForm.description || "").trim() || null,
        };
      } else {
        body = {
          full_name: (editForm.full_name || "").trim(),
          skills: (editForm.skills || "").trim() || null,
          resume_url: (editForm.resume_url || "").trim() || null,
        };
      }
      const resp = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (resp.ok) {
        setEditSuccess("Profile updated successfully!");
        setEditMode(false);
        // Re-fetch profile to refresh UI
        fetchProfile();
      } else {
        let msg = "Failed to update profile.";
        try {
          const d = await resp.json();
          msg += d.detail ? ` (${d.detail})` : "";
        } catch {}
        setEditError(msg);
      }
    } catch {
      setEditError("Could not connect to backend.");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: 510, margin: "2.6rem auto" }}>
      <h1>Profile</h1>
      <div style={{ fontSize: "1.04em", margin: "0.3em 0 2.1em 0", color: "#284589" }}>
        Account: <b>{email || "—"}</b><br />
        Role: {is_employer ? (
          <span style={{ color: "#b4611a" }}><b>Employer</b></span>
        ) : (
          <span style={{ color: "#2e732e" }}><b>Candidate</b></span>
        )}
      </div>
      
      {editSuccess && (
        <div style={{ color: "#17864d", fontWeight: 600, marginBottom: 9 }}>
          {editSuccess}
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4em" }}>
          {is_employer ? (
            <>
              <label style={{ fontWeight: 600 }}>
                Company Name<span style={{ color: "crimson" }}> *</span>
                <input
                  type="text"
                  name="company_name"
                  value={editForm.company_name || ""}
                  onChange={handleInputChange}
                  required
                  maxLength={70}
                  placeholder="Acme Solutions Ltd"
                  style={{ width: "100%", marginTop: 5, fontSize: "1.03em" }}
                  autoFocus
                />
              </label>
              <label style={{ fontWeight: 600 }}>
                Website
                <input
                  type="url"
                  name="website"
                  value={editForm.website || ""}
                  onChange={handleInputChange}
                  maxLength={120}
                  placeholder="https://companywebsite.com"
                  style={{ width: "100%", marginTop: 5, fontSize: "1.03em" }}
                />
              </label>
              <label style={{ fontWeight: 600 }}>
                Description
                <textarea
                  name="description"
                  value={editForm.description || ""}
                  onChange={handleInputChange}
                  maxLength={1200}
                  rows={5}
                  placeholder="Enter company description / about / mission..."
                  style={{ width: "100%", marginTop: 5, fontSize: "1em", resize: "vertical", minHeight: 70 }}
                />
              </label>
            </>
          ) : (
            <>
              <label style={{ fontWeight: 600 }}>
                Full Name<span style={{ color: "crimson" }}> *</span>
                <input
                  type="text"
                  name="full_name"
                  value={editForm.full_name || ""}
                  onChange={handleInputChange}
                  required
                  maxLength={80}
                  placeholder="e.g. Jane Doe"
                  style={{ width: "100%", marginTop: 5, fontSize: "1.03em" }}
                  autoFocus
                />
              </label>
              <label style={{ fontWeight: 600 }}>
                Skills / Tech stack
                <input
                  type="text"
                  name="skills"
                  value={editForm.skills || ""}
                  onChange={handleInputChange}
                  maxLength={300}
                  placeholder="e.g. Python, React, Cloud, SQL, Communication"
                  style={{ width: "100%", marginTop: 5, fontSize: "1.03em" }}
                />
              </label>
              <label style={{ fontWeight: 600 }}>
                Resume URL
                <input
                  type="url"
                  name="resume_url"
                  value={editForm.resume_url || ""}
                  onChange={handleInputChange}
                  maxLength={200}
                  placeholder="https://linktoresume.com/yourresume.pdf"
                  style={{ width: "100%", marginTop: 5, fontSize: "1.03em" }}
                />
              </label>
            </>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button
              className="btn"
              style={{ minWidth: 110, fontWeight: 700 }}
              type="submit"
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              style={{
                background: "#eee",
                color: "#635959",
                fontWeight: 600,
                border: "none",
                borderRadius: "5px",
                padding: "7px 18px",
                marginLeft: 3,
                cursor: "pointer",
              }}
              onClick={handleCancelEdit}
              disabled={editLoading}
            >
              Cancel
            </button>
            {editError && (
              <span style={{ marginLeft: 13, color: "crimson", fontWeight: 600 }}>{editError}</span>
            )}
          </div>
        </form>
      ) : (
        <div style={{marginBottom:18}}>
          {is_employer && employerProfile ? (
            <div style={{ fontSize: "1.09em", color: "#284443", marginBottom: 14 }}>
              <div><b>Company Name:</b> {employerProfile.company_name || "—"}</div>
              <div>
                <b>Website:</b>{" "}
                {employerProfile.website ? (
                  <a href={employerProfile.website} target="_blank" rel="noopener noreferrer" style={{ color: "#1760e6" }}>
                    {employerProfile.website}
                  </a>
                ) : "—"}
              </div>
              <div style={{ whiteSpace: "pre-line", marginTop: 7 }}>
                <b>Description:</b><br />
                <span style={{color:"#575", marginLeft:6, fontSize:"0.97em"}}>
                  {employerProfile.description || "—"}
                </span>
              </div>
            </div>
          ) : !is_employer && candidateProfile ? (
            <div style={{ fontSize: "1.06em", color: "#254484", marginBottom: 14 }}>
              <div><b>Full Name:</b> {candidateProfile.full_name}</div>
              <div><b>Skills:</b> <span style={{ color: "#158c68" }}>{candidateProfile.skills || "—"}</span></div>
              <div>
                <b>Resume URL:</b>{" "}
                {candidateProfile.resume_url ? (
                  <a href={candidateProfile.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: "#1760e6" }}>
                    {candidateProfile.resume_url}
                  </a>
                ) : "—"}
              </div>
            </div>
          ) : (
            <div style={{ color: "#666", fontStyle: "italic", marginBottom: 12 }}>
              Profile unavailable for this account.
            </div>
          )}
          <button
            className="btn"
            style={{ minWidth: 88, fontWeight: 700 }}
            onClick={handleEditClick}
          >
            Edit Profile
          </button>
        </div>
      )}
      <div style={{ marginTop: 36, color: "#bbb", fontSize: "0.98em" }}>
        If you encounter issues saving your profile, please check your connection or re-login.
      </div>
    </div>
  );
}

export default Profile;
