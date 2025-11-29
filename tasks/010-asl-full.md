# 🟦 **MASTER TASK GROUP — Professional ASL Sign Recording System**

This will give you:

✔ `/record-signs` route (no button, hidden)
✔ Automated recording workflow for actors
✔ Inventory of needed signs
✔ Processing pipeline
✔ Review workflow
✔ Integration with gameplay layout (use video if exists; fallback to image)

---

# ✅ **TASK 1 — Create `/record-signs` Hidden Recording Route**

**Filename:** `task_record_signs_route.md`
**Goal:** Add a dedicated hidden route for professional ASL recording.

## Requirements

### 1. Create Route

Add new page:

```
src/pages/RecordSignsPage.tsx
```

Accessible ONLY by URL:

```
/record-signs
```

Do NOT add it to sidebar or nav.

### 2. Page Layout

Components:

* Word prompt (large, centered)
* Video preview box (live camera)
* Status area ("Next word in 3… 2… 1…")
* Pause / Continue buttons (small, bottom-left)
* Recording indicator (red dot)
* Optional: show remaining count (e.g., “42/228 recorded”)

### 3. Load Full Inventory

Use a dedicated list:

```
src/data/recordingWordList.ts
```

Initially: your 228 emoji words.

Later scalable to thousands.

### Acceptance Criteria

✔ Hidden route loads
✔ Shows recording interface skeleton
✔ Displays the next unrecorded word

---

# ✅ **TASK 2 — Implement Hands-Free Auto-Recording Loop**

**Filename:** `task_autorecording_loop.md`
**Goal:** Automate the entire recording cycle so the ASL actor never touches the screen.

## Requirements

### Sequence

For each word:

1. Display word: **“cat”**
2. Show countdown: **3 → 2 → 1**
3. Start recording automatically
4. Record for fixed duration: **2.5s (configurable)**
5. Stop recording automatically
6. Immediately upload to backend
7. After upload finishes → go to next word
8. If actor presses “Pause,” stop auto-advancement
9. “Continue” resumes loop where it left off

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

---

# ✅ **TASK 3 — Backend Endpoint & Processing for Recorded Videos**

**Filename:** `task_backend_process_sign_video.md`
**Goal:** Save and process each recorded video.

## Requirements

### Endpoint

```
POST /api/signs/upload
```

Payload:

* `word`
* `videoData` (base64 or blob)
* `duration`
* `timestamp`

### File Storage Structure

```
/asl/signs/<word>/
    raw.webm
    sign_loop.mp4
    meta.json
```

### Processing (using existing conversion script)

Use your existing processing script (ffmpeg wrapper) to:

* Strip all audio
* Normalize FPS (e.g., 30fps)
* Normalize resolution
* Crop as needed (optional later)
* Produce `sign_loop.mp4`

### Metadata File

```json
{
  "word": "cat",
  "recordedAt": "2025-01-01T12:00:00.000Z",
  "durationMs": 2500,
  "loopPath": "/asl/signs/cat/sign_loop.mp4",
  "status": "approved" | "pending" | "deleted"
}
```

### Acceptance Criteria

✔ Video saved to word folder
✔ Processed video created
✔ Metadata saved
✔ Endpoint returns `videoUrl`

---

# ✅ **TASK 4 — Create Inventory System for Missing vs. Recorded Signs**

**Filename:** `task_recording_inventory_system.md`
**Goal:** Track which words already have a sign video, and which still need recording.

## Requirements

### Data Sources

1. Primary word list (the 228 emoji→words)
2. `/asl/signs/<word>/meta.json` existence

### Inventory Data Structure

```
{
  missing: ["cat", "dog", ...],
  recorded: ["apple", "banana", ...]
}
```

### On load:

* Scan `/asl/signs` folder for completed signs
* Compare to word list
* Build inventory
* Feed into `/record-signs` page

### Acceptance Criteria

✔ Inventory built on load
✔ Recording page uses inventory to get next word
✔ After uploads, inventory updates

---

# ✅ **TASK 5 — Review Mode (Batch Playback + Deletion)**

**Filename:** `task_review_mode.md`
**Goal:** Let director review all recordings efficiently and mark bad ones for deletion.

## Requirements

### New route:

```
/review-signs
```

### Two View Modes:

#### 1. **Grid Mode (9×9 wall)**

* 81 simultaneous looping previews
* Scrollable
* Each preview has a small ❌ delete button
* Deleted items marked “pending re-record”

#### 2. **Playback Mode (one at a time)**

* Large full video
* Next/Back buttons
* Delete button
* Shows metadata

### On delete:

* Do **not** remove files immediately
* Mark meta:

```
"status": "deleted"
```

### Inventory update:

* Automatically moves deleted words to "missing" list
* Next time actor records, they are included

### Acceptance Criteria

✔ Grid previews loop
✔ Delete marks correctly
✔ Review and record cycles sync

---

# ✅ **TASK 6 — Integrate Signs Into Gameplay Layout**

**Filename:** `task_gameplay_show_sign_video.md`
**Goal:** Use ASL video (if exists) next to emoji/picture in gameplay.

## Requirements

### Display Logic

If `/asl/signs/<word>/sign_loop.mp4` exists:

```
[ emoji/image ]   [ sign video ]
```

Else:

```
[ emoji/image ]   (no empty placeholder)
```

### Technical Notes

* Autoplay
* Loop
* Mute
* playsinline
* Size consistent with emoji
* Video should not push keyboard out of place

### Acceptance Criteria

✔ Words with videos show side-by-side
✔ Words without videos use default layout
✔ Smooth playback
