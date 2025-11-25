# Adding Real Images to ASL Reading Hero

This guide explains how to add your own images for the word list.

## Where to Put Images

Place all word images in the **`public/images/`** directory:

```
reading-hero/
├── public/
│   └── images/
│       ├── cat.jpg      ← Put your cat image here
│       ├── dog.jpg      ← Put your dog image here
│       ├── sun.png
│       ├── bed.jpg
│       └── ... (other word images)
```

## Image Requirements

### Recommended Specifications:
- **Format:** JPG, PNG, or WebP
- **Size:** 300x300px to 600x600px (square aspect ratio preferred)
- **File size:** <200KB per image (for fast loading)
- **Quality:** High enough to be clear, but compressed for web

### Naming Convention:
- Use lowercase letters
- Match the word text exactly
- Example: for word "cat", use `cat.jpg` or `cat.png`

## Step-by-Step Process

### 1. Place Your Images

Copy your image files to `public/images/`:

```bash
# Example on Windows
copy C:\path\to\your\cat.jpg public\images\cat.jpg
copy C:\path\to\your\dog.jpg public\images\dog.jpg
```

Or simply drag and drop them into the `public/images/` folder.

### 2. Update the Word List

Edit `src/data/words.ts` to reference your images:

```typescript
export const words: Word[] = [
  {
    id: 'cat',
    text: 'cat',
    imageUrl: '/images/cat.jpg',  // ← Update this path
    difficulty: 'easy',
  },
  {
    id: 'dog',
    text: 'dog',
    imageUrl: '/images/dog.jpg',  // ← Update this path
    difficulty: 'easy',
  },
  // ... other words
];
```

**Important:** The path must start with `/images/` (not `public/images/`)

### 3. Verify Images Load

1. Start the dev server (if not already running):
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Click "Start Game" and verify images display correctly

4. Check browser console for any 404 errors

## Image Optimization Tips

### Option 1: Use an Online Tool
- **TinyPNG** (https://tinypng.com/) - Compress PNG/JPG files
- **Squoosh** (https://squoosh.app/) - Advanced compression with preview

### Option 2: Use Command Line (if you have ImageMagick)
```bash
# Resize and compress
magick input.jpg -resize 400x400 -quality 85 output.jpg
```

### Option 3: Use Node.js (if you want to automate)
```bash
# Install sharp
npm install --save-dev sharp

# Create a script to process all images
```

## Adding More Words

To add a new word with an image:

1. **Add the image** to `public/images/` (e.g., `sun.png`)

2. **Update `src/data/words.ts`**:
   ```typescript
   {
     id: 'sun',
     text: 'sun',
     imageUrl: '/images/sun.png',
     difficulty: 'easy',
   }
   ```

3. **Test** the new word in the game

## Fallback Images

The app currently uses placeholder images from `via.placeholder.com` as fallbacks. These will automatically be replaced when you:

1. Add your image to `public/images/`
2. Update the `imageUrl` in `words.ts`

## Image Sources

### Free Image Resources (if you need more):
- **Unsplash** (https://unsplash.com/) - High-quality free photos
- **Pixabay** (https://pixabay.com/) - Free images and illustrations
- **Pexels** (https://pexels.com/) - Free stock photos
- **OpenClipArt** (https://openclipart.org/) - Free clipart/illustrations

### AI-Generated Images:
- **DALL-E** / **Midjourney** - Generate custom images
- **Stable Diffusion** - Open-source image generation

## Troubleshooting

### Image doesn't show:
1. Check the file path is correct (`/images/filename.ext`)
2. Verify the image file exists in `public/images/`
3. Check browser console for 404 errors
4. Clear browser cache and reload

### Image is too large/slow:
1. Compress the image (see optimization tips above)
2. Reduce dimensions to 400x400px
3. Convert to WebP format for better compression

### Image looks pixelated:
1. Use a higher resolution source image
2. Ensure image is at least 300x300px
3. Use PNG for graphics with text or sharp edges

## Example Complete Setup

Here's what your files should look like:

**File structure:**
```
public/
└── images/
    ├── cat.jpg (150KB, 400x400px)
    ├── dog.jpg (135KB, 400x400px)
    ├── sun.png (95KB, 400x400px)
    └── bed.jpg (142KB, 400x400px)
```

**`src/data/words.ts`:**
```typescript
export const words: Word[] = [
  { id: 'cat', text: 'cat', imageUrl: '/images/cat.jpg', difficulty: 'easy' },
  { id: 'dog', text: 'dog', imageUrl: '/images/dog.jpg', difficulty: 'easy' },
  { id: 'sun', text: 'sun', imageUrl: '/images/sun.png', difficulty: 'easy' },
  { id: 'bed', text: 'bed', imageUrl: '/images/bed.jpg', difficulty: 'easy' },
];
```

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify file paths match exactly (case-sensitive on some systems)
3. Try opening the image URL directly: `http://localhost:5173/images/cat.jpg`
4. Ensure the dev server is running

---

**Ready to add your images?** Just drop them in `public/images/` and update `src/data/words.ts`!
