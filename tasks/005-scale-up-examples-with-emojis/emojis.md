# **scale_with_emojis.md**

**Task ID:** `T_SCALE_WITH_EMOJIS`
**Goal:** Use a standard emoji set to automatically generate a large, replayable word list and integrate emoji-based image substitutes into the app’s workflow. Start with 10 curated emojis, then randomize through the rest indefinitely.

---

## 📝 **Task Summary**

We want to dramatically scale up the number of “words” the app can present by using **emoji** as temporary stand-ins for real pictures/sign videos. This enables:

* Near-infinite replay value
* Instant scalability without gathering new images
* Testing UI flow for large word counts
* New game modes and future behavior
* Stress-testing performance

Emojis will serve as the “picture” for the word, and we will use the textual name of each emoji as the “spelling target.”

This task directs the agent to integrate a standard emoji dataset, generate a large word list, seed with the first 10 custom picks, then allow randomized rotation through the rest.

---

# 🎯 **Detailed Requirements**

## **A. Emoji Source Library**

Agent should choose **one** of the following standard emoji datasets (in this order of preference):

1. **Unicode CLDR Short Names**
2. **Twemoji** (open source, SVG/PNG)
3. **EmojiMart default dataset**
4. **EmojiOne** (if license-compatible)

Agent must verify licensing for non-commercial + commercial potential. All listed above are generally safe if we only use **emoji characters** and their **CLDR names** (not proprietary artwork).

### NOTE:

We will **not** use copyrighted emoji image files.
We will use:

* the emoji **character** (e.g., 😺)
* the **CLDR name** (e.g., “smiling cat face”)
  This is safe for future commercial use.

---

## **B. Word Generation Rules**

Each emoji creates a new “word entry”:

Example:

```ts
{
  id: "smiling_cat_face",
  text: "smiling cat face",
  emoji: "😺"
}
```

Fields to add:

* `emoji: string`
* `emojiDescription: string` (CLDR short name)

We will **not** supply images or videos for emojis.

---

## **C. Integration Into the App**

### 1. Update the `Word` type

Extend your existing type:

```ts
emoji?: string;
emojiDescription?: string;
```

Video fields remain optional.

### 2. Update `WordCard` component

* If a word has an `emoji` field:

  * Display the emoji as the **main visual**
  * Skip the image and video
* Emoji should be shown **centered**, large (e.g., 128–160px)

### 3. Update layout to support emoji

No special styling needed except increasing font size of emoji container.

---

## **D. Word Sequence Logic**

### 1. First 10 should always be your curated words

Let’s define:

```
FIRST_10 = [
  "cat", "dog", "sun", "bed", "mom", "dad", 
  "car", "ball", "tree", "fish"
]
```

### 2. After finishing these 10:

* The next words should be selected from the emoji list.
* They should appear **in random order**, without repeats until the full emoji list is exhausted.
* After one full pass, display the finish screen, on "restart" button pressed then reshuffle and restart.

Agent should build a **shuffle bag** system:

```ts
class ShuffleBag<T> {
  constructor(items: T[]) { ... }
  next(): T { ... }
}
```

---

## **E. Quantity Requirements**

Agent must generate:

* **At least 200 emoji entries**
* Ideally the **full emoji set (3000+)** for stress-testing

Each entry must have:

```ts
emoji
emojiDescription  // CLDR name
id                // slug form of the CLDR name
text              // same as description; used as spelling target
```

Example:

```ts
{
  id: "red_apple",
  text: "red apple",
  emoji: "🍎",
  emojiDescription: "red apple"
}
```

---

## **F. File Output Requirements**

Agent must generate one of the following:

### Option A: Extend `src/data/words.ts`

Append emoji-based words after the first 10.

### Option B: Create a separate file:

```
src/data/emojiWords.ts
```

And import them into the main list:

```ts
import { emojiWords } from "./emojiWords";

export const words = [...FIRST_10_WORDS, ...shuffleList(emojiWords)];
```

Agent may choose the cleaner approach.

---

## **G. Gameplay Behavior**

### Spell the CLDR short name

Example:

* Emoji displayed: 🍕
* Word to type: “pizza”

### When completing emoji words:

Use the **same completion feedback system** (confetti, etc).

### No sign video for emojis.

---

## 🧪 **Acceptance Criteria**

This task is complete when:

1. At least **200 emojis** are integrated into the word list
2. The first 10 curated words always appear first
3. After the first 10, emoji words appear in endless randomized order
4. Emoji rendering works in the UI (large, centered, crisp)
5. Game can be played continuously for >200 words
6. No errors with missing images
7. WordCard gracefully handles:

   * emoji-only entries
   * video entries
   * image entries
8. Spelling target uses the emoji description successfully
9. App loads without performance issues

---

## 📦 **Deliverables**

* Updated `Word` type
* New or extended word list file
* Shuffle bag or randomizer implementation
* Updated WordCard to show emoji
* Verified behavior in GameScreen
* Documentation on extending emoji list
