### **`add_tts_letter_sounds_windows.md`**

This task instructs your coding agent to:

* Create a **local API endpoint** that uses **Windows PowerShell Text-to-Speech**
* Generate **phonetic letter sounds** when a user presses a key
* Cache generated `.wav` or `.mp3` files locally so they don’t need to be re-generated
* Integrate the front-end so keypress triggers the sound
* Set up the architecture so later we can add **full-word audio** (like “bed”) easily

This works for your localhost dev setup and future scalability.

---

# **add_tts_letter_sounds_windows.md**

**Task ID:** `T_ADD_TTS_LETTER_SOUNDS_WINDOWS`
**Goal:**
Add a backend API endpoint that uses **Windows PowerShell Text-to-Speech** to generate **phonetic letter sounds** on demand, cache them locally, and trigger playback on the front-end whenever the user presses a letter while typing a word.

---

# 📝 **Task Summary**

We want the app to support letter-sound feedback for early readers.
When a user presses:

* **b → play “/b/”**
* **e → play “/eh/”**
* **d → play “/d/”**

(and later full-word audio: “bed”)

This feature should:

1. Use **Windows built-in TTS** via PowerShell
2. Support **on-demand generation** (“compute on the fly”)
3. **Cache audio files** locally under `/public/audio/letters/`
4. Provide a **simple REST API** like:

```
GET /api/tts/letter?char=b
```

5. Play the audio immediately on the front-end
6. Never regenerate a file if it already exists
7. Keep the architecture clean so we can later add:

   * word-level audio (`/api/tts/word?text=bed`)
   * phoneme-specific pronunciation guides
   * voice selection
   * cloud TTS fallback option

---

# 🎯 **Detailed Requirements**

---

## **1. Backend Setup (Localhost Only for Now)**

Create a backend directory, e.g.:

```
/api/tts/
```

Inside add a script or Node server (agent may choose Node, Express, Next.js API route, Bun, etc.).

Endpoint:

```
GET /api/tts/letter?char=<a-z>
```

### **Behavior:**

1. Normalize input to lowercase
2. Validate char ∈ a–z
3. Compute the pronunciation string
4. Check cache directory:

```
/public/audio/letters/<char>.wav
```

5. If file exists:

   * Return `{ url: "/audio/letters/b.wav" }`

6. If file does NOT exist:

   * Call Windows PowerShell `Add-Type –AssemblyName System.Speech` to synthesize speech
   * Save output to `.wav`
   * Return URL of newly generated asset

---

## **2. Letter → Phoneme Mapping**

For now, use a default “letter-name phonics” mapping.

Agent should create:

```
src/data/letterSounds.ts
```

Map:

```ts
export const LETTER_SOUNDS = {
  a: "a",
  b: "buh",
  c: "cuh",
  d: "duh",
  e: "eh",
  f: "fuh",
  g: "guh",
  h: "huh",
  ...
};
```

(This is a placeholder; later we can refine phonemes.)

---

## **3. Windows PowerShell TTS Command**

Agent must use something like:

```powershell
Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SetOutputToWaveFile("b.wav")
$voice.Speak("buh")
$voice.Dispose()
```

This must be executed from Node using:

```js
child_process.exec()
```

---

## **4. Audio File Location & Caching**

Generated files stored at:

```
/public/audio/letters/<char>.wav
```

Agent must ensure:

* Directory created if missing
* Safe filename sanitization
* Do not re-generate files that already exist

---

## **5. Front-End Integration**

Modify the typing logic so that:

* When user presses a letter
* If letter is part of the expected word
* Before tile fills → call:

```ts
fetch(`/api/tts/letter?char=${letter}`)
```

* Then play the returned audio URL:

```ts
new Audio(url).play();
```

Audio should play instantly without blocking typing.

---

## **6. Optional Pre-caching Mode (Agent’s Choice)**

Add a script:

```
npm run pregen:letters
```

That:

* Loops through all 26 letters
* Generates all audio files
* Stores them
* Logs skipped ones

This is optional but recommended.

---

## **7. Configuration File**

Create:

```
src/config/ttsConfig.ts
```

With:

* voice parameters
* speaking rate
* volume
* phoneme mapping mode
* backend URL

---

# 🧪 **ACCEPTANCE CRITERIA**

The feature is complete when:

### ✔ Pressing a letter plays the corresponding phonetic sound

### ✔ Sounds are generated on-demand via Windows TTS

### ✔ Sounds are cached in `/public/audio/letters/`

### ✔ API endpoint returns a playable URL

### ✔ No regeneration occurs for existing files

### ✔ System works entirely on localhost

### ✔ UI instantly plays audio without blocking

### ✔ Architecture is ready to support full-word synthesis later

Bonus if:

### ✔ A “Test TTS” button is added in a Settings Page

### ✔ A future `/api/tts/word?text=bed` endpoint is stubbed

---

# 📦 **DELIVERABLES**

* `/api/tts/letter.js` or equivalent
* `/public/audio/letters/*.wav` (auto-generated)
* `src/data/letterSounds.ts`
* `src/config/ttsConfig.ts`
* Integration in typing flow
* Local dev tests
