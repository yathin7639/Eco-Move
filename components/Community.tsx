
import React, { useState, useMemo } from 'react';
import { Users, Heart, MessageSquare, AlertTriangle, Leaf, Plus, X, Camera, MapPin, MoreHorizontal, Send, Info, Trash2 } from 'lucide-react';
import { UserStats, Post, PostType, Comment } from '../types';

interface CommunityProps {
  userStats: UserStats;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    type: PostType.STREAK,
    userId: 'u2',
    userName: 'Priya Singh',
    userAvatar: 'PS',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    streakDay: 12,
    steps: 8500,
    points: 420,
    caption: 'Hit a new personal best on my walk to work today! Delhi mornings are getting better. 🌿',
    likes: 24,
    isLiked: false,
    comments: [
      { id: 'c1', userName: 'Rahul', text: 'Amazing consistency!', timestamp: Date.now() - 1000 * 60 * 30 }
    ]
  },
  {
    id: '2',
    type: PostType.PROBLEM,
    userId: 'u3',
    userName: 'Amit Verma',
    userAvatar: 'AV',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    problemCategory: 'Garbage Burning',
    location: 'Sector 18, Noida',
    caption: 'Found this pile burning near the metro station. Heavy smoke. Reporting this now.',
    likes: 45,
    isLiked: true,
    comments: []
  },
  {
    id: '3',
    type: PostType.STREAK,
    userId: 'u4',
    userName: 'Sneha P.',
    userAvatar: 'SP',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    streakDay: 45,
    distance: 12.5,
    points: 600,
    caption: 'Cycling from South Ex to CP. 45 day streak kept alive! 🚴‍♀️',
    likes: 112,
    isLiked: false,
    comments: []
  },
  {
    id: '4',
    type: PostType.PROBLEM,
    userId: 'u5',
    userName: 'Rohan D.',
    userAvatar: 'RD',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    problemCategory: 'Construction Dust',
    location: 'Lajpat Nagar',
    caption: 'Uncovered construction material causing dust storm on main road.',
    likes: 12,
    isLiked: false,
    comments: []
  },
  {
    id: '5',
    type: PostType.STREAK,
    userId: 'u6',
    userName: 'Kiran W.',
    userAvatar: 'KW',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    streakDay: 3,
    steps: 4000,
    points: 200,
    caption: 'Small steps every day.',
    likes: 8,
    isLiked: false,
    comments: []
  },
  {
    id: '6',
    type: PostType.STREAK,
    userId: 'u7',
    userName: 'Vikram S.',
    userAvatar: 'VS',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    streakDay: 10,
    distance: 5.2,
    points: 250,
    caption: 'Metro commute today. Clean and fast.',
    likes: 15,
    isLiked: false,
    comments: []
  }
];

