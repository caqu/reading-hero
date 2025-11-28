### **`add_tts_full_word_playback.md`**

---

# **add_tts_full_word_playback.md**

**Task ID:** `T_ADD_TTS_FULL_WORD_PLAYBACK`
**Goal:**
Enable full-word audio playback using Windows SSML TTS. When the user completes a word (last correct letter typed), the system will wait a short configurable delay (e.g., 300–600ms) after the final **letter sound**, then speak the **entire word** (“bed”). Use on-demand Windows TTS generation and local caching just like the letter-sound API.

---

# 📝 **Task Summary**

We want the TTS system to support:

1. **On-demand generation** of full-word audio using **Windows PowerShell SSML**
2. **Local caching** of generated `.wav` files
3. **Automatic playback** of the full word
4. **Delay after last letter sound**
5. **Reuse of existing TTS architecture** (same style as `/api/tts/letter`)
6. Future extensibility for multisyllable or advanced phonics modes

This task creates the foundation for word-level audio in the reading experience.

---

# 🎯 **Detailed Requirements**

---

## **1. New API Endpoint**

Create:

```
GET /api/tts/word?text=<word>
```

### Behavior:

1. Validate the input string
2. Normalize to lower-case
3. Construct expected output file path:

```
/public/audio/words/<word>.wav
```

4. If cached:

   * Return `{ url: "/audio/words/bed.wav" }`

5. If not cached:

   * Generate using Windows PowerShell SSML
   * Save `.wav` file
   * Return URL

### SSML Format:

Use IPA phoneme override only if needed.
Otherwise default Windows TTS will pronounce most short words correctly.

Example:

```xml
<speak version="1.0" xml:lang="en-US">
    <prosody rate="-10%">
        bed
    </prosody>
</speak>
```

Agent should choose a stable rate/voice.

---

## **2. TTS Generation Logic (Windows)**

Use PowerShell:

```powershell
Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SetOutputToWaveFile("bed.wav")
$voice.SpeakSsml("<speak><prosody rate='-10%'>bed</prosody></speak>")
$voice.Dispose()
```

Call via Node’s `child_process.exec()`.

---

## **3. Cache Directory Setup**

If missing, create:

```
/public/audio/words/
```

Use the same caching rules as the letter-sound pipeline:

* Do NOT regenerate if file already exists
* Store `.wav` files with predictable filenames

---

## **4. Timing: Delay Before Playing the Word**

In the front-end typing logic:

1. The user types letters one by one
2. Each letter triggers `/api/tts/letter`
3. When the **last tile** of the word fills:

   * Start a timer (`setTimeout`)
   * Delay ≈ 300–600ms (add config)
   * Then call:

```ts
fetch(`/api/tts/word?text=${word}`)
```

* Then play returned audio URL:

```ts
new Audio(url).play();
```

4. Must NOT block advancement animation
5. Must respect settings (can be toggled in Settings Page later)

---

## **5. Add Config for Timing**

Create/update:

```
src/config/ttsConfig.ts
```

Add:

```ts
export const WORD_COMPLETION_DELAY_MS = 400;
```

Agent may expose this in settings later.

---

## **6. Update GameScreen Integration**

Modify your typing-word checking logic:

* When last letter is correct:

  * Trigger “word-complete” event
  * Kick off the full-word playback pipeline

Ensure this works for:

* Letter-by-letter typing mode
* Falling-letters mode (if implemented later)
* Variants/leveling does not affect TTS

---

## **7. Pre-generation Script (Optional)**

Add a dev command:

```
npm run pregen:words
```

This script loops through current word list (230 words):

* Generates `.wav` for each
* Skips if file already exists
* Logs for QA

Optional but helpful for performance.

---

# 🧪 **ACCEPTANCE CRITERIA**

Feature is complete when:

### ✔ Full-word audio is generated via Windows TTS

### ✔ Cached under `/public/audio/words/`

### ✔ Triggered immediately after last letter, with a delay

### ✔ Does not regenerate audio if file already exists

### ✔ API returns clean JSON with the audio URL

### ✔ Front-end plays audio without blocking gameplay

### ✔ Works on localhost Windows machine

### ✔ Code is consistent with existing `/api/tts/letter` endpoint style

---

# 📦 **DELIVERABLES**

* `/api/tts/word.js` (or similar)
* `/public/audio/words/<word>.wav` (generated)
* Updated `ttsConfig.ts`
* Updated GameScreen logic
* Optional pre-generation script
