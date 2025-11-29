/**
 * API utility for ASL Sign Recording endpoints
 */

import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = `${getApiBaseUrl()}/api/signs`;

export interface SignMetadata {
  word: string;
  recordedAt: string;
  durationMs: number;
  loopPath: string;
  rawPath: string;
  status: 'approved' | 'pending' | 'deleted';
}

export interface UploadSignRequest {
  word: string;
  videoData: string; // Base64 encoded webm video
  duration?: number; // Duration in milliseconds
  timestamp?: string; // ISO timestamp
}

export interface UploadSignResponse {
  success: boolean;
  word: string;
  videoUrl: string;
  metadata: SignMetadata;
}

export interface ListSignsResponse {
  success: boolean;
  count: number;
  signs: SignMetadata[];
}

export interface UpdateSignStatusResponse {
  success: boolean;
  word: string;
  status: string;
}

/**
 * Upload a recorded ASL sign video
 * Accepts base64-encoded webm video data
 */
export async function uploadSign(
  signData: UploadSignRequest
): Promise<UploadSignResponse> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      word: signData.word,
      videoData: signData.videoData,
      duration: signData.duration,
      timestamp: signData.timestamp || new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload sign');
  }

  return response.json();
}

/**
 * Get all recorded ASL signs
 */
export async function listSigns(): Promise<ListSignsResponse> {
  const response = await fetch(`${API_BASE_URL}/list`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch signs');
  }

  return response.json();
}

/**
 * Update the status of a recorded ASL sign
 */
export async function updateSignStatus(
  word: string,
  status: 'approved' | 'pending' | 'deleted'
): Promise<UpdateSignStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update sign status');
  }

  return response.json();
}

/**
 * Helper function to convert a Blob to base64 string
 * Useful for preparing video data for upload
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if the ASL API server is running
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
