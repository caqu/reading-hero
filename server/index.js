import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync, rmSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for memory storage (we'll process and save manually)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for video files
  }
});

const app = express();
const PORT = 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Serve UGC files as static content
const ugcPath = join(__dirname, '..', 'ugc');
app.use('/ugc', express.static(ugcPath));

// Serve ASL sign files as static content
const aslPath = join(__dirname, '..', 'public', 'asl');
app.use('/asl', express.static(aslPath));

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

// Spanish translations dictionary
const SPANISH_TRANSLATIONS = {
  // Animals
  shark: "tiburón",
  bird: "pájaro",
  chicken: "pollo",
  dolphin: "delfín",
  dragon: "dragón",
  duck: "pato",
  eagle: "águila",
  fish: "pez",
  owl: "búho",
  parrot: "loro",
  peacock: "pavo real",
  penguin: "pingüino",
  snake: "serpiente",
  swan: "cisne",
  whale: "ballena",
  bear: "oso",
  fox: "zorro",
  frog: "rana",
  koala: "koala",
  monkey: "mono",
  orangutan: "orangután",
  panda: "panda",
  poodle: "caniche",
  rabbit: "conejo",
  turtle: "tortuga",
  wolf: "lobo",
  zebra: "cebra",
  // Fruits
  grapes: "uvas",
  melon: "melón",
  orange: "naranja",
  watermelon: "sandía",
  // Food
  pizza: "pizza",
  // Fantasy
  wizard: "mago",
  // Test words
  test: "prueba",
};

/**
 * Generate a WAV file using Windows PowerShell TTS with Spanish female voice
 * @param {string} text - Spanish text to speak
 * @param {string} outputPath - Output file path
 */
