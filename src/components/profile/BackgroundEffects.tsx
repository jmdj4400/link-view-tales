interface BackgroundEffectsProps {
  videoUrl?: string | null;
  imageUrl?: string | null;
  color?: string;
  enableParallax?: boolean;
  enableGlassmorphism?: boolean;
}

export function BackgroundEffects({
  videoUrl,
  imageUrl,
  color,
  enableParallax = false,
  enableGlassmorphism = false,
}: BackgroundEffectsProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video Background */}
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Image Background with Parallax */}
      {imageUrl && !videoUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${enableParallax ? 'animate-parallax' : ''}`}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundAttachment: enableParallax ? 'fixed' : 'scroll',
          }}
        />
      )}

      {/* Color Overlay */}
      {color && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color,
            opacity: videoUrl || imageUrl ? 0.3 : 1,
          }}
        />
      )}

      {/* Glassmorphism Overlay */}
      {enableGlassmorphism && (videoUrl || imageUrl) && (
        <div className="absolute inset-0 backdrop-blur-md bg-background/30" />
      )}

      {/* Gradient Mesh Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
    </div>
  );
}
