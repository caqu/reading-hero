# Quick Start: Process ASL Sign Videos

This is a quick reference guide to get your ASL sign videos processed and working in the app.

## TL;DR

```bash
# 1. Install FFmpeg (choose one method)
choco install ffmpeg -y          # Chocolatey (as Administrator)
# OR
winget install Gyan.FFmpeg       # winget

# 2. Restart terminal, then process videos
python scripts/process_signs.py

# 3. Done! Videos are ready to use in the app
```

## What You Have

- 2 raw videos ready: `cat.MOV` (9.4MB), `dog.MOV` (13MB)
- Complete processing script: `scripts/process_signs.py`
- React component: `src/components/SignVideo.tsx`
- All code committed to git ✅

## What Happens When You Run the Script

1. **Scans** `public/signs/raw/` for `.MOV` files
2. **Processes** each video:
   - Removes audio
   - Trims 5% from start/end
   - Scales to 720px height
   - Creates MP4 (H.264) and WebM (VP9)
   - Generates PNG thumbnail
   - Compresses to <1MB
3. **Outputs** to:
   - `public/signs/processed/*.mp4` and `*.webm`
   - `public/signs/thumbnails/*.png`
   - `public/signs/manifest.json`

## Expected Results

```
public/signs/processed/
  cat.mp4    (~0.8 MB)
  cat.webm   (~0.7 MB)
  dog.mp4    (~0.8 MB)
  dog.webm   (~0.7 MB)

public/signs/thumbnails/
  cat.png    (~35 KB)
  dog.png    (~32 KB)
```

## Using Videos in the App

Videos are already configured in `src/data/words.ts`:

```typescript
{
  id: 'cat',
  text: 'cat',
  signVideoUrl: '/signs/processed/cat.mp4',
  signVideoWebmUrl: '/signs/processed/cat.webm',
  signThumbnailUrl: '/signs/thumbnails/cat.png',
  // ... other fields
}
```

Use the `SignVideo` component:

```tsx
import { SignVideo } from '@/components/SignVideo';

<SignVideo
  mp4Src={word.signVideoUrl}
  webmSrc={word.signVideoWebmUrl}
  thumbnailSrc={word.signThumbnailUrl}
  alt={`ASL sign for ${word.text}`}
/>
```

## Troubleshooting

### FFmpeg not found?
- Install using command above
- Restart terminal
- Verify: `ffmpeg -version`
- See: `FFMPEG_INSTALLATION.md` for detailed help

### Permission errors?
- Run terminal as Administrator (Windows)
- Check `public/signs/` directory permissions

### Videos too large?
- Script logs warnings if >1MB
- Can adjust quality in `scripts/process_signs.py`

## Adding More Videos

1. Place new `.MOV` file in `public/signs/raw/`
2. Run `python scripts/process_signs.py` (it processes all files)
3. Add video URLs to `words.ts` for that word

## Documentation

- **Processing Guide**: `scripts/README.md`
- **FFmpeg Setup**: `FFMPEG_INSTALLATION.md`
- **Full Report**: `IMPLEMENTATION_REPORT.md`
- **Usage Examples**: `src/components/SignVideo.example.tsx`

## Status

- ✅ All code implemented and committed
- ⏳ Awaiting FFmpeg installation (~5 mins)
- ⏳ Awaiting video processing (~2 mins)
- ⏳ Ready to test in app

Total time to completion: **~10 minutes**