async function generateSpanishTTS(text, outputPath) {
  const absolutePath = join(__dirname, '..', outputPath);

  // Ensure directory exists
  const dir = dirname(absolutePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Create a temporary PowerShell script file
  const tempScriptPath = join(__dirname, `temp-tts-spanish-${Date.now()}.ps1`);

  // PowerShell script to detect and use Spanish female voice
  const psScript = `Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Try to find a Spanish female voice
$spanishFemaleVoices = $voice.GetInstalledVoices() |
    Where-Object { $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'es' -and $_.VoiceInfo.Gender -eq 'Female' }

if ($spanishFemaleVoices) {
    $selectedVoice = $spanishFemaleVoices[0].VoiceInfo.Name
    Write-Host "Using Spanish female voice: $selectedVoice"
    $voice.SelectVoice($selectedVoice)
} else {
    # Fallback: try any Spanish voice
    $spanishVoices = $voice.GetInstalledVoices() |
        Where-Object { $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'es' }

    if ($spanishVoices) {
        $selectedVoice = $spanishVoices[0].VoiceInfo.Name
        Write-Host "Using Spanish voice: $selectedVoice"
        $voice.SelectVoice($selectedVoice)
    } else {
        # Last resort: use default voice but set culture
        Write-Host "No Spanish voice found, using default voice with Spanish culture"
        $voice.SelectVoice($voice.GetInstalledVoices()[0].VoiceInfo.Name)
    }
}

$voice.Rate = 0
$voice.Volume = 100
$voice.SetOutputToWaveFile("${absolutePath}")
$voice.Speak("${text}")
$voice.Dispose()`;

  try {
    // Write script to temporary file
    writeFileSync(tempScriptPath, psScript, 'utf8');

    // Execute the PowerShell script
    const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScriptPath}"`);
    console.log('[TTS Spanish]', stdout.trim());

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

    console.error('Spanish TTS generation error:', error);
    throw error;
  }
}

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
 * Generate or retrieve a word sound (English + Spanish if available)
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

    // Check if English file already exists
    const englishCached = existsSync(absolutePath);

    if (!englishCached) {
      // Generate the English audio file using plain text
      console.log(`[TTS] Generating sound for word: ${word}`);
      await generateTTSPlainText(word, audioFilePath);
      console.log(`[TTS] Successfully generated: ${audioFileName}`);
    } else {
      console.log(`[TTS] Cache hit for word: ${word}`);
    }

    // Check if Spanish translation exists
    const spanishTranslation = SPANISH_TRANSLATIONS[word];
    let spanishUrl = null;
    let spanishCached = false;

    if (spanishTranslation) {
      const spanishFileName = `${safeFileName}-es.wav`;
      const spanishFilePath = `public/audio/spanish/${spanishFileName}`;
      const spanishAbsolutePath = join(__dirname, '..', spanishFilePath);
      spanishUrl = `/audio/spanish/${spanishFileName}`;

      // Check if Spanish file already exists
      if (existsSync(spanishAbsolutePath)) {
        console.log(`[TTS] Spanish cache hit for word: ${word} (${spanishTranslation})`);
        spanishCached = true;
      } else {
        // Generate Spanish audio file
        console.log(`[TTS] Generating Spanish sound for word: ${word} -> ${spanishTranslation}`);
        await generateSpanishTTS(spanishTranslation, spanishFilePath);
        console.log(`[TTS] Successfully generated Spanish: ${spanishFileName}`);
      }
    }

    return res.json({
      word,
      englishUrl: publicUrl,
      spanishUrl,
      spanishTranslation,
      cached: {
        english: englishCached,
        spanish: spanishCached
      }
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
 * POST /api/tts/spanish
 * Generate or retrieve Spanish audio for a word
 */
app.post('/api/tts/spanish', async (req, res) => {
  try {
    const { word, translation } = req.body;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        error: 'Invalid word. Provide a word to translate.'
      });
    }

    if (!translation || typeof translation !== 'string') {
      return res.status(400).json({
        error: 'Invalid translation. Provide a Spanish translation.'
      });
    }

    const normalizedWord = word.toLowerCase().trim();
    const normalizedTranslation = translation.toLowerCase().trim();

    // Sanitize filename
    const safeFileName = normalizedWord.replace(/[^a-z0-9]/g, '_');
    const audioFileName = `${safeFileName}-es.wav`;
    const audioFilePath = `public/audio/spanish/${audioFileName}`;
    const absolutePath = join(__dirname, '..', audioFilePath);
    const publicUrl = `/audio/spanish/${audioFileName}`;

    // Check if file already exists
    if (existsSync(absolutePath)) {
      console.log(`[TTS Spanish] Cache hit for word: ${normalizedWord} (${normalizedTranslation})`);
      return res.json({
        word: normalizedWord,
        translation: normalizedTranslation,
        url: publicUrl,
        cached: true
      });
    }

    // Generate the Spanish audio file
    console.log(`[TTS Spanish] Generating sound for: ${normalizedWord} -> ${normalizedTranslation}`);
    await generateSpanishTTS(normalizedTranslation, audioFilePath);

    console.log(`[TTS Spanish] Successfully generated: ${audioFileName}`);
    return res.json({
      word: normalizedWord,
      translation: normalizedTranslation,
      url: publicUrl,
      cached: false
    });

  } catch (error) {
    console.error('[TTS Spanish] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate Spanish audio',
      details: error.message
    });
  }
});

/**
 * Sanitize word for filesystem usage
 * Removes non-alphanumeric characters and converts to lowercase
 */
function sanitizeWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Read the UGC registry
 */
