# ✅ **TASK 1 — Add “Create Your Own Word” Button & Page Routing**

**Filename:** `task_add_create_your_own_button_and_route.md`
**Goal:** Add a left-bar button “Create Your Own” that routes to a new page.

---

## **Requirements**

### **1. Add a Button to Left Sidebar**

* Label: **“Create Your Own”**
* Emoji/icon: 🖍️ or ✏️
* Position: Under **Profiles** and **Stats**

### **2. Add Route**

Create a new page:

```
/src/pages/CreateYourOwnPage.tsx
```

Accessible via internal router:

```
/create
```

### **3. Update URL sync**

* Navigating to the page updates URL without reload
* Sidebar button reflects active state

### **4. Layout Scaffold**

On this new page, include placeholders for:

* Word input
* Syllabification input
* Segments input
* Image upload
* Drawing canvas
* Camera capture
* Save button

No logic yet—just the structure.

### **Acceptance Criteria**

✔ Button appears in sidebar
✔ URL navigates correctly
✔ Page scaffold loads
✔ No backend yet

---

# ✅ **TASK 2 — Build “Create Your Own Word” Form UI**

**Filename:** `task_build_cyo_form_ui.md`
**Goal:** Build the actual UI elements inside `CreateYourOwnPage`.

---

## **Requirements**

### **Form Fields**

Add a form with the following inputs:

* **Word** (text)
* **Syllables** (text or array input)
* **Segments** (text or array input)
* **Description** (optional)
* **Category** (optional)
* **Image Source Options:**

  1. Upload a PNG/JPG
  2. Draw your own (simple canvas)
  3. Take photo using webcam

### **Canvas**

Create:

```
<CanvasDrawArea />
```

Requirements:

* Simple freehand drawing
* Black strokes, white background
* Export as PNG

### **Webcam**

Use getUserMedia:

```
Take Photo → Save as PNG
```

### **Preview Area**

Show a preview of:

* Rendered word
* Generated image
* Syllables / segments

### **Save Button**

Button at bottom: **“Save Word”**

### **Validation**

* Word cannot be empty
* Must have one image from one of the three sources
* Syllables/segments optional for now

### **Acceptance Criteria**

✔ UI fully built
✔ Canvas works
✔ Webcam works
✔ File upload works
✔ Preview updates

---

# ✅ **TASK 3 — Backend: Handle File Uploads & Save UGC Word Metadata**

**Filename:** `task_backend_save_ugc_word.md`
**Goal:** Add a backend API endpoint that stores user-generated words + their images locally.

---

## **Requirements**

### **1. New Endpoint**

Create:

```
POST /api/ugc/word
```

Payload:

```json
{
  "word": "sam",
  "syllables": ["sam"],
  "segments": ["s", "a", "m"],
  "imageType": "upload | canvas | camera",
  "imageData": "<base64 PNG>",
  "createdAt": 123456789
}
```

### **2. Storage on Filesystem**

Create:

```
/ugc/words/<word>/
```

Inside:

* `image.png`
* `data.json`

### **3. Schema**

Store `data.json` as:

```json
{
  "word": "sam",
  "syllables": ["sam"],
  "segments": ["s","a","m"],
  "imagePath": "/ugc/words/sam/image.png",
  "source": "user",
  "createdAt": "...",
  "active": true
}
```

### **4. Add to UGC Registry**

Also maintain:

```
/ugc/registry.json
```

As an array of all UGC words.

### **Acceptance Criteria**

✔ POST saves image file
✔ POST saves data.json
✔ Registry updates
✔ Word appears on next app refresh

---

# ✅ **TASK 4 — Integrate UGC Words Into Gameplay Rotation**

**Filename:** `task_integrate_ugc_into_rotation.md`
**Goal:** Make UGC words appear in the same rotation system as built-in words/emojis.

---

## **Requirements**

### **1. Extend Word Loader**

Modify your word-loading code so that:

* Built-in words load normally
* If `ugc/registry.json` exists, load all active entries
* Merge both lists into unified word list
* Preserve the same attributes:

  * image
  * word
  * syllables
  * segments

### **2. Leveling**

* UGC words bypass leveling rules (for now)
* They simply show in rotation randomly

### **3. URL Routing**

When a UGC word is active:

```
?word=user:sam
```

### **Acceptance Criteria**

✔ UGC words appear when playing
✔ UI behaves normally
✔ Sounds + TTS work
✔ URL params support user words

---

# ✅ **TASK 5 — Add “Report / Remove” Button for UGC Words**

**Filename:** `task_report_ugc_words.md`
**Goal:** Provide a way to hide UGC words from rotation without deleting files.

---

## **Requirements**

### Button Placement

On the gameplay screen, when a UGC word appears:

* Show a small trashcan icon 🗑️ in a corner
* Only show for `source=user`

### Behavior

On click:

```
PATCH /api/ugc/word/<word>
```

Payload:

```json
{
  "active": false
}
```

This:

* Updates registry
* Updates the local word’s `data.json`

### Acceptance Criteria

✔ UGC words can be removed from play
✔ Words remain on disk
✔ Registry is updated

---

# ✅ **TASK 6 — “Manage My Words” Page**

**Filename:** `task_manage_ugc_page.md`
**Goal:** Provide UI to browse all user-created words and restore deleted ones.

---

## **Requirements**

### Route:

```
/my-words
```

### Features:

* List all UGC entries
* Show thumbnail + word
* Button to restore removed words
* Button to permanently delete
* Button to preview the word

### Acceptance Criteria:

✔ Works locally
✔ Allows toggling active/inactive
✔ Easy navigation for kids

---

# 🔥 OPTIONAL ENHANCEMENTS (Later Tasks)

If you want, I can also generate tasks for:

* TTS for UGC full words (autogenerated audio)
* Auto-syllabification (simple model)
* Auto-segmentation into phonemes
* Sharing UGC words between siblings (export/import)
* Local-only encryption to protect photos
* Age-appropriate drawing filters
* Style-transfer to convert photos into cartoon avatars
