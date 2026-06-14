import React from 'react';
import { User, Role } from '../types';

interface LoginScreenProps {
  users: User[];
  onLogin: (userId: string) => void;
}

export default function LoginScreen({ users, onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 selection:bg-brand-peach/30">
      <div className="max-w-2xl w-full bg-white rounded-[32px] p-8 sm:p-12 shadow-xl border border-brand-border">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif tracking-tight text-brand-gray-dark mb-3">Welkom bij De Ark</h1>
          <p className="text-brand-gray">Kies je profiel om in te loggen</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user.id)}
              className="flex flex-col items-center gap-3 p-6 bg-brand-bg rounded-[24px] border border-brand-border hover:shadow-md hover:border-brand-sage-light hover:bg-brand-sage-lighter transition active:scale-95 cursor-pointer"
            >
              <div className="text-4xl">{user.avatar}</div>
              <div className="text-center">
                <p className="text-sm font-bold text-brand-gray-dark">{user.name}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-brand-gray-light font-bold mt-1">
                  {user.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
