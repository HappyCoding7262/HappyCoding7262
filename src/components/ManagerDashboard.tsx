/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Trash2,
  TrendingUp,
  Sparkle,
  Calendar,
  Clock,
  Heart,
  ChevronRight,
  ListCollapse,
  BadgeAlert,
  Search,
  Users,
  Settings,
  Trophy,
  Download,
  LayoutGrid,
  List,
  BarChart2,
} from "lucide-react";
import {
  Task,
  User,
  CategoryType,
  LocationInfo,
  PriorityType,
  CategoryInfo,
} from "../types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import Leaderboard from "./Leaderboard";
import TeamManagement from "./TeamManagement";
import SettingsScreen from "./SettingsScreen";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ManagerDashboardProps {
  tasks: Task[];
  users: User[];
  categories: CategoryInfo[];
  locations: LocationInfo[];
  currentUser: User;
  onClaim: (taskId: string) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onEditTask: (taskId: string, data: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (
    taskData: Omit<
      Task,
      "id" | "createdByUserId" | "createdByName" | "createdAt"
    >,
    creatorName: string,
  ) => void;

  // Settings & Team Management
  onAddUser: (user: Omit<User, "id">) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onSendHeart: (userId: string) => void;
  onAddCategory: (cat: CategoryInfo) => void;
  onDeleteCategory: (type: string) => void;
  onAddLocation: (name: string) => void;
  onUpdateLocation: (id: string, name: string, groups?: string[]) => void;
  onDeleteLocation: (id: string) => void;
  teamGoal: { targetTasks: number; rewardDescription: string };
  onUpdateGoal: (targetTasks: number, rewardDescription: string) => void;
}

export default function ManagerDashboard({
  tasks,
  users,
  categories,
  locations,
  currentUser,
  onClaim,
  onUnclaim,
  onComplete,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSendHeart,
  onAddCategory,
  onDeleteCategory,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  teamGoal,
  onUpdateGoal,
}: ManagerDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "feed" | "timeline" | "trends" | "team" | "settings" | "leaderboard"
  >("feed");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [complimentsLog, setComplimentsLog] = useState<Record<string, string>>(
    {},
  );
  const [sortField, setSortField] = useState<
    "priority" | "title" | "location" | "status" | "date"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 1. Calculate statistics for each location for visual progress cards
  const locationStats = locations.map((loc) => {
    const locTasks = tasks.filter((t) => t.locationId === loc.id);
    return {
      id: loc.id,
      name: loc.name,
      open: locTasks.filter((t) => t.status === "Open").length,
      claimed: locTasks.filter((t) => t.status === "Claimed").length,
      completed: locTasks.filter((t) => t.status === "Completed").length,
    };
  });

  // 2. Filter tasks based on selected location tab
  const filteredTasks = tasks.filter((t) => {
    if (selectedLocation === "all") return true;
    return t.locationId === selectedLocation;
  });

  const handleSort = (
    field: "priority" | "title" | "location" | "status" | "date",
  ) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort function
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortField === "date") {
        // Use completedAt if available, otherwise createdAt
        const dateA = a.completedAt
          ? new Date(a.completedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const dateB = b.completedAt
          ? new Date(b.completedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return (dateA - dateB) * dir;
      }
      if (sortField === "priority") {
        const prioMap = { Hoog: 3, Gemiddeld: 2, Laag: 1 };
        const valA = prioMap[a.priority as keyof typeof prioMap] || 0;
        const valB = prioMap[b.priority as keyof typeof prioMap] || 0;
        return (valA - valB) * dir;
      }
      if (sortField === "location") {
        const locA = locations.find((l) => l.id === a.locationId)?.name || "";
        const locB = locations.find((l) => l.id === b.locationId)?.name || "";
        return locA.localeCompare(locB) * dir;
      }
      if (sortField === "title") {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB) * dir;
      }
      if (sortField === "status") {
        const statusA = a.status || "";
        const statusB = b.status || "";
        return statusA.localeCompare(statusB) * dir;
      }
      return 0;
    });
  };

  // Open & claimed tasks
  const activeTasks = sortTasks(
    filteredTasks.filter((t) => t.status !== "Completed"),
  );

  // Timeline / Completed tasks
  const completedTasks = sortTasks(
    tasks.filter((t) => t.status === "Completed"),
  );

  const handleSendExtraCompliment = (taskId: string, staffName: string) => {
    // Simulate sending real-time encouragement notification
    setComplimentsLog((prev) => ({
      ...prev,
      [taskId]: `Schouderklopje verzonden naar ${staffName}! ❤️`,
    }));
  };

  const selectedTasksToExport = tasks.filter(
    (t) => selectedLocation === "all" || t.locationId === selectedLocation,
  );

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Titel",
      "Beschrijving",
      "Locatie",
      "Prioriteit",
      "Status",
      "Gemaakt Door",
      "Gemaakt Op",
      "Geclaimd Door",
      "Geclaimd Op",
      "Voltooid Door",
      "Voltooid Op",
    ];
    const rows = selectedTasksToExport.map((t) => [
      t.id,
      t.title || "",
      t.description || "",
      locations.find((l) => l.id === t.locationId)?.name || t.locationId,
      t.priority || "",
      t.status || "",
      t.createdByName || "",
      t.createdAt ? new Date(t.createdAt).toLocaleString("nl-NL") : "",
      t.claimedByName || "",
      t.claimedAt ? new Date(t.claimedAt).toLocaleString("nl-NL") : "",
      t.completedByName || "",
      t.completedAt ? new Date(t.completedAt).toLocaleString("nl-NL") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `taken_overzicht_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Overzicht Taken", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gegenereerd op: ${new Date().toLocaleString("nl-NL")}`, 14, 22);

    const tableData = selectedTasksToExport.map((t) => [
      t.title || "",
      locations.find((l) => l.id === t.locationId)?.name || t.locationId,
      t.priority || "",
      t.status || "",
      t.completedByName || t.claimedByName || t.createdByName || "",
      t.completedAt
        ? new Date(t.completedAt).toLocaleString("nl-NL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : t.createdAt
          ? new Date(t.createdAt).toLocaleString("nl-NL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        ["Titel", "Locatie", "Prioriteit", "Status", "Persoon", "Datum/Tijd"],
      ],
      body: tableData,
    });

    doc.save(`taken_overzicht_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const trendsData = React.useMemo(() => {
    const data = [];
    // past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("nl-NL", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });

      const createdOnDay = tasks.filter(
        (t) =>
          t.createdAt?.startsWith(dateStr) &&
          (selectedLocation === "all" || t.locationId === selectedLocation),
      ).length;
      const completedOnDay = tasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.completedAt?.startsWith(dateStr) &&
          (selectedLocation === "all" || t.locationId === selectedLocation),
      ).length;

      data.push({
        name: displayDate,
        Nieuwe: createdOnDay,
        Voltooid: completedOnDay,
      });
    }
    return data;
  }, [tasks, selectedLocation]);

  return (
    <div className="space-y-6" id="manager-dashboard">
      {/* Visual Workspace Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {locationStats.map((stat) => (
          <div
            key={stat.id}
            onClick={() => setSelectedLocation(stat.id)}
            className={`p-6 rounded-[32px] border transition-all cursor-pointer relative ${
              selectedLocation === stat.id
                ? "bg-brand-gray-dark border-transparent text-white shadow-md"
                : "bg-white border-brand-border hover:border-brand-gray-light text-brand-gray hover:bg-brand-bg/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`p-3 rounded-full flex items-center justify-center ${
                  selectedLocation === stat.id
                    ? "bg-white/10 text-white"
                    : "bg-brand-bg text-brand-gray"
                }`}
              >
                <Building2 className="w-5 h-5" />
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-[0.1em] px-4 py-1.5 rounded-full ${
                  selectedLocation === stat.id
                    ? "bg-white/10 text-white"
                    : "bg-brand-bg text-brand-gray-light"
                }`}
              >
                {stat.name}
              </span>
            </div>

            <h3 className="font-serif text-lg mb-2">{stat.name}</h3>

            <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-brand-border/20 gap-4">
              <div className="text-center flex-1">
                <p
                  className={`text-2xl font-bold ${selectedLocation === stat.id ? "text-white" : "text-brand-gray-dark"}`}
                >
                  {stat.open}
                </p>
                <p
                  className={`text-[10px] uppercase font-medium tracking-[0.1em] mt-1 ${selectedLocation === stat.id ? "text-white/60" : "text-brand-gray-light"}`}
                >
                  Open
                </p>
              </div>
              <div className="text-center flex-1">
                <p
                  className={`text-2xl font-bold ${selectedLocation === stat.id ? "text-white" : "text-brand-gray-dark"}`}
                >
                  {stat.claimed}
                </p>
                <p
                  className={`text-[10px] uppercase font-medium tracking-[0.1em] mt-1 ${selectedLocation === stat.id ? "text-white/60" : "text-brand-gray-light"}`}
                >
                  Bezig
                </p>
              </div>
              <div className="text-center flex-1">
                <p
                  className={`text-2xl font-bold ${selectedLocation === stat.id ? "text-brand-peach" : "text-brand-olive"}`}
                >
                  {stat.completed}
                </p>
                <p
                  className={`text-[10px] uppercase font-medium tracking-[0.1em] mt-1 ${selectedLocation === stat.id ? "text-white/60" : "text-brand-gray-light"}`}
                >
                  Voltooid
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control panel & Action items */}
      <div className="flex flex-col flex-wrap lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-[32px] sm:rounded-full border border-brand-border">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-brand-bg rounded-full border border-brand-border">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "feed"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            Takenlijst
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "timeline"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            Tijdlijn
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "trends"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Trends
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "team"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            <Users className="w-4 h-4" /> Team
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-white text-brand-gray-dark shadow-sm border border-brand-border"
                : "text-brand-gray-light hover:text-brand-gray border border-transparent"
            }`}
          >
            <Settings className="w-4 h-4" /> Instellingen
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto px-2 lg:px-0 flex-wrap lg:flex-nowrap">
          {/* Default sort button removed as requested */}

          <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border hidden md:flex">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-brand-gray hover:text-brand-gray-dark uppercase flex flex-col items-center gap-1 hover:bg-white rounded-full transition"
              title="Exporteer als CSV"
            >
              CSV <Download className="w-3 h-3" />
            </button>
            <div className="w-px bg-brand-border mx-1 my-2"></div>
            <button
              onClick={exportToPDF}
              className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-brand-gray hover:text-brand-gray-dark uppercase flex flex-col items-center gap-1 hover:bg-white rounded-full transition"
              title="Exporteer als PDF"
            >
              PDF <Download className="w-3 h-3" />
            </button>
          </div>

          <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border ml-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-full transition ${viewMode === "grid" ? "bg-white shadow-sm text-brand-gray-dark" : "text-brand-gray-light hover:text-brand-gray"}`}
              title="Grid weergave"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-full transition ${viewMode === "list" ? "bg-white shadow-sm text-brand-gray-dark" : "text-brand-gray-light hover:text-brand-gray"}`}
              title="Lijst weergave"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {selectedLocation !== "all" && (
            <button
              onClick={() => setSelectedLocation("all")}
              className="px-5 py-2.5 rounded-full bg-white border border-brand-border hover:bg-brand-bg text-xs font-semibold text-brand-gray transition"
            >
              Alle
            </button>
          )}

          <button
            onClick={() => setIsAddingTask(true)}
            className="px-6 py-3 rounded-full bg-brand-gray-dark hover:bg-black text-white text-sm font-medium flex items-center gap-2 shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Toevoegen
          </button>
        </div>
      </div>

      {/* Main Content Panels */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-serif text-brand-gray-dark flex items-center gap-3">
              Rapportage actieve taken
            </h3>
            <p className="text-xs text-brand-gray-light uppercase tracking-[0.1em] font-bold">
              Filter via kaarten bovenaan
            </p>
          </div>

          {activeTasks.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {activeTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    categories={categories}
                    locations={locations}
                    onClaim={onClaim}
                    onUnclaim={onUnclaim}
                    onComplete={onComplete}
                    onEdit={setEditingTask}
                    onDelete={onDeleteTask}
                    onUpdateTask={onEditTask}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                {/* Mobile version: Compact vertical list layout */}
                <div className="md:hidden space-y-3">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:shadow-sm transition animate-in fade-in duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-brand-gray-dark text-sm truncate" title={task.title}>
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-brand-gray-light font-medium bg-brand-bg px-2 py-0.5 rounded-full inline-block mt-1">
                            {locations.find((l) => l.id === task.locationId)?.name || "Onbekend"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            task.priority === "Hoog"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "Gemiddeld"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority || "Geen"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-dashed border-brand-border/60 pt-3">
                        <div className="text-[11px] text-brand-gray-light font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-bold mr-1 ${
                            task.status === "Open"
                              ? "bg-slate-100 text-slate-600"
                              : task.status === "Claimed"
                                ? "bg-brand-peach-light text-brand-peach border border-brand-peach/30"
                                : "bg-brand-sage-light text-brand-olive"
                          }`}>
                            {task.status === "Open"
                              ? "Open"
                              : `Bezig: ${task.claimedByName}`}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-brand-gray hover:text-brand-olive hover:bg-brand-bg text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                          >
                            Bewerk
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-brand-gray hover:text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                          >
                            Verwijder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop version: Original full-featured HTML Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-brand-border overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-brand-bg text-brand-gray text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("priority")}
                        >
                          Prioriteit{" "}
                          {sortField === "priority" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("title")}
                        >
                          Taak{" "}
                          {sortField === "title" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("location")}
                        >
                          Locatie{" "}
                          {sortField === "location" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("status")}
                        >
                          Status{" "}
                          {sortField === "status" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("date")}
                        >
                          Aangemaakt Op{" "}
                          {sortField === "date" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 flex justify-end">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {activeTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-brand-bg/50 transition"
                        >
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                task.priority === "Hoog"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "Gemiddeld"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {task.priority || "Geen"}
                            </span>
                          </td>
                          <td
                            className="p-4 font-semibold text-brand-gray-dark max-w-[200px] truncate"
                            title={task.title}
                          >
                            {task.title}
                          </td>
                          <td className="p-4 text-brand-gray-light font-medium">
                            {locations.find((l) => l.id === task.locationId)
                              ?.name || "Onbekend"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                task.status === "Open"
                                  ? "bg-slate-100 text-slate-600"
                                  : task.status === "Claimed"
                                    ? "bg-brand-peach-light text-brand-peach border border-brand-peach/30"
                                    : "bg-brand-sage-light text-brand-olive"
                              }`}
                            >
                              {task.status === "Open"
                                ? "Open"
                                : `Bezig: ${task.claimedByName}`}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-brand-gray-light font-medium">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleString("nl-NL", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-brand-gray hover:text-brand-olive text-xs font-bold"
                              >
                                Bewerk
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="text-brand-gray hover:text-red-500 text-xs font-bold"
                              >
                                Verwijder
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-3xl text-center bg-slate-50/20">
              <span className="text-4xl">🎉</span>
              <h4 className="text-base font-bold text-slate-700 mt-2">
                Geen openstaande taken!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Alle geplande boventallige klusjes voor deze selectie zijn
                afgerond of gedekt. Goed gewerkt!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-sm text-brand-olive font-bold">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 opacity-70" />{" "}
              {completedTasks.length} taken voltooid
            </span>
          </div>

          {completedTasks.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    categories={categories}
                    locations={locations}
                    onClaim={onClaim}
                    onUnclaim={onUnclaim}
                    onComplete={onComplete}
                    onEdit={setEditingTask}
                    onDelete={onDeleteTask}
                    onUpdateTask={onEditTask}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                {/* Mobile version: Compact vertical list layout */}
                <div className="md:hidden space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:shadow-sm transition animate-in fade-in duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-brand-gray-dark text-sm truncate" title={task.title}>
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-brand-gray-light font-medium bg-brand-bg px-2 py-0.5 rounded-full inline-block mt-1">
                            {locations.find((l) => l.id === task.locationId)?.name || "Onbekend"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            task.priority === "Hoog"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "Gemiddeld"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority || "Geen"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-dashed border-brand-border/60 pt-3">
                        <div className="text-[11px] text-brand-gray-light font-medium">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-brand-sage-light text-brand-olive mr-1">
                            Gedaan: {task.completedByName}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-brand-gray hover:text-brand-olive hover:bg-brand-bg text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                          >
                            Bewerk
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-brand-gray hover:text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                          >
                            Verwijder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop version: Original full-featured HTML Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-brand-border overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-brand-bg text-brand-gray text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("priority")}
                        >
                          Prioriteit{" "}
                          {sortField === "priority" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("title")}
                        >
                          Taak{" "}
                          {sortField === "title" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("location")}
                        >
                          Locatie{" "}
                          {sortField === "location" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("status")}
                        >
                          Status{" "}
                          {sortField === "status" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="p-4 cursor-pointer hover:text-brand-gray-dark transition"
                          onClick={() => handleSort("date")}
                        >
                          Voltooid Op{" "}
                          {sortField === "date" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 flex justify-end">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {completedTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-brand-bg/50 transition"
                        >
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                task.priority === "Hoog"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "Gemiddeld"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {task.priority || "Geen"}
                            </span>
                          </td>
                          <td
                            className="p-4 font-semibold text-brand-gray-dark max-w-[200px] truncate"
                            title={task.title}
                          >
                            {task.title}
                          </td>
                          <td className="p-4 text-brand-gray-light font-medium">
                            {locations.find((l) => l.id === task.locationId)
                              ?.name || "Onbekend"}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-brand-sage-light text-brand-olive">
                              Gedaan door: {task.completedByName}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-brand-gray-light font-medium">
                            {task.completedAt
                              ? new Date(task.completedAt).toLocaleString(
                                  "nl-NL",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "-"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-brand-gray hover:text-brand-olive text-xs font-bold"
                              >
                                Bewerk
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="text-brand-gray hover:text-red-500 text-xs font-bold"
                              >
                                Verwijder
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-3xl text-center bg-slate-50/20">
              <span className="text-4xl">🌤️</span>
              <h4 className="text-base font-bold text-slate-700 mt-2">
                Geen voltooide taken
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Er zijn vandaag nog geen taken afgerond.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-sm text-brand-olive font-bold">
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 opacity-70" /> Werkdruk trend
              (Afgelopen 7 Dagen)
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EFEFEF"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8F8C8C", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8F8C8C", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#F9F8F6" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #EAEAEA",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Nieuwe"
                  name="Nieuwe Taken"
                  fill="#E8A99B"
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                />
                <Bar
                  dataKey="Voltooid"
                  name="Voltooide Taken"
                  fill="#B3B8A8"
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <Leaderboard
          users={users}
          tasks={tasks}
          onSendHeart={onSendHeart}
          currentUser={currentUser}
        />
      )}

      {activeTab === "team" && (
        <TeamManagement
          users={users}
          locations={locations}
          currentUser={currentUser}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      )}

      {activeTab === "settings" && (
        <SettingsScreen
          categories={categories}
          locations={locations}
          teamGoal={teamGoal}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
          onAddLocation={onAddLocation}
          onUpdateLocation={onUpdateLocation}
          onDeleteLocation={onDeleteLocation}
          onUpdateGoal={onUpdateGoal}
        />
      )}

      {/* Task Creation / Edit Modal */}
      {(isAddingTask || editingTask) && (
        <TaskForm
          currentLocationId={currentUser.locationId}
          locations={locations}
          categories={categories}
          users={users}
          currentUser={currentUser}
          initialTask={editingTask}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onClose={() => {
            setIsAddingTask(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
