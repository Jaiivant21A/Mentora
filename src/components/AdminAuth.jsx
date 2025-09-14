import React, { useState } from "react";

/**
 * AdminAuth
 * Props:
 * - adminAllowed: array of { id: string } allowed admin IDs
 * - adminPassword: string shared admin password
 * - onSetSession: function to persist session
 * - navigate: function to change route (e.g., useNavigate)
 * - from: redirect path after login (default "/")
 * - onSuccess: optional callback after login
 */
export default function AdminAuth({
  adminAllowed = [],
  adminPassword = "",
  onSetSession,
  navigate,
  from = "/",
  onSuccess,
}) {
  const [adminId, setAdminId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e) => {
    e?.preventDefault?.();
    setError("");

    const id = adminId.trim();
    const idOk =
      Array.isArray(adminAllowed) && adminAllowed.some((a) => a.id === id);
    if (!idOk) {
      setError("Invalid Admin ID");
      return;
    }
    if (pwd !== adminPassword) {
      setError("Invalid Admin password");
      return;
    }

    const session = { adminId: id, role: "admin", ts: Date.now() };

    if (typeof onSetSession === "function") onSetSession(session);
    if (typeof onSuccess === "function") onSuccess();
    if (typeof navigate === "function") navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h2 className="text-xl font-semibold mb-3">Admin Login</h2>

      <form onSubmit={handleAdminLogin} className="space-y-3">
        <div>
          <label htmlFor="admin-id" className="block text-sm text-gray-600 mb-1">
            Admin ID
          </label>
          <input
            id="admin-id"
            className="w-full border rounded-md px-3 py-2"
            placeholder="e.g., MENTORA-ADMIN-0031"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label
            htmlFor="admin-pwd"
            className="block text-sm text-gray-600 mb-1"
          >
            Password
          </label>
          <input
            id="admin-pwd"
            type="password"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter admin password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold"
        >
          Admin Sign In
        </button>
      </form>

      <div className="text-xs text-gray-500 mt-3">
        Allowed IDs:
        <ul className="list-disc ml-5 mt-1">
          <li>MENTORA-ADMIN-0027</li>
          <li>MENTORA-ADMIN-0031</li>
          <li>MENTORA-ADMIN-0032</li>
        </ul>
      </div>
    </div>
  );
}
