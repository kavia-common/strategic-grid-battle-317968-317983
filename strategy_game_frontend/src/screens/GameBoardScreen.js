import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/auth";

function keyOf(r, c) {
  return `${r},${c}`;
}

function initialUnits() {
  // Minimal local mock: two units for player and opponent
  return {
    [keyOf(2, 2)]: { owner: "you", type: "Scout", hp: 5 },
    [keyOf(7, 7)]: { owner: "them", type: "Tank", hp: 8 },
  };
}

// PUBLIC_INTERFACE
export function GameBoardScreen() {
  /** Game board UI with grid, unit selection, and move submission scaffold. */
  const { token } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const gameId = params.get("gameId") || "demo-game";
  const lobbyId = params.get("lobbyId") || "demo-lobby";

  const [selected, setSelected] = useState(null);
  const [units, setUnits] = useState(() => initialUnits());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const turnInfo = useMemo(
    () => ({
      currentPlayer: "you",
      turnNumber: 1,
      timerSeconds: 28,
    }),
    []
  );

  const selectedUnit = selected ? units[selected] : null;

  const onCellClick = useCallback(
    async (r, c) => {
      const k = keyOf(r, c);

      // Select if a unit exists there:
      if (units[k]) {
        setSelected(k);
        return;
      }

      // If empty and you have selected a unit, attempt a move:
      if (selected && units[selected]) {
        setBusy(true);
        setError("");
        try {
          const [fromR, fromC] = selected.split(",").map(Number);
          const move = { from: { r: fromR, c: fromC }, to: { r, c } };

          // Attempt backend submit (scaffold); if it fails, apply locally.
          await api.submitMove({ token, gameId, move });

          // If backend succeeds, UI should refetch game state; for now also update locally.
          setUnits((prev) => {
            const next = { ...prev };
            next[k] = next[selected];
            delete next[selected];
            return next;
          });
          setSelected(k);
        } catch (e) {
          setError("Backend move endpoint not available yet. Applied move locally.");
          setUnits((prev) => {
            const next = { ...prev };
            next[k] = next[selected];
            delete next[selected];
            return next;
          });
          setSelected(k);
        } finally {
          setBusy(false);
        }
      }
    },
    [gameId, selected, token, units]
  );

  const endDemoGame = () => {
    navigate(`/results?gameId=${encodeURIComponent(gameId)}&lobbyId=${encodeURIComponent(lobbyId)}`);
  };

  const cells = useMemo(() => {
    const items = [];
    for (let r = 0; r < 10; r += 1) {
      for (let c = 0; c < 10; c += 1) {
        const k = keyOf(r, c);
        const unit = units[k];
        const isSelected = selected === k;
        const label = unit ? (unit.owner === "you" ? "Y" : "E") : "";
        items.push(
          <button
            key={k}
            type="button"
            className={[
              "cell",
              isSelected ? "selected" : "",
              unit ? "unit" : "",
            ].join(" ")}
            onClick={() => onCellClick(r, c)}
            aria-label={unit ? `${unit.owner} ${unit.type} at ${k}` : `Empty cell ${k}`}
            disabled={busy}
          >
            {label}
          </button>
        );
      }
    }
    return items;
  }, [busy, onCellClick, selected, units]);

  return (
    <div className="board-wrap">
      <section className="board" aria-label="Game board">
        <div className="board-header">
          <div className="stack" style={{ gap: 2 }}>
            <div style={{ fontWeight: 900 }}>Match</div>
            <div className="small">
              Game: <strong>{gameId}</strong> • Lobby: <strong>{lobbyId}</strong>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <span className="pill">
              Turn {turnInfo.turnNumber} • {turnInfo.currentPlayer} • {turnInfo.timerSeconds}s
            </span>
            <button className="btn btn-accent" onClick={endDemoGame}>
              Finish (demo)
            </button>
          </div>
        </div>

        {error ? <div className="toast" role="alert" style={{ margin: 12 }}>{error}</div> : null}

        <div className="board-grid" role="grid" aria-label="10 by 10 grid">
          {cells}
        </div>
      </section>

      <aside className="panel" aria-label="Action panel">
        <div className="stack">
          <div style={{ fontWeight: 900 }}>Selected</div>
          {selectedUnit ? (
            <div className="stack" style={{ gap: 8 }}>
              <div className="pill">
                Cell: <strong>{selected}</strong>
              </div>
              <div className="small">
                Type: <strong>{selectedUnit.type}</strong>
                <br />
                Owner: <strong>{selectedUnit.owner}</strong>
                <br />
                HP: <strong>{selectedUnit.hp}</strong>
              </div>
              <div className="divider" />
              <div className="small">
                Click an empty cell to move. When backend game logic is ready, this will enforce rules, turns, and combat.
              </div>
            </div>
          ) : (
            <div className="small">Click a unit (Y/E) to select it.</div>
          )}

          <div className="divider" />

          <div className="stack" style={{ gap: 10 }}>
            <button className="btn" onClick={() => setSelected(null)} disabled={busy}>
              Clear selection
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/lobby")} disabled={busy}>
              Back to lobby
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
