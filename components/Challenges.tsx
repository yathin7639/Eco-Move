
import React, { useState } from 'react';
import { Challenge, ChallengeType } from '../types';
import { Trophy, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface ChallengesProps {
  challenges: Challenge[];
}

export const Challenges: React.FC<ChallengesProps> = ({ challenges }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Simulated progress for demonstration
  const [mockProgress] = useState<Record<string, number>>({
    '1': 75,
    '2': 30
  });

  const activeChallenges = challenges.filter(c => c.isActive);
  const completedChallenges = challenges.filter(c => !c.isActive);

  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.WALK: return '👣';
      case ChallengeType.CYCLE: return '🚴';
      case ChallengeType.METRO: return '🚇';
      case ChallengeType.CARPOOL: return '🚗';
      case ChallengeType.STREAK: return '🔥';
      default: return '🏆';
    }
  };

  const getChallengeColor = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.WALK: return 'border-orange-200 text-orange-600 bg-orange-50';
      case ChallengeType.CYCLE: return 'border-blue-200 text-blue-600 bg-blue-50';
      case ChallengeType.METRO: return 'border-purple-200 text-purple-600 bg-purple-50';
      default: return 'border-emerald-200 text-emerald-600 bg-emerald-50';
    }
  };

  const renderList = activeTab === 'ACTIVE' ? activeChallenges : completedChallenges;

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-24">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
          <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
            <Trophy size={20} />
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Target size={32} />
            </div>
            <p className="text-gray-500 font-medium">No {activeTab.toLowerCase()} challenges</p>
          </div>
        ) : (
          renderList.map((challenge) => {
            const progress = activeTab === 'COMPLETED' ? 100 : (mockProgress[challenge.id] || 0);
            return (
              <div key={challenge.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${getChallengeColor(challenge.type)}`}>
                      {getChallengeIcon(challenge.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{challenge.title}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{challenge.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 font-bold text-lg">+{challenge.rewardAmount}</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Pts</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${activeTab === 'COMPLETED' ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>

                {activeTab === 'COMPLETED' ? (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-emerald-600 text-xs font-bold">
                    <CheckCircle size={14} /> Completed & Points Claimed
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1 uppercase">
                      <TrendingUp size={12} /> Live tracking
                    </span>
                    <button className="text-xs font-bold text-emerald-600 hover:underline">View Progress</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
