import { useState, useEffect, useRef } from 'react';
import { RECORDING_WORD_LIST, RECORDING_WORD_COUNT } from '../data/recordingWordList';
import { RECORDING_DURATION_MS, COUNTDOWN_DURATION_MS, CAMERA_RESOLUTION } from '../config/mediaConfig';
import { uploadSign, blobToBase64 } from '../utils/signRecordingApi';
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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const currentWord = RECORDING_WORD_LIST[currentWordIndex];

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
    if (isPaused || !currentWord || isUploading) return;

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

        // Step 6: Move to next word
        setRecordedCount(prev => prev + 1);

        if (currentWordIndex < RECORDING_WORD_LIST.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
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
  }, [currentWordIndex, isPaused, currentWord, isUploading]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    setError(null); // Clear error when resuming
  };

  const handleNext = () => {
    if (currentWordIndex < RECORDING_WORD_LIST.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setRecordedCount(recordedCount + 1);
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
                {isUploading ? (
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
                disabled={currentWordIndex === 0 || isRecording || isUploading}
                className={styles.navButton}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentWordIndex === RECORDING_WORD_LIST.length - 1 || isRecording || isUploading}
                className={styles.navButton}
              >
                Next
              </button>
            </div>

            <div className={styles.pauseControls}>
              <button
                onClick={handlePauseToggle}
                disabled={isUploading}
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
