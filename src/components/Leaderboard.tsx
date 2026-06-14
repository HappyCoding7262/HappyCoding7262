import React, { useState, useMemo } from 'react';
import { User, Task } from '../types';
import { Heart, Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  tasks?: Task[];
  onSendHeart: (userId: string) => void;
  currentUser: User;
}

type Timeframe = 'all-time' | 'month';

export default function Leaderboard({ users, tasks = [], onSendHeart, currentUser }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');

  const leaderboardData = useMemo(() => {
    return users.map(user => {
      let calculatedPoints = user.points || 0;
      let completedThisMonth = 0;

      if (timeframe === 'month') {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const userCompletedTasksThisMonth = tasks.filter(t => 
          t.status === 'Completed' && 
          t.claimedByUserId === user.id && 
          t.completedAt && 
          new Date(t.completedAt).getMonth() === currentMonth &&
          new Date(t.completedAt).getFullYear() === currentYear
        );

        calculatedPoints = userCompletedTasksThisMonth.length * 15;
        completedThisMonth = userCompletedTasksThisMonth.length;
      }

      return {
        ...user,
        displayPoints: calculatedPoints,
        tasksCompletedPeriod: completedThisMonth
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
          return (
            <div 
              key={user.id} 
              className={`flex items-center justify-between p-4 rounded-[24px] border transition ${
                isMe ? 'border-brand-olive bg-brand-sage-light/50 ring-2 ring-brand-olive ring-offset-2' :
                isTop3 ? 'border-brand-peach bg-brand-peach-light/30' : 'border-brand-border bg-brand-bg'
              }`}
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
                <div>
                  <h3 className="font-semibold text-brand-gray-dark flex items-center gap-2">
                    {user.name} {isMe && <span className="text-[10px] bg-brand-sage-light text-brand-olive px-2 py-0.5 rounded-full">Jij</span>}
                  </h3>
                  <p className="text-xs text-brand-gray-light">
                    {user.displayPoints} {user.displayPoints === 1 ? 'punt' : 'punten'}
                    {timeframe === 'all-time' && ` • ${user.streakCount || 0} Dagen Streak`}
                    {timeframe === 'month' && ` • ${user.tasksCompletedPeriod} ${user.tasksCompletedPeriod === 1 ? 'taak' : 'taken'} voltooid`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs font-medium text-brand-gray-light flex items-center gap-1">
                  <Heart className="w-4 h-4 text-brand-salmon fill-brand-salmon/20" />
                  {user.hearts || 0}
                </div>
                {!isMe && (
                  <button 
                    onClick={() => onSendHeart(user.id)}
                    className="w-10 h-10 rounded-full bg-white hover:bg-brand-peach-light border border-brand-border hover:border-brand-peach text-brand-salmon flex items-center justify-center active:scale-95 transition-all shadow-sm"
                    title="Stuur een hartje!"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
