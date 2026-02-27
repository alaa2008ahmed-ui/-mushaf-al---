
import React, { useEffect, useRef } from 'react';

interface VideoSplashProps {
  onEnded: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video play failed:", error);
        // If autoplay fails (e.g. browser policy), we might want to skip or show a play button
        // For a splash screen, skipping is often better than a broken UI
        onEnded();
      });
    }
  }, [onEnded]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onEnded}
      />
      {/* Optional: Skip button if video is long */}
      <button 
        onClick={onEnded}
        className="absolute bottom-10 right-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
      >
        تخطي
      </button>
    </div>
  );
};

export default VideoSplash;
