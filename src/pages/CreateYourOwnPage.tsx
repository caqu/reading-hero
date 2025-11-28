import styles from './CreateYourOwnPage.module.css';

interface CreateYourOwnPageProps {
  onBack: () => void;
}

export function CreateYourOwnPage({ onBack }: CreateYourOwnPageProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic in future tasks
    console.log('Form submitted - logic to be implemented');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create Your Own Word</h1>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to game"
          >
            Back
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Word Input Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Word</h2>
            <input
              type="text"
              placeholder="Enter word (e.g., cat)"
              className={styles.textInput}
              aria-label="Word input"
            />
          </section>

          {/* Syllabification Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Syllabification</h2>
            <input
              type="text"
              placeholder="Enter syllables separated by dots (e.g., cat)"
              className={styles.textInput}
              aria-label="Syllables input"
            />
            <p className={styles.helpText}>
              Separate syllables with dots (e.g., "but.ter.fly")
            </p>
          </section>

          {/* Segments Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Phonetic Segments</h2>
            <input
              type="text"
              placeholder="Enter segments separated by spaces (e.g., c a t)"
              className={styles.textInput}
              aria-label="Segments input"
            />
            <p className={styles.helpText}>
              Separate sound segments with spaces (e.g., "c a t")
            </p>
          </section>

          {/* Image Options Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Image</h2>
            <div className={styles.imageOptions}>
              {/* Upload Option */}
              <div className={styles.imageOption}>
                <label className={styles.imageOptionLabel}>
                  <input
                    type="radio"
                    name="imageSource"
                    value="upload"
                    className={styles.radio}
                    defaultChecked
                  />
                  <span>Upload Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  aria-label="Upload image file"
                />
              </div>

              {/* Drawing Canvas Option */}
              <div className={styles.imageOption}>
                <label className={styles.imageOptionLabel}>
                  <input
                    type="radio"
                    name="imageSource"
                    value="draw"
                    className={styles.radio}
                  />
                  <span>Draw Picture</span>
                </label>
                <div className={styles.canvasPlaceholder}>
                  Canvas placeholder - drawing functionality to be implemented
                </div>
              </div>

              {/* Camera Capture Option */}
              <div className={styles.imageOption}>
                <label className={styles.imageOptionLabel}>
                  <input
                    type="radio"
                    name="imageSource"
                    value="camera"
                    className={styles.radio}
                  />
                  <span>Take Photo</span>
                </label>
                <button
                  type="button"
                  className={styles.cameraButton}
                  aria-label="Open camera"
                >
                  Open Camera
                </button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              className={styles.saveButton}
              aria-label="Save custom word"
            >
              Save Word
            </button>
            <p className={styles.helpText}>
              Your custom word will be added to the practice words
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
