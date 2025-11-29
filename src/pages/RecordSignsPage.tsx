import { useState, useEffect, useRef } from 'react';
import { RECORDING_WORD_LIST, RECORDING_WORD_COUNT } from '../data/recordingWordList';
import { RECORDING_DURATION_MS, COUNTDOWN_DURATION_MS, CAMERA_RESOLUTION } from '../config/mediaConfig';
import { uploadSign, blobToBase64 } from '../utils/signRecordingApi';
import { buildInventory, SignInventory, getTotalWordCount } from '../utils/signInventory';
import styles from './RecordSignsPage.module.css';

interface RecordSignsPageProps {
  onBack: () => void;
}

export function RecordSignsPage({ onBack }: RecordSignsPageProps) {
  const [inventory, setInventory] = useState<SignInventory | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Get current word from missing list if inventory loaded, else fall back to full list
  const wordList = inventory ? inventory.missing : RECORDING_WORD_LIST;
  const currentWord = wordList[currentWordIndex];
  const totalWords = getTotalWordCount();
  const recordedCount = inventory ? inventory.recorded.length : 0;

  // Load inventory on mount
  useEffect(() => {
    async function loadInventory() {
      try {
        setIsLoadingInventory(true);
        const inv = await buildInventory();
        setInventory(inv);
        setIsLoadingInventory(false);

        // If all words are recorded, show completion
        if (inv.missing.length === 0) {
          setIsPaused(true); // Pause to show completion message
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        // Fall back to full word list on error
        setInventory({
          missing: RECORDING_WORD_LIST,
          recorded: []
        });
        setIsLoadingInventory(false);
      }
    }

    loadInventory();
  }, []);

  // Initialize camera feed
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: CAMERA_RESOLUTION.width },
            height: { ideal: CAMERA_RESOLUTION.height },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Failed to access camera. Please check permissions.');
      }
    }

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      // Clean up MediaRecorder if it exists
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto-recording logic - fully automated hands-free cycle
  useEffect(() => {
    if (isPaused || !currentWord || isUploading || isLoadingInventory) return;

    let countdownInterval: NodeJS.Timeout;
    let recordingTimeout: NodeJS.Timeout;

    async function startRecordingCycle() {
      try {
        // Clear any previous errors
        setError(null);

        // Step 1: Show countdown (3, 2, 1)
        let countdownValue = 3;
        setCountdown(countdownValue);

        countdownInterval = setInterval(() => {
          countdownValue--;
          if (countdownValue > 0) {
            setCountdown(countdownValue);
          } else {
            clearInterval(countdownInterval);
            setCountdown(null);
            startRecording();
          }
        }, COUNTDOWN_DURATION_MS / 3);

      } catch (error) {
        console.error('Error in recording cycle:', error);
        setError('Recording cycle failed. Please try again.');
      }
    }

    async function startRecording() {
      try {
        if (!videoRef.current || !videoRef.current.srcObject) {
          throw new Error('Video stream not available');
        }

        const stream = videoRef.current.srcObject as MediaStream;

        // Reset recorded chunks
        recordedChunksRef.current = [];

        // Create MediaRecorder with webm format
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8'
        });

        mediaRecorderRef.current = mediaRecorder;

        // Collect video chunks
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        // Handle recording stop
        mediaRecorder.onstop = async () => {
          await handleRecordingComplete();
        };

        // Start recording
        mediaRecorder.start();
        setIsRecording(true);

        // Step 3: Stop recording after RECORDING_DURATION_MS
        recordingTimeout = setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, RECORDING_DURATION_MS);

      } catch (error) {
        console.error('Error starting recording:', error);
        setError('Failed to start recording. Please check camera permissions.');
        setIsRecording(false);
      }
    }

    async function handleRecordingComplete() {
      try {
        if (!currentWord) {
          throw new Error('No current word available');
        }

        setIsUploading(true);

        // Step 4: Convert blob to base64
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const base64Video = await blobToBase64(blob);

        // Step 5: Upload to backend
        await uploadSign({
          word: currentWord,
          videoData: base64Video,
          duration: RECORDING_DURATION_MS,
          timestamp: new Date().toISOString()
        });

        // Step 6: Refresh inventory to update progress
        try {
          const updatedInventory = await buildInventory();
          setInventory(updatedInventory);

          // Check if we've completed all words
          if (updatedInventory.missing.length === 0) {
            setIsPaused(true); // Pause to show completion
            setIsUploading(false);
            return;
          }

          // Move to next missing word (stay at index 0 since we just removed current word)
          setCurrentWordIndex(0);
        } catch (error) {
          console.error('Error refreshing inventory:', error);
          // On inventory refresh failure, just move to next word in current list
          if (currentWordIndex < wordList.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
          }
        }

        setIsUploading(false);

      } catch (error) {
        console.error('Error uploading sign:', error);
        setError(`Failed to upload sign${currentWord ? ` for "${currentWord}"` : ''}. Please try again.`);
        setIsUploading(false);
        setIsPaused(true); // Pause on error to prevent skipping words
      }
    }

    // Start the automated cycle
    startRecordingCycle();

    // Cleanup function
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (recordingTimeout) clearTimeout(recordingTimeout);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [currentWordIndex, isPaused, currentWord, isUploading, isLoadingInventory]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    setError(null); // Clear error when resuming
  };

  const handleNext = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setError(null); // Clear error when manually advancing
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setError(null); // Clear error when going back
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
            {isLoadingInventory ? 'Loading inventory...' : `${recordedCount} / ${totalWords} recorded`}
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(recordedCount / totalWords) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Recording Area */}
        <div className={styles.recordingArea}>
          {/* Word Prompt */}
          <div className={styles.wordPrompt}>
            {inventory && inventory.missing.length === 0 ? (
              <div className={styles.wordText}>All words recorded!</div>
            ) : (
              <>
                <div className={styles.wordText}>{currentWord}</div>
                <div className={styles.wordNumber}>
                  Word {currentWordIndex + 1} of {wordList.length} remaining
                </div>
              </>
            )}
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
                {isLoadingInventory ? (
                  <div className={styles.statusMessage}>Loading...</div>
                ) : inventory && inventory.missing.length === 0 ? (
                  <div className={styles.statusMessage}>All Complete!</div>
                ) : isUploading ? (
                  <div className={styles.statusMessage}>Uploading...</div>
                ) : isPaused ? (
                  <div className={styles.statusMessage}>PAUSED</div>
                ) : (
                  <div className={styles.statusMessage}>Ready to record</div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.navigationControls}>
              <button
                onClick={handlePrevious}
                disabled={currentWordIndex === 0 || isRecording || isUploading || isLoadingInventory}
                className={styles.navButton}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentWordIndex === wordList.length - 1 || isRecording || isUploading || isLoadingInventory}
                className={styles.navButton}
              >
                Next
              </button>
            </div>

            <div className={styles.pauseControls}>
              <button
                onClick={handlePauseToggle}
                disabled={isUploading || isLoadingInventory || (inventory && inventory.missing.length === 0)}
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
