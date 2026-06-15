import React, { useState } from 'react';
import { CategoryInfo, LocationInfo } from '../types';
import { Plus, X, Pencil, Trash2, Trophy, RotateCcw } from 'lucide-react';

interface SettingsScreenProps {
  categories: CategoryInfo[];
  locations: LocationInfo[];
  teamGoal: { targetTasks: number; rewardDescription: string };
  onAddCategory: (cat: CategoryInfo) => void;
  onDeleteCategory: (type: string) => void;
  onAddLocation: (name: string) => void;
  onUpdateLocation: (id: string, name: string, groups?: string[]) => void;
  onDeleteLocation: (id: string) => void;
  onUpdateGoal: (targetTasks: number, rewardDescription: string) => void;
  onResetLeaderboard: () => Promise<boolean>;
}

export default function SettingsScreen({ 
  categories, 
  locations, 
  teamGoal, 
  onAddCategory, 
  onDeleteCategory, 
  onAddLocation, 
  onUpdateLocation, 
  onDeleteLocation, 
  onUpdateGoal,
  onResetLeaderboard
}: SettingsScreenProps) {
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editingLocName, setEditingLocName] = useState('');
  const [editingLocGroups, setEditingLocGroups] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [goalTarget, setGoalTarget] = useState(teamGoal.targetTasks);
  const [goalReward, setGoalReward] = useState(teamGoal.rewardDescription);

  const [resetState, setResetState] = useState<'idle' | 'confirm' | 'success' | 'error'>('idle');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetLeaderboardClick = async () => {
    setIsResetting(true);
    try {
      const success = await onResetLeaderboard();
      if (success) {
        setResetState('success');
      } else {
        setResetState('error');
      }
    } catch (e) {
      setResetState('error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const type = newCatLabel.trim().replace(/\s+/g, '');
    onAddCategory({
      type,
      label: newCatLabel.trim(),
      iconName: 'Tag', // default generic icon
      color: 'text-brand-gray border-brand-border bg-white',
      bgLight: 'bg-brand-bg text-brand-gray'
    });
    setNewCatLabel('');
  };

  const saveLocation = () => {
    if (editingLocId && editingLocName.trim()) {
      let finalGroups = [...editingLocGroups];
      const trimmedGroup = newGroupName.trim();
      if (trimmedGroup && !finalGroups.includes(trimmedGroup)) {
        finalGroups.push(trimmedGroup);
      }
      onUpdateLocation(editingLocId, editingLocName.trim(), finalGroups);
    }
    setEditingLocId(null);
    setNewGroupName('');
  };

  const handleAddGroupToLocation = () => {
    if (newGroupName.trim() && !editingLocGroups.includes(newGroupName.trim())) {
      setEditingLocGroups([...editingLocGroups, newGroupName.trim()]);
      setNewGroupName('');
    }
  };

  const handleRemoveGroupFromLocation = (groupToRemove: string) => {
    setEditingLocGroups(editingLocGroups.filter(g => g !== groupToRemove));
  };

  const saveGoal = () => {
    onUpdateGoal(goalTarget, goalReward);
    alert('Team doel opgeslagen!');
  };

  return (
    <div className="space-y-8">
      {/* Team Goal Settings */}
      <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-sm">
        <h2 className="text-xl font-serif text-brand-gray-dark mb-6">Team Doel & Verrassing</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="text-xs uppercase font-bold text-brand-gray-light block mb-2">Aantal taken voor doel</label>
            <input 
              type="number"
              value={goalTarget}
              onChange={e => setGoalTarget(Number(e.target.value))}
              className="w-full px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm"
              min="1"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-xs uppercase font-bold text-brand-gray-light block mb-2">Beschrijving verrassing</label>
            <input 
              value={goalReward}
              onChange={e => setGoalReward(e.target.value)}
              placeholder="bijv. Koffie & Taart! of Een loempia trakteren!"
              className="w-full px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm"
            />
          </div>
        </div>
        <button onClick={saveGoal} className="px-6 py-3 bg-brand-sage text-white rounded-full font-bold flex items-center gap-2 hover:bg-brand-sage-light hover:text-brand-olive transition">
          Sla Team Doel Op
        </button>
      </div>

      {/* Locations */}
      <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-sm">
        <h2 className="text-xl font-serif text-brand-gray-dark mb-6">Locaties Beheren</h2>
        
        <div className="flex gap-2 mb-6">
          <input 
            value={newLocName}
            onChange={e => setNewLocName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newLocName.trim()) {
                  onAddLocation(newLocName.trim());
                  setNewLocName('');
                }
              }
            }}
            placeholder="Nieuwe locatie naam..."
            className="flex-1 px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm"
          />
          <button 
            type="button"
            onClick={() => {
              if (newLocName.trim()) {
                onAddLocation(newLocName.trim());
                setNewLocName('');
              }
            }}
            className="px-6 py-3 bg-brand-gray-dark text-white rounded-full font-bold flex items-center gap-2 hover:bg-black"
          >
            <Plus className="w-4 h-4" /> Toevoegen
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {locations.map(loc => (
            <div key={loc.id} className="flex flex-col gap-4 p-4 bg-brand-bg rounded-[20px] border border-brand-border">
              {editingLocId === loc.id ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input 
                      value={editingLocName}
                      onChange={e => setEditingLocName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveLocation();
                        }
                      }}
                      className="flex-1 px-4 py-2 border rounded-full text-sm"
                      placeholder="Naam locatie"
                    />
                    <button type="button" onClick={saveLocation} className="px-4 bg-brand-sage text-white rounded-full text-sm font-bold">Opslaan</button>
                    <button type="button" onClick={() => setEditingLocId(null)} className="px-4 text-brand-gray">X</button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-[16px] border border-brand-border">
                    <h3 className="text-xs uppercase font-bold text-brand-gray-light mb-3">Groepen in deze locatie</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editingLocGroups.map(group => (
                        <span key={group} className="flex items-center gap-1 px-3 py-1 bg-brand-bg rounded-full text-xs font-bold text-brand-gray-dark">
                          {group}
                          <button onClick={() => handleRemoveGroupFromLocation(group)} className="text-brand-gray hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGroupToLocation();
                          }
                        }}
                        placeholder="Nieuwe groep..."
                        className="flex-1 px-3 py-1.5 border rounded-full text-sm"
                      />
                      <button type="button" onClick={handleAddGroupToLocation} className="px-3 bg-brand-gray-dark text-white rounded-full text-xs font-bold">
                        Voeg toe
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-brand-gray-dark text-sm">{loc.name}</div>
                    {loc.groups && loc.groups.length > 0 && (
                      <div className="text-xs text-brand-gray-light mt-1">
                        {loc.groups.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { 
                        setEditingLocId(loc.id); 
                        setEditingLocName(loc.name); 
                        setEditingLocGroups(loc.groups || []);
                        setNewGroupName('');
                      }}
                      className="p-2 border border-brand-border rounded-full hover:bg-white text-brand-gray"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteLocation(loc.id)}
                      className="p-2 border border-brand-border rounded-full hover:bg-red-50 text-brand-gray hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-sm">
        <h2 className="text-xl font-serif text-brand-gray-dark mb-6">Categorieën Beheren</h2>

        <div className="flex gap-2 mb-6">
          <input 
            value={newCatLabel}
            onChange={e => setNewCatLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="Nieuwe categorie naam..."
            className="flex-1 px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm"
          />
          <button 
            type="button"
            onClick={handleAddCategory}
            className="px-6 py-3 bg-brand-gray-dark text-white rounded-full font-bold flex items-center gap-2 hover:bg-black"
          >
            <Plus className="w-4 h-4" /> Toevoegen
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <div key={cat.type} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${cat.color}`}>
              {cat.label}
              {!['Cleaning', 'Organizing', 'Admin', 'Activity'].includes(cat.type) && (
                <button 
                  onClick={() => onDeleteCategory(cat.type)}
                  className="ml-2 hover:opacity-50 text-brand-gray-dark"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Reset */}
      <div className="bg-white border border-red-200 rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          <Trophy className="w-6 h-6 text-brand-peach" />
          <h2 className="text-xl font-serif text-brand-gray-dark">Leaderboard Resetten</h2>
        </div>
        <p className="text-sm text-brand-gray mb-6">
          Wilt u de scores resetten? Hiermee worden de <strong>punten</strong>, <strong>hearts</strong> en <strong>streaks</strong> van álle medewerkers teruggezet naar <strong>0</strong>. Dit heeft geen invloed op de accounts zelf of op de taken.
        </p>

        {resetState === 'idle' ? (
          <button
            onClick={() => setResetState('confirm')}
            className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-full flex items-center gap-2 hover:bg-red-100 transition duration-200"
          >
            <RotateCcw className="w-4 h-4" /> Reset Leaderboard
          </button>
        ) : resetState === 'confirm' ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-red-650">Weet u dit zeker?</span>
            <button
              onClick={handleResetLeaderboardClick}
              disabled={isResetting}
              className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-full text-sm hover:bg-red-700 transition duration-200 flex items-center gap-2 disabled:bg-red-400"
            >
              {isResetting ? 'Bezig met resetten...' : 'Ja, reset nu'}
            </button>
            <button
              onClick={() => setResetState('idle')}
              disabled={isResetting}
              className="px-5 py-2.5 bg-brand-bg text-brand-gray-dark font-bold rounded-full text-sm hover:bg-brand-border transition duration-200"
            >
              Annuleren
            </button>
          </div>
        ) : resetState === 'success' ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium flex items-center justify-between border border-green-200">
            <span>✓ Het leaderboard is succesvol gereset!</span>
            <button 
              onClick={() => setResetState('idle')} 
              className="px-3 py-1 bg-white border border-green-200 text-green-700 rounded-full font-bold text-xs hover:bg-green-100 transition"
            >
              Ok
            </button>
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium flex items-center justify-between border border-red-200">
            <span>❌ Fout opgetreden bij het resetten. Probeer het opnieuw.</span>
            <button 
              onClick={() => setResetState('idle')} 
              className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded-full font-bold text-xs hover:bg-red-100 transition"
            >
              Sluiten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
