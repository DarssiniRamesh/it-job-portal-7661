import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
function Login() {
  /**
   * Login page for existing users (candidates or employers).
   * Calls backend, saves JWT, and redirects on success.
   */
  const { login, authLoading } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    const resp = await login({
      email: form.email,
      password: form.password
    });
    if (!resp.success) {
      setError(resp.error || "Login failed.");
    }
  };

  return (
    <div className="page-content" style={{maxWidth:400, margin:"2.5rem auto"}}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:"1.3rem"}}>
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
            required
            style={{width:"100%"}}
          /></label>
        </div>
        <button className="btn" type="submit" disabled={authLoading} style={{width:"100%"}}>
          {authLoading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{color:"crimson", fontWeight:600}}>{error}</div>}
      </form>
    </div>
  );
}
export default Login;
