import React, { useState } from 'react';
import { User, Role, LocationInfo } from '../types';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

interface TeamManagementProps {
  users: User[];
  locations: LocationInfo[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

const AVATAR_OPTIONS = ['😊', '👩‍🏫', '👨‍🏫', '👱‍♀️', '👩‍🦰', '👩🏽‍💼', '🦸‍♀️', '🦸‍♂️', '🌟', '🎨', '🚀', '⛵'];

export default function TeamManagement({ users, locations, onAddUser, onUpdateUser, onDeleteUser, currentUser }: TeamManagementProps) {
  const [isEditing, setIsEditing] = useState<Partial<User> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      if (isEditing.id) {
        onUpdateUser(isEditing.id, isEditing);
      } else {
        onAddUser({
           name: isEditing.name || '',
           role: isEditing.role || 'Leidster',
           avatar: isEditing.avatar || '😊',
           locationId: isEditing.locationId || 'loc-noord',
           groupId: isEditing.groupId || 'Boventallig / Algemeen',
           points: 0,
           streakCount: 0,
           email: isEditing.email || '',
           password: isEditing.password || 'ark123',
           staffNames: isEditing.staffNames || ''
        });
      }
      setIsEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-serif text-brand-gray-dark">Groepsbeheer</h2>
         <button 
           onClick={() => setIsEditing({})}
           className="px-4 py-2 bg-brand-sage-light text-brand-olive font-bold rounded-full text-sm flex items-center gap-2 hover:bg-brand-sage-lighter"
         >
           <Plus className="w-4 h-4" /> Leidster Toevoegen
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map(u => (
          <div key={u.id} className="p-4 bg-white border border-brand-border rounded-[24px] flex items-center justify-between">
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <span className="text-xl">{u.avatar}</span>
                 <span className="font-bold text-sm text-brand-gray-dark">{u.name}</span>
               </div>
               <span className="text-[10px] uppercase tracking-widest text-brand-gray-light mt-1">{u.role}</span>
               {u.staffNames && (
                 <span className="text-[10px] text-brand-sage font-semibold italic mt-1 max-w-[200px] truncate" title={u.staffNames}>
                   Leidsters: {u.staffNames}
                 </span>
               )}
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={() => setIsEditing(u)}
                 className="p-2 border border-brand-border rounded-full hover:bg-brand-bg text-brand-gray"
               >
                 <Pencil className="w-4 h-4" />
               </button>
               {u.id !== currentUser.id && (
                 <button 
                   onClick={() => onDeleteUser(u.id)}
                   className="p-2 border border-brand-border rounded-full hover:bg-red-50 text-red-500 hover:border-red-200"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[1000] overflow-y-auto">
           <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-md max-h-[calc(100vh-32px)] overflow-hidden border border-brand-border flex flex-col relative my-auto animate-in fade-in zoom-in-95 duration-200">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border/40">
               <h2 className="text-xl sm:text-2xl font-serif text-brand-gray-dark">{isEditing.id ? 'Groepsaccount bewerken' : 'Nieuw groepsaccount'}</h2>
               <button type="button" onClick={() => setIsEditing(null)} className="p-2 rounded-full hover:bg-brand-bg transition cursor-pointer">
                 <X className="w-5 h-5 text-brand-gray" />
               </button>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto scrollbar-thin pr-1 pb-1">
               <div>
                 <label className="text-xs uppercase font-bold text-brand-gray-light">Naam</label>
                 <input 
                   required
                   value={isEditing.name || ''} 
                   onChange={e => setIsEditing({...isEditing, name: e.target.value})}
                   className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px] focus:outline-none focus:border-brand-peach focus:ring-1 focus:ring-brand-peach"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">E-mailadres</label>
                   <input 
                     type="email"
                     required
                     placeholder="bijv. sophie@ark.nl"
                     value={isEditing.email || ''} 
                     onChange={e => setIsEditing({...isEditing, email: e.target.value})}
                     className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px] focus:outline-none focus:border-brand-peach focus:ring-1 focus:ring-brand-peach text-sm"
                   />
                 </div>
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">Wachtwoord</label>
                   <input 
                     type="text"
                     required
                     placeholder="bijv. ark123"
                     value={isEditing.password || ''} 
                     onChange={e => setIsEditing({...isEditing, password: e.target.value})}
                     className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px] focus:outline-none focus:border-brand-peach focus:ring-1 focus:ring-brand-peach text-sm"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">Rol</label>
                   <select 
                     value={isEditing.role || 'Leidster'}
                     onChange={e => setIsEditing({...isEditing, role: e.target.value as Role})}
                     className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px]"
                   >
                     <option value="Leidster">Leidster</option>
                     <option value="Manager">Manager</option>
                     {currentUser.role === 'Beheerder' && (
                       <option value="Beheerder">Beheerder</option>
                     )}
                   </select>
                 </div>
                 {(!isEditing.role || isEditing.role === 'Leidster') && (
                   <div>
                     <label className="text-xs uppercase font-bold text-brand-gray-light">Namen van leidsters in deze groep (optioneel, komma-gescheiden)</label>
                     <input 
                       placeholder="bijv. Anouk, Sanne, Lisa, Sophie"
                       value={isEditing.staffNames || ''} 
                       onChange={e => setIsEditing({...isEditing, staffNames: e.target.value})}
                       className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px] focus:outline-none focus:border-brand-peach focus:ring-1 focus:ring-brand-peach placeholder:text-brand-gray-light text-sm"
                     />
                     <p className="text-[10px] leading-relaxed text-brand-gray mt-1">
                       Flankeer hier de namen van de leidsters die dit account delen. Bij het claimen of voltooien selecteren zij hun eigen naam uit deze lijst.
                     </p>
                   </div>
                 )}
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">Avatar Emoji</label>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {AVATAR_OPTIONS.map((a) => (
                       <button
                         key={a}
                         type="button"
                         onClick={() => setIsEditing({...isEditing, avatar: a})}
                         className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                           (isEditing.avatar || '😊') === a 
                             ? 'bg-brand-peach-light border-2 border-brand-peach/50 shadow-sm' 
                             : 'bg-brand-bg border border-transparent hover:bg-slate-100'
                         }`}
                       >
                         {a}
                       </button>
                     ))}
                     <input 
                       value={isEditing.avatar || '😊'} 
                       onChange={e => setIsEditing({...isEditing, avatar: e.target.value})}
                       className="w-10 h-10 text-center rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm"
                       title="Eigen emoji kiezen"
                       maxLength={2}
                     />
                   </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">Locatie</label>
                   <select 
                     value={isEditing.locationId || locations[0]?.id}
                     onChange={e => setIsEditing({
                       ...isEditing, 
                       locationId: e.target.value,
                       groupId: locations.find(l => l.id === e.target.value)?.groups[0] || 'Boventallig / Algemeen'
                     })}
                     className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px]"
                   >
                     {locations.map(loc => (
                       <option key={loc.id} value={loc.id}>{loc.name}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="text-xs uppercase font-bold text-brand-gray-light">Standaard Groep</label>
                   <select 
                     value={isEditing.groupId || locations.find(l => l.id === (isEditing.locationId || locations[0]?.id))?.groups[0]}
                     onChange={e => setIsEditing({...isEditing, groupId: e.target.value})}
                     className="w-full mt-1 px-4 py-3 bg-brand-bg border border-brand-border rounded-[16px]"
                   >
                     {(locations.find(l => l.id === (isEditing.locationId || locations[0]?.id))?.groups || ['Boventallig / Algemeen']).map(group => (
                       <option key={group} value={group}>{group}</option>
                     ))}
                   </select>
                 </div>
               </div>
               <button type="submit" className="w-full py-4 mt-6 bg-brand-gray-dark text-white rounded-full font-bold hover:bg-black">
                 Opslaan
               </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
