import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Heart, TrendingUp, Clock, Award, AlertCircle, X, Upload, Search, Play, ChevronRight, Trash2, Music, Star } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';
import { buildMediaUrl } from '../utils/media';

export function AudioPortal() {
  const { user } = useAuth();
  const { posts, votePost, deletePost } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('audio');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'audio') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  // Use context posts exclusively
  const portalAudios = posts.filter(p => p.type === 'audio' && p.status === 'approved');

  // Filter by search query first
  const filteredAudios = portalAudios.filter(audio => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      audio.title.toLowerCase().includes(query) ||
      audio.authorName.toLowerCase().includes(query)
    );
  });

  // Sort functions
  const getSortedAudios = (audios: typeof portalAudios, sort: typeof sortBy) => {
    return [...audios].sort((a, b) => {
      if (sort === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
      if (sort === 'trending') return b.views - a.views;
      if (sort === 'top') return (b.votes ?? 0) - (a.votes ?? 0);
      return 0;
    });
  };

  const sortedAudios = getSortedAudios(filteredAudios, sortBy);
  const allTrendingAudios = getSortedAudios(portalAudios, 'trending');
  const trendingAudios = showAllTrending ? allTrendingAudios : allTrendingAudios.slice(0, 6);

  const getImageUrl = (audio: typeof portalAudios[0]) => {
    return buildMediaUrl(audio.thumbnail) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${audio.authorName}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-[#19889A]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#19889A] to-[#0F5A6B] rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Audio Portal</h1>
              <p className="text-gray-600">Discover amazing audio content</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-[#19889A] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-[#E8F5F6]'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-[#19889A] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-[#E8F5F6]'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-[#19889A] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-[#E8F5F6]'
                }`}
            >
              <Star className="w-4 h-4" />
              Top Rated
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audio..."
              style={{ paddingLeft: '3.5rem' }}
              className="w-full pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-[#19889A] focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19889A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Cards Panel - Only for Creators/Admins */}
        {canUpload(user) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleUploadClick('audio')}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-[#19889A]/20 dark:border-[#19889A]/20 hover:border-[#19889A] transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-[#E8F5F6] dark:bg-[#0F5A6B]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-[#19889A]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upload New Audio</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Share your sounds with the world</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-[#19889A] transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start Recording</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Record and share your audio content</p>
            </button>
          </div>
        )}

        {/* Trending Songs Section */}
        {trendingAudios.length > 0 && !searchQuery && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Trending Songs</h2>
                  {allTrendingAudios.length > 6 && (
                    <button
                      onClick={() => setShowAllTrending(!showAllTrending)}
                      className="text-[#19889A] hover:text-[#0F5A6B] text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {showAllTrending ? 'Show less' : 'Show all'} <ChevronRight className={`w-4 h-4 transition-transform ${showAllTrending ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trendingAudios.map((audio) => (
                    <Link
                      key={audio.id}
                      to={`/audio/${audio.id}`}
                      className="group text-center"
                      onMouseEnter={() => setHoveredTrack(audio.id)}
                      onMouseLeave={() => setHoveredTrack(null)}
                    >
                      <div className="relative mb-3">
                        <img
                          src={getImageUrl(audio)}
                          alt={audio.title}
                          className="w-full aspect-square rounded-2xl object-cover shadow-lg border-4 border-white group-hover:border-[#19889A] transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-[#19889A] rounded-full flex items-center justify-center shadow-xl">
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-gray-900 font-medium text-sm line-clamp-1">{audio.title}</h3>
                      <p className="text-gray-500 text-xs">{audio.authorName}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Tracks Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Tracks'}
              </h2>

              {sortedAudios.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                  <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tracks found</h3>
                  <p className="text-gray-500">Try a different search or upload your own!</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-gray-100 text-gray-500 text-sm bg-gray-50">
                    <span className="w-10 text-center">#</span>
                    <span>Title</span>
                    <span className="w-20 text-center">
                      <Heart className="w-4 h-4 mx-auto" />
                    </span>
                    <span className="w-16 text-right">Duration</span>
                  </div>

                  {sortedAudios.map((audio, index) => (
                    <Link
                      key={audio.id}
                      to={`/audio/${audio.id}`}
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 hover:bg-[#E8F5F6] transition-colors group items-center border-b border-gray-50 last:border-0"
                      onMouseEnter={() => setHoveredTrack(audio.id)}
                      onMouseLeave={() => setHoveredTrack(null)}
                    >
                      <div className="w-10 text-center">
                        {hoveredTrack === audio.id ? (
                          <Play className="w-4 h-4 text-[#19889A] mx-auto fill-[#19889A]" />
                        ) : (
                          <span className="text-gray-400">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(audio)}
                          alt={audio.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <h3 className="text-gray-900 font-medium truncate group-hover:text-[#19889A] transition-colors">
                            {audio.title}
                          </h3>
                          <p className="text-gray-500 text-sm truncate">{audio.authorName}</p>
                        </div>
                      </div>

                      <div className="w-20 flex justify-center">
                        {user && ['viewer', 'admin'].includes(user.role) && user.id !== audio.authorId ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              votePost(audio.id);
                            }}
                            className="flex items-center gap-1 hover:scale-110 transition-transform"
                            title={audio.hasVoted ? "Unlike" : "Like"}
                          >
                            <Heart className={`w-4 h-4 transition-colors ${audio.hasVoted ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} />
                            <span className={`text-sm ${audio.hasVoted ? 'text-red-600' : 'text-gray-500'}`}>{audio.votes ?? 0}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{audio.votes ?? 0}</span>
                          </div>
                        )}
                      </div>

                      <div className="w-16 text-right text-gray-500 text-sm">
                        {audio.duration || '0:00'}
                      </div>

                      {user?.role === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('Are you sure you want to delete this audio?')) {
                              deletePost(audio.id);
                            }
                          }}
                          className="w-8 flex justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType={uploadType}
        />

        <InteractiveModal
          isOpen={isInteractiveModalOpen}
          onClose={() => setIsInteractiveModalOpen(false)}
          type="audio"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="audio" />
      </div>
    </div>
  );
}
