
import React from 'react';
import { Home, MapPin, Award, User, Users, Target } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.HOME, icon: Home, label: 'Home' },
    { view: AppView.TRIP, icon: MapPin, label: 'Trip' },
    { view: AppView.CHALLENGES, icon: Target, label: 'Tasks' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Community' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 pb-4 flex justify-between items-center z-50 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
