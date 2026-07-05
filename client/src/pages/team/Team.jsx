import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Sparkles,
  X,
  Check,
  CheckCircle2,
  Star,
  Briefcase,
  Mail,
  GitBranch,
  Globe,
  TrendingUp,
  Zap,
  MoreHorizontal,
  UserCheck,
  Clock,
  Shield,
  Code2,
  Palette,
  Server,
  TestTube,
  Bot,
  Crown,
} from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";
import { FiActivity } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROLES = ["All", "Engineering", "Design", "DevOps", "QA", "AI Agent", "Leadership"];

const SKILL_ICONS = {
  React: Code2, "Node.js": Server, Python: Code2, TypeScript: Code2,
  "UI/UX": Palette, Figma: Palette, "AWS": Server, "CI/CD": Server,
  Cypress: TestTube, "Jest": TestTube, "ML/AI": Bot, Automation: Bot,
  Strategy: Crown, "System Design": Server, "Tailwind": Palette,
};

const INITIAL_MEMBERS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Engineering",
    title: "Senior Frontend Engineer",
    initials: "SJ",
    gradient: "from-purple-600 to-violet-400",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
    status: "online",
    email: "sarah@taskpilot.ai",
    github: "sarahj",
    location: "San Francisco, CA",
    joinDate: "Jan 2025",
    projects: ["TaskPilot Auth System", "Workspace Design Revamp"],
    skills: ["React", "TypeScript", "Tailwind", "Figma"],
    aiScore: 94,
    tasksCompleted: 42,
    velocity: 98,
    availability: 88,
  },
  {
    id: 2,
    name: "Alex Riviera",
    role: "Engineering",
    title: "Full-Stack Engineer",
    initials: "AR",
    gradient: "from-cyan-500 to-sky-400",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/10",
    status: "online",
    email: "alex@taskpilot.ai",
    github: "alexr",
    location: "Austin, TX",
    joinDate: "Mar 2025",
    projects: ["AI Workflow Planner", "TaskPilot Core Layout"],
    skills: ["React", "Node.js", "Python", "System Design"],
    aiScore: 91,
    tasksCompleted: 38,
    velocity: 94,
    availability: 75,
  },
  {
    id: 3,
    name: "Marcus Chen",
    role: "DevOps",
    title: "DevOps & QA Lead",
    initials: "MC",
    gradient: "from-emerald-500 to-teal-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/10",
    status: "online",
    email: "marcus@taskpilot.ai",
    github: "mchen",
    location: "Seattle, WA",
    joinDate: "Feb 2025",
    projects: ["E2E Testing Pipeline", "Cloud Ops"],
    skills: ["CI/CD", "AWS", "Cypress", "Jest"],
    aiScore: 87,
    tasksCompleted: 31,
    velocity: 88,
    availability: 90,
  },
  {
    id: 4,
    name: "Elena Rostova",
    role: "Design",
    title: "Lead UX Designer",
    initials: "ER",
    gradient: "from-pink-500 to-rose-400",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/10",
    status: "away",
    email: "elena@taskpilot.ai",
    github: "elena_r",
    location: "New York, NY",
    joinDate: "Apr 2025",
    projects: ["Workspace Design Revamp", "TaskPilot Auth System"],
    skills: ["UI/UX", "Figma", "Tailwind", "React"],
    aiScore: 89,
    tasksCompleted: 27,
    velocity: 92,
    availability: 65,
  },
  {
    id: 5,
    name: "Jordan Kim",
    role: "QA",
    title: "QA Automation Engineer",
    initials: "JK",
    gradient: "from-amber-500 to-orange-400",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/10",
    status: "offline",
    email: "jordan@taskpilot.ai",
    github: "jordank",
    location: "Chicago, IL",
    joinDate: "May 2025",
    projects: ["E2E Testing Pipeline"],
    skills: ["Cypress", "Jest", "Python", "Automation"],
    aiScore: 82,
    tasksCompleted: 19,
    velocity: 85,
    availability: 72,
  },
  {
    id: 6,
    name: "Priya Nair",
    role: "Leadership",
    title: "Engineering Manager",
    initials: "PN",
    gradient: "from-indigo-500 to-blue-400",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/10",
    status: "online",
    email: "priya@taskpilot.ai",
    github: "priyanair",
    location: "Remote",
    joinDate: "Jan 2025",
    projects: ["TaskPilot Core Layout", "AI Workflow Planner", "Cloud Ops"],
    skills: ["Strategy", "System Design", "React", "Node.js"],
    aiScore: 96,
    tasksCompleted: 55,
    velocity: 99,
    availability: 80,
  },
  {
    id: 7,
    name: "Pilot Agent α",
    role: "AI Agent",
    title: "Autonomous AI Agent",
    initials: "AI",
    gradient: "from-purple-500 via-cyan-500 to-purple-500",
    border: "border-purple-400/40",
    glow: "shadow-purple-500/20",
    status: "online",
    email: "agent@taskpilot.ai",
    github: "—",
    location: "Cloud",
    joinDate: "Jun 2025",
    projects: ["Cloud Ops", "AI Workflow Planner", "E2E Testing Pipeline"],
    skills: ["ML/AI", "Automation", "Python", "CI/CD"],
    aiScore: 100,
    tasksCompleted: 74,
    velocity: 100,
    availability: 100,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusDot(status) {
  switch (status) {
    case "online": return "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]";
    case "away":   return "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]";
    default:       return "bg-zinc-600";
  }
}
function getStatusLabel(status) {
  switch (status) {
    case "online": return { text: "Online",  cls: "text-emerald-400" };
    case "away":   return { text: "Away",    cls: "text-amber-400" };
    default:       return { text: "Offline", cls: "text-zinc-600" };
  }
}
function getRoleStyle(role) {
  switch (role) {
    case "Engineering": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/25";
    case "Design":      return "text-pink-400 bg-pink-500/10 border-pink-500/25";
    case "DevOps":      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
    case "QA":          return "text-amber-400 bg-amber-500/10 border-amber-500/25";
    case "AI Agent":    return "text-purple-400 bg-purple-500/10 border-purple-500/25";
    case "Leadership":  return "text-indigo-400 bg-indigo-500/10 border-indigo-500/25";
    default:            return "text-zinc-400 bg-zinc-500/10 border-zinc-500/25";
  }
}
function getScoreColor(score) {
  if (score >= 95) return "text-emerald-400";
  if (score >= 85) return "text-cyan-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

// ─── Member Detail Drawer ─────────────────────────────────────────────────────
function MemberDrawer({ member, onClose }) {
  if (!member) return null;
  const statusLabel = getStatusLabel(member.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.38 }}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-zinc-950 border-l border-zinc-800 z-50 shadow-2xl overflow-y-auto"
      >
        {/* Header gradient strip */}
        <div className={`h-28 bg-gradient-to-br ${member.gradient} opacity-20 absolute top-0 left-0 right-0 pointer-events-none`} />

        <div className="relative p-6 space-y-6">
          {/* Close */}
          <div className="flex justify-end">
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center gap-3 -mt-2">
            <div className="relative">
              <div className={`size-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl font-extrabold text-white shadow-xl select-none`}>
                {member.initials}
              </div>
              <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-zinc-950 ${getStatusDot(member.status)}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">{member.name}</h2>
              <p className="text-xs text-zinc-400">{member.title}</p>
              <span className={`inline-block mt-1.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRoleStyle(member.role)}`}>
                {member.role}
              </span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "AI Score",  value: `${member.aiScore}%`,      color: getScoreColor(member.aiScore) },
              { label: "Velocity",  value: `${member.velocity}%`,     color: "text-cyan-400" },
              { label: "Tasks",     value: member.tasksCompleted,      color: "text-purple-400" },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2.5 text-center">
                <p className={`text-base font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info list */}
          <div className="space-y-2.5 text-xs">
            {[
              { icon: Mail,   label: member.email },
              { icon: GitBranch, label: member.github !== "—" ? `github.com/${member.github}` : "—" },
              { icon: Globe,  label: member.location },
              { icon: Clock,  label: `Joined ${member.joinDate}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-zinc-400">
                <Icon size={13} className="text-zinc-600 shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map(skill => (
                <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Assigned projects */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2">Assigned Projects</p>
            <div className="space-y-1.5">
              {member.projects.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 px-3 py-2 rounded-xl">
                  <Briefcase size={11} className="text-zinc-600 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Availability bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Availability</p>
              <span className="text-[10px] font-bold text-zinc-300">{member.availability}%</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${member.availability}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", title: "", role: "Engineering", email: "",
  github: "", location: "", status: "online",
  skillsRaw: "", aiScore: 90, velocity: 88, availability: 80,
};

function AddMemberModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    const initials = form.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const gradients = [
      "from-violet-500 to-purple-400", "from-sky-500 to-cyan-400",
      "from-rose-500 to-pink-400", "from-lime-500 to-emerald-400",
    ];
    const grad = gradients[Math.floor(Math.random() * gradients.length)];
    const skills = form.skillsRaw.split(",").map(s => s.trim()).filter(Boolean);

    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      title: form.title.trim() || "Team Member",
      role: form.role,
      initials,
      gradient: grad,
      border: "border-zinc-700/40",
      glow: "shadow-zinc-500/10",
      status: form.status,
      email: form.email.trim(),
      github: form.github.trim() || "—",
      location: form.location.trim() || "Remote",
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      projects: [],
      skills: skills.length ? skills : ["React"],
      aiScore: parseInt(form.aiScore) || 90,
      tasksCompleted: 0,
      velocity: parseInt(form.velocity) || 88,
      availability: parseInt(form.availability) || 80,
    });
    setForm(EMPTY_FORM);
    onClose();
  }

  if (!open) return null;

  const inputCls = "w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-zinc-200 placeholder-zinc-600 outline-none transition-all text-xs";
  const selectCls = "w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer text-xs";
  const labelCls = "block text-[11px] font-bold text-zinc-400 mb-1.5";

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
        className="fixed inset-x-4 top-[7%] max-w-lg mx-auto z-50 bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UserCheck size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-200">Add Team Member</h2>
              <p className="text-[11px] text-zinc-500">Onboard a new teammate to the workspace.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Full Name *</label>
              <input required type="text" placeholder="Sarah Jenkins" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div><label className={labelCls}>Job Title</label>
              <input type="text" placeholder="Senior Engineer" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectCls}>
                {["Engineering","Design","DevOps","QA","AI Agent","Leadership"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={selectCls}>
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Email + GitHub */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Email *</label>
              <input required type="email" placeholder="user@taskpilot.ai" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div><label className={labelCls}>GitHub Handle</label>
              <input type="text" placeholder="username" value={form.github}
                onChange={e => setForm({ ...form, github: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Location */}
          <div><label className={labelCls}>Location</label>
            <input type="text" placeholder="San Francisco, CA" value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} />
          </div>

          {/* Skills */}
          <div><label className={labelCls}>Skills <span className="text-zinc-600 font-normal">(comma-separated)</span></label>
            <input type="text" placeholder="React, TypeScript, Node.js" value={form.skillsRaw}
              onChange={e => setForm({ ...form, skillsRaw: e.target.value })} className={inputCls} />
          </div>

          {/* AI Score + Velocity + Availability */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "AI Score (%)", key: "aiScore" },
              { label: "Velocity (%)", key: "velocity" },
              { label: "Availability (%)", key: "availability" },
            ].map(({ label, key }) => (
              <div key={key}><label className={labelCls}>{label}</label>
                <input type="number" min={0} max={100} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls} />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-semibold outline-none text-xs"
            >Cancel</button>
            <button type="submit"
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none text-xs"
            >Add Member</button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member, index, onClick }) {
  const statusLabel = getStatusLabel(member.status);
  const scoreColor = getScoreColor(member.aiScore);
  const isAI = member.role === "AI Agent";

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      onClick={() => onClick(member)}
      className={`group cursor-pointer bg-zinc-950/40 border ${member.border} hover:border-zinc-700/60 rounded-2xl p-5 backdrop-blur-xl shadow-lg ${member.glow} hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
    >
      {/* Glow overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none rounded-2xl`} />

      {/* AI shimmer badge */}
      {isAI && (
        <div className="absolute top-3.5 right-3.5">
          <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-400/20 animate-pulse">
            <Sparkles size={8} /> Live
          </span>
        </div>
      )}

      {/* Avatar row */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="relative shrink-0">
          <div className={`size-12 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-base font-extrabold text-white shadow-lg select-none`}>
            {member.initials}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-zinc-950 ${getStatusDot(member.status)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white truncate transition-colors">
            {member.name}
          </h3>
          <p className="text-[11px] text-zinc-500 truncate">{member.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getRoleStyle(member.role)}`}>
              {member.role}
            </span>
            <span className={`text-[9px] font-semibold ${statusLabel.cls}`}>
              ● {statusLabel.text}
            </span>
          </div>
        </div>
      </div>

      {/* AI Score + velocity mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "AI Score",  value: `${member.aiScore}%`,      color: scoreColor },
          { label: "Velocity",  value: `${member.velocity}%`,     color: "text-cyan-400" },
          { label: "Tasks",     value: member.tasksCompleted,      color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-2 text-center">
            <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-4">
        {member.skills.slice(0, 3).map(skill => (
          <span key={skill} className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            {skill}
          </span>
        ))}
        {member.skills.length > 3 && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600">
            +{member.skills.length - 3}
          </span>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-1 mb-4">
        {member.projects.slice(0, 2).map(p => (
          <div key={p} className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Briefcase size={9} className="text-zinc-700 shrink-0" />
            <span className="truncate">{p}</span>
          </div>
        ))}
        {member.projects.length > 2 && (
          <p className="text-[10px] text-zinc-600 pl-3.5">+{member.projects.length - 2} more</p>
        )}
      </div>

      {/* Availability bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Availability</span>
          <span className="text-[9px] font-bold text-zinc-400">{member.availability}%</span>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${member.availability}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.05 + 0.3 }}
            className={`h-full rounded-full bg-gradient-to-r ${member.gradient}`}
          />
        </div>
      </div>

      {/* View profile hint */}
      <p className="text-[9px] text-zinc-700 group-hover:text-zinc-500 transition-colors text-right mt-3 select-none">
        Click to view profile →
      </p>
    </motion.div>
  );
}

// ─── Main Team Page ───────────────────────────────────────────────────────────
export default function Team() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }

  function handleAddMember(data) {
    setMembers(prev => [data, ...prev]);
    showToast(`${data.name} has been added to the team.`);
  }

  // Filter
  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.skills.some(s => s.toLowerCase().includes(q));
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Stats
  const stats = {
    total: members.length,
    online: members.filter(m => m.status === "online").length,
    avgScore: Math.round(members.reduce((a, m) => a + m.aiScore, 0) / members.length),
    totalTasks: members.reduce((a, m) => a + m.tasksCompleted, 0),
  };

  return (
    <div className="space-y-8 pb-10">

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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Team
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {filtered.length} Members
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Manage workspace collaborators, AI agents, and productivity health.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none shrink-0"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members",    value: stats.total,      icon: Users,       color: "text-zinc-200",    bg: "bg-zinc-500/10",    border: "border-zinc-700/30" },
          { label: "Online Now",       value: stats.online,     icon: FiActivity,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Avg AI Score",     value: `${stats.avgScore}%`, icon: RiRobot2Line, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: "Tasks Completed",  value: stats.totalTasks, icon: CheckCircle2, color: "text-cyan-400",  bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4 backdrop-blur-xl flex items-center gap-3`}
            >
              <div className={`size-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center ${s.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row gap-3 bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 bg-zinc-950/60 border border-zinc-900 focus:border-purple-500/60 rounded-xl pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Role filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs shrink-0">Role:</span>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-purple-500/60 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer min-w-[130px]"
            >
              {ROLES.map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs shrink-0">Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-purple-500/60 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer min-w-[120px]"
            >
              <option value="All">All</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Member Grid ── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-14 text-center backdrop-blur-xl"
        >
          <div className="size-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">No members found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search or filter to find the right people.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((member, i) => (
              <MemberCard
                key={member.id}
                member={member}
                index={i}
                onClick={setSelectedMember}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Modals ── */}
      <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
      <AddMemberModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddMember} />
    </div>
  );
}
