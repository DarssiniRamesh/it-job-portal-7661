import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, getToken, removeToken, isLoggedIn } from "../utils/auth";

// Create AuthContext
export const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides auth state to the rest of the app.
   * Exposes user info, token, auth methods (login, logout, register).
   */
  const [token, setTokenState] = useState(getToken());
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Sync token from storage on mount
  useEffect(() => {
    setTokenState(getToken());
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  async function fetchProfile() {
    try {
      setAuthLoading(true);
      // Backend might run on 3001—change to your deployed API if needed!
      const resp = await fetch("/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function login({ email, password }) {
    setAuthLoading(true);
    // FastAPI expects form-urlencoded
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    try {
      const resp = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
      });
      const data = await resp.json();
      if (resp.ok) {
        setToken(data.access_token);
        setTokenState(data.access_token);
        await fetchProfile();
        navigate("/dashboard");
        return { success: true };
      } else {
        removeToken();
        setTokenState(null);
        setUser(null);
        return { success: false, error: data.detail || "Login failed" };
      }
    } finally {
      setAuthLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function register({ email, password, is_employer }) {
    setAuthLoading(true);
    try {
      const resp = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, is_employer })
      });
      const data = await resp.json();
      if (resp.ok) {
        setToken(data.access_token);
        setTokenState(data.access_token);
        await fetchProfile();
        navigate("/dashboard");
        return { success: true };
      } else {
        removeToken();
        setTokenState(null);
        setUser(null);
        return { success: false, error: data.detail || "Registration failed" };
      }
    } finally {
      setAuthLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  function logout() {
    removeToken();
    setTokenState(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{
      token, user, isLoggedIn: !!token, authLoading,
      login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
