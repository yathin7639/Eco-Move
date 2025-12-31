import React, { useState } from 'react';
import { Challenge, ChallengeType } from '../types';
import { LogOut, Plus, Trash2, Edit2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

interface AdminPanelProps {
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ challenges, setChallenges, onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState<number>(50);
  const [type, setType] = useState<ChallengeType>(ChallengeType.WALK);
  const [isActive, setIsActive] = useState(true);

  // Filter State
  const [filterType, setFilterType] = useState<string>('ALL');

  const handleEdit = (c: Challenge) => {
    setEditingId(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setReward(c.rewardAmount);
    setType(c.type);
    setIsActive(c.isActive);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      setChallenges(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update Existing
      setChallenges(prev => prev.map(c => c.id === editingId ? {
        ...c, title, description, rewardAmount: reward, type, isActive
      } : c));
    } else {
      // Create New
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        title,
        description,
        rewardAmount: reward,
        type,
        isActive
      };
      setChallenges(prev => [newChallenge, ...prev]);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setReward(50);
    setIsActive(true);
  };

  const filteredChallenges = filterType === 'ALL' 
    ? challenges 
    : challenges.filter(c => c.type === filterType);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white p-6 shadow-md flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm">EM</span>
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-400">Manage EcoMove Challenges</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-red-900/30 hover:text-red-400 transition-colors border border-gray-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 max-w-5xl mx-auto w-full">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
             <Filter size={16} className="text-gray-400 ml-2" />
             <select 
               className="bg-transparent text-sm font-medium text-gray-700 p-2 outline-none cursor-pointer"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="ALL">All Challenges</option>
               <option value={ChallengeType.WALK}>Walk</option>
               <option value={ChallengeType.CYCLE}>Cycle</option>
               <option value={ChallengeType.METRO}>Metro</option>
               <option value={ChallengeType.CARPOOL}>Carpool</option>
               <option value={ChallengeType.STREAK}>Streak</option>
             </select>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 font-bold hover:bg-emerald-700 transition-transform active:scale-95"
          >
            <Plus size={20} /> Add New Challenge
          </button>
        </div>

        {/* Challenge List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="inline-block p-4 bg-gray-200 rounded-full mb-2"><Search size={24}/></div>
              <p>No challenges found.</p>
            </div>
          ) : (
            filteredChallenges.map(challenge => (
              <div key={challenge.id} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md flex justify-between items-center ${challenge.isActive ? 'border-l-emerald-500' : 'border-l-gray-300 opacity-75'}`}>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        challenge.type === ChallengeType.WALK ? 'text-orange-600 bg-orange-50 border-orange-200' :
                        challenge.type === ChallengeType.CYCLE ? 'text-blue-600 bg-blue-50 border-blue-200' :
                        'text-purple-600 bg-purple-50 border-purple-200'
                      }`}>
                        {challenge.type}
                      </span>
                      {challenge.isActive ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Active</span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><XCircle size={10}/> Inactive</span>
                      )}
                   </div>
                   <h3 className="font-bold text-gray-800 text-lg">{challenge.title}</h3>
                   <p className="text-sm text-gray-500">{challenge.description}</p>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold">Reward</p>
                      <p className="text-xl font-bold text-emerald-600">{challenge.rewardAmount}</p>
                   </div>
                   
                   <div className="flex gap-2 border-l pl-4 border-gray-100">
                      <button onClick={() => handleToggleStatus(challenge.id)} title={challenge.isActive ? "Deactivate" : "Activate"} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          {challenge.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button onClick={() => handleEdit(challenge)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg">
                          <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(challenge.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                          <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Challenge' : 'New Challenge'}</h2>
                 <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                       <select 
                         className="w-full p-2 border rounded-lg bg-gray-50"
                         value={type}
                         onChange={(e) => setType(e.target.value as ChallengeType)}
                       >
                         {Object.values(ChallengeType).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Reward (Pts)</label>
                       <input 
                         type="number" 
                         className="w-full p-2 border rounded-lg"
                         value={reward}
                         onChange={(e) => setReward(Number(e.target.value))}
                         min={1}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-lg"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Morning Walker"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea 
                      className="w-full p-2 border rounded-lg h-24"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="e.g. Walk 5km before 10 AM..."
                    />
                 </div>

                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="activeCheck"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600"
                    />
                    <label htmlFor="activeCheck" className="text-sm font-bold text-gray-700">Active immediately</label>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                      {editingId ? 'Update Challenge' : 'Create Challenge'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};