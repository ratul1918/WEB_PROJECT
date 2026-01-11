import { useState } from 'react';
import { Mic, Clock, AlertCircle, X, Play, Edit, Trash2, Headphones } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { canEditPost, canDeletePost } from '../utils/permissions';
import { usePosts } from '../contexts/PostContext';
import { Post } from '../types/auth';



import { UploadModal } from './UploadModal';

export function AudioPortal() {
  const { user } = useAuth();
  const { getPostsByType, deletePost } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [activePlaying, setActivePlaying] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Get Approved Audio Posts
  const mockAudio = getPostsByType('audio').filter(p => p.status === 'approved') as Post[];

  const sortedAudios = [...mockAudio].sort((a, b) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header - VIBRANT GRADIENT STYLE */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-2xl p-6 shadow-xl shadow-purple-900/40 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                <Headphones className="w-8 h-8 text-cyan-300" />
              </div>
              <div>
                <h1 className="font-heading text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight">Audio Waves</h1>
                <p className="text-purple-200 mt-1 font-medium">Discover the rhythm of the campus</p>
              </div>
            </div>

            {/* Filters - Pill Style */}
            <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-md rounded-full">
              {['latest', 'trending', 'top'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setSortBy(filterType as any)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${sortBy === filterType
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-yellow-600 mb-1">Checking File</div>
              <p className="text-sm text-yellow-700/80">Only audio formats supported.</p>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-yellow-600 hover:text-yellow-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Upload Button - Moved to Top */}
        {user?.role === 'creator' && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mb-8 w-full bg-transparent border-2 border-purple-500 text-purple-100 hover:bg-purple-500 hover:text-white py-8 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex flex-col items-center justify-center gap-4 group"
          >
            <Mic className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-xl tracking-wide">Start a Broadcast</span>
          </button>
        )}

        {/* Audio List - PLAYER CARD STYLE */}
        <div className="space-y-4">
          {sortedAudios.map((audio, index) => {
            const isPlaying = activePlaying === audio.id;

            // Post type for permission
            const postForPermission: Post = {
              id: audio.id,
              title: audio.title,
              authorId: audio.authorId,
              authorName: audio.authorName,
              authorRole: audio.authorRole,
              status: 'approved',
              type: 'audio',
              thumbnail: audio.thumbnail,
              rating: audio.rating,
              views: audio.views,
              uploadDate: audio.uploadDate,
            };
            const canEdit = canEditPost(user, postForPermission);
            const canDelete = canDeletePost(user, postForPermission);

            return (
              <div
                key={audio.id}
                className={`group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-purple-200 transition-all flex items-center gap-4 ${isPlaying ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              >
                {/* Ranking Index (for visuals) */}
                <span className="font-mono text-gray-300 font-bold text-xl w-6 text-center hidden sm:block">
                  {index + 1}
                </span>

                {/* Thumbnail/Cover */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                  <img src={audio.thumbnail} alt={audio.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setActivePlaying(isPlaying ? null : audio.id)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? <span className="w-4 h-4 bg-white animate-pulse rounded-full" /> : <Headphones className="w-8 h-8 text-white fill-white/20" />}
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-lg font-bold truncate ${isPlaying ? 'text-purple-600' : 'text-gray-900 group-hover:text-purple-600'} transition-colors`}>
                    {audio.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-auto">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{audio.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{audio.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {audio.authorName}
                    </span>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Plays</div>
                    <div className="font-mono font-semibold text-gray-700">{audio.views.toLocaleString()}</div>
                  </div>

                  {/* Action Buttons */}
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); alert(`Edit: ${audio.title}`); }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this audio?')) {
                              deletePost(audio.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Button */}

      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="audio" accentColor="purple" />
      </div>
      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialType="audio"
      />
    </div>
  );
}
