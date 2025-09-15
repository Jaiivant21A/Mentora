import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    // Main container for the entire app layout.
    <div className="min-h-screen bg-background">
      {/* The navigation bar, always visible on protected pages. */}
      <Navbar />

      {/* The main content area that changes with the route. */}
      <main className="container mx-auto px-4 py-8">
        {/* Renders the current page's component (e.g., DashboardPage). */}
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;