function readRegistry() {
  const registryPath = join(__dirname, '..', 'ugc', 'registry.json');

  if (!existsSync(registryPath)) {
    return [];
  }

  try {
    const content = readFileSync(registryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[UGC] Error reading registry:', error);
    return [];
  }
}

/**
 * Write the UGC registry atomically
 */
function writeRegistry(registry) {
  const ugcDir = join(__dirname, '..', 'ugc');
  const registryPath = join(ugcDir, 'registry.json');
  const tempPath = join(ugcDir, `registry.${Date.now()}.tmp`);

  // Ensure UGC directory exists
  if (!existsSync(ugcDir)) {
    mkdirSync(ugcDir, { recursive: true });
  }

  try {
    // Write to temp file first
    writeFileSync(tempPath, JSON.stringify(registry, null, 2), 'utf8');

    // Rename to final location (atomic on most filesystems)
    if (existsSync(registryPath)) {
      unlinkSync(registryPath);
    }
    writeFileSync(registryPath, readFileSync(tempPath));
    unlinkSync(tempPath);

    return true;
  } catch (error) {
    // Clean up temp file on error
    try {
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    console.error('[UGC] Error writing registry:', error);
    throw error;
  }
}

/**
 * POST /api/ugc/word
 * Save a user-generated word with its image
 */
app.post('/api/ugc/word', async (req, res) => {
  try {
    const { word, syllables, segments, imageType, imageData, createdAt } = req.body;

    // Validate required fields
    if (!word || !syllables || !segments || !imageData) {
      return res.status(400).json({
        error: 'Missing required fields: word, syllables, segments, imageData'
      });
    }

    // Validate data types
    if (typeof word !== 'string') {
      return res.status(400).json({ error: 'word must be a string' });
    }

    if (!Array.isArray(syllables) || syllables.length === 0) {
      return res.status(400).json({ error: 'syllables must be a non-empty array' });
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'segments must be a non-empty array' });
    }

    if (typeof imageData !== 'string') {
      return res.status(400).json({ error: 'imageData must be a base64 string' });
    }

    // Sanitize word for filesystem
    const sanitizedWord = sanitizeWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    // Create word directory
    const wordDir = join(__dirname, '..', 'ugc', 'words', sanitizedWord);
    if (!existsSync(wordDir)) {
      mkdirSync(wordDir, { recursive: true });
    }

    // Save image file
    const imagePath = join(wordDir, 'image.png');
    const imageBuffer = Buffer.from(imageData.replace(/^data:image\/png;base64,/, ''), 'base64');
    writeFileSync(imagePath, imageBuffer);

    // Create data object
    const wordData = {
      word: sanitizedWord,
      syllables,
      segments,
      imagePath: `/ugc/words/${sanitizedWord}/image.png`,
      source: 'user',
      imageType: imageType || 'unknown',
      createdAt: createdAt || Date.now(),
      active: true
    };

    // Save data.json
    const dataPath = join(wordDir, 'data.json');
    writeFileSync(dataPath, JSON.stringify(wordData, null, 2), 'utf8');

    // Update registry atomically
    const registry = readRegistry();

    // Check if word already exists in registry
    const existingIndex = registry.findIndex(item => item.word === sanitizedWord);

    if (existingIndex >= 0) {
      // Update existing entry
      registry[existingIndex] = wordData;
      console.log(`[UGC] Updated existing word: ${sanitizedWord}`);
    } else {
      // Add new entry
      registry.push(wordData);
      console.log(`[UGC] Added new word: ${sanitizedWord}`);
    }

    writeRegistry(registry);

    return res.status(201).json({
      success: true,
      word: sanitizedWord,
      data: wordData
    });

  } catch (error) {
    console.error('[UGC] Error saving word:', error);
    return res.status(500).json({
      error: 'Failed to save word',
      details: error.message
    });
  }
});

/**
 * PATCH /api/ugc/word/:word
 * Update active status of a user-generated word
 */
