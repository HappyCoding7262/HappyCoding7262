import React, { useState } from 'react';
import { User, LocationInfo, Role } from '../types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck, MapPin, Users, Key } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  locations: LocationInfo[];
  onLogin: (userId: string) => void;
  onRegister: (user: User) => void;
}

const AVATAR_OPTIONS = ['😊', '👩‍🏫', '👨‍🏫', '👱‍♀️', '👩‍🦰', '👩🏽‍💼', '🦸‍♀️', '🦸‍♂️', '🌟', '🎨', '🚀', '⛵'];

export default function LoginScreen({ users, locations, onLogin, onRegister }: LoginScreenProps) {
  // Tabs: 'email' | 'register' | 'sandbox'
  const [activeTab, setActiveTab] = useState<'email' | 'register' | 'sandbox'>('sandbox');

  // Email login variables
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Register variables
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Leidster');
  const [regAvatar, setRegAvatar] = useState('😊');
  const [regLocationId, setRegLocationId] = useState(locations[0]?.id || '');
  const [regGroupId, setRegGroupId] = useState('Boventallig / Algemeen');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Find groups of selected location
  const selectedLocationObj = locations.find(l => l.id === regLocationId);
  const availableGroups = selectedLocationObj ? selectedLocationObj.groups : ['Boventallig / Algemeen'];

  // Handle Email Login
  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setEmailError('Vul alstublieft alle velden in.');
      return;
    }

    // Look up user by email
    const foundUser = users.find(u => u.email?.toLowerCase().trim() === emailInput.toLowerCase().trim());
    if (!foundUser) {
      setEmailError('U heeft een onjuist e-mailadres of wachtwoord ingevoerd.');
      return;
    }

    const expectedPassword = foundUser.password || 'ark123';
    if (passwordInput === expectedPassword) {
      onLogin(foundUser.id);
    } else {
      setEmailError('U heeft een onjuist e-mailadres of wachtwoord ingevoerd.');
    }
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Vul alstublieft alle verplichte velden in.');
      return;
    }

    if (regPassword.length < 5) {
      setRegError('Het wachtwoord moet minimaal 5 tekens lang zijn.');
      return;
    }

    // Check if email already exists
    const emailExist = users.some(u => u.email?.toLowerCase().trim() === regEmail.toLowerCase().trim());
    if (emailExist) {
      setRegError('Dit e-mailadres is al in gebruik door een ander account.');
      return;
    }

    const newUserId = `user-${Date.now()}`;

    // Build user object
    const newUserObj: User = {
      id: newUserId,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      avatar: regAvatar,
      bio: regRole === 'Beheerder' ? 'Systeembeheerder' : regRole === 'Manager' ? 'Locatiemanager' : 'Pedagogisch Medewerker',
      locationId: regLocationId,
      groupId: regGroupId,
      points: 0,
      streakCount: 0,
      hearts: 0
    };

    try {
      onRegister(newUserObj);
      setRegSuccess('Account succesvol aangemaakt! U wordt nu ingelogd...');
      setTimeout(() => {
        onLogin(newUserId); 
        setActiveTab('sandbox');
        setEmailInput('');
        setPasswordInput('');
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      setRegError('Systeemfout bij het registreren van het account.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-1.5 xs:p-3 sm:p-8 selection:bg-brand-peach/30">
      <div className="max-w-xl w-[98%] sm:w-full bg-white rounded-[32px] p-5 sm:p-10 shadow-xl border border-brand-border duration-300">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-brand-sage-lighter rounded-full text-brand-olive mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-olive" />
          </div>
          <h1 className="text-3xl font-serif text-brand-gray-dark tracking-tight mb-2">Pedagogisch Portal De Ark</h1>
          <p className="text-sm text-brand-gray">Samen zorgen voor een stralende dag op de groepen ⛵</p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex bg-brand-bg p-1 rounded-full border border-brand-border mb-8 overflow-x-auto gap-0.5">
          <button
            onClick={() => {
              setActiveTab('sandbox');
              setEmailError('');
            }}
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sandbox' ? 'bg-brand-olive text-white shadow-sm' : 'text-brand-gray-light hover:text-brand-gray'
            }`}
          >
            🛠️ Sandbox
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setEmailError('');
            }}
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'email' ? 'bg-white shadow-sm text-brand-gray-dark border border-brand-border/30' : 'text-brand-gray-light hover:text-brand-gray'
            }`}
          >
            E-mail & Wachtwoord
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegError('');
              setRegSuccess('');
            }}
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === 'register' ? 'bg-white shadow-sm text-brand-gray-dark border border-brand-border/30' : 'text-brand-gray-light hover:text-brand-gray'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Form area */}

        {/* TAB 1: SANDBOX QUICK LOGIN */}
        {activeTab === 'sandbox' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-brand-sage-lighter border border-brand-sage/20 rounded-2xl p-4 text-xs text-brand-olive font-medium leading-relaxed">
              <span className="font-bold">🛠️ Sandbox-modus actief:</span> Klik op een account hieronder om direct in te loggen zonder een e-mailadres of wachtwoord te hoeven invoeren. Handig tijdens het testen en ontwikkelen!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user.id)}
                  type="button"
                  className="flex items-center gap-3 p-3 text-left bg-brand-bg hover:bg-brand-sage-lighter border border-brand-border hover:border-brand-sage/40 rounded-2xl transition duration-200 active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-xs border border-brand-border group-hover:border-brand-sage/30 shrink-0">
                    {user.avatar || '😊'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-brand-gray-dark truncate max-w-[120px]" title={user.name}>
                        {user.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase shrink-0 ${
                        user.role === 'Beheerder' 
                          ? 'bg-red-100 text-red-700' 
                          : user.role === 'Manager' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-gray-light truncate mt-0.5">
                      {locations.find(l => l.id === user.locationId)?.name || 'Geen locatie'} • {user.groupId}
                    </p>
                  </div>
                  <div className="text-[10px] font-extrabold text-brand-gray-light uppercase tracking-wider pr-1 group-hover:text-brand-olive transition-colors shrink-0">
                    Snel Login →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TRADITIONAL EMAIL/PASSWORD LOGIN */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailLoginSubmit} className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-brand-sage" /> E-mailadres
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="naam@ark.nl"
                className="w-full px-5 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-sage" /> Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showEmailPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Voer uw wachtwoord in..."
                  className="w-full pl-5 pr-12 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-light hover:text-brand-gray cursor-pointer"
                >
                  {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {emailError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                ⚠️ {emailError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-brand-olive hover:bg-brand-olive-light text-white text-xs font-bold uppercase tracking-widest rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Account Inloggen
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: REGISTRATION OF USERS */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in max-h-[500px] overflow-y-auto pr-2">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-brand-peach animate-pulse" /> Volledige Naam *
              </label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="bijv. Sophie van Dam"
                className="w-full px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium animate-fade-in"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-brand-peach" /> E-mailadres *
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="sophie@ark.nl"
                className="w-full px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-peach" /> Wachtwoord *
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Kies een veilig wachtwoord..."
                className="w-full px-5 py-3 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                  Dagelijkse Locatie
                </label>
                <select
                  value={regLocationId}
                  onChange={e => {
                    const locId = e.target.value;
                    setRegLocationId(locId);
                    const lObj = locations.find(l => l.id === locId);
                    if (lObj && lObj.groups.length > 0) {
                      setRegGroupId(lObj.groups[0]);
                    } else {
                      setRegGroupId('Boventallig / Algemeen');
                    }
                  }}
                  className="w-full px-4 py-3 border border-brand-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-peach text-xs font-bold text-brand-gray"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                  Actieve Groep
                </label>
                <select
                  value={regGroupId}
                  onChange={e => setRegGroupId(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-peach text-xs font-bold text-brand-gray"
                >
                  {availableGroups.map(grp => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider block">
                Kies uw avatar emoji: <span className="text-brand-peach font-bold text-sm ml-1">{regAvatar}</span>
              </label>
              <div className="flex flex-wrap gap-2 bg-brand-bg p-3 rounded-[20px] border border-brand-border justify-center">
                {AVATAR_OPTIONS.map(emo => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setRegAvatar(emo)}
                    className={`text-2xl p-2 rounded-xl transition hover:bg-white active:scale-95 duration-100 ${
                      regAvatar === emo ? 'bg-white shadow border border-brand-peach' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {regError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                ⚠️ {regError}
              </p>
            )}

            {regSuccess && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                ✅ {regSuccess}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 px-6 bg-brand-sage hover:bg-brand-olive text-white text-xs font-bold uppercase tracking-widest rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Account Creëren & Registreren
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
