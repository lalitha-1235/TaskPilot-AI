import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  X,
  Check,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle,
  Ban,
  Users,
  Loader2,
} from "lucide-react";
import { FiSliders } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import {
  getTasks,
  createTask,
  deleteTask,
} from "../../services/taskService";

const PROJECTS = [
  "All Projects",
  "TaskPilot Auth System",
  "TaskPilot Core Layout",
  "E2E Testing Pipeline",
  "Cloud Ops",
  "Notifications Microservice",
  "AI Workflow Planner",
  "Workspace Design Revamp"
];
const STATUSES = ["All", "Todo", "In Progress", "Review", "Completed", "Blocked"];
const PRIORITIES = ["All", "High", "Medium", "Low"];
const SORT_OPTIONS = ["Newest First", "Due Date (ASC)", "Due Date (DESC)", "Priority", "Risk Score"];
const TEAM_MEMBERS = [
  { name: "Sarah Jenkins", initials: "SJ", color: "bg-purple-600/30 text-purple-200 border-purple-500/40" },
  { name: "Alex Riviera", initials: "AR", color: "bg-cyan-600/30 text-cyan-200 border-cyan-500/40" },
  { name: "Marcus Chen", initials: "MC", color: "bg-emerald-600/30 text-emerald-200 border-emerald-500/40" },
  { name: "Elena Rostova", initials: "ER", color: "bg-pink-600/30 text-pink-200 border-pink-500/40" },
  { name: "AI Agent", initials: "AI", color: "bg-gradient-to-tr from-purple-500/40 to-cyan-500/40 text-cyan-200 border-purple-400/40" },
];

