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
import { 
  subscribeToTasks, createTaskDB, updateTaskDB, deleteTaskDB,
  subscribeToUsers, saveUser, deleteUserDB,
  subscribeToLocations, saveLocationDB, deleteLocationDB,
  subscribeToCategories, saveCategoryDB, deleteCategoryDB,
  subscribeToGoal, saveGoalDB
} from './firebase/db';
import { db } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const STORAGE_KEY_LOGGED_IN = 'ark_takenbeheer_logged_in_id';

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
  const [selectedActionNames, setSelectedActionNames] = useState<string[]>([]);

  useEffect(() => {
    if (!actionPrompt) {
      setSelectedActionNames([]);
    }
  }, [actionPrompt]);

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

  // Synchronise met Firestore in real-time voor een naadloze multi-device werking
  useEffect(() => {
    // 1. Subscribe to locations
    const unsubLocs = subscribeToLocations((dbLocs) => {
      if (dbLocs.length === 0) {
        LOCATIONS.forEach(loc => saveLocationDB(loc));
      } else {
        setLocations(dbLocs);
      }
    });

    // 2. Subscribe to categories
    const unsubCats = subscribeToCategories((dbCats) => {
      if (dbCats.length === 0) {
        Object.values(CATEGORIES).forEach(cat => saveCategoryDB(cat));
      } else {
        setCategories(dbCats);
      }
    });

    // 3. Subscribe to users
    const unsubUsers = subscribeToUsers((dbUsers) => {
      if (dbUsers.length === 0) {
        MOCK_USERS.forEach(user => saveUser(user));
      } else {
        setUsers(dbUsers);
      }
    });

    // 4. Subscribe to tasks
    const unsubTasks = subscribeToTasks((dbTasks) => {
      if (dbTasks.length === 0) {
        INITIAL_TASKS.forEach(task => createTaskDB(task));
      } else {
        setTasks(dbTasks);
      }
    });

    // 5. Subscribe to Goal
    const unsubGoal = subscribeToGoal((dbGoal) => {
      setTeamGoal(dbGoal);
    });

    // Initial goal seeding wrapper
    const checkGoal = async () => {
      try {
        const goalDocRef = doc(db, 'goals', 'teamGoal');
        const goalSnap = await getDoc(goalDocRef);
        if (!goalSnap.exists()) {
          await saveGoalDB({ targetTasks: 10, rewardDescription: 'de verrassing van deze week!' });
        }
      } catch (e) {
        console.error("Error setting up initial goal:", e);
      }
    };
    checkGoal();

    return () => {
      unsubLocs();
      unsubCats();
      unsubUsers();
      unsubTasks();
      unsubGoal();
    };
  }, []);

  // Sync active user sessions and updates with state changes
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY_LOGGED_IN);
    if (savedUserId && users.length > 0) {
      const foundUser = users.find((u: User) => u.id === savedUserId);
      if (foundUser) {
        setCurrentUser(foundUser);
      }
    }
  }, [users]);

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
    updateTaskDB(taskId, {
      status: 'Claimed' as const,
      claimedByUserId: currentUser.id,
      claimedByName: personName,
      claimedAt: new Date().toISOString()
    });
  };

  // Release geclaimde taak
  const handleUnclaimTask = (taskId: string) => {
    updateTaskDB(taskId, {
      status: 'Open' as const,
      claimedByUserId: undefined,
      claimedByName: undefined,
      claimedAt: undefined
    });
  };

  // Completing Task with Gamification rewards and Cheer triggers
  const handleCompleteTask = async (taskId: string, personName?: string) => {
    if (!currentUser) return;
    const taskObj = tasks.find(t => t.id === taskId);
    const finalName = personName || taskObj?.claimedByName || currentUser.name;
    const randomCheer = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
    
    // 1. Update task record
    if (taskObj?.googleTaskId && isGoogleSignedIn) {
       getAccessToken().then(token => {
         if (token) completeGoogleTask(token, taskObj.googleTaskId!);
       });
    }

    updateTaskDB(taskId, {
      status: 'Completed' as const,
      completedByUserId: currentUser.id,
      completedByName: finalName,
      completedAt: new Date().toISOString(),
      cheerMessage: randomCheer
    });

    // 2. Add points for the worker to boost Motivation!
    const targetUser = users.find(u => u.uid === currentUser.id || u.id === currentUser.id);
    if (targetUser) {
      const premiumAddition = 15; // +15 Points
      const newPoints = (targetUser.points || 0) + premiumAddition;

      // Streak logic
      const todayStr = new Date().toDateString();
      let newStreak = targetUser.streakCount || 0;
      
      if (targetUser.lastCompletedDate) {
        const lastDateStr = new Date(targetUser.lastCompletedDate).toDateString();
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
        ...targetUser, 
        points: newPoints,
        streakCount: newStreak,
        lastCompletedDate: new Date().toISOString()
      };
      
      saveUser(updatedUserData);
    }
    
    setConfettiTrigger(prev => prev + 1);
  };

  const handleEditTask = (taskId: string, data: Partial<Task>) => {
    updateTaskDB(taskId, data);
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

    createTaskDB(newTask);

    const admins = users.filter(u => u.role === 'Beheerder' || u.role === 'Manager');
    if (admins.length > 0) {
      const adminNames = admins.map(a => a.name).join(', ');
      showToast(`Push bericht / Email verstuurd naar beheerders (${adminNames}): Nieuwe taak "${newTask.title}" is toegevoegd door ${newTask.createdByName}.`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskDB(taskId);
  };

  // User Management
  const handleAddUser = (user: User | Omit<User, 'id'>) => {
    const newUser = 'id' in user 
      ? user 
      : { ...user, id: `user-${Date.now()}`, points: 0, hearts: 0 };
    saveUser(newUser as User);
  };
  const handleUpdateUser = (id: string, data: Partial<User>) => {
    const target = users.find(u => u.id === id);
    if (target) {
      saveUser({ ...target, ...data } as User);
    }
  };
  const handleDeleteUser = (id: string) => {
    deleteUserDB(id);
  };
  const handleSendHeart = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target) {
      saveUser({ ...target, hearts: (target.hearts || 0) + 1 });
      setConfettiTrigger(prev => prev + 1);
    }
  };

  // Category & Location Management
  const handleAddCategory = (cat: CategoryInfo) => saveCategoryDB(cat);
  const handleDeleteCategory = (type: string) => deleteCategoryDB(type);
  const handleAddLocation = (name: string) => {
    const newLoc = { id: `loc-${Date.now()}`, name, groups: ['Boventallig / Algemeen'] };
    saveLocationDB(newLoc);
  };
  const handleDeleteLocation = (id: string) => deleteLocationDB(id);
  const handleUpdateLocation = (id: string, name: string, groups?: string[]) => {
    const target = locations.find(l => l.id === id);
    if (target) {
      saveLocationDB({ ...target, name, groups: groups !== undefined ? groups : target.groups });
    }
  };
  const handleUpdateGoal = (targetTasks: number, rewardDescription: string) => {
    saveGoalDB({ targetTasks, rewardDescription });
  };

  const handleResetLeaderboard = async (): Promise<boolean> => {
    try {
      const promises = users.map(user => 
        saveUser({
          ...user,
          points: 0,
          hearts: 0,
          streakCount: 0,
          lastCompletedDate: undefined
        })
      );
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error("Fout bij het resetten van leaderboard:", e);
      return false;
    }
  };

  // Dev Reset
  const handleResetData = async () => {
    if (window.confirm('Weet u zeker dat u alle gegevens in de cloud-database wilt herstellen naar de begintoestand? 🔄')) {
      try {
        for (const task of tasks) {
          await deleteTaskDB(task.id);
        }
        for (const user of users) {
          await deleteUserDB(user.id);
        }
        for (const loc of locations) {
          await deleteLocationDB(loc.id);
        }
        for (const cat of categories) {
          await deleteCategoryDB(cat.type);
        }
        
        LOCATIONS.forEach(loc => saveLocationDB(loc));
        Object.values(CATEGORIES).forEach(cat => saveCategoryDB(cat));
        MOCK_USERS.forEach(user => saveUser(user));
        INITIAL_TASKS.forEach(task => createTaskDB(task));
        await saveGoalDB({ targetTasks: 10, rewardDescription: 'de verrassing van deze week!' });
        
        alert('Gegevens zijn hersteld naar de begintoestand! 🔄');
      } catch (e) {
        alert('Fout bij herstellen: ' + e);
      }
    }
  };

  if (!currentUser) {
    // If not logged in, show Login flow with credentials & registration
    return (
      <LoginScreen 
        users={users} 
        locations={locations} 
        onLogin={handleUserSwitch} 
        onRegister={handleAddUser} 
      />
    );
  }

  // Shared daily target metrics (morales check)
  const totalCompletedToday = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = Math.min(Math.round((totalCompletedToday / teamGoal.targetTasks) * 100), 100);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-gray-dark font-sans selection:bg-brand-peach-light selection:text-brand-gray-dark pb-16 relative flex flex-col" id="applet-root">
      
      {/* High-fidelity particles success trigger */}
      <Confetti trigger={confettiTrigger} />

      {/* Primary Site Header & Brand element */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40">
        <div className="w-[98%] sm:w-full max-w-5xl mx-auto px-1.5 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
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
      <main className="w-[98%] sm:w-full max-w-5xl mx-auto px-1.5 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
                  onResetLeaderboard={handleResetLeaderboard}
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
          onSave={(bio, avatar, password) => {
            const updates: Partial<User> = { bio, avatar };
            if (password) updates.password = password;
            handleUpdateUser(currentUser.id, updates);
            setIsEditingProfile(false);
          }}
          onClose={() => setIsEditingProfile(false)}
          onLogout={handleLogout}
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
      {actionPrompt && (() => {
        const staffList = currentUser?.staffNames
          ? currentUser.staffNames.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        const formatNamesList = (names: string[]): string => {
          if (names.length === 0) return '';
          if (names.length === 1) return names[0];
          if (names.length === 2) return `${names[0]} & ${names[1]}`;
          return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
        };

        return (
          <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-sm border border-brand-border shadow-xl">
              <h3 className="text-xl font-serif text-brand-gray-dark mb-2">Wie ben jij?</h3>
              <p className="text-sm text-brand-gray mb-6">Selecteer of voer de namen in van de leidsters die deze taak uitvoeren.</p>
              
              {staffList.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-extrabold text-brand-gray-light uppercase tracking-wider mb-2.5">
                    Selecteer wie meehelpt (meerdere mogelijk):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {staffList.map(name => {
                      const isSelected = selectedActionNames.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedActionNames(selectedActionNames.filter(n => n !== name));
                            } else {
                              setSelectedActionNames([...selectedActionNames, name]);
                            }
                          }}
                          className={`px-4 py-3 rounded-[16px] border text-xs font-bold text-center transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected 
                              ? 'bg-brand-sage text-white border-brand-sage shadow-sm'
                              : 'bg-brand-bg text-brand-gray-dark border-brand-border hover:bg-brand-sage-lighter hover:border-brand-sage-light'
                          }`}
                        >
                          {isSelected && <span className="text-xs">✓</span>}
                          {name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-brand-border"></div>
                    <span className="flex-shrink mx-3 text-[9px] text-brand-gray-light font-extrabold uppercase tracking-wider">of voeg extra naam toe</span>
                    <div className="flex-grow border-t border-brand-border"></div>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const typedName = (formData.get('personName') as string || '').trim();
                
                const namesToSend = [...selectedActionNames];
                if (typedName) {
                  namesToSend.push(typedName);
                }

                if (namesToSend.length === 0) return;
                const finalJoinedName = formatNamesList(namesToSend);
                
                if (actionPrompt.type === 'claim') {
                  handleClaimTask(actionPrompt.taskId, finalJoinedName);
                } else if (actionPrompt.type === 'complete') {
                  handleCompleteTask(actionPrompt.taskId, finalJoinedName);
                }
                setActionPrompt(null);
              }}>
                <input
                  name="personName"
                  autoFocus={staffList.length === 0}
                  required={selectedActionNames.length === 0}
                  placeholder={selectedActionNames.length > 0 ? "Extra naam toevoegen (optioneel)..." : "Jouw voornaam..."}
                  className="w-full px-5 py-4 rounded-full border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-peach/50 text-sm font-medium text-brand-gray-dark mb-6"
                />
                
                {selectedActionNames.length > 0 && (
                  <div className="mb-4 text-center">
                    <p className="text-xs text-brand-gray-light">Geselecteerd: <span className="font-bold text-brand-sage">{formatNamesList(selectedActionNames)}</span></p>
                  </div>
                )}

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
        );
      })()}

    </div>
  );
}
