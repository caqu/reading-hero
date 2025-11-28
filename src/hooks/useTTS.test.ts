import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTTS } from './useTTS';

// @vitest-environment jsdom

// Mock fetch globally
global.fetch = vi.fn();

// Mock Audio constructor
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  volume: 1,
})) as any;

describe('useTTS Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ url: '/audio/words/test.wav' }),
    });
  });

  describe('playWordSound', () => {
    it('should handle single word correctly', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playWordSound('cat');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('word?text=cat')
      );
    });

    it('should handle multi-word phrases correctly', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playWordSound('cat face');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('word?text=cat%20face')
      );
    });

    it('should normalize uppercase to lowercase', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playWordSound('DOG');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('word?text=dog')
      );
    });

    it('should reject invalid words with special characters', async () => {
      const { result } = renderHook(() => useTTS());
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.playWordSound('test-123');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid word')
      );

      consoleSpy.mockRestore();
    });

    it('should not call API when word is empty', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playWordSound('');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('playLetterSound', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ url: '/audio/letters/a.wav' }),
      });
    });

    it('should handle single letter correctly', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playLetterSound('a');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('letter?char=a')
      );
    });

    it('should normalize uppercase to lowercase', async () => {
      const { result } = renderHook(() => useTTS());

      await act(async () => {
        await result.current.playLetterSound('B');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('letter?char=b')
      );
    });

    it('should reject non-letter characters', async () => {
      const { result } = renderHook(() => useTTS());
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.playLetterSound('1');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid letter')
      );

      consoleSpy.mockRestore();
    });
  });
});
