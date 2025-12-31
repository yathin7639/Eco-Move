
import React, { useState, useEffect } from 'react';
import { AppView, UserStats, TripData, Challenge, ChallengeType } from './types';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { TripTracker } from './components/TripTracker';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Community } from './components/Community';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Challenges } from './components/Challenges';

type AuthState = 'UNAUTHENTICATED' | 'USER' | 'ADMIN';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('UNAUTHENTICATED');
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  const [userStats, setUserStats] = useState<UserStats & { name: string }>(() => {
    const saved = localStorage.getItem('ecoMove_stats');
    return saved ? JSON.parse(saved) : {
      name: 'Aryan Gupta',
      totalPoints: 1250,
      totalDistance: 45.2,
      totalCo2Saved: 8.4,
      streakDays: 5,
      level: 3
    };
  });

  const [tripHistory, setTripHistory] = useState<TripData[]>(() => {
    const saved = localStorage.getItem('ecoMove_trips');
    return saved ? JSON.parse(saved) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('ecoMove_challenges');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Morning Walker', description: 'Walk 5km before 10 AM', rewardAmount: 50, type: ChallengeType.WALK, isActive: true },
      { id: '2', title: 'Metro Master', description: 'Take 10 Metro trips this week', rewardAmount: 100, type: ChallengeType.METRO, isActive: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ecoMove_challenges', JSON.stringify(challenges));
  }, [challenges]);

  const handleTripComplete = (trip: TripData) => {
    const today = new Date().setHours(0,0,0,0);
    const lastTrip = userStats.lastTripDate ? new Date(userStats.lastTripDate).setHours(0,0,0,0) : 0;
    let newStreak = userStats.streakDays;
    
    if (lastTrip === 0 || today - lastTrip === 86400000) newStreak += 1;
    else if (today !== lastTrip) newStreak = 1;

    const newStats = {
      ...userStats,
      totalPoints: userStats.totalPoints + trip.pointsEarned,
      totalDistance: userStats.totalDistance + trip.distanceKm,
      totalCo2Saved: userStats.totalCo2Saved + trip.co2SavedKg,
      streakDays: newStreak,
      lastTripDate: Date.now()
    };
    
    setUserStats(newStats);
    setTripHistory([trip, ...tripHistory]);
    localStorage.setItem('ecoMove_stats', JSON.stringify(newStats));
    localStorage.setItem('ecoMove_trips', JSON.stringify([trip, ...tripHistory]));
  };

  const handleLoginSuccess = (type: 'USER' | 'ADMIN', userData?: { name: string }) => {
    if (type === 'USER' && userData) {
        setUserStats(prev => ({ ...prev, name: userData.name }));
    }
    setAuthState(type);
  };

  const handleLogout = () => { setAuthState('UNAUTHENTICATED'); setCurrentView(AppView.HOME); };

  if (authState === 'UNAUTHENTICATED') return <Login onLoginSuccess={handleLoginSuccess} />;
  if (authState === 'ADMIN') return <AdminPanel challenges={challenges} setChallenges={setChallenges} onLogout={handleLogout} />;

  const renderUserView = () => {
    switch (currentView) {
      case AppView.HOME: return <Dashboard stats={userStats} onNavigate={setCurrentView} />;
      case AppView.TRIP: return <TripTracker onTripComplete={handleTripComplete} />;
      case AppView.CHALLENGES: return <Challenges challenges={challenges} />;
      case AppView.COMMUNITY: return <Community userStats={userStats} />;
      case AppView.LEADERBOARD: return <Leaderboard />;
      case AppView.PROFILE: return <Profile stats={userStats} tripHistory={tripHistory} />;
      default: return <Dashboard stats={userStats} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative">
      <main className="flex-1 overflow-hidden relative">{renderUserView()}</main>
      <BottomNav currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
}
