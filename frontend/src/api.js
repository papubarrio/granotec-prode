const TOKEN_KEY = "prode_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de red" }));
    throw new Error(err.error || "Error desconocido");
  }
  return res.json();
}

export const api = {
  login:           (email, password) => req("POST", "/auth/login", { email, password }),
  register:        (data) => req("POST", "/auth/register", data),
  getMe:           () => req("GET", "/auth/me"),
  changePassword:  (current_password, new_password) => req("POST", "/auth/change-password", { current_password, new_password }),

  getMatches:      () => req("GET", "/matches"),

  getMyBets:       () => req("GET", "/bets"),
  getAllBets:       () => req("GET", "/bets/all"),
  saveBet:         (matchId, home_score, away_score) => req("POST", `/bets/${matchId}`, { home_score, away_score }),

  getResults:      () => req("GET", "/results"),
  syncResults:     () => req("POST", "/results/sync"),
  saveResult:      (matchId, home_score, away_score) => req("POST", `/results/${matchId}`, { home_score, away_score }),

  getUsers:        () => req("GET", "/admin/users"),
  createUser:      (data) => req("POST", "/admin/users", data),
  resetPassword:   (id, password) => req("PUT", `/admin/users/${id}/password`, { password }),
  deleteUser:      (id) => req("DELETE", `/admin/users/${id}`),
};
