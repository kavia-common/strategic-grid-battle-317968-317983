import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

// PUBLIC_INTERFACE
export function AppShell({ children }) {
  /** Layout shell with top navigation bar and content container. */
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="app-shell">
      <header className="navbar" role="banner">
        <div className="navbar-inner">
          <Link className="brand" to={token ? "/lobby" : "/auth"} aria-label="Home">
            <span className="brand-badge" aria-hidden="true" />
            <span>Strategic Grid Battle</span>
          </Link>

          <nav className="nav-actions" aria-label="Primary navigation">
            {token ? (
              <>
                <NavLink className="btn btn-ghost" to="/lobby">
                  Lobby
                </NavLink>
                <NavLink className="btn btn-ghost" to="/game">
                  Game
                </NavLink>
                <NavLink className="btn btn-ghost" to="/results">
                  Results
                </NavLink>
                <span className="pill" title="Signed-in user">
                  {user?.email ? user.email : "Signed in"}
                </span>
                <button className="btn btn-danger" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-primary" to="/auth">
                  Sign in
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main" role="main">
        {children}
      </main>
    </div>
  );
}
