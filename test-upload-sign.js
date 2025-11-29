/**
 * Test script for ASL sign upload endpoint
 * Creates a minimal test video and uploads it
 */

import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function createTestVideo() {
  console.log('Creating test video with ffmpeg...');

  // Create a 2-second test video (1 frame per second, 2 frames total)
  const cmd = `ffmpeg -y -f lavfi -i color=c=blue:s=320x240:d=2 -r 1 test-video.webm`;

  try {
    await execAsync(cmd);
    console.log('Test video created: test-video.webm');
    return true;
  } catch (error) {
    console.error('Failed to create test video:', error.message);
    return false;
  }
}

async function testUpload() {
  try {
    // Read the test video
    const videoBuffer = readFileSync('test-video.webm');
    const base64Video = `data:video/webm;base64,${videoBuffer.toString('base64')}`;

    console.log('Uploading test video...');
    console.log(`Video size: ${(base64Video.length / 1024).toFixed(2)} KB`);

    // Upload to server
    const response = await fetch('http://localhost:3001/api/signs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: 'test',
        videoData: base64Video,
        duration: 2000,
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Upload successful!');
      console.log('Response:', JSON.stringify(result, null, 2));

      // Test the list endpoint
      console.log('\nTesting list endpoint...');
      const listResponse = await fetch('http://localhost:3001/api/signs/list');
      const listResult = await listResponse.json();
      console.log('Signs list:', JSON.stringify(listResult, null, 2));

      // Test the update status endpoint
      console.log('\nTesting update status endpoint...');
      const updateResponse = await fetch('http://localhost:3001/api/signs/test', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'pending' })
      });
      const updateResult = await updateResponse.json();
      console.log('Update result:', JSON.stringify(updateResult, null, 2));

    } else {
      console.log('\n❌ Upload failed!');
      console.log('Error:', result);
    }

    // Clean up test video
    unlinkSync('test-video.webm');
    console.log('\nCleaned up test-video.webm');

  } catch (error) {
    console.error('Test failed:', error);
    // Clean up on error
    try {
      unlinkSync('test-video.webm');
    } catch (e) {
      // Ignore
    }
  }
}

async function main() {
  console.log('ASL Sign Upload Test\n');
  console.log('Prerequisites:');
  console.log('- Server must be running on http://localhost:3001');
  console.log('- FFmpeg must be installed\n');

  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3001/api/health');
    if (!healthCheck.ok) {
      console.error('❌ Server is not responding. Start it with: npm run server');
      process.exit(1);
    }
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Cannot connect to server. Start it with: npm run server');
    process.exit(1);
  }

  // Create test video and upload
  const videoCreated = await createTestVideo();
  if (videoCreated) {
    await testUpload();
  }
}

main();
