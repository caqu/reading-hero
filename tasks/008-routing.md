**`add_routing_with_url_params.md`**

It tells your coding agent exactly how to add routing + URL synchronization so that:

* You can type a URL like `/?word=cat` and load the “cat” item directly
* Navigating from one word to the next updates the URL param
* No full-page refresh occurs
* Everything stays in sync with your internal state

---

# **add_routing_with_url_params.md**

**Task ID:** `T_ADD_ROUTING_WITH_URL_PARAMS`
**Goal:** Add URL routing with query parameters so that specific words can be navigated to directly via the URL (e.g., `/?word=cat`). The URL should automatically update when the current word changes, without full reloads. The internal word state and the URL query parameters must stay synchronized at all times.

---

# 📝 **Task Summary**

The app currently selects and advances through words internally, but has no routing.
We need to introduce URL-based routes so that:

1. A user can open the app at a specific word using a URL query parameter, e.g.:

```
https://myapp.com/?word=cat
```

2. Whenever the user advances to the next word, the browser URL updates automatically (using `history.pushState` or navigation API)—**without** refreshing the page.

3. When navigating back and forward in the browser, the app should update the displayed word accordingly.

This turns the app into a fully sharable, linkable, navigation-friendly web app.

---

# 🎯 **Detailed Requirements**

## A. Add Routing Support

The agent may use:

* **React Router**, **OR**
* Native `URLSearchParams` and `history.pushState`
  (choose the minimal and clean solution)

If React Router is used, it DOES NOT need page-level routes—just a wrapper for query parameters is fine.

---

## B. Parse the `word` Query Parameter on App Load

When the app loads:

1. Read `window.location.search`
2. Parse `?word=<id>` (or whatever naming the agent decides)
3. Check if that word exists in the `words` list
4. If it does:

   * Set the app’s current word to that entry
5. If not:

   * Default to the first word in sequence

Example typical URLs:

```
/?word=cat
/?word=monkey_face
/?word=red_apple
```

---

## C. Sync Word Changes with URL

Whenever the app transitions to a new word—whether because the learner typed the previous one correctly or the user pressed "Next"—the URL must update:

### Required behavior:

* No full reload
* No unmounting the whole app
* Browser back/forward buttons navigate between words

### Implementation notes:

Use:

```
history.pushState({}, "", `/?word=${currentWord.id}`);
```

Or, if using React Router:

```
navigate(`/?word=${currentWord.id}`, { replace: false });
```

Be sure *not* to break the existing game flow.

---

## D. React to Browser Navigation (Back/Forward)

Enable:

* Press back → load previous word
* Press forward → load next word

The app must listen to:

```
window.onpopstate
```

and update the internal `currentWord` index accordingly.

---

## E. URL Should Always Reflect the Word List’s *Internal State*

When the leveling engine changes the word sequence, or when emojis/words shuffle, the URL should continue to point to:

```
?word=<id>
```

not to numeric indexes.

Use **word IDs** as the canonical identifier.

---

## F. Consistency Rules

1. If the user manually edits the URL word ID while the app is running, the app should navigate to that new word smoothly.
2. If the user tries a word not in the list:

   * Redirect to default word (first in sequence)
   * Update URL to reflect that fallback
3. All navigation must be instant, never reload the page.

---

## G. Hook or Service

Create a helper:

```
src/hooks/useWordRouting.ts
```

This hook should provide:

```ts
{
  currentWordId,
  setWordId(id: string),    // updates UI and URL
  initializeFromURL(),      // parse URL on load
  syncURLToWordId(id),      // ensures URL stays in sync
}
```

All the URL logic should be centralized here, not scattered.

---

# 🧪 **Acceptance Criteria**

This task is complete when:

### ✔ Direct navigation works

Going to `/?word=cat` loads the cat word.

### ✔ Advancing words updates the URL

Completing a word pushes a new URL, no full page reload.

### ✔ Browser back/forward works

Pressing back navigates to the previous word.

### ✔ URL and internal state always match

If you refresh the page on `?word=dog`, the app loads dog.

### ✔ Invalid words fallback

`/?word=bananasandwich` defaults gracefully.

### ✔ Clean code integration

URL logic is isolated in a hook or small routing module.

---

# 📦 **Deliverables**

* New routing hook or integration with React Router
* Updated GameScreen or App component to initialize from URL
* Logic to push new URL entries on word changes
* popstate handler for browser navigation
* Tests or console checks verifying URL sync
* Documentation in code comments
