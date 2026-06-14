/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, FolderClosed, ClipboardList, Compass, MessageCircle, Plus, X, Tag } from 'lucide-react';
import { CategoryType, PriorityType, Task, CategoryInfo, LocationInfo, User } from '../types';

interface TaskFormProps {
  currentLocationId: string;
  locations: LocationInfo[];
  categories: CategoryInfo[];
  users?: User[];
  currentUser?: User;
  initialTask?: Task | null;
  onAddTask: (taskData: Omit<Task, 'id' | 'createdByUserId' | 'createdByName' | 'createdAt'>, creatorName: string) => void;
  onEditTask?: (taskId: string, taskData: Partial<Task>) => void;
  onClose: () => void;
}

export default function TaskForm({ currentLocationId, locations, categories, users, currentUser, initialTask, onAddTask, onEditTask, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [creatorName, setCreatorName] = useState(initialTask?.createdByName || currentUser?.name || '');
  const [category, setCategory] = useState<CategoryType>(initialTask?.category || (categories[0]?.type || 'Cleaning'));
  const [priority, setPriority] = useState<PriorityType>(initialTask?.priority || 'Gemiddeld');
  
  // Keep track of locations & groups selection
  const [selectedLocationId, setSelectedLocationId] = useState(initialTask?.locationId || currentLocationId);
  
  const currentLocationObj = locations.find(loc => loc.id === selectedLocationId) || locations[0];
  const [selectedGroup, setSelectedGroup] = useState(initialTask?.groupId || currentLocationObj?.groups[0] || 'Boventallig / Algemeen');
  const [selectedAssignee, setSelectedAssignee] = useState(initialTask?.claimedByUserId || 'unassigned');

  const handleLocationChange = (locId: string) => {
    setSelectedLocationId(locId);
    const targetLoc = locations.find(l => l.id === locId);
    if (targetLoc && targetLoc.groups.length > 0) {
      setSelectedGroup(targetLoc.groups[0]);
    } else {
      setSelectedGroup('Boventallig / Algemeen');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let status = initialTask?.status || 'Open';
    let claimedByUserId = initialTask?.claimedByUserId;
    let claimedByName = initialTask?.claimedByName;
    let claimedAt = initialTask?.claimedAt;

    if (selectedAssignee !== 'unassigned') {
      const assignedUser = users?.find(u => u.id === selectedAssignee);
      if (assignedUser) {
        status = 'Claimed';
        claimedByUserId = assignedUser.id;
        claimedByName = assignedUser.name;
        if (!initialTask?.claimedAt) claimedAt = new Date().toISOString();
        if (initialTask?.status === 'Completed') {
          status = 'Completed'; // Don't revert completed tasks back to claimed
        }
      }
    } else {
      if (initialTask?.status !== 'Completed') {
        status = 'Open';
        claimedByUserId = undefined;
        claimedByName = undefined;
        claimedAt = undefined;
      }
    }

    if (initialTask && onEditTask) {
      onEditTask(initialTask.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        locationId: selectedLocationId,
        groupId: selectedGroup === 'Boventallig / Algemeen' ? undefined : selectedGroup,
        status,
        claimedByUserId,
        claimedByName,
        claimedAt
      });
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        locationId: selectedLocationId,
        groupId: selectedGroup === 'Boventallig / Algemeen' ? undefined : selectedGroup,
        status,
        claimedByUserId,
        claimedByName,
        claimedAt
      }, creatorName.trim());
    }
    
    setTitle('');
    setDescription('');
    onClose();
  };

  const getIconForCategory = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'FolderClosed': return <FolderClosed className="w-4 h-4" />;
      case 'ClipboardList': return <ClipboardList className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'MessageCircle': return <MessageCircle className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[1000] overflow-y-auto" id="task-form-overlay">
      <div 
        className="bg-white rounded-[32px] shadow-xl w-full max-w-lg overflow-hidden border border-brand-border flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-gray-dark px-8 py-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-serif text-white">{initialTask ? 'Taak Bewerken' : 'Nieuwe Taak Toevoegen'}</h2>
            <p className="text-xs text-brand-gray-light font-medium tracking-[0.05em] uppercase mt-1">De Ark geordend en vrolijk</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-brand-gray-light hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
          
          {/* Creator Name */}
          {!initialTask && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Wie voegt deze taak toe?</label>
              <input
                type="text"
                required
                placeholder="Je voornaam..."
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full px-5 py-4 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark placeholder-brand-gray-light transition"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Wat moet er gebeuren?</label>
            <input
              type="text"
              required
              placeholder="Bijv. Knutselpapier op kleur sorteren"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-[24px] border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark placeholder-brand-gray-light transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Instructie of Beschrijving</label>
            <textarea
              required
              rows={3}
              placeholder="Geef een korte toelichting zodat de leidster meteen aan de slag kan."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-[24px] border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark placeholder-brand-gray-light transition resize-none"
            />
          </div>

          {/* Location & Optional Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Locatie</label>
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark appearance-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Groep</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark appearance-none"
              >
                {currentLocationObj?.groups.map((grp) => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
                {!currentLocationObj?.groups.includes('Boventallig / Algemeen') && (
                  <option value="Boventallig / Algemeen">Boventallig / Algemeen</option>
                )}
              </select>
            </div>
          </div>

          {/* Optional Assignee Selection for Admins / Managers */}
          {currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Beheerder') && users && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Toewijzen aan (optioneel)</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-5 py-3.5 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark appearance-none"
              >
                <option value="unassigned">Iedereen (Niet Toegewezen)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Categorie</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = category === cat.type;
                
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setCategory(cat.type)}
                    className={`flex items-center gap-3 p-4 rounded-[24px] border-2 text-left transition ${
                      isSelected
                        ? 'border-brand-peach bg-brand-peach-light text-brand-gray-dark font-bold'
                        : 'border-brand-border bg-white text-brand-gray hover:bg-brand-bg'
                    }`}
                  >
                    <span className={`p-2 rounded-full ${isSelected ? 'bg-white text-brand-peach' : 'bg-brand-bg text-brand-gray-light shadow-sm'}`}>
                      {getIconForCategory(cat.iconName)}
                    </span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority toggles */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Prioriteit</label>
            <div className="flex gap-2">
              {(['Laag', 'Gemiddeld', 'Hoog'] as PriorityType[]).map((p) => {
                const colors = {
                  Laag: 'peer-checked:bg-brand-gray-dark peer-checked:text-white peer-checked:border-brand-gray-dark',
                  Gemiddeld: 'peer-checked:bg-brand-gray-dark peer-checked:text-white peer-checked:border-brand-gray-dark',
                  Hoog: 'peer-checked:bg-brand-gray-dark peer-checked:text-white peer-checked:border-brand-gray-dark'
                };
                
                return (
                  <label key={p} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      className="sr-only peer"
                    />
                    <div className={`py-3.5 text-center text-xs font-semibold text-brand-gray bg-white border border-brand-border rounded-full hover:bg-brand-bg transition-all ${colors[p]}`}>
                      {p}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4.5 text-sm font-semibold text-brand-gray hover:text-brand-gray-dark hover:bg-brand-bg active:scale-95 rounded-full transition border border-transparent"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 py-4.5 text-sm font-bold text-brand-olive bg-brand-sage-light hover:bg-brand-bg active:scale-95 border border-brand-sage rounded-full shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> {initialTask ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
