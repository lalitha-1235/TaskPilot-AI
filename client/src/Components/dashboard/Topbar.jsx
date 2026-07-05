import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Command,
  User as UserIcon,
  LogOut,
  Sliders,
  MailCheck
} from "lucide-react";

function Topbar({ setIsMobileOpen, isCollapsed }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close dropdowns on route changes
  useEffect(() => {
    setShowNotifications(false);
    setShowProfileDropdown(false);
  }, [location]);

  // Map path to breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const url = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;

      return (
        <div key={path} className="flex items-center text-xs">
          {index > 0 && <span className="mx-2 text-zinc-600">/</span>}
          {isLast ? (
            <span className="text-zinc-200 font-semibold">{label}</span>
          ) : (
            <Link to={url} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {label}
            </Link>
          )}
        </div>
      );
    });
  };

  const notifications = [
    {
      id: 1,
      title: "Sprint Completed",
      desc: "AI Agent finalized sprint 4 plan & assigned 12 tasks.",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Pipeline Warning",
      desc: "Lint checks failing in branch feature/auth-glassmorphic.",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Resource Alert",
      desc: "Autoscaling limit reached in production server node.",
      time: "5h ago",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 right-0 left-0 h-16 bg-[#09090B]/60 backdrop-blur-md border-b border-zinc-900/80 z-20 flex items-center justify-between px-6 select-none">
      
      {/* LEFT: Menu button for Mobile, Breadcrumbs for Desktop */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden text-zinc-400 hover:text-zinc-200 outline-none p-1.5 hover:bg-zinc-900/50 rounded-lg cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Breadcrumbs */}
        <div className="hidden sm:flex items-center">
          <div className="flex items-center text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <span className="mr-2 text-purple-400">Workspace</span>
            <span className="text-zinc-700">/</span>
          </div>
          <div className="ml-2 flex items-center">{getBreadcrumbs()}</div>
        </div>
      </div>

      {/* CENTER: Search Bar */}
      <div className="hidden md:flex items-center w-80 relative group">
        <Search className="absolute left-3 text-zinc-500 size-4 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects, tasks, settings..."
          className="w-full h-9 bg-zinc-950/40 border border-zinc-900 focus:border-cyan-400/80 text-zinc-200 placeholder-zinc-600 rounded-xl pl-9 pr-12 text-xs transition-all duration-200 outline-none focus:bg-zinc-950 focus:ring-4 focus:ring-cyan-500/5"
        />
        <div className="absolute right-3 flex items-center gap-0.5 text-[10px] text-zinc-600 font-bold border border-zinc-900 bg-zinc-950/60 px-1.5 py-0.5 rounded-md pointer-events-none">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* RIGHT: Notifications & User Avatar */}
      <div className="flex items-center gap-4 relative">
        
        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className={`relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-xl transition-all cursor-pointer outline-none ${
              showNotifications ? "text-zinc-200 bg-zinc-900/50" : ""
            }`}
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 size-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl p-4 overflow-hidden z-50 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-purple-400" />
                    AI Workspace Alerts
                  </span>
                  <button className="text-[10px] text-cyan-400 hover:underline">
                    Mark all read
                  </button>
                </div>
                
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                        notif.unread
                          ? "bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10"
                          : "bg-transparent border-transparent hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-xs font-semibold ${notif.unread ? "text-zinc-100" : "text-zinc-400"}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-zinc-600">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-zinc-900" />

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 text-zinc-400 hover:text-zinc-200 transition-colors outline-none cursor-pointer group"
          >
            {/* Avatar block */}
            <div className="relative size-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/5">
              <div className="size-full bg-zinc-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                  alt="User Avatar"
                  className="size-full object-cover"
                  onError={(e) => {
                    // Fallback to Icon if image loads fail
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border border-zinc-950 rounded-full" />
            </div>
            
            <div className="hidden sm:flex flex-col text-left shrink-0 max-w-[100px]">
              <span className="text-xs font-bold text-zinc-200 leading-none truncate">
                Sarah Jenkins
              </span>
              <span className="text-[9px] text-zinc-500 leading-none mt-1 truncate">
                Dev Lead
              </span>
            </div>
            <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200" />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-52 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
              >
                <div className="px-3 py-2.5 border-b border-zinc-900 mb-1.5 select-none">
                  <p className="text-xs font-semibold text-zinc-400">Signed in as</p>
                  <p className="text-xs font-bold text-zinc-200 mt-0.5 truncate">sarah.jenkins@taskpilot.ai</p>
                </div>
                
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                >
                  <UserIcon size={14} />
                  My Profile
                </Link>

                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                >
                  <Sliders size={14} />
                  Workspace Settings
                </Link>

                <div className="h-[1px] bg-zinc-900 my-1.5" />

                <Link
                  to="/login"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
    </header>
  );
}

export default Topbar;
