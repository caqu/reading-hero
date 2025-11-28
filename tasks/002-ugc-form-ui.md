# ✅ **TASK 2 — Build "Create Your Own Word" Form UI**

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

Button at bottom: **"Save Word"**

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
