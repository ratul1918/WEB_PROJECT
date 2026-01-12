import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverImage: string;
  duration?: number;
  className?: string;
}

export function AudioPlayer({ src, title, artist, coverImage, duration = 0, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    generateWaveform();
  }, []);

  const generateWaveform = () => {
    const bars = 60;
    const data: number[] = [];
    for (let i = 0; i < bars; i++) {
      const height = Math.random() * 60 + 20;
      data.push(height);
    }
    setWaveformData(data);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const progress = audioDuration > 0 ? currentTime / audioDuration : 0;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((barHeight, index) => {
      const x = index * barWidth;
      const isActive = index / waveformData.length < progress;
      const barHeightInPixels = (barHeight / 100) * height;

      ctx.fillStyle = isActive ? '#10b981' : '#374151';
      
      ctx.beginPath();
      ctx.roundRect(x + 1, (height - barHeightInPixels) / 2, barWidth - 2, barHeightInPixels, 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    drawWaveform();
  }, [currentTime, audioDuration, waveformData]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = progressContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const audio = audioRef.current;
    
    if (audio) {
      audio.currentTime = percentage * audio.duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      audio.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audioDuration, audio.currentTime + 15);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <div className="relative">
        <audio ref={audioRef} src={src} />

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative group">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end justify-center gap-1 h-12">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-500 rounded-full animate-pulse"
                        style={{
                          height: `${20 + Math.random() * 20}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">{title}</h3>
              <p className="text-gray-400 text-lg mb-4">{artist}</p>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={skipBackward}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                  title="Skip back 15s"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </button>

                <button
                  onClick={skipForward}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                  title="Skip forward 15s"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>

            <div
              ref={progressContainerRef}
              className="relative h-12 bg-gray-800/50 rounded-lg cursor-pointer group/progress overflow-hidden"
              onClick={handleProgressClick}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={48}
                className="w-full h-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 transition-colors ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-green-500' : ''}`} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 accent-green-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
