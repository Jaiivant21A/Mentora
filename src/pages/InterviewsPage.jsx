import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { supabase } from "../lib/supabaseClient";

// Static data for the types of interviews available.
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

  // Fetch past sessions from the database on load.
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

  // Auto-hide the feedback message after a few seconds.
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Creates a new session in the DB, then navigates to it.
  const start = async (type) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id, // The fix: now sending the user_id
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

  // Deletes a session from the database.
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Mock Interview Platform
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Sharpen your skills and track past practice sessions.
      </p>

      {/* Section to start a new interview */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {types.map((t) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">{t.description}</p>
            <button onClick={() => start(t.id)} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">
              Start
            </button>
          </div>
        ))}
      </div>
      
      {/* Display for user feedback message */}
      <div className="h-6 mb-3">
        {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
      </div>

      {/* Section for previous sessions */}
      <h2 className="text-xl font-semibold mb-3">Previous sessions</h2>
      {loading ? (
        <p className="text-gray-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">No sessions yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md p-3">
              <div className="min-w-0">
                <div className="font-semibold capitalize truncate">{s.type}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {s.completed_at ? "Completed" : "In progress"} •{" "}
                  {new Date(s.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link className="text-primary font-semibold" to={`/interview/${s.id}?type=${s.type}`}>
                  Open
                </Link>
                <button onClick={() => deleteSession(s.id)} className="p-2 rounded-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete session">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}