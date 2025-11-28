import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './WebcamCapture.module.css';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export function WebcamCapture({ onCapture, width = 400, height = 400 }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      setError(null);

      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user', // Use front camera on mobile
        },
      });

      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied. Please allow camera access to use this feature.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera. Please check your permissions.');
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  }, [width, height]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Capture photo from video
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  }, []);

  // Use the captured image
  const handleUseImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopWebcam();
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture, stopWebcam]);

  // Retake photo
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className={styles.dismissButton}
          >
            Dismiss
          </button>
        </div>
      )}

      {!error && !isStreaming && !capturedImage && (
        <div className={styles.startContainer}>
          <button
            type="button"
            onClick={startWebcam}
            className={styles.startButton}
            aria-label="Start camera"
          >
            Start Camera
          </button>
          <p className={styles.hint}>
            Click to activate your camera
          </p>
        </div>
      )}

      {isStreaming && !capturedImage && (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
            aria-label="Camera preview"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className={styles.controls}>
            <button
              type="button"
              onClick={handleCapture}
              className={styles.captureButton}
              aria-label="Take photo"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className={styles.cancelButton}
              aria-label="Stop camera"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className={styles.previewContainer}>
          <img
            src={capturedImage}
            alt="Captured preview"
            className={styles.preview}
          />
          <div className={styles.controls}>
            <button
              type="button"
              onClick={handleUseImage}
              className={styles.useButton}
              aria-label="Use this photo"
            >
              Use This Photo
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className={styles.retakeButton}
              aria-label="Retake photo"
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export utility function for Task 3 (backend)
export async function getWebcamStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia(
    constraints || {
      video: { facingMode: 'user' },
    }
  );
}

// Export utility function to check webcam availability
export async function checkWebcamAvailability(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
}
