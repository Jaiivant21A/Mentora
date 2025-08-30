const AdminAuth = ({ onSuccess }) => {
  const [adminId, setAdminId] = useState('');
  const [pwd, setPwd] = useState('');

  const handleAdminLogin = () => {
    const idOk = ADMIN_ALLOWED.some(a => a.id === adminId.trim());
    if (!idOk) return alert('Invalid Admin ID');
    if (pwd !== ADMIN_PASSWORD) return alert('Invalid Admin password');

    // Save session with admin role and ID
    setSession({ adminId: adminId.trim(), role: 'admin', ts: Date.now() });
    onSuccess?.();
  };
setSession({ adminId: adminId.trim(), role: 'admin', ts: Date.now() });
nav(from, { replace: true }); // go to Home (or previously attempted page) [3][10]

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        Enter a valid Admin ID and the shared Admin password.
      </p>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Admin ID</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          placeholder="e.g., MENTORA-ADMIN-0031"
          value={adminId}
          onChange={e=>setAdminId(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2"
          placeholder="Enter admin password"
          value={pwd}
          onChange={e=>setPwd(e.target.value)}
        />
      </div>

      <button
        onClick={handleAdminLogin}
        className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold"
      >
        Admin Sign In
      </button>

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
};
