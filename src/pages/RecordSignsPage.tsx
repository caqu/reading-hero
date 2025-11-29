import { useState, useEffect, useRef } from 'react';
import { RECORDING_WORD_LIST, RECORDING_WORD_COUNT } from '../data/recordingWordList';
import styles from './RecordSignsPage.module.css';

interface RecordSignsPageProps {
  onBack: () => void;
}

export function RecordSignsPage({ onBack }: RecordSignsPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recordedCount, setRecordedCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const currentWord = RECORDING_WORD_LIST[currentWordIndex];

  // Initialize camera feed
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Placeholder for auto-recording logic (Task 2)
  useEffect(() => {
    if (isPaused || !currentWord) return;

    // TODO Task 2: Implement auto-recording countdown and capture
    // 1. Show countdown (3, 2, 1)
    // 2. Start recording
    // 3. Record for 3-4 seconds
    // 4. Save video
    // 5. Auto-advance to next word

  }, [currentWordIndex, isPaused, currentWord]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleNext = () => {
    if (currentWordIndex < RECORDING_WORD_LIST.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setRecordedCount(recordedCount + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>ASL Sign Recording</h1>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to game"
          >
            Back
          </button>
        </div>

        {/* Progress Counter */}
        <div className={styles.progressBar}>
          <div className={styles.progressText}>
            {recordedCount} / {RECORDING_WORD_COUNT} recorded
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(recordedCount / RECORDING_WORD_COUNT) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Recording Area */}
        <div className={styles.recordingArea}>
          {/* Word Prompt */}
          <div className={styles.wordPrompt}>
            <div className={styles.wordText}>{currentWord}</div>
            <div className={styles.wordNumber}>
              Word {currentWordIndex + 1} of {RECORDING_WORD_COUNT}
            </div>
          </div>

          {/* Video Preview */}
          <div className={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.video}
            />

            {/* Recording Indicator */}
            {isRecording && (
              <div className={styles.recordingIndicator}>
                <div className={styles.recordingDot} />
                <span>RECORDING</span>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className={styles.countdownOverlay}>
                <div className={styles.countdownNumber}>{countdown}</div>
              </div>
            )}

            {/* Status Display */}
            {!isRecording && countdown === null && (
              <div className={styles.statusOverlay}>
                {isPaused ? (
                  <div className={styles.statusMessage}>PAUSED</div>
                ) : (
                  <div className={styles.statusMessage}>Ready to record</div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.navigationControls}>
              <button
                onClick={handlePrevious}
                disabled={currentWordIndex === 0}
                className={styles.navButton}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentWordIndex === RECORDING_WORD_LIST.length - 1}
                className={styles.navButton}
              >
                Next
              </button>
            </div>

            <div className={styles.pauseControls}>
              <button
                onClick={handlePauseToggle}
                className={isPaused ? styles.continueButton : styles.pauseButton}
              >
                {isPaused ? 'Continue' : 'Pause'}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <h3>Recording Instructions:</h3>
          <ul>
            <li>Position yourself in the center of the frame</li>
            <li>Ensure good lighting on your face and hands</li>
            <li>The countdown will start automatically (3, 2, 1)</li>
            <li>Perform the sign clearly during the recording</li>
            <li>Recording will stop automatically after 3-4 seconds</li>
            <li>Use Pause if you need a break</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
