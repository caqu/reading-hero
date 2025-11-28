// Simple test script for UGC API
import fetch from 'node-fetch';

// Create a small test PNG in base64 (1x1 red pixel)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testAPI() {
  try {
    console.log('\n=== Testing UGC API ===\n');

    // Test 1: POST a new word
    console.log('Test 1: POST /api/ugc/word');
    const postResponse = await fetch('http://localhost:3001/api/ugc/word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: 'cat',
        syllables: ['cat'],
        segments: ['c', 'a', 't'],
        imageType: 'upload',
        imageData: testImageBase64,
        createdAt: Date.now()
      })
    });

    const postResult = await postResponse.json();
    console.log('Status:', postResponse.status);
    console.log('Response:', JSON.stringify(postResult, null, 2));

    // Test 2: GET all words
    console.log('\nTest 2: GET /api/ugc/words');
    const getWordsResponse = await fetch('http://localhost:3001/api/ugc/words');
    const wordsResult = await getWordsResponse.json();
    console.log('Status:', getWordsResponse.status);
    console.log('Response:', JSON.stringify(wordsResult, null, 2));

    // Test 3: GET specific word
    console.log('\nTest 3: GET /api/ugc/word/cat');
    const getWordResponse = await fetch('http://localhost:3001/api/ugc/word/cat');
    const wordResult = await getWordResponse.json();
    console.log('Status:', getWordResponse.status);
    console.log('Response:', JSON.stringify(wordResult, null, 2));

    // Test 4: PATCH word to deactivate
    console.log('\nTest 4: PATCH /api/ugc/word/cat (deactivate)');
    const patchResponse = await fetch('http://localhost:3001/api/ugc/word/cat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    });
    const patchResult = await patchResponse.json();
    console.log('Status:', patchResponse.status);
    console.log('Response:', JSON.stringify(patchResult, null, 2));

    // Test 5: GET word again to verify update
    console.log('\nTest 5: GET /api/ugc/word/cat (verify update)');
    const getUpdatedResponse = await fetch('http://localhost:3001/api/ugc/word/cat');
    const updatedResult = await getUpdatedResponse.json();
    console.log('Status:', getUpdatedResponse.status);
    console.log('Response:', JSON.stringify(updatedResult, null, 2));

    console.log('\n=== All tests completed ===\n');
    process.exit(0);

  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testAPI();
