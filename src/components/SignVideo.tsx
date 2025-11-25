import React, { useRef, useEffect, useState } from 'react';

export interface SignVideoProps {
  /** MP4 video source URL */
  mp4Src?: string;
  /** WebM video source URL */
  webmSrc?: string;
  /** Fallback thumbnail image URL */
  thumbnailSrc?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** CSS class name */
  className?: string;
  /** Whether to show video controls */
  showControls?: boolean;
  /** Custom width (defaults to 100%) */
  width?: string | number;
  /** Custom height (defaults to auto) */
  height?: string | number;
}

/**
 * SignVideo component for displaying ASL sign language videos.
 *
 * Features:
 * - Automatically loops videos
 * - Muted by default for autoplay compatibility
 * - playsInline for mobile compatibility
 * - Fallback from WebM to MP4 to thumbnail
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <SignVideo
 *   mp4Src="/signs/processed/cat.mp4"
 *   webmSrc="/signs/processed/cat.webm"
 *   thumbnailSrc="/signs/thumbnails/cat.png"
 *   alt="ASL sign for 'cat'"
 * />
 * ```
 */
export const SignVideo: React.FC<SignVideoProps> = ({
  mp4Src,
  webmSrc,
  thumbnailSrc,
  alt = 'ASL sign language video',
  className = '',
  showControls = false,
  width = '100%',
  height = 'auto',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
      console.error('Error loading video:', { mp4Src, webmSrc });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Attempt to play the video
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Autoplay was prevented, which is okay
        console.debug('Video autoplay prevented:', error);
      });
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [mp4Src, webmSrc]);

  // If no video sources are provided, show thumbnail only
  if (!mp4Src && !webmSrc) {
    if (thumbnailSrc) {
      return (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={className}
          style={{ width, height, objectFit: 'contain' }}
        />
      );
    }
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px',
        }}
      >
        No video available
      </div>
    );
  }

  // If video failed to load, show thumbnail or error message
  if (hasError) {
    if (thumbnailSrc) {
      return (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={className}
          style={{ width, height, objectFit: 'contain' }}
        />
      );
    }
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffebee',
          color: '#c62828',
          fontSize: '14px',
        }}
      >
        Failed to load video
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        controls={showControls}
        poster={thumbnailSrc}
        aria-label={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        {/* WebM first for better compression in modern browsers */}
        {webmSrc && <source src={webmSrc} type="video/webm" />}

        {/* MP4 fallback for Safari and older browsers */}
        {mp4Src && <source src={mp4Src} type="video/mp4" />}

        {/* Fallback message for browsers that don't support video */}
        <p>
          Your browser does not support video playback.
          {thumbnailSrc && (
            <>
              {' '}
              <img src={thumbnailSrc} alt={alt} style={{ maxWidth: '100%' }} />
            </>
          )}
        </p>
      </video>

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SignVideo;
