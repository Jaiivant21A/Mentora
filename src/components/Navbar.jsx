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
  ShieldCheck, // Import the ShieldCheck icon for Admin link
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";

// Key for storing the theme in local storage.
const THEME_KEY = "mentora-theme";

const Navbar = () => {
  const nav = useNavigate();
  // Get user session, isAdmin, and logout function from our context.
  const { user, isAdmin, signOut: supabaseSignOut } = useAuth(); // Destructure isAdmin

  // State and refs for the user dropdown menu.
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Apply saved theme on initial load.
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  // Close dropdown on outside click or 'Escape' key press.
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
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

  // Function to compute the active link style for NavLink.
  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:text-gray-100"
    }`;

  const goSettings = () => {
    setOpen(false);
    nav("/settings");
  };

  // Handles user sign-out and redirects to the auth page.
  const signOut = async () => {
    await supabaseSignOut();
    setOpen(false);
    nav("/auth", { replace: true });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo and App Name */}
          <div className="flex-shrink-0">
            {/* Change the 'to' prop to "/" */}
            <Link to="/" className="flex items-center space-x-2"> 
              <BotMessageSquare className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Mentora
              </span>
            </Link>
          </div>

          {/* Center: Main navigation links */}
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
            {/* Conditional Admin link */}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <ShieldCheck size={18} />
                <span>Admin</span>
              </NavLink>
            )}
          </div>

          {/* Right Side: User info and dropdown menu */}
          <div className="relative flex items-center gap-3">
            {/* Display user's email if they are logged in. */}
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
                {user.email}
              </span>
            )}
            
            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
              title="Account"
            >
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            
            {/* The user dropdown menu, shown conditionally. */}
            {open && (
              <div
                ref={menuRef}
                className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg py-2"
              >
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                >
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={goSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                >
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
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