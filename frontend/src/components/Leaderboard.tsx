import { useState } from 'react';
import { Trophy, Star, Video, Mic, BookOpen, Crown, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  rating: number;
  totalScore: number;
  submissions: number;
  role?: string;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'overall' | 'video' | 'audio' | 'blog'>('overall');

  // Helper to generate mock data
  const generateMockData = (type: string) => {
    // Top 3 distinct users for overall
    if (type === 'overall') {
      return [
        { rank: 1, username: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', rating: 4.9, totalScore: 28500, submissions: 85, role: 'Legendary Creator' },
        { rank: 2, username: 'Alex Rahman', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', rating: 4.8, totalScore: 26200, submissions: 72, role: 'Master Editor' },
        { rank: 3, username: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', rating: 4.8, totalScore: 24800, submissions: 68, role: 'Rising Star' },
        // ... rest
        { rank: 4, username: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', rating: 4.7, totalScore: 21500, submissions: 55 },
        { rank: 5, username: 'Lisa Martinez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 4.6, totalScore: 19800, submissions: 48 },
        { rank: 6, username: 'Rafiur Rahman', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', rating: 4.9, totalScore: 18450, submissions: 42 },
        { rank: 7, username: 'Jennifer Lee', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100', rating: 4.5, totalScore: 16200, submissions: 38 },
        { rank: 8, username: 'Omar Hassan', avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100', rating: 4.4, totalScore: 15400, submissions: 35 },
        { rank: 9, username: 'David Kumar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', rating: 4.3, totalScore: 14100, submissions: 30 },
        { rank: 10, username: 'Sophie Turner', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', rating: 4.2, totalScore: 12800, submissions: 25 },
      ];
    }
    // Return subset for other tabs
    return [
      { rank: 1, username: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', rating: 4.9, totalScore: 9850, submissions: 24, role: 'Video Expert' },
      { rank: 2, username: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', rating: 4.8, totalScore: 9720, submissions: 22 },
      { rank: 3, username: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', rating: 4.7, totalScore: 9560, submissions: 20 },
      { rank: 4, username: 'Alex Rahman', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating: 4.6, totalScore: 9340, submissions: 19 },
      { rank: 5, username: 'Lisa Martinez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 4.5, totalScore: 9120, submissions: 18 },
      { rank: 6, username: 'David Kumar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', rating: 4.4, totalScore: 8890, submissions: 17 },
      { rank: 7, username: 'Jennifer Lee', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100', rating: 4.3, totalScore: 8650, submissions: 16 },
      { rank: 8, username: 'Omar Hassan', avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100', rating: 4.2, totalScore: 8420, submissions: 15 },
    ];
  };

  const currentLeaderboard = generateMockData(activeTab);
  const topThree = currentLeaderboard.slice(0, 3);
  const others = currentLeaderboard.slice(3);

  const TopPodium = ({ entry }: { entry: LeaderboardEntry }) => {
    const isFirst = entry.rank === 1;
    const isSecond = entry.rank === 2;

    let ringColor = isFirst ? 'border-yellow-400' : isSecond ? 'border-gray-300' : 'border-amber-700';
    let bgColor = isFirst ? 'from-yellow-50 to-orange-50' : isSecond ? 'from-gray-50 to-slate-50' : 'from-orange-50 to-amber-50/50';
    let textColor = isFirst ? 'text-yellow-600' : isSecond ? 'text-gray-500' : 'text-amber-700';
    let scale = isFirst ? 'scale-110 z-10' : 'scale-100 z-0 mt-8';
    let shadow = isFirst ? 'shadow-xl shadow-yellow-500/20' : 'shadow-lg';

    return (
      <motion.div
        className={`flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b ${bgColor} ${shadow} border-2 ${ringColor} ${scale} relative max-w-[280px] w-full`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: entry.rank * 0.1 }}
      >
        {isFirst && (
          <div className="absolute -top-6">
            <Crown className="w-12 h-12 text-yellow-400 drop-shadow-lg fill-yellow-200" />
          </div>
        )}

        <div className={`relative`}>
          <div className={`w-24 h-24 rounded-full border-4 ${ringColor} overflow-hidden shadow-inner`}>
            <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
          </div>
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-gray-400' : 'bg-amber-700'}`}>
            {entry.rank}
          </div>
        </div>

        <div className="text-center mt-6">
          <h3 className="text-lg font-bold text-gray-900">{entry.username}</h3>
          {entry.role && <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border border-gray-100 ${textColor} mb-2 inline-block`}>{entry.role}</span>}
          <div className="text-3xl font-heading font-black text-gray-900 tracking-tight my-1">
            {entry.totalScore.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>{entry.rating}</span>
            </div>
            <span>•</span>
            <span>{entry.submissions} Posts</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 tracking-tight">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Leaderboard</span>
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Recognizing the top talent and most active contributors across the entire UIU community.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl mt-6">
          {[
            { id: 'overall', label: 'Overall', icon: Globe },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'audio', label: 'Audio', icon: Mic },
            { id: 'blog', label: 'Blog', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:items-end py-8 min-h-[400px]">
        {/* Order: 2, 1, 3 for visual hierarchy */}
        {topThree[1] && <TopPodium entry={topThree[1]} />}
        {topThree[0] && <TopPodium entry={topThree[0]} />}
        {topThree[2] && <TopPodium entry={topThree[2]} />}
      </div>

      {/* List for the rest */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Honorable Mentions
          </h3>
          <span className="text-sm text-gray-400">Ranks 4-10</span>
        </div>
        <div className="divide-y divide-gray-50">
          {others.map((entry) => (
            <div key={entry.rank} className="p-4 hover:bg-orange-50/30 transition-colors flex items-center gap-4 group">
              <span className="font-mono font-bold text-gray-400 w-8 text-center">{entry.rank}</span>
              <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate group-hover:text-orange-700 transition-colors">{entry.username}</p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{entry.submissions} Submissions</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-gray-900">{entry.totalScore.toLocaleString()}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
