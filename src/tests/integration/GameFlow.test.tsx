import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

describe('GameFlow Integration Tests', () => {
  describe('Navigation Flow', () => {
    it('should start on home screen and navigate to game screen', () => {
      render(<App />);

      // Should show home screen initially
      expect(screen.getByText('Welcome to MotorKeys!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start the game' })).toBeInTheDocument();

      // Click start button
      const startButton = screen.getByRole('button', { name: 'Start the game' });
      fireEvent.click(startButton);

      // Should navigate to game screen
      expect(screen.queryByText('Welcome to MotorKeys!')).not.toBeInTheDocument();
      expect(screen.getByText('Type the letters to spell the word')).toBeInTheDocument();
    });

    it('should show on-screen keyboard on game screen', () => {
      render(<App />);

      const startButton = screen.getByRole('button', { name: 'Start the game' });
      fireEvent.click(startButton);

      // Verify keyboard is present
      const keyboard = screen.getByRole('group', { name: 'On-screen keyboard' });
      expect(keyboard).toBeInTheDocument();

      // Verify some keys are present
      expect(screen.getByRole('button', { name: 'Letter A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Letter Z' })).toBeInTheDocument();
    });

    it('should show first word on game screen', () => {
      render(<App />);

      const startButton = screen.getByRole('button', { name: 'Start the game' });
      fireEvent.click(startButton);

      // Should show letter tiles for the first word (assuming "cat" is first)
      const letterTiles = screen.getByRole('group', { name: 'Letter tiles' });
      expect(letterTiles).toBeInTheDocument();
    });
  });

  describe('On-Screen Keyboard Input', () => {
    it('should reveal letters as on-screen keys are clicked', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Initially all tiles should be empty
      expect(screen.getAllByLabelText('Empty tile').length).toBe(3);

      // Click first letter
      const keyC = screen.getByRole('button', { name: 'Letter C' });
      fireEvent.click(keyC);

      // First tile should be revealed
      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
      });
    });

    it('should show error feedback on wrong key press', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Press wrong letter (Z instead of C for "cat")
      const keyZ = screen.getByRole('button', { name: 'Letter Z' });
      fireEvent.click(keyZ);

      // Should show error feedback
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('✗');
      });
    });
  });

  describe('Physical Keyboard Input', () => {
    it('should complete a word using physical keyboard input', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Simulate physical keyboard events for "cat"
      fireEvent.keyDown(window, { key: 'c' });

      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'a' });

      await waitFor(() => {
        expect(screen.getByLabelText('Letter a')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 't' });

      // Should show success feedback
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle uppercase and lowercase input equally', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Simulate mixed case input for "cat"
      fireEvent.keyDown(window, { key: 'C' }); // Uppercase

      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'a' }); // Lowercase

      await waitFor(() => {
        expect(screen.getByLabelText('Letter a')).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: 'T' }); // Uppercase

      // Should complete successfully
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should ignore non-letter keys from physical keyboard', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Try pressing non-letter keys
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: ' ' });
      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: 'Shift' });

      // No letters should be revealed
      const emptyTiles = screen.getAllByLabelText('Empty tile');
      expect(emptyTiles.length).toBe(3);
    });
  });

  describe('Keyboard Highlighting', () => {
    it('should highlight the next expected letter on keyboard', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // First letter of "cat" is 'c', so C should be highlighted
      const keyC = screen.getByRole('button', { name: 'Letter C' });
      expect(keyC).toHaveAttribute('aria-pressed', 'true');
      expect(keyC.className).toMatch(/highlighted/);
    });

    it('should update highlight as letters are typed', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Initially C should be highlighted
      const keyC = screen.getByRole('button', { name: 'Letter C' });
      expect(keyC).toHaveAttribute('aria-pressed', 'true');

      // Type C
      fireEvent.keyDown(window, { key: 'c' });

      // Now A should be highlighted
      await waitFor(() => {
        const keyA = screen.getByRole('button', { name: 'Letter A' });
        expect(keyA).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Letter Tile Revealing', () => {
    it('should reveal letters in tiles as they are typed', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // All tiles should be empty initially
      expect(screen.getAllByLabelText('Empty tile').length).toBe(3);

      // Type first letter
      fireEvent.keyDown(window, { key: 'c' });

      // First tile should be revealed
      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
        expect(screen.getAllByLabelText('Empty tile').length).toBe(2);
      });

      // Type second letter
      fireEvent.keyDown(window, { key: 'a' });

      // Second tile should be revealed
      await waitFor(() => {
        expect(screen.getByLabelText('Letter a')).toBeInTheDocument();
        expect(screen.getAllByLabelText('Empty tile').length).toBe(1);
      });
    });

    it('should not reveal letters for wrong key presses', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Press wrong letter
      fireEvent.keyDown(window, { key: 'z' });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // All tiles should still be empty
      expect(screen.getAllByLabelText('Empty tile').length).toBe(3);

      // No letters should be revealed
      expect(screen.queryByLabelText(/^Letter [a-z]$/)).not.toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should display progress bar with correct information', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Progress bar should be visible
      const progressRegion = screen.getByRole('region', { name: 'Game progress' });
      expect(progressRegion).toBeInTheDocument();

      // Should show word 1 of 11
      expect(screen.getByText('1 / 11')).toBeInTheDocument();
    });
  });

  describe('Mixed Input Sources', () => {
    it('should handle combination of physical keyboard and on-screen clicks', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Type first letter with physical keyboard
      fireEvent.keyDown(window, { key: 'c' });

      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
      });

      // Type second letter with on-screen keyboard
      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.click(keyA);

      await waitFor(() => {
        expect(screen.getByLabelText('Letter a')).toBeInTheDocument();
      });

      // Type third letter with physical keyboard
      fireEvent.keyDown(window, { key: 't' });

      // Should complete word successfully
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle rapid wrong key presses', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Rapid wrong keys
      fireEvent.keyDown(window, { key: 'x' });
      fireEvent.keyDown(window, { key: 'y' });
      fireEvent.keyDown(window, { key: 'z' });

      // Should show error feedback
      await waitFor(() => {
        const errorAlert = screen.queryByText('✗');
        expect(errorAlert).toBeInTheDocument();
      });

      // Letters should not be revealed
      expect(screen.getAllByLabelText('Empty tile').length).toBe(3);
    });

    it('should recover from errors and allow correct typing', async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // Wrong key
      fireEvent.keyDown(window, { key: 'z' });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('✗');
      });

      // Correct key
      fireEvent.keyDown(window, { key: 'c' });

      await waitFor(() => {
        expect(screen.getByLabelText('Letter c')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate all components correctly', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Start the game' }));

      // All major components should be present
      expect(screen.getByRole('region', { name: 'Game progress' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Letter tiles' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'On-screen keyboard' })).toBeInTheDocument();
      expect(screen.getByText('Type the letters to spell the word')).toBeInTheDocument();
    });
  });
});
