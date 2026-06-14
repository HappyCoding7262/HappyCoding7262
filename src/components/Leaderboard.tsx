import React, { useState, useMemo } from 'react';
import { User, Task } from '../types';
import { Heart, Trophy, Medal, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  users: User[];
  tasks?: Task[];
  onSendHeart: (userId: string) => void;
  currentUser: User;
}

type Timeframe = 'all-time' | 'month';

export default function Leaderboard({ users, tasks = [], onSendHeart, currentUser }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const leaderboardData = useMemo(() => {
    return users.map(user => {
      let calculatedPoints = user.points || 0;
      
      const userTotalCompletedTasks = tasks.filter(t => 
        t.status === 'Completed' && 
        (t.completedByUserId === user.id || t.claimedByUserId === user.id)
      ).length;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const userCompletedTasksThisMonth = tasks.filter(t => 
        t.status === 'Completed' && 
        (t.completedByUserId === user.id || t.claimedByUserId === user.id) && 
        t.completedAt && 
        new Date(t.completedAt).getMonth() === currentMonth &&
        new Date(t.completedAt).getFullYear() === currentYear
      );

      if (timeframe === 'month') {
        calculatedPoints = userCompletedTasksThisMonth.length * 15;
      }

      return {
        ...user,
        displayPoints: calculatedPoints,
        tasksCompletedPeriod: userCompletedTasksThisMonth.length,
        tasksCompletedAllTime: userTotalCompletedTasks
      };
    }).sort((a, b) => b.displayPoints - a.displayPoints);
  }, [users, tasks, timeframe]);

  return (
    <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-3 items-center">
          <Trophy className="w-6 h-6 text-brand-salmon" />
          <h2 className="text-xl font-serif text-brand-gray-dark">Leaderboard</h2>
        </div>
        
        <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border">
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${timeframe === 'month' ? 'bg-white text-brand-gray-dark shadow-sm' : 'text-brand-gray hover:text-brand-gray-dark'}`}
          >
            Deze Maand
          </button>
          <button 
            onClick={() => setTimeframe('all-time')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${timeframe === 'all-time' ? 'bg-white text-brand-gray-dark shadow-sm' : 'text-brand-gray hover:text-brand-gray-dark'}`}
          >
            All-time
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {leaderboardData.map((user, idx) => {
          const isTop3 = idx < 3 && user.displayPoints > 0;
          const isMe = user.id === currentUser.id;
          const isExpanded = expandedUserId === user.id;

          const userTasks = tasks.filter(t => 
            t.status === 'Completed' && 
            (t.completedByUserId === user.id || t.claimedByUserId === user.id)
          );

          const periodTasks = userTasks.filter(t => {
            if (timeframe === 'all-time') return true;
            if (!t.completedAt) return false;
            const now = new Date();
            const taskDate = new Date(t.completedAt);
            return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
          });

          const sortedTasks = [...periodTasks].sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA;
          });

          return (
            <div 
              key={user.id} 
              className={`rounded-[24px] border transition-all duration-300 overflow-hidden flex flex-col ${
                isMe ? 'border-brand-olive bg-brand-sage-light/50 ring-2 ring-brand-olive ring-offset-2' :
                isTop3 ? 'border-brand-peach bg-brand-peach-light/30' : 'border-brand-border bg-brand-bg'
              }`}
            >
              {/* Main row clickable area */}
              <div 
                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/[0.01] active:opacity-90 select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedUserId(isExpanded ? null : user.id);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg text-brand-gray-light w-6 text-center">
                    #{idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xl bg-brand-bg relative">
                    {user.avatar}
                    {isTop3 && (
                      <div className="absolute -top-2 -right-2">
                         {idx === 0 && <span className="text-lg">👑</span>}
                         {idx === 1 && <Medal className="w-4 h-4 text-brand-sage fill-brand-sage" />}
                         {idx === 2 && <Star className="w-4 h-4 text-brand-salmon fill-brand-salmon" />}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-brand-gray-dark flex items-center gap-2">
                      {user.name} {isMe && <span className="text-[10px] bg-brand-sage-light text-brand-olive px-2 py-0.5 rounded-full font-bold">Jij</span>}
                    </h3>
                    <p className="text-xs text-brand-gray-light">
                      {user.displayPoints} {user.displayPoints === 1 ? 'punt' : 'punten'}
                      {timeframe === 'all-time' && ` • ${user.tasksCompletedAllTime} ${user.tasksCompletedAllTime === 1 ? 'taak' : 'taken'} • ${user.streakCount || 0} Dagen Streak`}
                      {timeframe === 'month' && ` • ${user.tasksCompletedPeriod} ${user.tasksCompletedPeriod === 1 ? 'taak' : 'taken'} voltooid`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-brand-gray-light flex items-center gap-1">
                    <Heart className="w-4 h-4 text-brand-salmon fill-brand-salmon/20" />
                    {user.hearts || 0}
                  </div>
                  {!isMe && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card expand
                        onSendHeart(user.id);
                      }}
                      className="w-10 h-10 rounded-full bg-white hover:bg-brand-peach-light border border-brand-border hover:border-brand-peach text-brand-salmon flex items-center justify-center active:scale-95 transition-all shadow-sm z-10"
                      title="Stuur een hartje!"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  )}
                  <ChevronDown className={`w-5 h-5 text-brand-gray-light transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-gray-dark' : ''}`} />
                </div>
              </div>

              {/* Collapsible List of Completed Tasks */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-brand-border bg-white"
                  >
                    <div className="p-4 space-y-3">
                      <p className="text-[10px] font-extrabold text-brand-gray-light uppercase tracking-wider mb-2">
                        {timeframe === 'month' ? 'Gedane taken deze maand' : 'Alle gedane taken'} ({sortedTasks.length})
                      </p>
                      
                      {sortedTasks.length === 0 ? (
                        <p className="text-xs text-brand-gray italic bg-brand-bg rounded-[16px] p-4 text-center border border-dashed border-brand-border">
                          Nog geen taken voltooid in deze periode.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {sortedTasks.map(task => {
                            const completedDateStr = task.completedAt 
                              ? new Date(task.completedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : '';
                            return (
                              <div 
                                key={task.id} 
                                className="flex items-center justify-between p-3.5 bg-brand-bg/50 border border-brand-border rounded-[16px] gap-2 hover:border-brand-sage/40 transition duration-150 text-left"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-full bg-brand-sage-light/30 text-brand-sage flex items-center justify-center text-xs font-bold shrink-0">
                                    ✓
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-brand-gray-dark truncate" title={task.title}>
                                      {task.title}
                                    </p>
                                    <p className="text-[10px] text-brand-gray-light">
                                      {completedDateStr}
                                      {task.completedByName && task.completedByName !== user.name && (
                                        <span className="text-brand-sage font-bold italic"> • {task.completedByName}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-extrabold text-brand-sage bg-brand-sage-light/20 px-2.5 py-1 rounded-full shrink-0">
                                  +15 pnt
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
