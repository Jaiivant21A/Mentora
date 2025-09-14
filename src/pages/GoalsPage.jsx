// src/pages/GoalsPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Save,
  X,
  Calendar as CalendarIcon,
  Percent,
  ArrowUpDown,
  CheckCircle2,
  Copy,
} from "lucide-react";
import GoalTracker from "../components/GoalTracker";

// Storage keys
const STORAGE_KEY = "mentora-goals";
const PREFS_KEY = "mentora-goals-prefs";

// Load/save helpers (resilient to bad JSON)
const loadGoals = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}; // Lazy initialization paired with write-through effects is a reliable React + localStorage pattern [web:78][web:76]

const saveGoals = (goals) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}; // Persist changes immediately to avoid losing state on refresh [web:78]

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw
      ? JSON.parse(raw)
      : { sortBy: "updatedAt_desc", showCompleted: true };
  } catch {
    return { sortBy: "updatedAt_desc", showCompleted: true };
  }
}; // Persisting UI preferences locally improves UX without a backend [web:78]

const savePrefs = (p) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}; // Preference durability across sessions via localStorage is a common technique [web:78]

// Date helpers for dd/mm/yy formatting
const formatDDMMYY = (isoOrDate) => {
  const d = new Date(isoOrDate);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}; // Custom formatting avoids locale variance from toLocaleDateString [web:116][web:118]

const ddmmyyToISO = (display) => {
  if (!display) return "";
  const parts = display.split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yy] = parts;
  // Heuristic: 00–68 => 2000s, 69–99 => 1900s (common approach for two-digit years)
  const yyyy = Number(yy) <= 68 ? `20${yy}` : `19${yy}`;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}; // Convert dd/mm/yy to yyyy-mm-dd so the <input type="date"> can prefill correctly [web:116]

// Defaults
const emptyForm = { title: "", progress: 0, deadline: "" };
const sortOptions = [
  { id: "updatedAt_desc", label: "Recently updated" },
  { id: "deadline_asc", label: "Deadline (soonest)" },
  { id: "progress_desc", label: "Progress (high → low)" },
]; // Helpful presets keep task triage simple and predictable [web:76]

