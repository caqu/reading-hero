# MotorKeys (MVP)

**Motor-based literacy app for deaf/HoH and low-phonological learners**
**Hackathon Prototype – Week 1**

MotorKeys is a browser-based learning tool that helps children connect **printed words** to **meaning** using **visuals (pictures/signs)** and **motor memory (typing)** instead of relying on sound or phonics.
The MVP focuses on a single game mode: **Guided Typing**.

---

## 🚀 Motivation

Traditional early-literacy apps assume a sound-based decoding pathway:

> letters → sounds → spoken word → meaning

For deaf/HoH kids—or anyone with weak phonological mapping—this breaks down.

MotorKeys replaces phonology with **motor plans**:

> letters → typing pattern → meaning

Children learn to type a word while seeing its **picture and/or ASL sign**, building a stable orthographic → motor → meaning connection.

This prototype delivers a minimal but functional version of that idea.

---

## 🎯 MVP Features

* Runs fully in the browser (no backend).
* 10–20 hardcoded words with placeholder images.
* One end-to-end game mode:

  * **Guided Typing**

    * Show a picture/sign.
    * Show blank tiles for the word.
    * Show on-screen keyboard.
    * Highlight the correct key.
    * User types the word using mouse or physical keyboard.
* Progress tracking (current word, letters typed, attempts).
* Clear visual feedback for correct/incorrect letters.
* Kid-friendly UI with high contrast.
* Works on desktop (mobile optional).

---

## 🧱 Tech Stack

* **React + TypeScript**
* **Vite** for development/build tooling
* **CSS Modules** (or simple CSS)
* **React Hooks** for state
* **Jest + React Testing Library** (unit tests)

---

## 📁 Project Structure (MVP)

```
motorkeys/
 ├── src/
 │   ├── App.tsx
 │   ├── main.tsx
 │   ├── components/
 │   │   ├── HomeScreen.tsx
 │   │   ├── GameScreen.tsx
 │   │   ├── WordCard.tsx
 │   │   ├── OnScreenKeyboard.tsx
 │   │   ├── ProgressBar.tsx
 │   ├── hooks/
 │   │   └── useGameState.ts
 │   ├── data/
 │   │   └── words.ts
 │   ├── types/
 │   │   └── index.ts
 │   ├── styles/
 │       └── global.css
 ├── public/
 │   └── images/ (placeholder images)
 ├── index.html
 ├── package.json
 ├── vite.config.ts
 └── README.md
```

---

## ▶️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open your browser to the URL shown (default: `http://localhost:5173`).

### 3. Build for production

```bash
npm run build
```

### 4. Preview build

```bash
npm run preview
```

---

## 🧩 Game Flow

1. User clicks **Start** on Home Screen.
2. Game shows:

   * Picture/sign for the word.
   * Blank tiles (or ghosted gray word).
   * On-screen keyboard.
3. Child types the word letter-by-letter.
4. Game validates input and provides feedback.
5. When word is complete:

   * Show quick success animation.
   * Move to next word.
6. After final word:

   * Display simple “All Done!” screen.

---

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Focus areas:

* game state transitions
* letter validation
* input handling
* basic render tests

---

## 🧱 Current Limitations (MVP)

* Only one game mode is implemented (Guided Typing).
* No ASL video library yet — only placeholder images.
* No user accounts or saved progress.
* Not optimized for mobile.
* Word list is static.

All of these are planned for later expansions.

---

## 🛣️ Roadmap (Post-MVP)

* Additional modes:

  * Tile drag-and-drop
  * Falling-letter “piano” mode
* Real ASL video integration
* Custom teacher word lists
* Save progress locally or in cloud
* Mobile-optimized UI
* Difficulty modes

---

## 🤝 Contributing

For hackathon use:

* Tasks are managed by the **Master Coding Agent**.
* Sub-agents will handle individual components and features.

Manual contributions are welcome — create PRs with clear commit messages.

---

## 📜 License

MIT (or specify alternative before publishing).
