import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Very small auth state container.
 * Stores token in memory (can be upgraded to localStorage later).
 */

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** This is a public component providing authentication state to the app. */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      token,
      user,
      // PUBLIC_INTERFACE
      loginWithToken(newToken, newUser) {
        /** Store token/user in memory (scaffold). */
        setToken(newToken);
        setUser(newUser || null);
      },
      // PUBLIC_INTERFACE
      logout() {
        /** Clears token/user (scaffold). */
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** This is a public hook returning the current auth state. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
