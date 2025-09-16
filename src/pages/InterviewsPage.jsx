import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const types = [
    { id: "behavioral", title: "Behavioral Interview", description: "Practice STAR responses." },
    { id: "react", title: "React Technical", description: "Test React fundamentals." },
    { id: "system", title: "System Design", description: "Discuss scalable designs." },
];

export default function InterviewsPage() {
    const nav = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('interview_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) console.error("Error fetching sessions:", error);
            else setSessions(data || []);
            setLoading(false);
        };
        fetchSessions();
    }, [user]);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const start = async (type) => {
        if (!user) {
            console.error("User not authenticated.");
            return;
        }

        const { data, error } = await supabase
            .from('interview_sessions')
            .insert({
                user_id: user.id,
                type: type
            })
            .select()
            .single();

        if (error) {
            console.error("Could not create interview session", error);
            setMsg("Error: Could not create session.");
            return;
        }
        
        if (data) {
            nav(`/interview/${data.id}?type=${type}`);
        }
    };

    const deleteSession = async (id) => {
        if (!confirm("Delete this session?")) return;

        const { error } = await supabase
            .from('interview_sessions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting session:", error);
            setMsg("Error: Could not delete session.");
        } else {
            setSessions(sessions.filter((s) => s.id !== id));
            setMsg("Session deleted.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-text-base mb-2">
                Mock Interview Platform
            </h1>
            <p className="text-text-secondary mb-8">
                Sharpen your skills and track past practice sessions.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {types.map((t) => (
                    <div key={t.id} className="bg-card p-6 rounded-lg shadow-md border border-border">
                        <h3 className="text-xl font-bold text-text-base">{t.title}</h3>
                        <p className="text-text-secondary mt-2 mb-4">{t.description}</p>
                        <button onClick={() => start(t.id)} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            Start
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="h-6 mb-3">
                {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
            </div>

            <h2 className="text-xl font-semibold text-text-base mb-3">Previous sessions</h2>
            {loading ? (
                <p className="text-text-secondary">Loading sessions...</p>
            ) : sessions.length === 0 ? (
                <p className="text-text-tertiary">No sessions yet.</p>
            ) : (
                <div className="space-y-2">
                    {sessions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-card border border-border rounded-md p-3">
                            <div className="min-w-0">
                                <div className="font-semibold capitalize truncate text-text-base">{s.type}</div>
                                <div className="text-sm text-text-secondary">
                                    {s.completed_at ? "Completed" : "In progress"} •{" "}
                                    {new Date(s.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link className="text-primary font-semibold" to={`/interview/${s.id}?type=${s.type}`}>
                                    Open
                                </Link>
                                <button onClick={() => deleteSession(s.id)} className="p-2 rounded-md border border-border hover:bg-background" title="Delete session">
                                    <Trash2 size={18} className="text-text-secondary" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}