import { useEffect, useMemo, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Video, Mic, BookOpen, Award, Heart, Linkedin, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './auth/RoleBadge';
import { api } from '../services/api';
import { Post, UserRole } from '../types/auth';
import { buildMediaUrl } from '../utils/media';
import { EditProfileModal } from './EditProfileModal';

interface CreatorProfileInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  joinDate?: string | null;
}

interface LikedPost extends Post { }

export function Profile() {
  const { id: paramId } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const creatorId = paramId || user?.id || '';

  const [creator, setCreator] = useState<CreatorProfileInfo | null>(null);
  const [creatorPosts, setCreatorPosts] = useState<Post[]>([]);
  const [likedContent, setLikedContent] = useState<LikedPost[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState({ totalLikes: 0, totalItemsLiked: 0, totalViewsGiven: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadCreator = async () => {
      if (!creatorId) {
        setError('Creator not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [creatorData, postsData] = await Promise.all([
          api.users.getCreator(creatorId),
          api.posts.listByAuthor(creatorId)
        ]);

        setCreator({
          id: creatorData.id,
          name: creatorData.name,
          email: creatorData.email,
          role: creatorData.role as UserRole,
          bio: creatorData.bio,
          avatar: creatorData.avatar,
          social_links: creatorData.social_links,
          joinDate: creatorData.joinDate || creatorData.created_at || null,
        });

        console.log('Creator loaded - Role:', creatorData.role, 'ID:', creatorData.id);

        const mappedPosts = Array.isArray(postsData) ? postsData.map((p: any) => ({
          ...p,
          uploadDate: new Date(p.uploadDate),
          rating: p.votes ?? 0,
          voteScore: p.voteScore !== undefined ? p.voteScore : (p.votes || 0) * 10,
        })) : [];
        setCreatorPosts(mappedPosts);

        // For viewers, fetch liked content
        if (creatorData.role === 'viewer') {
          try {
            console.log('Fetching liked content for viewer:', creatorId);
            const likedData = await api.users.getLikedContent(creatorId);
            console.log('Liked content response:', likedData);

            const mappedLiked = (likedData.liked_posts || []).map((p: any) => ({
              ...p,
              uploadDate: new Date(p.uploadDate),
              rating: p.votes ?? 0,
              voteScore: (p.votes || 0) * 10,
            }));

            console.log('Mapped liked posts:', mappedLiked);
            console.log('Engagement metrics:', {
              totalLikes: likedData.total_likes,
              totalItemsLiked: likedData.total_items_liked,
              totalViewsGiven: likedData.total_views_given
            });

            setLikedContent(mappedLiked);
            setEngagementMetrics({
              totalLikes: likedData.total_likes || 0,
              totalItemsLiked: likedData.total_items_liked || 0,
              totalViewsGiven: likedData.total_views_given || 0
            });
          } catch (err) {
            console.error('Failed to load liked content:', err);
          }
        }
      } catch (err: any) {
        console.error('Failed to load creator profile', err);
        setError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    loadCreator();
  }, [creatorId, refreshTrigger]);

  const stats = useMemo(() => {
    const totalVotes = creatorPosts.reduce((sum, p) => sum + (p.votes || 0), 0);
    const totalScore = totalVotes * 10;
    const avgRating = creatorPosts.length ? (totalVotes / creatorPosts.length) : 0;
    const videoCount = creatorPosts.filter(p => p.type === 'video').length;
    const audioCount = creatorPosts.filter(p => p.type === 'audio').length;
    const blogCount = creatorPosts.filter(p => p.type === 'blog').length;
    const totalViews = creatorPosts.reduce((sum, p) => sum + (p.views || 0), 0);

    return { totalVotes, totalScore, avgRating, videoCount, audioCount, blogCount, totalViews };
  }, [creatorPosts]);

  const renderContentSection = (type: Post['type'], title: string, icon: ReactNode) => {
    const filtered = creatorPosts.filter(p => p.type === type);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">{filtered.length} items</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-500">No content uploaded yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/${post.type === 'blog' ? 'blogs' : post.type}/${post.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.uploadDate.toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" /> {post.votes ?? 0} likes
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading creator profile...</div>;
  }

  if (error || !creator) {
    return <div className="text-center text-red-600">{error || 'Creator not found'}</div>;
  }

  const joinDateText = creator.joinDate ? new Date(creator.joinDate).toLocaleDateString() : 'N/A';
  const avatarUrl = creator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random&size=256`;
  const isViewer = creator.role === 'viewer';

  // Render Social Link Helper
  const renderSocialLinks = () => {
    if (!creator.social_links) return null;
    const { facebook, twitter, instagram, linkedin, website } = creator.social_links;
    const links = [];

    if (facebook) links.push({ url: facebook, icon: <Facebook className="w-4 h-4" />, color: "text-blue-600" });
    if (twitter) links.push({ url: twitter, icon: <Twitter className="w-4 h-4" />, color: "text-sky-500" });
    if (instagram) links.push({ url: instagram, icon: <Instagram className="w-4 h-4" />, color: "text-pink-600" });
    if (linkedin) links.push({ url: linkedin, icon: <Linkedin className="w-4 h-4" />, color: "text-blue-700" });
    if (website) links.push({ url: website, icon: <Globe className="w-4 h-4" />, color: "text-gray-600" });

    if (links.length === 0) return null;

    return (
      <div className="flex items-center gap-3 mt-3">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors ${link.color}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6 border-t-4 border-orange-500">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt={creator.name}
            className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-orange-100"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <h1 className="font-heading text-4xl font-bold text-gray-900 tracking-tight">{creator.name}</h1>
              <RoleBadge role={creator.role || 'viewer'} />
            </div>

            {creator.bio && (
              <p className="text-gray-600 mb-3 max-w-2xl leading-relaxed">{creator.bio}</p>
            )}

            {!creator.bio && (
              <p className="text-sm text-muted-foreground mb-4">{creator.email}</p>
            )}

            {renderSocialLinks()}

            <div className="flex flex-wrap items-center gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
              {isViewer ? (
                <>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="font-mono font-semibold text-gray-900">{engagementMetrics.totalLikes}</span>
                    <span className="text-muted-foreground">total likes</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="font-mono font-semibold text-gray-900">{stats.avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">avg likes/post</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span className="font-mono font-bold text-gray-900">{stats.totalScore.toLocaleString()}</span>
                    <span className="text-muted-foreground">score</span>
                  </div>
                </>
              )}
              <span className="text-muted-foreground ml-auto">Member since {joinDateText}</span>
            </div>
          </div>

          {/* Edit Button for own profile - works for all roles */}
          {user && String(user.id) === String(creator.id) && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors bg-gradient-to-r from-orange-500 to-orange-600 shadow-md hover:shadow-lg active:scale-95 transform duration-150"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Linked Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setRefreshTrigger(prev => prev + 1); // Trigger re-fetch
        }}
        currentUser={creator}
      />

      {/* Liked Content Section (viewers only) */}
      {isViewer && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Liked Content</h2>
              <p className="text-sm text-gray-600">{engagementMetrics.totalLikes} total likes • {likedContent.length} items liked</p>
            </div>
          </div>

          {likedContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No liked content yet</p>
              <p className="text-gray-400 text-sm">Start liking content to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedContent.map((post) => {
                const getTypeIcon = () => {
                  switch (post.type) {
                    case 'video': return <Video className="w-4 h-4" />;
                    case 'audio': return <Mic className="w-4 h-4" />;
                    case 'blog': return <BookOpen className="w-4 h-4" />;
                    default: return <Star className="w-4 h-4" />;
                  }
                };

                const getTypeColor = () => {
                  switch (post.type) {
                    case 'video': return 'bg-orange-100 text-orange-700';
                    case 'audio': return 'bg-teal-100 text-teal-700';
                    case 'blog': return 'bg-indigo-100 text-indigo-700';
                    default: return 'bg-gray-100 text-gray-700';
                  }
                };

                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/${post.type === 'blog' ? 'blogs' : post.type}/${post.id}`)}
                    className="group cursor-pointer bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-red-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 overflow-hidden">
                      <img
                        src={post.thumbnail ? buildMediaUrl(post.thumbnail) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getTypeColor()}`}>
                          {getTypeIcon()}
                          <span className="capitalize">{post.type}</span>
                        </span>
                      </div>

                      {/* Liked Heart */}
                      <div className="absolute top-2 right-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">By {post.authorName}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{post.uploadDate.toLocaleDateString()}</span>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Star className="w-3 h-3 text-orange-500" />
                          <span className="font-semibold">{post.votes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submission Stats (creators only) */}
      {!isViewer && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-gray-900">{stats.videoCount}</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Video Posts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-gray-900">{stats.audioCount}</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Audio Posts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-gray-900">{stats.blogCount}</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Blog Posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {renderContentSection('video', 'Videos', <Video className="w-5 h-5 text-orange-500" />)}
            {renderContentSection('audio', 'Audios', <Mic className="w-5 h-5 text-orange-500" />)}
            {renderContentSection('blog', 'Blogs', <BookOpen className="w-5 h-5 text-orange-500" />)}
          </div>
        </>
      )}
    </div>
  );
}
