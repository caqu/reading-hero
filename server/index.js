import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json());

// Letters that require SSML+IPA for proper pronunciation
const SSML_LETTERS = new Set(['x', 's']);

// Letter to phoneme mapping
const LETTER_PHONEMES = {
  a: { text: "ah", ipa: "æ" },
  b: { text: "bah", ipa: "b" },
  c: { text: "kuh", ipa: "k" },
  d: { text: "duh", ipa: "d" },
  e: { text: "eh", ipa: "ɛ" },
  f: { text: "fuh", ipa: "f" },
  g: { text: "gah", ipa: "g" },
  h: { text: "huh", ipa: "h" },
  i: { text: "i", ipa: "ɪ" },
  j: { text: "juh", ipa: "dʒ" },
  k: { text: "kuh", ipa: "k" },
  l: { text: "elle", ipa: "l" },
  m: { text: "muh", ipa: "m" },
  n: { text: "nuh", ipa: "n" },
  o: { text: "oh", ipa: "ɑ" },
  p: { text: "puh", ipa: "p" },
  q: { text: "kuh", ipa: "k" },
  r: { text: "err", ipa: "ɹ" },
  s: { text: "sz", ipa: "s" },
  t: { text: "tuh", ipa: "t" },
  u: { text: "uh", ipa: "ʌ" },
  v: { text: "vuh", ipa: "v" },
  w: { text: "wuh", ipa: "w" },
  x: { text: "ks", ipa: "ks" },
  y: { text: "yuh", ipa: "j" },
  z: { text: "z", ipa: "z" },
};

/**
 * Generate a WAV file using Windows PowerShell TTS with plain text
 * @param {string} text - Plain text to speak
 * @param {string} outputPath - Output file path
 */
