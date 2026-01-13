import { Trophy, Medal, Award, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  rating: number;
  totalScore: number;
}

interface PortalLeaderboardProps {
  portalType: 'video' | 'audio' | 'blog';
  accentColor: 'orange' | 'indigo';
}

export function PortalLeaderboard({ portalType, accentColor }: PortalLeaderboardProps) {
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      username: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      rating: 4.9,
      totalScore: 9850,
    },
    {
      rank: 2,
      username: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 4.8,
      totalScore: 9720,
    },
    {
      rank: 3,
      username: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      rating: 4.7,
      totalScore: 9560,
    },
    {
      rank: 4,
      username: 'Alex Rahman',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      rating: 4.6,
      totalScore: 9340,
    },
    {
      rank: 5,
      username: 'Lisa Martinez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      rating: 4.5,
      totalScore: 9120,
    },
  ];

  const colorClasses = {
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-50',
    },
    indigo: {
      gradient: 'from-indigo-600 to-purple-700',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-50',
    },
  };

  const colors = colorClasses[accentColor];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className={`w-5 h-5 ${accentColor === 'orange' ? 'text-orange-500' : 'text-indigo-600'}`} />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-gray-400" />;
  };

  const portalTitle = portalType.charAt(0).toUpperCase() + portalType.slice(1);

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md sticky top-24 border-t-4 ${accentColor === 'orange' ? 'border-orange-500' : 'border-indigo-600'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center`}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">{portalTitle} Leaderboard</h2>
          <p className="text-gray-600">Top Contributors</p>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`p-3 rounded-xl transition-all cursor-pointer ${colors.hover} border border-gray-100`}
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
                className="w-10 h-10 rounded-full object-cover"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 truncate">{entry.username}</div>
                <div className="flex items-center gap-1">
                  <Star className={`w-3 h-3 ${accentColor === 'orange' ? 'text-orange-500 fill-orange-500' : 'text-indigo-600 fill-indigo-600'}`} />
                  <span className="text-gray-600">{entry.rating}</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between pl-11">
              <span className="text-gray-600">Total Score</span>
              <span className={`${colors.text}`}>{entry.totalScore.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className={`w-full mt-4 bg-gradient-to-r ${colors.gradient} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity`}>
        View Full Leaderboard
      </button>
    </div>
  );
}