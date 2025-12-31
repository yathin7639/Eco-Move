import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
    //
}

export const Leaderboard: React.FC<LeaderboardProps> = () => {
  const users: LeaderboardEntry[] = [
    { id: '1', name: 'Aryan Gupta', points: 1540, avatar: 'AG' },
    { id: '2', name: 'Sneha P.', points: 1420, avatar: 'SP' },
    { id: '3', name: 'Rahul Kumar', points: 1250, avatar: 'RK' },
    { id: '4', name: 'Priya Singh', points: 1100, avatar: 'PS' },
    { id: '5', name: 'Amit Verma', points: 950, avatar: 'AV' },
  ];

  return (
    <div className="h-full bg-white p-6 pb-24 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Top Green Travellers</h2>
      
      <div className="flex justify-center gap-4 mb-10 items-end">
         {/* 2nd Place */}
         <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xl mb-2">
                {users[1].avatar}
            </div>
            <div className="bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 mb-1">2nd</div>
            <span className="font-semibold text-sm">{users[1].name}</span>
            <span className="text-xs text-gray-500">{users[1].points} pts</span>
         </div>
         
         {/* 1st Place */}
         <div className="flex flex-col items-center z-10 -mb-4">
            <div className="text-yellow-400 mb-1">👑</div>
            <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-300 flex items-center justify-center font-bold text-yellow-700 text-3xl mb-2 shadow-lg">
                {users[0].avatar}
            </div>
            <div className="bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold text-yellow-600 mb-1">1st</div>
            <span className="font-bold text-lg">{users[0].name}</span>
            <span className="text-sm text-gray-500 font-medium">{users[0].points} pts</span>
         </div>

         {/* 3rd Place */}
         <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-orange-200 flex items-center justify-center font-bold text-orange-700 text-xl mb-2">
                {users[2].avatar}
            </div>
            <div className="bg-orange-50 px-3 py-1 rounded-full text-xs font-bold text-orange-600 mb-1">3rd</div>
            <span className="font-semibold text-sm">{users[2].name}</span>
            <span className="text-xs text-gray-500">{users[2].points} pts</span>
         </div>
      </div>

      <div className="space-y-4">
        {users.slice(3).map((user, idx) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-bold w-6">{idx + 4}</span>
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                        {user.avatar}
                    </div>
                    <span className="font-semibold text-gray-700">{user.name}</span>
                </div>
                <span className="font-bold text-emerald-600">{user.points} pts</span>
            </div>
        ))}
      </div>
    </div>
  );
};