# Task 003: POC for Stylized ASL Image Generation

**Task ID:** `T_ASL_STYLIZATION_POC`
**Goal:** Create a proof-of-concept pipeline to convert ASL reference images into stylized illustrations matching our app's visual style.

---

## Summary

Build a flexible image generation pipeline that can take ASL reference frames and produce stylized versions using either local models or external API endpoints. This is a POC to validate the approach before scaling to the full dataset.

---

## Requirements

### 1. Create Image Generator Module

Create: `src/engine/ASLImageGenerator.ts`

This module should support two modes:
- **Option A**: Local image generation (if models available)
- **Option B**: External API endpoint (AWS Bedrock, Stable Diffusion API, etc.)

### 2. Style Guide Prompt

Create: `/asl_reference/style_guide.txt`

Default prompt:
```
Recreate this sign pose in our house art style: watercolor wash textures,
soft Pixar-like lighting, gentle character proportions, expressive hands,
clear handshape accuracy, friendly educational tone. Preserve pose and
handshape fidelity. Remove background. Output transparent PNG.
```

### 3. Generator Interface

```typescript
interface ASLImageGeneratorConfig {
  mode: 'local' | 'external';
  endpoint?: string;  // For external mode
  apiKey?: string;    // For external mode
  styleGuidePath: string;
}

interface GenerationRequest {
  referenceImagePath: string;
  outputPath: string;
  word: string;
  additionalPrompt?: string;
}

interface GenerationResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  metadata: {
    prompt: string;
    sourceFrameHash: string;
    timestamp: number;
    settings: any;
  };
}

async function generateStylizedImage(
  request: GenerationRequest,
  config: ASLImageGeneratorConfig
): Promise<GenerationResult>
```

### 4. Option A - Local Generation (If Available)

If local models are available:
- Load style guide prompt
- Use Stable Diffusion or similar model
- Pass reference image + style prompt
- Generate stylized output
- Save to output path

### 5. Option B - External API

If using external endpoint:
- Prepare payload with:
  - Base64 encoded reference image
  - Style guide prompt
  - Generation parameters
- POST to configurable endpoint
- Handle response and save image
- Retry logic for failures

### 6. Metadata Storage

For each generated image, create metadata file:
`/asl_reference/generated/sample_sign.meta.json`

```json
{
  "word": "cat",
  "sourceFrame": "/asl_reference/cleaned/sign_001_clean.png",
  "sourceFrameHash": "abc123...",
  "stylePrompt": "Recreate this sign...",
  "generatedAt": 1234567890,
  "settings": {
    "model": "stable-diffusion-xl",
    "steps": 30,
    "cfg_scale": 7.5
  },
  "outputPath": "/public/generated/asl/cat_sign.png"
}
```

### 7. Demo Preview Page

Create: `src/pages/ASLPreviewPage.tsx`

Should show:
- Reference frame (original)
- Stylized output (generated)
- Style prompt used
- Generation metadata
- "Regenerate" button
- "Try different word" button
- Side-by-side comparison

### 8. Configuration

Add to `.env.local`:
```
# ASL Image Generation
ASL_GEN_MODE=external          # 'local' or 'external'
ASL_GEN_ENDPOINT=              # External API endpoint (if using external mode)
ASL_GEN_API_KEY=               # API key (if required)
ASL_DATASET_PATH=/asl_reference
ASL_GEN_OUTPUT_PATH=/public/generated/asl
```

### 9. CLI Script for Batch Generation

Create: `scripts/generate-asl-images.ts`

Command to generate stylized images for all mapped signs:
```bash
npm run generate-asl
```

Should:
- Read sign_mapping.json
- For each sign, call ASLImageGenerator
- Save outputs to /public/generated/asl/
- Generate metadata files
- Show progress and summary

---

## POC Scope

For the POC, generate stylized images for **3-5 words only** to validate:
- Pipeline works end-to-end
- Style guide produces acceptable results
- Both local and external modes function
- Metadata is properly captured
- Preview page displays correctly

---

## File Structure

```
/asl_reference/
  ├── style_guide.txt
  ├── generated/
  │   ├── cat_sign.meta.json
  │   ├── dog_sign.meta.json
  │   └── ...

/public/generated/asl/
  ├── cat_sign.png
  ├── dog_sign.png
  └── ...

/src/engine/
  └── ASLImageGenerator.ts

/src/pages/
  └── ASLPreviewPage.tsx

/scripts/
  └── generate-asl-images.ts
```

---

## Acceptance Criteria

✅ ASLImageGenerator module implemented with both modes
✅ Style guide prompt created
✅ At least 3 stylized ASL images generated
✅ Metadata files created for each generation
✅ Demo preview page shows side-by-side comparison
✅ Configuration via .env.local works
✅ Batch generation script functional
✅ Error handling for failed generations
✅ Can switch between local/external modes

---

## Deliverables

- `src/engine/ASLImageGenerator.ts`
- `src/pages/ASLPreviewPage.tsx`
- `scripts/generate-asl-images.ts`
- `/asl_reference/style_guide.txt`
- `/public/generated/asl/*.png` (3-5 samples)
- `/asl_reference/generated/*.meta.json`
- `.env.local` template with ASL_GEN_* variables
- Documentation on how to use both modes

---

## Notes

- This is a POC - focus on proving the concept works
- Don't generate all images yet, just 3-5 samples
- If local generation isn't available, focus on external API option
- Style guide can be refined after reviewing initial outputs
- Pipeline should be extensible for future batch processing
