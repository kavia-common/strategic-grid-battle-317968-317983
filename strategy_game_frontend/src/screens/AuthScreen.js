import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../state/auth";

function makeDemoToken(email) {
  return `demo.${btoa(unescape(encodeURIComponent(email || "player")))}.${Date.now()}`;
}

// PUBLIC_INTERFACE
export function AuthScreen() {
  /** Authentication screen for login/register (API calls are scaffolded). */
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create account"), [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      // Try backend auth endpoints (may not exist yet).
      let data;
      if (mode === "login") {
        data = await api.login({ email, password });
      } else {
        data = await api.register({ email, password, displayName });
      }

      // Common shapes: {token, user} OR {access_token, ...}
      const token = data?.token || data?.access_token;
      if (!token) {
        throw new ApiError("Auth succeeded but token was missing from response.", { status: 200, data });
      }
      loginWithToken(token, data?.user || { email, displayName: data?.displayName });
      navigate("/lobby");
    } catch (err) {
      // If backend isn't ready, allow entering with a demo token so other screens are reachable.
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Unable to sign in.";
      setError(`${msg} (Using demo session is available)`);

      // Demo fallback:
      loginWithToken(makeDemoToken(email), { email, displayName });
      navigate("/lobby");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="card-header">
          <h1 className="h1">{title}</h1>
          <p className="subtitle">
            Turn-based tactical battles on a grid. Sign in to join a lobby and start a match.
          </p>
        </div>

        <div className="card-body">
          {error ? <div className="toast" role="alert">{error}</div> : null}
          <form onSubmit={submit} className="stack" aria-label="Authentication form">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {mode === "register" ? (
              <div>
                <label className="label" htmlFor="displayName">
                  Display name
                </label>
                <input
                  id="displayName"
                  className="input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Commander"
                />
              </div>
            ) : null}

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="help" style={{ marginTop: 8 }}>
                Backend auth endpoints are scaffolded; if unavailable, you will enter via a demo session.
              </div>
            </div>

            <div className="row" style={{ justifyContent: "flex-start" }}>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
              >
                {mode === "login" ? "Need an account?" : "Have an account?"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <aside className="panel">
        <div className="stack">
          <div className="pill">Modern light theme</div>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>How it works</div>
            <div className="small">
              <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Sign in</li>
                <li>Create or join a lobby</li>
                <li>Play on the 10×10 grid</li>
                <li>View results and match history</li>
              </ol>
            </div>
          </div>

          <div className="divider" />

          <div className="small">
            Tip: Set <code>REACT_APP_API_BASE_URL</code> to point at the backend.
          </div>
        </div>
      </aside>
    </div>
  );
}
