import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Heart } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { api } from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { useAuth } from '../contexts/AuthContext';

export function BlogReadPage() {
  const { id } = useParams();
  const { posts, votePost, updatePostViews } = usePosts();
  const { user } = useAuth();
  const viewIncrementedRef = useRef<string | null>(null);

  const blog = useMemo(() => {
    if (!id || posts.length === 0) return null;
    return posts.find(p => String(p.id) === String(id) && p.type === 'blog') || null;
  }, [id, posts]);

  useEffect(() => {
    if (!id || !blog) return;
    if (viewIncrementedRef.current === id) return;
    viewIncrementedRef.current = id;

    api.posts.incrementView(id)
      .then(data => {
        updatePostViews(id, data.views);
      })
      .catch(console.error);
  }, [id, blog, updatePostViews]);

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1499750310159-5b5f8ca473aa?w=1600&auto=format&fit=crop';
    return buildMediaUrl(path);
  };

  const getReadTime = (text?: string) => {
    if (!text) return '1 min';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
  };

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Loading blog...</h2>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          <p className="text-gray-500 mb-6 max-w-md">The blog you're looking for doesn't exist or has been removed from our database.</p>
          <Link to="/blogs" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200">
            Return to Blog Portal
          </Link>
        </div>
      </div>
    );
  }

  const content = blog.description || 'No description available for this post.';
  const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      {/* Back Navigation - Simple & Clean */}
      <div className="max-w-[800px] mx-auto px-4 mb-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Blog Portal</span>
        </Link>
      </div>

      {/* Main Content Container - Standard Article Width */}
      <article className="max-w-[800px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-10 md:px-12 md:py-12">

          {/* 1. Title & Header Section */}
          <div className="space-y-6 mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {blog.authorName[0]}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-gray-900 font-semibold">{blog.authorName}</span>
                  <span className="text-xs text-gray-400">Author</span>
                </div>
              </div>
              <span className="hidden sm:block text-gray-300 mx-2">|</span>
              <div className="flex items-center gap-4">
                <span>{new Date(blog.uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-indigo-600 font-medium">{getReadTime(blog.description)} read</span>
              </div>
            </div>
          </div>

          {/* 2. Featured Image - Smaller Size */}
          <div className="mx-auto mb-10 bg-gray-50 border border-gray-100 shadow-sm rounded-xl overflow-hidden flex items-center justify-center" style={{ width: '800px', height: '700px' }}>
            <img
              src={getImageUrl(blog.thumbnail)}
              alt={blog.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 3. Action Bar (Votes) - Top of Content */}
          <div className="flex justify-between items-center border-b border-gray-100 pt-6 pb-8 mb-8 px-4 md:px-6">
            <div className="flex items-center gap-4 pl-2 md:pl-4">
              {user && ['viewer', 'admin'].includes(user.role) && user.id !== blog.authorId ? (
                <button
                  onClick={() => votePost(blog.id)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-200 hover:border-indigo-200"
                  title={blog.hasVoted ? 'Unlike' : 'Like'}
                >
                  <Heart className={`w-6 h-6 transition-colors ${blog.hasVoted ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                  <span className={`text-lg font-bold ${blog.hasVoted ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {blog.votes ?? 0}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 font-medium ml-1">
                  <Heart className="w-6 h-6" />
                  <span className="text-lg">{blog.votes ?? 0} Likes</span>
                </div>
              )}
            </div>
            <div className="text-lg text-gray-400 italic font-medium pr-2 md:pr-4">
              {blog.views.toLocaleString()} views
            </div>
          </div>

          {/* 4. Article Body - Standard Typography */}
          <div className="prose prose-xl prose-slate prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-700 max-w-full w-full text-gray-950 font-bold leading-relaxed px-2 md:px-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={`${blog.id}-paragraph-${index}`} className="mb-6 last:mb-0 text-xl break-words whitespace-normal">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-wrap text-xl break-words">{content}</p>
            )}
          </div>

          {/* Footer Divider */}
          <div className="w-full h-px bg-gray-100 my-12" />

          {/* Simple Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Thanks for reading this post on <span className="font-semibold text-gray-600">UIU Talent Show</span>
            </p>
          </div>

        </div>
      </article>
    </div>
  );
}
