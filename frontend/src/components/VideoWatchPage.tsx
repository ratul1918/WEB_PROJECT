import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, ChevronLeft, Heart } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import { useVideoPlayer } from '../contexts/VideoPlayerContext';
import { api } from '../services/api';
import { buildMediaUrl } from '../utils/media';
import { useAuth } from '../contexts/AuthContext';
import { VideoThumbnail } from './VideoThumbnail';

type QualityOption = '1080p' | '720p' | '480p' | '360p';

export function VideoWatchPage() {
    const { id } = useParams();
    const { posts, updatePostViews, votePost } = usePosts();
    const { user } = useAuth();
    const viewIncrementedRef = useRef<string | null>(null);

    // Derive video directly to avoid first-render null state
    const video = useMemo(() => {
        if (!id || posts.length === 0) return null;
        return posts.find(p => String(p.id) === String(id)) || null;
    }, [id, posts]);

    const videoSurfaceRef = useRef<HTMLDivElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const {
        track,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        loadTrack,
        togglePlay: toggleVideo,
        seek,
        setVolume: setVideoVolume,
        toggleMute: toggleVideoMute,
        setPortalTarget,
        clearPortalTarget,
    } = useVideoPlayer();

    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [currentQuality, setCurrentQuality] = useState<QualityOption>('1080p');
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const qualities: QualityOption[] = ['1080p', '720p', '480p', '360p'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useLayoutEffect(() => {
        const target = videoSurfaceRef.current;
        if (!target) return;
        setPortalTarget(target);
        return () => clearPortalTarget(target);
    }, [setPortalTarget, clearPortalTarget]);

    useEffect(() => {
        if (!video) return;
        if (!track || String(track.id) !== String(video.id)) {
            loadTrack(video, false);
        }
    }, [video, track, loadTrack]);

    // Increment view count on mount
    useEffect(() => {
        if (!id || !video) return;
        if (viewIncrementedRef.current === id) return;
        viewIncrementedRef.current = id;

        // Fire and forget, but update local state on success
        api.posts.incrementView(id).then(data => {
            updatePostViews(id, data.views);
        }).catch(console.error);
    }, [id, video, updatePostViews]);

    useEffect(() => {
        let controlsTimeout: NodeJS.Timeout;

        if (showControls && isPlaying && !isDragging) {
            controlsTimeout = setTimeout(() => setShowControls(false), 3000);
        }

        return () => clearTimeout(controlsTimeout);
    }, [showControls, isPlaying, isDragging]);

    // Force controls to show when paused
    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
        }
    }, [isPlaying]);

    const handleSeek = (e: MouseEvent | React.MouseEvent, element: HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        if (duration > 0) {
            seek(percentage * duration);
        }
    };

    const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent toggling play/pause when clicking timeline
        setIsDragging(true);
        if (progressContainerRef.current) {
            handleSeek(e, progressContainerRef.current);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && progressContainerRef.current) {
                handleSeek(e, progressContainerRef.current);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, duration, seek]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVideoVolume(newVolume);
    };

    // Handle fullscreen changes (ESC key, button, etc.)
    useEffect(() => {
        const handleFullscreenChange = () => {
            // specific check for different browsers
            const isFull = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
            setIsFullscreen(isFull);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // YouTube-style keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                case 'KeyK':
                    e.preventDefault();
                    toggleVideo();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seek(Math.max(0, currentTime - 5));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seek(Math.min(duration, currentTime + 5));
                    break;
                case 'KeyJ':
                    e.preventDefault();
                    seek(Math.max(0, currentTime - 10));
                    break;
                case 'KeyL':
                    e.preventDefault();
                    seek(Math.min(duration, currentTime + 10));
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleVideoMute();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVideoVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVideoVolume(Math.max(0, volume - 0.1));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentTime, duration, volume, toggleVideo, seek, toggleVideoMute, setVideoVolume]);

    const toggleFullscreen = async () => {
        const container = videoSurfaceRef.current?.parentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };

        if (!container) return;

        const doc = document as Document & {
            webkitFullscreenElement?: Element;
            mozFullScreenElement?: Element;
            msFullscreenElement?: Element;
            webkitExitFullscreen?: () => Promise<void>;
            mozCancelFullScreen?: () => Promise<void>;
            msExitFullscreen?: () => Promise<void>;
        };

        const isFull = !!doc.fullscreenElement || !!doc.webkitFullscreenElement || !!doc.mozFullScreenElement || !!doc.msFullscreenElement;

        try {
            if (!isFull) {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    await container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                }
            } else {
                if (doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    await doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    await doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    await doc.msExitFullscreen();
                }
            }
        } catch (err) {
            console.error('Fullscreen toggle failed:', err);
        }
    };

    const skipBackward = () => {
        seek(Math.max(0, currentTime - 10));
    };

    const skipForward = () => {
        seek(Math.min(duration, currentTime + 10));
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Handle loading state
    if (posts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-medium">Loading video...</h2>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-4">Video not found</h2>
                    <p className="text-gray-500 mb-6 max-w-md">The video you're looking for doesn't exist or has been removed from our database.</p>
                    <Link to="/video" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200">
                        Return to Video Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center">
                <Link to="/video" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Portal</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div
                        className="relative bg-black rounded-2xl overflow-hidden group shadow-2xl isolate" // Added isolate for stacking context
                        style={{ aspectRatio: '16 / 9' }}
                        onMouseLeave={() => isPlaying && setShowControls(false)}
                    >
                        {/* Layer 0: Video Surface (Portal Target) */}
                        <div
                            ref={videoSurfaceRef}
                            className="absolute inset-0 z-0"
                        />

                        {/* Layer 1: Event Capture Layer (Transparent) */}
                        {/* This sits ON TOP of the video but BELOW controls. It catches mouse events missed by Portal. */}
                        <div
                            className="absolute inset-0 z-10 cursor-pointer"
                            onClick={toggleVideo}
                            onMouseMove={() => setShowControls(true)}
                            onDoubleClick={toggleFullscreen}
                        />

                        {/* Layer 2: Play Button Overlay */}
                        <div
                            className={`absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all duration-300 z-20 ${!isPlaying && !isDragging ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        >
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleVideo();
                                }}
                                className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-xl shadow-orange-900/40"
                            >
                                <Play className="w-10 h-10 text-white fill-white ml-1" />
                            </button>
                        </div>

                        {/* Layer 3: Top Gradient & Title Overlay */}
                        <div
                            className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 z-30 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <h2 className="text-white text-lg font-bold truncate pr-12 drop-shadow-md">{video.title}</h2>
                        </div>

                        {/* Layer 5: ALWAYS VISIBLE Progress Bar - YouTube style RED fill */}
                        <div
                            className="absolute left-4 right-4 bottom-14 z-50"
                            style={{ pointerEvents: 'auto' }}
                        >
                            {/* Track background - Gray bar */}
                            <div
                                ref={progressContainerRef}
                                className="relative rounded-full cursor-pointer group/progress"
                                onMouseDown={handleProgressMouseDown}
                                style={{
                                    height: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)', /* Semi-transparent white track */
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Progress fill - RED like YouTube, grows with video playback */}
                                <div
                                    className="absolute top-0 left-0 rounded-full"
                                    style={{
                                        width: `${progressPercentage}%`,
                                        height: '100%',
                                        backgroundColor: '#ff0000', /* YouTube RED */
                                        transition: 'width 0.1s linear'
                                    }}
                                />
                                {/* Scrubber handle - Red circle that follows progress */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                    style={{
                                        left: `${progressPercentage}%`,
                                        marginLeft: '-8px',
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: '#ff0000',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Layer 3: Bottom Controls Overlay */}
                        <div
                            className={`absolute bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: showControls ? 'auto' : 'none',
                            }}
                            onClick={toggleVideo} // Fallback click
                        >
                            <div
                                className="p-4 space-y-3 pt-8"
                                onClick={(event) => event.stopPropagation()} // Prevent toggle when clicking controls
                            >
                                <div className="flex items-center justify-between text-white text-xs font-medium">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>

                                {/* Progress bar moved to Layer 5 above - this space intentionally empty */}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={skipBackward}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title="Skip back 10s"
                                        >
                                            <SkipBack className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={toggleVideo}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                        >
                                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                                        </button>

                                        <button
                                            onClick={skipForward}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title="Skip forward 10s"
                                        >
                                            <SkipForward className="w-5 h-5" />
                                        </button>

                                        <div className="relative flex items-center gap-2">
                                            <button
                                                onClick={toggleVideoMute}
                                                onMouseEnter={() => setShowVolumeSlider(true)}
                                                onMouseLeave={() => setShowVolumeSlider(false)}
                                                className="p-2 text-white hover:text-orange-500 transition-colors"
                                            >
                                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                            </button>

                                            <div
                                                className={`absolute bottom-full left-0 mb-2 px-2 bg-black/90 rounded-lg transition-all duration-200 ${showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                                                onMouseEnter={() => setShowVolumeSlider(true)}
                                                onMouseLeave={() => setShowVolumeSlider(false)}
                                            >
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 accent-orange-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowQualityMenu(!showQualityMenu)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white hover:text-orange-500 transition-colors rounded"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>{currentQuality}</span>
                                            </button>

                                            {showQualityMenu && (
                                                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg overflow-hidden min-w-[80px]">
                                                    {qualities.map((quality) => (
                                                        <button
                                                            key={quality}
                                                            onClick={() => {
                                                                setCurrentQuality(quality);
                                                                setShowQualityMenu(false);
                                                            }}
                                                            className={`block w-full px-3 py-2 text-xs text-left text-white hover:bg-orange-600 transition-colors ${currentQuality === quality ? 'bg-orange-600' : ''}`}
                                                        >
                                                            {quality}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={toggleFullscreen}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                        >
                                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Metadata */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-orange-500">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-xl">{video.authorName[0]}</span>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{video.authorName}</div>
                                    <div className="text-sm text-gray-500">{video.authorRole}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                {user && ['viewer', 'admin'].includes(user.role) && user.id !== video.authorId ? (
                                    <button
                                        onClick={() => votePost(video.id)}
                                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors"
                                        title={video.hasVoted ? 'Unlike' : 'Like'}
                                    >
                                        <Heart className={`w-5 h-5 ${video.hasVoted ? 'fill-orange-500' : ''}`} />
                                        <span className="font-bold">{video.votes ?? 0}</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Heart className="w-5 h-5" />
                                        <span className="font-bold">{video.votes ?? 0}</span>
                                    </div>
                                )}
                                <div className="text-gray-500">{video.views.toLocaleString()} views</div>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            Uploaded on {new Date(video.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Sidebar/Suggestions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 px-2">Up Next</h3>
                    <div className="space-y-4">
                        {posts
                            .filter(p => p.type === 'video' && String(p.id) !== String(id))
                            .slice(0, 5)
                            .map(v => (
                                <Link
                                    key={v.id}
                                    to={`/video/${v.id}`}
                                    className="flex flex-col gap-2 group"
                                >
                                    <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                                        <VideoThumbnail
                                            videoUrl={v.media?.[0]?.file_path}
                                            thumbnailUrl={v.thumbnail}
                                            alt={v.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">{v.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span>{v.authorName}</span>
                                            <span>•</span>
                                            <span>{v.views.toLocaleString()} views</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
