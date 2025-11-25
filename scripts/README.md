# ASL Sign Video Processing

This directory contains scripts and documentation for processing ASL sign language videos for the Reading Hero application.

## Overview

The video processing pipeline converts raw iPhone `.MOV` recordings into optimized web-ready video formats:

- **Input**: Raw `.MOV` files from iPhone recordings
- **Output**:
  - `.mp4` files (H.264, Safari/iOS compatible)
  - `.webm` files (VP9, modern browsers)
  - `.png` thumbnails

## Quick Start

### Prerequisites

1. **FFmpeg** must be installed on your system.

#### Installing FFmpeg on Windows

Choose one of the following methods:

**Option 1: Using Chocolatey (Recommended)**
```bash
choco install ffmpeg -y
```

**Option 2: Using winget**
```bash
winget install Gyan.FFmpeg
```

**Option 3: Using Scoop**
```bash
scoop install ffmpeg
```

**Option 4: Manual Installation**
1. Download from [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)
2. Extract the archive
3. Add the `bin` folder to your PATH environment variable
4. Restart your terminal

#### Verify FFmpeg Installation

After installation, restart your terminal and verify:

```bash
ffmpeg -version
```

You should see FFmpeg version information.

### Processing Videos

1. **Place raw videos** in the input directory:
   ```
   public/signs/raw/word.MOV
   ```

2. **Run the processing script**:
   ```bash
   python scripts/process_signs.py
   ```

3. **Check the output** in:
   ```
   public/signs/processed/word.mp4
   public/signs/processed/word.webm
   public/signs/thumbnails/word.png
   ```

4. **Update the app** by adding video URLs to `src/data/words.ts`:
   ```typescript
   {
     id: 'word',
     text: 'word',
     imageUrl: '/images/word.png',
     signImageUrl: '/images/word.png',
     signVideoUrl: '/signs/processed/word.mp4',
     signVideoWebmUrl: '/signs/processed/word.webm',
     signThumbnailUrl: '/signs/thumbnails/word.png',
     difficulty: 'easy'
   }
   ```

## Current Status

### Existing Raw Videos

The following raw videos are ready to be processed:
- `public/signs/raw/cat.MOV`
- `public/signs/raw/dog.MOV`

### Processing Requirements

Once FFmpeg is installed, running `python scripts/process_signs.py` will:

1. Scan for all `.MOV` files in `public/signs/raw/`
2. For each video:
   - Remove audio tracks
   - Auto-trim leading/trailing frames (5% from each end)
   - Scale to 720px height
   - Convert to both MP4 (H.264) and WebM (VP9)
   - Compress to target <1MB per file
   - Generate PNG thumbnail
3. Create output in:
   - `public/signs/processed/` (videos)
   - `public/signs/thumbnails/` (thumbnails)
4. Generate `public/signs/manifest.json` with all processed videos

## Technical Details

### Video Processing Specifications

#### MP4 (H.264) - Safari/iOS Compatible
- **Codec**: H.264 (libx264)
- **Resolution**: 720px height, auto-width (maintains aspect ratio)
- **Frame Rate**: 24 fps
- **Quality**: CRF 23 (constant rate factor)
- **Preset**: veryfast
- **Audio**: Removed
- **Optimizations**: Fast start enabled for web streaming

#### WebM (VP9) - Modern Browsers
- **Codec**: VP9 (libvpx-vp9)
- **Resolution**: 720px height, auto-width
- **Frame Rate**: 24 fps
- **Quality**: CRF 33 (VP9 is more efficient than H.264)
- **Bitrate**: Variable (b:v 0)
- **Audio**: Removed

#### Thumbnails
- **Format**: PNG
- **Resolution**: 360px height
- **Source**: Frame at 1 second (or 0.5s after trim start)

### Auto-Trimming

The script automatically trims 5% from the start and end of each video to remove:
- Pre-recording setup time
- Post-recording idle frames

This can be adjusted in the `auto_trim_video()` function if needed.

### File Size Targets

- **Videos**: Target <1MB per file
- **Thumbnails**: Typically 20-50KB

If files exceed 1MB, the script will log a warning. You can adjust compression settings:
- Increase CRF value (lower quality, smaller file)
- Reduce frame rate
- Reduce resolution

## Directory Structure

```
public/signs/
├── raw/                    # Input: Raw .MOV files from iPhone
│   ├── cat.MOV
│   └── dog.MOV
├── processed/              # Output: Optimized videos
│   ├── cat.mp4
│   ├── cat.webm
│   ├── dog.mp4
│   └── dog.webm
├── thumbnails/             # Output: Video thumbnails
│   ├── cat.png
│   └── dog.png
└── manifest.json          # Auto-generated video manifest

scripts/
├── process_signs.py       # Main processing script
└── README.md             # This file

src/
├── types/index.ts        # Updated with video URL fields
├── data/words.ts         # Updated with video URLs
└── components/
    └── SignVideo.tsx     # Video playback component
```

