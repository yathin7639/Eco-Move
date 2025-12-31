
import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Phone, Lock, ChevronLeft, LayoutDashboard, Bike, AlertTriangle, Mail, UserCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (type: 'USER' | 'ADMIN', userData?: { name: string }) => void;
}

type Screen = 'LANDING' | 'USER_FLOW' | 'ADMIN_LOGIN';
type UserMode = 'SIGN_IN' | 'SIGN_UP';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [screen, setScreen] = useState<Screen>('LANDING');
  const [userMode, setUserMode] = useState<UserMode>('SIGN_IN');
  
  // User Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (userMode === 'SIGN_UP' && !name) return alert("Please enter your name");
      if (phone.length < 10) return alert("Please enter a valid phone number");
      setOtpSent(true);
    } else {
      if (otp.length < 4) return alert("Please enter valid OTP");
      // Pass the name to App.tsx
      onLoginSuccess('USER', { name: name || 'Eco Traveler' });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (adminEmail === 'admin_ecomove@system.app' && adminPass === 'ECOmove@Admin#2025') {
      onLoginSuccess('ADMIN');
    } else {
      setAdminError('Invalid Admin Credentials');
    }
  };

  if (screen === 'LANDING') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50 to-white">
        <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-lg transform rotate-3">
                <Bike size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EcoMove</h1>
            <p className="text-gray-500">Choose your login type to continue</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <button onClick={() => setScreen('USER_FLOW')} className="w-full bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-emerald-500 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><User size={24} /></div>
               <div className="text-left">
                   <h3 className="font-bold text-gray-800 text-lg">I am a User</h3>
                   <p className="text-xs text-gray-500">Track trips, earn points</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300" />
          </button>
          <button onClick={() => setScreen('ADMIN_LOGIN')} className="w-full bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-gray-800 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
               <div className="text-left">
                   <h3 className="font-bold text-gray-800 text-lg">I am an Admin</h3>
                   <p className="text-xs text-gray-500">Manage challenges & system</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300" />
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'USER_FLOW') {
      return (
          <div className="h-screen flex flex-col p-6 bg-white overflow-y-auto">
              <button onClick={() => { setScreen('LANDING'); setOtpSent(false); }} className="self-start p-2 hover:bg-gray-100 rounded-full mb-4"><ChevronLeft size={24} /></button>
              
              <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                  <button 
                    onClick={() => { setUserMode('SIGN_IN'); setOtpSent(false); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${userMode === 'SIGN_IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setUserMode('SIGN_UP'); setOtpSent(false); }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${userMode === 'SIGN_UP' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    Sign Up
                  </button>
              </div>

              <div className="mb-8">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">{userMode === 'SIGN_IN' ? 'Welcome Back!' : 'Create Account'}</h2>
                  <p className="text-gray-500 text-sm">{userMode === 'SIGN_IN' ? 'Sign in to continue your eco-journey.' : 'Join the community and start saving the planet.'}</p>
              </div>

              <form onSubmit={handleUserLogin} className="space-y-4">
                  {!otpSent && userMode === 'SIGN_UP' && (
                    <div className="animate-in slide-in-from-left duration-300">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Aryan Gupta"
                                className="w-full pl-12 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-black font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                  )}

                  {!otpSent && (
                    <div className="animate-in slide-in-from-left duration-300 delay-75">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="tel" 
                                placeholder="+91 98765 43210"
                                className="w-full pl-12 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-black font-medium"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                  )}

                  {!otpSent && userMode === 'SIGN_UP' && (
                    <div className="animate-in slide-in-from-left duration-300 delay-150">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="email" 
                                placeholder="aryan@example.com"
                                className="w-full pl-12 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-black font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                  )}

                  {otpSent && (
                      <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Enter 4-digit OTP</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="1234"
                                maxLength={4}
                                className="w-full pl-12 p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-black font-medium tracking-widest text-xl"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">OTP sent to {phone}</p>
                      </div>
                  )}

                  <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all mt-4">
                      {otpSent ? 'Verify & Login' : 'Send OTP'}
                  </button>
              </form>
          </div>
      );
  }

  if (screen === 'ADMIN_LOGIN') {
    return (
        <div className="h-screen flex flex-col p-6 bg-gray-900 text-white">
            <button onClick={() => setScreen('LANDING')} className="self-start p-2 hover:bg-white/10 rounded-full mb-8 text-white"><ChevronLeft size={24} /></button>
            <div className="mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4"><LayoutDashboard size={24} className="text-white" /></div>
                <h2 className="text-2xl font-bold mb-2">Admin Portal</h2>
                <p className="text-gray-400">Secure login for administrators.</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
                <input type="email" placeholder="admin@system.app" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 outline-none text-white" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                <input type="password" placeholder="Password" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 outline-none text-white" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
                <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold hover:bg-emerald-500 transition-all">Login to Dashboard</button>
            </form>
        </div>
    );
  }
  return null;
};
