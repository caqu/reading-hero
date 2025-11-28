# Task 002: Download ASL Dataset and Integrate into Game

**Task ID:** `T_DOWNLOAD_ASL_DATASET`
**Goal:** Download the RWTH-PHOENIX-Weather 2014 T ASL dataset, extract reference frames, and integrate them as sign language reference images in the game.

---

## Summary

Download sample videos from the RWTH-PHOENIX-Weather 2014 T dataset, extract clean reference frames showing ASL signs, and integrate these frames directly into the game as sign language reference images for existing words.

---

## Requirements

### 1. Dataset Selection & Download

Use the **RWTH-PHOENIX-Weather 2014 T** dataset (public, research-friendly).

- Create folder: `/asl_reference/`
- Download **5-10 sample videos** that show clear ASL signs
- Store as: `/asl_reference/sample_asl_video_001.mp4`, etc.

### 2. Extract Reference Frames

For each video:
- Extract a frame at ~1.0-1.5 seconds (or scan for best frame with visible, non-blurred hands)
- Store frames as: `/asl_reference/frames/sign_001.png`, etc.

### 3. Clean and Prepare Frames

For each extracted frame:
- Resize to consistent aspect ratio (square or 4:5 vertical)
- Target size: 512×512 or 768×768
- Optional: Crop to focus on signer
- Optional: Basic background cleanup if straightforward
- Store as: `/asl_reference/cleaned/sign_001_clean.png`

### 4. Map to Existing Words

Create mapping file: `/asl_reference/sign_mapping.json`

```json
{
  "cat": {
    "signVideo": "/asl_reference/sample_asl_video_001.mp4",
    "referenceFrame": "/asl_reference/cleaned/sign_001_clean.png",
    "word": "cat",
    "notes": "ASL sign for cat"
  },
  "dog": {
    "signVideo": "/asl_reference/sample_asl_video_002.mp4",
    "referenceFrame": "/asl_reference/cleaned/sign_002_clean.png",
    "word": "dog",
    "notes": "ASL sign for dog"
  }
}
```

### 5. Integrate into Game

Update word data structure to include ASL references:
- Add `signImageUrl` field to Word type if not already present
- Update words in `src/data/words.ts` to reference the cleaned frames
- Move cleaned frames to `/public/signs/reference/` for serving

Example:
```typescript
{
  id: 'cat',
  text: 'cat',
  imageUrl: '/images/cat.png',
  signImageUrl: '/signs/reference/cat_sign.png',  // NEW
  signVideoUrl: '/signs/processed/cat.mp4',
  difficulty: 'easy',
  syllables: 'cat',
  segments: 'cat'
}
```

### 6. Display in Game

Update WordCard component to show ASL reference image:
- Show the sign reference image alongside or instead of the regular image
- Add toggle or setting to show/hide ASL references
- Ensure images load properly

---

## File Structure

```
/asl_reference/
  ├── sample_asl_video_001.mp4
  ├── sample_asl_video_002.mp4
  ├── ...
  ├── frames/
  │   ├── sign_001.png
  │   ├── sign_002.png
  │   └── ...
  ├── cleaned/
  │   ├── sign_001_clean.png
  │   ├── sign_002_clean.png
  │   └── ...
  └── sign_mapping.json

/public/signs/reference/
  ├── cat_sign.png
  ├── dog_sign.png
  └── ...
```

---

## Acceptance Criteria

✅ 5-10 sample ASL videos downloaded
✅ Reference frames extracted from each video
✅ Frames cleaned and prepared at consistent size
✅ Mapping file created linking signs to words
✅ Frames moved to public directory for serving
✅ Word data updated with signImageUrl
✅ WordCard displays ASL reference images
✅ Images load correctly in game

---

## Deliverables

- `/asl_reference/` folder with videos and frames
- `/asl_reference/sign_mapping.json`
- `/public/signs/reference/*.png` (cleaned reference images)
- Updated `src/types/index.ts` (if needed)
- Updated `src/data/words.ts`
- Updated `src/components/WordCard.tsx` (if needed)

---

## Notes

- Focus on getting real ASL reference images into the game
- No stylization or generation needed for this task
- Use the dataset frames as-is (with basic cleanup only)
- This provides immediate value and real ASL content
