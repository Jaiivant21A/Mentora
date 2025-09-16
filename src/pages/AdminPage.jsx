import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch all profiles from the 'profiles' table
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*');

                if (error) {
                    throw error;
                }
                setUsers(data);
            } catch (err) {
                console.error("Error fetching users:", err.message);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-text-secondary">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="bg-background text-text-base min-h-screen container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <p className="text-text-secondary mb-4">
                View and manage all user profiles in the system.
            </p>

            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Full Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Admin
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-background">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-base">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {user.full_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {user.username || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {user.is_admin ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                            Yes
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                            No
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;