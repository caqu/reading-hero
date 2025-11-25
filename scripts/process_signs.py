#!/usr/bin/env python3
"""
ASL Sign Video Processing Script

This script processes raw .MOV files from iPhone recordings into optimized web-ready formats.
It generates both .mp4 (H.264) and .webm (VP9) versions, along with PNG thumbnails.

Requirements:
    - FFmpeg installed and available in PATH
    - Python 3.6+

Input:
    - Raw .MOV files in public/signs/raw/

Output:
    - Optimized .mp4 files in public/signs/processed/
    - Optimized .webm files in public/signs/processed/
    - PNG thumbnails in public/signs/thumbnails/
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import List, Dict, Tuple

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(msg: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{msg.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")

def print_success(msg: str):
    print(f"{Colors.OKGREEN}[OK] {msg}{Colors.ENDC}")

def print_error(msg: str):
    print(f"{Colors.FAIL}[ERROR] {msg}{Colors.ENDC}")

def print_info(msg: str):
    print(f"{Colors.OKCYAN}[INFO] {msg}{Colors.ENDC}")

def print_warning(msg: str):
    print(f"{Colors.WARNING}[WARN] {msg}{Colors.ENDC}")

def check_ffmpeg() -> bool:
    """Check if FFmpeg is installed and accessible."""
    try:
        result = subprocess.run(
            ['ffmpeg', '-version'],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print_success(f"FFmpeg found: {version_line}")
            return True
        else:
            return False
    except FileNotFoundError:
        return False

def print_ffmpeg_install_instructions():
    """Print FFmpeg installation instructions for Windows."""
    print_error("FFmpeg is not installed or not in PATH!")
    print("\nTo install FFmpeg on Windows:")
    print("1. Using Chocolatey (recommended):")
    print("   choco install ffmpeg")
    print("\n2. Using Scoop:")
    print("   scoop install ffmpeg")
    print("\n3. Manual installation:")
    print("   a. Download from: https://www.gyan.dev/ffmpeg/builds/")
    print("   b. Extract the archive")
    print("   c. Add the 'bin' folder to your PATH")
    print("\n4. Using winget:")
    print("   winget install Gyan.FFmpeg")
    print("\nAfter installation, restart your terminal and run this script again.")

def get_video_duration(input_path: str) -> float:
    """Get the duration of a video file in seconds."""
    try:
        result = subprocess.run(
            [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                input_path
            ],
            capture_output=True,
            text=True,
            check=True
        )
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        return 0.0

def detect_scene_changes(input_path: str) -> List[float]:
    """Detect scene changes to help with auto-trimming."""
    try:
        # Use FFmpeg scene detection to find cut points
        result = subprocess.run(
            [
                'ffmpeg',
                '-i', input_path,
                '-vf', 'select=gt(scene\\,0.3),showinfo',
                '-f', 'null',
                '-'
            ],
            capture_output=True,
            text=True,
            check=False
        )

        # Parse scene change timestamps from stderr
        timestamps = []
        for line in result.stderr.split('\n'):
            if 'pts_time' in line:
                try:
                    # Extract pts_time value
                    pts_time = line.split('pts_time:')[1].split()[0]
                    timestamps.append(float(pts_time))
                except (IndexError, ValueError):
                    continue

        return timestamps
    except Exception as e:
        print_warning(f"Could not detect scene changes: {e}")
        return []

def auto_trim_video(input_path: str) -> Tuple[float, float]:
    """
    Automatically detect trim points by analyzing video motion.
    Returns (start_time, end_time) in seconds.
    """
    duration = get_video_duration(input_path)

    if duration <= 0:
        print_warning("Could not determine video duration, skipping auto-trim")
        return (0.0, 0.0)

    # For simple auto-trimming, we'll trim 10% from start and end
    # In a more advanced version, we would analyze frame motion
    trim_percentage = 0.05  # 5% from each end
    start_trim = duration * trim_percentage
    end_trim = duration * (1 - trim_percentage)

    print_info(f"Video duration: {duration:.2f}s")
    print_info(f"Auto-trim: {start_trim:.2f}s to {end_trim:.2f}s")

    return (start_trim, end_trim)

def process_video_to_mp4(
    input_path: str,
    output_path: str,
    start_time: float = 0.0,
    end_time: float = 0.0
) -> bool:
    """
    Process video to H.264 MP4 format.

    FFmpeg parameters:
    - scale=-2:720: Scale to 720px height, width auto-calculated to maintain aspect ratio
    - r 24: 24 fps
    - c:v libx264: H.264 codec
    - preset veryfast: Encoding speed preset
    - crf 23: Quality (lower = better quality, 23 is good default)
    - an: Remove audio
    """
    print_info(f"Processing MP4: {os.path.basename(output_path)}")

    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file
        '-i', input_path,
    ]

    # Add trim parameters if specified
    if start_time > 0 or end_time > 0:
        if start_time > 0:
            cmd.extend(['-ss', str(start_time)])
        if end_time > 0:
            cmd.extend(['-to', str(end_time)])

    cmd.extend([
        '-vf', 'scale=-2:720',
        '-r', '24',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '23',
        '-an',  # Remove audio
        '-movflags', '+faststart',  # Enable fast start for web playback
        output_path
    ])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        # Check file size
        file_size = os.path.getsize(output_path)
        file_size_mb = file_size / (1024 * 1024)

        if file_size_mb > 1.0:
            print_warning(f"File size {file_size_mb:.2f}MB exceeds 1MB target")
        else:
            print_success(f"Created MP4: {file_size_mb:.2f}MB")

        return True

    except subprocess.CalledProcessError as e:
        print_error(f"Failed to process MP4: {e}")
        print_error(f"FFmpeg stderr: {e.stderr}")
        return False

def process_video_to_webm(
    input_path: str,
    output_path: str,
    start_time: float = 0.0,
    end_time: float = 0.0
) -> bool:
    """
    Process video to VP9 WebM format.

    FFmpeg parameters:
    - scale=-2:720: Scale to 720px height
    - r 24: 24 fps
    - c:v libvpx-vp9: VP9 codec
    - crf 33: Quality (higher than MP4 as VP9 is more efficient)
    - b:v 0: Variable bitrate
    - an: Remove audio
    """
    print_info(f"Processing WebM: {os.path.basename(output_path)}")

    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file
        '-i', input_path,
    ]

    # Add trim parameters if specified
    if start_time > 0 or end_time > 0:
        if start_time > 0:
            cmd.extend(['-ss', str(start_time)])
        if end_time > 0:
            cmd.extend(['-to', str(end_time)])

    cmd.extend([
        '-vf', 'scale=-2:720',
        '-r', '24',
        '-c:v', 'libvpx-vp9',
        '-crf', '33',
        '-b:v', '0',
        '-an',  # Remove audio
        output_path
    ])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        # Check file size
        file_size = os.path.getsize(output_path)
        file_size_mb = file_size / (1024 * 1024)

        if file_size_mb > 1.0:
            print_warning(f"File size {file_size_mb:.2f}MB exceeds 1MB target")
        else:
            print_success(f"Created WebM: {file_size_mb:.2f}MB")

        return True

    except subprocess.CalledProcessError as e:
        print_error(f"Failed to process WebM: {e}")
        print_error(f"FFmpeg stderr: {e.stderr}")
        return False

def generate_thumbnail(
    input_path: str,
    output_path: str,
    timestamp: float = 1.0
) -> bool:
    """
    Generate a PNG thumbnail from the video at specified timestamp.

    Parameters:
    - thumbnail filter: Extract a single frame
    - scale=-2:360: Smaller thumbnail size
    """
    print_info(f"Generating thumbnail: {os.path.basename(output_path)}")

    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file
        '-ss', str(timestamp),  # Seek to timestamp
        '-i', input_path,
        '-vf', 'scale=-2:360',
        '-vframes', '1',  # Extract only 1 frame
        output_path
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        file_size = os.path.getsize(output_path)
        file_size_kb = file_size / 1024
        print_success(f"Created thumbnail: {file_size_kb:.2f}KB")
        return True

    except subprocess.CalledProcessError as e:
        print_error(f"Failed to generate thumbnail: {e}")
        return False

def process_single_video(
    input_path: str,
    processed_dir: str,
    thumbnails_dir: str,
    word_name: str
) -> Dict[str, any]:
    """
    Process a single video file into all required formats.

    Returns a dictionary with processing results.
    """
    print_header(f"Processing: {word_name}")

    # Auto-trim detection
    start_time, end_time = auto_trim_video(input_path)

    # Output paths
    mp4_output = os.path.join(processed_dir, f"{word_name}.mp4")
    webm_output = os.path.join(processed_dir, f"{word_name}.webm")
    thumb_output = os.path.join(thumbnails_dir, f"{word_name}.png")

    results = {
        'word': word_name,
        'input': input_path,
        'mp4': {'path': mp4_output, 'success': False, 'size': 0},
        'webm': {'path': webm_output, 'success': False, 'size': 0},
        'thumbnail': {'path': thumb_output, 'success': False, 'size': 0}
    }

    # Process to MP4
    if process_video_to_mp4(input_path, mp4_output, start_time, end_time):
        results['mp4']['success'] = True
        results['mp4']['size'] = os.path.getsize(mp4_output)

    # Process to WebM
    if process_video_to_webm(input_path, webm_output, start_time, end_time):
        results['webm']['success'] = True
        results['webm']['size'] = os.path.getsize(webm_output)

    # Generate thumbnail (use start_time + 0.5s for better frame)
    thumb_time = start_time + 0.5 if start_time > 0 else 1.0
    if generate_thumbnail(input_path, thumb_output, thumb_time):
        results['thumbnail']['success'] = True
        results['thumbnail']['size'] = os.path.getsize(thumb_output)

    return results

def main():
    """Main processing function."""
    print_header("ASL Sign Video Processing Script")

    # Check FFmpeg installation
    print_info("Checking for FFmpeg...")
    if not check_ffmpeg():
        print_ffmpeg_install_instructions()
        sys.exit(1)

    # Define directories
    project_root = Path(__file__).parent.parent
    raw_dir = project_root / 'public' / 'signs' / 'raw'
    processed_dir = project_root / 'public' / 'signs' / 'processed'
    thumbnails_dir = project_root / 'public' / 'signs' / 'thumbnails'

    # Create output directories
    print_info("Creating output directories...")
    processed_dir.mkdir(parents=True, exist_ok=True)
    thumbnails_dir.mkdir(parents=True, exist_ok=True)
    print_success(f"Output directories ready")

    # Find all .MOV files
    print_info("Scanning for raw video files...")
    video_files = list(raw_dir.glob('*.MOV')) + list(raw_dir.glob('*.mov'))

    if not video_files:
        print_warning("No .MOV files found in public/signs/raw/")
        sys.exit(0)

    print_success(f"Found {len(video_files)} video file(s):")
    for video in video_files:
        print(f"  - {video.name}")

    # Process each video
    all_results = []
    for video_path in video_files:
        # Extract word name from filename
        word_name = video_path.stem.lower()

        result = process_single_video(
            str(video_path),
            str(processed_dir),
            str(thumbnails_dir),
            word_name
        )
        all_results.append(result)

    # Print summary
    print_header("Processing Complete - Summary")

    success_count = 0
    for result in all_results:
        word = result['word']
        print(f"\n{Colors.BOLD}Word: {word}{Colors.ENDC}")

        if result['mp4']['success']:
            size_mb = result['mp4']['size'] / (1024 * 1024)
            print_success(f"MP4: {size_mb:.2f}MB")
            success_count += 1
        else:
            print_error("MP4: Failed")

        if result['webm']['success']:
            size_mb = result['webm']['size'] / (1024 * 1024)
            print_success(f"WebM: {size_mb:.2f}MB")
        else:
            print_error("WebM: Failed")

        if result['thumbnail']['success']:
            size_kb = result['thumbnail']['size'] / 1024
            print_success(f"Thumbnail: {size_kb:.2f}KB")
        else:
            print_error("Thumbnail: Failed")

    # Generate manifest
    manifest_path = project_root / 'public' / 'signs' / 'manifest.json'
    manifest = {}

    for result in all_results:
        if result['mp4']['success'] or result['webm']['success']:
            word = result['word']
            manifest[word] = {
                'mp4': f"/signs/processed/{word}.mp4" if result['mp4']['success'] else None,
                'webm': f"/signs/processed/{word}.webm" if result['webm']['success'] else None,
                'thumbnail': f"/signs/thumbnails/{word}.png" if result['thumbnail']['success'] else None
            }

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print_success(f"\nManifest created: {manifest_path}")

    # Print next steps
    print_header("Next Steps")
    print("1. Update src/types/index.ts to add video URL fields to Word interface")
    print("2. Update src/data/words.ts with video URLs for 'cat' and 'dog'")
    print("3. Create src/components/SignVideo.tsx component")
    print("4. Test video playback in the app")
    print("\nTo add more videos in the future:")
    print("1. Place new .MOV files in public/signs/raw/")
    print("2. Run this script again: python scripts/process_signs.py")
    print("3. Update words.ts with the new video URLs")

if __name__ == '__main__':
    main()
