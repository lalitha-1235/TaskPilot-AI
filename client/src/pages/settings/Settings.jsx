import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Briefcase,
  Key,
  Shield,
  CreditCard,
  Grid,
  CheckCircle2,
  Trash2,
  Copy,
  Lock,
  Plus,
  RefreshCw,
  Mail,
  Zap,
  Globe,
  Upload,
} from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";

const TABS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "account",       label: "Account",        icon: SettingsIcon },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "theme",         label: "Theme",          icon: Palette },
  { id: "workspace",     label: "Workspace",      icon: Briefcase },
  { id: "api-keys",      label: "API Keys",       icon: Key },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "billing",       label: "Billing",        icon: CreditCard },
  { id: "apps",          label: "Connected Apps", icon: Grid },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  // States for Settings Forms
  const [profile, setProfile] = useState({
    name: "Sarah Jenkins",
    username: "sarahj",
    title: "Senior Frontend Engineer",
    bio: "Building next-gen AI automation interfaces. Passionate about glassmorphism, responsive designs, and performance optimization.",
  });

  const [account, setAccount] = useState({
    email: "sarah@taskpilot.ai",
    language: "English (US)",
    timezone: "UTC-08:00 (Pacific Time)",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    slackSync: true,
    weeklyDigest: false,
  });

  const [theme, setTheme] = useState({
    mode: "dark",
    accent: "purple",
  });

  const [workspace, setWorkspace] = useState({
    name: "TaskPilot Engineering Workspace",
    inviteCode: "TP-ENG-98234",
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Development Token", key: "tp_live_839f...208b", created: "2026-06-15" },
    { id: 2, name: "CI Pipeline Hook", key: "tp_live_711a...390a", created: "2026-06-30" },
  ]);

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30 days",
  });

  const [apps, setApps] = useState({
    slack: true,
    github: true,
    figma: true,
    aws: false,
  });

  function triggerToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleSave(section) {
    triggerToast(`Changes saved: your ${section} settings have been updated.`);
  }

  // ─── Actions for API Keys ───
  function handleCreateKey() {
    const newKey = {
      id: Date.now(),
      name: "New API Key",
      key: `tp_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      created: new Date().toISOString().split("T")[0],
    };
    setApiKeys([...apiKeys, newKey]);
    triggerToast("API Key created successfully.");
  }

  function handleRevokeKey(id) {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    triggerToast("API Key has been revoked.");
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
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xs font-semibold text-zinc-200">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure profile metadata, interface preferences, API access, and connected apps.
        </p>
      </div>

      {/* Outer Card Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1 bg-zinc-950/30 border border-zinc-900 rounded-2xl backdrop-blur-xl shrink-0 scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer outline-none whitespace-nowrap lg:w-full select-none ${
                  active
                    ? "text-purple-300 bg-purple-500/10 border border-purple-500/20 shadow-md"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Setting Panel Content Card */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl shadow-2xl min-h-[480px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ─── Profile Content ─── */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Public Profile</h2>
                    <p className="text-[11px] text-zinc-500">Configure how you appear across workspaces.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-400 flex items-center justify-center text-xl font-extrabold text-white shadow-xl select-none">
                      SJ
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => triggerToast("Avatar uploads are disabled in sandbox.")}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-[10px] font-bold text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-all cursor-pointer outline-none"
                      >
                        <Upload size={12} />
                        Upload New Avatar
                      </button>
                      <p className="text-[9px] text-zinc-600">JPG, PNG, or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Display Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full h-10 bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-200 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Username</label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                        className="w-full h-10 bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400">Job Title</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={e => setProfile({ ...profile, title: e.target.value })}
                      className="w-full h-10 bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-200 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400">Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={() => handleSave("profile")}
                    className="h-9 px-5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none shadow-md shadow-purple-500/10"
                  >
                    Save Profile Settings
                  </button>
                </div>
              )}

              {/* ─── Account Content ─── */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Account Credentials</h2>
                    <p className="text-[11px] text-zinc-500">Configure email, regional options, and preferences.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        value={account.email}
                        onChange={e => setAccount({ ...account, email: e.target.value })}
                        className="w-full h-10 bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl pl-10 pr-3.5 text-xs text-zinc-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Language</label>
                      <select
                        value={account.language}
                        onChange={e => setAccount({ ...account, language: e.target.value })}
                        className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Deutsch">Deutsch</option>
                        <option value="Español">Español</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Timezone</label>
                      <select
                        value={account.timezone}
                        onChange={e => setAccount({ ...account, timezone: e.target.value })}
                        className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3 text-xs text-zinc-300 outline-none cursor-pointer"
                      >
                        <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                        <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                        <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                        <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (IST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-5 space-y-3.5">
                    <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
                      <Trash2 size={13} />
                      Danger Zone
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Deleting your account will purge all project history, assigned tasks, and AI integrations. This action is irreversible.
                    </p>
                    <button
                      onClick={() => triggerToast("Account deletion is disabled in preview.")}
                      className="h-8 px-4 rounded-xl border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-bold text-red-400 transition-all cursor-pointer outline-none"
                    >
                      Delete Account
                    </button>
                  </div>

                  <button
                    onClick={() => handleSave("account")}
                    className="h-9 px-5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none shadow-md shadow-purple-500/10"
                  >
                    Save Account Settings
                  </button>
                </div>
              )}

              {/* ─── Notifications Content ─── */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Alert Preferences</h2>
                    <p className="text-[11px] text-zinc-500">Decide what updates to receive and where.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "emailAlerts",  label: "Email Updates", desc: "Receive reports on sprint deliverables and deadlines." },
                      { key: "pushAlerts",   label: "Push Notifications", desc: "Receive immediate updates when tasks are updated." },
                      { key: "slackSync",    label: "Slack Integration Alerts", desc: "Push notification reports to connected Slack channels." },
                      { key: "weeklyDigest", label: "Weekly Summary Digests", desc: "Receive an AI-summarized workload report every Friday." },
                    ].map(item => (
                      <div key={item.key} className="flex items-start justify-between gap-4 p-3.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="text-xs font-semibold text-zinc-300">{item.label}</p>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">{item.desc}</p>
                        </div>
                        {/* Toggle switch */}
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                          className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative outline-none shrink-0 ${
                            notifications[item.key] ? "bg-purple-600" : "bg-zinc-800"
                          }`}
                        >
                          <div className={`size-4 rounded-full bg-white transition-transform ${
                            notifications[item.key] ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSave("notifications")}
                    className="h-9 px-5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none shadow-md shadow-purple-500/10"
                  >
                    Save Preferences
                  </button>
                </div>
              )}

              {/* ─── Theme Content ─── */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Interface Theme</h2>
                    <p className="text-[11px] text-zinc-500">Customize how TaskPilot AI looks on your machine.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Theme Mode */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mode</label>
                      <div className="grid grid-cols-2 gap-3.5">
                        {["dark", "system"].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setTheme({ ...theme, mode })}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all outline-none ${
                              theme.mode === mode
                                ? "border-purple-500/40 bg-purple-500/5 text-purple-200"
                                : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-bold capitalize">{mode} mode</p>
                            <p className="text-[9px] opacity-75 mt-0.5">
                              {mode === "dark" ? "Classic dark interface" : "Follow system configurations"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Colors */}
                    <div className="space-y-2.5 pt-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Accent Color</label>
                      <div className="flex gap-3">
                        {[
                          { id: "purple", color: "bg-purple-500", label: "Purple" },
                          { id: "cyan",   color: "bg-cyan-400",   label: "Cyan" },
                          { id: "emerald", color: "bg-emerald-400", label: "Emerald" },
                          { id: "amber",   color: "bg-amber-400",   label: "Amber" },
                          { id: "indigo",  color: "bg-indigo-500",  label: "Indigo" },
                        ].map(acc => (
                          <button
                            key={acc.id}
                            title={acc.label}
                            onClick={() => setTheme({ ...theme, accent: acc.id })}
                            className={`size-8 rounded-full flex items-center justify-center cursor-pointer transition-transform relative outline-none ${
                              acc.color
                            } ${theme.accent === acc.id ? "scale-110 ring-4 ring-purple-500/20" : ""}`}
                          >
                            {theme.accent === acc.id && (
                              <CheckCircle2 size={14} className="text-zinc-950 font-bold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave("theme")}
                    className="h-9 px-5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none shadow-md shadow-purple-500/10"
                  >
                    Save Theme Prefs
                  </button>
                </div>
              )}

              {/* ─── Workspace Content ─── */}
              {activeTab === "workspace" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Workspace Settings</h2>
                    <p className="text-[11px] text-zinc-500">Manage overall targets and settings for this workspace.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Workspace Name</label>
                      <input
                        type="text"
                        value={workspace.name}
                        onChange={e => setWorkspace({ ...workspace, name: e.target.value })}
                        className="w-full h-10 bg-zinc-900/50 border border-zinc-800 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-200 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400">Workspace Invite Token</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={workspace.inviteCode}
                          className="w-full h-10 bg-zinc-900/30 border border-zinc-800 rounded-xl pl-3.5 pr-12 text-xs text-zinc-500 outline-none font-mono"
                        />
                        <button
                          onClick={() => { navigator.clipboard.writeText(workspace.inviteCode); triggerToast("Invite code copied."); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center hover:text-zinc-200 transition-colors cursor-pointer text-zinc-500 outline-none"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3.5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-300">Invite New Teammates</p>
                        <p className="text-[10px] text-zinc-500">Allow engineers or designers to join this dashboard board.</p>
                      </div>
                      <button
                        onClick={() => triggerToast("Invite link generated.")}
                        className="h-8 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:text-zinc-200 transition-all text-[10px] font-bold text-zinc-400 cursor-pointer outline-none"
                      >
                        Generate Link
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave("workspace")}
                    className="h-9 px-5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] outline-none shadow-md shadow-purple-500/10"
                  >
                    Save Workspace Prefs
                  </button>
                </div>
              )}

              {/* ─── API Keys Content ─── */}
              {activeTab === "api-keys" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-200">API Access Tokens</h2>
                      <p className="text-[11px] text-zinc-500">Configure keys to authorize external automation integrations.</p>
                    </div>
                    <button
                      onClick={handleCreateKey}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-purple-600/30 border border-purple-500/30 text-[10px] font-bold text-purple-300 hover:bg-purple-600/40 transition-all cursor-pointer outline-none"
                    >
                      <Plus size={12} />
                      Create Key
                    </button>
                  </div>

                  <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-900/10">
                    {apiKeys.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        No active API access tokens found.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500">
                            <th className="py-2.5 px-4 font-semibold uppercase text-[9px] tracking-wider">Name</th>
                            <th className="py-2.5 px-4 font-semibold uppercase text-[9px] tracking-wider">Key</th>
                            <th className="py-2.5 px-4 font-semibold uppercase text-[9px] tracking-wider">Created</th>
                            <th className="py-2.5 px-4 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {apiKeys.map(k => (
                            <tr key={k.id} className="text-zinc-300 hover:bg-zinc-900/10">
                              <td className="py-3 px-4 font-semibold">{k.name}</td>
                              <td className="py-3 px-4 font-mono text-[10px] text-zinc-400">{k.key}</td>
                              <td className="py-3 px-4 text-zinc-500">{k.created}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleRevokeKey(k.id)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer outline-none"
                                  title="Revoke Token"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Security Content ─── */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Security & Credentials</h2>
                    <p className="text-[11px] text-zinc-500">Optimize security gates and password logs.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Password change */}
                    <div className="space-y-3.5 p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl">
                      <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <Lock size={13} />
                        Update Password
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400">Current Password</label>
                          <input type="password" placeholder="••••••••" className="w-full h-9 bg-zinc-950 border border-zinc-900 rounded-xl px-3 text-xs outline-none focus:border-purple-500/70 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full h-9 bg-zinc-950 border border-zinc-900 rounded-xl px-3 text-xs outline-none focus:border-purple-500/70 transition-all" />
                        </div>
                      </div>
                      <button
                        onClick={() => triggerToast("Password updated successfully.")}
                        className="h-8 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:text-zinc-200 text-[10px] font-bold text-zinc-400 cursor-pointer outline-none"
                      >
                        Update Credentials
                      </button>
                    </div>

                    {/* 2FA */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-300">Two-Factor Authentication (2FA)</p>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          Secure your workspace accounts via Google Authenticator or secondary email confirmations.
                        </p>
                      </div>
                      <button
                        onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                        className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative outline-none shrink-0 ${
                          security.twoFactor ? "bg-purple-600" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`size-4 rounded-full bg-white transition-transform ${
                          security.twoFactor ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Billing Content ─── */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Billing & Subscription</h2>
                    <p className="text-[11px] text-zinc-500">Manage payment metrics and access invoice documents.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Plan */}
                    <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                      <div className="absolute -top-4 -right-4 size-16 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/20">
                            Pro Plan
                          </span>
                          <span className="text-xs font-extrabold text-zinc-200">$29/mo</span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100 mt-3">TaskPilot AI Pro Workspace</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Renews automatically on August 15, 2026.</p>
                      </div>
                      <button
                        onClick={() => triggerToast("Subscription management is locked in review.")}
                        className="h-8 w-full mt-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white transition-all cursor-pointer outline-none shadow-md shadow-purple-500/10"
                      >
                        Modify Subscription
                      </button>
                    </div>

                    {/* Payment details */}
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col justify-between min-h-[140px]">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Payment Method</p>
                        <div className="flex items-center gap-2.5 pt-2">
                          <div className="h-7 w-11 bg-zinc-950 border border-zinc-850 rounded flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            VISA
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-300">Visa ending in 8203</p>
                            <p className="text-[9px] text-zinc-500">Expires 09/2029</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => triggerToast("Billing configurations locked in preview.")}
                        className="h-8 w-full mt-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:text-zinc-200 transition-all text-[10px] font-bold text-zinc-400 cursor-pointer outline-none"
                      >
                        Update Payment Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Connected Apps Content ─── */}
              {activeTab === "apps" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200">Connected Applications</h2>
                    <p className="text-[11px] text-zinc-500">Link TaskPilot with third-party software boards.</p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { key: "slack",  name: "Slack Channel Integration", desc: "Push sprint summaries and alert logs to workspaces." },
                      { key: "github", name: "GitHub Repository Hook", desc: "Trigger automatic PR codebase analysis on push." },
                      { key: "figma",  name: "Figma Asset Connector", desc: "Fetch mockup coordinates for UI designs." },
                      { key: "aws",    name: "Amazon Web Services (AWS)", desc: "Trigger server logs and autoscale triggers from AI Assistant." },
                    ].map(app => (
                      <div key={app.key} className="flex items-center justify-between gap-4 p-3.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="text-xs font-semibold text-zinc-300">{app.name}</p>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">{app.desc}</p>
                        </div>
                        {/* Toggle switch */}
                        <button
                          onClick={() => setApps({ ...apps, [app.key]: !apps[app.key] })}
                          className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative outline-none shrink-0 ${
                            apps[app.key] ? "bg-purple-600" : "bg-zinc-800"
                          }`}
                        >
                          <div className={`size-4 rounded-full bg-white transition-transform ${
                            apps[app.key] ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
