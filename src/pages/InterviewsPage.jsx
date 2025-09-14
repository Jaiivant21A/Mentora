import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const STORE_KEY = "mentora-interviews";

const loadAll = () => {
  try {
    const r = localStorage.getItem(STORE_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
};
const saveAll = (arr) => localStorage.setItem(STORE_KEY, JSON.stringify(arr));

const types = [
  {
    id: "behavioral",
    title: "Behavioral Interview",
    description: "Practice STAR responses.",
  },
  {
    id: "react",
    title: "React Technical",
    description: "Test React fundamentals.",
  },
  {
    id: "system",
    title: "System Design",
    description: "Discuss scalable designs.",
  },
];

export default function InterviewsPage() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState(() => loadAll());
  const [msg, setMsg] = useState("");

  // Keep in sync if other tabs change storage (note: storage event does NOT fire in the same tab) [web:141][web:137]
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORE_KEY) setSessions(loadAll());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const start = (type) => nav(`/interview?type=${type}`);

  const deleteSession = (id) => {
    if (!confirm("Delete this session?")) return;
    // Read-modify-write localStorage, then update state immediately [web:78][web:140]
    const next = loadAll().filter((s) => s.id !== id);
    saveAll(next);
    setSessions(next);
    setMsg("Session deleted");
    setTimeout(() => setMsg(""), 1200);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Mock Interview Platform
      </h1>
      <p className="text-gray-600 mb-8">
        Sharpen your skills and track past practice sessions.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {types.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
            <p className="text-gray-600 mt-2 mb-4">{t.description}</p>
            <button
              onClick={() => start(t.id)}
              className="bg-primary text-white font-semibold px-4 py-2 rounded-lg"
            >
              Start
            </button>
          </div>
        ))}
      </div>

      <div className="sr-only" aria-live="polite">
        {msg}
      </div>

      <h2 className="text-xl font-semibold mb-3">Previous sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white border rounded-md p-3"
            >
              <div className="min-w-0">
                <div className="font-semibold capitalize truncate">
                  {s.type}
                </div>
                <div className="text-sm text-gray-600">
                  {s.completedAt ? "Completed" : "In progress"} •{" "}
                  {new Date(s.startedAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  className="text-primary font-semibold"
                  to={`/interview?type=${s.type}`}
                >
                  Open
                </Link>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="p-2 rounded-md border hover:bg-gray-100"
                  title="Delete session"
                  aria-label="Delete session"
                >
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
