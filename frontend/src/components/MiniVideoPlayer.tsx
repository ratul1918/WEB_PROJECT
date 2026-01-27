import { useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pause, Play, Volume2, VolumeX, X, SkipBack, SkipForward } from 'lucide-react';
import { useVideoPlayer } from '../contexts/VideoPlayerContext';

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function MiniVideoPlayer() {
  const location = useLocation();
  const { track, isPlaying, currentTime, duration, togglePlay, toggleMute, isMuted, stop, seek, setPortalTarget, clearPortalTarget } = useVideoPlayer();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const shouldShow = Boolean(track) && !location.pathname.startsWith('/video/');

  useLayoutEffect(() => {
    if (!shouldShow || !surfaceRef.current) return;
    const target = surfaceRef.current;
    setPortalTarget(target);
    return () => clearPortalTarget(target);
  }, [shouldShow, setPortalTarget, clearPortalTarget]);

  if (!shouldShow) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = progressRef.current;
    if (!container || duration <= 0) return;
    const rect = container.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '1.5rem',
        bottom: '1.5rem',
        width: 'min(360px, calc(100vw - 2rem))',
        zIndex: 60,
      }}
      className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="relative">
        <div
          ref={surfaceRef}
          className="w-full bg-black"
          style={{ aspectRatio: '16 / 9', cursor: 'pointer' }}
        />
        <Link
          to={`/video/${track?.id ?? ''}`}
          className="absolute inset-0"
          aria-label="Open video"
        />
      </div>

      <div className="p-4">
        <Link to={`/video/${track?.id ?? ''}`} className="block">
          <div className="text-gray-900 truncate">{track?.title}</div>
          <div className="text-gray-500 text-sm truncate">{track?.authorName}</div>
        </Link>

        <div className="flex items-center gap-2 mt-4">
          {/* Skip Back 10s */}
          <button
            onClick={() => seek(Math.max(0, currentTime - 10))}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition hover:bg-gray-200"
            aria-label="Skip back 10 seconds"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md transition hover:shadow-lg hover:bg-orange-700"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          {/* Skip Forward 10s */}
          <button
            onClick={() => seek(Math.min(duration, currentTime + 10))}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition hover:bg-gray-200"
            aria-label="Skip forward 10 seconds"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition hover:bg-gray-200"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={stop}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center transition hover:bg-gray-200"
            aria-label="Close mini player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <div ref={progressRef} className="cursor-pointer" onClick={handleProgressClick}>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-orange-600" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
