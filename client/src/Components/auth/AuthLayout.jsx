import { motion } from "framer-motion";
import { Sparkles, Activity, CheckCircle2, Circle } from "lucide-react";

function AuthLayout({ children }) {
  // Sample animated tasks for the AI visualization
  const mockTasks = [
    {
      id: 1,
      title: "Sprint 4 Planning",
      desc: "AI-generated milestones",
      status: "completed",
      delay: 0.2,
      x: "15%",
      y: "25%",
    },
    {
      id: 2,
      title: "E2E Testing Pipeline",
      desc: "Running AI linting checks",
      status: "active",
      delay: 0.4,
      x: "55%",
      y: "45%",
    },
    {
      id: 3,
      title: "Production Release",
      desc: "Optimizing cloud resources",
      status: "pending",
      delay: 0.6,
      x: "25%",
      y: "70%",
    },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#09090B] text-zinc-100 overflow-hidden relative font-sans">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370d_1px,transparent_1px),linear-gradient(to_bottom,#1f29370d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* LEFT COLUMN: Visual Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative border-r border-zinc-900 bg-zinc-950/20 backdrop-blur-3xl select-none">
        
        {/* Top Branding Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/15">
            <div className="size-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="size-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            TaskPilot AI
          </span>
        </div>

        {/* Center: Live AI Workspace Preview Simulation */}
        <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full">
          
          {/* Animated SVG Connecting lines in background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Connection lines between task bubbles */}
            <motion.path
              d="M 150 200 Q 220 280 400 320"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 10 }}
            />
            <motion.path
              d="M 400 320 Q 300 420 220 500"
              fill="none"
              stroke="url(#grad2)"
              strokeWidth="2"
              strokeDasharray="6 4"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
            />
            
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating task cards */}
          {mockTasks.map((task) => (
            <motion.div
              key={task.id}
              className="absolute bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-4 w-72 shadow-2xl flex gap-3.5 hover:border-zinc-700/80 transition-colors pointer-events-auto cursor-default"
              style={{ left: task.x, top: task.y }}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: [0, -6, 0],
                scale: 1,
              }}
              transition={{
                opacity: { duration: 0.6, delay: task.delay },
                scale: { duration: 0.6, delay: task.delay },
                y: {
                  repeat: Infinity,
                  duration: 6,
                  delay: task.delay * 2,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="mt-1">
                {task.status === "completed" ? (
                  <CheckCircle2 className="size-5 text-emerald-400" />
                ) : task.status === "active" ? (
                  <div className="relative size-5 flex items-center justify-center">
                    <Activity className="size-4 text-cyan-400" />
                    <span className="absolute animate-ping size-full bg-cyan-400/25 rounded-full" />
                  </div>
                ) : (
                  <Circle className="size-5 text-zinc-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {task.title}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 truncate leading-relaxed">
                  {task.desc}
                </p>
                
                {task.status === "active" && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Co-Pilot running
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
        </div>

        {/* Bottom Marketing Copy */}
        <div className="z-10 mt-auto max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 leading-tight">
            Autopilot for your Projects.
          </h2>
          <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
            TaskPilot AI leverages intelligent agents to plan sprints, track team velocity, auto-resolve blockers, and optimize pipelines automatically.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500 font-semibold border-t border-zinc-900 pt-6">
            <span>Enterprise Certified</span>
            <span className="size-1 rounded-full bg-zinc-700" />
            <span>ISO 27001 Compliant</span>
            <span className="size-1 rounded-full bg-zinc-700" />
            <span>SAML SSO Enabled</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Authentication form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative z-10">
        
        {/* Floating Mobile Logo Header */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg">
            <div className="size-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="size-4 text-cyan-400" />
            </div>
          </div>
          <span className="text-md font-bold tracking-tight text-zinc-100">
            TaskPilot AI
          </span>
        </div>

        {/* Glassmorphism auth card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Internal card top neon accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-cyan-400" />

          {/* Form wrapper */}
          <div className="relative z-10 w-full">
            {children}
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}

export default AuthLayout;
