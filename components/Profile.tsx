
import React, { useState } from 'react';
import { UserStats, TripData, TransportMode } from '../types';
import { Award, Zap, Map, Footprints, Bike, Bus, Car, CheckCircle, AlertTriangle, Calendar, Clock, CreditCard, ArrowRightCircle, Coins } from 'lucide-react';

interface ProfileProps {
  stats: UserStats & { name: string };
  tripHistory: TripData[];
}

export const Profile: React.FC<ProfileProps> = ({ stats, tripHistory }) => {
  const [redeemPoints, setRedeemPoints] = useState<string>('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.WALK: return <Footprints size={16} />;
      case TransportMode.CYCLE: return <Bike size={16} />;
      case TransportMode.METRO_BUS: return <Bus size={16} />;
      case TransportMode.CARPOOL: return <Car size={16} />;
    }
  };

  const getModeColor = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.WALK: return 'bg-orange-100 text-orange-600';
      case TransportMode.CYCLE: return 'bg-blue-100 text-blue-600';
      case TransportMode.METRO_BUS: return 'bg-purple-100 text-purple-600';
      case TransportMode.CARPOOL: return 'bg-teal-100 text-teal-600';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleRedeem = () => {
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts <= 0) return alert("Please enter a valid number of points");
    if (pts > stats.totalPoints) return alert("Insufficient points");
    if (pts < 25) return alert("Minimum 25 points required for redemption");

    setRedeemSuccess(true);
    setTimeout(() => setRedeemSuccess(false), 3000);
    setRedeemPoints('');
  };

  const cashValue = redeemPoints ? (parseInt(redeemPoints) / 25 * 15).toFixed(2) : "0.00";

  return (
    <div className="h-full bg-white p-6 pb-24 overflow-y-auto">
      {/* Profile Header - Dynamic from stats.name */}
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-white mb-4 overflow-hidden">
            {getInitials(stats.name)}
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{stats.name}</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Member since 2024</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100">
            <p className="text-2xl font-black text-emerald-700">{stats.totalPoints}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Points</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100">
            <p className="text-2xl font-black text-emerald-700">{stats.totalDistance.toFixed(0)}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase">km</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100">
            <p className="text-2xl font-black text-emerald-700">{stats.streakDays}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Streak</p>
        </div>
      </div>

      {/* Redeem Points Section */}
      <div className="bg-white border-2 border-emerald-500/10 rounded-[2.5rem] p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Coins size={20} />
          </div>
          <div>
            <h3 className="font-black text-xl text-gray-900 tracking-tight">Redeem Points</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Convert points to cash</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 mb-5">
           <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Balance</span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-emerald-600">{stats.totalPoints}</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase">Pts</span>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="relative">
                <input 
                  type="number"
                  placeholder="Enter points"
                  className="w-full p-5 pr-16 bg-white rounded-2xl border-2 border-emerald-100 outline-none focus:border-emerald-500 text-black font-black text-3xl transition-all shadow-sm"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-300">PTS</div>
              </div>
              
              <div className="flex justify-between items-end px-1">
                 <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Conversion Rate</p>
                   <p className="text-xs font-bold text-gray-600">25 Pts = <span className="text-emerald-600 font-black">₹15</span></p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">You Receive</p>
                   <p className="text-3xl font-black text-emerald-700">₹{cashValue}</p>
                 </div>
              </div>
           </div>
        </div>

        {redeemSuccess ? (
          <div className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-300 shadow-xl shadow-emerald-200">
            <CheckCircle size={24} /> REDEMPTION REQUESTED
          </div>
        ) : (
          <button 
            onClick={handleRedeem}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-sm"
          >
            Redeem points <ArrowRightCircle size={20} />
          </button>
        )}
      </div>

      <h3 className="font-black text-lg text-gray-900 mb-4 tracking-tight">Achievements</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-3xl flex items-start gap-3">
             <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Award size={20}/></div>
             <div>
                 <p className="font-bold text-sm text-gray-800">Early Adopter</p>
                 <p className="text-[10px] text-gray-500 font-medium">Joined in beta</p>
             </div>
         </div>
         <div className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-3xl flex items-start gap-3">
             <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Zap size={20}/></div>
             <div>
                 <p className="font-bold text-sm text-gray-800">7 Day Streak</p>
                 <p className="text-[10px] text-gray-500 font-medium">Consistent!</p>
             </div>
         </div>
      </div>

      <h3 className="font-black text-lg text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
        <Calendar size={20} className="text-emerald-500" />
        Trip History
      </h3>
      
      {tripHistory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-sm font-medium">No trips yet. Start your journey!</p>
        </div>
      ) : (
        <div className="space-y-4">
            {tripHistory.map((trip) => (
                <div key={trip.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getModeColor(trip.mode)}`}>
                            {getModeIcon(trip.mode)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 capitalize text-sm">{trip.mode.replace('_', '/').toLowerCase()}</span>
                                {trip.verified ? (
                                    <CheckCircle size={14} className="text-emerald-500" />
                                ) : (
                                    <AlertTriangle size={14} className="text-orange-400" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                <Clock size={10} />
                                <span>{formatDate(trip.startTime)}</span>
                                <span>•</span>
                                <span>{trip.distanceKm.toFixed(1)} km</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-black text-emerald-600 text-lg">+{trip.pointsEarned}</span>
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Points</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
