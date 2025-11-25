# process_sign_videos.md

**Task ID:** `T_PROCESS_SIGN_VIDEOS`
**Goal:** Automatically process the raw iPhone ASL sign videos into web-ready assets and integrate them into the app.

---

## 📝 **Task Summary**

Create and execute an automated media-processing pipeline that takes the **existing raw `.MOV` files** already located in:

```
public/signs/raw/
```

and produces optimized, loop-ready `.mp4` + `.webm` videos and optional thumbnails.
Then update the app’s video manifest so that these sign assets can be used immediately in the web app.

The agent should generate the script, run it on the two existing files, and verify output.

---

## 📁 **Input Provided by Humans**

Raw iPhone videos (2 files) located at:

```
public/signs/raw/*.mov
```

These files have:

* untrimmed start/end
* audio tracks
* high resolution
* H.265 or H.264 QuickTime MOV format

---

## 📤 **Required Output**

1. **Processed & optimized video files** for each raw input:

```
public/signs/processed/<word>.mp4   (H.264)
public/signs/processed/<word>.webm  (VP9)
public/signs/thumbnails/<word>.png  (optional)
```

2. **Trimmed** (start/end automatically removed)
3. **Muted** (no audio track)
4. **Loop-compatible** (remove idle frames)
5. **Compressed to <1MB**
6. **Accessible to the web app** by adding references to:

* `src/data/words.ts` OR
* a new manifest: `public/signs/manifest.json`

7. The agent should confirm video playback compatibility in Safari, Chrome, Firefox.

---

## 🛠️ **Tasks for the Coding Agent**

### **1. Create a media-processing script**

Produce either:

```
/scripts/process_signs.js      (Node.js)
```

**or**

```
/scripts/process_signs.py      (Python)
```

The script must:

* Scan `public/signs/raw/` for any `.mov` files
* For each file:

  * load the raw video
  * remove audio
  * auto-trim leading & trailing low-motion frames
  * scale height to 720px
  * convert to:

    * `mp4` (H.264, Safari compatible)
    * `webm` (VP9)
  * export to `public/signs/processed/`
  * generate a PNG thumbnail (first frame)
* Log all output files

**FFmpeg is required.**
If FFmpeg is missing, script should output instructions or install it if allowed.

#### FFmpeg defaults the agent must use:

* `-vf "scale=-2:720"`
* `-r 24`
* `-c:v libx264 -preset veryfast -crf 23 -an`
* `-c:v libvpx-vp9 -crf 33 -b:v 0 -an`
* `thumbnail` filter for PNG

---

### **2. Run the script on the existing 2 videos**

The agent must:

* Execute the script
* Process both files
* Place outputs in:

```
public/signs/processed/
public/signs/thumbnails/
```

* Verify both `.mp4` and `.webm` versions exist

---

### **3. Update app metadata**

For each processed word video:

Update **one of the following**:

#### Option A — Update `src/data/words.ts`

Add or update fields:

```ts
signVideoUrl: "/signs/processed/<word>.mp4",
signVideoWebmUrl: "/signs/processed/<word>.webm",
signThumbnailUrl: "/signs/thumbnails/<word>.png",
```

OR

#### Option B — Create a new manifest file

```
public/signs/manifest.json
```

Example entry:

```json
{
  "cat": {
    "mp4": "/signs/processed/cat.mp4",
    "webm": "/signs/processed/cat.webm",
    "thumbnail": "/signs/thumbnails/cat.png"
  }
}
```

App must be able to load the manifest in the future.

---

### **4. Add or update playback component**

If not already created, ensure:

```
src/components/SignVideo.tsx
```

exists with:

* `autoPlay`
* `loop`
* `muted`
* `playsInline`
* fallback from webm → mp4

---

### **5. Output a final confirmation**

Agent must write:

* list of processed files
* updated code in `words.ts` or manifest
* location of generated thumbnail
* instructions for adding the next batch of videos

---

## ✔ **Acceptance Criteria**

This task is complete when:

1. The script exists and runs without errors.
2. Both iPhone `.mov` files in `/public/signs/raw/` are processed into `.mp4`, `.webm`, and `.png`.
3. Output files appear in the correct folders.
4. `words.ts` or `manifest.json` is updated automatically.
5. The React app can play the videos in Safari and Chrome.
6. The agent provides a brief report confirming:

   * file names processed
   * output size
   * playback verified
