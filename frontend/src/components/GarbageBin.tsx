import { useState } from 'react';
import { Trash2, RotateCcw, X, Video, Mic, FileText, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasRole } from '../utils/permissions';
import { usePosts } from '../contexts/PostContext';
import { buildMediaUrl } from '../utils/media';

export function GarbageBin() {
  const { user } = useAuth();
  const { posts, approvePost, deletePost } = usePosts();

  if (!hasRole(user, 'admin')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-12 shadow-md border-t-4 border-red-500 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600">You do not have permission to access the Garbage Bin. This area is reserved for administrators only.</p>
        </div>
      </div>
    );
  }

  const deletedPosts = posts.filter(p => p.status === 'rejected');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleRestore = async (id: string) => {
    await approvePost(id);
    alert(`Post restored successfully!`);
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      await deletePost(id);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === deletedPosts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(deletedPosts.map(post => post.id));
    }
  };

  const handleBulkRestore = async () => {
    for (const id of selectedItems) {
      await approvePost(id);
    }
    setSelectedItems([]);
    alert(`${selectedItems.length} posts restored successfully!`);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete ${selectedItems.length} posts? This action cannot be undone.`)) {
      for (const id of selectedItems) {
        await deletePost(id);
      }
      setSelectedItems([]);
    }
  };

  const confirmBulkRestore = () => {
    if (confirm(`Restore ${selectedItems.length} post${selectedItems.length !== 1 ? 's' : ''}? They will be re-published.`)) {
      handleBulkRestore();
    }
  };

  const confirmBulkDelete = () => {
    if (confirm(`Permanently delete ${selectedItems.length} post${selectedItems.length !== 1 ? 's' : ''}? This cannot be undone.`)) {
      handleBulkDelete();
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-orange-600" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-orange-700" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-orange-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      video: 'bg-orange-100 text-orange-700',
      audio: 'bg-orange-200 text-orange-800',
      blog: 'bg-orange-50 text-orange-600',
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getImageUrl = (post: any) => {
    const path = post.thumbnail;

    // If we have a custom thumbnail from uploads/thumbnails/, use it
    if (path && path.includes('uploads/thumbnails/')) {
      return buildMediaUrl(path);
    }

    // If thumbnail is an actual image file, use it
    if (path && path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return buildMediaUrl(path);
    }

    // Fallback placeholders based on type
    const placeholders = {
      video: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&auto=format&fit=crop',
      audio: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&auto=format&fit=crop',
      blog: 'https://images.unsplash.com/photo-1499750310159-5254f4125c48?w=400&auto=format&fit=crop'
    };

    return placeholders[post.type as keyof typeof placeholders] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-5 border-t-4 border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Garbage Bin</h1>
              <p className="text-gray-600 text-sm">Moderation Panel</p>
            </div>
          </div>

          {/* Bulk Actions (Only visible when items selected) */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4 self-start md:self-center">
              <span className="text-black font-semibold text-sm">{selectedItems.length} selected</span>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkRestore}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-black rounded-md hover:bg-orange-600 transition-colors text-sm font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-black rounded-md hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex items-start gap-3 mt-4">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-orange-900 font-semibold text-sm mb-1">Content Moderation</div>
            <p className="text-orange-700 text-xs md:text-sm">Posts removed for violating guidelines. Restore to re-publish or permanently delete.</p>
          </div>
        </div>
      </div>

      {/* Select All */}
      {deletedPosts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 shadow-sm mb-4 flex items-center border border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.length === deletedPosts.length}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-700 font-medium select-none text-sm">Select All ({deletedPosts.length} {deletedPosts.length === 1 ? 'item' : 'items'})</span>
          </label>
        </div>
      )}

      {/* Deleted Posts List */}
      {deletedPosts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-md text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-60">
          <Trash2 className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-gray-900 text-xl font-bold mb-2">Garbage Bin is Empty</h2>
          <p className="text-gray-500">No rejected posts to display.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deletedPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-lg border transition-all duration-300 ${selectedItems.includes(post.id) ? 'ring-2 ring-orange-500 border-orange-500 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
            >
              <div className="flex items-start gap-3 p-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </div>

                {/* Thumbnail - Square */}
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(post)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeBadge(post.type)}`}>
                      {getTypeIcon(post.type)}
                      <span className="capitalize">{post.type}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                  <p className="text-gray-700 text-xs">By <span className="font-semibold">{post.authorName}</span></p>
                  <div className="flex items-center gap-1 text-red-700 text-xs font-medium bg-red-50 inline-flex px-1.5 py-0.5 rounded border border-red-200 mt-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>Rejected</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(post.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 text-black rounded-md hover:bg-orange-600 transition-colors text-sm font-semibold whitespace-nowrap shadow-sm"
                    title="Restore Post"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(post.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 text-black rounded-md hover:bg-red-600 transition-colors text-sm font-semibold whitespace-nowrap shadow-sm"
                    title="Permanent Delete"
                  >
                    <X className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
