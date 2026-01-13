import { useState } from 'react';
import { BookOpen, Star, TrendingUp, Clock, Award, AlertCircle, X, Upload, PenTool } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';

export function BlogPortal() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('blog');

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'blog') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  // Use context posts exclusively
  const portalBlogs = posts.filter(p => p.type === 'blog' && p.status === 'approved');

  const sortedBlogs = portalBlogs.sort((a, b: any) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border-l-4 border-indigo-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Blog Portal</h1>
              <p className="text-gray-600">Read insightful articles and stories</p>
            </div>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-indigo-900 mb-1">Invalid Content Type</div>
                <p className="text-indigo-700">This file type is not allowed for the Blog Portal. Only text-based content is accepted.</p>
              </div>
              <button onClick={() => setShowWarning(false)} className="text-indigo-600 hover:text-indigo-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                }`}
            >
              <Award className="w-4 h-4" />
              Top Rated
            </button>
          </div>
        </div>

        {/* Action Cards Panel - Moved to Top - Only for Creators/Admins */}
        {canUpload(user) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleUploadClick('blog')}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/20 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Upload New Blog</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Share your thoughts with the world</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start writing</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create a new article or story</p>
            </button>
          </div>
        )}

        {/* Blog List */}
        <div className="space-y-6">
          {sortedBlogs.map((blog: any) => ( // Use any temporarily to avoid issues with missing readTime/description on base Post type
            <a
              key={blog.id}
              href="https://www.lipsum.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer border-l-4 border-indigo-600 block"
            >
              <div className="md:flex">
                {/* Thumbnail */}
                <div className="md:w-64 md:flex-shrink-0">
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <h2 className="text-gray-900 mb-2">{blog.title}</h2>
                  <p className="text-gray-600 mb-3">{blog.authorName}</p>
                  <p className="text-gray-700 mb-4">{blog.description}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                        <span className="text-gray-700">{blog.rating}</span>
                      </div>
                      <span className="text-gray-600">{blog.views.toLocaleString()} reads</span>
                      <span className="text-gray-600">{blog.readTime} read</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          initialType={uploadType}
        />

        <InteractiveModal
          isOpen={isInteractiveModalOpen}
          onClose={() => setIsInteractiveModalOpen(false)}
          type="blog"
        />
      </div>

      {/* Leaderboard Sidebar */}
      <div className="lg:col-span-1">
        <PortalLeaderboard portalType="blog" accentColor="orange" />
      </div>
    </div>
  );
}