
import React, { useState, useEffect } from 'react';
import { Leaf, Wind, Activity, ArrowRight, MapPin } from 'lucide-react';
import { UserStats, AppView } from '../types';

interface DashboardProps {
  stats: UserStats & { name: string };
  onNavigate: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  const [locationName, setLocationName] = useState('Delhi');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we'd use reverse geocoding here.
          // For this prototype, we'll assume "New Delhi" if they are close to the target lat/lng 
          // or just show a more specific "Your Area" or "Delhi NCR".
          const { latitude, longitude } = position.coords;
          // Rough check for Delhi area
          if (latitude > 28 && latitude < 29 && longitude > 76 && longitude < 78) {
            setLocationName('New Delhi');
          } else {
            setLocationName('your city');
          }
        },
        () => {
          setLocationName('Delhi');
        }
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {stats.name}! 👋</h1>
          {/* Level badge removed per request */}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <span>Let's clear the air in </span>
          <span className="font-bold text-emerald-600 flex items-center gap-0.5">
            <MapPin size={12} /> {locationName}
          </span>
          <span> today.</span>
        </div>
      </header>

      {/* Main Points Card */}
      <div className="px-6 mb-8">
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Leaf size={150} />
          </div>
          
          <div className="relative z-10">
            <p className="text-emerald-100 font-medium mb-1">Total EcoPoints</p>
            <h2 className="text-5xl font-bold mb-6">{stats.totalPoints.toLocaleString()}</h2>
            
            <div className="flex gap-4">
              <div className="bg-emerald-700/50 backdrop-blur-sm p-3 rounded-2xl flex-1">
                <div className="flex items-center gap-2 mb-1 text-emerald-200">
                  <Wind size={16} />
                  <span className="text-xs uppercase font-bold tracking-wider">CO₂ Saved</span>
                </div>
                <p className="text-xl font-semibold">{stats.totalCo2Saved.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
              </div>
              <div className="bg-emerald-700/50 backdrop-blur-sm p-3 rounded-2xl flex-1">
                <div className="flex items-center gap-2 mb-1 text-emerald-200">
                  <Activity size={16} />
                  <span className="text-xs uppercase font-bold tracking-wider">Streak</span>
                </div>
                <p className="text-xl font-semibold">{stats.streakDays} <span className="text-sm font-normal">days</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-6 mb-8">
        <button 
          onClick={() => onNavigate(AppView.TRIP)}
          className="w-full bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-4 flex items-center justify-between group transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-[0_10px_20px_-5px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-200 group-hover:rotate-12">
              <Leaf size={24} className="transition-transform duration-500" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800">Start a New Trip</h3>
              <p className="text-xs text-gray-500">Walk, Cycle, Metro or Carpool</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-1 shadow-sm">
            <ArrowRight size={20} />
          </div>
        </button>
      </div>

      {/* Recent Activity (Mock) */}
      <div className="px-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Impact</h3>
        <div className="space-y-4">
          {[
            { mode: 'Metro', dist: '12.4 km', pts: '+120', time: '2h ago', color: 'bg-blue-100 text-blue-600' },
            { mode: 'Walking', dist: '1.2 km', pts: '+50', time: '5h ago', color: 'bg-green-100 text-green-600' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                  <Leaf size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.mode}</p>
                  <p className="text-xs text-gray-500">{item.time} • {item.dist}</p>
                </div>
              </div>
              <span className="font-bold text-emerald-600">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
