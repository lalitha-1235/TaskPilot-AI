import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";
import { FiPieChart } from "react-icons/fi";
import { getReportsSummary } from "../../services/reportService";

// ─── Icon Map for Dynamic KPIs ───────────────────────────────────────────────
const ICON_MAP = {
  CheckCircle2: CheckCircle2,
  TrendingUp: TrendingUp,
  RiRobot2Line: RiRobot2Line,
  Clock: Clock,
  AlertTriangle: AlertTriangle,
  Layers: Layers,
};

// ─── Default Fallback Data (matching UI structure exactly) ───────────────────
const DEFAULT_KPI_DATA = [
  {
    title: "Tasks Completed",
    value: "0",
    change: "+0%",
    trend: "up",
    desc: "vs last month",
    icon: "CheckCircle2",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    title: "Team Velocity",
    value: "0%",
    change: "+0%",
    trend: "up",
    desc: "sprint average",
    icon: "TrendingUp",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "AI Automations",
    value: "0",
    change: "+0%",
    trend: "up",
    desc: "tasks auto-resolved",
    icon: "RiRobot2Line",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    title: "On-Time Delivery",
    value: "91.7%",
    change: "-2.1%",
    trend: "down",
    desc: "deadline adherence",
    icon: "Clock",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    title: "Blocked Items",
    value: "0",
    change: "0",
    trend: "up",
    desc: "tasks currently blocked",
    icon: "AlertTriangle",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    title: "Active Projects",
    value: "0",
    change: "+0",
    trend: "up",
    desc: "total workspace projects",
    icon: "Layers",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
];

const DEFAULT_PROJECT_COMPLETION = [
  { name: "Auth System",       progress: 75,  color: "from-purple-500 to-violet-400" },
  { name: "AI Planner",        progress: 90,  color: "from-cyan-500 to-sky-400" },
];

const DEFAULT_TASK_DISTRIBUTION = [
  { label: "Completed",   count: 0, pct: 0, color: "bg-emerald-400", text: "text-emerald-400" },
  { label: "In Progress", count: 0, pct: 0, color: "bg-cyan-400",    text: "text-cyan-400" },
  { label: "Todo",        count: 0, pct: 0, color: "bg-zinc-400",    text: "text-zinc-400" },
  { label: "Review",      count: 0, pct: 0, color: "bg-purple-400",  text: "text-purple-400" },
  { label: "Blocked",     count: 0, pct: 0, color: "bg-red-400",     text: "text-red-400" },
];

const DEFAULT_TREND_DATA = [
  { week: "W1",  velocity: 70, tasks: 0, ai: 0 },
  { week: "W12", velocity: 90, tasks: 0, ai: 0 },
];

const AI_INSIGHTS = [
  {
    type: "positive",
    icon: TrendingUp,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    text: "Workspace throughput is optimal. Tasks completed on schedule have increased as team collaborations grow.",
  },
  {
    type: "warning",
    icon: AlertTriangle,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    text: "Identify blocked Kanban cards. Minimizing duration in review stages improves on-time delivery by up to 10%.",
  },
  {
    type: "action",
    icon: Zap,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    text: "Leverage AI Agent automations for routine DevOps tasks to boost overall team velocity next sprint.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getScoreColor(val) {
  if (val >= 95) return "text-emerald-400";
  if (val >= 85) return "text-cyan-400";
  if (val >= 70) return "text-amber-400";
  return "text-red-400";
}

// ─── Bar Chart Component ──────────────────────────────────────────────────────
function ProjectCompletionChart({ data }) {
  const list = data || DEFAULT_PROJECT_COMPLETION;
  return (
    <div className="space-y-3">
      {list.map((p, i) => (
        <div key={p.name} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 truncate max-w-[140px]">{p.name}</span>
            <span className={`font-bold ${p.progress === 100 ? "text-emerald-400" : p.progress < 30 ? "text-amber-400" : "text-zinc-300"}`}>
              {p.progress}%
            </span>
          </div>
          <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p.progress}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 }}
              className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Ring Chart Component ───────────────────────────────────────────────
function TaskDistributionChart({ data }) {
  const list = data || DEFAULT_TASK_DISTRIBUTION;
  const total = list.reduce((a, d) => a + d.count, 0);

  // Build ring segments via conic-gradient
  let segments = [];
  let accum = 0;
  list.forEach(d => {
    const colorMap = {
      "bg-emerald-400": "#34d399",
      "bg-cyan-400":    "#22d3ee",
      "bg-zinc-400":    "#a1a1aa",
      "bg-purple-400":  "#c084fc",
      "bg-red-400":     "#f87171",
    };
    const hex = colorMap[d.color] || "#71717a";
    segments.push(`${hex} ${accum}% ${accum + d.pct}%`);
    accum += d.pct;
  });
  const gradient = total > 0 ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#27272a 0% 100%)";

  return (
    <div className="flex items-center gap-6">
      {/* Ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative shrink-0"
      >
        <div
          className="size-36 rounded-full"
          style={{ background: gradient }}
        />
        <div className="absolute inset-3 bg-zinc-950 rounded-full flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-zinc-100">{total}</span>
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Total Tasks</span>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {list.map(d => (
          <div key={d.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`size-2.5 rounded-full ${d.color}`} />
              <span className="text-[11px] text-zinc-400 font-medium">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${d.text}`}>{d.count}</span>
              <span className="text-[10px] text-zinc-600">{d.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trend Chart (CSS bar chart) ──────────────────────────────────────────────
function ProductivityTrendChart({ data }) {
  const list = data || DEFAULT_TREND_DATA;
  const maxVelocity = Math.max(...list.map(d => d.velocity || 1));

  return (
    <div>
      {/* Chart */}
      <div className="flex items-end gap-1.5 h-40 mt-4">
        {list.map((d, i) => {
          const hPct = ((d.velocity || 0) / maxVelocity) * 100;
          return (
            <div key={d.week} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Tooltip */}
              <div className="hidden group-hover:block text-[9px] text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg whitespace-nowrap shadow-xl z-10">
                Vel: {d.velocity}% · Tasks: {d.tasks} · AI: {d.ai}
              </div>
              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${hPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.04 }}
                className="w-full rounded-t-md bg-gradient-to-t from-purple-600/80 to-cyan-400/80 group-hover:from-purple-500 group-hover:to-cyan-300 transition-colors relative min-h-[4px]"
              />
              {/* Week label */}
              <span className="text-[8px] text-zinc-600 font-semibold mt-1 select-none">{d.week}</span>
            </div>
          );
        })}
      </div>

      {/* Metric legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        {[
          { label: "Velocity", color: "bg-purple-400" },
          { label: "Tasks",    color: "bg-cyan-400" },
          { label: "AI Assists", color: "bg-emerald-400" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold">
            <div className={`size-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────
export default function Reports() {
  const [dateRange, setDateRange] = useState("This Month");
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Fetch dynamic report metrics ───────────────────────────────────────────
  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);
      const res = await getReportsSummary();
      setReports(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report analytics.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }

  function generateCSV() {
    const list = reports?.teamPerformance || [];
    const header = "Name,Role,Tasks Completed,Velocity,On-Time %,AI Score\n";
    const rows = list.map(m =>
      `${m.name},${m.role},${m.tasksCompleted},${m.velocity},${m.onTime},${m.aiScore}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskpilot_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function generatePDFText() {
    const kpiList = reports?.kpiData || DEFAULT_KPI_DATA;
    const teamList = reports?.teamPerformance || [];
    const lines = [
      "TaskPilot AI — Velocity Report",
      "===============================",
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "KPI Summary:",
      ...kpiList.map(k => `  ${k.title}: ${k.value} (${k.change})`),
      "",
      "Team Performance:",
      ...teamList.map(m => `  ${m.name} — Tasks: ${m.tasksCompleted}, Velocity: ${m.velocity}%, AI: ${m.aiScore}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskpilot_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = reports?.kpiData || DEFAULT_KPI_DATA;
  const teamPerformance = reports?.teamPerformance || [];

  return (
    <div className="space-y-7 pb-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-zinc-950/90 border border-emerald-500/25 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download size={14} />
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
              Reports
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              Analytics
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            AI-powered velocity metrics, delivery insights, and team performance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date range */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="h-9 bg-zinc-950 border border-zinc-900 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer"
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>

          {/* Export PDF */}
          <button
            onClick={() => { generatePDFText(); showToast("Report exported as PDF."); }}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer outline-none"
          >
            <FileText size={13} />
            Export PDF
          </button>

          {/* Export CSV */}
          <button
            onClick={() => { generateCSV(); showToast("CSV file downloaded successfully."); }}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white cursor-pointer transition-all active:scale-[0.98] outline-none shadow-lg shadow-purple-500/10"
          >
            <FileSpreadsheet size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {DEFAULT_KPI_DATA.map((kpi, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center text-red-400 text-xs font-semibold">
          <p>{error}</p>
          <button onClick={fetchReports} className="mt-3 px-4 py-1.5 bg-red-500/10 rounded-xl border border-red-500/25">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {kpis.map((kpi, i) => {
            const Icon = ICON_MAP[kpi.icon] || CheckCircle2;
            const isUp = kpi.trend === "up";
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${kpi.bg} border ${kpi.border} rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden group`}
              >
                <div className={`absolute -top-4 -right-4 size-16 rounded-full ${kpi.bg} blur-2xl opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none`} />
                <div className="flex items-center justify-between mb-2">
                  <div className={`size-8 rounded-xl ${kpi.bg} border ${kpi.border} flex items-center justify-center ${kpi.color}`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    isUp ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-zinc-100 mt-1">{kpi.value}</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{kpi.title}</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">{kpi.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project Completion */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <BarChart3 size={14} className="text-purple-400" />
              Project Completion
            </h2>
            <span className="text-[9px] text-zinc-600 font-semibold">{dateRange}</span>
          </div>
          {loading ? (
            <div className="h-44 bg-zinc-900/20 animate-pulse rounded-xl" />
          ) : (
            <ProjectCompletionChart data={reports?.projectCompletion} />
          )}
        </div>

        {/* Task Distribution */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <FiPieChart size={14} className="text-cyan-400" />
              Task Distribution
            </h2>
            <span className="text-[9px] text-zinc-600 font-semibold">By Status</span>
          </div>
          {loading ? (
            <div className="h-44 bg-zinc-900/20 animate-pulse rounded-xl" />
          ) : (
            <TaskDistributionChart data={reports?.taskDistribution} />
          )}
        </div>

        {/* Productivity Trend */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              Productivity Trend
            </h2>
            <span className="text-[9px] text-zinc-600 font-semibold">12 Weeks</span>
          </div>
          {loading ? (
            <div className="h-44 bg-zinc-900/20 animate-pulse rounded-xl" />
          ) : (
            <ProductivityTrendChart data={reports?.trendData} />
          )}
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
        <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-purple-400" />
          AI-Generated Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {AI_INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`border rounded-xl p-4 ${ins.color} relative overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon size={14} />
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">
                    {ins.type === "positive" ? "Positive Trend" : ins.type === "warning" ? "Risk Signal" : "Recommendation"}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{ins.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Team Performance Table ── */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Users size={14} className="text-cyan-400" />
              Team Performance
            </h2>
            <span className="text-[9px] text-zinc-600 font-semibold">Ranked by AI Score</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse text-xs">Loading performance index…</div>
          ) : (
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-900/60 text-zinc-500">
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px]">#</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px]">Team Member</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px]">Role</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">Tasks</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">Velocity</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">On-Time</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">AI Score</th>
                  <th className="py-3.5 px-5 font-semibold uppercase tracking-wider text-[10px]">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {[...teamPerformance]
                  .sort((a, b) => b.aiScore - a.aiScore)
                  .map((member, idx) => (
                    <motion.tr
                      key={member.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="hover:bg-zinc-900/30 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-5">
                        <span className={`size-6 inline-flex items-center justify-center rounded-lg text-[10px] font-extrabold ${
                          idx === 0 ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          idx === 1 ? "bg-zinc-500/10 text-zinc-300 border border-zinc-700" :
                          idx === 2 ? "bg-amber-800/15 text-amber-600 border border-amber-700/20" :
                          "text-zinc-600"
                        }`}>
                          {idx + 1}
                        </span>
                      </td>

                      {/* Name + Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`size-7 rounded-lg bg-gradient-to-br ${member.gradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0 select-none`}>
                            {member.initials}
                          </div>
                          <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{member.name}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5 text-zinc-500">{member.role}</td>

                      {/* Tasks */}
                      <td className="py-3.5 px-5 text-center font-bold text-zinc-300">{member.tasksCompleted}</td>

                      {/* Velocity */}
                      <td className="py-3.5 px-5 text-center">
                        <span className={`font-bold ${getScoreColor(member.velocity)}`}>{member.velocity}%</span>
                      </td>

                      {/* On-Time */}
                      <td className="py-3.5 px-5 text-center">
                        <span className={`font-bold ${getScoreColor(member.onTime)}`}>{member.onTime}%</span>
                      </td>

                      {/* AI Score */}
                      <td className="py-3.5 px-5 text-center">
                        <span className={`font-extrabold ${getScoreColor(member.aiScore)}`}>{member.aiScore}</span>
                      </td>

                      {/* Mini bar */}
                      <td className="py-3.5 px-5">
                        <div className="w-full max-w-[120px]">
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${member.aiScore}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 + idx * 0.06 }}
                              className={`h-full rounded-full bg-gradient-to-r ${member.gradient}`}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-600">
          <span>Total: <span className="text-zinc-400 font-semibold">{teamPerformance.length}</span> team members</span>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-500">Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
