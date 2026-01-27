import { useState, useRef, useEffect } from 'react';
import { buildMediaUrl } from '../utils/media';

interface VideoThumbnailProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    alt: string;
    className?: string;
}

export function VideoThumbnail({ videoUrl, thumbnailUrl, alt, className = '' }: VideoThumbnailProps) {
    const [duration, setDuration] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [posterUrl, setPosterUrl] = useState<string | null>(null);

    // Helper to format duration
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // If we have a valid image thumbnail, use it
        if (thumbnailUrl && !thumbnailUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i) && thumbnailUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            setPosterUrl(buildMediaUrl(thumbnailUrl));
            return;
        }

        // If no image thumbnail, try to use the video to generate one
        if (videoUrl) {
            const video = document.createElement('video');
            video.src = buildMediaUrl(videoUrl);
            video.preload = 'metadata';
            video.currentTime = 1; // Seek to 1s to capture a frame (avoid black start)
            video.onloadeddata = () => {
                setIsLoaded(true);
                if (video.duration) {
                    setDuration(formatDuration(video.duration));
                }
            };
            // Ideally we'd draw to canvas here to get a static URL, but for now we can just use the video element frozen
        }
    }, [thumbnailUrl, videoUrl]);

    // Render logic
    const hasValidImage = thumbnailUrl && !thumbnailUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i) && thumbnailUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (hasValidImage) {
        return (
            <div className={`relative ${className}`}>
                <img
                    src={buildMediaUrl(thumbnailUrl!)}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image fails
                        e.currentTarget.style.display = 'none';
                        // Could trigger video fallback state here if we wanted complex logic
                    }}
                />
                {/* Duration could be passed in if known, but for image thumbnails we might not know it unless passed as prop */}
            </div>
        );
    }

    // Fallback: render a muted video element paused at 1s
    if (videoUrl) {
        return (
            <div className={`relative bg-black ${className}`}>
                <video
                    src={`${buildMediaUrl(videoUrl)}#t=1`}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        setDuration(formatDuration(v.duration));
                    }}
                />
                {duration && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {duration}
                    </div>
                )}
            </div>
        );
    }

    // Final fallback
    return (
        <div className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}>
            <span className="text-xs">No media</span>
        </div>
    );
}
