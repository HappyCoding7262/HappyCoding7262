import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Flame, 
  RotateCcw, 
  Sparkles, 
  Sparkle,
  ShieldCheck,
  Eye,
  HelpCircle,
  TrendingUp,
  Heart,
  Mail
} from 'lucide-react';
import { Task, User, CategoryInfo, LocationInfo } from './types';
import { INITIAL_TASKS, MOCK_USERS, CHEER_MESSAGES, CATEGORIES, LOCATIONS } from './data/mockData';
import Confetti from './components/Confetti';
import StaffDashboard from './components/StaffDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import UserProfileModal from './components/UserProfileModal';
import LoginScreen from './components/LoginScreen';
import { LogIn, LogOut } from 'lucide-react';
import { googleSignIn, logout, getAccessToken, initAuth } from './firebase/firebase';
import { syncTaskToGoogle, completeGoogleTask } from './services/googleTasks';

const STORAGE_KEY_TASKS = 'ark_takenbeheer_tasks';
const STORAGE_KEY_USERS = 'ark_takenbeheer_users';
const STORAGE_KEY_LOGGED_IN = 'ark_takenbeheer_logged_in_id';
const STORAGE_KEY_CATEGORIES = 'ark_takenbeheer_categories';
const STORAGE_KEY_LOCATIONS = 'ark_takenbeheer_locations';
const STORAGE_KEY_GOAL = 'ark_takenbeheer_goal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamGoal, setTeamGoal] = useState({ targetTasks: 10, rewardDescription: 'de verrassing van deze week!' });
  
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionPrompt, setActionPrompt] = useState<{ type: 'claim' | 'complete', taskId: string } | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setIsGoogleSignedIn(true);
    }, () => {
      setIsGoogleSignedIn(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize data from localStorage (or defaults)
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
    const savedUserId = localStorage.getItem(STORAGE_KEY_LOGGED_IN);
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const savedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    const savedGoal = localStorage.getItem(STORAGE_KEY_GOAL);

    if (savedGoal) setTeamGoal(JSON.parse(savedGoal));

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    }

    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else {
      setCategories(Object.values(CATEGORIES));
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(Object.values(CATEGORIES)));
    }

    if (savedLocations) setLocations(JSON.parse(savedLocations));
    else {
      setLocations(LOCATIONS);
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(LOCATIONS));
    }

    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      if (savedUserId) {
        const foundUser = parsedUsers.find((u: User) => u.id === savedUserId);
        if (foundUser) setCurrentUser(foundUser);
      }
    } else {
      setUsers(MOCK_USERS);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(MOCK_USERS));
    }
  }, []);

  const saveTasksToStorage = (data: Task[]) => {
    setTasks(data);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(data));
  };

  const saveUsersToStorage = (data: User[]) => {
    setUsers(data);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data));
  };

  const saveCategoriesToStorage = (data: CategoryInfo[]) => {
    setCategories(data);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(data));
  };

  const saveLocationsToStorage = (data: LocationInfo[]) => {
    setLocations(data);
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(data));
  };

  // Change current user
  const handleUserSwitch = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem(STORAGE_KEY_LOGGED_IN, userId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
  };

  // Gamification: Claim Task
  const handleClaimTask = (taskId: string, personName: string) => {
    if (!currentUser) return;
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'Claimed' as const,
          claimedByUserId: currentUser.id,
          claimedByName: personName,
          claimedAt: new Date().toISOString()
        };
      }
      return task;
    });
    saveTasksToStorage(updatedTasks);
  };

  // Release geclaimde taak
  const handleUnclaimTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'Open' as const,
          claimedByUserId: undefined,
          claimedByName: undefined,
          claimedAt: undefined
        };
      }
      return task;
    });
    saveTasksToStorage(updatedTasks);
  };

  // Completing Task with Gamification rewards and Cheer triggers
  const handleCompleteTask = async (taskId: string, personName?: string) => {
    if (!currentUser) return;
    const taskObj = tasks.find(t => t.id === taskId);
    const finalName = personName || taskObj?.claimedByName || currentUser.name;
    const randomCheer = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
    
    // 1. Update task record
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        if (task.googleTaskId && isGoogleSignedIn) {
           getAccessToken().then(token => {
             if (token) completeGoogleTask(token, task.googleTaskId!);
           });
        }
        return {
          ...task,
          status: 'Completed' as const,
          completedByUserId: currentUser.id,
          completedByName: finalName,
          completedAt: new Date().toISOString(),
          cheerMessage: randomCheer
        };
      }
      return task;
    });
    saveTasksToStorage(updatedTasks);

    // 2. Add points for the worker to boost Motivation!
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id && user.role === 'Leidster') {
        const premiumAddition = 15; // +15 Points
        const newPoints = (user.points || 0) + premiumAddition;

        // Streak logic
        const todayStr = new Date().toDateString();
        let newStreak = user.streakCount || 0;
        
        if (user.lastCompletedDate) {
          const lastDateStr = new Date(user.lastCompletedDate).toDateString();
          if (lastDateStr !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDateStr === yesterday.toDateString()) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }
        } else {
          newStreak = 1;
        }

        const updatedUserData = { 
          ...user, 
          points: newPoints,
          streakCount: newStreak,
          lastCompletedDate: new Date().toISOString()
        };
        
        if (currentUser.id === user.id) setCurrentUser(updatedUserData);
        return updatedUserData;
      }
      return user;
    });
    saveUsersToStorage(updatedUsers);
    setConfettiTrigger(prev => prev + 1);
  };

  const handleEditTask = (taskId: string, data: Partial<Task>) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...data } : t);
    saveTasksToStorage(updatedTasks);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdByUserId' | 'createdByName' | 'createdAt'>, creatorName: string) => {
    if (!currentUser) return;
    let newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdByUserId: currentUser.id,
      createdByName: creatorName,
      createdAt: new Date().toISOString()
    };

    if (isGoogleSignedIn) {
      const token = await getAccessToken();
      if (token) {
        const googleId = await syncTaskToGoogle(token, newTask);
        if (googleId) newTask.googleTaskId = googleId;
      }
    }

    setTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
      return updated;
    });

    const admins = users.filter(u => u.role === 'Beheerder' || u.role === 'Manager');
    if (admins.length > 0) {
      const adminNames = admins.map(a => a.name).join(', ');
      showToast(`Push bericht / Email verstuurd naar beheerders (${adminNames}): Nieuwe taak "${newTask.title}" is toegevoegd door ${newTask.createdByName}.`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    saveTasksToStorage(tasks.filter(t => t.id !== taskId));
  };

  // User Management
  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}`, points: 0, hearts: 0 };
    saveUsersToStorage([...users, newUser as User]);
  };
  const handleUpdateUser = (id: string, data: Partial<User>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...data } : u);
    saveUsersToStorage(updated);
    if (currentUser?.id === id) setCurrentUser({ ...currentUser, ...data } as User);
  };
  const handleDeleteUser = (id: string) => {
    saveUsersToStorage(users.filter(u => u.id !== id));
  };
  const handleSendHeart = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, hearts: (u.hearts || 0) + 1 } : u);
    saveUsersToStorage(updated);
    setConfettiTrigger(prev => prev + 1);
  };

  // Category & Location Management
  const handleAddCategory = (cat: CategoryInfo) => saveCategoriesToStorage([...categories, cat]);
  const handleDeleteCategory = (type: string) => saveCategoriesToStorage(categories.filter(c => c.type !== type));
  const handleAddLocation = (name: string) => {
    const newLoc = { id: `loc-${Date.now()}`, name, groups: ['Boventallig / Algemeen'] };
    saveLocationsToStorage([...locations, newLoc]);
  };
  const handleDeleteLocation = (id: string) => {
    saveLocationsToStorage(locations.filter(l => l.id !== id));
  };
  const handleUpdateLocation = (id: string, name: string, groups?: string[]) => {
    saveLocationsToStorage(locations.map(l => l.id === id ? { ...l, name, groups: groups || l.groups } : l));
  };
  const handleUpdateGoal = (targetTasks: number, rewardDescription: string) => {
    const newGoal = { targetTasks, rewardDescription };
    setTeamGoal(newGoal);
    localStorage.setItem(STORAGE_KEY_GOAL, JSON.stringify(newGoal));
  };

  // Dev Reset
  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_LOCATIONS);
    setTasks(INITIAL_TASKS);
    setUsers(MOCK_USERS);
    setCurrentUser(MOCK_USERS[0]);
    setCategories(Object.values(CATEGORIES));
    setLocations(LOCATIONS);
    alert('Gegevens zijn hersteld naar de begintoestand! 🔄');
  };

  if (!currentUser) {
    // If not logged in, show Login flow
    return <LoginScreen users={users} onLogin={handleUserSwitch} />;
  }

  // Shared daily target metrics (morales check)
  const totalCompletedToday = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = Math.min(Math.round((totalCompletedToday / teamGoal.targetTasks) * 100), 100);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-gray-dark font-sans selection:bg-brand-peach-light selection:text-brand-gray-dark pb-16 relative flex flex-col" id="applet-root">
      
      {/* High-fidelity particles success trigger */}
      <Confetti trigger={confettiTrigger} />

      {/* Top Banner Warning & Sandbox Controller */}
      <div className="bg-slate-900 text-slate-100 py-3 px-4 shadow-sm border-b border-slate-800 relative z-50">
        <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="font-bold text-slate-200">
              ⚡ Sandbox Preview &middot; <span className="text-amber-400">Actieve sessie als {currentUser.name} ({currentUser.role})</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
               onClick={handleLogout}
               className="p-1 px-2.5 rounded-xl border border-slate-750 bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-750 transition flex items-center gap-1 cursor-pointer"
            >
              Uitloggen
            </button>
            <button
              id="reset-state-button"
              onClick={handleResetData}
              title="Herstel alle taken naar begintoestand"
              className="p-1 px-2.5 rounded-xl border border-slate-750 bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-750 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              id="google-auth-button"
              onClick={async () => {
                if (isGoogleSignedIn) await logout();
                else await googleSignIn();
              }}
              className={`p-1 px-2.5 rounded-xl border border-slate-750 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                isGoogleSignedIn ? 'bg-orange-900 border-orange-800 text-orange-200 hover:bg-orange-800' : 'bg-slate-800 text-amber-300 hover:bg-slate-750 hover:text-amber-200'
              }`}
            >
              {isGoogleSignedIn ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
              {isGoogleSignedIn ? 'Uitloggen (Google)' : 'Login voor Google Tasks'}
            </button>
          </div>

        </div>
      </div>

      {/* Primary Site Header & Brand element */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo brand and subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-peach flex items-center justify-center active:rotate-12 transition duration-200">
              <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-xs">⛵</div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-brand-gray leading-none">De Ark <span className="font-light text-brand-gray-light">| Takenbeheer</span></h1>
            </div>
          </div>

          {/* Gamified personal points badges for the worker */}
          {currentUser.role === 'Leidster' && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-4 cursor-pointer hover:bg-brand-bg px-2 py-1 rounded-xl transition" 
              id="user-points-badge"
              title="Bewerk profiel"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-brand-gray-dark">{currentUser.name}</p>
                <p className="text-xs text-brand-sage">{currentUser.groupId}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-sage-light border-2 border-white shadow-sm flex items-center justify-center text-brand-olive font-bold relative">
                {currentUser.points}
                {currentUser.hearts! > 0 && (
                   <span className="absolute -top-1 -right-1 bg-brand-peach text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                     {currentUser.hearts}
                   </span>
                )}
              </div>
            </button>
          )}

          {(currentUser.role === 'Manager' || currentUser.role === 'Beheerder') && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-4 cursor-pointer hover:bg-brand-bg px-2 py-1 rounded-xl transition" 
              id="manager-badge"
              title="Bewerk profiel"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-brand-gray-dark">{currentUser.name}</p>
                <p className="text-xs text-brand-sage">Beveiligde Toegang</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-olive border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Interactive Shared Team Goal Progress Banner */}
        <section className="bg-brand-olive text-white rounded-[32px] p-6 shadow-sm relative overflow-hidden" id="shared-progress-section">
          <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-xs uppercase tracking-widest opacity-60 font-bold mb-2">Team Doel</h3>
              <p className="text-2xl font-serif italic">
                Samen staan we sterk!
              </p>
            </div>

            {/* Completion metrics indicator circular block */}
            <div className="flex-1 max-w-md w-full space-y-2">
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold">{totalCompletedToday}</span>
                <span className="text-sm opacity-60">/ {teamGoal.targetTasks} taken</span>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-brand-peach rounded-full"
                />
              </div>

              {/* Motivational cheering messaging */}
              <p className="mt-4 text-xs opacity-80 leading-relaxed">
                {progressPercent >= 100 
                  ? `Geweldig! Dagdoel bereikt! Tijd voor: ${teamGoal.rewardDescription}! ⛵❤️`
                  : progressPercent >= 70
                  ? `Bijna bereikt! Nog even de schouders eronder voor ${teamGoal.rewardDescription}! 💪`
                  : `Nog ${teamGoal.targetTasks - totalCompletedToday} taken te gaan voor ${teamGoal.rewardDescription}!`}
              </p>
            </div>
          </div>
        </section>

        {/* Central Dashboard Frame */}
        <section className="relative" id="dashboard-shell">
          <AnimatePresence mode="wait">
            {currentUser.role === 'Manager' || currentUser.role === 'Beheerder' ? (
              <motion.div
                key="manager"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ManagerDashboard
                  tasks={tasks}
                  users={users}
                  categories={categories}
                  locations={locations}
                  currentUser={currentUser}
                  onClaim={(taskId) => setActionPrompt({ type: 'claim', taskId })}
                  onUnclaim={handleUnclaimTask}
                  onComplete={(taskId) => handleCompleteTask(taskId)}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleCreateTask}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onSendHeart={handleSendHeart}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddLocation={handleAddLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onDeleteLocation={handleDeleteLocation}
                  teamGoal={teamGoal}
                  onUpdateGoal={handleUpdateGoal}
                />
              </motion.div>
            ) : (
              <motion.div
                key="staff"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StaffDashboard
                  tasks={tasks}
                  users={users}
                  categories={categories}
                  locations={locations}
                  currentUser={currentUser}
                  onClaim={(taskId) => setActionPrompt({ type: 'claim', taskId })}
                  onUnclaim={handleUnclaimTask}
                  onComplete={(taskId) => handleCompleteTask(taskId)}
                  onAddTask={handleCreateTask}
                  onEditTask={handleEditTask}
                  onSendHeart={handleSendHeart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Decorative Brand Footer */}
      <footer className="h-12 px-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-brand-sage font-bold border-t border-brand-border mt-auto">
        <div>Kindercentrum de Ark &copy; {new Date().getFullYear()}</div>
        <div className="flex gap-8">
          <span>Privacy</span>
          <span>Helpdesk</span>
        </div>
      </footer>

      {isEditingProfile && (
        <UserProfileModal 
          user={currentUser}
          onSave={(bio, avatar) => {
            handleUpdateUser(currentUser.id, { bio, avatar });
            setIsEditingProfile(false);
          }}
          onClose={() => setIsEditingProfile(false)}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-lg border border-brand-border"
          >
            <div className="w-8 h-8 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach">
              <Mail className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-brand-gray-dark">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Name Prompt Modal */}
      {actionPrompt && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm border border-brand-border shadow-xl">
            <h3 className="text-xl font-serif text-brand-gray-dark mb-2">Wie ben jij?</h3>
            <p className="text-sm text-brand-gray mb-6">Voer je naam in om deze actie uit te voeren als de groep.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('personName') as string;
              if (!name.trim()) return;
              
              if (actionPrompt.type === 'claim') {
                handleClaimTask(actionPrompt.taskId, name.trim());
              } else if (actionPrompt.type === 'complete') {
                handleCompleteTask(actionPrompt.taskId, name.trim());
              }
              setActionPrompt(null);
            }}>
              <input
                name="personName"
                autoFocus
                required
                placeholder="Jouw voornaam..."
                className="w-full px-5 py-4 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark mb-6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionPrompt(null)}
                  className="flex-1 py-4 text-brand-gray-dark font-bold text-sm hover:bg-brand-bg rounded-full transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-brand-sage text-white font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  Doorgaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
