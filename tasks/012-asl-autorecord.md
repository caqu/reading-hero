# ✅ **TASK 2 — Implement Hands-Free Auto-Recording Loop**

**Goal:** Automate the entire recording cycle so the ASL actor never touches the screen.

## Requirements

### Sequence

For each word:

1. Display word: **"cat"**
2. Show countdown: **3 → 2 → 1**
3. Start recording automatically
4. Record for fixed duration: **2.5s (configurable)**
5. Stop recording automatically
6. Immediately upload to backend
7. After upload finishes → go to next word
8. If actor presses "Pause," stop auto-advancement
9. "Continue" resumes loop where it left off

### Configurable Settings in `mediaConfig.ts`:

```ts
export const recordingDurationMs = 2500;
export const countdownMs = 3000;
export const cameraResolution = { width: 720, height: 720 };
```

### Implementation Notes

* Use `MediaRecorder`
* Capture `webm`
* Disable audio if possible; else strip server-side
* To avoid memory leaks, dispose stream upon stop

### Acceptance Criteria

✔ Fully automated cycle
✔ No actor interaction required
✔ Pausing works
✔ Next word appears immediately after upload
