# ✅ **TASK 3 — Backend: Handle File Uploads & Save UGC Word Metadata**

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
