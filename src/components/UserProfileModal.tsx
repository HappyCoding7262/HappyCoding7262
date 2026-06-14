import React, { useState } from 'react';
import { User } from '../types';
import { X, Check, LogOut } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onSave: (bio: string, avatar: string, password?: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = ['😊', '👩‍🏫', '👨‍🏫', '👱‍♀️', '👩‍🦰', '👩🏽‍💼', '🦸‍♀️', '🦸‍♂️', '🌟', '🎨', '🚀', '⛵'];

export default function UserProfileModal({ user, onSave, onClose, onLogout }: UserProfileModalProps) {
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '😊');
  const [password, setPassword] = useState(user.password || 'ark123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bio, avatar, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[1000] overflow-y-auto">
      <div 
        className="bg-white rounded-[32px] shadow-xl w-full max-w-md overflow-hidden border border-brand-border flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-gray-dark px-8 py-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-serif text-white">Mijn Profiel</h2>
            <p className="text-xs text-brand-gray-light font-medium tracking-[0.05em] uppercase mt-1">Stel je zelf voor aan het team</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-brand-gray-light hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Kies een Avatar</label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all active:scale-95 ${
                    avatar === a 
                      ? 'bg-brand-peach-light border-2 border-brand-peach/50 shadow-sm' 
                      : 'bg-brand-bg border border-transparent hover:bg-slate-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Korte Bio / Moto</label>
            <textarea
              rows={3}
              placeholder="Vertel iets leuks over jezelf..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-5 py-4 rounded-[24px] border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark placeholder-brand-gray-light transition resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-brand-gray-light block">Wijzig Wachtwoord</label>
            <input
              type="password"
              placeholder="Voer nieuw wachtwoord in..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-[24px] border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark placeholder-brand-gray-light transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100/80 active:scale-95 rounded-full transition flex items-center justify-center gap-2 cursor-pointer border border-rose-200/50"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Sessie Beëindigen (Uitloggen)
            </button>
          </div>

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
               <Check className="w-5 h-5" /> Opslaan
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
