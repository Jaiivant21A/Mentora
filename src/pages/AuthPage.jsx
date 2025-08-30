// src/pages/AuthPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BotMessageSquare, User as UserIcon, ShieldCheck } from 'lucide-react';
import { getUsers, saveUsers, setSession, getSession } from '../services/session';

// Redirect to Home if already logged in; after new login, go to previous page or Home.
const AuthPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/';

  useEffect(() => {
    if (getSession()) nav('/', { replace: true });
  }, [nav]); // navigate away if already authed

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <BotMessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Mentora</h1>
        </div>

        <AuthTabs from={from} />
      </div>
    </div>
  );
};

const AuthTabs = ({ from }) => {
  const [tab, setTab] = useState('user'); // 'user' | 'admin'
  return (
    <>
      <div className="flex mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setTab('user')}
          className={`flex-1 px-4 py-2 font-semibold ${tab==='user' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
        >
          <UserIcon className="inline mr-2" size={18}/> User
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`flex-1 px-4 py-2 font-semibold ${tab==='admin' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
        >
          <ShieldCheck className="inline mr-2" size={18}/> Admin
        </button>
      </div>

      {tab === 'user'
        ? <UserAuth from={from} />
        : <AdminAuth from={from} />}
    </>
  );
};

const UserAuth = ({ from }) => {
  const nav = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => { e?.preventDefault(); mode==='signin' ? handleSignin() : handleSignup(); };

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!pwd.trim()) return 'Password is required';
    return null;
  };

  const handleSignup = () => {
    const v = validate(); if (v) return setErr(v);
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase()))
      return setErr('User already exists. Please sign in.');
    const user = { id: crypto.randomUUID(), email, pwd };
    saveUsers([user, ...users]);
    setSession({ userId: user.id, email: user.email, role: 'user', ts: Date.now() });
    nav(from || '/', { replace: true }); // redirect to Home or intended page
  };

  const handleSignin = () => {
    const v = validate(); if (v) return setErr(v);
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.pwd === pwd);
    if (!found) return setErr('Invalid credentials');
    setSession({ userId: found.id, email: found.email, role: 'user', ts: Date.now() });
    nav(from || '/', { replace: true });
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-3">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
        <input className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
               value={email} onChange={e=>{ setEmail(e.target.value); setErr(''); }} required />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Password</label>
        <input type="password" className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
               value={pwd} onChange={e=>{ setPwd(e.target.value); setErr(''); }} required />
      </div>
      {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}

      {mode === 'signin' ? (
        <>
          <button type="submit" className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold">Sign In</button>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">
            New here? <button type="button" onClick={()=>{ setMode('signup'); setErr(''); }} className="text-primary font-semibold underline">Create an account</button>
          </p>
        </>
      ) : (
        <>
          <button type="submit" className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold">Sign Up</button>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">
            Already have an account? <button type="button" onClick={()=>{ setMode('signin'); setErr(''); }} className="text-primary font-semibold underline">Sign in</button>
          </p>
        </>
      )}
    </form>
  );
};

const ADMIN_ALLOWED = [
  { id: 'MENTORA-ADMIN-0027', name: 'Admin 0027' },
  { id: 'MENTORA-ADMIN-0031', name: 'Admin 0031' },
  { id: 'MENTORA-ADMIN-0032', name: 'Admin 0032' },
];
const ADMIN_PASSWORD = 'Mentora@Admin';

const AdminAuth = ({ from }) => {
  const nav = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => { e?.preventDefault(); handleAdminLogin(); };

  const handleAdminLogin = () => {
    if (!adminId.trim()) return setErr('Admin ID is required');
    if (!pwd.trim()) return setErr('Password is required');
    const idOk = ADMIN_ALLOWED.some(a => a.id === adminId.trim());
    if (!idOk) return setErr('Invalid Admin ID');
    if (pwd !== ADMIN_PASSWORD) return setErr('Invalid Admin password');
    setSession({ adminId: adminId.trim(), role: 'admin', ts: Date.now() });
    nav(from || '/', { replace: true });
  };

  return (
    <form onSubmit={submit}>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Enter a valid Admin ID and the shared Admin password.</p>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Admin ID</label>
        <input className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
               placeholder="e.g., MENTORA-ADMIN-0031" value={adminId}
               onChange={e=>{ setAdminId(e.target.value); setErr(''); }} required />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Password</label>
        <input type="password" className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
               placeholder="Enter admin password" value={pwd}
               onChange={e=>{ setPwd(e.target.value); setErr(''); }} required />
      </div>

      {err && <p className="text-sm text-red-600 mb-3" role="alert">{err}</p>}

      <button type="submit" className="w-full bg-primary text-white px-4 py-2 rounded-md font-semibold">Admin Sign In</button>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Allowed IDs:
        <ul className="list-disc ml-5 mt-1">
          <li>MENTORA-ADMIN-0027</li>
          <li>MENTORA-ADMIN-0031</li>
          <li>MENTORA-ADMIN-0032</li>
        </ul>
      </div>
    </form>
  );
};

export default AuthPage;