app.patch('/api/ugc/word/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const { active } = req.body;

    // Validate required fields
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        error: 'Missing or invalid required field: active (must be boolean)'
      });
    }

    // Sanitize word for filesystem
    const sanitizedWord = sanitizeWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    // Check if word exists
    const wordDir = join(__dirname, '..', 'ugc', 'words', sanitizedWord);
    const dataPath = join(wordDir, 'data.json');

    if (!existsSync(dataPath)) {
      return res.status(404).json({
        error: 'Word not found',
        word: sanitizedWord
      });
    }

    // Read current data
    const currentData = JSON.parse(readFileSync(dataPath, 'utf8'));

    // Update active status
    currentData.active = active;

    // Save updated data
    writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf8');

    // Update registry atomically
    const registry = readRegistry();
    const existingIndex = registry.findIndex(item => item.word === sanitizedWord);

    if (existingIndex >= 0) {
      registry[existingIndex].active = active;
      writeRegistry(registry);
    }

    console.log(`[UGC] Updated word ${sanitizedWord} active status to: ${active}`);

    return res.json({
      success: true,
      word: sanitizedWord,
      active
    });

  } catch (error) {
    console.error('[UGC] Error updating word:', error);
    return res.status(500).json({
      error: 'Failed to update word',
      details: error.message
    });
  }
});

/**
 * GET /api/ugc/words
 * Get all user-generated words
 */
app.get('/api/ugc/words', (req, res) => {
  try {
    const registry = readRegistry();

    return res.json({
      success: true,
      count: registry.length,
      words: registry
    });
  } catch (error) {
    console.error('[UGC] Error fetching words:', error);
    return res.status(500).json({
      error: 'Failed to fetch words',
      details: error.message
    });
  }
});

/**
 * GET /api/ugc/word/:word
 * Get a specific user-generated word
 */
app.get('/api/ugc/word/:word', (req, res) => {
  try {
    const { word } = req.params;
    const sanitizedWord = sanitizeWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    const dataPath = join(__dirname, '..', 'ugc', 'words', sanitizedWord, 'data.json');

    if (!existsSync(dataPath)) {
      return res.status(404).json({
        error: 'Word not found',
        word: sanitizedWord
      });
    }

    const wordData = JSON.parse(readFileSync(dataPath, 'utf8'));

    return res.json({
      success: true,
      data: wordData
    });
  } catch (error) {
    console.error('[UGC] Error fetching word:', error);
    return res.status(500).json({
      error: 'Failed to fetch word',
      details: error.message
    });
  }
});

/**
 * DELETE /api/ugc/word/:word
 * Permanently delete a user-generated word
 */
app.delete('/api/ugc/word/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const sanitizedWord = sanitizeWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    // Check if word exists
    const wordDir = join(__dirname, '..', 'ugc', 'words', sanitizedWord);
    const dataPath = join(wordDir, 'data.json');

    if (!existsSync(dataPath)) {
      return res.status(404).json({
        error: 'Word not found',
        word: sanitizedWord
      });
    }

    // Remove from registry
    const registry = readRegistry();
    const filteredRegistry = registry.filter(item => item.word !== sanitizedWord);
    writeRegistry(filteredRegistry);

    // Delete word directory and all its contents
    if (existsSync(wordDir)) {
      rmSync(wordDir, { recursive: true, force: true });
    }

    console.log(`[UGC] Permanently deleted word: ${sanitizedWord}`);

    return res.json({
      success: true,
      word: sanitizedWord,
      message: 'Word permanently deleted'
    });

  } catch (error) {
    console.error('[UGC] Error deleting word:', error);
    return res.status(500).json({
      error: 'Failed to delete word',
      details: error.message
    });
  }
});

/**
 * Sanitize word for filesystem usage (ASL signs)
 * Removes non-alphanumeric characters and converts to lowercase
 */
function sanitizeSignWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Process video with ffmpeg
 * Strips audio, normalizes to 30fps, scales to 720x720, outputs as MP4
 */
async function processSignVideo(inputPath, outputPath) {
  const cmd = [
    'ffmpeg',
    '-y', // Overwrite output file
    '-i', inputPath,
    '-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2',
    '-r', '30', // 30 fps
    '-an', // Remove audio
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-movflags', '+faststart', // Enable fast start for web playback
    outputPath
  ];

  try {
    const { stdout, stderr } = await execAsync(cmd.join(' '));
    console.log('[ASL] Video processed successfully');
    return true;
  } catch (error) {
    console.error('[ASL] FFmpeg error:', error.message);
    throw new Error(`Failed to process video: ${error.message}`);
  }
}

