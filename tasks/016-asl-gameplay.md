# ✅ **TASK 6 — Integrate Signs Into Gameplay Layout**

**Goal:** Use ASL video (if exists) next to emoji/picture in gameplay.

## Requirements

### Display Logic

If `/asl/signs/<word>/sign_loop.mp4` exists:

```
[ emoji/image ]   [ sign video ]
```

Else:

```
[ emoji/image ]   (no empty placeholder)
```

### Technical Notes

* Autoplay
* Loop
* Mute
* playsinline
* Size consistent with emoji
* Video should not push keyboard out of place

### Acceptance Criteria

✔ Words with videos show side-by-side
✔ Words without videos use default layout
✔ Smooth playback
