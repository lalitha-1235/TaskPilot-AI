import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  User,
  LayoutGrid,
  List,
  Target,
  TrendingUp,
  Coffee,
  Trash2,
} from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";
import { FiCalendar } from "react-icons/fi";
import { MdOutlineEventNote } from "react-icons/md";
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from "../../services/calendarService";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const EVENT_TYPES = {
  meeting:   { label: "Meeting",   color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",       dot: "bg-cyan-400" },
  deadline:  { label: "Deadline",  color: "bg-red-500/20 border-red-500/40 text-red-300",          dot: "bg-red-400" },
  ai_review: { label: "AI Review", color: "bg-purple-500/20 border-purple-500/40 text-purple-300", dot: "bg-purple-400" },
  sprint:    { label: "Sprint",    color: "bg-amber-500/20 border-amber-500/40 text-amber-300",    dot: "bg-amber-400" },
  personal:  { label: "Personal",  color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300", dot: "bg-emerald-400" },
};

const AI_SUGGESTIONS = [
  { id: 1, icon: Zap,           color: "text-amber-400 bg-amber-500/10 border-amber-500/20",     text: "Tasks with upcoming deadlines are highlighted. Review high-priority items to prevent schedule conflicts." },
  { id: 2, icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20",           text: "Project deadlines are auto-synced from your Projects module. Update project due dates there to reflect here." },
  { id: 3, icon: TrendingUp,    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", text: "Use 'Add Event' to schedule meetings, sprints, or personal reminders directly on your calendar." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }
  return days;
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Event Chip ───────────────────────────────────────────────────────────────
function EventChip({ event, onClick }) {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.meeting;
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(event); }}
      className={`w-full text-left text-[9px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer transition-opacity hover:opacity-80 ${cfg.color}`}
    >
      {event.title}
    </button>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────
function EventModal({ event, onClose, onDelete }) {
  if (!event) return null;
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.meeting;
  const isCustom = event.source === "custom";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-zinc-950/95 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`size-2.5 rounded-full ${cfg.dot}`} />
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${cfg.color}`}>
              {cfg.label}
            </span>
            {event.source !== "custom" && (
              <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                {event.source === "task" ? "Task" : "Project"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isCustom && (
              <button
                onClick={() => { onDelete(event); onClose(); }}
                className="text-zinc-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete event"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1">
              <X size={15} />
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-zinc-100 mb-3">{event.title}</h3>

        <div className="space-y-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <FiCalendar size={12} className="text-zinc-600 shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-zinc-600 shrink-0" />
            <span>{event.time} · {event.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={12} className="text-zinc-600 shrink-0" />
            <span>{event.project}</span>
          </div>
          {event.priority && (
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-zinc-600 shrink-0" />
              <span>Priority: {event.priority}</span>
            </div>
          )}
          {event.taskStatus && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-zinc-600 shrink-0" />
              <span>Status: {event.taskStatus}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────
const EMPTY_EVENT = { title: "", date: "", time: "09:00", duration: "1h", type: "meeting", project: "" };

function AddEventModal({ open, onClose, onAdd, saving }) {
  const [form, setForm] = useState(EMPTY_EVENT);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    onAdd({ ...form });
    setForm(EMPTY_EVENT);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-x-4 top-[12%] max-w-md mx-auto z-50 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Plus size={14} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-200">Add Event</h2>
              <p className="text-[10px] text-zinc-500">Schedule to your workspace calendar.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold">Event Title *</label>
            <input required type="text" placeholder="e.g. 'Sprint Review Meeting'"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-zinc-200 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Date *</label>
              <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-zinc-300 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Time</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-zinc-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
              >
                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold">Duration</label>
              <input type="text" placeholder="e.g. 1h, 30m" value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-zinc-200 placeholder-zinc-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold">Project</label>
            <input type="text" placeholder="e.g. TaskPilot Core" value={form.project}
              onChange={e => setForm({ ...form, project: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-zinc-200 placeholder-zinc-600 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
            <button type="button" onClick={onClose}
              className="h-9 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-semibold outline-none"
            >Cancel</button>
            <button type="submit" disabled={saving}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >{saving ? "Saving…" : "Save Event"}</button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Right Sidebar Panel ──────────────────────────────────────────────────────
function RightSidebar({ events, today, selectedDate, view }) {
  const todayStr = toDateString(today);
  const todayEvents = events.filter(e => e.date === todayStr).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const upcoming = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => ((a.date || "") + (a.time || "")).localeCompare((b.date || "") + (b.time || "")))
    .slice(0, 5);

  const productivity = {
    meetings:   events.filter(e => e.type === "meeting").length,
    deadlines:  events.filter(e => e.type === "deadline").length,
    ai_reviews: events.filter(e => e.type === "ai_review").length,
    sprints:    events.filter(e => e.type === "sprint").length,
  };

  return (
    <div className="space-y-4">
      {/* Today's Schedule */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
          <Coffee size={13} className="text-amber-400" />
          Today's Schedule
        </h3>
        {todayEvents.length === 0 ? (
          <p className="text-[11px] text-zinc-600 italic">No events scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map(ev => {
              const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.meeting;
              return (
                <div key={ev.id} className="flex items-start gap-2.5">
                  <div className={`size-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-300 leading-tight">{ev.title}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{ev.time} · {ev.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
          <MdOutlineEventNote size={14} className="text-cyan-400" />
          Upcoming Events
        </h3>
        <div className="space-y-2.5">
          {upcoming.length === 0 ? (
            <p className="text-[11px] text-zinc-600 italic">No upcoming events.</p>
          ) : (
            upcoming.map(ev => {
              const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.meeting;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${cfg.color}`}
                >
                  <div className={`size-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold leading-tight truncate">{ev.title}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{ev.date} · {ev.time}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
          <RiRobot2Line size={13} className="text-purple-400" />
          AI Suggestions
        </h3>
        <div className="space-y-2.5">
          {AI_SUGGESTIONS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.id} className={`flex gap-2.5 p-2.5 rounded-xl border ${s.color}`}>
                <Icon size={12} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Summary */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
          <TrendingUp size={13} className="text-emerald-400" />
          Month Summary
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Meetings",   value: productivity.meetings,   dot: "bg-cyan-400" },
            { label: "Deadlines",  value: productivity.deadlines,  dot: "bg-red-400" },
            { label: "AI Reviews", value: productivity.ai_reviews, dot: "bg-purple-400" },
            { label: "Sprints",    value: productivity.sprints,    dot: "bg-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900/50 rounded-xl p-2.5 border border-zinc-800/60">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`size-1.5 rounded-full ${s.dot}`} />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-lg font-extrabold text-zinc-200">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ events, currentDate }) {
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [currentDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const todayStr = toDateString(new Date());

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day, i) => {
        const dateStr = toDateString(day);
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;

        return (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`min-h-[200px] rounded-xl border p-2 ${
              isToday
                ? "border-purple-500/40 bg-purple-500/5"
                : "border-zinc-900 bg-zinc-950/30"
            }`}
          >
            <div className="text-center mb-2">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">{DAY_NAMES[day.getDay()]}</p>
              <div className={`text-sm font-bold mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
                isToday ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white" : "text-zinc-300"
              }`}>
                {day.getDate()}
              </div>
            </div>
            <div className="space-y-1">
              {dayEvents.map(ev => {
                const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.meeting;
                return (
                  <div key={ev.id} className={`text-[9px] font-semibold px-1.5 py-1 rounded border truncate ${cfg.color}`}>
                    <span className="block truncate">{ev.time}</span>
                    <span className="block truncate">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Fetch events from MongoDB (all time — no range filter) ─────────────────
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCalendarEvents();
      setEvents(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }
  function goToday()   { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); }

  // ── Create custom event ────────────────────────────────────────────────────
  async function handleAddEvent(data) {
    try {
      setSaving(true);
      const res = await createCalendarEvent(data);
      setEvents(prev => [...prev, res.data]);
      setAddModalOpen(false);
      showToast(`Event "${res.data.title}" added to the calendar.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete custom event ────────────────────────────────────────────────────
  async function handleDeleteEvent(event) {
    try {
      await deleteCalendarEvent(event._id || event.id);
      setEvents(prev => prev.filter(e => (e._id || e.id) !== (event._id || event.id)));
      showToast(`Event "${event.title}" removed.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete event.");
    }
  }

  // Build calendar grid
  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);

  // Filter events by search
  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => {
      const matchSearch = !q
        || (e.title || "").toLowerCase().includes(q)
        || (e.project || "").toLowerCase().includes(q);
      return matchSearch;
    });
  }, [events, search]);

  const todayStr = toDateString(today);

  return (
    <div className="space-y-6 pb-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-zinc-950/90 border border-purple-500/25 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="size-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-semibold text-zinc-200">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Calendar
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {loading ? "…" : filteredEvents.length} Events
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Sprint timelines, AI-driven scheduling, and workspace events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-44 bg-zinc-950/60 border border-zinc-900 focus:border-purple-500/60 rounded-xl pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-xl p-0.5 h-9">
            {[
              { key: "month", icon: LayoutGrid },
              { key: "week",  icon: List },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-3 h-full rounded-[10px] text-xs font-semibold transition-all cursor-pointer outline-none capitalize ${
                  view === key
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={12} />
                {key}
              </button>
            ))}
          </div>

          {/* Add Event */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] outline-none shadow-lg shadow-purple-500/10"
          >
            <Plus size={13} />
            Add Event
          </button>
        </div>
      </div>

      {/* ── Month Navigator ── */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth}
          className="size-8 rounded-xl border border-zinc-800 bg-zinc-950/50 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer outline-none"
        >
          <ChevronLeft size={15} />
        </button>

        <motion.h2
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-zinc-100 min-w-[180px] text-center"
        >
          {MONTH_NAMES[month]} {year}
        </motion.h2>

        <button onClick={nextMonth}
          className="size-8 rounded-xl border border-zinc-800 bg-zinc-950/50 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer outline-none"
        >
          <ChevronRight size={15} />
        </button>

        <button onClick={goToday}
          className="ml-1 h-8 px-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer outline-none"
        >
          Today
        </button>

        {/* Event type legend */}
        <div className="ml-auto hidden lg:flex items-center gap-3 flex-wrap">
          {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold">
              <div className={`size-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main layout: Calendar + Right Sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

        {/* Calendar Grid / Week View */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="size-10 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400 animate-pulse">
                <CalendarIcon size={18} />
              </div>
              <p className="text-xs text-zinc-500 font-semibold">Loading events…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-sm text-red-400 font-semibold">{error}</p>
              <button
                onClick={fetchEvents}
                className="text-xs px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === "month" ? (
                <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 border-b border-zinc-900">
                    {DAY_NAMES.map(d => (
                      <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Date Cells */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((cell, idx) => {
                      const dateStr = toDateString(cell.date);
                      const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                      const isToday = dateStr === todayStr;
                      const isCurrentMonth = cell.isCurrentMonth;
                      const showMax = 2;
                      const overflow = dayEvents.length - showMax;

                      return (
                        <motion.div
                          key={dateStr}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.004 }}
                          className={`min-h-[100px] border-b border-r border-zinc-900/60 p-1.5 transition-colors group cursor-default ${
                            !isCurrentMonth ? "bg-zinc-950/20" : "hover:bg-zinc-900/20"
                          } ${idx % 7 === 6 ? "border-r-0" : ""} ${idx >= 35 ? "border-b-0" : ""}`}
                        >
                          {/* Date number */}
                          <div className="flex justify-end mb-1">
                            <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full select-none ${
                              isToday
                                ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                                : isCurrentMonth
                                ? "text-zinc-300 group-hover:text-zinc-100"
                                : "text-zinc-700"
                            }`}>
                              {cell.date.getDate()}
                            </span>
                          </div>

                          {/* Events */}
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, showMax).map(ev => (
                              <EventChip key={ev.id} event={ev} onClick={setSelectedEvent} />
                            ))}
                            {overflow > 0 && (
                              <button className="w-full text-left text-[9px] text-zinc-500 hover:text-zinc-300 px-1.5 cursor-pointer transition-colors">
                                +{overflow} more
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-4">
                  <WeekView events={filteredEvents} currentDate={currentDate} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Right Sidebar */}
        <RightSidebar events={filteredEvents} today={today} selectedDate={currentDate} view={view} />
      </div>

      {/* Modals */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
      />
      <AddEventModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddEvent}
        saving={saving}
      />
    </div>
  );
}
