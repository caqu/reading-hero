# ✅ **TASK 5 — Add "Report / Remove" Button for UGC Words**

**Goal:** Provide a way to hide UGC words from rotation without deleting files.

---

## **Requirements**

### Button Placement

On the gameplay screen, when a UGC word appears:

* Show a small trashcan icon 🗑️ in a corner
* Only show for `source=user`

### Behavior

On click:

```
PATCH /api/ugc/word/<word>
```

Payload:

```json
{
  "active": false
}
```

This:

* Updates registry
* Updates the local word's `data.json`

### Acceptance Criteria

✔ UGC words can be removed from play
✔ Words remain on disk
✔ Registry is updated
