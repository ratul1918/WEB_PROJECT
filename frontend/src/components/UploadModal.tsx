import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Check, AlertCircle, FileText, Video, Mic, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'video' | 'audio' | 'blog';
}

export function UploadModal({ isOpen, onClose, initialType = 'video' }: UploadModalProps) {
    const { user } = useAuth();
    const { addPost } = usePosts();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [duration, setDuration] = useState('');
    const [type, setType] = useState(initialType);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [category, setCategory] = useState('General');

    const categories = ['Tech', 'Education', 'Motivation', 'Lifestyle', 'News', 'Poems', 'Story Writing', 'General'];
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Theme mapping
    const themeStyles = {
        video: {
            text: 'text-orange-600',
            icon: 'text-orange-500',
            bg: 'bg-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-900/20',
            bgIcon: 'bg-orange-100 dark:bg-orange-900/40',
            border: 'border-orange-500',
            ring: 'focus:ring-orange-500',
            shadow: 'shadow-orange-500/30',
            hover: 'hover:bg-orange-700',
            hoverBorder: 'hover:border-orange-300'
        },
        audio: {
            text: 'text-teal-600',
            icon: 'text-teal-500',
            bg: 'bg-teal-600',
            bgLight: 'bg-teal-50 dark:bg-teal-900/20',
            bgIcon: 'bg-teal-100 dark:bg-teal-900/40',
            border: 'border-teal-500',
            ring: 'focus:ring-teal-500',
            shadow: 'shadow-teal-500/30',
            hover: 'hover:bg-teal-700',
            hoverBorder: 'hover:border-teal-300'
        },
        blog: {
            text: 'text-indigo-600',
            icon: 'text-indigo-500',
            bg: 'bg-indigo-600',
            bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
            bgIcon: 'bg-indigo-100 dark:bg-indigo-900/40',
            border: 'border-indigo-500',
            ring: 'focus:ring-indigo-500',
            shadow: 'shadow-indigo-500/30',
            hover: 'hover:bg-indigo-700',
            hoverBorder: 'hover:border-indigo-300'
        }
    };

    const s = themeStyles[type];

    // File size limits (in MB)
    const fileSizeLimits = {
        video: 500, // 500 MB
        audio: 100, // 100 MB
        blog: 50    // 50 MB
    };

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setType(initialType);
            setTitle('');
            setDescription('');
            setDuration('');
            setFile(null);
            setThumbnailFile(null);
            setThumbnailPreview(null);
            setSuccess(false);
            setIsSubmitting(false);
            setError(null);
        }
    }, [isOpen, initialType]);

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root') || document.body;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !file) return;

        // Validate thumbnail is required for video/audio
        if ((type === 'video' || type === 'audio') && !thumbnailFile) {
            setError('Thumbnail image is required for video and audio uploads.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await addPost({
                title,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role,
                type,
                description,
                duration,
                file: file,
                thumbnail: thumbnailFile || undefined
            });

            setIsSubmitting(false);
            setSuccess(true);

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Failed to upload", error);
            setIsSubmitting(false);
            setError(error.message || "Failed to upload post. Please try again.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;

        // Validate file size
        if (selectedFile) {
            const maxSize = fileSizeLimits[type] * 1024 * 1024; // Convert to bytes
            if (selectedFile.size > maxSize) {
                setError(`File size exceeds ${fileSizeLimits[type]} MB limit for ${type} files. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB.`);
                e.target.value = ''; // Clear the file input
                setFile(null);
                return;
            }
            setError(null); // Clear previous errors
        }

        setFile(selectedFile);

        if (selectedFile && (type === 'video' || type === 'audio')) {
            const url = URL.createObjectURL(selectedFile);
            const media = document.createElement(type === 'video' ? 'video' : 'audio');
            media.preload = 'metadata';
            media.src = url;

            const handleMetadata = () => {
                if (media.duration && !isNaN(media.duration) && media.duration !== Infinity) {
                    const minutes = Math.floor(media.duration / 60);
                    const seconds = Math.floor(media.duration % 60);
                    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    setDuration(formatted);
                }
                URL.revokeObjectURL(url);
            };

            media.onloadedmetadata = handleMetadata;

            // Fallback for some browsers that require explicit load
            setTimeout(() => {
                media.load();
            }, 100);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;

        if (selectedFile) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(selectedFile.type.toLowerCase())) {
                setError('Thumbnail must be a JPG, PNG, or WEBP image.');
                e.target.value = '';
                setThumbnailFile(null);
                setThumbnailPreview(null);
                return;
            }

            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('Thumbnail size exceeds 10 MB limit.');
                e.target.value = '';
                setThumbnailFile(null);
                setThumbnailPreview(null);
                return;
            }

            setError(null);
            setThumbnailFile(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setThumbnailFile(null);
            setThumbnailPreview(null);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999
            }}
        >
            <div
                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in fade-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Upload className={`w-5 h-5 ${s.icon}`} />
                        Submit New {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Request Submitted!</h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Your post has been sent to the admin for approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Type Selection - Horizontal Icon Grid */}
                            <div className="flex items-center gap-4 justify-center py-2">
                                {[
                                    { id: 'video', icon: Video, label: 'Video' },
                                    { id: 'audio', icon: Mic, label: 'Audio' },
                                    { id: 'blog', icon: FileText, label: 'Blog' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setType(item.id as any)}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 w-28 rounded-lg transition-all duration-200 group ${type === item.id
                                            ? `${s.bgLight} ${s.text} shadow-md transform scale-105`
                                            : `bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800`
                                            }`}
                                    >
                                        <div className="p-1.5 transition-colors">
                                            <item.icon className={`w-8 h-8 ${type === item.id ? s.text : `text-zinc-400 group-hover:${themeStyles[item.id as keyof typeof themeStyles].text}`}`} />
                                        </div>
                                        <span className={`font-bold text-sm ${type === item.id ? s.text : 'text-zinc-500'}`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter a catchy title..."
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all min-h-[100px]`}
                                    placeholder="What is this content about?"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Upload {type === 'blog' ? 'Header Image' : 'Media File'}
                                    <span className="text-xs text-zinc-500 ml-2 font-normal">(Max: {fileSizeLimits[type]} MB)</span>
                                </label>
                                <input
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                    accept={type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*'}
                                />
                                {file && (
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            {/* Duration (Conditional) */}
                            {(type === 'video' || type === 'audio') && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Duration (MM:SS)</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                        placeholder="e.g. 05:30"
                                    />
                                </div>
                            )}

                            {type === 'blog' && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Thumbnail Upload (Required for Video/Audio) */}
                            {(type === 'video' || type === 'audio') && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Thumbnail Image <span className="text-red-500">*</span>
                                        <span className="text-xs text-zinc-500 ml-2 font-normal">(JPG, PNG, WEBP - Max: 10 MB)</span>
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg p-3 transition-all ${thumbnailFile ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'}`}>
                                        {thumbnailPreview ? (
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-green-600 dark:text-green-400 truncate">
                                                        {thumbnailFile?.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {((thumbnailFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setThumbnailFile(null);
                                                        setThumbnailPreview(null);
                                                    }}
                                                    className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block">
                                                <div className="flex items-center justify-center gap-2 py-2">
                                                    <Image className={`w-6 h-6 ${s.icon}`} />
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Click to upload thumbnail</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={handleThumbnailChange}
                                                    className="hidden"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Info Note */}
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>
                                    Your post will be reviewed by an admin before it becomes visible on the platform.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !file}
                                className={`w-full py-2 font-bold transition-all transform rounded-lg active:scale-90 ${isSubmitting || !file
                                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                    : `text-black ${s.bgLight} hover:scale-[1.02]`
                                    }`}
                            >
                                {isSubmitting ? 'Uploading...' : 'Submit for Approval'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
}
