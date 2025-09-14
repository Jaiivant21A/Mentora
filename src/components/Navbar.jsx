// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BotMessageSquare,
  Target,
  User as UserIcon,
  GraduationCap,
  Mic,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { clearSession, getRole } from "../services/session";

const THEME_KEY = "mentora-theme";

const Navbar = () => {
  const nav = useNavigate();
  const role = getRole();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Apply saved theme once at startup (no visible toggle in UI)
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []); // Tailwind dark mode uses a .dark class on <html> when darkMode:'class' [1][5]

  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (
        menuRef.current?.contains(e.target) ||
        btnRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
    }`;

  const goSettings = () => {
    setOpen(false);
    nav("/settings");
  };

  const signOut = () => {
    clearSession();
    setOpen(false);
    nav("/auth", { replace: true });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand -> Home */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <BotMessageSquare className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Mentora
              </span>
            </Link>
          </div>

          {/* Main links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink to="/dashboard" className={navLinkClass}>
              <BotMessageSquare size={18} />
              <span>Personas</span>
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              <GraduationCap size={18} />
              <span>Resources</span>
            </NavLink>
            <NavLink to="/interviews" className={navLinkClass}>
              <Mic size={18} />
              <span>Interviews</span>
            </NavLink>
            <NavLink to="/goals" className={navLinkClass}>
              <Target size={18} />
              <span>My Goals</span>
            </NavLink>
          </div>

          {/* Right: role + user dropdown */}
          <div className="relative flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
              Role: {role}
            </span>

            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
              title="Account"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="user-menu"
            >
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {open && (
              <div
                id="user-menu"
                ref={menuRef}
                role="menu"
                className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg py-2"
              >
                <button
                  onClick={goSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                  role="menuitem"
                >
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                  role="menuitem"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
