import { useEffect, useMemo, useState } from "react";
import {
    PlusCircle, Pencil, Trash2, Save, X, Calendar as CalendarIcon,
    Percent, ArrowUpDown, CheckCircle2, Copy,
} from "lucide-react";
import GoalTracker from "../components/GoalTracker";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// (Helper functions remain the same as they are not related to styling)
const PREFS_KEY = "mentora-goals-prefs";
const loadPrefs = () => { try { const raw = localStorage.getItem(PREFS_KEY); return raw ? JSON.parse(raw) : { sortBy: "created_at_desc", showCompleted: true }; } catch { return { sortBy: "created_at_desc", showCompleted: true }; } };
const savePrefs = (p) => { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); };
const formatDBDate = (isoOrDate) => { if (!isoOrDate) return null; const d = new Date(isoOrDate); const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0"); return `${yyyy}-${mm}-${dd}`; };

const emptyForm = { title: "", progress: 0, deadline: "" };
const sortOptions = [{ id: "created_at_desc", label: "Recently created" }, { id: "deadline_asc", label: "Deadline (soonest)" }, { id: "progress_desc", label: "Progress (high → low)" }, ];

export default function GoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [prefs, setPrefs] = useState(() => loadPrefs());

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [query, setQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [lastMsg, setLastMsg] = useState("");

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGoals = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase.from("goals").select("*").eq("user_id", user.id);
            if (error) setErrorMsg("Could not fetch goals.");
            else setGoals(data);
            setLoading(false);
        };
        fetchGoals();
    }, [user]);

    useEffect(() => {
        savePrefs(prefs);
    }, [prefs]);

    useEffect(() => {
        if (lastMsg) {
            const timer = setTimeout(() => setLastMsg(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastMsg]);

    const filteredSorted = useMemo(() => {
        let list = goals.filter((g) => (prefs.showCompleted ? true : g.status !== "Completed"));
        if (query.trim()) list = list.filter((g) => g.title.toLowerCase().includes(query.trim().toLowerCase()));
        switch (prefs.sortBy) {
            case "deadline_asc": return [...list].sort((a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity));
            case "progress_desc": return [...list].sort((a, b) => b.progress - a.progress);
            default: return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    }, [goals, query, prefs]);
    
    const resetForm = () => {
        setForm(emptyForm);
        setErrorMsg("");
    };

    const addGoal = async () => {
        if (!form.title.trim()) return setErrorMsg("Title is required.");
        setIsSubmitting(true);
        const newGoal = { user_id: user.id, title: form.title.trim(), progress: Number(form.progress) || 0, deadline: form.deadline ? formatDBDate(form.deadline) : null, status: Number(form.progress) === 100 ? "Completed" : "In Progress" };
        const { data, error } = await supabase.from("goals").insert(newGoal).select().single();
        if (error) setErrorMsg("Failed to add goal.");
        else { setGoals([data, ...goals]); setLastMsg("Goal added"); resetForm(); }
        setIsSubmitting(false);
    };

    const startEdit = (goal) => {
        setEditingId(goal.id);
        setForm({ title: goal.title, progress: goal.progress, deadline: goal.deadline });
    };

    const saveEdit = async () => {
        if (!form.title.trim()) return setErrorMsg("Title is required.");
        setIsSubmitting(true);
        const updatedGoal = { title: form.title.trim(), progress: Number(form.progress), deadline: form.deadline ? formatDBDate(form.deadline) : null, status: Number(form.progress) === 100 ? "Completed" : "In Progress" };
        const { data, error } = await supabase.from("goals").update(updatedGoal).eq("id", editingId).select().single();
        if (error) setErrorMsg("Failed to update goal.");
        else { setGoals(goals.map(g => (g.id === editingId ? data : g))); setLastMsg("Goal updated"); setEditingId(null); resetForm(); }
        setIsSubmitting(false);
    };
    
    const cancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const removeGoal = async (id) => {
        if (!confirm("Delete this goal?")) return;
        const { error } = await supabase.from("goals").delete().eq("id", id);
        if (error) setErrorMsg("Failed to delete goal.");
        else { setGoals(goals.filter((g) => g.id !== id)); setLastMsg("Goal deleted"); }
    };

    const markComplete = async (id) => {
        const { data, error } = await supabase.from("goals").update({ progress: 100, status: "Completed" }).eq("id", id).select().single();
        if (error) setErrorMsg("Failed to update goal.");
        else { setGoals(goals.map(g => (g.id === id ? data : g))); setLastMsg("Marked as complete"); }
    };

    const duplicateGoal = async (goal) => {
        const newGoal = { user_id: user.id, title: `${goal.title} (copy)`, progress: goal.progress, deadline: goal.deadline, status: goal.status };
        const { data, error } = await supabase.from("goals").insert(newGoal).select().single();
        if (error) setErrorMsg("Failed to duplicate goal.");
        else { setGoals([data, ...goals]); setLastMsg("Goal duplicated"); }
    };

    const onFormKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); editingId ? saveEdit() : addGoal(); }
        if (e.key === "Escape" && editingId) { e.preventDefault(); cancelEdit(); }
    };

    if (loading) return <p className="text-text-base">Loading your goals...</p>;

    return (
        <div className="p-6">
            <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-base">My Goals</h1>
                    <p className="text-text-secondary">Create SMART goals, track progress, and keep deadlines in sight.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                        <select className="pl-9 pr-3 py-2 border rounded-md bg-card text-text-base border-border" value={prefs.sortBy} onChange={(e) => setPrefs(p => ({ ...p, sortBy: e.target.value }))}>
                            {sortOptions.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 border rounded-md px-3 bg-card border-border">
                        <input type="checkbox" className="accent-primary" checked={prefs.showCompleted} onChange={(e) => setPrefs(p => ({ ...p, showCompleted: e.target.checked }))}/>
                        <span className="text-sm text-text-secondary">Show completed</span>
                    </label>
                </div>
            </div>
            
            <div className="h-6 mb-3">
                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                {lastMsg && <p className="text-sm text-green-600">{lastMsg}</p>}
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mb-6" onKeyDown={onFormKeyDown}>
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-text-secondary mb-1" htmlFor="goal-title">Title</label>
                        <input id="goal-title" className="w-full border rounded-md px-3 py-2 bg-background text-text-base border-border" placeholder="e.g., Finish React course" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1 flex items-center gap-1" htmlFor="goal-progress"><Percent size={16} /> Progress (0–100)</label>
                        <input id="goal-progress" type="number" min={0} max={100} className="w-full border rounded-md px-3 py-2 bg-background text-text-base border-border" value={form.progress} onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1 flex items-center gap-1" htmlFor="goal-deadline"><CalendarIcon size={16} /> Deadline</label>
                        <input id="goal-deadline" type="date" className="w-full border rounded-md px-3 py-2 bg-background text-text-base border-border" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    {editingId ? (
                        <>
                            <button onClick={saveEdit} disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"><Save size={18} /> {isSubmitting ? 'Saving...' : 'Save'}</button>
                            <button onClick={cancelEdit} className="flex items-center gap-2 bg-button-secondary text-text-secondary px-4 py-2 rounded-md"><X size={18} /> Cancel</button>
                        </>
                    ) : (
                        <button onClick={addGoal} disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"><PlusCircle size={18} /> {isSubmitting ? 'Adding...' : 'Add Goal'}</button>
                    )}
                    <input className="ml-auto border rounded-md px-3 py-2 w-full md:w-64 bg-card text-text-base border-border" placeholder="Search goals..." value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
            </div>

            <div className="space-y-4">
                {filteredSorted.map((g) => (
                    <div key={g.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                        <div className="flex-1">
                            <GoalTracker goal={g} />
                        </div>
                        <div className="flex gap-2">
                            {g.status !== "Completed" && <button onClick={() => markComplete(g.id)} className="p-2 rounded-md border border-border hover:bg-background" title="Mark complete"><CheckCircle2 size={18} className="text-text-secondary" /></button>}
                            <button onClick={() => duplicateGoal(g)} className="p-2 rounded-md border border-border hover:bg-background" title="Duplicate"><Copy size={18} className="text-text-secondary" /></button>
                            <button onClick={() => startEdit(g)} className="p-2 rounded-md border border-border hover:bg-background" title="Edit"><Pencil size={18} className="text-text-secondary" /></button>
                            <button onClick={() => removeGoal(g.id)} className="p-2 rounded-md border border-border hover:bg-background" title="Delete"><Trash2 size={18} className="text-text-secondary" /></button>
                        </div>
                    </div>
                ))}
                {filteredSorted.length === 0 && <p className="text-text-tertiary text-center py-4">No goals match your filters.</p>}
            </div>
        </div>
    );
}