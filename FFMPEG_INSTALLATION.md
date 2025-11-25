# FFmpeg Installation Guide for Reading Hero

This guide will help you install FFmpeg on Windows to process ASL sign language videos.

## Why FFmpeg?

FFmpeg is a powerful multimedia framework that can:
- Convert video formats (MOV → MP4, WebM)
- Compress and optimize videos for web delivery
- Extract thumbnails from videos
- Remove audio tracks
- Scale and trim videos

## Installation Methods

### Method 1: Chocolatey (Recommended for Developers)

If you already have Chocolatey installed:

1. Open **PowerShell or Command Prompt as Administrator**
2. Run:
   ```bash
   choco install ffmpeg -y
   ```
3. Wait for installation to complete
4. Restart your terminal
5. Verify: `ffmpeg -version`

### Method 2: winget (Built into Windows 10/11)

1. Open **PowerShell or Command Prompt** (no admin required)
2. Run:
   ```bash
   winget install Gyan.FFmpeg
   ```
3. Follow any prompts
4. Restart your terminal
5. Verify: `ffmpeg -version`

### Method 3: Scoop

If you have Scoop installed:

1. Open PowerShell or Command Prompt
2. Run:
   ```bash
   scoop install ffmpeg
   ```
3. Restart your terminal
4. Verify: `ffmpeg -version`

### Method 4: Manual Installation

If package managers don't work or you prefer manual installation:

1. **Download FFmpeg**:
   - Visit: [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)
   - Download: `ffmpeg-release-essentials.zip` (or full build)

2. **Extract the Archive**:
   - Extract to a location like: `C:\ffmpeg\`
   - The structure should be:
     ```
     C:\ffmpeg\
     ├── bin\
     │   ├── ffmpeg.exe
     │   ├── ffplay.exe
     │   └── ffprobe.exe
     ├── doc\
     └── presets\
     ```

3. **Add to PATH**:

   **Option A: Using System Settings (GUI)**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\ffmpeg\bin`
   - Click "OK" on all dialogs
   - Restart your terminal

   **Option B: Using PowerShell (Command Line)**
   ```powershell
   # Run PowerShell as Administrator
   [Environment]::SetEnvironmentVariable(
       "Path",
       [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\ffmpeg\bin",
       "Machine"
   )
   ```

4. **Verify Installation**:
   - Close and reopen your terminal
   - Run: `ffmpeg -version`
   - You should see FFmpeg version information

## Verification

After installation, verify FFmpeg is working:

```bash
ffmpeg -version
```

Expected output:
```
ffmpeg version 8.0.1 Copyright (c) 2000-2024 the FFmpeg developers
built with gcc 13.2.0 (Rev1, Built by MSYS2 project)
...
```

Also verify ffprobe (used by the script):
```bash
ffprobe -version
```

## Troubleshooting

### "ffmpeg is not recognized as an internal or external command"

**Cause**: FFmpeg is not in your system PATH

**Solutions**:
1. Restart your terminal after installation
2. Verify PATH includes FFmpeg:
   ```bash
   echo %PATH%
   ```
   Should include the FFmpeg bin directory

3. If using manual installation, verify the path is correct:
   ```bash
   dir C:\ffmpeg\bin\ffmpeg.exe
   ```

4. Try opening a new terminal window

### Installation Requires Administrator Rights

**For Chocolatey**: Must run as Administrator
- Right-click PowerShell/CMD
- Select "Run as Administrator"

**For winget**: Usually doesn't require admin

**For manual installation**: Adding to system PATH requires admin, but you can:
- Add to user PATH instead (doesn't require admin)
- Or use the full path when running the script

### Permission Errors During Installation

If you get permission errors with Chocolatey:

1. **Close all terminal windows**
2. **Open PowerShell as Administrator**
3. **Remove any lock files**:
   ```powershell
   # Only if you see lock file errors
   Remove-Item "C:\ProgramData\chocolatey\lib\c*" -Force -Recurse
   ```
4. **Try installation again**:
   ```bash
   choco install ffmpeg -y
   ```

Alternatively, use winget or manual installation which have fewer permission issues.

## After Installation: Process Videos

Once FFmpeg is installed and verified:

1. **Navigate to project directory**:
   ```bash
   cd C:\Users\carlos.quesada\imaginelearning\reading-hero
   ```

2. **Run the processing script**:
   ```bash
   python scripts/process_signs.py
   ```

3. **Expected output**:
   ```
   ================================================================================
                        ASL Sign Video Processing Script
   ================================================================================

   → Checking for FFmpeg...
   ✓ FFmpeg found: ffmpeg version 8.0.1 ...
   → Creating output directories...
   ✓ Output directories ready
   → Scanning for raw video files...
   ✓ Found 2 video file(s):
     - cat.MOV
     - dog.MOV

   ================================================================================
                                 Processing: cat
   ================================================================================

   → Video duration: 3.50s
   → Auto-trim: 0.18s to 3.33s
   → Processing MP4: cat.mp4
   ✓ Created MP4: 0.85MB
   → Processing WebM: cat.webm
   ✓ Created WebM: 0.72MB
   → Generating thumbnail: cat.png
   ✓ Created thumbnail: 35.20KB

   ... (similar for dog) ...

   ================================================================================
                         Processing Complete - Summary
   ================================================================================

   Word: cat
   ✓ MP4: 0.85MB
   ✓ WebM: 0.72MB
   ✓ Thumbnail: 35.20KB

   Word: dog
   ✓ MP4: 0.78MB
   ✓ WebM: 0.65MB
   ✓ Thumbnail: 32.10KB

   ✓ Manifest created: public/signs/manifest.json
   ```

4. **Verify output files exist**:
   ```bash
   dir public\signs\processed
   dir public\signs\thumbnails
   ```

   Should show:
   ```
   public/signs/processed/
     cat.mp4
     cat.webm
     dog.mp4
     dog.webm

   public/signs/thumbnails/
     cat.png
     dog.png
   ```

## Next Steps

After processing videos:

1. **Test the app** to see videos in action
2. **Verify video playback** in multiple browsers:
   - Chrome
   - Safari
   - Firefox
   - Mobile browsers

3. **Add more videos** by following the process in `scripts/README.md`

## Support

If you continue to have issues:

1. Check FFmpeg installation: `ffmpeg -version`
2. Check Python installation: `python --version`
3. Review error messages in the script output
4. Check file permissions on `public/signs/` directory
5. Try running terminal as Administrator

## Alternative: Pre-processed Videos

If you cannot install FFmpeg or encounter persistent issues, you can:

1. Use an online video converter to manually process videos
2. Follow these settings:
   - Format: MP4 (H.264)
   - Resolution: 720p height
   - Frame rate: 24fps
   - Remove audio
   - Target size: <1MB

3. Manually create WebM versions using online tools
4. Place processed files in `public/signs/processed/`
5. Create thumbnails using video editing software or online tools
6. Update `words.ts` with the file paths

However, the automated script is strongly recommended for consistency and efficiency.
