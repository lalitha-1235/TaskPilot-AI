import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  ChevronRight,
  Code2,
  Layers,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Zap,
  BrainCircuit,
  Lightbulb,
  FileCode2,
  FolderKanban,
  Target,
  Bot,
  User,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";
import { FiTerminal } from "react-icons/fi";
import {
  getChatHistory,
  sendChatMessage,
  clearChatHistory,
} from "../../services/assistantService";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { icon: AlertTriangle, label: "Analyze blocked pipeline",  prompt: "Analyze the blocked E2E testing pipeline and suggest a fix" },
  { icon: Layers,        label: "Sprint 4 status report",    prompt: "Generate a Sprint 4 status report with recommendations" },
  { icon: Code2,         label: "Review Auth module PR",     prompt: "Review the code changes in Auth module PR #47" },
  { icon: TrendingUp,    label: "Team velocity analysis",    prompt: "Show me team velocity analysis for the last 12 weeks" },
  { icon: Zap,           label: "Auto-plan Sprint 5",        prompt: "Create an auto-plan for Sprint 5 based on current backlog" },
  { icon: Target,        label: "Risk assessment report",    prompt: "Generate an AI risk assessment for all active projects" },
];

const QUICK_ACTIONS = [
  { icon: FiTerminal,  label: "Run CI Pipeline",       desc: "Trigger build & test suite",         color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { icon: BrainCircuit, label: "Auto-Assign Tasks",     desc: "AI distributes unassigned backlog",  color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { icon: FileCode2,   label: "Generate Test Suite",    desc: "Create Cypress tests from specs",    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { icon: Wand2,       label: "Optimize Sprint Plan",   desc: "Rebalance workload with AI",         color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

const CODE_ANALYSIS = {
  totalFiles: 2241,
  coverage: 78,
  techDebt: "Low",
  issues: 12,
  suggestions: [
    { severity: "warning", file: "authController.js", msg: "2 unused imports detected" },
    { severity: "info",    file: "mock-test.js",      msg: "Missing dependency tw-animate-css" },
    { severity: "info",    file: "Sidebar.jsx",       msg: "Consider memoizing menuItems array" },
  ],
};

const PROJECT_RECOMMENDATIONS = [
  { project: "E2E Testing Pipeline", risk: "Critical", action: "Auto-assign AI Agent to resolve TP-109 blocking task", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { project: "Workspace Revamp",     risk: "Low",      action: "On track — suggest adding Elena to accelerate UI sprint", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { project: "AI Workflow Planner",   risk: "Medium",   action: "LLM integration needs load testing before Sprint 5",     color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

const TASK_RECOMMENDATIONS = [
  { id: "TP-109", title: "Resolve mock compilation error", action: "Auto-fix available — install missing dependency", priority: "High" },
  { id: "TP-107", title: "Configure GitHub Actions CI/CD", action: "AI can scaffold pipeline from existing Dockerfile", priority: "High" },
  { id: "TP-106", title: "Audit REST API endpoints",       action: "Auto-generate OpenAPI spec from route files",      priority: "Low" },
];

// Welcoming AI message on empty databases
const INITIAL_MESSAGES = [
  {
    _id: "welcome-message",
    id: "welcome-message",
    sender: "ai",
    text: `Welcome back! I'm **TaskPilot AI**, your workspace intelligence agent.\n\nI'm currently monitoring **6 active projects** and **268 tasks**. Here's what needs attention:\n\n⚠️ **E2E Testing Pipeline** is blocked — 2 critical tasks unresolved\n📈 Sprint velocity is **up 8.3%** this week\n✅ AI Agent has auto-resolved **3 tasks** since your last session\n\nWhat would you like me to help with?`,
    timestamp: "Just now",
  },
];

// ─── Chat Message Component ──────────────────────────────────────────────────
function ChatMessage({ msg, index }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.sender === "ai";

  function handleCopy() {
    navigator.clipboard.writeText(msg.text.replace(/\*\*/g, "").replace(/`/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Simple markdown rendering
  function renderText(text) {
    return text.split("\n").map((line, i) => {
      // Code blocks
      if (line.startsWith("```")) return null;
      if (line.startsWith("| ")) {
        return <p key={i} className="font-mono text-[10px] text-zinc-400 leading-relaxed">{line}</p>;
      }
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="text-zinc-100 font-bold">{part.slice(2, -2)}</strong>;
        }
        // Inline code
        const codeParts = part.split(/(`[^`]+`)/g).map((cp, k) => {
          if (cp.startsWith("`") && cp.endsWith("`")) {
            return <code key={k} className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-cyan-300 font-mono">{cp.slice(1, -1)}</code>;
          }
          return cp;
        });
        return <span key={j}>{codeParts}</span>;
      });
      return <p key={i} className="leading-relaxed">{parts}</p>;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs select-none ${
        isAI
          ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
          : "bg-purple-600 text-white"
      }`}>
        {isAI ? <Bot size={16} /> : <User size={14} />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isAI ? "" : "flex justify-end"}`}>
        <div className={`rounded-2xl px-4 py-3 text-xs space-y-1.5 ${
          isAI
            ? "bg-zinc-900/60 border border-zinc-800 text-zinc-300"
            : "bg-purple-600/15 border border-purple-500/25 text-purple-200"
        }`}>
          {renderText(msg.text)}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 mt-1.5 ${isAI ? "" : "justify-end"}`}>
          <span className="text-[9px] text-zinc-600">{msg.timestamp}</span>
          {isAI && (
            <button onClick={handleCopy} className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
              {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Assistant Page ──────────────────────────────────────────────────────
export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Fetch chat history from MongoDB on mount ───────────────────────────────
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await getChatHistory();
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } catch (err) {
      setMessages(INITIAL_MESSAGES);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function handleSend(promptText) {
    const text = promptText || input.trim();
    if (!text) return;

    const userLocalMsg = {
      id: `temp-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userLocalMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text);
      const aiMsg = res.data;
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== userLocalMsg.id);
        return [...filtered, {
          _id: userLocalMsg.id,
          id: userLocalMsg.id,
          sender: "user",
          text: userLocalMsg.text,
          timestamp: userLocalMsg.timestamp
        }, aiMsg];
      });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to exchange message.");
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSend();
  }

  // ── Clear history ──────────────────────────────────────────────────────────
  async function handleClearChat() {
    try {
      await clearChatHistory();
      setMessages(INITIAL_MESSAGES);
      showToast("Conversation cleared.");
    } catch (err) {
      showToast("Failed to clear chat history.");
    }
  }

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
              <Sparkles size={14} />
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
              AI Assistant
            </h1>
            <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-400/20">
              Pro
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Autonomous workspace intelligence — code analysis, sprint planning, and task resolution.
          </p>
        </div>
        <button onClick={handleClearChat}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer outline-none shrink-0"
        >
          <RefreshCw size={12} />
          Clear Chat
        </button>
      </div>

      {/* ── Main Layout: Chat + Right Panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT: Chat Interface ── */}
        <div className="flex flex-col bg-zinc-950/40 border border-zinc-900 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden min-h-[600px]">

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[520px]">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatMessage key={msg._id || msg.id} msg={msg} index={i} />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="size-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Bot size={16} />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <span className="size-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts — show only when few messages */}
          {messages.length <= 2 && (
            <div className="px-5 pb-3">
              <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider mb-2">Suggested Prompts</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {SUGGESTED_PROMPTS.map((sp) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={sp.label}
                      onClick={() => handleSend(sp.prompt)}
                      disabled={isTyping}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all cursor-pointer outline-none text-left disabled:opacity-40"
                    >
                      <Icon size={12} className="shrink-0 text-zinc-600" />
                      <span className="truncate font-medium">{sp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="border-t border-zinc-900 p-4 flex gap-2.5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask TaskPilot AI anything — code analysis, sprint planning, task resolution..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 h-11 bg-zinc-950 border border-zinc-900 focus:border-purple-500/70 rounded-xl px-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="size-11 shrink-0 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 outline-none shadow-lg shadow-purple-500/10"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* ── RIGHT: Insights Panel ── */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
              <Zap size={13} className="text-amber-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(qa => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={() => showToast(`Action "${qa.label}" triggered.`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer outline-none text-left group hover:bg-zinc-900/40 ${qa.color}`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${qa.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate">{qa.label}</p>
                      <p className="text-[9px] opacity-60 truncate">{qa.desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Analysis */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
              <Code2 size={13} className="text-cyan-400" />
              Codebase Analysis
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Files",    value: CODE_ANALYSIS.totalFiles.toLocaleString(), color: "text-zinc-200" },
                { label: "Coverage", value: `${CODE_ANALYSIS.coverage}%`, color: "text-cyan-400" },
                { label: "Tech Debt", value: CODE_ANALYSIS.techDebt, color: "text-emerald-400" },
                { label: "Issues",   value: CODE_ANALYSIS.issues, color: "text-amber-400" },
              ].map(s => (
                <div key={s.label} className="bg-zinc-900/50 rounded-xl p-2.5 border border-zinc-800/60 text-center">
                  <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {CODE_ANALYSIS.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-500">
                  <span className={`mt-0.5 size-1.5 rounded-full shrink-0 ${s.severity === "warning" ? "bg-amber-400" : "bg-cyan-400"}`} />
                  <span><span className="font-mono text-zinc-400">{s.file}</span>: {s.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Recommendations */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
              <FolderKanban size={13} className="text-purple-400" />
              Project Recommendations
            </h3>
            <div className="space-y-2">
              {PROJECT_RECOMMENDATIONS.map((pr, i) => (
                <motion.div
                  key={pr.project}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={`border rounded-xl p-3 ${pr.color}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold truncate">{pr.project}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider">{pr.risk}</span>
                  </div>
                  <p className="text-[10px] opacity-70 leading-relaxed">{pr.action}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Task Recommendations */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-3">
              <CheckSquare size={13} className="text-emerald-400" />
              Task Recommendations
            </h3>
            <div className="space-y-2">
              {TASK_RECOMMENDATIONS.map(tr => (
                <div key={tr.id} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500">{tr.id}</span>
                      <span className={`text-[8px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded border ${
                        tr.priority === "High" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                      }`}>{tr.priority}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-semibold truncate">{tr.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Lightbulb size={9} className="text-amber-400 shrink-0" />
                    <p className="text-[9px] text-zinc-500 truncate">{tr.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agent Status */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <RiRobot2Line size={12} className="text-purple-400" />
                <span className="font-semibold">Pilot Agent α</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {[
                { label: "Resolved", value: "74" },
                { label: "Queued",   value: "3" },
                { label: "Uptime",   value: "99.9%" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-sm font-extrabold text-zinc-200">{s.value}</p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
