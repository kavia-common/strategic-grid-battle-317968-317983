import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/auth";

function mockResult(gameId) {
  return {
    gameId,
    outcome: "Victory",
    turns: 9,
    durationSeconds: 310,
    mvp: "Scout",
  };
}

// PUBLIC_INTERFACE
export function ResultsScreen() {
  /** Results screen for the completed match (scaffolded API). */
  const { token } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const gameId = params.get("gameId") || "demo-game";

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setBusy(true);
      setError("");
      try {
        const data = await api.getResults({ token, gameId });
        if (!mounted) return;
        setResult(data);
      } catch (e) {
        if (!mounted) return;
        setError("Backend results endpoint not available yet. Showing mock results.");
        setResult(mockResult(gameId));
      } finally {
        if (mounted) setBusy(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [gameId, token]);

  return (
    <div className="grid2">
      <section className="card">
        <div className="card-header">
          <h1 className="h1">Results</h1>
          <p className="subtitle">Match summary and outcome.</p>
        </div>

        <div className="card-body">
          {error ? <div className="toast" role="alert">{error}</div> : null}
          {busy ? (
            <div className="small">Loading…</div>
          ) : result ? (
            <div className="stack">
              <div className="panel" style={{ padding: 14 }}>
                <div className="row">
                  <div className="stack" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>
                      {result.outcome || result.status || "Completed"}
                    </div>
                    <div className="small">
                      Game: <strong>{result.gameId || gameId}</strong>
                    </div>
                  </div>
                  <span className="badge">{(result.outcome || "Victory").toUpperCase()}</span>
                </div>
              </div>

              <div className="panel" style={{ padding: 14 }}>
                <div className="small" style={{ lineHeight: 1.8 }}>
                  Turns: <strong>{result.turns ?? "—"}</strong>
                  <br />
                  Duration: <strong>{result.durationSeconds ?? "—"}</strong>s
                  <br />
                  MVP: <strong>{result.mvp ?? "—"}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="small">No results available.</div>
          )}
        </div>

        <div className="card-footer">
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-primary" onClick={() => navigate("/lobby")}>
              Back to lobby
            </button>
            <button className="btn btn-accent" onClick={() => navigate("/game")}>
              New match (demo)
            </button>
          </div>
        </div>
      </section>

      <aside className="panel">
        <div className="stack">
          <div style={{ fontWeight: 900 }}>Next</div>
          <div className="small">
            When backend match history endpoints are added, this panel will include:
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Recent matches</li>
              <li>Win/loss stats</li>
              <li>Unit performance</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
