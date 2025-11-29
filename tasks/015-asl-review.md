# ✅ **TASK 5 — Review Mode (Batch Playback + Deletion)**

**Goal:** Let director review all recordings efficiently and mark bad ones for deletion.

## Requirements

### New route:

```
/review-signs
```

### Two View Modes:

#### 1. **Grid Mode (9×9 wall)**

* 81 simultaneous looping previews
* Scrollable
* Each preview has a small ❌ delete button
* Deleted items marked "pending re-record"

#### 2. **Playback Mode (one at a time)**

* Large full video
* Next/Back buttons
* Delete button
* Shows metadata

### On delete:

* Do **not** remove files immediately
* Mark meta:

```
"status": "deleted"
```

### Inventory update:

* Automatically moves deleted words to "missing" list
* Next time actor records, they are included

### Acceptance Criteria

✔ Grid previews loop
✔ Delete marks correctly
✔ Review and record cycles sync
