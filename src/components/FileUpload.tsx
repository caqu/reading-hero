import { useRef, useState, useCallback } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (dataUrl: string) => void;
  acceptedFormats?: string[];
  maxFileSizeMB?: number;
}

export function FileUpload({
  onFileSelect,
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSizeMB = 5,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `File type not supported. Please upload PNG or JPG images only.`;
    }

    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File is too large. Maximum size is ${maxFileSizeMB}MB.`;
    }

    return null;
  }, [acceptedFormats, maxFileSizeMB]);

  // Process file
  const processFile = useCallback((file: File) => {
    setError(null);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Handle click on drop zone
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Use the selected image
  const handleUseImage = useCallback(() => {
    if (preview) {
      onFileSelect(preview);
    }
  }, [preview, onFileSelect]);

  // Clear selection
  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {!preview && (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
          aria-label="Upload image file"
        >
          <div className={styles.dropZoneContent}>
            <div className={styles.uploadIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className={styles.dropZoneText}>
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className={styles.dropZoneHint}>
              PNG or JPG (max {maxFileSizeMB}MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className={styles.fileInput}
            aria-label="File input"
          />
        </div>
      )}

      {preview && (
        <div className={styles.previewContainer}>
          <img
            src={preview}
            alt="Uploaded preview"
            className={styles.preview}
          />
          <div className={styles.controls}>
            <button
              type="button"
              onClick={handleUseImage}
              className={styles.useButton}
              aria-label="Use this image"
            >
              Use This Image
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Choose different image"
            >
              Choose Different Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export utility function for Task 3 (backend)
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

// Export utility function to validate image dimensions
export function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const valid =
        (!minWidth || img.width >= minWidth) &&
        (!minHeight || img.height >= minHeight) &&
        (!maxWidth || img.width <= maxWidth) &&
        (!maxHeight || img.height <= maxHeight);

      resolve(valid);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}
