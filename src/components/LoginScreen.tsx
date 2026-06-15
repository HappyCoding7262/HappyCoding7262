import React, { useState } from 'react';
import { User, LocationInfo, Role } from '../types';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, MapPin, Users, Key, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  locations: LocationInfo[];
  onLogin: (userId: string) => void;
  onRegister: (user: User) => void;
  onResetPassword?: (email: string, password: string) => Promise<boolean>;
}

const AVATAR_OPTIONS = ['😊', '👩‍🏫', '👨‍🏫', '👱‍♀️', '👩‍🦰', '👩🏽‍💼', '🦸‍♀️', '🦸‍♂️', '🌟', '🎨', '🚀', '⛵'];

export default function LoginScreen({ users, locations, onLogin, onRegister, onResetPassword }: LoginScreenProps) {
  // Tabs: 'email' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'email' | 'register' | 'forgot'>('email');

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
  const [regAccessCode, setRegAccessCode] = useState('');
  const [regAvatar, setRegAvatar] = useState('😊');
  const [regLocationId, setRegLocationId] = useState(locations[0]?.id || '');
  const [regGroupId, setRegGroupId] = useState('Boventallig / Algemeen');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Reset password variables
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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

    // Role code validation
    if (regRole !== 'Leidster') {
      if (!regAccessCode.trim()) {
        setRegError('Voer de toegangscode in om te registreren met beheer- of manager-rechten.');
        return;
      }
      if (regAccessCode.trim().toUpperCase() !== 'ARK2026') {
        setRegError('Onjuiste toegangscode voor de geselecteerde rol.');
        return;
      }
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
      locationId: regLocationId || '',
      groupId: regGroupId || 'Boventallig / Algemeen',
      points: 0,
      streakCount: 0,
      hearts: 0
    };

    try {
      onRegister(newUserObj);
      setRegSuccess('Account succesvol aangemaakt! U wordt nu ingelogd...');
      setTimeout(() => {
        onLogin(newUserId); 
        setActiveTab('email');
        setEmailInput('');
        setPasswordInput('');
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      setRegError('Systeemfout bij het registreren van het account.');
    }
  };

  // Handle Password Reset Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim() || !resetCode.trim() || !resetNewPassword.trim() || !resetConfirmPassword.trim()) {
      setResetError('Vul alstublieft alle velden in.');
      return;
    }

    if (resetCode.trim().toUpperCase() !== 'ARK2026') {
      setResetError('Onjuiste beheerdercode. Vraag uw beheerder Mark om de juiste code.');
      return;
    }

    if (resetNewPassword.length < 5) {
      setResetError('Het nieuwe wachtwoord moet minimaal 5 tekens lang zijn.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('De nieuwe wachtwoorden komen niet overeen.');
      return;
    }

    // Verify if email is actually registered
    const emailExist = users.some(u => u.email?.toLowerCase().trim() === resetEmail.toLowerCase().trim());
    if (!emailExist) {
      setResetError('Dit e-mailadres is niet bekend binnen De Ark.');
      return;
    }

    try {
      if (onResetPassword) {
        const success = await onResetPassword(resetEmail.trim(), resetNewPassword);
        if (success) {
          setResetSuccess('Uw wachtwoord is succesvol gewijzigd!');
          setTimeout(() => {
            setActiveTab('email');
            setEmailInput(resetEmail);
            setPasswordInput(resetNewPassword);
            setResetEmail('');
            setResetCode('');
            setResetNewPassword('');
            setResetConfirmPassword('');
            setResetSuccess('');
          }, 2000);
        } else {
          setResetError('Fout bij het bijwerken van het wachtwoord.');
        }
      } else {
        setResetError('Wachtwoord herstellen is momenteel niet geconfigureerd.');
      }
    } catch (err) {
      setResetError('Systeemfout bij het herstellen van uw wachtwoord.');
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
          <h1 className="text-3xl font-serif text-brand-gray-dark tracking-tight mb-2">Takenbeheer de Ark</h1>
          <p className="text-sm text-brand-gray">Samen zorgen voor een stralende dag op de groepen ⛵</p>
        </div>

        {/* Tab navigation buttons */}
        {activeTab !== 'forgot' && (
          <div className="flex bg-brand-bg p-1 rounded-full border border-brand-border mb-8 overflow-x-auto gap-0.5">
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
        )}

        {/* Form area */}

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
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-sage" /> Wachtwoord
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setResetEmail(emailInput);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  className="text-xs text-brand-peach hover:text-brand-olive font-bold transition cursor-pointer"
                >
                  Wachtwoord vergeten?
                </button>
              </div>
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

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-peach" /> Functie / Rol *
              </label>
              <select
                value={regRole}
                onChange={e => {
                  setRegRole(e.target.value as Role);
                  setRegError('');
                }}
                className="w-full px-5 py-3 border border-brand-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium text-brand-gray"
              >
                <option value="Leidster">Leidster (Pedagogisch Medewerker)</option>
                <option value="Manager">Manager (Locatieleider)</option>
                <option value="Beheerder">Beheerder (Systeembeheerder)</option>
              </select>
            </div>

            {regRole !== 'Leidster' && (
              <div className="space-y-1.5 animate-pulse-subtle bg-amber-50/50 p-4 rounded-3xl border border-amber-100/60">
                <label className="text-xs uppercase font-bold text-amber-850 tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" /> Toegangscode *
                </label>
                <input
                  type="password"
                  value={regAccessCode}
                  onChange={e => setRegAccessCode(e.target.value)}
                  placeholder="Voer de toegangscode in..."
                  className="w-full px-5 py-3 bg-white border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                  required
                />
              </div>
            )}

            {locations.length > 0 && (
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
            )}

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

        {/* TAB 4: PASSWORD RESET PROCESS */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-brand-border/40">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setResetError('');
                  setResetSuccess('');
                }}
                className="p-1.5 rounded-full hover:bg-brand-bg text-brand-gray-light hover:text-brand-gray transition cursor-pointer"
                title="Terug naar inloggen"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-left">
                <h2 className="text-lg font-bold text-brand-gray-dark leading-none">Wachtwoord herstellen</h2>
                <p className="text-xs text-brand-gray-light mt-1">Stel uw wachtwoord veilig en snel opnieuw in.</p>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-brand-sage" /> E-mailadres van uw account
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="naam@ark.nl"
                className="w-full px-5 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-brand-sage" /> Beheerdercode ter verificatie
              </label>
              <input
                type="password"
                value={resetCode}
                onChange={e => setResetCode(e.target.value)}
                placeholder="Voer de beheerdercode in..."
                className="w-full px-5 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-sage" /> Nieuw wachtwoord
                </label>
                <div className="relative">
                  <input
                    type={showResetNewPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={e => setResetNewPassword(e.target.value)}
                    placeholder="Minimaal 5 tekens..."
                    className="w-full pl-5 pr-12 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-light hover:text-brand-gray cursor-pointer"
                  >
                    {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-brand-gray-light tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-sage" /> Bevestig wachtwoord
                </label>
                <input
                  type={showResetNewPassword ? 'text' : 'password'}
                  value={resetConfirmPassword}
                  onChange={e => setResetConfirmPassword(e.target.value)}
                  placeholder="Herhaal wachtwoord..."
                  className="w-full px-5 py-3.5 border border-brand-border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach text-sm font-medium"
                  required
                />
              </div>
            </div>

            {resetError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-left">
                ⚠️ {resetError}
              </p>
            )}

            {resetSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setResetError('');
                  setResetSuccess('');
                }}
                className="flex-1 py-4 px-6 bg-brand-bg hover:bg-brand-sage-lighter text-brand-gray-dark text-xs font-bold uppercase tracking-widest rounded-full transition duration-200 text-center cursor-pointer border border-brand-border/60"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="flex-1 py-4 px-6 bg-brand-olive hover:bg-brand-olive-light text-white text-xs font-bold uppercase tracking-widest rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Opslaan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
