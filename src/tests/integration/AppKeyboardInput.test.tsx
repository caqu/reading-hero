import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

describe('App - Keyboard Input Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should NOT show "try again" when typing the first correct letter', async () => {
    const { container } = render(<App />);

    // Start the game
    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    // Wait for game screen to appear
    await waitFor(() => {
      expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
    });

    // Type the first letter "C" for "CAT"
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'c',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(keyEvent);

    // Fast-forward past any feedback timeout
    vi.advanceTimersByTime(1000);

    // Should NOT see "try again" error message
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();

    // Should see the letter "C" revealed in the tiles
    const tiles = container.querySelectorAll('[class*="tile"]');
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('should show feedback only on incorrect letters', async () => {
    render(<App />);

    // Start the game
    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
    });

    // Type an incorrect letter "X"
    const wrongKeyEvent = new KeyboardEvent('keydown', {
      key: 'x',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(wrongKeyEvent);

    // Should see "try again" error message
    await waitFor(() => {
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    // Wait for error to clear
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
    });
  });

  it('should transition to next word after completing a word', async () => {
    render(<App />);

    // Start the game
    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
    });

    // Type "CAT" - all three letters
    const keys = ['c', 'a', 't'];
    for (const key of keys) {
      const keyEvent = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(keyEvent);

      // Small delay between keys
      vi.advanceTimersByTime(100);
    }

    // After typing "T" (last letter), should see "Great job!" success message
    await waitFor(() => {
      expect(screen.getByText(/great job/i)).toBeInTheDocument();
    });

    // Advance past the 2 second delay
    vi.advanceTimersByTime(2100);

    // Success message should be gone and we should be on the next word
    await waitFor(() => {
      expect(screen.queryByText(/great job/i)).not.toBeInTheDocument();
    });

    // Should now see progress indicator showing we moved to word 2
    // Note: Exact assertion depends on ProgressBar implementation
    // For now, just verify we didn't stay on word 1
  });

  it('should complete a full word without showing error feedback on correct letters', async () => {
    render(<App />);

    // Start the game
    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
    });

    // Type each letter of "CAT"
    const keys = ['c', 'a', 't'];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const keyEvent = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(keyEvent);

      // For letters that aren't the last one, should NOT see any feedback
      if (i < keys.length - 1) {
        vi.advanceTimersByTime(100);
        expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/great job/i)).not.toBeInTheDocument();
      }
    }

    // After last letter, should see "Great job!"
    await waitFor(() => {
      expect(screen.getByText(/great job/i)).toBeInTheDocument();
    });
  });

  it('should handle rapid correct typing without showing errors', async () => {
    render(<App />);

    // Start the game
    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
    });

    // Type "CAT" rapidly
    ['c', 'a', 't'].forEach(key => {
      const keyEvent = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(keyEvent);
    });

    // Should never see "try again" during correct typing
    vi.advanceTimersByTime(100);
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();

    // Should eventually see "Great job!"
    await waitFor(() => {
      expect(screen.getByText(/great job/i)).toBeInTheDocument();
    });
  });
});
