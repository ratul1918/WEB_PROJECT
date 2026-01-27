import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, TrendingUp, Clock, Award, AlertCircle, X, Upload, PenTool, Filter, ChevronDown, Trash2, Eye, User, Calendar } from 'lucide-react';
import { PortalLeaderboard } from './PortalLeaderboard';
import { UploadModal } from './UploadModal';
import { InteractiveModal } from './InteractiveModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { canUpload } from '../utils/permissions';
import { buildMediaUrl } from '../utils/media';

export function BlogPortal() {
  const { user } = useAuth();
  const { posts, votePost, deletePost } = usePosts();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const [showWarning, setShowWarning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'blog'>('blog');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleUploadClick = (type: 'video' | 'audio' | 'blog' = 'blog') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleInteractiveClick = () => {
    setIsInteractiveModalOpen(true);
  };

  const formatCategoryName = (value?: string) => {
    if (!value) return 'General';
    const lower = value.toString().trim().toLowerCase();
    if (!lower) return 'General';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  // Categories for filtering: merge detected categories with defaults
  const defaultCategories = ['Tech', 'Education', 'Motivation', 'Lifestyle', 'News', 'Poems', 'Story Writing', 'General'];
  const detectedCategories = Array.from(new Set(
    posts
      .filter(p => p.type === 'blog')
      .map((blog: any) => formatCategoryName((blog.category && blog.category !== 'General') ? blog.category : getBlogCategory(blog)))
      .filter(Boolean)
  ));
  const categories = ['All', ...new Set([...defaultCategories.map(formatCategoryName), ...detectedCategories])];

  // Helper function to extract category
  function getBlogCategory(blog: any): string {
    // 1. Prefer explicit category from DB
    if (blog.category && blog.category !== 'General') return formatCategoryName(blog.category);

    // 2. Fallback to title inference
    const title = blog.title.toLowerCase();
    if (title.includes('ai') || title.includes('tech') || title.includes('web')) return 'Tech';
    if (title.includes('student') || title.includes('study')) return 'Education';
    if (title.includes('motivation') || title.includes('success')) return 'Motivation';

    // 3. Default fallback
    return formatCategoryName(blog.category) || 'General';
  }

  // Use context posts exclusively
  const portalBlogs = posts.filter(p => p.type === 'blog' && p.status === 'approved');

  // Apply filters
  const filteredBlogs = portalBlogs.filter(blog => {
    // Category filter
    const blogCategory = getBlogCategory(blog);
    const categoryMatch = selectedCategory === 'All' || blogCategory.toLowerCase() === selectedCategory.toLowerCase();
    return categoryMatch;
  });

  // Sort filtered blogs
  const sortedBlogs = [...filteredBlogs].sort((a, b: any) => {
    if (sortBy === 'latest') return b.uploadDate.getTime() - a.uploadDate.getTime();
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top') return (b.votes ?? 0) - (a.votes ?? 0);
    return 0;
  });

  const getImageUrl = (blog: any) => {
    if (blog.thumbnail) {
      return buildMediaUrl(blog.thumbnail);
    }

    // Deterministic random image based on ID
    const placeholders = [
      'https://images.unsplash.com/photo-1499750310159-5b5f8ca473aa?w=800&auto=format&fit=crop', // Desk
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop', // Typing
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop', // Workspace
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop', // Blog
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop', // Focus
      'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&auto=format&fit=crop', // Notebook
    ];

    const idSum = blog.id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return placeholders[idSum % placeholders.length];
  };

  const getReadTime = (text?: string) => {
    if (!text) return '1 min';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
  };

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

          {/* Navigation Tabs - Enhanced Colors */}
          <div className="flex items-center gap-2 mt-4 border-b border-gray-200 pb-1">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'latest'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
            >
              <Clock className="w-4 h-4" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'trending'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${sortBy === 'top'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
            >
              <Award className="w-4 h-4" />
              Top Rated
            </button>

            {/* Filter Button */}
            <div ref={filterRef} className="relative ml-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${(selectedCategory !== 'All')
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Category Filter - Full List */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Type</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-3 rounded-lg text-base font-semibold transition-all whitespace-nowrap ${selectedCategory === category
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                            }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {selectedCategory !== 'All' && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                        }}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-base font-semibold"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards Panel - Restored Original Style */}
        {canUpload(user) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleUploadClick('blog')}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/20 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Upload New Blog</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Share your thoughts</p>
            </button>

            <button
              onClick={handleInteractiveClick}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-600 transition-all group text-center shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Start writing</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Create a new article</p>
            </button>
          </div>
        )}

        {/* Article Count */}
        <div className="text-sm text-gray-600 mb-4 pb-2 border-b border-gray-200">
          Showing <span className="font-semibold">{sortedBlogs.length}</span> article{sortedBlogs.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && <span> in <span className="text-indigo-600">{selectedCategory}</span></span>}
        </div>

        {/* Blog List - Modern Horizontal Cards */}
        <div className="space-y-4">
          {sortedBlogs.map((blog: any) => (
            <article
              key={blog.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg hover:border-indigo-300 transition-all duration-300 h-48 md:h-56"
            >
              {/* Thumbnail - Cover Left Side */}
              <div className="relative w-full md:w-64 h-48 flex-shrink-0 bg-gray-100 overflow-hidden">
                <img
                  src={getImageUrl(blog)}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-lg">
                    {getBlogCategory(blog)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-7 flex flex-col justify-between overflow-hidden">
                <div className="overflow-hidden">
                  {/* Title */}
                  <Link
                    to={`/blogs/${blog.id}`}
                    className="block text-xl md:text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-2 leading-tight"
                  >
                    {blog.title}
                  </Link>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                      <User className="w-3 h-3" />
                      {blog.authorName}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {blog.uploadDate.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Description - Fixed Lines */}
                  <p className="text-sm md:text-base text-gray-700 line-clamp-3 leading-relaxed">
                    {blog.description || 'A blog article from the UIU Talent Showcase community.'}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center gap-8 text-base md:text-lg">
                    {user && ['viewer', 'admin'].includes(user.role) && user.id !== blog.authorId ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          votePost(blog.id);
                        }}
                        className={`flex items-center gap-2 font-bold transition-colors hover:text-red-600 ${blog.hasVoted ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        <Heart className={`w-6 h-6 ${blog.hasVoted ? 'fill-current text-red-600' : ''}`} />
                        <span>{blog.votes ?? 0}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 font-bold text-gray-600">
                        <Heart className="w-6 h-6" />
                        <span>{blog.votes ?? 0}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-2 font-bold text-gray-600">
                      <Eye className="w-6 h-6" />
                      <span>{blog.views.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="min-w-[140px] px-6 py-3 text-base md:text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-center"
                    >
                      Read more
                    </Link>

                    {user?.role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this blog?')) {
                            deletePost(blog.id);
                          }
                        }}
                        className="p-3 text-gray-400 hover:text-white hover:bg-red-600 rounded-lg transition-all border-2 border-gray-300 hover:border-red-600"
                        title="Delete article"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {sortedBlogs.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No articles found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or check back later.</p>
          </div>
        )}

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

      {/* Sidebar */}
      <div className="lg:col-span-1">
        {/* Leaderboard - Keep Original */}
        <PortalLeaderboard portalType="blog" />
      </div>
    </div>
  );
}
