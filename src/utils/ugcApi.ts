/**
 * API utility for User-Generated Content (UGC) endpoints
 */

import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = `${getApiBaseUrl()}/api/ugc`;

export interface UserGeneratedWord {
  word: string;
  syllables: string[];
  segments: string[];
  imageData: string; // Base64 encoded PNG
  imageSource: 'upload' | 'canvas' | 'webcam';
  description?: string;
  category?: string;
}

export interface SavedWordData {
  word: string;
  syllables: string[];
  segments: string[];
  imagePath: string;
  source: string;
  imageType: string;
  createdAt: number | string;
  active: boolean;
}

export interface SaveWordResponse {
  success: boolean;
  word: string;
  data: SavedWordData;
}

export interface GetWordsResponse {
  success: boolean;
  count: number;
  words: SavedWordData[];
}

export interface UpdateWordResponse {
  success: boolean;
  word: string;
  active: boolean;
}

export interface DeleteWordResponse {
  success: boolean;
  word: string;
  message: string;
}

export interface GetWordResponse {
  success: boolean;
  data: SavedWordData;
}

/**
 * Save a user-generated word to the backend
 */
export async function saveUserGeneratedWord(
  wordData: UserGeneratedWord
): Promise<SaveWordResponse> {
  const response = await fetch(`${API_BASE_URL}/word`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      word: wordData.word,
      syllables: wordData.syllables,
      segments: wordData.segments,
      imageType: wordData.imageSource,
      imageData: wordData.imageData,
      createdAt: Date.now(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save word');
  }

  return response.json();
}

/**
 * Get all user-generated words
 */
export async function getAllWords(): Promise<GetWordsResponse> {
  const response = await fetch(`${API_BASE_URL}/words`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch words');
  }

  return response.json();
}

/**
 * Get a specific user-generated word by name
 */
export async function getWord(word: string): Promise<GetWordResponse> {
  const response = await fetch(`${API_BASE_URL}/word/${encodeURIComponent(word)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch word');
  }

  return response.json();
}

/**
 * Update the active status of a user-generated word
 */
export async function updateWordStatus(
  word: string,
  active: boolean
): Promise<UpdateWordResponse> {
  const response = await fetch(`${API_BASE_URL}/word/${encodeURIComponent(word)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ active }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update word status');
  }

  return response.json();
}

/**
 * Permanently delete a user-generated word
 */
export async function deleteWord(word: string): Promise<DeleteWordResponse> {
  const response = await fetch(`${API_BASE_URL}/word/${encodeURIComponent(word)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete word');
  }

  return response.json();
}

/**
 * Check if the UGC API server is running
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
