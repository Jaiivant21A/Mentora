import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-text-base">
            <Navbar />
            <div className="container mx-auto p-6">
                <Outlet />
            </div>
        </div>
    );
}
