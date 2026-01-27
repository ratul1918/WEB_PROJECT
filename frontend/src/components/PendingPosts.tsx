import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, Mic, BookOpen, Check, X, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { buildMediaUrl } from '../utils/media';

export function PendingPosts() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { posts, approvePost, rejectPost } = usePosts();
    const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'blog'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Redirect if not admin
    if (!user || user.role !== 'admin') {
        navigate('/');
        return null;
    }

    // Get pending posts
    const pendingPosts = posts.filter(p => p.status === 'pending');

    // Filter by type
    const filteredPosts = filterType === 'all'
        ? pendingPosts
        : pendingPosts.filter(p => p.type === filterType);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'audio': return Mic;
            case 'blog': return BookOpen;
            default: return Clock;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'video': return 'text-orange-600 bg-orange-100';
            case 'audio': return 'text-teal-600 bg-teal-100';
            case 'blog': return 'text-indigo-600 bg-indigo-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleApprove = (id: string) => {
        approvePost(id);
    };

    const handleReject = (id: string) => {
        rejectPost(id);
    };

    const getImageUrl = (post: any) => {
        const path = post.thumbnail;

        // If no thumbnail, use type-based placeholders
        if (!path) {
            if (post.type === 'audio') {
                return 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&auto=format&fit=crop';
            }
            if (post.type === 'video') {
                return 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop';
            }
            return 'https://images.unsplash.com/photo-1499750310159-5254f4125c48?w=800&auto=format&fit=crop';
        }

        // If thumbnail is an image (uploaded thumbnail), use it directly
        if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const url = buildMediaUrl(path);
            return url;
        }

        // If thumbnail points to media file, use type-based placeholders
        if (path.match(/\.(mp3|wav|flac|aac|ogg|wma)$/i) || post.type === 'audio') {
            return 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&auto=format&fit=crop';
        }
        if (path.match(/\.(mp4|mov|avi|webm|mkv)$/i) || post.type === 'video') {
            return 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop';
        }

        return buildMediaUrl(path);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl mb-8 border border-white/50 relative overflow-visible z-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform rotate-3">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-heading">Pending Approvals</h1>
                            <p className="text-gray-600 font-medium">Review community submissions</p>
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative z-50">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold border-2 whitespace-nowrap text-sm ${filterType !== 'all'
                                ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {filterType === 'all' ? 'Filter' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] min-w-max pointer-events-auto overflow-hidden">
                                <div className="max-h-64 overflow-y-auto">
                                    {['all', 'video', 'audio', 'blog'].map((type, index) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setFilterType(type as any);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left transition-all font-medium text-sm flex items-center justify-between hover:bg-gray-100 ${filterType === type
                                                ? 'bg-yellow-50 text-yellow-700'
                                                : 'text-gray-700'
                                                } ${index < 3 ? 'border-b border-gray-100' : ''}`}
                                        >
                                            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                            {filterType === type && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Total Pending', value: pendingPosts.length, color: 'yellow' },
                        { label: 'Videos', value: pendingPosts.filter(p => p.type === 'video').length, color: 'orange' },
                        { label: 'Audio', value: pendingPosts.filter(p => p.type === 'audio').length, color: 'teal' },
                        { label: 'Blogs', value: pendingPosts.filter(p => p.type === 'blog').length, color: 'indigo' },
                    ].map((stat) => (
                        <div key={stat.label} className={`bg-${stat.color}-50/50 rounded-2xl p-4 border border-${stat.color}-100 backdrop-blur-sm`}>
                            <div className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</div>
                            <div className={`text-sm text-${stat.color}-600 font-medium`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Posts List - Scrollable Container */}
            <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredPosts.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 md:p-16 shadow-lg border border-white/50 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">All Caught Up!</h3>
                        <p className="text-gray-500 text-base sm:text-lg text-center max-w-md">No pending posts to review at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {filteredPosts.map((post) => {
                            const TypeIcon = getTypeIcon(post.type);
                            const typeColor = getTypeColor(post.type);

                            return (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row gap-4 p-4">
                                        {/* Thumbnail Container - Fixed dimensions */}
                                        <div className="flex-shrink-0 w-full md:w-64 h-36 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative group">
                                            <img
                                                src={getImageUrl(post)}
                                                alt={post.title}
                                                className="w-full h-full object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';
                                                }}
                                            />
                                            {/* Type Badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${typeColor}`}>
                                                    <TypeIcon className="w-3.5 h-3.5" />
                                                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 flex flex-col min-w-0">
                                            {/* Metadata */}
                                            <div className="flex-1 mb-3">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <span className="font-medium text-gray-900">{post.authorName}</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-500">{post.uploadDate.toLocaleDateString()}</span>
                                                </div>
                                                {post.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                        {post.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-5">
                                                <button
                                                    onClick={() => handleApprove(post.id)}
                                                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] hover:opacity-90"
                                                >
                                                    <Check className="w-5 h-5" />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReject(post.id)}
                                                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] hover:opacity-90"
                                                >
                                                    <X className="w-5 h-5" />
                                                    <span>Reject</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}