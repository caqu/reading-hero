import { useState, useCallback } from 'react';
import { CanvasDrawArea } from '../components/CanvasDrawArea';
import { WebcamCapture } from '../components/WebcamCapture';
import { FileUpload } from '../components/FileUpload';
import styles from './CreateYourOwnPage.module.css';

interface CreateYourOwnPageProps {
  onBack: () => void;
}

export interface UserGeneratedWord {
  word: string;
  syllables: string[];
  segments: string[];
  description?: string;
  category?: string;
  imageData: string; // Base64 encoded PNG
  imageSource: 'upload' | 'canvas' | 'webcam';
}

export function CreateYourOwnPage({ onBack }: CreateYourOwnPageProps) {
  // Form state
  const [word, setWord] = useState('');
  const [syllablesInput, setSyllablesInput] = useState('');
  const [segmentsInput, setSegmentsInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Image state
  const [imageSource, setImageSource] = useState<'upload' | 'canvas' | 'webcam' | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  // Validation state
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Parse syllables from comma-separated input
  const parseSyllables = (input: string): string[] => {
    return input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // Parse segments from comma-separated input
  const parseSegments = (input: string): string[] => {
    return input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // Handle image from upload
  const handleFileUpload = useCallback((dataUrl: string) => {
    setImageSource('upload');
    setImageData(dataUrl);
  }, []);

  // Handle image from canvas
  const handleCanvasComplete = useCallback((dataUrl: string) => {
    setImageSource('canvas');
    setImageData(dataUrl);
  }, []);

  // Handle image from webcam
  const handleWebcamCapture = useCallback((dataUrl: string) => {
    setImageSource('webcam');
    setImageData(dataUrl);
  }, []);

  // Clear current image
  const handleClearImage = useCallback(() => {
    setImageSource(null);
    setImageData(null);
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!word.trim()) {
      errors.push('Word is required');
    }

    if (!imageData) {
      errors.push('An image is required (upload, draw, or take a photo)');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle form submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!validateForm()) {
      return;
    }

    // Prepare data for backend (Task 3 will handle the actual save)
    const userData: UserGeneratedWord = {
      word: word.trim(),
      syllables: parseSyllables(syllablesInput),
      segments: parseSegments(segmentsInput),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      imageData: imageData!,
      imageSource: imageSource!,
    };

    // For now, just log the data - Task 3 will implement the actual API call
    console.log('User-generated word data:', userData);

    // TODO: Task 3 will implement the save API call here
    // await saveUserGeneratedWord(userData);

    // Show success message (temporary)
    alert('Word saved! (Backend integration coming in Task 3)');

    // Reset form
    handleReset();
  };

  // Reset form
  const handleReset = () => {
    setWord('');
    setSyllablesInput('');
    setSegmentsInput('');
    setDescription('');
    setCategory('');
    setImageSource(null);
    setImageData(null);
    setShowValidation(false);
    setValidationErrors([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Create Your Own Word</h1>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to game"
          >
            Back
          </button>
        </div>

        {/* Validation Errors */}
        {showValidation && validationErrors.length > 0 && (
          <div className={styles.errorBox}>
            <h3>Please fix these errors:</h3>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSave} className={styles.form}>
          {/* Word Input Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Word Details</h2>

            <div className={styles.formGroup}>
              <label htmlFor="word" className={styles.label}>
                Word <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className={styles.input}
                placeholder="Enter a word..."
                maxLength={20}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="syllables" className={styles.label}>
                Syllables (comma-separated)
              </label>
              <input
                type="text"
                id="syllables"
                value={syllablesInput}
                onChange={(e) => setSyllablesInput(e.target.value)}
                className={styles.input}
                placeholder="e.g., but, ter, fly"
              />
              <div className={styles.hint}>
                Separate syllables with commas
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="segments" className={styles.label}>
                Segments (comma-separated)
              </label>
              <input
                type="text"
                id="segments"
                value={segmentsInput}
                onChange={(e) => setSegmentsInput(e.target.value)}
                className={styles.input}
                placeholder="e.g., b, u, t, t, er, f, l, y"
              />
              <div className={styles.hint}>
                Separate phonetic segments with commas
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Describe what this word means..."
                maxLength={200}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Category (optional)
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.input}
                placeholder="e.g., animals, food, places..."
                maxLength={30}
              />
            </div>
          </section>

          {/* Image Input Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Add an Image <span className={styles.required}>*</span>
            </h2>

            <div className={styles.imageSourceTabs}>
              <button
                type="button"
                className={`${styles.tab} ${imageSource === 'upload' ? styles.activeTab : ''}`}
                onClick={() => setImageSource('upload')}
              >
                Upload Photo
              </button>
              <button
                type="button"
                className={`${styles.tab} ${imageSource === 'canvas' ? styles.activeTab : ''}`}
                onClick={() => setImageSource('canvas')}
              >
                Draw
              </button>
              <button
                type="button"
                className={`${styles.tab} ${imageSource === 'webcam' ? styles.activeTab : ''}`}
                onClick={() => setImageSource('webcam')}
              >
                Take Photo
              </button>
            </div>

            <div className={styles.imageInputArea}>
              {imageSource === 'upload' && (
                <FileUpload onFileSelect={handleFileUpload} />
              )}

              {imageSource === 'canvas' && (
                <CanvasDrawArea onComplete={handleCanvasComplete} />
              )}

              {imageSource === 'webcam' && (
                <WebcamCapture onCapture={handleWebcamCapture} />
              )}

              {!imageSource && (
                <div className={styles.noImageSelected}>
                  Select an image source above
                </div>
              )}
            </div>
          </section>

          {/* Preview Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Preview</h2>

            <div className={styles.preview}>
              <div className={styles.previewWord}>
                {word || '(no word yet)'}
              </div>

              {imageData && (
                <div className={styles.previewImageContainer}>
                  <img
                    src={imageData}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className={styles.clearImageButton}
                    aria-label="Clear image"
                  >
                    Clear Image
                  </button>
                </div>
              )}

              {!imageData && (
                <div className={styles.noPreviewImage}>
                  No image selected
                </div>
              )}

              {parseSyllables(syllablesInput).length > 0 && (
                <div className={styles.previewSyllables}>
                  <strong>Syllables:</strong> {parseSyllables(syllablesInput).join(' • ')}
                </div>
              )}

              {parseSegments(segmentsInput).length > 0 && (
                <div className={styles.previewSegments}>
                  <strong>Segments:</strong> {parseSegments(segmentsInput).join(' • ')}
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveButton}
            >
              Save Word
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
