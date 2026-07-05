import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Send,
  UserCheck,
  Zap,
  Layers,
  ChevronRight
} from "lucide-react";

function DashboardHome() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      sender: "pilot",
      text: "Hello! I am TaskPilot AI. I am currently monitoring your workspaces. I detected that 'E2E Testing Pipeline' is currently blocked. Would you like me to analyze the build log?",
    },
  ]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  const metrics = [
    {
      title: "Completed Tasks",
      value: "28 / 32",
      change: "+12.4%",
      trend: "up",
      desc: "Completed this sprint",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Active AI Agents",
      value: "4 running",
      change: "Optimal",
      trend: "up",
      desc: "Monitoring workflows",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Team Velocity",
      value: "94.2 pts",
      change: "+8.3%",
      trend: "up",
      desc: "Average velocity score",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "At-Risk Items",
      value: "1 blocked",
      change: "Attention required",
      trend: "down",
      desc: "Blocked task: E2E Pipeline",
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  const recentTasks = [
    {
      id: "TP-102",
      title: "Design glassmorphism authentication screens",
      project: "TaskPilot Auth System",
      assignee: "Sarah Jenkins",
      priority: "High",
      status: "In Review",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "TP-105",
      title: "Integrate dashboard layout & routes configuration",
      project: "TaskPilot Core Layout",
      assignee: "Alex Riviera",
      priority: "High",
      status: "In Progress",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      id: "TP-98",
      title: "Investigate AWS autoscaling limits & trigger node health checks",
      project: "Cloud Ops",
      assignee: "AI Agent",
      priority: "Medium",
      status: "Completed",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "TP-109",
      title: "Resolve E2E Testing Pipeline mock compilation logs",
      project: "CI Pipeline Integration",
      assignee: "Marcus Chen",
      priority: "High",
      status: "Blocked",
      color: "text-red-400 bg-red-500/10 border-red-500/20",
    },
  ];

  const aiInsights = [
    {
      id: 1,
      type: "tip",
      text: "Sprint velocity is up 12% since adding TaskPilot Agent. We recommend enabling auto-planning for Sprint 5.",
    },
    {
      id: 2,
      type: "warning",
      text: "E2E Pipeline has been blocked for 2 hours. Sarah Jenkins is offline. Ask me to auto-resolve with AI Copilot.",
    },
  ];

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMsg = { sender: "user", text: aiPrompt };
    setChatLog((prev) => [...prev, userMsg]);
    setAiPrompt("");
    setIsAiResponding(true);

    // Simulate AI response
    setTimeout(() => {
      let pilotMsgText = "I've reviewed your request. I can assist with project management automations. Please let me know what logs I should fetch.";
      
      if (aiPrompt.toLowerCase().includes("pipeline") || aiPrompt.toLowerCase().includes("block")) {
        pilotMsgText = "Analyzing the 'E2E Testing Pipeline' failure: The build is failing on line 42 of mock-test.js due to a missing dependency. I can trigger a pull request to install 'tw-animate-css'. Shall I proceed?";
      } else if (aiPrompt.toLowerCase().includes("sprint") || aiPrompt.toLowerCase().includes("plan")) {
        pilotMsgText = "Sprint 4 is currently 87.5% complete. Based on historical velocity, I suggest moving 2 pending items to Sprint 5 or auto-assigning them to the available AI Agent. Would you like to view the suggested sprint outline?";
      }

      setChatLog((prev) => [...prev, { sender: "pilot", text: pilotMsgText }]);
      setIsAiResponding(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Workspace Overview
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time AI metrics and project workspace status.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-4.5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none">
          <Zap size={14} className="animate-pulse" />
          Trigger Sprint Auto-Plan
        </button>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-colors relative overflow-hidden group shadow-2xl backdrop-blur-xl"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${metric.bg} ${metric.color}`}>
                  <Icon size={20} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    metric.trend === "up"
                      ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                      : "text-amber-400 bg-amber-500/5 border-amber-500/10"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-zinc-100">{metric.value}</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-1.5">{metric.title}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{metric.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMNS: AI CHAT ASSISTANT & INSIGHTS TICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/CENTER COLUMN: AI Copilot Interface (Interactive) */}
        <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col justify-between backdrop-blur-xl min-h-[380px]">
          <div>
            <h2 className="text-md font-bold text-zinc-200 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              TaskPilot AI Copilot
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Ask TaskPilot to analyze code logs, resolve blockers, or distribute sprint backlogs.
            </p>

            {/* Chat Log View */}
            <div className="mt-5 space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {chatLog.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`size-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold select-none ${
                      msg.sender === "user"
                        ? "bg-purple-600"
                        : "bg-gradient-to-tr from-purple-500 to-cyan-500"
                    }`}
                  >
                    {msg.sender === "user" ? "S" : "AI"}
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-purple-600/10 border border-purple-500/20 text-purple-200"
                        : "bg-zinc-900/60 border border-zinc-800 text-zinc-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isAiResponding && (
                <div className="flex gap-3 text-xs text-zinc-500 items-center">
                  <div className="size-6 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold select-none">
                    AI
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="animate-bounce size-1 bg-zinc-600 rounded-full" />
                    <span className="animate-bounce delay-100 size-1 bg-zinc-600 rounded-full" />
                    <span className="animate-bounce delay-200 size-1 bg-zinc-600 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Entry Box */}
          <form onSubmit={handleSendPrompt} className="mt-5 flex gap-2.5">
            <input
              type="text"
              placeholder="e.g. 'Analyze blocked pipelines' or 'Plan sprint 4'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isAiResponding}
              className="flex-1 h-10 bg-zinc-950 border border-zinc-900 focus:border-purple-500/80 rounded-xl px-3.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all focus:ring-4 focus:ring-purple-500/5"
            />
            <button
              type="submit"
              disabled={isAiResponding || !aiPrompt.trim()}
              className="size-10 shrink-0 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-cyan-500 rounded-xl flex items-center justify-center text-white cursor-pointer transition-transform duration-150 active:scale-95 outline-none"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: AI Insights Ticker */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
          <div>
            <h2 className="text-md font-bold text-zinc-200 flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              Pilot AI Recommendations
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automated notifications generated based on team velocity.
            </p>
            
            <div className="mt-5 space-y-3.5">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`border rounded-xl p-3.5 relative overflow-hidden ${
                    insight.type === "warning"
                      ? "bg-amber-500/5 border-amber-500/10 text-amber-200"
                      : "bg-cyan-500/5 border-cyan-500/10 text-cyan-200"
                  }`}
                >
                  <p className="text-[11px] leading-relaxed">
                    {insight.text}
                  </p>
                  <button className="mt-3 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-300 hover:text-zinc-100 transition-colors outline-none cursor-pointer">
                    Apply Fix
                    <ChevronRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-zinc-900 pt-4 flex justify-between items-center text-[10px] text-zinc-500">
            <span>Last checked: Just now</span>
            <span className="text-cyan-400 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Online
            </span>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVE TASKS BOARD */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4 mb-4">
          <div>
            <h2 className="text-md font-bold text-zinc-200 flex items-center gap-2">
              <UserCheck size={16} className="text-purple-400" />
              Active Sprint Tasks
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Work allocation status monitoring for sprint 4.
            </p>
          </div>

          <Link
            to="/dashboard/tasks"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline outline-none"
          >
            View all tasks
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Task List Grid/Table */}
        <div className="overflow-x-auto w-full pr-1">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-900/60 pb-3">
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Task ID</th>
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Title</th>
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Project</th>
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Assignee</th>
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Priority</th>
                <th className="font-semibold uppercase tracking-wider py-3.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
              {recentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-zinc-950/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-zinc-400">{task.id}</td>
                  <td className="py-3 px-3 font-semibold text-zinc-200 max-w-sm truncate">
                    {task.title}
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{task.project}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold text-zinc-200">
                        {task.assignee.charAt(0)}
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${task.color}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default DashboardHome;
