import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Team", path: "/team", icon: Users },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "AI Assistant", path: "/assistant", icon: Sparkles, badge: "Pro" },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" },
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6">
      <div>
        {/* Logo/Branding Header */}
        <div className="px-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center">
              <div className="size-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="size-4.5 text-cyan-400" />
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent truncate"
                >
                  TaskPilot AI
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Close button for Mobile Drawer view */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-200 outline-none p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="px-3.5 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative outline-none select-none ${
                    isActive
                      ? "text-purple-300 bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          className="truncate flex-1"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Pro/Badge */}
                    {item.badge && !isCollapsed && (
                      <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-400/20">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-16 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer (Logout) */}
      <div className="px-3.5 space-y-1.5">
        <NavLink
          to="/login"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent transition-all group relative outline-none"
        >
          <LogOut size={20} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <div className="absolute left-16 hidden group-hover:block bg-zinc-950 border border-zinc-800 text-red-400 text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
              Logout
            </div>
          )}
        </NavLink>

        {/* Collapse Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center justify-center h-9 border border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-900/30 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer outline-none"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:block fixed top-0 bottom-0 left-0 z-30 bg-zinc-950/40 border-r border-zinc-900/80 backdrop-blur-xl h-screen select-none"
      >
        <SidebarContent />
      </motion.aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Drawer container */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-[270px] bg-zinc-950 border-r border-zinc-900 z-50 h-screen select-none"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