## Using the SignVideo Component

The `SignVideo` component automatically handles:
- Video format fallback (WebM → MP4 → thumbnail)
- Autoplay with loop
- Mobile compatibility (playsInline)
- Loading states
- Error handling

### Basic Usage

```tsx
import { SignVideo } from '@/components/SignVideo';

function WordDisplay({ word }) {
  return (
    <SignVideo
      mp4Src={word.signVideoUrl}
      webmSrc={word.signVideoWebmUrl}
      thumbnailSrc={word.signThumbnailUrl}
      alt={`ASL sign for ${word.text}`}
      width="400px"
    />
  );
}
```

### Component Props

- `mp4Src`: URL to MP4 video (Safari/iOS compatible)
- `webmSrc`: URL to WebM video (modern browsers)
- `thumbnailSrc`: URL to thumbnail image (fallback)
- `alt`: Accessibility text
- `className`: CSS class name
- `showControls`: Show video controls (default: false)
- `width`: Video width (default: 100%)
- `height`: Video height (default: auto)

## Adding New Videos

To add new ASL sign videos:

1. **Record the video** on iPhone in `.MOV` format
   - Keep recording short (2-5 seconds)
   - Ensure good lighting
   - Center the signer in frame
   - Use a clean background

2. **Name the file** with the word name (lowercase):
   ```
   word.MOV
   ```

3. **Place in raw directory**:
   ```
   public/signs/raw/word.MOV
   ```

4. **Run the processing script**:
   ```bash
   python scripts/process_signs.py
   ```

5. **Update words.ts** with the new video URLs:
   ```typescript
   {
     id: 'word',
     text: 'word',
     imageUrl: '/images/word.png',
     signImageUrl: '/images/word.png',
     signVideoUrl: '/signs/processed/word.mp4',
     signVideoWebmUrl: '/signs/processed/word.webm',
     signThumbnailUrl: '/signs/thumbnails/word.png',
     difficulty: 'easy'
   }
   ```

6. **Test in the app** to ensure video plays correctly

## Troubleshooting

### FFmpeg Not Found

**Error**: `FFmpeg is not installed or not in PATH!`

**Solution**:
1. Install FFmpeg using one of the methods above
2. Restart your terminal
3. Verify installation: `ffmpeg -version`

### Video File Size Too Large

**Error**: `File size X.XXmb exceeds 1MB target`

**Solutions**:
1. Increase CRF value in script (line 223 for MP4, line 281 for WebM)
2. Reduce resolution (change `720` to `480` or `360`)
3. Reduce frame rate (change `24` to `15`)

### Permission Denied

**Error**: `Permission denied` when creating directories

**Solution**:
1. Run terminal as Administrator (Windows)
2. Check file permissions on the `public/signs/` directory

### Video Won't Play in Browser

**Checklist**:
1. Verify files exist in `public/signs/processed/`
2. Check browser console for errors
3. Verify video URLs in `words.ts` match actual file paths
4. Test in different browsers (Chrome, Safari, Firefox)
5. Check that files are being served by your dev server

## Browser Compatibility

The dual-format approach (MP4 + WebM) ensures compatibility:

| Browser | Primary Format | Fallback |
|---------|---------------|----------|
| Chrome/Edge | WebM (VP9) | MP4 (H.264) |
| Firefox | WebM (VP9) | MP4 (H.264) |
| Safari/iOS | MP4 (H.264) | Thumbnail |
| Mobile Chrome | WebM (VP9) | MP4 (H.264) |

## Performance Optimization

The processed videos are optimized for web delivery:

- **Small file sizes** (<1MB) for fast loading
- **720p resolution** balances quality and performance
- **Muted audio** enables autoplay without user interaction
- **Loop enabled** for continuous playback
- **Fast start** (MP4) allows streaming before full download

## Future Enhancements

Possible improvements to the processing pipeline:

1. **Intelligent trimming**: Use motion detection to automatically find exact start/end points
2. **Quality analysis**: Automatically detect and warn about poor lighting or framing
3. **Batch processing**: Process multiple videos with different settings
4. **CDN integration**: Automatically upload to CDN for production
5. **Format optimization**: Generate additional formats (AVIF, AV1)
6. **Thumbnail selection**: Extract the best frame instead of using a fixed timestamp

## License

This processing pipeline is part of the Reading Hero project.
