import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './CanvasDrawArea.module.css';

interface CanvasDrawAreaProps {
  onComplete: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export function CanvasDrawArea({ onComplete, width = 400, height = 400 }: CanvasDrawAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Set up drawing style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, [width, height]);

  // Get coordinates relative to canvas
  const getCoordinates = useCallback((event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0];
      if (!touch) return null;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  // Start drawing
  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords || !context) return;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(coords.x, coords.y);
  }, [context, getCoordinates]);

  // Draw
  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing || !context) return;

    const coords = getCoordinates(event);
    if (!coords) return;

    context.lineTo(coords.x, coords.y);
    context.stroke();
  }, [isDrawing, context, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  }, [isDrawing, context]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
  }, [context, width, height]);

  // Save canvas as PNG
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onComplete(dataUrl);
  }, [onComplete]);

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Drawing canvas"
        />
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear canvas"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={styles.saveButton}
          aria-label="Use this drawing"
        >
          Use This Drawing
        </button>
      </div>
      <p className={styles.hint}>
        Draw with your mouse or finger
      </p>
    </div>
  );
}

// Export utility function for Task 3 (backend)
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

// Export utility function to convert data URL to Blob
export function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/png';
  const base64Data = parts[1];
  if (!base64Data) {
    throw new Error('Invalid data URL');
  }
  const bstr = atob(base64Data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