async function generateTTSPlainText(text, outputPath) {
  const absolutePath = join(__dirname, '..', outputPath);

  // Ensure directory exists
  const dir = dirname(absolutePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Create a temporary PowerShell script file
  const tempScriptPath = join(__dirname, `temp-tts-${Date.now()}.ps1`);

  // PowerShell script content using plain Speak
  const psScript = `Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = 0
$voice.Volume = 100
$voice.SetOutputToWaveFile("${absolutePath}")
$voice.Speak("${text}")
$voice.Dispose()`;

  try {
    // Write script to temporary file
    writeFileSync(tempScriptPath, psScript, 'utf8');

    // Execute the PowerShell script
    await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScriptPath}"`);

    // Clean up temporary script
    unlinkSync(tempScriptPath);

    return true;
  } catch (error) {
    // Clean up temporary script even on error
    try {
      unlinkSync(tempScriptPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    console.error('TTS generation error:', error);
    throw error;
  }
}

/**
 * Generate a WAV file using Windows PowerShell TTS with SSML support
 * @param {string} text - Plain text (fallback)
 * @param {string} ipaPhoneme - IPA phoneme string (preferred)
 * @param {string} outputPath - Output file path
 */
async function generateTTSWithSSML(text, ipaPhoneme, outputPath) {
  const absolutePath = join(__dirname, '..', outputPath);

  // Ensure directory exists
  const dir = dirname(absolutePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Create a temporary PowerShell script file
  const tempScriptPath = join(__dirname, `temp-tts-${Date.now()}.ps1`);

  // Create SSML with IPA phoneme for precise pronunciation
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <phoneme alphabet="ipa" ph="${ipaPhoneme}">${text}</phoneme>
</speak>`;

  // PowerShell script content using SpeakSsml
  const psScript = `Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = 0
$voice.Volume = 100
$voice.SetOutputToWaveFile("${absolutePath}")
$ssml = @"
${ssml}
"@
$voice.SpeakSsml($ssml)
$voice.Dispose()`;

  try {
    // Write script to temporary file
    writeFileSync(tempScriptPath, psScript, 'utf8');

    // Execute the PowerShell script
    await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScriptPath}"`);

    // Clean up temporary script
    unlinkSync(tempScriptPath);

    return true;
  } catch (error) {
    // Clean up temporary script even on error
    try {
      unlinkSync(tempScriptPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    console.error('TTS generation error:', error);
    throw error;
  }
}

/**
 * GET /api/tts/letter?char=<a-z>
 * Generate or retrieve a letter sound
 */
app.get('/api/tts/letter', async (req, res) => {
  try {
    const { char } = req.query;

    // Validate input
    if (!char || typeof char !== 'string' || char.length !== 1) {
      return res.status(400).json({
        error: 'Invalid character. Provide a single letter (a-z).'
      });
    }

    const letter = char.toLowerCase();

    // Check if letter is valid
    if (!/^[a-z]$/.test(letter)) {
      return res.status(400).json({
        error: 'Character must be a letter from a-z.'
      });
    }

    // Get phonetic sound and IPA for the letter
    const phonemeData = LETTER_PHONEMES[letter];
    if (!phonemeData) {
      return res.status(404).json({
        error: `No phonetic sound defined for letter: ${letter}`
      });
    }

    // Define file path
    const audioFileName = `${letter}.wav`;
    const audioFilePath = `public/audio/letters/${audioFileName}`;
    const absolutePath = join(__dirname, '..', audioFilePath);
    const publicUrl = `/audio/letters/${audioFileName}`;

    // Check if file already exists
    if (existsSync(absolutePath)) {
      console.log(`[TTS] Cache hit for letter: ${letter}`);
      return res.json({
        letter,
        phoneme: phonemeData.text,
        ipa: phonemeData.ipa,
        url: publicUrl,
        cached: true
      });
    }

    // Choose generation method based on letter
    const useSSML = SSML_LETTERS.has(letter);

    if (useSSML) {
      console.log(`[TTS] Generating sound for letter: ${letter} using SSML+IPA (${phonemeData.text}, IPA: ${phonemeData.ipa})`);
      await generateTTSWithSSML(phonemeData.text, phonemeData.ipa, audioFilePath);
    } else {
      console.log(`[TTS] Generating sound for letter: ${letter} using plain text (${phonemeData.text})`);
      await generateTTSPlainText(phonemeData.text, audioFilePath);
    }

    console.log(`[TTS] Successfully generated: ${audioFileName}`);
    return res.json({
      letter,
      phoneme: phonemeData.text,
      ipa: phonemeData.ipa,
      url: publicUrl,
      cached: false
    });

  } catch (error) {
    console.error('[TTS] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate audio',
      details: error.message
    });
  }
});

/**
 * GET /api/tts/word?text=<word>
 * Generate or retrieve a word sound (future feature)
 */
app.get('/api/tts/word', async (req, res) => {
  try {
    const { text } = req.query;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid text. Provide a word to pronounce.'
      });
    }

    const word = text.toLowerCase().trim();

    // Sanitize filename
    const safeFileName = word.replace(/[^a-z0-9]/g, '_');
    const audioFileName = `${safeFileName}.wav`;
    const audioFilePath = `public/audio/words/${audioFileName}`;
    const absolutePath = join(__dirname, '..', audioFilePath);
    const publicUrl = `/audio/words/${audioFileName}`;

    // Check if file already exists
    if (existsSync(absolutePath)) {
      console.log(`[TTS] Cache hit for word: ${word}`);
      return res.json({
        word,
        url: publicUrl,
        cached: true
      });
    }

    // Generate the audio file using plain text
    console.log(`[TTS] Generating sound for word: ${word}`);
    await generateTTSPlainText(word, audioFilePath);

    console.log(`[TTS] Successfully generated: ${audioFileName}`);
    return res.json({
      word,
      url: publicUrl,
      cached: false
    });

  } catch (error) {
    console.error('[TTS] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate audio',
      details: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TTS API',
    platform: process.platform,
    node_version: process.version
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎤 TTS API Server running on http://localhost:${PORT}`);
  console.log(`📁 Audio cache: public/audio/letters/\n`);
  console.log('Available endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/tts/letter?char=<a-z>`);
  console.log(`  GET http://localhost:${PORT}/api/tts/word?text=<word>`);
  console.log(`  GET http://localhost:${PORT}/api/health\n`);
});
