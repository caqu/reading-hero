/**
 * SignVideo Component Usage Examples
 *
 * This file demonstrates various ways to use the SignVideo component
 * in the Reading Hero application.
 */

import React from 'react';
import { SignVideo } from './SignVideo';
import { Word } from '../types';

// Example 1: Basic usage with a word object
export function BasicExample({ word }: { word: Word }) {
  return (
    <div>
      <h2>{word.text}</h2>
      <SignVideo
        mp4Src={word.signVideoUrl}
        webmSrc={word.signVideoWebmUrl}
        thumbnailSrc={word.signThumbnailUrl}
        alt={`ASL sign for ${word.text}`}
      />
    </div>
  );
}

// Example 2: Full-width video card
export function VideoCard({ word }: { word: Word }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>{word.text}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Watch the ASL sign
          </p>
        </div>
        <SignVideo
          mp4Src={word.signVideoUrl}
          webmSrc={word.signVideoWebmUrl}
          thumbnailSrc={word.signThumbnailUrl}
          alt={`ASL sign for ${word.text}`}
          width="100%"
        />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Video automatically loops
          </p>
        </div>
      </div>
    </div>
  );
}

// Example 3: Grid of sign videos
export function SignVideoGrid({ words }: { words: Word[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      {words.map((word) => (
        <div key={word.id} style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <SignVideo
            mp4Src={word.signVideoUrl}
            webmSrc={word.signVideoWebmUrl}
            thumbnailSrc={word.signThumbnailUrl}
            alt={`ASL sign for ${word.text}`}
            height="200px"
          />
          <div style={{ padding: '10px', textAlign: 'center' }}>
            <strong>{word.text}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

// Example 4: Side-by-side comparison (word image + sign video)
export function WordWithSign({ word }: { word: Word }) {
  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <h3>Word</h3>
        <img
          src={word.imageUrl}
          alt={word.text}
          style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
        />
        <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>
          {word.text}
        </p>
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <h3>ASL Sign</h3>
        <SignVideo
          mp4Src={word.signVideoUrl}
          webmSrc={word.signVideoWebmUrl}
          thumbnailSrc={word.signThumbnailUrl}
          alt={`ASL sign for ${word.text}`}
          width="300px"
        />
      </div>
    </div>
  );
}

// Example 5: Video with controls enabled (for practice mode)
export function SignVideoPractice({ word }: { word: Word }) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Practice the sign for: {word.text}</h2>
      <SignVideo
        mp4Src={word.signVideoUrl}
        webmSrc={word.signVideoWebmUrl}
        thumbnailSrc={word.signThumbnailUrl}
        alt={`ASL sign for ${word.text}`}
        showControls={true}
        width="100%"
      />
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Use the controls to pause, replay, or slow down the video
      </p>
    </div>
  );
}

// Example 6: Conditional rendering (show video only if available)
export function SignVideoOptional({ word }: { word: Word }) {
  const hasVideo = word.signVideoUrl || word.signVideoWebmUrl;

  return (
    <div>
      <h2>{word.text}</h2>
      {hasVideo ? (
        <>
          <SignVideo
            mp4Src={word.signVideoUrl}
            webmSrc={word.signVideoWebmUrl}
            thumbnailSrc={word.signThumbnailUrl}
            alt={`ASL sign for ${word.text}`}
          />
          <p>Watch the ASL sign above</p>
        </>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          <p>ASL video coming soon!</p>
          {word.signImageUrl && (
            <img
              src={word.signImageUrl}
              alt={`ASL sign for ${word.text}`}
              style={{ maxWidth: '200px', marginTop: '10px' }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Example 7: Integration with game flow
export function GameWordDisplay({ word, onComplete }: {
  word: Word;
  onComplete: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <SignVideo
          mp4Src={word.signVideoUrl}
          webmSrc={word.signVideoWebmUrl}
          thumbnailSrc={word.signThumbnailUrl}
          alt={`ASL sign for ${word.text}`}
          width="100%"
        />
      </div>

      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        letterSpacing: '0.05em'
      }}>
        {word.text.toUpperCase()}
      </div>

      <div style={{ fontSize: '18px', color: '#666' }}>
        Type the word above
      </div>
    </div>
  );
}

// Example 8: Fallback to static image when video not available
export function SignDisplay({ word }: { word: Word }) {
  const hasVideo = word.signVideoUrl || word.signVideoWebmUrl;

  return (
    <div>
      {hasVideo ? (
        <SignVideo
          mp4Src={word.signVideoUrl}
          webmSrc={word.signVideoWebmUrl}
          thumbnailSrc={word.signThumbnailUrl}
          alt={`ASL sign for ${word.text}`}
        />
      ) : (
        <img
          src={word.signImageUrl}
          alt={`ASL sign for ${word.text}`}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      )}
    </div>
  );
}

// Example 9: Responsive video (different sizes for mobile/desktop)
export function ResponsiveSignVideo({ word }: { word: Word }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <SignVideo
        mp4Src={word.signVideoUrl}
        webmSrc={word.signVideoWebmUrl}
        thumbnailSrc={word.signThumbnailUrl}
        alt={`ASL sign for ${word.text}`}
        className="responsive-sign-video"
      />
      <style>
        {`
          .responsive-sign-video {
            width: 100%;
          }

          @media (max-width: 768px) {
            .responsive-sign-video video {
              max-height: 300px;
            }
          }

          @media (min-width: 769px) {
            .responsive-sign-video video {
              max-height: 500px;
            }
          }
        `}
      </style>
    </div>
  );
}

// Example 10: Video library/gallery
export function SignVideoLibrary({ words }: { words: Word[] }) {
  const [selectedWord, setSelectedWord] = React.useState<Word | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1>ASL Sign Library</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px',
        marginTop: '20px'
      }}>
        {words.filter(w => w.signVideoUrl || w.signVideoWebmUrl).map((word) => (
          <button
            key={word.id}
            onClick={() => setSelectedWord(word)}
            style={{
              padding: '10px',
              border: selectedWord?.id === word.id ? '2px solid #2196F3' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {word.text}
          </button>
        ))}
      </div>

      {selectedWord && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px'
        }}>
          <h2>{selectedWord.text}</h2>
          <SignVideo
            mp4Src={selectedWord.signVideoUrl}
            webmSrc={selectedWord.signVideoWebmUrl}
            thumbnailSrc={selectedWord.signThumbnailUrl}
            alt={`ASL sign for ${selectedWord.text}`}
            width="100%"
            height="400px"
          />
        </div>
      )}
    </div>
  );
}
