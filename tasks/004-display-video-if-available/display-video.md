# **position_sign_video.md**

**Task ID:** `T_POSITION_SIGN_VIDEO`
**Goal:** Display the sign-language video (if present) to the **left** of the picture for each word, center the pair together, and ensure fully muted looping video playback.

---

## 📝 **Task Summary**

We now have ASL sign videos for some words. When a video is available, it should appear directly to the **left** of the picture (e.g., CAT sign video next to CAT image). If a video is not available, the layout should gracefully center the single image.

Videos must loop continuously, contain **no audio**, and be programmatically muted to guarantee silent playback across Safari/Chrome/Firefox/iOS.

This task involves updating the **WordCard** (or equivalent) component, adjusting layout and styling, and ensuring robust cross-browser video behavior.

---

# 🎯 **Detailed Requirements**

## **A. Layout Changes**

### What to do:

* Display **video + picture** side-by-side.
* Video on **left**, image on **right**.
* Center the pair horizontally in the GameScreen.
* Maintain vertical alignment.
* Provide a small amount of spacing (e.g., 12–20px) between them.
* Ensure the pair stays centered even as screen size changes.

### What if the word has no video?

* Show **only** the image
* Keep it centered
* No placeholder needed

---

## **B. Video Requirements**

### Must-have behaviors:

* Autoplay on load
* Loop continuously
* Muted (both at asset-level and runtime-level)
* `playsInline` (critical for iOS Safari autoplay)
* Use `poster` thumbnail for pre-load
* Video should be responsive but stable (max height ~200–240px for MVP)

### Required HTML props:

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  src={word.signVideoUrl}
  poster={word.signThumbnailUrl}
>
  <source src={word.signVideoWebmUrl} type="video/webm" />
  <source src={word.signVideoUrl} type="video/mp4" />
</video>
```

The agent should implement this inside a **SignVideo** component (if not already done).

---

## **C. Styling Requirements**

Create or update styles so that:

* Video and image are wrapped in a container, e.g.:

```
<div class="sign-and-image-container">
   <div class="video-wrapper">…</div>
   <div class="image-wrapper">…</div>
</div>
```

* Container uses `flex` layout:

```css
.sign-and-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
```

* Each media item should:

  * Never exceed a max height (e.g., 220px)
  * Maintain aspect ratio
  * Not stretch oddly

* On small screens (if supported), stack vertically instead of left-right.

---

## **D. Component Integration**

The agent should update:

### **1. `WordCard`**

Ensure the component:

* Checks for presence of `word.signVideoUrl`
* Renders `<SignVideo />` only when the video exists
* Always renders the main image
* Wraps both in the `sign-and-image-container`

### **2. `SignVideo` Component**

Add or update the component so it:

* Loops continuously
* Is muted permanently (`muted` attribute plus explicitly set `videoRef.current.muted = true`)
* Supports both `.mp4` and `.webm` sources
* Uses poster fallback

### **3. Update `GameScreen` if needed**

Align the `WordCard` within the UI so it remains centered at the top portion of the screen.

---

# 🔇 **Audio Handling Requirements**

To ensure videos *never* produce sound:

### A. During processing

Videos should be generated using:

```
-an
```

This removes audio tracks entirely.

### B. At runtime

Programmatically enforce:

```tsx
videoRef.current.muted = true;
videoRef.current.volume = 0;
```

This is for redundancy and ensures:

* Safari autoplay compatibility
* No edge-case audio

---

# 🧪 **Acceptance Criteria**

Task is complete when:

1. If a word has a sign video, the **video appears to the left** of the picture.
2. Video and image appear **side-by-side**, centered.
3. If no video exists, the image is centered alone.
4. Video loops smoothly with no visible restart flicker.
5. Video has **no sound**:

   * Audio track removed in processed file
   * Programmatically muted in component
6. Works in Chrome, Firefox, Safari, and iOS Safari.
7. Layout is visually balanced and consistent with the app’s style.

---

# 📦 **Deliverables**

* Updated WordCard implementation
* Updated SignVideo component (or creation if missing)
* Updated CSS or module stylesheet
* Verification in browser
* Small note/log of which words have video detected
