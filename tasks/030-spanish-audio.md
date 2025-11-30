# ✅ **TASK: Add Spanish Audio Generation + Playback After Word Completion**

## **Goal**

After a word is fully typed (e.g., “shark”), the system currently:

1. Calls backend API to generate a **WAV file** via PowerShell TTS (“shark” in English).
2. Saves the WAV to disk.
3. Serves it back to the browser and plays it.

We will extend this behavior so that **after the English audio plays**, a **Spanish audio version** also plays.

**Sequence:**

1. English (male voice)
2. Spanish (female voice)

Both should use the same generate-save-serve-cache workflow.

This feature must be **toggable** via a configuration flag.

---

# 🌐 **1. Add a Feature Flag**

Create a config value:

```ts
ENABLE_SPANISH_TTS = true;
```

When `false`:
→ Only English audio plays (current behavior).

When `true`:
→ English audio **then** Spanish audio.

---

# 🔊 **2. Add New Spanish Audio Generation Logic to Backend**

### Reuse Existing TTS Workflow:

* Uses PowerShell `System.Speech.Synthesis.SpeechSynthesizer`
* Generates WAV on the server
* Saves to local filesystem
* Returns file URL to browser

### Create a new function:

```
POST /api/tts/spanish
```

**Inputs:**

```json
{ "word": "shark", "translation": "tiburón" }
```

**Output:**

* Path to generated Spanish .wav file
  e.g. `/sounds/spanish/shark-tiburon.wav`

### Requirements:

* Use *female* Spanish voice
  (PowerShell voice example: `"Microsoft Sabina Desktop"` or `"Microsoft Helena"` — agent should detect installed Spanish voices)

* Save Spanish WAVs in a **different directory**:

```
/sounds/spanish/<word>-es.wav
```

* File naming must be deterministic.
* If file already exists → **reuse**, don’t regenerate.

---

# 📘 **3. How to Get the Spanish Translation**

For now, **do not call an external API**.

Instead:

* Use a temporary simple dictionary file on the backend:
  `/src/data/spanishTranslations.ts`

Example:

```ts
export const spanishTranslations = {
  shark: "tiburón",
  pizza: "pizza",
  wizard: "mago",
  // … add as needed
};
```

If a word is missing, skip Spanish.

---

# 🎧 **4. Extend the Existing Word-Completion Flow on Frontend**

When user finishes typing the last tile:

1. Play **English WAV** as usual.
2. If `ENABLE_SPANISH_TTS === true`:

   * Fetch the Spanish WAV URL.
   * Wait for English audio to end.
   * Then play Spanish audio.

### Audio playback order:

```ts
await playAudio(englishUrl);
if (ENABLE_SPANISH_TTS) {
    await playAudio(spanishUrl);
}
```

Implement in the same audio subsystem used for English.

---

# 🗂 **5. Add Spanish WAV Caching Logic**

Similar to English:

* If the same (word, translation) was previously generated, do NOT regenerate.
* Serve the existing file.
* If file corrupted or missing, regenerate automatically.

---

# 📁 **6. Folder Structure**

Ensure these directories exist:

```
/sounds/
/sounds/english/
/sounds/spanish/
```

Backend auto-creates directories on startup if missing.

---

# 🔄 **7. Add Spanish Audio Generation to the English TTS Endpoint**

Modify English TTS endpoint to also request Spanish generation:

Workflow:

```
POST /api/tts/english
    ↳ check if english wav exists
    ↳ generate if not
    ↳ return englishUrl, spanishUrl
```

So frontend receives:

```json
{
  "englishUrl": "/sounds/english/shark.wav",
  "spanishUrl": "/sounds/spanish/shark-es.wav"
}
```

---

# 🎵 **8. Testing Requirements**

The agent must test both:

### ✔ First-time generation:

* English + Spanish WAV both generated
* Played sequentially

### ✔ Replay:

* No regeneration
* Loads instantly and plays both

### ✔ Missing translation:

* Only English audio plays
* No errors

---

# 🔐 **9. Safety + Isolation**

Spanish WAV generation MUST NOT interfere with:

* Phoneme letter-sounds
* The existing cached English words
* Main loop timing
* Leveling or stats

All Spanish files must stay in `/sounds/spanish`.

---

# 🎯 **Acceptance Criteria**

1. After completing “shark”, I hear:

   * **“shark”** (male English voice)
   * **“tiburón”** (female Spanish voice)
     — in sequence

2. Spanish can be enabled/disabled via a flag.

3. WAV files persist across refreshes.

4. Folder structure is correct and files are cached.

5. No visual UI changes. Minimalist layout preserved (Tufte-style).

6. If the Spanish word isn't in dictionary, English still works perfectly.
