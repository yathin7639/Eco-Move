
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Camera, CheckCircle, AlertTriangle, Bus, Bike, Footprints, Car, ScanLine, X, Ticket, MapPin, Users, Share2, Copy, QrCode, RefreshCw, Flame, ShieldCheck, ShieldAlert, Gauge, Activity, Navigation, Zap, Wind, UserPlus } from 'lucide-react';
import { TransportMode, TripData } from '../types';
import { verifyPublicTransportImage, getTripTip, analyzeTripData } from '../services/geminiService';

interface TripTrackerProps {
  onTripComplete: (trip: TripData) => void;
}

enum TripState {
  SELECT_MODE,
  START_CAMERA,
  CARPOOL_LOBBY,
  TRACKING,
  PAUSED,
  VERIFY,
  SUMMARY
}

export const TripTracker: React.FC<TripTrackerProps> = ({ onTripComplete }) => {
  const [tripState, setTripState] = useState<TripState>(TripState.SELECT_MODE);
  const [selectedMode, setSelectedMode] = useState<TransportMode>(TransportMode.WALK);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
  
  // Stats State
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [integrityStatus, setIntegrityStatus] = useState<'GOOD' | 'SUSPICIOUS'>('GOOD');
  const [co2Saved, setCo2Saved] = useState(0);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{isValid: boolean, reasoning: string} | null>(null);
  const [aiTip, setAiTip] = useState<string>("");
  
  const [verificationStep, setVerificationStep] = useState<'TICKET' | 'STATION'>('TICKET');
  const [hasVerifiedStart, setHasVerifiedStart] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Carpool State
  const [carpoolCode, setCarpoolCode] = useState<string>('');
  const [carpoolRiders, setCarpoolRiders] = useState<string[]>([]);
  const [showQr, setShowQr] = useState(false);

  const timerRef = useRef<number | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (tripState === TripState.START_CAMERA) {
      setCameraError(false);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play error", e));
          }
        })
        .catch(err => {
          console.error("Camera access denied", err);
          setCameraError(true);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tripState]);

  const initTracking = () => {
    setTripState(TripState.TRACKING);
    setElapsedTime(0);
    setDistance(0);
    setSteps(0);
    setCalories(0);
    setCo2Saved(0);
    setIntegrityStatus('GOOD');
    setPath([]);
    startTracking();
  };

  const regenerateCode = () => {
    setCarpoolCode(Math.random().toString(36).substring(2, 7).toUpperCase());
  };

  const simulateRiderJoin = () => {
    const names = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    if (!carpoolRiders.includes(randomName)) {
        setCarpoolRiders(prev => [...prev, randomName]);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        setIsVerifying(true);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        const result = await verifyPublicTransportImage(base64.split(',')[1], verificationStep);
        
        setIsVerifying(false);
        if (result.isValid) {
            if (verificationStep === 'TICKET') {
                setVerificationResult({ isValid: true, reasoning: "Ticket verified! Now capture the station/bus." });
                setTimeout(() => { 
                    setVerificationStep('STATION'); 
                    setVerificationResult(null); 
                }, 2000);
            } else {
                setVerificationResult({ isValid: true, reasoning: "Station verified! Let's go." });
                setHasVerifiedStart(true);
                setTimeout(() => {
                    initTracking();
                }, 1500);
            }
        } else {
            setVerificationResult(result);
        }
    }
  };

  const handleStartTrip = (mode: TransportMode) => {
    setSelectedMode(mode);
    setHasVerifiedStart(false);
    setVerificationResult(null);
    setVerificationStep('TICKET');

    if (mode === TransportMode.METRO_BUS) {
        setTripState(TripState.START_CAMERA);
    } else if (mode === TransportMode.CARPOOL) {
        regenerateCode();
        setCarpoolRiders(['You (Host)']);
        setTripState(TripState.CARPOOL_LOBBY);
        setShowQr(false);
    } else {
        initTracking();
    }
  };

  const startTracking = () => {
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    if (navigator.geolocation) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          const simulatedSpeed = speed || (selectedMode === TransportMode.CYCLE ? Math.random() * 5 + 15 : (selectedMode === TransportMode.WALK ? Math.random() * 1.5 + 1 : 12)); 
          const speedKmh = simulatedSpeed * 3.6;
          setCurrentSpeed(speedKmh);
          
          if (selectedMode === TransportMode.WALK && speedKmh > 8) setIntegrityStatus('SUSPICIOUS');
          else setIntegrityStatus('GOOD');

          setDistance(prev => {
            const newDist = prev + (simulatedSpeed / 1000);
            setCo2Saved(newDist * 0.2);
            if (selectedMode === TransportMode.WALK) {
                const addedSteps = (simulatedSpeed / 1000) * 1312; 
                setSteps(s => s + addedSteps);
                setCalories(c => c + (addedSteps * 0.04));
            }
            return newDist;
          });
          setPath(prev => [...prev, { lat: latitude, lng: longitude }]);
        },
        () => mockMovement(),
        { enableHighAccuracy: true }
      );
    } else {
      mockMovement();
    }
  };

  const mockMovement = () => {
    window.setInterval(() => {
       const baseSpeed = selectedMode === TransportMode.WALK ? 5 : 22; 
       const speedKmh = baseSpeed + (Math.random() * 4 - 2); 
       setDistance(prev => {
         const newDist = prev + (speedKmh / 3600);
         setCo2Saved(newDist * 0.2);
         if (selectedMode === TransportMode.WALK) {
             const addedSteps = (speedKmh / 3600) * 1312; 
             setSteps(s => s + addedSteps);
             setCalories(c => c + (addedSteps * 0.04));
         }
         return newDist;
       });
       setCurrentSpeed(speedKmh);
       setIntegrityStatus('GOOD');
    }, 1000);
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current);
    finishTrip(true);
  };

  const finishTrip = async (verified: boolean) => {
    let calculatedPoints = 0;
    switch (selectedMode) {
      case TransportMode.WALK: calculatedPoints = Math.floor(steps / 20); break;
      case TransportMode.CYCLE: calculatedPoints = Math.floor(distance * 5); break;
      case TransportMode.METRO_BUS: calculatedPoints = Math.round(distance * 5); break;
      case TransportMode.CARPOOL: calculatedPoints = Math.round(distance * 3 * carpoolRiders.length); break;
    }
    
    const tip = await getTripTip(selectedMode, distance);
    setAiTip(tip);

    onTripComplete({
      id: Date.now().toString(),
      mode: selectedMode,
      startTime: Date.now() - elapsedTime * 1000,
      endTime: Date.now(),
      distanceKm: distance,
      co2SavedKg: distance * 0.2,
      pointsEarned: calculatedPoints,
      verified,
      path,
      steps: Math.floor(steps),
      calories: Math.floor(calories)
    });
    setTripState(TripState.SUMMARY);
  };

  if (tripState === TripState.SELECT_MODE) {
    return (
      <div className="p-6 h-full flex flex-col justify-center bg-white">
        <h2 className="text-2xl font-bold text-center mb-8">How are you travelling?</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { id: TransportMode.WALK, icon: Footprints, label: 'Walk', color: 'bg-orange-100 text-orange-600' },
            { id: TransportMode.CYCLE, icon: Bike, label: 'Cycle', color: 'bg-blue-100 text-blue-600' },
            { id: TransportMode.METRO_BUS, icon: Bus, label: 'Metro/Bus', color: 'bg-purple-100 text-purple-600' },
            { id: TransportMode.CARPOOL, icon: Car, label: 'Carpool', color: 'bg-teal-100 text-teal-600' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleStartTrip(mode.id)}
              className={`group relative p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.05] hover:shadow-xl ${mode.color}`}
            >
              <mode.icon size={40} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="font-semibold">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tripState === TripState.CARPOOL_LOBBY) {
    return (
      <div className="h-full bg-white flex flex-col p-6 pt-12">
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => setTripState(TripState.SELECT_MODE)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
            </button>
            <h2 className="text-xl font-bold">Carpool Lobby</h2>
            <div className="w-10"></div>
        </div>

        <div className="flex-1 flex flex-col">
            <div className="bg-teal-50 rounded-3xl p-8 mb-8 text-center border-2 border-teal-100 shadow-sm relative overflow-hidden">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Share this code with riders</p>
                <div className="flex items-center justify-center gap-4">
                    <h1 className="text-5xl font-black text-teal-800 tracking-tighter">{carpoolCode}</h1>
                    <button onClick={() => { navigator.clipboard.writeText(carpoolCode); alert('Copied!'); }} className="p-2 bg-white rounded-full shadow-sm text-teal-600 hover:scale-110 transition-transform">
                        <Copy size={18} />
                    </button>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={() => setShowQr(!showQr)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-teal-700 shadow-sm">
                        <QrCode size={16} /> {showQr ? 'Hide QR' : 'Show QR'}
                    </button>
                    <button onClick={simulateRiderJoin} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-teal-700 shadow-sm">
                        <UserPlus size={16} /> Add Rider
                    </button>
                </div>
                
                {showQr && (
                    <div className="mt-6 p-4 bg-white inline-block rounded-2xl shadow-inner animate-in zoom-in-95 duration-300">
                        <div className="w-40 h-40 bg-gray-100 flex items-center justify-center border-2 border-teal-100 rounded-lg">
                           <QrCode size={100} className="text-teal-800 opacity-80" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-teal-600" />
                    Riders in Car ({carpoolRiders.length}/4)
                </h3>
                <div className="space-y-3">
                    {carpoolRiders.map((rider, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                    {rider.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-700">{rider}</span>
                            </div>
                            <span className="text-[10px] bg-teal-200 text-teal-800 px-2 py-1 rounded-full font-black uppercase">Ready</span>
                        </div>
                    ))}
                    {carpoolRiders.length < 2 && (
                        <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400">
                            <p className="text-sm">Waiting for riders to join...</p>
                        </div>
                    )}
                </div>
            </div>

            <button 
                onClick={initTracking}
                disabled={carpoolRiders.length < 2}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all uppercase tracking-widest ${
                    carpoolRiders.length >= 2 
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
            >
                {carpoolRiders.length < 2 ? 'Need 1 More Rider' : 'Start Green Journey'}
            </button>
        </div>
      </div>
    );
  }

  if (tripState === TripState.START_CAMERA) {
    return (
      <div className="h-full bg-black flex flex-col relative overflow-hidden">
        <div className="absolute top-12 left-6 right-6 z-20">
          <button onClick={() => setTripState(TripState.SELECT_MODE)} className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white mb-4">
            <X size={24} />
          </button>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm">
                   {verificationStep === 'TICKET' ? '1/2' : '2/2'}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {verificationStep === 'TICKET' ? 'Scan your Ticket' : 'Capture Station/Bus'}
                  </h3>
                  <p className="text-[10px] text-gray-300 uppercase tracking-wider font-medium">
                    {verificationStep === 'TICKET' ? 'Keep the ticket centered' : 'Include unique station features'}
                  </p>
                </div>
             </div>
          </div>
        </div>

        <video ref={videoRef} className="flex-1 object-cover" playsInline />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
           <div className="w-full h-full border-2 border-dashed border-white/50 rounded-3xl flex items-center justify-center relative">
               <div className="absolute inset-x-0 h-[2px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scan_2s_infinite]"></div>
           </div>
        </div>

        <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-6 px-6 z-20">
           {verificationResult && (
             <div className={`w-full p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-bottom-4 ${verificationResult.isValid ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'}`}>
                {verificationResult.isValid ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <p className="text-xs font-bold leading-tight">{verificationResult.reasoning}</p>
             </div>
           )}
           
           <button 
             onClick={handleCapture}
             disabled={isVerifying || hasVerifiedStart}
             className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isVerifying ? 'opacity-50 scale-90' : 'active:scale-90 hover:scale-105 shadow-2xl shadow-emerald-500/30'}`}
           >
             <div className={`w-14 h-14 rounded-full ${isVerifying ? 'bg-gray-400' : 'bg-emerald-500'} flex items-center justify-center transition-colors shadow-inner`}>
                {isVerifying ? <RefreshCw className="animate-spin text-white" /> : <Camera className="text-white" size={28} />}
             </div>
           </button>
           <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">Tap to Verify</p>
        </div>

        <style>{`
          @keyframes scan {
            0% { top: 10%; }
            100% { top: 90%; }
          }
        `}</style>
      </div>
    );
  }

  if (tripState === TripState.TRACKING) {
    const isWalkCycle = selectedMode === TransportMode.WALK || selectedMode === TransportMode.CYCLE;
    const isCarpool = selectedMode === TransportMode.CARPOOL;

    return (
      <div className="relative h-full flex flex-col bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 map-bg"></div>
        <div className="relative z-10 pt-12 px-6">
           <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/10">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Distance</p>
                <h2 className="text-3xl font-mono font-bold">{distance.toFixed(2)} <span className="text-sm font-sans text-gray-400">km</span></h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Time</p>
                <h2 className="text-3xl font-mono font-bold">
                  {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </h2>
              </div>
           </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6">
            <div className={`w-56 h-56 rounded-full border-8 ${
                selectedMode === TransportMode.WALK ? 'border-orange-500/20' : 
                selectedMode === TransportMode.CARPOOL ? 'border-teal-500/20' : 
                'border-emerald-500/20'
            } flex items-center justify-center relative bg-black/40 backdrop-blur-lg mb-8 shadow-2xl`}>
                 <div className="text-center">
                     <div className={`text-6xl font-bold font-mono tracking-tighter ${
                         selectedMode === TransportMode.WALK ? 'text-orange-500' : 
                         selectedMode === TransportMode.CARPOOL ? 'text-teal-400' :
                         'text-emerald-500'
                     }`}>
                         {selectedMode === TransportMode.WALK ? Math.floor(steps).toLocaleString() : currentSpeed.toFixed(0)}
                     </div>
                     <p className="text-[10px] uppercase font-black tracking-[0.2em] mt-2 opacity-50">
                        {selectedMode === TransportMode.WALK ? 'Steps' : 'KM/H'}
                     </p>
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col items-center group transition-all">
                    {isWalkCycle ? (
                        <>
                            <Flame size={20} className="text-orange-500 mb-2" />
                            <span className="text-2xl font-mono font-bold">{Math.floor(calories)}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Kcal</span>
                        </>
                    ) : (
                        <>
                            <Wind size={20} className="text-blue-400 mb-2" />
                            <span className="text-2xl font-mono font-bold">{co2Saved.toFixed(2)}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">CO2 Saved</span>
                        </>
                    )}
                </div>
                <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col items-center group transition-all">
                    <Award size={20} className="text-emerald-500 mb-2" />
                    <span className="text-2xl font-mono font-bold">
                        {selectedMode === TransportMode.WALK ? Math.floor(steps / 20) : Math.floor(distance * 5)}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Live Pts</span>
                </div>
            </div>

            {isCarpool && (
                <div className="mt-6 flex items-center gap-4 bg-teal-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-teal-500/30">
                    <Users size={20} className="text-teal-400" />
                    <div className="flex gap-1">
                        {carpoolRiders.map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">{carpoolRiders.length} Riders Pool</span>
                </div>
            )}

            <div className={`mt-10 flex items-center gap-2 px-6 py-2 rounded-full backdrop-blur-md border ${integrityStatus === 'GOOD' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                {integrityStatus === 'GOOD' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {integrityStatus === 'GOOD' ? 'Natural Movement Detected' : 'Irregular Movement'}
                </span>
            </div>
        </div>
        
        <div className="relative z-10 p-4 pb-12 flex justify-center gap-6">
           <button onClick={stopTracking} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-900/50 hover:scale-105 active:scale-90 transition-all">
             <Square fill="white" size={24} />
           </button>
        </div>
      </div>
    );
  }

  if (tripState === TripState.SUMMARY) {
     return (
       <div className="h-full flex flex-col items-center justify-center p-8 bg-emerald-600 text-white text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 mb-6 shadow-2xl">
              <Trophy size={48} />
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter">SUCCESS!</h2>
          <p className="text-emerald-100 mb-12 uppercase tracking-widest font-bold text-sm">Trip Summary</p>
          <div className="w-full max-w-sm bg-emerald-700/50 rounded-3xl p-8 mb-10 backdrop-blur-md border border-white/10">
              <div className="grid grid-cols-2 gap-8 text-left">
                  <div>
                      <p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Distance</p>
                      <p className="text-2xl font-mono font-bold">{distance.toFixed(2)} km</p>
                  </div>
                  <div>
                      <p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Points</p>
                      <p className="text-2xl font-mono font-bold text-emerald-200">+{Math.floor(distance * 5)}</p>
                  </div>
              </div>
          </div>
          <button onClick={() => setTripState(TripState.SELECT_MODE)} className="w-full max-w-sm py-4 bg-white text-emerald-700 font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
             Back to Home
          </button>
       </div>
     );
  }

  return (
    <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
};

const Trophy = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const Award = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
);
