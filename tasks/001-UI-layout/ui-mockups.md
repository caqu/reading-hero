Below are **high-level UI mockups** for your MVP.

I’m giving you *both*:

1. **ASCII wireframes** you can copy into design docs
2. **Image mockups** using image groups so you can show visual inspiration to your teammates / coding agents

---

# 🖼️ UI MOCKUP SET 1 — VISUAL INSPIRATION

*(Not exact designs — these are just conceptual references to guide layout + styling)*

---

## **Home Screen Inspiration**

---

## **Game Screen — Picture + Tiles + On-Screen Keyboard**

---

## **Keyboard Highlighting / Guided Typing Look**

---

## **Success Screen Inspiration**

---

# 🧱 UI MOCKUP SET 2 — ASCII WIREFRAMES (Copy/Paste into Design Docs)

---

# **1. HOME SCREEN**

```
┌─────────────────────────────────────────────┐
│                                             │
│                  MotorKeys                  │
│          (Motor Memory Typing Game)         │
│                                             │
│                                             │
│                  [ START ]                  │
│                                             │
│                                             │
│             [ Settings ]   [ Help ]         │
│                                             │
└─────────────────────────────────────────────┘
```

Key goals:

* Single big “START” button
* Optional small Settings/Help
* Clean, low-cognitive-load

---

# **2. GAME SCREEN (Core MVP)**

```
┌─────────────────────────────────────────────┐
│ Word 3 of 12                                 │
│----------------------------------------------│
│   [Picture: CAT]      [ASL Sign: CAT]        │
│                                              │
│                                              │
│              C  A  T                         │
│            ( _  _  _ )   <- ghosted tiles    │
│                                              │
│        "Type the letters to spell CAT"       │
│                                              │
│----------------------------------------------│
│   Q  W  E  R  T  Y  U  I  O  P                │
│   A  S  D  F  G  H  J  K  L                   │
│   Z  X  C  V  B  N  M                         │
│                                              │
│   Highlighted key = next correct letter      │
└─────────────────────────────────────────────┘
```

Key goals:

* Picture + optional sign (toggle)
* Tiles showing spelling target
* Big on-screen keyboard
* Highlighted next key

---

# **3. INCORRECT LETTER FEEDBACK**

```
[User pressed "S"]

Tiles: C A _
Keyboard: S key flashes red briefly
Tiles shake slightly (optional)
“Nope, try again!” in subtle text
```

Minimal and non-punitive.

---

# **4. SUCCESS BETWEEN WORDS**

```
┌─────────────────────────────────────────────┐
│           ✔ GREAT JOB!                      │
│                                             │
│         You spelled:   CAT                  │
│                                             │
│        [ Next Word → ]                      │
│                                             │
└─────────────────────────────────────────────┘
```

Short 0.8–1.0 second animation before auto-advancing.

---

# **5. ALL-DONE SCREEN**

```
┌─────────────────────────────────────────────┐
│                YOU DID IT!                  │
│                                             │
│            12 words completed               │
│                                             │
│          [ Play Again ]   [ Home ]          │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 🎨 COLOR & STYLE GUIDELINES

* Large, rounded buttons
* High contrast (dark text on light backgrounds)
* Soft colors (pastel blues/greens/yellows)
* No clutter, minimal text
* Layout should feel like a typing game + flashcard hybrid