/**
 * Read the ASL signs registry
 */
function readSignsRegistry() {
  const registryPath = join(__dirname, '..', 'public', 'asl', 'registry.json');

  if (!existsSync(registryPath)) {
    return [];
  }

  try {
    const content = readFileSync(registryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[ASL] Error reading registry:', error);
    return [];
  }
}

/**
 * Write the ASL signs registry atomically
 */
function writeSignsRegistry(registry) {
  const aslDir = join(__dirname, '..', 'public', 'asl');
  const registryPath = join(aslDir, 'registry.json');
  const tempPath = join(aslDir, `registry.${Date.now()}.tmp`);

  // Ensure ASL directory exists
  if (!existsSync(aslDir)) {
    mkdirSync(aslDir, { recursive: true });
  }

  try {
    // Write to temp file first
    writeFileSync(tempPath, JSON.stringify(registry, null, 2), 'utf8');

    // Rename to final location (atomic on most filesystems)
    if (existsSync(registryPath)) {
      unlinkSync(registryPath);
    }
    writeFileSync(registryPath, readFileSync(tempPath));
    unlinkSync(tempPath);

    return true;
  } catch (error) {
    // Clean up temp file on error
    try {
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    console.error('[ASL] Error writing registry:', error);
    throw error;
  }
}

/**
 * POST /api/signs/upload
 * Upload and process a recorded ASL sign video
 */
app.post('/api/signs/upload', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { word, videoData, duration, timestamp } = req.body;

    // Validate required fields
    if (!word || !videoData) {
      return res.status(400).json({
        error: 'Missing required fields: word, videoData'
      });
    }

    // Validate data types
    if (typeof word !== 'string') {
      return res.status(400).json({ error: 'word must be a string' });
    }

    if (typeof videoData !== 'string') {
      return res.status(400).json({ error: 'videoData must be a base64 string' });
    }

    // Sanitize word for filesystem
    const sanitizedWord = sanitizeSignWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    // Create word directory structure
    const wordDir = join(__dirname, '..', 'public', 'asl', 'signs', sanitizedWord);
    if (!existsSync(wordDir)) {
      mkdirSync(wordDir, { recursive: true });
    }

    // Save raw video file
    const rawPath = join(wordDir, 'raw.webm');
    const videoBuffer = Buffer.from(videoData.replace(/^data:video\/webm;base64,/, ''), 'base64');
    writeFileSync(rawPath, videoBuffer);

    console.log(`[ASL] Saved raw video for word: ${sanitizedWord}`);

    // Process video to create looping MP4
    const processedPath = join(wordDir, 'sign_loop.mp4');
    try {
      await processSignVideo(rawPath, processedPath);
    } catch (error) {
      // If processing fails, clean up and return error
      console.error(`[ASL] Processing failed for ${sanitizedWord}:`, error);
      return res.status(500).json({
        error: 'Failed to process video',
        details: error.message
      });
    }

    // Create metadata
    const metadata = {
      word: sanitizedWord,
      recordedAt: timestamp || new Date().toISOString(),
      durationMs: duration || 0,
      loopPath: `/asl/signs/${sanitizedWord}/sign_loop.mp4`,
      rawPath: `/asl/signs/${sanitizedWord}/raw.webm`,
      status: 'approved'
    };

    // Save metadata file
    const metaPath = join(wordDir, 'meta.json');
    writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Update registry atomically
    const registry = readSignsRegistry();

    // Check if word already exists in registry
    const existingIndex = registry.findIndex(item => item.word === sanitizedWord);

    if (existingIndex >= 0) {
      // Update existing entry
      registry[existingIndex] = metadata;
      console.log(`[ASL] Updated existing sign: ${sanitizedWord}`);
    } else {
      // Add new entry
      registry.push(metadata);
      console.log(`[ASL] Added new sign: ${sanitizedWord}`);
    }

    writeSignsRegistry(registry);

    return res.status(201).json({
      success: true,
      word: sanitizedWord,
      videoUrl: metadata.loopPath,
      metadata
    });

  } catch (error) {
    console.error('[ASL] Error uploading sign:', error);
    return res.status(500).json({
      error: 'Failed to upload sign',
      details: error.message
    });
  }
});

