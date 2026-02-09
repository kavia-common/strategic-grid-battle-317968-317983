/**
 * Minimal API client wrapper around fetch().
 *
 * Note: Backend OpenAPI currently exposes only GET / health-check. This client includes
 * scaffolding for auth/lobby/game endpoints expected by the product; once backend adds them,
 * wire the paths accordingly here without changing UI call sites.
 */

const DEFAULT_BASE_URL = "";

/**
 * Resolve API base URL from environment.
 * CRA exposes env vars prefixed with REACT_APP_.
 */
function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

/**
 * Attempt to parse JSON if response indicates JSON.
 */
async function tryParseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Core request helper.
 */
async function request(path, { method = "GET", token, body, headers } = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : null),
      ...(token ? { Authorization: `Bearer ${token}` } : null),
      ...(headers || null),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await tryParseJson(res);
  if (!res.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || `Request failed (${res.status})`;
    throw new ApiError(msg, { status: res.status, data });
  }

  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** Health check */
  health() {
    return request("/", { method: "GET" });
  },

  /** AUTH (scaffold) */
  login({ email, password }) {
    return request("/auth/login", { method: "POST", body: { email, password } });
  },
  register({ email, password, displayName }) {
    return request("/auth/register", {
      method: "POST",
      body: { email, password, displayName },
    });
  },

  /** LOBBY (scaffold) */
  listLobbies({ token }) {
    return request("/lobbies", { method: "GET", token });
  },
  createLobby({ token, name }) {
    return request("/lobbies", { method: "POST", token, body: { name } });
  },
  joinLobby({ token, lobbyId }) {
    return request(`/lobbies/${encodeURIComponent(lobbyId)}/join`, {
      method: "POST",
      token,
    });
  },

  /** GAME (scaffold) */
  getGame({ token, gameId }) {
    return request(`/games/${encodeURIComponent(gameId)}`, { method: "GET", token });
  },
  submitMove({ token, gameId, move }) {
    return request(`/games/${encodeURIComponent(gameId)}/move`, {
      method: "POST",
      token,
      body: move,
    });
  },

  /** RESULTS (scaffold) */
  getResults({ token, gameId }) {
    return request(`/games/${encodeURIComponent(gameId)}/results`, {
      method: "GET",
      token,
    });
  },
};

export { ApiError, getApiBaseUrl };
