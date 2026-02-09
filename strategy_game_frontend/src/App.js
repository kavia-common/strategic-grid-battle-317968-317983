import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppShell } from "./components/AppShell";
import { AuthProvider } from "./state/auth";
import { RequireAuth } from "./routes/RequireAuth";
import { AuthScreen } from "./screens/AuthScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GameBoardScreen } from "./screens/GameBoardScreen";
import { ResultsScreen } from "./screens/ResultsScreen";

// PUBLIC_INTERFACE
function App() {
  /** Application entry component with routing skeleton for auth/lobby/game/results. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<AuthScreen />} />

            <Route
              path="/lobby"
              element={
                <RequireAuth>
                  <LobbyScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/game"
              element={
                <RequireAuth>
                  <GameBoardScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/results"
              element={
                <RequireAuth>
                  <ResultsScreen />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
