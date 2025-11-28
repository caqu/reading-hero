/**
 * Pre-generation Script for Word Audio Files
 *
 * This script generates TTS audio files for all words in the game.
 * It calls the /api/tts/word endpoint for each unique word and caches
 * the audio files in public/audio/words/
 *
 * Usage:
 *   node scripts/pregen-words.js
 *
 * Requirements:
 *   - TTS server must be running on http://localhost:3001
 *   - Windows machine with PowerShell TTS support
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TTS_API_BASE = 'http://localhost:3001/api/tts';
const DELAY_BETWEEN_REQUESTS = 100; // ms to avoid overwhelming the server

/**
 * Sleep helper function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract all unique words from the word list
 * Reads from src/data/words.ts and src/data/emojiWords.ts
 */
function extractWordsFromFiles() {
  const words = new Set();

  try {
    // Read words.ts file
    const wordsFilePath = join(__dirname, '..', 'src', 'data', 'words.ts');
    const wordsContent = readFileSync(wordsFilePath, 'utf8');

    // Extract text values using regex
    const textMatches = wordsContent.matchAll(/text:\s*['"]([^'"]+)['"]/g);
    for (const match of textMatches) {
      words.add(match[1].toLowerCase().trim());
    }

    // Read emojiWords.ts file
    const emojiWordsFilePath = join(__dirname, '..', 'src', 'data', 'emojiWords.ts');
    const emojiWordsContent = readFileSync(emojiWordsFilePath, 'utf8');

    // Extract text values from emoji words
    const emojiTextMatches = emojiWordsContent.matchAll(/text:\s*['"]([^'"]+)['"]/g);
    for (const match of emojiTextMatches) {
      words.add(match[1].toLowerCase().trim());
    }

    console.log(`Found ${words.size} unique words to generate`);
    return Array.from(words).sort();
  } catch (error) {
    console.error('Error reading word files:', error);
    return [];
  }
}

/**
 * Generate audio for a single word
 */
async function generateWordAudio(word) {
  try {
    const url = `${TTS_API_BASE}/word?text=${encodeURIComponent(word)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      word,
      success: true,
      cached: data.cached,
      url: data.url
    };
  } catch (error) {
    return {
      word,
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Word Audio Pre-Generation Script');
  console.log('='.repeat(60));
  console.log();

  // Check if TTS server is running
  try {
    console.log('Checking TTS server...');
    const healthResponse = await fetch(`${TTS_API_BASE.replace('/api/tts', '/api/health')}`);
    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }
    const healthData = await healthResponse.json();
    console.log(`TTS Server: ${healthData.status}`);
    console.log(`Platform: ${healthData.platform}`);
    console.log(`Node Version: ${healthData.node_version}`);
    console.log();
  } catch (error) {
    console.error('ERROR: TTS server is not running!');
    console.error('Please start the server with: npm run server');
    process.exit(1);
  }

  // Extract all words
  const words = extractWordsFromFiles();

  if (words.length === 0) {
    console.error('ERROR: No words found in word files!');
    process.exit(1);
  }

  console.log(`Starting generation for ${words.length} words...`);
  console.log();

  // Statistics
  let generated = 0;
  let cached = 0;
  let failed = 0;
  const failedWords = [];

  // Generate audio for each word
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const progress = ((i + 1) / words.length * 100).toFixed(1);

    process.stdout.write(`[${progress}%] Processing: "${word}"...`);

    const result = await generateWordAudio(word);

    if (result.success) {
      if (result.cached) {
        cached++;
        process.stdout.write(' [CACHED]\n');
      } else {
        generated++;
        process.stdout.write(' [GENERATED]\n');
      }
    } else {
      failed++;
      failedWords.push(word);
      process.stdout.write(` [FAILED: ${result.error}]\n`);
    }

    // Small delay to avoid overwhelming the server
    if (i < words.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('Generation Complete!');
  console.log('='.repeat(60));
  console.log(`Total Words: ${words.length}`);
  console.log(`Newly Generated: ${generated}`);
  console.log(`Already Cached: ${cached}`);
  console.log(`Failed: ${failed}`);

  if (failedWords.length > 0) {
    console.log();
    console.log('Failed Words:');
    failedWords.forEach(word => console.log(`  - ${word}`));
  }

  console.log();
  console.log('Audio files saved to: public/audio/words/');
  console.log();
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
