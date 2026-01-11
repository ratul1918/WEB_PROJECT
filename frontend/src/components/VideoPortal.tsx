
import { useState } from 'react';
import { Video, Star, TrendingUp, Clock, Award, AlertCircle, X, Edit, Trash2, Upload, PlayCircle } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { canEditPost, canDeletePost } from '../utils/permissions';
import { usePosts } from '../contexts/PostContext';
import { UploadModal } from './UploadModal';
import { Post } from '../types/auth';



export function VideoPortal() {
  const { user } = useAuth();
  const { getPostsByType, deletePost } = usePosts();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);

  // Get Approved Videos
  const mockVideos = getPostsByType('video').filter(p => p.status === 'approved') as Post[];

  const sortedVideos = [...mockVideos].sort((a, b) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header - CINEMATIC STYLE */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl shadow-black/50 mb-6 border border-zinc-700/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 mb-6">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform duration-300">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white tracking-tight">Cinema Hub</h1>
              <p className="text-zinc-400 text-sm mb-2">Immerse yourself in student-created films & showcases</p>
            </div>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-400 mb-1">Invalid File Type</div>
                <p className="text-sm text-red-300/80">Only video files (MP4, MOV, AVI) are accepted.</p>
              </div>
              <button onClick={() => setShowWarning(false)} className="text-red-400 hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filters - Dark Mode */}
          <div className="flex gap-2 relative z-10">
            {['latest', 'trending', 'top'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setSortBy(filterType as any)}
                className={`flex items - center gap - 2 px - 4 py - 2.5 rounded - lg transition - all font - medium text - sm ${sortBy === filterType
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                  } `}
              >
                {filterType === 'latest' && <Clock className="w-4 h-4" />}
                {filterType === 'trending' && <TrendingUp className="w-4 h-4" />}
                {filterType === 'top' && <Award className="w-4 h-4" />}
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button - Moved to Top */}
        {user?.role === 'creator' && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mb-8 w-full bg-transparent border-2 border-red-600 text-red-50 hover:bg-red-600 hover:text-white py-8 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center gap-4 group"
          >
            <Upload className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-heading font-bold text-xl tracking-widest uppercase">Upload New Masterpiece</span>
          </button>
        )}

        {/* Video Grid - CINEMATIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedVideos.map((video) => {
            // Convert VideoPost to Post type for permission checks
            const postForPermission: Post = {
              id: video.id,
              title: video.title,
              authorId: video.authorId,
              authorName: video.authorName,
              authorRole: video.authorRole,
              status: 'approved',
              type: 'video',
              thumbnail: video.thumbnail,
              rating: video.rating,
              views: video.views,
              uploadDate: video.uploadDate,
            };

            const canEdit = canEditPost(user, postForPermission);
            const canDelete = canDeletePost(user, postForPermission);

            return (
              <div
                key={video.id}
                className="group bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 hover:border-zinc-600 transition-all hover:-translate-y-1 h-full flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Video className="w-12 h-12 text-white/90 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-mono font-medium">
                    {video.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-heading text-lg font-bold text-gray-100 mb-1 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600/50"></span>
                    {video.authorName}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm py-2 border-t border-zinc-800 mt-auto">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{video.rating}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{video.views.toLocaleString()} views</span>
                  </div>

                  {/* Action Buttons */}
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 mt-4">
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Edit video: ${video.title} `);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-xs font-medium border border-zinc-700"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this video?')) {
                              deletePost(video.id);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/30 transition-colors text-xs font-medium border border-red-900/30"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
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
        <PortalLeaderboard portalType="video" accentColor="orange" />
      </div>
      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialType="video"
      />
    </div>
  );
}