export default function GoalsPage() {
  // Persistent data
  const [goals, setGoals] = useState(() => loadGoals()); // Lazy init prevents overwrite on first render [web:78]
  const pref0 = loadPrefs(); // Read persisted UI preferences once at mount time [web:78]
  const [sortBy, setSortBy] = useState(pref0.sortBy);
  const [showCompleted, setShowCompleted] = useState(pref0.showCompleted);

  // Form/UI state
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastMsg, setLastMsg] = useState("");

  // Persist data and preferences on change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]); // Write-through persistence is the safest approach with localStorage [web:78]
  useEffect(() => {
    savePrefs({ sortBy, showCompleted });
  }, [sortBy, showCompleted]); // Keep UI preferences durable between visits [web:78]

  // Derived list
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = goals.filter((g) => (showCompleted ? true : g.progress < 100));
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q));

    const byDeadline = (d) => {
      // d is a dd/mm/yy string; convert to a sortable number
      const iso = ddmmyyToISO(d);
      const t = Date.parse(iso);
      return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
    }; // Normalize display date to sortable timestamp safely [web:116]

    switch (sortBy) {
      case "deadline_asc":
        return [...list].sort(
          (a, b) => byDeadline(a.deadline) - byDeadline(b.deadline),
        );
      case "progress_desc":
        return [...list].sort((a, b) => b.progress - a.progress);
      case "updatedAt_desc":
      default:
        return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }, [goals, query, sortBy, showCompleted]); // This keeps UI stable and consistent during filtering/sorting [web:76]

  // Validation
  const validate = ({ requireDeadline = true } = {}) => {
    if (!form.title.trim()) return "Title is required";
    const p = Number(form.progress);
    if (Number.isNaN(p) || p < 0 || p > 100) return "Progress must be 0–100";
    if (requireDeadline && !form.deadline) return "Deadline is required";
    return null;
  }; // Simple client checks; schema libs can be added later if needed [web:76]

  const resetForm = () => {
    setForm(emptyForm);
    setErrorMsg("");
  };

  // CRUD
  const addGoal = () => {
    const err = validate({ requireDeadline: true });
    if (err) {
      setErrorMsg(err);
      setLastMsg("");
      return;
    }
    const g = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      progress: Number(form.progress),
      deadline: formatDDMMYY(form.deadline), // Save as dd/mm/yy consistently [web:116]
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGoals((prev) => [g, ...prev]);
    setLastMsg("Goal added");
    resetForm();
  }; // Create and persist via effect to avoid losing new items on refresh [web:78][web:76]

  const startEdit = (id) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    setEditingId(id);
    setForm({
      title: g.title,
      progress: g.progress,
      deadline: ddmmyyToISO(g.deadline),
    }); // Prefill from dd/mm/yy to ISO for date input [web:116]
    setErrorMsg("");
    setLastMsg("");
  }; // Users see the current deadline and don’t need to reselect unless changing it, which matches expected CRUD UX [web:76]

  const saveEdit = () => {
    const p = Number(form.progress);
    const err = !form.title.trim()
      ? "Title is required"
      : Number.isNaN(p) || p < 0 || p > 100
        ? "Progress must be 0–100"
        : "";
    if (err) {
      setErrorMsg(err);
      setLastMsg("");
      return;
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== editingId) return g;
        const newDeadline = form.deadline
          ? formatDDMMYY(form.deadline)
          : g.deadline; // Keep existing deadline unless user picked a new one [web:116]
        return {
          ...g,
          title: form.title.trim(),
          progress: Number(form.progress),
          deadline: newDeadline,
          updatedAt: Date.now(),
        };
      }),
    );
    setEditingId(null);
    setLastMsg("Goal updated");
    resetForm();
  }; // Update and persist changes using the same pattern as additions for consistency [web:78][web:76]

  const cancelEdit = () => {
    setEditingId(null);
    setLastMsg("Edit canceled");
    resetForm();
  }; // Cancel editing is an expected form affordance [web:76]

  const removeGoal = (id) => {
    if (!confirm("Delete this goal?")) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setLastMsg("Goal deleted");
  }; // Deleting via filter-then-save is the standard localStorage CRUD approach [web:78]

  const markComplete = (id) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: 100, updatedAt: Date.now() } : g,
      ),
    );
    setLastMsg("Marked as complete");
  }; // Quick-complete is a common productivity QoL [web:76]

  const duplicateGoal = (id) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    const copy = {
      ...g,
      id: crypto.randomUUID(),
      title: `${g.title} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGoals((prev) => [copy, ...prev]);
    setLastMsg("Goal duplicated");
  }; // Duplication helps iterate on similar SMART goals quickly [web:76]

  // Keyboard helpers
  const onFormKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      editingId ? saveEdit() : addGoal();
    }
    if (e.key === "Escape" && editingId) {
      e.preventDefault();
      cancelEdit();
    }
  }; // Keyboard shortcuts and Esc to cancel improve accessibility and speed [web:94]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600">
            Create SMART goals, track progress, and keep deadlines in sight.
            Saved locally in this browser.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <ArrowUpDown
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              className="pl-9 pr-3 py-2 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort goals"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 border rounded-md px-3">
            <input
              type="checkbox"
              className="accent-primary"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Show completed</span>
          </label>
        </div>
      </div>
      {/* Live regions for screen readers */}
      <p className="sr-only" aria-live="polite">
        {errorMsg}
      </p>
      <p className="sr-only" aria-live="polite">
        {lastMsg}
      </p>{" "}
      {/* Announce success actions non-visually as well [web:94] */}
      {/* Add / Edit Form */}
      <div
        className="bg-white border rounded-lg p-4 mb-6"
        onKeyDown={onFormKeyDown}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label
              className="block text-sm text-gray-600 mb-1"
              htmlFor="goal-title"
            >
              Title
            </label>
            <input
              id="goal-title"
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g., Finish React course on Coursera"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              aria-invalid={Boolean(errorMsg && !form.title.trim())}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm text-gray-600 mb-1 flex items-center gap-1"
              htmlFor="goal-progress"
            >
              <Percent size={16} /> Progress (0–100)
            </label>
            <input
              id="goal-progress"
              type="number"
              min={0}
              max={100}
              className="w-full border rounded-md px-3 py-2"
              value={form.progress}
              onChange={(e) =>
                setForm((f) => ({ ...f, progress: e.target.value }))
              }
              aria-invalid={Boolean(
                errorMsg &&
                  (Number.isNaN(Number(form.progress)) ||
                    form.progress < 0 ||
                    form.progress > 100),
              )}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm text-gray-600 mb-1 flex items-center gap-1"
              htmlFor="goal-deadline"
            >
              <CalendarIcon size={16} /> Deadline
            </label>
            <input
              id="goal-deadline"
              type="date"
              className="w-full border rounded-md px-3 py-2"
              value={form.deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, deadline: e.target.value }))
              }
              aria-invalid={Boolean(errorMsg && !editingId && !form.deadline)}
              required={!editingId} // Only required for new goals; edits keep old deadline if blank
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Ctrl/Cmd+Enter to {editingId ? "save" : "add"}, Esc to cancel
              edit.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {editingId ? (
            <>
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md"
              >
                <Save size={18} /> Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                <X size={18} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addGoal}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md"
            >
              <PlusCircle size={18} /> Add Goal
            </button>
          )}

          <input
            className="ml-auto border rounded-md px-3 py-2 w-full md:w-64"
            placeholder="Search goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search goals"
          />
        </div>

        {errorMsg && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
      {/* Goal list */}
      <div className="space-y-4">
        {filteredSorted.length > 0 ? (
          filteredSorted.map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <div className="flex-1">
                {/* GoalTracker should render goal.deadline directly, which is already dd/mm/yy */}
                <GoalTracker goal={g} />
              </div>
              <div className="flex gap-2">
                {g.progress < 100 && (
                  <button
                    onClick={() => markComplete(g.id)}
                    className="p-2 rounded-md border hover:bg-gray-100"
                    title="Mark complete"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => duplicateGoal(g.id)}
                  className="p-2 rounded-md border hover:bg-gray-100"
                  title="Duplicate"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => startEdit(g.id)}
                  className="p-2 rounded-md border hover:bg-gray-100"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => removeGoal(g.id)}
                  className="p-2 rounded-md border hover:bg-gray-100"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No goals yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
