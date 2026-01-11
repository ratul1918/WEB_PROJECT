import { useState } from 'react';
import { AlertCircle, X, Edit, Trash2, Feather, ArrowRight, BookOpen } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { canEditPost, canDeletePost } from '../utils/permissions';
import { usePosts } from '../contexts/PostContext';
import { UploadModal } from './UploadModal';
import { Post } from '../types/auth';

export function BlogPortal() {
  const { user } = useAuth();
  const { getPostsByType, deletePost } = usePosts();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);

  // Get Approved Blog Posts
  const mockBlogs = getPostsByType('blog').filter(p => p.status === 'approved') as Post[];

  const sortedBlogs = [...mockBlogs].sort((a, b) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header - MINIMALIST / WRITERLY STYLE */}
        <div className="bg-stone-100 rounded-none border-b-2 border-stone-800 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-stone-900 text-stone-50 rounded-sm">
                <Feather className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-serif text-4xl text-stone-900 tracking-tight italic">The Daily Reader</h1>
                <p className="font-sans text-stone-600 mt-2 text-sm uppercase tracking-widest border-l-2 border-stone-300 pl-3">Insights • Stories • Perspectives</p>
              </div>
            </div>

            {/* Filters - Simple Text Links */}
            <div className="flex gap-6 font-sans text-sm font-medium">
              {['latest', 'trending', 'top'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setSortBy(filterType as any)}
                  className={`pb-1 border-b-2 transition-all ${sortBy === filterType
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
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
          <div className="bg-stone-50 border border-stone-200 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Only text content is supported.</span>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-stone-400 hover:text-stone-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Button - Moved to Top */}
        {user?.role === 'creator' && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mb-8 w-full bg-white border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white py-8 px-6 rounded-sm transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-4 group"
          >
            <Edit className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-serif text-2xl italic">Draft a New Story</span>
          </button>
        )}

        {/* Blog List - CLEAN EDITORIAL LAYOUT */}
        <div className="space-y-8">
          {sortedBlogs.map((blog) => {
            // Compatibility: use direct Post type from context
            const postForPermission = blog;

            const canEdit = canEditPost(user, postForPermission);
            const canDelete = canDeletePost(user, postForPermission);

            return (
              <div
                key={blog.id}
                className="group bg-white rounded-sm p-0 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-200 pb-8 last:border-0"
              >
                <div className="md:flex gap-8 items-start">
                  {/* Content - First on desktop for emphasis on title */}
                  <div className="flex-1 order-2 md:order-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold font-sans text-stone-900 uppercase tracking-wider">
                        {blog.duration ? blog.duration : '5 min read'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-serif text-stone-500 italic">{blog.authorName}</span>
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl text-stone-900 leading-tight mb-3 group-hover:underline decoration-stone-400 underline-offset-4 decoration-2">
                      {blog.title}
                    </h2>

                    <p className="font-sans text-stone-600 leading-relaxed mb-4 line-clamp-2 md:line-clamp-3">
                      {blog.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-stone-400 group-hover:text-stone-900 transition-colors">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </div>

                      {/* Action Buttons */}
                      {(canEdit || canDelete) && (
                        <div className="flex items-center gap-3">
                          {canEdit && (
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Edit: ${blog.title}`); }}
                              className="text-stone-400 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this blog?')) {
                                  deletePost(blog.id);
                                }
                              }}
                              className="text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail - Right side on desktop */}
                  <div className="md:w-48 lg:w-64 flex-shrink-0 order-1 md:order-2 mb-4 md:mb-0">
                    <div className="aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 relative">
                      <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                        <BookOpen className="w-12 h-12 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Button */}


        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType="blog"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="blog" accentColor="indigo" />
      </div>
    </div>
  );
}
