import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Users,
  AlertCircle,
  X,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  Flame,
  Check,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { FiSliders } from "react-icons/fi";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectService";

// Static team palette — used for UI display & creation form
const teamOptions = [
  { name: "Sarah Jenkins", initials: "SJ", bg: "bg-purple-600/30 text-purple-200 border-purple-500/30" },
  { name: "Alex Riviera",  initials: "AR", bg: "bg-cyan-600/30 text-cyan-200 border-cyan-500/30" },
  { name: "Marcus Chen",   initials: "MC", bg: "bg-emerald-600/30 text-emerald-200 border-emerald-500/30" },
  { name: "Elena Rostova", initials: "ER", bg: "bg-pink-600/30 text-pink-200 border-pink-500/30" },
  { name: "AI Agent",      initials: "AI", bg: "bg-gradient-to-tr from-purple-500 to-cyan-500 text-white border-purple-400/30" },
];

const BLANK_FORM = {
  name: "",
  description: "",
  progress: 0,
  dueDate: "",
  status: "Planning",
  priority: "Medium",
  healthScore: 90,
  selectedTeam: [],
};

function Projects() {
  const [projects, setProjects]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Create modal state
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [formData, setFormData]           = useState(BLANK_FORM);
  const [submitting, setSubmitting]       = useState(false);

  // Edit modal state
  const [editingProject, setEditingProject] = useState(null);
  const [isEditOpen, setIsEditOpen]         = useState(false);
  const [editForm, setEditForm]             = useState(BLANK_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId]       = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage]   = useState(null);

  // ─── Fetch projects on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Toast helper ─────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─── Filtered view ────────────────────────────────────────────────────────
  const filteredProjects = projects.filter((project) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(q) ||
      (project.description || "").toLowerCase().includes(q);
    const matchesStatus   = statusFilter === "All"   || project.status   === statusFilter;
    const matchesPriority = priorityFilter === "All" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // ─── Badge helpers (unchanged UI logic) ──────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case "Blocked":     return "text-red-400 bg-red-500/10 border-red-500/20";
      case "In Progress": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "Completed":   return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "In Review":   return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Planning":    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:            return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":   return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Low":    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
      default:       return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getHealthColor = (score) => {
    if (score >= 90) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Stable" };
    if (score >= 70) return { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    label: "Healthy" };
    if (score >= 40) return { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   label: "Warning" };
    return             { text: "text-red-400",    bg: "bg-red-500/10",     border: "border-red-500/20",     label: "Critical" };
  };

  // ─── Resolve team array from selectedTeam names ───────────────────────────
  const resolveTeam = (selectedNames) => {
    const members = teamOptions.filter((m) => selectedNames.includes(m.name));
    return members.length > 0 ? members : [teamOptions[4]]; // default: AI Agent
  };

  // ─── Toggle team member selection (shared between create & edit) ──────────
  const toggleTeam = (setter, selectedTeam, memberName) => {
    setter((prev) => {
      const isSelected = prev.selectedTeam.includes(memberName);
      return {
        ...prev,
        selectedTeam: isSelected
          ? prev.selectedTeam.filter((n) => n !== memberName)
          : [...prev.selectedTeam, memberName],
      };
    });
  };

  // ─── CREATE ───────────────────────────────────────────────────────────────
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name:        formData.name,
        description: formData.description || "",
        status:      formData.status,
        priority:    formData.priority,
        progress:    parseInt(formData.progress) || 0,
        healthScore: parseInt(formData.healthScore) || 90,
        dueDate:     formData.dueDate || null,
        team:        resolveTeam(formData.selectedTeam),
      };
      const res = await createProject(payload);
      setProjects([res.data, ...projects]);
      setIsModalOpen(false);
      setFormData(BLANK_FORM);
      triggerToast(`Project "${res.data.name}" has been initialized.`);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── OPEN EDIT MODAL ──────────────────────────────────────────────────────
  const openEditModal = (project) => {
    setEditingProject(project);
    const currentTeamNames = (project.team || []).map((m) => m.name);
    setEditForm({
      name:         project.name,
      description:  project.description || "",
      progress:     project.progress ?? 0,
      dueDate:      project.dueDate ? project.dueDate.slice(0, 10) : "",
      status:       project.status,
      priority:     project.priority,
      healthScore:  project.healthScore ?? 90,
      selectedTeam: currentTeamNames,
    });
    setIsEditOpen(true);
  };

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editingProject) return;
    setEditSubmitting(true);
    try {
      const payload = {
        name:        editForm.name,
        description: editForm.description || "",
        status:      editForm.status,
        priority:    editForm.priority,
        progress:    parseInt(editForm.progress) || 0,
        healthScore: parseInt(editForm.healthScore) || 90,
        dueDate:     editForm.dueDate || null,
        team:        resolveTeam(editForm.selectedTeam),
      };
      const res = await updateProject(editingProject._id, payload);
      setProjects(projects.map((p) => (p._id === editingProject._id ? res.data : p)));
      setIsEditOpen(false);
      setEditingProject(null);
      triggerToast(`Project "${res.data.name}" updated successfully.`);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to update project.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const handleDeleteProject = async (id) => {
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      setConfirmDeleteId(null);
      triggerToast("Project deleted successfully.");
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Format due date for display ─────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-CA"); // YYYY-MM-DD style
  };

  // ─── Shared form fields component ─────────────────────────────────────────
  const renderFormFields = (form, setForm) => (
    <div className="space-y-4 text-xs">
      {/* Project Name */}
      <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold">Project Name *</label>
        <input
          type="text"
          required
          placeholder="e.g., 'API Gateway Migration'"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3.5 text-zinc-200 placeholder-zinc-600 outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-zinc-400 font-bold">Description</label>
        <textarea
          placeholder="Summarize the core targets and systems involved..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-zinc-200 placeholder-zinc-600 outline-none transition-all resize-none"
        />
      </div>

      {/* Row: Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-zinc-400 font-bold">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-400 font-bold">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3 text-zinc-300 outline-none cursor-pointer"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Row: Progress, AI Health, Due Date */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-zinc-400 font-bold">Progress (%)</label>
          <input
            type="number" min={0} max={100}
            value={form.progress}
            onChange={(e) => setForm({ ...form, progress: e.target.value })}
            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3 text-zinc-200 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-400 font-bold flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-400" />
            Health Score
          </label>
          <input
            type="number" min={0} max={100}
            value={form.healthScore}
            onChange={(e) => setForm({ ...form, healthScore: e.target.value })}
            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3 text-zinc-200 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-400 font-bold">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full h-10 bg-zinc-900 border border-zinc-800 focus:border-purple-500/80 rounded-xl px-3 text-zinc-200 outline-none text-zinc-300"
          />
        </div>
      </div>

      {/* Team Allocations */}
      <div className="space-y-2">
        <label className="text-zinc-400 font-bold flex items-center gap-1.5">
          <Users size={12} className="text-purple-400" />
          Team Allocations
        </label>
        <div className="grid grid-cols-2 gap-2">
          {teamOptions.map((member) => {
            const isSelected = form.selectedTeam.includes(member.name);
            return (
              <div
                key={member.name}
                onClick={() =>
                  setForm((prev) => {
                    const isS = prev.selectedTeam.includes(member.name);
                    return {
                      ...prev,
                      selectedTeam: isS
                        ? prev.selectedTeam.filter((n) => n !== member.name)
                        : [...prev.selectedTeam, member.name],
                    };
                  })
                }
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isSelected
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-200"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`size-5 rounded-full flex items-center justify-center text-[9px] font-bold ${member.bg}`}>
                    {member.initials}
                  </span>
                  <span className="text-[11px] truncate max-w-[120px]">{member.name}</span>
                </div>
                {isSelected && <Check size={12} className="text-purple-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-zinc-950/90 border border-purple-500/30 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="size-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-xs font-semibold text-zinc-200">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Projects
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {filteredProjects.length} Active
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Track workflow deliverables, AI orchestration index, and velocity health.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-4.5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none"
        >
          <Plus size={15} />
          Create Project
        </button>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4.5 backdrop-blur-xl">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects by name or detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-zinc-950/60 border border-zinc-900 focus:border-purple-500/70 rounded-xl pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs shrink-0 flex items-center gap-1">
              <Filter size={12} /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-300 outline-none transition-all cursor-pointer min-w-[130px]"
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs shrink-0 flex items-center gap-1">
              <FiSliders size={12} /> Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 bg-zinc-950 border border-zinc-900 focus:border-purple-500/70 rounded-xl px-3.5 text-xs text-zinc-300 outline-none transition-all cursor-pointer min-w-[130px]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
          <span className="ml-3 text-sm text-zinc-500">Loading projects...</span>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center"
        >
          <div className="size-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-sm font-bold text-red-300">Failed to load projects</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* PROJECTS GRID */}
      {!loading && !error && (
        filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-12 text-center backdrop-blur-xl"
          >
            <div className="size-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
              <FolderKanban size={20} />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">No projects found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {projects.length === 0
                ? "Create your first project using the button above."
                : "Try adjusting your search terms or filter constraints."}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const health = getHealthColor(project.healthScore ?? 90);
                const isDeleting = deletingId === project._id;
                const isConfirming = confirmDeleteId === project._id;

                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
                  >
                    {/* Neon hover pulse */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent blur-xl pointer-events-none group-hover:opacity-100 transition-opacity opacity-0" />

                    <div>
                      {/* Status / Priority badges + Edit / Delete actions */}
                      <div className="flex items-center justify-between gap-2.5 mb-4 select-none">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getStatusBadge(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>

                        {/* Card action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(project)}
                            title="Edit project"
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>
                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteProject(project._id)}
                                disabled={isDeleting}
                                className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer font-semibold"
                              >
                                {isDeleting ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] px-2 py-1 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(project._id)}
                              title="Delete project"
                              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-md font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                        {project.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {project.description || "No description provided."}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-zinc-500">Workspace Progress</span>
                          <span className="text-zinc-200">{project.progress ?? 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress ?? 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${
                              project.status === "Blocked"
                                ? "from-red-500 to-rose-600"
                                : project.status === "Completed"
                                ? "from-emerald-500 to-teal-400"
                                : "from-purple-500 to-cyan-400"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="mt-6 pt-4.5 border-t border-zinc-900/80 space-y-4">
                      <div className="flex items-center justify-between gap-4.5">
                        {/* Health rating */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block select-none">
                            AI Health Rating
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-extrabold ${health.text}`}>
                              {project.healthScore ?? 90}%
                            </span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${health.border} ${health.bg} ${health.text} select-none`}>
                              {health.label}
                            </span>
                          </div>
                        </div>

                        {/* Team Avatars */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block text-right select-none">
                            Team Allocations
                          </span>
                          <div className="flex items-center justify-end -space-x-1.5 overflow-hidden">
                            {(project.team || []).map((member, i) => (
                              <div
                                key={i}
                                title={member.name}
                                className={`size-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold select-none cursor-help shrink-0 ${member.bg}`}
                              >
                                {member.initials}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between gap-3 text-xs pt-1">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Calendar size={13} />
                          <span className="font-medium text-[11px]">{formatDate(project.dueDate)}</span>
                        </div>
                        <button
                          onClick={() => triggerToast(`Navigating: Project detail board for ${project.name} opened.`)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors outline-none cursor-pointer text-xs"
                        >
                          Open Project
                          <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )
      )}

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-4 top-[10%] max-w-xl mx-auto z-50 bg-zinc-950/90 border border-zinc-900 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl select-none outline-none overflow-y-auto max-h-[80vh]"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-zinc-200">Initialize New Project</h2>
                    <p className="text-[11px] text-zinc-500">Add metadata and set AI targets.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                {renderFormFields(formData, setFormData)}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-semibold outline-none text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-purple-500/10 cursor-pointer transition-all active:scale-[0.98] outline-none text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    {submitting ? "Creating..." : "Initialize Board"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT PROJECT MODAL */}
      <AnimatePresence>
        {isEditOpen && editingProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-4 top-[10%] max-w-xl mx-auto z-50 bg-zinc-950/90 border border-zinc-900 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl select-none outline-none overflow-y-auto max-h-[80vh]"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-zinc-200">Edit Project</h2>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[220px]">{editingProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                {renderFormFields(editForm, setEditForm)}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="h-10 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer font-semibold outline-none text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-500 hover:from-cyan-500 hover:to-purple-400 text-white font-semibold shadow-lg cursor-pointer transition-all active:scale-[0.98] outline-none text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {editSubmitting && <Loader2 size={13} className="animate-spin" />}
                    {editSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Projects;
