import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnScreenKeyboard } from '../../../components/OnScreenKeyboard';

describe('OnScreenKeyboard', () => {
  describe('Rendering', () => {
    it('should render all 26 letters in QWERTY layout', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      // Check that all 26 letters are present
      const expectedLetters = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

      expectedLetters.forEach(letter => {
        const button = screen.getByRole('button', { name: `Letter ${letter}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(letter);
      });
    });

    it('should render keyboard with correct ARIA attributes', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyboard = screen.getByRole('group', { name: 'On-screen keyboard' });
      expect(keyboard).toBeInTheDocument();
    });

    it('should render keys in three rows (QWERTY layout)', () => {
      const mockOnKeyPress = vi.fn();
      const { container } = render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      // Query keyboard rows by class (since they're divs, not semantic elements)
      const rows = container.querySelectorAll('[class*="keyboardRow"]');
      expect(rows).toHaveLength(3);
    });
  });

  describe('Key Press Interaction', () => {
    it('should call onKeyPress when a key is clicked', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.click(keyA);

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
      expect(mockOnKeyPress).toHaveBeenCalledWith('A');
    });

    it('should call onKeyPress for each different key clicked', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyC = screen.getByRole('button', { name: 'Letter C' });
      const keyA = screen.getByRole('button', { name: 'Letter A' });
      const keyT = screen.getByRole('button', { name: 'Letter T' });

      fireEvent.click(keyC);
      fireEvent.click(keyA);
      fireEvent.click(keyT);

      expect(mockOnKeyPress).toHaveBeenCalledTimes(3);
      expect(mockOnKeyPress).toHaveBeenNthCalledWith(1, 'C');
      expect(mockOnKeyPress).toHaveBeenNthCalledWith(2, 'A');
      expect(mockOnKeyPress).toHaveBeenNthCalledWith(3, 'T');
    });

    it('should handle keyboard navigation (Enter key)', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.keyDown(keyA, { key: 'Enter' });

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
      expect(mockOnKeyPress).toHaveBeenCalledWith('A');
    });

    it('should handle keyboard navigation (Space key)', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.keyDown(keyA, { key: ' ' });

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
      expect(mockOnKeyPress).toHaveBeenCalledWith('A');
    });
  });

  describe('Highlight Functionality', () => {
    it('should highlight the specified key (case-insensitive)', () => {
      const mockOnKeyPress = vi.fn();
      const { container } = render(
        <OnScreenKeyboard onKeyPress={mockOnKeyPress} highlightKey="a" />
      );

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      expect(keyA.className).toMatch(/highlighted/);
    });

    it('should highlight key when uppercase is provided', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} highlightKey="B" />);

      const keyB = screen.getByRole('button', { name: 'Letter B' });
      expect(keyB.className).toMatch(/highlighted/);
    });

    it('should have aria-pressed="true" for highlighted key', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} highlightKey="C" />);

      const keyC = screen.getByRole('button', { name: 'Letter C' });
      expect(keyC).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not highlight any key when highlightKey is undefined', () => {
      const mockOnKeyPress = vi.fn();
      const { container } = render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const highlightedKeys = container.querySelectorAll('[class*="highlighted"]');
      expect(highlightedKeys).toHaveLength(0);
    });

    it('should update highlight when highlightKey prop changes', () => {
      const mockOnKeyPress = vi.fn();
      const { rerender } = render(
        <OnScreenKeyboard onKeyPress={mockOnKeyPress} highlightKey="A" />
      );

      let keyA = screen.getByRole('button', { name: 'Letter A' });
      let keyB = screen.getByRole('button', { name: 'Letter B' });

      expect(keyA.className).toMatch(/highlighted/);
      expect(keyB.className).not.toMatch(/highlighted/);

      // Update the highlighted key
      rerender(<OnScreenKeyboard onKeyPress={mockOnKeyPress} highlightKey="B" />);

      keyA = screen.getByRole('button', { name: 'Letter A' });
      keyB = screen.getByRole('button', { name: 'Letter B' });

      expect(keyA.className).not.toMatch(/highlighted/);
      expect(keyB.className).toMatch(/highlighted/);
    });
  });

  describe('Disabled State', () => {
    it('should not call onKeyPress when disabled and key is clicked', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} disabled={true} />);

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.click(keyA);

      expect(mockOnKeyPress).not.toHaveBeenCalled();
    });

    it('should have disabled attribute on all buttons when disabled', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} disabled={true} />);

      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should call onKeyPress when not disabled', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} disabled={false} />);

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      fireEvent.click(keyA);

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
    });

    it('should update disabled state when prop changes', () => {
      const mockOnKeyPress = vi.fn();
      const { rerender } = render(
        <OnScreenKeyboard onKeyPress={mockOnKeyPress} disabled={false} />
      );

      const keyA = screen.getByRole('button', { name: 'Letter A' });
      expect(keyA).not.toBeDisabled();

      rerender(<OnScreenKeyboard onKeyPress={mockOnKeyPress} disabled={true} />);
      expect(keyA).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const firstButton = screen.getByRole('button', { name: 'Letter Q' });
      expect(firstButton).toHaveAttribute('type', 'button');
    });

    it('should have proper ARIA labels for all keys', () => {
      const mockOnKeyPress = vi.fn();
      render(<OnScreenKeyboard onKeyPress={mockOnKeyPress} />);

      const keyZ = screen.getByRole('button', { name: 'Letter Z' });
      expect(keyZ).toHaveAttribute('aria-label', 'Letter Z');
    });
  });
});
