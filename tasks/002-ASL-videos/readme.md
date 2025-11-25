# **TASK: Ingest, Organize, and Prepare ASL Video Assets from iPhone for Web Playback**

**Task ID:** `T_ASL_ASSET_PIPELINE`
**Category:** Asset Ingestion / Media Processing / Frontend Integration
**Dependencies:**

* Project repo initialized
* `/public/` directory available
* `Word` model with `signVideoUrl` or `signImageUrl` ready

---

## **🏁 Goal**

Build an asset ingestion pipeline that allows the team to:

1. Record ASL sign videos on an iPhone.
2. Transfer them into the project repository.
3. Automatically process and convert them into **web-optimized video formats**.
4. Store them with standardized file names and folders.
5. Expose them to the app via consistent URLs in `words.ts`.
6. Enable simple playback inside the web app (React + HTML `<video>`).

This task should support **iteration**: team members can send new videos at any time and the agent should incorporate them with minimal friction.

---

# **🎥 1. Expected Input From Humans**

Team members will supply:

* Raw ASL video clips recorded on iPhone
* Format: `.MOV` (Apple QuickTime)
* Resolution: typically 1080p or 4K
* Framerate: 30 fps
* Length: 1–3 seconds per sign (loopable)

These will be uploaded into a shared folder or dropped into a designated project location.

---

# **📁 2. Required Output (What the Agent Should Produce)**

The coding agent must produce:

### **A. A canonical folder structure**

In `/public/signs/`:

```
/public/signs/
   /raw/          ← direct iPhone uploads (.MOV)
   /processed/    ← optimized .mp4 and .webm (loop-ready, compressed)
   /thumbnails/   ← optional: auto-generated PNG thumbnails
```

### **B. Cleanly converted video files**

For each raw `.MOV`, generate:

* `wordname.mp4` (H.264, optimized for Safari, iOS, macOS)
* `wordname.webm` (VP9 or AV1, optimized for Chrome, Edge, Firefox)

All videos must:

* Auto-loop cleanly
* Autoplay muted
* Have transparent naming (matching the `Word.id`)
* Be compressed to **< 1MB per clip** for fast game loading
* Be **480p or 720p** (not full iPhone resolution)

### **C. Optional but recommended:**

A static PNG thumbnail captured from the first frame.

### **D. Automatic update of `words.ts`**

For each successfully processed asset, update:

```ts
signVideoUrl: "/signs/processed/cat.mp4"
signVideoWebmUrl: "/signs/processed/cat.webm"
signThumbnailUrl: "/signs/thumbnails/cat.png" // optional
```

---

# **🧰 3. Required Tools & Commands (Agent Must Implement)**

The coding agent should set up a **media processing toolchain**, preferably using:

### **1. FFmpeg (required)**

Must be included in the build scripts.

#### Convert `.MOV` → `.mp4` (H.264)

```
ffmpeg -i input.mov -vf "scale=-2:720" -r 24 -c:v libx264 -preset veryfast -crf 23 -an output.mp4
```

#### Convert `.MOV` → `.webm` (VP9)

```
ffmpeg -i input.mov -vf "scale=-2:720" -r 24 -c:v libvpx-vp9 -crf 33 -b:v 0 -an output.webm
```

#### Generate thumbnail

```
ffmpeg -i input.mov -vf "thumbnail,scale=640:-1" -frames:v 1 thumb.png
```

### **2. Node script or Python script to automate the pipeline**

The agent should create:

```
/scripts/process_signs.js
```

or:

```
/scripts/process_signs.py
```

This script must:

* Watch or scan `/public/signs/raw/`
* Identify new `.MOV` files
* Process each into mp4 + webm + jpg/png
* Save to `processed/` + `thumbnails/`
* Update `/src/data/words.ts` or produce a JSON manifest consumed by the app

---

# **🧩 4. Processing Rules**

The agent must enforce:

### **File naming**

Match the file to the word ID:

* Raw file: `cat.mov`
* Processed: `cat.mp4`, `cat.webm`
* Thumbnail: `cat.png`

Do NOT change the spelling of word IDs.

### **Compression rules**

* Target ≤ 1MB videos
* Height 720px (width auto)
* 24 fps
* No audio (`-an`)
* Try to maintain sign clarity (don’t overly compress)

### **Loopability**

Trim leading/trailing frames if iPhone recording has 0.2–0.4 sec idle movement.

### **Encoding compatibility**

* Safari requires `.mp4` (H.264)
* Chrome/Firefox prefer `.webm` (VP9/AV1)

Agent must produce both.

---

# **🌐 5. Web Playback Requirements (React)**

Agent must implement a reusable component:

`<SignVideo wordId="cat" />`

With:

```tsx
export function SignVideo({ word }: { word: Word }) {
  return (
    <video
      src={word.signVideoUrl}
      autoPlay
      loop
      muted
      playsInline
      width={240}
      height="auto"
      poster={word.signThumbnailUrl}
    >
      <source src={word.signVideoWebmUrl} type="video/webm" />
      <source src={word.signVideoUrl} type="video/mp4" />
      Your browser does not support embedded videos.
    </video>
  );
}
```

Requirements:

* Autoplay quietly
* No controls
* Looped
* Use poster (thumbnail) for loading
* Supports Safari, Chrome, Firefox, Edge, iPad, iPhone

---

# **🔁 6. Update Workflow**

The coding agent must create documentation + script so team members can:

1. Drop new `.MOV` files into `/public/signs/raw/`
2. Run:

```
npm run process-signs
```

or

```
python scripts/process_signs.py
```

3. The script will:

   * Process assets
   * Generate conversions
   * Output logs
   * Update the manifest and/or `words.ts`
4. App automatically starts using updated assets.

---

# **📜 7. Acceptance Criteria**

This task is done when:

* A folder pipeline exists (`raw → processed → thumbnails`)
* FFmpeg conversion works end-to-end
* A script can ingest any new iPhone video and correctly process it
* The React `<SignVideo />` component plays videos properly
* Word assets show up automatically in the game
* Documentation exists for human team members to use the pipeline
