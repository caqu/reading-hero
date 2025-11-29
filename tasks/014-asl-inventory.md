# ✅ **TASK 4 — Create Inventory System for Missing vs. Recorded Signs**

**Goal:** Track which words already have a sign video, and which still need recording.

## Requirements

### Data Sources

1. Primary word list (the 228 emoji→words)
2. `/asl/signs/<word>/meta.json` existence

### Inventory Data Structure

```
{
  missing: ["cat", "dog", ...],
  recorded: ["apple", "banana", ...]
}
```

### On load:

* Scan `/asl/signs` folder for completed signs
* Compare to word list
* Build inventory
* Feed into `/record-signs` page

### Acceptance Criteria

✔ Inventory built on load
✔ Recording page uses inventory to get next word
✔ After uploads, inventory updates
