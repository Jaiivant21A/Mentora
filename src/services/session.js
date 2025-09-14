const SESSION_KEY = "mentora-session";
const USERS_KEY = "mentora-users";

export const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setSession = (session) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);
export const isAuthed = () => !!getSession();
export const getRole = () => getSession()?.role || "guest";

export const getUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
export const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
