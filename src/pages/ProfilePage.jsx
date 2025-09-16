import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../Context/AuthContext';
import { User as UserIcon } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select(`username, full_name, avatar_url`)
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                if (profileData) {
                    setUsername(profileData.username || '');
                    setFullName(profileData.full_name || '');
                    if (profileData.avatar_url) {
                        const { data: publicUrlData } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(profileData.avatar_url);
                        setAvatarUrl(publicUrlData.publicUrl);
                    } else {
                        setAvatarUrl(null);
                    }
                }
            } catch (error) {
                setMessage(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            getProfile();
        }
    }, [user]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const fileUrl = URL.createObjectURL(file);
            setAvatarUrl(fileUrl);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            let updatedAvatarPath = avatarUrl;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, {
                        cacheControl: '3600',
                        upsert: true,
                    });
                
                if (uploadError) throw uploadError;
                updatedAvatarPath = filePath;
            }

            const updates = {
                id: user.id,
                username,
                full_name: fullName,
                avatar_url: updatedAvatarPath,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            
            if (avatarFile && updatedAvatarPath) {
                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(updatedAvatarPath);
                setAvatarUrl(publicUrlData.publicUrl);
            }

            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-text-secondary">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-base flex items-center justify-center px-4">
            <div className="w-full max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-xl mt-8 border border-border">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center justify-start text-center">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg relative group">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-button-secondary text-text-secondary text-6xl font-bold">
                                    {fullName ? fullName.charAt(0).toUpperCase() : <UserIcon size={64} />}
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                <span className="text-white text-sm font-semibold">Change</span>
                                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                        
                        <div className="mt-6 w-full">
                            <h3 className="text-2xl font-bold">{fullName || 'User'}</h3>
                            <p className="text-sm text-text-secondary">@{username || 'unnamed'}</p>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <h2 className="text-3xl font-bold mb-6 text-text-base">Profile Settings</h2>

                        {message && (
                            <div className={`p-3 rounded-md mb-4 ${message.startsWith('Error') ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                                <p className="text-sm">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Email</label>
                                <input 
                                    type="text" 
                                    value={user?.email} 
                                    disabled 
                                    className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm text-text-secondary"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-text-secondary">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-base"
                                />
                            </div>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-base"
                                />
                            </div>
                            
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;