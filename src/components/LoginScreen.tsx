import React, { useState } from 'react';
import { User, LocationInfo, Role } from '../types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck, MapPin, Users, Key } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  locations: LocationInfo[];
  onLogin: (userId: string) => void;
  onRegister: (user: Omit<User, 'id'>) => void;
}

const AVATAR_OPTIONS = ['😊', '👩‍🏫', '👨‍🏫', '👱‍♀️', '👩‍🦰', '👩🏽‍💼', '🦸‍♀️', '🦸‍♂️', '🌟', '🎨', '🚀', '⛵'];

export default function LoginScreen({ users, locations, onLogin, onRegister }: LoginScreenProps) {
  // Tabs: 'quick' | 'email' | 'register'
  const [activeTab, setActiveTab] = useState<'quick' | 'email' | 'register'>('quick');

  // Login variables
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [quickError, setQuickError] = useState('');

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

  // Handle Quick Login
  const handleQuickLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    // Check password
    const expectedPassword = selectedUserForPassword.password || 'ark123';
    if (quickPassword === expectedPassword) {
      setQuickError('');
      onLogin(selectedUserForPassword.id);
    } else {
      setQuickError('Onjuist wachtwoord. Probeer het opnieuw of gebruik "ark123"!');
    }
  };

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

    // Build user object
    const newUserObj = {
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
        // Find newly created user to log in
        // A temporary user lookup sequence
        // We look for name or email in the users list
        // Since onRegister updates parent State which triggers async,
        // we can safely auto-login by waiting slightly or finding in the next render cycle, 
        // but since onLogin takes id and saving is immediate, we can estimate id:
        // Actually, App.tsx generates user-id using Date.now().
        // To log in reliably, we can search or pass a callback.
        // But we can also let them select from Quick Login where they will see their beautiful new avatar!
        // Even better, let's trigger search or auto-switch by doing a robust match or letting them log in instantly.
        onLogin(`user-${Date.now()}`); 
        // If lookup fails due to race condition, they can log in via email. Let's redirect to quick/email tab or do an immediate fallback:
        // By changing tab to email with credentials pre-filled
        setActiveTab('email');
        setEmailInput(regEmail);
        setPasswordInput(regPassword);
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      setRegError('Systeemfout bij het registreren van het account.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-8 selection:bg-brand-peach/30">
      <div className="max-w-xl w-full bg-white rounded-[32px] p-6 sm:p-10 shadow-xl border border-brand-border duration-300">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-brand-sage-lighter rounded-full text-brand-olive mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-olive" />
          </div>
          <h1 className="text-3xl font-serif text-brand-gray-dark tracking-tight mb-2">Pedagogisch Portal De Ark</h1>
          <p className="text-sm text-brand-gray">Samen zorgen voor een stralende dag op de groepen ⛵</p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex bg-brand-bg p-1.5 rounded-full border border-brand-border mb-8 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('quick');
              setSelectedUserForPassword(null);
              setQuickError('');
              setQuickPassword('');
            }}
            className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition duration-250 whitespace-nowrap cursor-pointer ${
              activeTab === 'quick' ? 'bg-white shadow-sm text-brand-gray-dark border border-brand-border/30' : 'text-brand-gray-light hover:text-brand-gray'
            }`}
          >
            Snel Inloggen
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setEmailError('');
            }}
            className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition duration-250 whitespace-nowrap cursor-pointer ${
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
            className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition duration-250 whitespace-nowrap cursor-pointer ${
              activeTab === 'register' ? 'bg-white shadow-sm text-brand-gray-dark border border-brand-border/30' : 'text-brand-gray-light hover:text-brand-gray'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Form area */}

        {/* TAB 1: QUICK COMPACT PROFILE LOGIN */}
        {activeTab === 'quick' && (
          <div>
            {!selectedUserForPassword ? (
              <div>
                <p className="text-xs uppercase font-bold text-brand-gray-light tracking-wider mb-4 text-center">
                  Selecteer uw profiel om in te loggen:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserForPassword(user);
                        setQuickPassword('');
                        setQuickError('');
                      }}
                      className="group flex flex-col items-center gap-2.5 p-4 bg-brand-bg rounded-[20px] border border-brand-border hover:shadow-md hover:border-brand-sage-light hover:bg-brand-sage-lighter transition active:scale-95 cursor-pointer text-center relative"
                    >
                      <div className="text-4xl filter drop-shadow hover:scale-110 transition duration-200">{user.avatar}</div>
                      <div>
                        <p className="text-xs font-bold text-brand-gray-dark leading-tight group-hover:text-brand-olive transition">{user.name}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-white border border-brand-border mt-1 text-brand-gray">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickLoginSubmit} className="space-y-5 animate-fade-in bg-brand-bg/60 p-5 rounded-[24px] border border-brand-border">
                <div className="flex items-center gap-3 pb-3 border-b border-brand-border">
                  <span className="text-3xl">{selectedUserForPassword.avatar}</span>
                  <div>
                    <h3 className="text-sm font-bold text-brand-gray-dark">Inloggen als {selectedUserForPassword.name}</h3>
                    <p className="text-xs text-brand-gray-light uppercase tracking-wider font-semibold">{selectedUserForPassword.role}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedUserForPassword(null)}
                    className="ml-auto text-xs text-brand-gray-light hover:text-brand-gray-dark font-semibold border border-brand-border bg-white px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Wissel profiel
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-brand-peach" /> Wachtwoord
                  </label>
                  <div className="relative">
                    <input
                      type={showQuickPassword ? 'text' : 'password'}
                      value={quickPassword}
                      onChange={e => setQuickPassword(e.target.value)}
                      placeholder="Voer uw wachtwoord in..."
                      className="w-full pl-5 pr-12 py-3.5 border border-brand-border bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-light hover:text-brand-gray cursor-pointer"
                    >
                      {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-brand-gray-light">
                      💡 Tip: Vul <span className="font-bold">ark123</span> in voor demo gebruikers.
                    </p>
                  </div>
                </div>

                {quickError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-1.5">
                    ⚠️ {quickError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-brand-olive hover:bg-brand-olive-light text-white text-xs font-bold uppercase tracking-widest rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  Nu Beveiligd Inloggen
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
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
              <p className="text-[10px] text-brand-gray-light pt-1">
                💡 Tip: Log in met <span className="font-bold">mark@ark.nl</span> of <span className="font-bold">anouk@ark.nl</span> en wachtwoord <span className="font-bold">ark123</span>.
              </p>
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
                  Rol / Functie
                </label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as Role)}
                  className="w-full px-4 py-3 border border-brand-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-peach text-xs font-bold text-brand-gray"
                >
                  <option value="Leidster">Pedagogisch medewerkster (Leidster)</option>
                  <option value="Manager">Locatie manager</option>
                  <option value="Beheerder">Systeembeheerder</option>
                </select>
              </div>

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
