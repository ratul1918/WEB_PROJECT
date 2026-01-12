import { Trophy, Medal, Award, Star } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { Post } from '../types/auth';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  rating: number;
  totalScore: number;
}

interface PortalLeaderboardProps {
  portalType: 'video' | 'audio' | 'blog';
  accentColor: 'orange' | 'indigo' | 'red' | 'purple';
}

export function PortalLeaderboard({ portalType, accentColor }: PortalLeaderboardProps) {
  const { getPostsByType } = usePosts();

  const getApprovedPostsByPortal = (type: 'video' | 'audio' | 'blog') => {
    return getPostsByType(type).filter(p => p.status === 'approved') as Post[];
  };

  const approvedPosts = getApprovedPostsByPortal(portalType);

  const generateLeaderboard = (posts: Post[]): LeaderboardEntry[] => {
    if (posts.length === 0) return [];

    const authorStats = new Map<string, { rating: number; totalScore: number; postCount: number; avatar: string }>();

    posts.forEach(post => {
      const existing = authorStats.get(post.authorId) || { rating: 0, totalScore: 0, postCount: 0, avatar: post.thumbnail || 'https://via.placeholder.com/100' };
      existing.rating += post.rating;
      existing.totalScore += (post.rating * 1000) + post.views;
      existing.postCount += 1;
      authorStats.set(post.authorId, existing);
    });

    const leaderboard: LeaderboardEntry[] = Array.from(authorStats.entries())
      .map(([authorId, stats], index) => ({
        rank: index + 1,
        username: posts.find(p => p.authorId === authorId)?.authorName || 'Unknown',
        avatar: stats.avatar,
        rating: parseFloat((stats.rating / stats.postCount).toFixed(1)),
        totalScore: stats.totalScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    return leaderboard;
  };

  const leaderboard = generateLeaderboard(approvedPosts);

  const colorClasses = {
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-500',
      iconStart: 'text-orange-500',
      fill: 'fill-orange-500',
      hover: 'hover:bg-orange-100',
      cardBg: 'bg-orange-50',
      titleText: 'text-gray-900',
      subText: 'text-orange-900/70',
      entryText: 'text-gray-900',
      borderColor: 'border-orange-300'
    },
    indigo: { // Blog Theme - Clean/White
      gradient: 'from-indigo-600 to-purple-700',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-600',
      iconStart: 'text-indigo-600',
      fill: 'fill-indigo-600',
      hover: 'hover:bg-indigo-50',
      cardBg: 'bg-white',
      titleText: 'text-gray-900',
      subText: 'text-gray-600',
      entryText: 'text-gray-900',
      borderColor: 'border-indigo-600'
    },
    red: { // Video Theme - Dark/Cinematic
      gradient: 'from-red-600 to-red-800',
      bg: 'bg-zinc-800',
      text: 'text-red-500',
      border: 'border-red-600',
      iconStart: 'text-red-500',
      fill: 'fill-red-500',
      hover: 'hover:bg-red-900/30',
      cardBg: 'bg-red-950',
      titleText: 'text-white',
      subText: 'text-red-200',
      entryText: 'text-red-50',
      borderColor: 'border-red-800'
    },
    purple: { // Audio Theme - Light/Purple/Vibrant
      gradient: 'from-purple-600 to-cyan-500',
      bg: 'bg-purple-100', // Increased vibrancy from 50
      text: 'text-purple-700', // Darker text for contrast on darker bg
      border: 'border-purple-300',
      iconStart: 'text-purple-600',
      fill: 'fill-purple-600',
      hover: 'hover:bg-purple-200',
      cardBg: 'bg-purple-100', // Matching main bg
      titleText: 'text-gray-900',
      subText: 'text-purple-900/70',
      entryText: 'text-gray-900',
      borderColor: 'border-purple-400'
    },
  };

  const colors = colorClasses[accentColor];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className={`w-5 h-5 ${colors.iconStart}`} />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-gray-400" />;
  };

  const portalTitle = portalType.charAt(0).toUpperCase() + portalType.slice(1);

  return (
    <div className={`${colors.cardBg} rounded-2xl p-6 shadow-xl sticky top-24 border-t-4 ${colors.borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`font-semibold ${colors.titleText}`}>{portalTitle} Leaderboard</h2>
          <p className={`text-sm ${colors.subText}`}>Top Contributors</p>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {leaderboard.map((entry: LeaderboardEntry, index) => (
          <div
            key={entry.rank}
            className={`p-3 rounded-xl transition-all cursor-pointer ${colors.hover} portal-leaderboard-item portal-entry border border-transparent hover:border-white/50`}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-offset-2"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${colors.entryText} truncate text-sm`}>{entry.username}</div>
                <div className="flex items-center gap-1">
                  <Star className={`w-3 h-3 ${colors.text} ${colors.fill}`} />
                  <span className={`${colors.subText} text-xs`}>{entry.rating}</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between pl-11">
              <span className={`text-xs ${colors.subText}`}>Total Score</span>
              <span className={`font-mono font-medium ${colors.text}`}>{entry.totalScore.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className={`w-full mt-4 bg-gradient-to-r ${colors.gradient} text-white py-2.5 px-4 rounded-xl hover:opacity-90 transition-all shadow-md text-sm font-medium`}>
        View Full Leaderboard
      </button>
    </div>
  );
}
