/**
 * Pre-generation script for letter sounds
 * Generates all 26 letter sounds using the TTS API
 *
 * Usage: node scripts/pregen-letters.js
 */

const API_BASE_URL = 'http://localhost:3001/api/tts';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

async function generateLetterSound(letter) {
  try {
    const url = `${API_BASE_URL}/letter?char=${letter}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.cached) {
      console.log(`  ⏭️  ${letter.toUpperCase()} - already cached (${data.phoneme})`);
    } else {
      console.log(`  ✅ ${letter.toUpperCase()} - generated (${data.phoneme})`);
    }

    return { letter, success: true, cached: data.cached };
  } catch (error) {
    console.error(`  ❌ ${letter.toUpperCase()} - failed: ${error.message}`);
    return { letter, success: false, error: error.message };
  }
}

async function main() {
  console.log('\n🎤 TTS Letter Sound Pre-Generation\n');
  console.log('Checking TTS API...');

  // Check if API is running
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/tts', '')}/health`);
    if (!healthResponse.ok) {
      throw new Error('API not responding');
    }
    console.log('✓ TTS API is running\n');
  } catch (error) {
    console.error('❌ Cannot connect to TTS API');
    console.error('   Make sure the server is running: npm run server');
    process.exit(1);
  }

  console.log(`Generating sounds for ${LETTERS.length} letters...\n`);

  // Generate all letter sounds
  const results = [];
  for (const letter of LETTERS) {
    const result = await generateLetterSound(letter);
    results.push(result);

    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  const successful = results.filter(r => r.success).length;
  const cached = results.filter(r => r.cached).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n✨ Pre-generation complete!`);
  console.log(`   Total: ${results.length} letters`);
  console.log(`   Generated: ${successful - cached} new sounds`);
  console.log(`   Already cached: ${cached} sounds`);

  if (failed > 0) {
    console.log(`   Failed: ${failed} sounds`);
  }

  console.log('\n📁 Audio files saved to: public/audio/letters/\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main();
