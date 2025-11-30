# ✅ **TASK: Move to Automatic Word & Sentence Selection (Adaptive Sequencing Plan)**

**Task type: PLANNING / ARCHITECTURE — NOT IMPLEMENTATION**

## **Goal**

Design an **adaptive sequencing system** that automatically determines which word(s), multi-word phrases, or full sentences should come next for a given learner — without any UI toggles, modes, or manual settings.

The final result should allow:

* A **kindergartner** to start with CVC words
* A **third grader** to see more complex/high-interest words
* A **fifth grader** to receive full sentences
* A **deaf fourth grader** to stay deeply engaged through visuals and ASL
* **All without clicking buttons or turning on sentence mode**
* **Minimal UI**, just the main typing game
* **Right next word** chosen automatically based on learner behavior
* include **spaced repetition**
* **adaptivity based on** engagement prediction
* **log** data safely & efficiently


## **Agent Deliverable**

Produce a **full adaptive sequencing plan**, including:

* Data structures
* Logging strategy
* ML or rule-based options
* Difficulty curves
* Cross-word transitions
* Engagement heuristics
* Safety checks
* Multi-age considerations
* Spanish/ASL integration hooks
* Scalability to hundreds/thousands of words

**Do NOT write code.
Do NOT modify UI.
Think deeply and produce a systems design document.**

---

# 📘 **1. Inputs the system can observe**

The agent must list and describe how to use these signals:

### **Performance signals**

* Accuracy on first letter
* Accuracy overall
* Time per letter
* Time per word/sentence
* Number of retries
* Hesitation/pauses
* Engagement duration
* Which categories the learner lingers on
* Confusion on specific letters (mapping to phonics difficulty curves)

### **Profile signals**

* Grade level
* Age
* Deaf/HoH vs hearing
* Parent-specified goals (optional)
* Reading level calibration from first 20 items

### **Content signals**

* Word frequency tier
* Word difficulty tier
* Sentence complexity
* Orthographic patterns (CVC, consonant blends, digraphs, etc.)

### **Interest signals (emerging from behavior)**

* Words user completes faster → likable
* Words user stumbles on → maybe challenging but sticky
* Categories they enjoy (animals, fantasy, food, tech, etc.)
* “Streak” words where user accelerates → expand that category

---

# 📈 **2. Outputs the system must produce**

The agent must design an algorithm that outputs:

* The **next word**
* The **next phrase**
* The **next sentence**
* When to switch from word → phrase → sentence
* When to switch back if user struggles
* When to repeat vs when to advance
* When to introduce novelty (to maintain engagement)
* When to reintroduce old material (spaced repetition)

---

# 🧠 **3. Architecture the agent must design (planning only)**

The plan should include:

### **A. Difficulty Model**

Define 6–8 levels, for example:

1. CVC words
2. Common nouns
3. High-frequency Dolch
4. Fry extended
5. High-interest words
6. Two-word phrases
7. Simple patterned sentences
8. Complex multi-clause sentences

The algorithm should decide:

* When to move up
* When to move down
* When to stay
* When to mix categories for engagement

### **B. Engagement Model (crucial)**

Kids quit when things are:

* Too hard
* Too boring
* Too repetitive
* Too unpredictable

Design a system that:

* Keeps strong categories alive (animals, food, silly stuff)
* Sprinkles high-interest items every 3–5 items
* Introduces a “surprise” every ~10 items
* Occasionally inserts a joke sentence (“the chicken dances”)

### **C. Personalization layer**

Each profile gets:

* Current difficulty
* Preferred categories
* Weak letters
* Known words
* Unknown words
* Avoid repeating recently completed items
* Insert targeted review at ideal spacings

### **D. Logging Plan**

Every play session appends:

```
{
  profileId,
  timestamp,
  itemPresented: {word | phrase | sentence},
  category,
  difficultyTier,
  timeToCompleteMs,
  errorsByLetter,
  totalErrors,
  usedHints?,
  ragequit?,  // left mid-item
  audioUsed?  or "SpanishAudioUsed?" 
}
```

Stored in localStorage for now, with JSON rotation if size grows.

### **E. ML vs Non-ML Options**

Agent must propose **two tracks**:

#### **Track 1 — Rule-Based (Good for now)**

Simple heuristics:

* If accuracy < 60% for 3 items → drop difficulty
* If streak ≥ 5 and avg time < threshold → raise difficulty
* If user finishes items too quickly → inject high-interest sentences
* If user shows interest in categories → increase weighting

#### **Track 2 — Lightweight ML (Later)**

Use on-device small models (no cloud needed):

* Train a logistic regression or tiny neural net
* Predict engagement score or difficulty fit
* Choose next item maximizing engagement × learnability
* Train on your four kids’ data
* Eventually: online learning, per-profile weighting

**Agent should design both, but NOT implement either yet.**

---

# 🎨 **4. UI Considerations (Respect Tufte Minimalism)**

The agent must:

* Keep *one screen*:
  Image → tiles → keyboard
* No toggles
* No menus
* No “switch to sentence mode”
* No “choose difficulty”

ALL changes must be invisible and automatic.

---

# 🔄 **5. System Behavior Examples (Agent must provide)**

Agent must illustrate (in its plan) example sequences:

### **Kindergartner** (5 yrs old)

cat → dog → pig → big pig → silly pig → “the pig is funny”

### **3rd grader**

pizza → wizard → “the wizard sparkles” → “the pizza flies” (fun!)

### **Deaf student**

Use high-visual words like emoji/animals early
Later:
“the monkey dances”
“the rainbow is bright”

### **5th grader**

Immediately jump to sentences
Introduce multi-clause sentences
Use high-interest categories like tech/fantasy/nature

---

# 📘 **6. ASL Considerations (for planning)**

The agent must design:

* A fallback if ASL video is missing
* A hook so later, ASL data slots into:

  * Single word
  * Phrase
  * Sentence
* A way to gracefully degrade to emoji-only if needed
* ASL should not block sequencing

---

# 🔊 **7. Audio Considerations**

Plan for:

* English word audio
* Spanish word audio
* English sentence audio
* Spanish sentence audio
* Spanish optional (flag)

The sequencing algorithm should decide:

* When to play audio
* Whether audio correlates with difficulty progression
* If audio should pause difficulty advancement
* Whether struggling users need audio support more often

---

# 🎯 **8. Acceptance Criteria**

The agent’s planning document must produce a clear, realistic system design that:

* Eliminates mode switches
* Eliminates settings toggles
* Works across ages K–5
* Adapts automatically
* Maintains engagement
* Guides each child through a coherent reading progression
* Scales to thousands of words and sentences
* Doesn’t rely heavily on LLMs
* Can incorporate ML later
* Preserves minimalist interface

