import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import DashboardLayout from "../Components/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Projects from "../pages/projects/Projects";
import Tasks from "../pages/tasks/Tasks";
import CalendarPage from "../pages/calendar/Calendar";
import Team from "../pages/team/Team";
import Reports from "../pages/reports/Reports";
import Assistant from "../pages/assistant/Assistant";
import Settings from "../pages/settings/Settings";
import { Sparkles } from "lucide-react";

function Placeholder({ title }) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl min-h-[400px] flex flex-col items-center justify-center text-center select-none shadow-2xl">
      <div className="size-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
        <Sparkles size={26} />
      </div>
      <h2 className="text-xl font-bold text-zinc-200">{title} Sandbox</h2>
      <p className="text-sm text-zinc-500 max-w-sm mt-2 leading-relaxed">
        TaskPilot AI agents are constructing this space. Live data boards, kanban items, and automation graphs will appear here.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "projects",
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "tasks",
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: "calendar",
        element: <Navigate to="/calendar" replace />,
      },
      {
        path: "team",
        element: <Navigate to="/team" replace />,
      },
      {
        path: "reports",
        element: <Navigate to="/reports" replace />,
      },
      {
        path: "ai-assistant",
        element: <Navigate to="/assistant" replace />,
      },
      {
        path: "settings",
        element: <Navigate to="/settings" replace />,
      },
    ],
  },
  {
    path: "/projects",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Projects />,
      },
    ],
  },
  {
    path: "/tasks",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Tasks />,
      },
    ],
  },
  {
    path: "/calendar",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <CalendarPage />,
      },
    ],
  },
  {
    path: "/team",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Team />,
      },
    ],
  },
  {
    path: "/reports",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Reports />,
      },
    ],
  },
  {
    path: "/assistant",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Assistant />,
      },
    ],
  },
  {
    path: "/settings",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
