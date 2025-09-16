import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-text-base">
            {/* This is a simple wrapper for all protected pages */}
            <div className="container mx-auto p-6">
                <Outlet />
            </div>
        </div>
    );
}