export const Community: React.FC<CommunityProps> = ({ userStats }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'STREAKS' | 'PROBLEMS'>('ALL');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'STREAK' | 'PROBLEM' | null>(null);
  
  // Refactored to ID for single source of truth
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Form states
  const [newCaption, setNewCaption] = useState('');
  const [problemCategory, setProblemCategory] = useState('Garbage');
  const [problemLocation, setProblemLocation] = useState('Connaught Place, Delhi'); // Mock auto-fill
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Derived state for Detail View - ensures modal updates when posts state changes (likes/comments)
  const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId) || null, [posts, selectedPostId]);

  // Helper for consistent avatar display
  const getAvatarText = (name?: string, avatar?: string) => {
    if (avatar) return avatar;
    if (name) return name.charAt(0).toUpperCase();
    return '?';
  };

  // -- Feed Logic --
  const feedPosts = useMemo(() => {
    let filtered = posts;
    if (activeTab === 'STREAKS') filtered = posts.filter(p => p.type === PostType.STREAK);
    if (activeTab === 'PROBLEMS') filtered = posts.filter(p => p.type === PostType.PROBLEM);

    // Insert Ads every 5 posts
    const withAds: Post[] = [];
    filtered.forEach((post, index) => {
      withAds.push(post);
      if ((index + 1) % 5 === 0) {
        withAds.push({
          id: `ad-${index}`,
          type: PostType.AD,
          timestamp: Date.now(),
          likes: 0,
          isLiked: false,
          comments: []
        });
      }
    });
    return withAds;
  }, [posts, activeTab]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
      }
      return p;
    }));
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedPostId) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userName: 'Aryan Gupta', // Hardcoded user for prototype consistency
      text: commentText,
      timestamp: Date.now()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === selectedPostId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
    setCommentText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPostImage(null);
  }

  const handleSubmitPost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      type: createMode === 'STREAK' ? PostType.STREAK : PostType.PROBLEM,
      userId: 'me',
      userName: 'Aryan Gupta',
      userAvatar: 'AG',
      timestamp: Date.now(),
      caption: newCaption,
      likes: 0,
      isLiked: false,
      comments: [],
      // Mock Image for demo if "uploaded"
      image: newPostImage || undefined
    };

    if (createMode === 'STREAK') {
      newPost.streakDay = userStats.streakDays;
      newPost.points = userStats.totalPoints; // Just using total for demo context
      newPost.steps = 6240; // Mock current daily steps
    } else {
      newPost.problemCategory = problemCategory;
      newPost.location = problemLocation;
    }

    setPosts([newPost, ...posts]);
    closeModal();
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreateMode(null);
    setNewCaption('');
    setNewPostImage(null);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-20">
      {/* Header & Tabs */}
      <div className="bg-white px-6 pt-12 pb-2 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <div className="bg-emerald-100 p-2 rounded-full">
            <Users size={20} className="text-emerald-600" />
          </div>
        </div>
        <div className="flex gap-4 border-b border-gray-100">
          {['ALL', 'STREAKS', 'PROBLEMS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 text-sm font-bold transition-colors ${
                activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {feedPosts.map((post) => {
          if (post.type === PostType.AD) {
            return (
              <div key={post.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase">
                    Sponsored Ad (Mock)
                 </div>
                 <div className="flex flex-col gap-3">
                    <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                        Placeholder Ad Image
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Sustainable Living Gear</h3>
                        <p className="text-xs text-gray-500 mb-3">Shop the latest in eco-friendly travel accessories.</p>
                        <button className="w-full py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            Learn More
                        </button>
                    </div>
                 </div>
              </div>
            );
          }

          const isStreak = post.type === PostType.STREAK;
          const isProblem = post.type === PostType.PROBLEM;

          return (
            <div 
              key={post.id} 
              className={`bg-white rounded-2xl p-4 shadow-sm border transition-transform hover:scale-[1.01] cursor-pointer ${
                isStreak ? 'border-emerald-100' : 'border-orange-100'
              }`}
              onClick={() => setSelectedPostId(post.id)}
            >
              {/* Post Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isStreak ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {getAvatarText(post.userName, post.userAvatar)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{post.userName}</h3>
                    <p className="text-xs text-gray-500">{formatTime(post.timestamp)}</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gray-500 p-1">
                    <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-3">
                <p className="text-gray-800 text-sm mb-2">{post.caption}</p>
                
                {/* Type Specific Content */}
                {isStreak && (
                    <div className="bg-emerald-50 rounded-xl p-3 mb-2 flex items-center justify-between border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Leaf size={16} />
                            <span className="font-bold text-xs">{post.streakDay} Day Streak</span>
                        </div>
                        {post.points && <span className="text-xs font-bold text-emerald-600">+{post.points} pts</span>}
                    </div>
                )}
                
                {isProblem && (
                    <div className="bg-orange-50 rounded-xl p-3 mb-2 flex flex-col gap-1 border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-700 font-bold text-xs">
                            <AlertTriangle size={14} /> {post.problemCategory}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <MapPin size={12} /> {post.location}
                        </div>
                    </div>
                )}

                {/* Mock Image Display */}
                {post.image ? (
                   <div className="rounded-xl overflow-hidden h-48 w-full bg-gray-100 mb-2">
                       <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                   </div>
                ) : (
                  // Placeholder for visual balance if no image
                  isProblem && (
                    <div className="rounded-xl overflow-hidden h-32 w-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs mb-2">
                        [Problem Photo Placeholder]
                    </div>
                  )
                )}
              </div>

              {/* Badges */}
              {isStreak && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified by EcoMove activity
                  </div>
              )}
              {isProblem && (
                  <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium mb-3">
                      <Info size={10} />
                      Photo and location required for authenticity
                  </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                            post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                          <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                          {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600">
                          <MessageSquare size={16} />
                          {post.comments.length}
                      </button>
                  </div>
                  <button className="text-[10px] text-gray-300 hover:text-red-400 font-medium">
                      Report
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus size={28} />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
            {!createMode ? (
                // Step 1: Selection
                <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Create Post</h2>
                        <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setCreateMode('STREAK')}
                            className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center gap-3 hover:bg-emerald-100 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                                <Leaf size={24} />
                            </div>
                            <span className="font-bold text-emerald-900">Share Streak</span>
                        </button>
                        <button 
                            onClick={() => setCreateMode('PROBLEM')}
                            className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center gap-3 hover:bg-orange-100 transition-colors"
                        >
                             <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700">
                                <AlertTriangle size={24} />
                            </div>
                            <span className="font-bold text-orange-900">Report Problem</span>
                        </button>
                    </div>
                </div>
            ) : (
                // Step 2: Form
                <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col animate-in slide-in-from-bottom-10">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{createMode === 'STREAK' ? 'Share Streak' : 'Report Issue'}</h2>
                        <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {createMode === 'STREAK' && (
                            <div className="bg-emerald-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-emerald-600 font-bold uppercase">Current Streak</p>
                                    <p className="text-2xl font-bold text-emerald-800">{userStats.streakDays} Days</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-600 font-bold uppercase">Points</p>
                                    <p className="text-2xl font-bold text-emerald-800">{userStats.totalPoints}</p>
                                </div>
                            </div>
                        )}

                        {createMode === 'PROBLEM' && (
                           <>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Issue Category</label>
                             <select 
                                value={problemCategory}
                                onChange={(e) => setProblemCategory(e.target.value)}
                                className="w-full p-3 bg-orange-50 rounded-xl border-2 border-orange-200 mb-4 focus:outline-none focus:border-orange-500 font-medium text-gray-800"
                             >
                                 <option>Garbage Burning</option>
                                 <option>Construction Dust</option>
                                 <option>Vehicle Idling</option>
                                 <option>Litter / Waste</option>
                                 <option>Other</option>
                             </select>

                             <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                             <div className="relative mb-4">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 z-10" />
                                <input
                                    type="text"
                                    value={problemLocation}
                                    onChange={(e) => setProblemLocation(e.target.value)}
                                    className="w-full p-3 pl-10 bg-white rounded-xl border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 font-medium transition-all"
                                />
                             </div>
                             <p className="text-xs text-blue-500 -mt-3 mb-4 text-center">Location can be changed if the user want to change</p>
                           </>
                        )}

                        <textarea 
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                            placeholder={createMode === 'STREAK' ? "Say something about your progress..." : "Describe the issue..."}
                            value={newCaption}
                            onChange={(e) => setNewCaption(e.target.value)}
                        />

                        {/* Updated Image Upload Section */}
                        <div className="mb-4">
                            {!newPostImage ? (
                                <label className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-colors cursor-pointer border-gray-300 text-gray-500 hover:bg-gray-50`}>
                                    <Camera size={20} />
                                    <span>Add Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden h-40 w-full border border-gray-200">
                                    <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {createMode === 'PROBLEM' && !newPostImage && (
                            <p className="text-[10px] text-red-500 mt-2 text-center">* Photo required for reports</p>
                        )}
                    </div>

                    <button 
                        onClick={handleSubmitPost}
                        disabled={createMode === 'PROBLEM' && !newPostImage}
                        className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                            createMode === 'PROBLEM' && !newPostImage ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                    >
                        Post
                    </button>
                </div>
            )}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-right">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shadow-sm">
                  <button onClick={() => setSelectedPostId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X size={24} />
                  </button>
                  <h2 className="font-bold text-lg">Post</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                  {/* Reuse basic layout but expanded */}
                   <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            selectedPost.type === PostType.STREAK ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {getAvatarText(selectedPost.userName, selectedPost.userAvatar)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{selectedPost.userName}</h3>
                            <p className="text-xs text-gray-500">{formatTime(selectedPost.timestamp)}</p>
                        </div>
                  </div>

                  <p className="text-lg text-gray-800 mb-4">{selectedPost.caption}</p>

                  {selectedPost.image && (
                      <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
                          <img src={selectedPost.image} alt="Full view" className="w-full" />
                      </div>
                  )}

                  {selectedPost.type === PostType.PROBLEM && (
                       <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                           <h4 className="font-bold text-orange-800 mb-1">Report Details</h4>
                           <div className="flex flex-col gap-2 text-sm text-gray-700">
                               <p><strong>Category:</strong> {selectedPost.problemCategory}</p>
                               <p><strong>Location:</strong> {selectedPost.location}</p>
                               <p className="text-xs text-orange-600 mt-2 bg-orange-100/50 p-2 rounded">
                                   This report has been logged and verified by location data.
                               </p>
                           </div>
                       </div>
                  )}

                  <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100 mb-4">
                       <button 
                         onClick={() => handleLike(selectedPost.id)}
                         className="flex items-center gap-2 font-bold text-gray-600 hover:text-gray-900"
                       >
                           <Heart size={20} className={selectedPost.isLiked ? 'text-red-500 fill-current' : ''} />
                           {selectedPost.likes} Likes
                       </button>
                       <div className="flex items-center gap-2 font-bold text-gray-600">
                           <MessageSquare size={20} />
                           {selectedPost.comments.length} Comments
                       </div>
                  </div>

                  <div className="space-y-4 mb-20">
                      {selectedPost.comments.length === 0 && (
                          <p className="text-center text-gray-400 py-4">No comments yet. Be the first!</p>
                      )}
                      {selectedPost.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                  {comment.userName.charAt(0)}
                              </div>
                              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex-1">
                                  <p className="text-xs font-bold text-gray-900 mb-1">{comment.userName}</p>
                                  <p className="text-sm text-gray-800">{comment.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-gray-200 bg-white pb-8">
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment();
                        }}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button 
                        onClick={handleAddComment}
                        className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                      >
                          <Send size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
