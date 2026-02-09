import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/auth";

function mockLobbies() {
  return [
    { id: "alpha", name: "Alpha Skirmish", players: 1, status: "waiting" },
    { id: "bravo", name: "Bravo Arena", players: 2, status: "in_progress" },
    { id: "charlie", name: "Charlie Clash", players: 1, status: "waiting" },
  ];
}

// PUBLIC_INTERFACE
export function LobbyScreen() {
  /** Lobby screen for matchmaking: list lobbies, create lobby, join lobby. */
  const navigate = useNavigate();
  const { token } = useAuth();

  const [lobbies, setLobbies] = useState([]);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const waiting = useMemo(() => lobbies.filter((l) => l.status === "waiting"), [lobbies]);

  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await api.listLobbies({ token });
      setLobbies(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError("Backend lobby endpoints not available yet. Showing mock lobbies.");
      setLobbies(mockLobbies());
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await api.createLobby({ token, name: name || "New Lobby" });
      const lobbyId = data?.id || data?.lobbyId || "alpha";
      navigate(`/game?lobbyId=${encodeURIComponent(lobbyId)}`);
    } catch (e) {
      // Mock behavior:
      navigate(`/game?lobbyId=${encodeURIComponent("alpha")}`);
    } finally {
      setBusy(false);
    }
  };

  const join = async (lobbyId) => {
    setBusy(true);
    setError("");
    try {
      const data = await api.joinLobby({ token, lobbyId });
      const gameId = data?.gameId || lobbyId;
      navigate(`/game?gameId=${encodeURIComponent(gameId)}&lobbyId=${encodeURIComponent(lobbyId)}`);
    } catch (e) {
      navigate(`/game?lobbyId=${encodeURIComponent(lobbyId)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid2">
      <section className="card">
        <div className="card-header">
          <h1 className="h1">Lobby</h1>
          <p className="subtitle">
            Create a match or join a waiting lobby. When the backend is ready, this will reflect real-time matchmaking.
          </p>
        </div>

        <div className="card-body">
          {error ? <div className="toast" role="alert">{error}</div> : null}

          <div className="row" style={{ marginBottom: 12 }}>
            <span className="pill">
              {busy ? "Syncing…" : "Ready"} • {waiting.length} waiting
            </span>
            <button className="btn" onClick={refresh} disabled={busy}>
              Refresh
            </button>
          </div>

          <div className="stack">
            {lobbies.map((lobby) => (
              <div key={lobby.id} className="panel" style={{ padding: 14 }}>
                <div className="row">
                  <div className="stack" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>{lobby.name || lobby.id}</div>
                    <div className="small">
                      Players: {lobby.players ?? lobby.playerCount ?? "?"} • Status:{" "}
                      <span className="badge">{lobby.status || "waiting"}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => join(lobby.id)}
                    disabled={busy}
                    aria-label={`Join lobby ${lobby.name || lobby.id}`}
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="panel">
        <div className="stack">
          <div style={{ fontWeight: 900 }}>Create lobby</div>
          <div>
            <label className="label" htmlFor="lobbyName">
              Lobby name
            </label>
            <input
              id="lobbyName"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend Skirmish"
            />
            <div className="help" style={{ marginTop: 8 }}>
              You can start immediately with mock state; later this will create a server-side lobby.
            </div>
          </div>
          <button className="btn btn-accent" onClick={create} disabled={busy}>
            Create & Start
          </button>
        </div>
      </aside>
    </div>
  );
}
