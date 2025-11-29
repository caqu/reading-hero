import React, { useState, useEffect, useCallback } from 'react';
import { SignVideo } from '../components/SignVideo';
import { listSigns, updateSignStatus, SignMetadata } from '../utils/signRecordingApi';
import { getApiBaseUrl } from '../config/apiConfig';
import { EMOJI_WORDS } from '../data/emojiWords';

type ViewMode = 'grid' | 'playback';

interface ReviewSignsPageProps {
  onBack: () => void;
}

// Helper function to get emoji for a word
function getEmojiForWord(wordText: string): string {
  const word = EMOJI_WORDS.find(w => w.text === wordText);
  return word?.emoji || '';
}

export const ReviewSignsPage: React.FC<ReviewSignsPageProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [signs, setSigns] = useState<SignMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletingWords, setDeletingWords] = useState<Set<string>>(new Set());

  // Load signs on mount
  useEffect(() => {
    loadSigns();
  }, []);

  const loadSigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listSigns();
      // Filter to show only approved and pending signs (not deleted)
      const activeSigns = response.signs.filter(
        sign => sign.status === 'approved' || sign.status === 'pending'
      );
      setSigns(activeSigns);
      console.log(`Loaded ${activeSigns.length} active signs for review`);
    } catch (err) {
      console.error('Error loading signs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load signs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (word: string) => {
    if (!confirm(`Are you sure you want to mark "${word}" for deletion? This will mark it as missing and require re-recording.`)) {
      return;
    }

    setDeletingWords(prev => new Set(prev).add(word));

    try {
      await updateSignStatus(word, 'deleted');
      console.log(`Marked sign "${word}" as deleted`);

      // Remove from local state
      setSigns(prev => prev.filter(sign => sign.word !== word));

      // Adjust current index if needed in playback mode
      if (viewMode === 'playback' && currentIndex >= signs.length - 1) {
        setCurrentIndex(Math.max(0, signs.length - 2));
      }
    } catch (err) {
      console.error(`Error deleting sign "${word}":`, err);
      alert(`Failed to delete sign: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingWords(prev => {
        const next = new Set(prev);
        next.delete(word);
        return next;
      });
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < signs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, signs.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation for playback mode
  useEffect(() => {
    if (viewMode !== 'playback') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (signs[currentIndex]) {
          handleDelete(signs[currentIndex].word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, signs, handleNext, handlePrevious]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading signs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Loading Signs</h2>
          <p style={styles.errorText}>{error}</p>
          <div style={styles.buttonGroup}>
            <button onClick={loadSigns} style={styles.retryButton}>
              Retry
            </button>
            <button onClick={onBack} style={styles.backButton}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (signs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyContainer}>
          <h2 style={styles.emptyTitle}>No Signs to Review</h2>
          <p style={styles.emptyText}>There are no recorded ASL signs available for review.</p>
          <button onClick={onBack} style={styles.backButton}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          Back
        </button>
        <h1 style={styles.title}>Review ASL Signs ({signs.length})</h1>
        <button
          onClick={() => {
            setViewMode(viewMode === 'grid' ? 'playback' : 'grid');
            setCurrentIndex(0);
          }}
          style={styles.toggleButton}
        >
          {viewMode === 'grid' ? 'Playback Mode' : 'Grid Mode'}
        </button>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {signs.map((sign) => (
              <div key={sign.word} style={styles.gridCell}>
                <div style={styles.videoWrapper}>
                  <SignVideo
                    mp4Src={`${getApiBaseUrl()}/asl/signs/${sign.word}/sign_loop.mp4`}
                    alt={`ASL sign for ${sign.word}`}
                    className="review-sign-video"
                  />
                  <button
                    onClick={() => handleDelete(sign.word)}
                    disabled={deletingWords.has(sign.word)}
                    style={{
                      ...styles.deleteButton,
                      ...(deletingWords.has(sign.word) ? styles.deleteButtonDisabled : {}),
                    }}
                    title="Mark for deletion"
                  >
                    {deletingWords.has(sign.word) ? '...' : 'X'}
                  </button>
                </div>
                <div style={styles.wordLabel}>
                  {getEmojiForWord(sign.word)} {sign.word}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playback Mode */}
      {viewMode === 'playback' && signs.length > 0 && signs[currentIndex] && (
        <div style={styles.playbackContainer}>
          <div style={styles.playbackContent}>
            {/* Word Title */}
            <h2 style={styles.playbackWord}>
              {getEmojiForWord(signs[currentIndex]!.word)} {signs[currentIndex]!.word}
            </h2>

            {/* Video Player */}
            <div style={styles.playbackVideoWrapper}>
              <SignVideo
                mp4Src={`${getApiBaseUrl()}/asl/signs/${signs[currentIndex]!.word}/sign_loop.mp4`}
                alt={`ASL sign for ${signs[currentIndex]!.word}`}
                width="100%"
                height="100%"
              />
            </div>

            {/* Metadata */}
            <div style={styles.metadata}>
              <div style={styles.metadataRow}>
                <span style={styles.metadataLabel}>Status:</span>
                <span style={styles.metadataValue}>{signs[currentIndex]!.status}</span>
              </div>
              <div style={styles.metadataRow}>
                <span style={styles.metadataLabel}>Recorded:</span>
                <span style={styles.metadataValue}>
                  {formatDate(signs[currentIndex]!.recordedAt)}
                </span>
              </div>
              <div style={styles.metadataRow}>
                <span style={styles.metadataLabel}>Duration:</span>
                <span style={styles.metadataValue}>
                  {formatDuration(signs[currentIndex]!.durationMs)}
                </span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div style={styles.controls}>
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                style={{
                  ...styles.navButton,
                  ...(currentIndex === 0 ? styles.navButtonDisabled : {}),
                }}
              >
                Previous
              </button>

              <div style={styles.counter}>
                {currentIndex + 1} / {signs.length}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === signs.length - 1}
                style={{
                  ...styles.navButton,
                  ...(currentIndex === signs.length - 1 ? styles.navButtonDisabled : {}),
                }}
              >
                Next
              </button>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(signs[currentIndex]!.word)}
              disabled={deletingWords.has(signs[currentIndex]!.word)}
              style={{
                ...styles.playbackDeleteButton,
                ...(deletingWords.has(signs[currentIndex]!.word)
                  ? styles.playbackDeleteButtonDisabled
                  : {}),
              }}
            >
              {deletingWords.has(signs[currentIndex]!.word)
                ? 'Deleting...'
                : 'Mark for Deletion'}
            </button>

            {/* Keyboard Hints */}
            <div style={styles.keyboardHints}>
              <span>Arrow keys: Navigate</span>
              <span>Delete/Backspace: Mark for deletion</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-background, #f5f5f5)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px',
    backgroundColor: 'var(--color-background-secondary, #ffffff)',
    borderBottom: '2px solid var(--color-border, #e0e0e0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  title: {
    fontSize: '1.75rem',
    margin: 0,
    flex: 1,
    textAlign: 'center',
    color: 'var(--color-text, #333)',
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: 'var(--color-background-secondary, #ffffff)',
    color: 'var(--color-text, #333)',
    border: '2px solid var(--color-border, #ccc)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: 'var(--color-primary, #2196F3)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '20px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid var(--color-border, #e0e0e0)',
    borderTop: '6px solid var(--color-primary, #2196F3)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1.25rem',
    color: 'var(--color-text-secondary, #666)',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '20px',
    padding: '40px',
  },
  errorTitle: {
    fontSize: '2rem',
    color: 'var(--color-error, #d32f2f)',
    margin: 0,
  },
  errorText: {
    fontSize: '1.125rem',
    color: 'var(--color-text-secondary, #666)',
    textAlign: 'center',
  },
  retryButton: {
    padding: '12px 24px',
    fontSize: '1.125rem',
    backgroundColor: 'var(--color-primary, #2196F3)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '20px',
    padding: '40px',
  },
  emptyTitle: {
    fontSize: '2rem',
    color: 'var(--color-text, #333)',
    margin: 0,
  },
  emptyText: {
    fontSize: '1.125rem',
    color: 'var(--color-text-secondary, #666)',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  gridContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 1fr)',
    gap: '12px',
    maxWidth: '1800px',
    margin: '0 auto',
  },
  gridCell: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-secondary, #ffffff)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  videoWrapper: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  wordLabel: {
    padding: '8px',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'var(--color-text, #333)',
    backgroundColor: 'var(--color-background, #f5f5f5)',
    borderTop: '1px solid var(--color-border, #e0e0e0)',
  },
  playbackContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  playbackContent: {
    maxWidth: '800px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
  },
  playbackWord: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--color-text, #333)',
    margin: 0,
    textTransform: 'capitalize',
  },
  playbackVideoWrapper: {
    width: '100%',
    maxWidth: '600px',
    aspectRatio: '4/3',
    backgroundColor: 'var(--color-background-secondary, #ffffff)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  metadata: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'var(--color-background-secondary, #ffffff)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  metadataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  metadataLabel: {
    fontWeight: 'bold',
    color: 'var(--color-text-secondary, #666)',
  },
  metadataValue: {
    color: 'var(--color-text, #333)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navButton: {
    padding: '12px 24px',
    fontSize: '1.125rem',
    backgroundColor: 'var(--color-primary, #2196F3)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: '120px',
  },
  navButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  counter: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--color-text, #333)',
    minWidth: '100px',
    textAlign: 'center',
  },
  playbackDeleteButton: {
    padding: '12px 32px',
    fontSize: '1.125rem',
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  playbackDeleteButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  keyboardHints: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary, #666)',
    marginTop: '10px',
  },
};

// Add spinning animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ReviewSignsPage;
