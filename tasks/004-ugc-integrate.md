# ✅ **TASK 4 — Integrate UGC Words Into Gameplay Rotation**

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
