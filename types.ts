
export enum AppView {
  HOME = 'HOME',
  TRIP = 'TRIP',
  COMMUNITY = 'COMMUNITY',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE',
  CHALLENGES = 'CHALLENGES'
}

export type AuthView = 'LANDING' | 'USER_LOGIN' | 'ADMIN_LOGIN';

export enum TransportMode {
  WALK = 'WALK',
  CYCLE = 'CYCLE',
  METRO_BUS = 'METRO_BUS',
  CARPOOL = 'CARPOOL'
}

export interface TripData {
  id: string;
  mode: TransportMode;
  startTime: number;
  endTime?: number;
  distanceKm: number;
  co2SavedKg: number;
  pointsEarned: number;
  verified: boolean;
  path: { lat: number; lng: number }[];
  steps?: number;
  calories?: number;
}

export interface UserStats {
  totalPoints: number;
  totalDistance: number;
  totalCo2Saved: number;
  streakDays: number;
  level: number;
  lastTripDate?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  avatar: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

// Community Types
export enum PostType {
  STREAK = 'STREAK',
  PROBLEM = 'PROBLEM',
  AD = 'AD'
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  type: PostType;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  timestamp: number;
  
  // Content
  caption?: string;
  image?: string; // base64 or url
  
  // Streak Specific
  streakDay?: number;
  steps?: number;
  distance?: number;
  points?: number;
  
  // Problem Specific
  problemCategory?: string;
  location?: string;
  
  // Interactions
  likes: number;
  isLiked: boolean;
  comments: Comment[];
}

// Challenge Types (Admin System)
export enum ChallengeType {
  WALK = 'WALK',
  CYCLE = 'CYCLE',
  METRO = 'METRO',
  CARPOOL = 'CARPOOL',
  STREAK = 'STREAK'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  type: ChallengeType;
  isActive: boolean;
}
