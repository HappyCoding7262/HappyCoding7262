/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Plus,
  ListFilter,
  CalendarClock,
  CheckCircle,
  FolderLock,
  Compass,
  ArrowRight,
  Flame,
  Trophy,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Task,
  User,
  CategoryType,
  PriorityType,
  LocationInfo,
  CategoryInfo,
} from "../types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import Leaderboard from "./Leaderboard";
import TaskDetailsModal from "./TaskDetailsModal";

interface StaffDashboardProps {
  tasks: Task[];
  users: User[];
  categories: CategoryInfo[];
  locations: LocationInfo[];
  currentUser: User;
  onClaim: (taskId: string, personName?: string) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string, personName?: string) => void;
  onEditTask: (taskId: string, data: Partial<Task>) => void;
  onAddTask: (
    taskData: Omit<
      Task,
      "id" | "createdByUserId" | "createdByName" | "createdAt"
    >,
    creatorName: string,
  ) => void;
  onSendHeart: (userId: string) => void;
  activeStaffName?: string;
  onSetActiveStaffName?: (name: string) => void;
}

export default function StaffDashboard({
  tasks,
  users,
  categories,
  locations,
  currentUser,
  onClaim,
  onUnclaim,
  onComplete,
  onEditTask,
  onAddTask,
  onSendHeart,
  activeStaffName = "Groep",
  onSetActiveStaffName,
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "open" | "claimed" | "completed" | "leaderboard"
  >("open");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | "All"
  >("All");
  const [selectedLocation, setSelectedLocation] = useState<string>(
    currentUser.locationId,
  );
  const [selectedPriority, setSelectedPriority] = useState<
    PriorityType | "Alle"
  >("Alle");
  const [sortField, setSortField] = useState<
    "priority" | "title" | "location" | "status" | "date"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Parse list of individuele leidsters in this group
  const staffList = currentUser.staffNames
    ? currentUser.staffNames.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleClaim = (taskId: string) => {
    if (activeStaffName && activeStaffName !== "Groep") {
      onClaim(taskId, activeStaffName);
    } else {
      onClaim(taskId);
    }
  };

  const handleComplete = (taskId: string) => {
    if (activeStaffName && activeStaffName !== "Groep") {
      onComplete(taskId, activeStaffName);
    } else {
      onComplete(taskId);
    }
  };

  // Grouped counts specifically for current location
  const locationTasks = tasks.filter((t) => t.locationId === selectedLocation);

  const counts = {
    open: locationTasks.filter((t) => t.status === "Open").length,
    claimed: locationTasks.filter(
      (t) => t.status === "Claimed" && t.claimedByUserId === currentUser.id,
    ).length,
    completed: locationTasks.filter((t) => t.status === "Completed").length,
  };

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

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortField === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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
        return a.title.localeCompare(b.title) * dir;
      }
      if (sortField === "status") {
        return a.status.localeCompare(b.status) * dir;
      }
      return 0;
    });
  };

  // Filter logic
  const filteredTasks = sortTasks(
    locationTasks.filter((task) => {
      // 1. Filter by state & user criteria
      if (activeTab === "open" && task.status !== "Open") return false;
      if (
        activeTab === "claimed" &&
        (task.status !== "Claimed" || task.claimedByUserId !== currentUser.id)
      )
        return false;
      if (activeTab === "completed" && task.status !== "Completed")
        return false;

      // 2. Filter by category
      if (selectedCategory !== "All" && task.category !== selectedCategory)
        return false;

      // 3. Filter by priority
      if (selectedPriority !== "Alle" && task.priority !== selectedPriority)
        return false;

      return true;
    }),
  );

  const currentLocationName =
    locations.find((loc) => loc.id === selectedLocation)?.name ||
    "De Ark Noord";

  return (
    <div className="space-y-6" id="staff-dashboard">
      {/* Employee Schedule Header Banner */}
      <div className="bg-brand-sage-lighter rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-brand-peach-light border-4 border-white flex items-center justify-center text-3xl shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <span className="text-sm uppercase tracking-[0.05em] font-bold text-brand-gray-dark mb-1 block">
              Welkom terug, {currentUser.name}! 👋
            </span>
            <h2 className="text-2xl font-serif text-brand-gray-dark flex items-center gap-2 flex-wrap mb-2">
              Je rooster vandaag:
              <span className="inline-flex items-center gap-1.5 text-sm bg-white text-brand-gray-dark border border-brand-border font-medium px-4 py-1.5 rounded-full shadow-sm font-sans mx-1">
                <MapPin className="w-4 h-4 opacity-50" />
                {currentLocationName}
              </span>
              <span className="text-brand-gray-light font-normal text-sm font-sans">
                {" "}
                •{" "}
              </span>
              <span className="text-brand-olive font-medium text-sm bg-brand-sage-light/60 border border-brand-sage-light px-4 py-1.5 rounded-full font-sans mx-1">
                {currentUser.groupId}
              </span>
            </h2>
            {currentUser.streakCount && currentUser.streakCount > 0 ? (
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                  {currentUser.streakCount} Dagen Streak!
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <button
          id="add-task-button"
          onClick={() => setIsAddingTask(true)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-gray-dark hover:bg-black active:scale-95 text-white font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Nieuwe Taak
        </button>
      </div>

      {/* Active Staff Switcher (Shared iPad mode) */}
      {staffList.length > 0 && (
        <div className="bg-white rounded-[32px] p-6 border border-brand-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-gray-dark flex items-center gap-2">
              📱 Gedeelde iPad: wie werkt er nu?
            </h3>
            <p className="text-xs text-brand-gray-light leading-normal">
              Zorg dat jouw naam geselecteerd is zodat verdiende punten direct op jouw naam verschijnen!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => onSetActiveStaffName?.("Groep")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer border ${
                activeStaffName === "Groep"
                  ? "bg-brand-gray-dark text-white border-brand-gray-dark shadow-sm"
                  : "bg-brand-bg text-brand-gray hover:bg-brand-sage-lighter border-brand-border"
              }`}
            >
              🏢 De Groep (Algemeen)
            </button>
            {staffList.map((name) => {
              const isActive = activeStaffName === name;
              return (
                <button
                  key={name}
                  onClick={() => onSetActiveStaffName?.(name)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer border ${
                    isActive
                      ? "bg-brand-sage text-white border-brand-sage shadow-sm scale-102"
                      : "bg-brand-bg text-brand-gray hover:bg-brand-sage-lighter border-brand-border"
                  }`}
                >
                  👩‍🏫 {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Filtering controls */}
      {activeTab !== "leaderboard" && (
        <div className="bg-white rounded-[32px] p-6 border border-brand-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {/* Location selector focus */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">
              Locatie filter
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-brand-border bg-brand-bg text-sm font-medium text-brand-gray-dark focus:ring-2 focus:ring-brand-peach/50 outline-none appearance-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">
              Prioriteit filter
            </label>
            <div className="flex gap-2">
              {(
                ["Alle", "Laag", "Gemiddeld", "Hoog"] as (
                  | PriorityType
                  | "Alle"
                )[]
              ).map((pri) => (
                <button
                  key={pri}
                  onClick={() => setSelectedPriority(pri)}
                  className={`flex-1 py-3 rounded-full border text-xs font-medium text-center transition ${
                    selectedPriority === pri
                      ? "bg-brand-gray-dark text-white border-transparent"
                      : "bg-white text-brand-gray border-brand-border hover:border-brand-gray-light"
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Categories helper */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">
              Categorie filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-brand-border bg-brand-bg text-sm font-medium text-brand-gray-dark focus:ring-2 focus:ring-brand-peach/50 outline-none appearance-none"
            >
              <option value="All">Alle categorieën</option>
              {categories.map((cat) => (
                <option key={cat.type} value={cat.type}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sorteren helper removed as requested */}
        </div>
      )}

      {/* Navigation tabs for state views */}
      <div className="border-b border-brand-border flex flex-wrap gap-6 py-2 items-center justify-between">
        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => setActiveTab("open")}
            id="tab-open-tasks"
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === "open"
                ? "border-brand-gray-dark text-brand-gray-dark"
                : "border-transparent text-brand-gray-light hover:text-brand-gray"
            }`}
          >
            <Sparkles className="w-4 h-4 opacity-70" />
            <span>
              Openstaand{" "}
              <span className="opacity-60 ml-1">({counts.open})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("claimed")}
            id="tab-claimed-tasks"
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === "claimed"
                ? "border-brand-gray-dark text-brand-gray-dark"
                : "border-transparent text-brand-gray-light hover:text-brand-gray"
            }`}
          >
            <CalendarClock className="w-4 h-4 opacity-70" />
            <span>
              Mijn taken{" "}
              <span className="opacity-60 ml-1">({counts.claimed})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            id="tab-completed-tasks"
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === "completed"
                ? "border-brand-gray-dark text-brand-gray-dark"
                : "border-transparent text-brand-gray-light hover:text-brand-gray"
            }`}
          >
            <CheckCircle className="w-4 h-4 opacity-70" />
            <span>
              Voltooid{" "}
              <span className="opacity-60 ml-1">({counts.completed})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            id="tab-leaderboard"
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === "leaderboard"
                ? "border-brand-peach text-brand-gray-dark"
                : "border-transparent text-brand-gray-light hover:text-brand-gray"
            }`}
          >
            <Trophy className="w-4 h-4 text-brand-salmon opacity-70" />
            <span>Scorebord</span>
          </button>
        </div>

        {activeTab !== "leaderboard" && (
          <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border mb-2">
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
        )}
      </div>

      {activeTab === "leaderboard" && (
        <Leaderboard
          users={users}
          tasks={tasks}
          onSendHeart={onSendHeart}
          currentUser={currentUser}
          activeStaffName={activeStaffName}
        />
      )}

      {/* Main Task Feed listing */}
      {activeTab !== "leaderboard" &&
        (viewMode === "grid" ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            id="task-feed-container"
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  categories={categories}
                  locations={locations}
                  onClaim={handleClaim}
                  onUnclaim={onUnclaim}
                  onComplete={handleComplete}
                  onEdit={setEditingTask}
                  onUpdateTask={onEditTask}
                />
              ))
            ) : (
              <div className="col-span-full py-12 px-6 border-2 border-dashed border-slate-100 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 bg-slate-50/20">
                <span className="text-4xl">🌤️</span>
                <div>
                  <h4 className="text-base font-bold text-slate-700">
                    Helemaal leeg!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {activeTab === "open"
                      ? "Er zijn momenteel geen openstaande taken voor deze categorie of locatie. Voeg er zelf eentje toe!"
                      : activeTab === "claimed"
                        ? "Je hebt op dit moment geen taken geclaimd. Bekijk de openstaande lijst om een taak op te pakken!"
                        : "Nog geen taken voltooid op deze locatie vandaag. Laten we samen de eerste afronden!"}
                  </p>
                </div>

                {activeTab === "claimed" && (
                  <button
                    onClick={() => setActiveTab("open")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition"
                  >
                    Bekijk open taken <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {filteredTasks.length > 0 ? (
              <>
                {/* Mobile version: Compact vertical list layout */}
                <div className="md:hidden space-y-3">
                  {filteredTasks.map((task) => (
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
                              : task.status === "Claimed"
                                ? `Bezig: ${task.claimedByName}`
                                : `Gedaan: ${task.completedByName}`}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {task.status !== "Completed" && (
                            <button
                              onClick={() => setEditingTask(task)}
                              className="text-brand-gray hover:text-brand-olive hover:bg-brand-bg text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                            >
                              Bewerk
                            </button>
                          )}
                          {task.status === "Completed" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedTaskForDetails(task)}
                                className="text-brand-gray hover:text-brand-olive hover:bg-brand-bg text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                              >
                                Info ℹ️
                              </button>
                              <button
                                onClick={() => onEditTask(task.id, {
                                  status: "Open",
                                  completedByUserId: null as any,
                                  completedByName: null as any,
                                  completedAt: null as any,
                                  claimedByUserId: null as any,
                                  claimedByName: null as any,
                                  claimedAt: null as any,
                                  cheerMessage: null as any
                                })}
                                className="text-brand-gray hover:text-brand-peach hover:bg-brand-peach/5 text-xs font-bold px-3 py-1.5 border border-brand-border hover:border-brand-peach/50 rounded-full transition"
                              >
                                Heropenen ↩️
                              </button>
                            </div>
                          )}
                          {task.status === "Open" && (
                            <button
                              onClick={() => handleClaim(task.id)}
                              className="text-brand-peach hover:bg-brand-peach/5 text-xs font-bold px-3 py-1.5 border border-brand-peach/30 rounded-full transition"
                            >
                              Claim
                            </button>
                          )}
                          {task.status === "Claimed" && task.claimedByUserId === currentUser.id && (
                            <>
                              <button
                                onClick={() => onUnclaim(task.id)}
                                className="text-brand-gray hover:bg-brand-bg text-xs font-bold px-3 py-1.5 border border-brand-border rounded-full transition"
                              >
                                Teruggeven
                              </button>
                              <button
                                onClick={() => handleComplete(task.id)}
                                className="text-brand-sage hover:bg-brand-sage/5 text-xs font-bold px-3 py-1.5 border border-brand-sage/30 rounded-full transition"
                              >
                                Afronden
                              </button>
                            </>
                          )}
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
                          Datum/Tijd{" "}
                          {sortField === "date" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 flex justify-end">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {filteredTasks.map((task) => (
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
                                : task.status === "Claimed"
                                  ? `Bezig: ${task.claimedByName}`
                                  : `Gedaan: ${task.completedByName}`}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-brand-gray-light font-medium">
                            {task.status === "Completed" && task.completedAt
                              ? new Date(task.completedAt).toLocaleString("nl-NL", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : task.createdAt
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
                              {task.status !== "Completed" && (
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="text-brand-gray hover:text-brand-olive text-xs font-bold"
                                >
                                  Bewerk
                                </button>
                              )}
                              {task.status === "Completed" && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setSelectedTaskForDetails(task)}
                                    className="text-brand-olive hover:text-brand-olive-dark text-xs font-bold"
                                  >
                                    Info ℹ️
                                  </button>
                                  <button
                                    onClick={() => onEditTask(task.id, {
                                      status: "Open",
                                      completedByUserId: null as any,
                                      completedByName: null as any,
                                      completedAt: null as any,
                                      claimedByUserId: null as any,
                                      claimedByName: null as any,
                                      claimedAt: null as any,
                                      cheerMessage: null as any
                                    })}
                                    className="text-brand-peach hover:text-brand-peach-dark text-xs font-bold"
                                  >
                                    Heropenen ↩️
                                  </button>
                                </div>
                              )}
                              {task.status === "Open" && (
                                <button
                                  onClick={() => handleClaim(task.id)}
                                  className="text-brand-peach hover:text-brand-peach-dark text-xs font-bold"
                                >
                                  Claim
                                </button>
                              )}
                              {task.status === "Claimed" &&
                                task.claimedByUserId === currentUser.id && (
                                  <>
                                    <button
                                      onClick={() => onUnclaim(task.id)}
                                      className="text-brand-gray hover:text-brand-gray-dark text-xs font-bold"
                                    >
                                      Teruggeven
                                    </button>
                                    <button
                                      onClick={() => handleComplete(task.id)}
                                      className="text-brand-olive hover:text-brand-sage text-xs font-bold"
                                    >
                                      Afronden
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-12 px-6 text-center border border-brand-border rounded-2xl bg-white flex flex-col items-center justify-center space-y-3">
                <span className="text-4xl">🌤️</span>
                <div>
                  <h4 className="text-base font-bold text-slate-700">
                    Helemaal leeg!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Hier zijn momenteel geen resultaten gevonden.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

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

      {/* Task Detailed Info Modal */}
      {selectedTaskForDetails && (
        <TaskDetailsModal
          task={selectedTaskForDetails}
          locations={locations}
          categories={categories}
          onClose={() => setSelectedTaskForDetails(null)}
        />
      )}
    </div>
  );
}
