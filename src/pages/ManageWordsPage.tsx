import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../config/apiConfig';
import styles from './ManageWordsPage.module.css';

interface UGCWord {
  word: string;
  syllables: string[];
  segments: string[];
  imagePath: string;
  source: string;
  imageType?: string;
  createdAt: number;
  active: boolean;
}

interface ManageWordsPageProps {
  onBack: () => void;
}

export const ManageWordsPage = ({ onBack }: ManageWordsPageProps) => {
  const [words, setWords] = useState<UGCWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewWord, setPreviewWord] = useState<UGCWord | null>(null);

  // Fetch all UGC words from the backend
  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ugc/words`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      setWords(data.words || []);
    } catch (err) {
      console.error('Error fetching UGC words:', err);
      setError('Failed to load your words. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Toggle active status (restore/remove)
  const handleToggleActive = async (word: UGCWord) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ugc/word/${word.word}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !word.active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update word status');
      }

      // Refresh the word list
      await fetchWords();
    } catch (err) {
      console.error('Error updating word:', err);
      alert('Failed to update word. Please try again.');
    }
  };

  // Permanently delete a word
  const handleDelete = async (word: UGCWord) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${word.word}"? This cannot be undone!`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ugc/word/${word.word}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete word');
      }

      // Refresh the word list
      await fetchWords();
    } catch (err) {
      console.error('Error deleting word:', err);
      alert('Failed to delete word. Please try again.');
    }
  };

  // Preview word in modal
  const handlePreview = (word: UGCWord) => {
    setPreviewWord(word);
  };

  const closePreview = () => {
    setPreviewWord(null);
  };

  // Separate active and inactive words
  const activeWords = words.filter(w => w.active);
  const inactiveWords = words.filter(w => !w.active);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Manage My Words</h1>
          <button
            className={styles.backButton}
            onClick={onBack}
            aria-label="Go back to game"
          >
            Back to Game
          </button>
        </header>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading your words...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>❌</div>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={fetchWords}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h2>No Words Yet</h2>
            <p>You haven't created any words yet. Start creating your own words to see them here!</p>
          </div>
        )}

        {!loading && !error && words.length > 0 && (
          <>
            {/* Active Words Section */}
            {activeWords.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Active Words ({activeWords.length})</h2>
                <div className={styles.wordsGrid}>
                  {activeWords.map((word) => (
                    <div key={word.word} className={styles.wordCard}>
                      <div className={styles.wordImageContainer}>
                        <img
                          src={`${getApiBaseUrl()}${word.imagePath}`}
                          alt={word.word}
                          className={styles.wordImage}
                        />
                        <div className={styles.activeIndicator}>✓ Active</div>
                      </div>
                      <div className={styles.wordInfo}>
                        <h3 className={styles.wordText}>{word.word}</h3>
                        <p className={styles.wordMeta}>
                          {new Date(word.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.wordActions}>
                        <button
                          className={styles.previewButton}
                          onClick={() => handlePreview(word)}
                          aria-label={`Preview ${word.word}`}
                        >
                          👁️ Preview
                        </button>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleToggleActive(word)}
                          aria-label={`Remove ${word.word}`}
                        >
                          ➖ Remove
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(word)}
                          aria-label={`Delete ${word.word}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inactive Words Section */}
            {inactiveWords.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Removed Words ({inactiveWords.length})</h2>
                <div className={styles.wordsGrid}>
                  {inactiveWords.map((word) => (
                    <div key={word.word} className={`${styles.wordCard} ${styles.inactiveCard}`}>
                      <div className={styles.wordImageContainer}>
                        <img
                          src={`${getApiBaseUrl()}${word.imagePath}`}
                          alt={word.word}
                          className={`${styles.wordImage} ${styles.inactiveImage}`}
                        />
                        <div className={styles.inactiveIndicator}>✗ Removed</div>
                      </div>
                      <div className={styles.wordInfo}>
                        <h3 className={styles.wordText}>{word.word}</h3>
                        <p className={styles.wordMeta}>
                          {new Date(word.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.wordActions}>
                        <button
                          className={styles.previewButton}
                          onClick={() => handlePreview(word)}
                          aria-label={`Preview ${word.word}`}
                        >
                          👁️ Preview
                        </button>
                        <button
                          className={styles.restoreButton}
                          onClick={() => handleToggleActive(word)}
                          aria-label={`Restore ${word.word}`}
                        >
                          ✓ Restore
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(word)}
                          aria-label={`Delete ${word.word}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewWord && (
        <div className={styles.modalOverlay} onClick={closePreview}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={closePreview}
              aria-label="Close preview"
            >
              ✕
            </button>
            <div className={styles.modalContent}>
              <img
                src={`${getApiBaseUrl()}${previewWord.imagePath}`}
                alt={previewWord.word}
                className={styles.previewImage}
              />
              <h2 className={styles.previewWord}>{previewWord.word}</h2>
              <div className={styles.previewDetails}>
                <p><strong>Syllables:</strong> {previewWord.syllables.join(' · ')}</p>
                <p><strong>Segments:</strong> {previewWord.segments.join(', ')}</p>
                <p><strong>Source:</strong> {previewWord.imageType || 'unknown'}</p>
                <p><strong>Created:</strong> {new Date(previewWord.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {previewWord.active ? 'Active' : 'Removed'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