/**
 * GET /api/signs/list
 * Get all recorded ASL signs
 */
app.get('/api/signs/list', (req, res) => {
  try {
    const registry = readSignsRegistry();

    return res.json({
      success: true,
      count: registry.length,
      signs: registry
    });
  } catch (error) {
    console.error('[ASL] Error fetching signs:', error);
    return res.status(500).json({
      error: 'Failed to fetch signs',
      details: error.message
    });
  }
});

/**
 * PATCH /api/signs/:word
 * Update the status of an ASL sign
 */
app.patch('/api/signs/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status || !['approved', 'pending', 'deleted'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid or missing status field. Must be one of: approved, pending, deleted'
      });
    }

    // Sanitize word for filesystem
    const sanitizedWord = sanitizeSignWord(word);

    if (!sanitizedWord) {
      return res.status(400).json({
        error: 'Invalid word: must contain at least one alphanumeric character'
      });
    }

    // Check if sign exists
    const wordDir = join(__dirname, '..', 'public', 'asl', 'signs', sanitizedWord);
    const metaPath = join(wordDir, 'meta.json');

    if (!existsSync(metaPath)) {
      return res.status(404).json({
        error: 'Sign not found',
        word: sanitizedWord
      });
    }

    // Read current metadata
    const currentMeta = JSON.parse(readFileSync(metaPath, 'utf8'));

    // Update status
    currentMeta.status = status;

    // Save updated metadata
    writeFileSync(metaPath, JSON.stringify(currentMeta, null, 2), 'utf8');

    // Update registry atomically
    const registry = readSignsRegistry();
    const existingIndex = registry.findIndex(item => item.word === sanitizedWord);

    if (existingIndex >= 0) {
      registry[existingIndex].status = status;
      writeSignsRegistry(registry);
    }

    console.log(`[ASL] Updated sign ${sanitizedWord} status to: ${status}`);

    return res.json({
      success: true,
      word: sanitizedWord,
      status
    });

  } catch (error) {
    console.error('[ASL] Error updating sign:', error);
    return res.status(500).json({
      error: 'Failed to update sign',
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
  console.log(`📁 Audio cache: public/audio/words/\n`);
  console.log(`📁 Spanish audio cache: public/audio/spanish/\n`);
  console.log('Available endpoints:');
  console.log('  TTS:');
  console.log(`    GET  http://localhost:${PORT}/api/tts/letter?char=<a-z>`);
  console.log(`    GET  http://localhost:${PORT}/api/tts/word?text=<word>`);
  console.log(`    POST http://localhost:${PORT}/api/tts/spanish (word, translation)`);
  console.log('  UGC:');
  console.log(`    POST   http://localhost:${PORT}/api/ugc/word`);
  console.log(`    PATCH  http://localhost:${PORT}/api/ugc/word/<word>`);
  console.log(`    DELETE http://localhost:${PORT}/api/ugc/word/<word>`);
  console.log(`    GET    http://localhost:${PORT}/api/ugc/words`);
  console.log(`    GET    http://localhost:${PORT}/api/ugc/word/<word>`);
  console.log('  ASL Signs:');
  console.log(`    POST  http://localhost:${PORT}/api/signs/upload`);
  console.log(`    GET   http://localhost:${PORT}/api/signs/list`);
  console.log(`    PATCH http://localhost:${PORT}/api/signs/<word>`);
  console.log('  Health:');
  console.log(`    GET http://localhost:${PORT}/api/health\n`);
});
