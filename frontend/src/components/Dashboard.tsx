import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';
import { RoleBadge } from './auth/RoleBadge';
import { hasRole } from '../utils/permissions';
import { LayoutDashboard, Upload, Users, FileText, Trash2, Activity, TrendingUp, Heart, Video, Mic, BookOpen, Eye, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreatorSearch } from './CreatorSearch';
import { api } from '../services/api';
import { Post } from '../types/auth';

export function Dashboard() {
    const { user } = useAuth();
    const { posts, deletePost } = usePosts();
    const navigate = useNavigate();

    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [myLoading, setMyLoading] = useState<boolean>(false);
    const [myError, setMyError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ post: Post } | null>(null);

    if (!user) return null;

    const isAdmin = hasRole(user, 'admin');

    // Fetch only the logged-in creator's content with backend ownership validation
    useEffect(() => {
        if (!user || isAdmin) return;

        const mapPost = (p: any): Post => {
            const voteScore = p.voteScore !== undefined ? p.voteScore : (p.votes ?? 0) * 10;
            return {
                ...p,
                uploadDate: new Date(p.uploadDate),
                rating: p.votes ?? 0,
                votes: p.votes ?? 0,
                voteScore,
                hasVoted: Boolean(p.hasVoted ?? p.has_voted),
            };
        };

        setMyLoading(true);
        setMyError(null);

        api.posts.listMine()
            .then((data) => {
                if (Array.isArray(data)) {
                    const mapped = data
                        .map(mapPost)
                        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
                    setMyPosts(mapped);
                } else {
                    // Fallback to locally filtered posts if response unexpected
                    const fallback = posts
                        .filter(post => String(post.authorId) === String(user.id))
                        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
                    setMyPosts(fallback);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch creator posts', err);
                setMyError('Unable to load your content right now. Please try again.');
                const fallback = posts
                    .filter(post => String(post.authorId) === String(user.id))
                    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
                setMyPosts(fallback);
            })
            .finally(() => setMyLoading(false));
    }, [user, isAdmin, posts]);

    const handleOpenPost = (post: Post) => {
        const viewPath = post.type === 'video'
            ? `/video/${post.id}`
            : post.type === 'audio'
                ? `/audio/${post.id}`
                : `/blogs/${post.id}`;
        navigate(viewPath);
    };

    const handleDeleteClick = (post: Post, event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setDeleteConfirmModal({ post });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmModal) return;
        const post = deleteConfirmModal.post;

        try {
            setDeletingId(post.id);
            await deletePost(post.id);
            setMyPosts(prev => prev.filter(p => p.id !== post.id));
            setDeleteConfirmModal(null);
        } catch (error) {
            console.error('Failed to delete post', error);
            alert('Failed to delete this post. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmModal(null);
    };

    const typeMeta = {
        video: { label: 'Video', icon: Video, badge: 'bg-orange-100 text-orange-700' },
        audio: { label: 'Audio', icon: Mic, badge: 'bg-teal-100 text-teal-700' },
        blog: { label: 'Blog', icon: BookOpen, badge: 'bg-indigo-100 text-indigo-700' },
    } as const;

    const statusMeta = {
        approved: { label: 'Approved', badge: 'bg-green-100 text-green-700' },
        pending: { label: 'Pending', badge: 'bg-yellow-100 text-yellow-700' },
        rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700' },
    } as const;

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-orange-500" />
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Current Role:</span>
                    <RoleBadge role={user.role} size="lg" showLabel />
                </div>
            </motion.div>

            {/* Search Section - Available for all roles */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CreatorSearch
                    placeholder={isAdmin ? "Search viewers and creators" : "Search creators"}
                />
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {isAdmin ? (
                    <>
                        <StatCard
                            title="Total Posts"
                            value={`${posts.length}`}
                            icon={FileText}
                            color="bg-orange-500"
                        />
                        <StatCard
                            title="Pending Posts"
                            value={`${posts.filter(p => p.status === 'pending').length}`}
                            icon={Activity}
                            color="bg-yellow-500"
                        />
                        <StatCard
                            title="Approved Posts"
                            value={`${posts.filter(p => p.status === 'approved').length}`}
                            icon={FileText}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Total Views"
                            value={`${posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}`}
                            icon={TrendingUp}
                            color="bg-blue-500"
                        />
                    </>
                ) : (
                    <>
                        <StatCard title="My Uploads" value={`${myPosts.length}`} icon={Upload} color="bg-blue-500" />
                        <StatCard title="Total Views" value={`${myPosts.reduce((sum, post) => sum + (post.views || 0), 0).toLocaleString()}`} icon={TrendingUp} color="bg-orange-500" />
                        <StatCard title="Total Votes" value={`${myPosts.reduce((sum, post) => sum + (post.votes || 0), 0)}`} icon={Heart} color="bg-red-500" />
                        <StatCard
                            title="Approved"
                            value={`${myPosts.filter(p => p.status === 'approved').length}`}
                            icon={FileText}
                            color="bg-green-500"
                        />
                    </>
                )}
            </motion.div>

            {/* Action Center - Only for Non-Viewers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/video')}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-black rounded-xl hover:bg-orange-100 transition-colors font-medium"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Content
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/garbage')}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                        >
                            <Trash2 className="w-5 h-5" />
                            Manage Garbage Bin
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                    >
                        <Users className="w-5 h-5" />
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            {/* Creator Content */}
            {!isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My Content</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {myLoading ? (
                            <div className="p-6 text-center text-gray-500">Loading your content...</div>
                        ) : myError ? (
                            <div className="p-6 text-center text-red-600">{myError}</div>
                        ) : myPosts.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No uploads yet. Share your first post to see it here.
                            </div>
                        ) : (
                            myPosts.map((post) => {
                                const type = typeMeta[post.type];
                                const status = statusMeta[post.status];
                                const TypeIcon = type.icon;

                                return (
                                    <div
                                        key={post.id}
                                        role="button"
                                        onClick={() => handleOpenPost(post)}
                                        className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {type.label} • {new Date(post.uploadDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${type.badge}`}>{type.label}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>{status.label}</span>
                                                <span className="text-xs text-gray-500">{post.views.toLocaleString()} views</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOpenPost(post);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={(event) => handleDeleteClick(post, event)}
                                                    disabled={deletingId === post.id}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border transition-colors ${deletingId === post.id ? 'bg-red-100 text-red-400 border-red-100 cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {deletingId === post.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            )}

            {/* Admin Content Management - Shows ALL posts */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">All Content</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
                        {posts.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No content uploaded yet.
                            </div>
                        ) : (
                            posts
                                .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
                                .map((post) => {
                                    const type = typeMeta[post.type];
                                    const status = statusMeta[post.status];
                                    const TypeIcon = type.icon;

                                    return (
                                        <div
                                            key={post.id}
                                            role="button"
                                            onClick={() => handleOpenPost(post)}
                                            className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                    <TypeIcon className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                                                    <div className="text-xs text-gray-500">
                                                        by {post.authorName} • {type.label} • {new Date(post.uploadDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${type.badge}`}>{type.label}</span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>{status.label}</span>
                                                    <span className="text-xs text-gray-500">{post.views.toLocaleString()} views</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenPost(post);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={(event) => handleDeleteClick(post, event)}
                                                        disabled={deletingId === post.id}
                                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border transition-colors ${deletingId === post.id ? 'bg-red-100 text-red-400 border-red-100 cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        {deletingId === post.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100"
                    >
                        {/* Header */}
                        <div className="bg-red-50/50 border-b border-red-100 p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Delete Content?</h3>
                                <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
                            </div>
                            <button
                                onClick={cancelDelete}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">You are about to permanently delete:</p>
                                <p className="text-base font-semibold text-gray-900 break-words">{deleteConfirmModal.post.title}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Type: <span className="font-medium">{deleteConfirmModal.post.type}</span>
                                </p>
                            </div>
                            <p className="text-sm text-gray-600">
                                The post and all associated media files will be permanently removed from the server. Are you absolutely sure?
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 grid grid-cols-2 gap-4">
                            <button
                                onClick={cancelDelete}
                                style={{ backgroundColor: '#16a34a', color: 'white' }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] hover:opacity-90"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deletingId === deleteConfirmModal.post.id}
                                style={{
                                    backgroundColor: deletingId === deleteConfirmModal.post.id ? '#f87171' : '#dc2626',
                                    color: 'white'
                                }}
                                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] ${deletingId === deleteConfirmModal.post.id ? 'cursor-not-allowed opacity-70' : 'hover:opacity-90'
                                    }`}
                            >
                                {deletingId === deleteConfirmModal.post.id ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        <span>Yes, Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
