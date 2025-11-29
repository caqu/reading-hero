# ✅ **TASK 3 — Backend Endpoint & Processing for Recorded Videos**

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
