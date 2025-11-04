import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const types = [
  { 
    id: "dsa", 
    title: "Data Structures & Algorithms", 
    description: "Test your foundation in core CS." 
  },
  { 
    id: "frontend", 
    title: "Web Development (Frontend)", 
    description: "Practice React, JS, and CSS." 
  },
  { 
    id: "system-design", 
    title: "System Design", 
    description: "Discuss scalable architectures." 
  },
];

const difficulties = [
    { id: 'easy', label: 'Easy', className: 'bg-green-600 hover:bg-green-700' },
    { id: 'medium', label: 'Medium', className: 'bg-yellow-600 hover:bg-yellow-700' },
    { id: 'hard', label: 'Hard', className: 'bg-red-600 hover:bg-red-700' },
];

export default function InterviewsPage() {
    const nav = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    
    // --- NEW STATE ---
    // This state controls which view to show:
    // null = Show subject list
    // {id, title, ...} = Show difficulty for that subject
    const [selectedType, setSelectedType] = useState(null);
    // -----------------

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('interview_sessions')
                .select('*, difficulty') 
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

    // This 'start' function is already perfect and needs no changes
    const start = async (type, difficulty) => {
        if (!user || isStarting) return;

        setIsStarting(true);
        setMsg("Generating your interview questions...");

        try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke(
                'generate-questions', 
                { body: { type, difficulty } }
            );

            if (functionError) throw new Error(functionError.message);

            const { data: sessionData, error: insertError } = await supabase
                .from('interview_sessions')
                .insert({
                    user_id: user.id,
                    type: type,
                    difficulty: difficulty,
                    questions: functionData.questions 
                })
                .select()
                .single();

            if (insertError) throw insertError;
            
            if (sessionData) {
                nav(`/interview/${sessionData.id}?type=${type}&difficulty=${difficulty}`);
            }

        } catch (error) {
            console.error("Failed to start session:", error);
            setMsg(`Error: ${error.message || "Could not start your session."}`);
        } finally {
            setIsStarting(false);
            if (!msg.startsWith("Error")) {
                setTimeout(() => setMsg(""), 2000);
            }
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

            {/* --- NEW: Conditional Rendering --- */}
            {!selectedType ? (
                // === VIEW 1: SELECT SUBJECT ===
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {types.map((t) => (
                        <div key={t.id} className="bg-card p-6 rounded-lg shadow-md border border-border flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-text-base">{t.title}</h3>
                                <p className="text-text-secondary mt-2 mb-4">{t.description}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedType(t)} // Set the selected type
                                className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-full mt-2"
                                disabled={isStarting}
                            >
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                // === VIEW 2: SELECT DIFFICULTY ===
                <div className="bg-card p-6 rounded-lg shadow-md border border-border mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-base">
                            Select Difficulty for: {selectedType.title}
                        </h3>
                        <button 
                            onClick={() => setSelectedType(null)} // Go back
                            className="text-sm text-text-secondary hover:underline"
                            disabled={isStarting}
                        >
                            (Change Subject)
                        </button>
                    </div>
                    <div className="flex gap-4">
                        {difficulties.map((d) => (
                            <button
                                key={d.id}
                                onClick={() => start(selectedType.id, d.id)}
                                className={`flex-1 text-white font-semibold px-4 py-3 rounded-lg ${d.className} disabled:opacity-50`}
                                disabled={isStarting}
                            >
                                {isStarting ? "..." : d.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* ---------------------------------- */}
            
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
                                <div className="font-semibold capitalize truncate text-text-base">
                                    {s.type} - {s.difficulty || 'Not set'}
                                </div>
                                <div className="text-sm text-text-secondary">
                                    {s.completed_at ? "Completed" : "In progress"} •{" "}
                                    {new Date(s.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link className="text-primary font-semibold" to={`/interview/${s.id}?type=${s.type}&difficulty=${s.difficulty}`}>
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