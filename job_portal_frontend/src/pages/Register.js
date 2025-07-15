import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function Register() {
  /**
   * Registration page for user sign up (candidate or employer).
   * Connects to backend and manages token on success.
   */
  const { register, authLoading } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: "", password: "", password2: "", is_employer: false
  });
  const [error, setError] = useState("");

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }
    const resp = await register({
      email: form.email,
      password: form.password,
      is_employer: !!form.is_employer
    });
    if (!resp.success) {
      setError(resp.error || "Registration failed.");
    }
  };

  return (
    <div className="page-content" style={{maxWidth:480, margin:"2.5rem auto"}}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
        <div>
          <label>Email:<br /><input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInput}
            required
            autoFocus
            style={{width:"100%"}}
          /></label>
        </div>
        <div>
          <label>Password:<br /><input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInput}
            minLength={6}
            required
            style={{width:"100%"}}
          /></label>
        </div>
        <div>
          <label>Confirm Password:<br /><input
            type="password"
            name="password2"
            value={form.password2}
            onChange={handleInput}
            required
            style={{width:"100%"}}
          /></label>
        </div>
        <div>
          <label>
            <input
              name="is_employer"
              type="checkbox"
              checked={form.is_employer}
              onChange={handleInput}
              style={{marginRight:"0.5em"}}
            /> Register as Employer (unchecked: Candidate)
          </label>
        </div>
        <button className="btn" type="submit" disabled={authLoading} style={{width: "100%"}}>
          {authLoading ? "Registering..." : "Register"}
        </button>
        {error && <div style={{color:"crimson", fontWeight:600}}>{error}</div>}
      </form>
    </div>
  );
}
export default Register;