// ─── Badge Helpers ────────────────────────────────────────────────────────────
function getStatusStyle(status) {
  switch (status) {
    case "Todo":        return { cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", Icon: Circle };
    case "In Progress": return { cls: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", Icon: Clock };
    case "Review":      return { cls: "text-purple-400 bg-purple-500/10 border-purple-500/20", Icon: Eye };
    case "Completed":   return { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", Icon: CheckCircle2 };
    case "Blocked":     return { cls: "text-red-400 bg-red-500/10 border-red-500/20", Icon: Ban };
    default:            return { cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", Icon: Circle };
  }
}

function getPriorityStyle(priority) {
  switch (priority) {
    case "High":   return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Low":    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    default:       return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  }
}

function getRiskStyle(score) {
  if (score >= 70) return { text: "text-red-400", label: "Critical" };
  if (score >= 40) return { text: "text-amber-400", label: "Elevated" };
  if (score >= 20) return { text: "text-cyan-400", label: "Low" };
  return { text: "text-emerald-400", label: "Safe" };
}

function getProgressColor(status, pct) {
  if (status === "Blocked") return "from-red-500 to-rose-600";
  if (status === "Completed") return "from-emerald-500 to-teal-400";
  return "from-purple-500 to-cyan-400";
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ taskId, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="size-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer outline-none"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-40 w-36 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {[
              { icon: Eye,    label: "View",   danger: false },
              { icon: Trash2, label: "Delete", danger: true  },
            ].map(({ icon: Icon, label, danger }) => (
              <button
                key={label}
                onClick={() => { setOpen(false); if (label === "Delete") onDelete(taskId); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer outline-none ${
                  danger
                    ? "text-red-400 hover:bg-red-500/5"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", project: PROJECTS[1], assigneeName: TEAM_MEMBERS[0].name,
  dueDate: "", priority: "Medium", status: "Todo", progress: 0, riskScore: 20,
};

function AddTaskModal({ open, onClose, onAdd, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const member = TEAM_MEMBERS.find(m => m.name === form.assigneeName) ?? TEAM_MEMBERS[0];
    onAdd({
      ...form,
      progress: parseInt(form.progress) || 0,
      riskScore: parseInt(form.riskScore) || 20,
      assignee: { name: member.name, initials: member.initials, color: member.color },
    }, () => {
      setForm(EMPTY_FORM);
      onClose();
    });
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-x-4 top-[8%] max-w-2xl mx-auto z-50 bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[84vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CheckSquare size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-200">Create New Task</h2>
              <p className="text-[11px] text-zinc-500">Assign to a sprint and configure AI risk.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold">Task Name *</label>
            <input
              required type="text"
              placeholder="e.g. 'Implement OAuth2 token refresh'"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3.5 text-zinc-200 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold">Project</label>
            <select
              value={form.project}
              onChange={e => setForm({ ...form, project: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
            >
              {PROJECTS.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold flex items-center gap-1"><Users size={11} className="text-purple-400" /> Assignee</label>
              <select
                value={form.assigneeName}
                onChange={e => setForm({ ...form, assigneeName: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
              >
                {TEAM_MEMBERS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
              >
                {["High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Status + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
              >
                {["Todo","In Progress","Review","Completed","Blocked"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold flex items-center gap-1"><Calendar size={11} className="text-cyan-400" /> Due Date</label>
              <input
                type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-300 outline-none"
              />
            </div>
          </div>

          {/* Progress + Risk Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Progress (%)</label>
              <input
                type="number" min={0} max={100}
                value={form.progress}
                onChange={e => setForm({ ...form, progress: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-200 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-400" /> AI Risk Score
              </label>
              <input
                type="number" min={0} max={100}
                value={form.riskScore}
                onChange={e => setForm({ ...form, riskScore: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/70 rounded-xl px-3 text-zinc-200 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-semibold outline-none"
            >Cancel</button>
            <button type="submit" disabled={submitting}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none flex items-center gap-2"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Tasks Page ──────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest First");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTasks();
      // Ensure each task has a mapped display 'id' field based on its _id
      const data = (res.data || []).map(task => ({
        ...task,
        id: task.id || `TP-${String(task._id).slice(-4).toUpperCase()}`,
      }));
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks from server.");
    } finally {
      setLoading(false);
    }
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleAdd(data, callback) {
    setSubmitting(true);
    try {
      const res = await createTask(data);
      const newTask = {
        ...res.data,
        id: res.data.id || `TP-${String(res.data._id).slice(-4).toUpperCase()}`,
      };
      setTasks(prev => [newTask, ...prev]);
      showToast(`Task "${data.name}" created successfully.`);
      if (callback) callback();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    // Find the real DB document _id matching either ._id or the mapped .id
    const taskToDelete = tasks.find(t => t.id === id || t._id === id);
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete._id);
      setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
      showToast(`Task ${id} has been removed.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete task.");
    }
  }

  // Filter + Sort
  const filtered = tasks
    .filter(t => {
      const q = search.toLowerCase();
      const matchSearch =
        (t.id || "").toLowerCase().includes(q) ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.project || "").toLowerCase().includes(q) ||
        (t.assignee?.name || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "Due Date (ASC)") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "Due Date (DESC)") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === "Priority") {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return rank[a.priority] - rank[b.priority];
      }
      if (sortBy === "Risk Score") return (b.riskScore ?? 0) - (a.riskScore ?? 0);
      // Newest First
      return (b.id || "").localeCompare(a.id || "");
    });

  // Summary counts
  const counts = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    blocked: tasks.filter(t => t.status === "Blocked").length,
    completed: tasks.filter(t => t.status === "Completed").length,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-zinc-950/90 border border-cyan-500/25 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="size-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-semibold text-zinc-200">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Tasks
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {filtered.length} / {tasks.length}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage sprint tasks, monitor AI risk signals, and track delivery progress.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none shrink-0"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks",   value: counts.total,      color: "text-zinc-200",    bg: "bg-zinc-500/10",    border: "border-zinc-700/30" },
          { label: "In Progress",   value: counts.inProgress, color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
          { label: "Blocked",       value: counts.blocked,    color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"  },
          { label: "Completed",     value: counts.completed,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`${stat.bg} border ${stat.border} rounded-2xl px-5 py-4 backdrop-blur-xl`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, name, project, or assignee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 bg-zinc-950/60 border border-zinc-900 focus:border-cyan-500/60 rounded-xl pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs flex items-center gap-1 shrink-0">
              <Filter size={11} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-cyan-500/60 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer min-w-[130px]"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs flex items-center gap-1 shrink-0">
              <FiSliders size={11} /> Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-cyan-500/60 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer min-w-[130px]"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs flex items-center gap-1 shrink-0">
              <ArrowUpDown size={11} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-cyan-500/60 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer min-w-[150px]"
            >
              {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-cyan-400 animate-spin" />
          <span className="ml-3 text-sm text-zinc-500">Loading backlog tasks...</span>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-10 text-center">
          <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-bold text-red-300">Failed to load tasks</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-14 text-center backdrop-blur-xl"
          >
            <div className="size-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
              <CheckSquare size={20} />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">No tasks matched</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              {tasks.length === 0 
                ? "Create your first backlog task using the button above."
                : "Adjust your search or filter settings to surface tasks in the backlog."}
            </p>
          </motion.div>
        ) : (
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500">
                    {["Task ID", "Task Name", "Project", "Assignee", "Due Date", "Priority", "Status", "Progress", "AI Risk", ""].map(h => (
                      <th key={h} className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  <AnimatePresence initial={false}>
                    {filtered.map((task, idx) => {
                      const { cls: statusCls, Icon: StatusIcon } = getStatusStyle(task.status);
                      const priorityCls = getPriorityStyle(task.priority);
                      const risk = getRiskStyle(task.riskScore ?? 20);
                      const progressGradient = getProgressColor(task.status, task.progress ?? 0);

                      return (
                        <motion.tr
                          key={task._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.22, delay: idx * 0.03 }}
                          className="group hover:bg-zinc-900/30 transition-colors"
                        >
                          {/* Task ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-500 whitespace-nowrap">
                            {task.id}
                          </td>

                          {/* Task Name */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <span className="font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors line-clamp-2 leading-relaxed">
                              {task.name}
                            </span>
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap max-w-[160px]">
                            <span className="truncate block">{task.project || "General"}</span>
                          </td>

                          {/* Assignee */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {task.assignee ? (
                              <div className="flex items-center gap-2">
                                <div className={`size-6 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${task.assignee.color}`}>
                                  {task.assignee.initials}
                                </div>
                                <span className="text-zinc-300 truncate max-w-[110px]">{task.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-zinc-600" />
                              {formatDate(task.dueDate)}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${priorityCls}`}>
                              {task.priority}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${statusCls}`}>
                              <StatusIcon size={9} />
                              {task.status}
                            </span>
                          </td>

                          {/* Progress */}
                          <td className="py-3.5 px-4 min-w-[110px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-zinc-500">{task.progress ?? 0}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${task.progress ?? 0}%` }}
                                  transition={{ duration: 0.7, ease: "easeOut" }}
                                  className={`h-full rounded-full bg-gradient-to-r ${progressGradient}`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* AI Risk */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={12} className={risk.text} />
                              <span className={`font-bold ${risk.text}`}>{task.riskScore ?? 20}</span>
                              <span className="text-[9px] text-zinc-600">/ {risk.label}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4">
                            <ActionMenu taskId={task.id} onDelete={handleDelete} />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3.5 border-t border-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-600">
              <span>Showing <span className="text-zinc-400 font-semibold">{filtered.length}</span> of <span className="text-zinc-400 font-semibold">{tasks.length}</span> tasks</span>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-500">Live sync active</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Add Task Modal */}
      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} submitting={submitting} />
    </div>
  );
}
