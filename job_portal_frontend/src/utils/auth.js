//
// Utility functions for JWT token management in localStorage/sessionStorage
//

// PUBLIC_INTERFACE
export function setToken(token) {
  /** Stores JWT token in localStorage. */
  localStorage.setItem("access_token", token);
}

// PUBLIC_INTERFACE
export function getToken() {
  /** Retrieves JWT token from localStorage. */
  return localStorage.getItem("access_token");
}

// PUBLIC_INTERFACE
export function removeToken() {
  /** Removes JWT token from localStorage. */
  localStorage.removeItem("access_token");
}

// PUBLIC_INTERFACE
export function isLoggedIn() {
  /** Returns true if a token exists (simple auth check) */
  return !!getToken();
}
