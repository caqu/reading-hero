import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LetterTiles } from '../../../components/LetterTiles';

// Helper function to safely access tile elements
const getTile = (tiles: NodeListOf<Element>, index: number): Element => {
  const tile = tiles[index];
  if (!tile) throw new Error(`Tile at index ${index} not found`);
  return tile;
};

describe('LetterTiles', () => {
  describe('Rendering', () => {
    it('should render tiles for each letter in the word', () => {
      const word = 'cat';
      const revealedLetters = [false, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(tiles).toHaveLength(3);
    });

    it('should render correct number of tiles for longer words', () => {
      const word = 'elephant';
      const revealedLetters = new Array(8).fill(false);
      const { container } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(tiles).toHaveLength(8);
    });

    it('should have correct ARIA attributes for the container', () => {
      const word = 'dog';
      const revealedLetters = [false, false, false];
      render(<LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />);

      const container = screen.getByRole('group', { name: 'Letter tiles' });
      expect(container).toBeInTheDocument();
    });
  });

  describe('Revealed Letters', () => {
    it('should show revealed letters correctly', () => {
      const word = 'cat';
      const revealedLetters = [true, false, false];
      render(<LetterTiles word={word} currentIndex={1} revealedLetters={revealedLetters} />);

      const revealedTile = screen.getByLabelText('Letter c');
      expect(revealedTile).toHaveTextContent('c');
    });

    it('should show multiple revealed letters', () => {
      const word = 'dog';
      const revealedLetters = [true, true, false];
      render(<LetterTiles word={word} currentIndex={2} revealedLetters={revealedLetters} />);

      const tileD = screen.getByLabelText('Letter d');
      const tileO = screen.getByLabelText('Letter o');

      expect(tileD).toHaveTextContent('d');
      expect(tileO).toHaveTextContent('o');
    });

    it('should not show unrevealed letters', () => {
      const word = 'sun';
      const revealedLetters = [true, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={1} revealedLetters={revealedLetters} />
      );

      const emptyTiles = screen.getAllByLabelText('Empty tile');
      expect(emptyTiles).toHaveLength(2);
    });

    it('should apply revealed class to revealed tiles', () => {
      const word = 'hat';
      const revealedLetters = [true, true, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={2} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).toMatch(/revealed/);
      expect(getTile(tiles, 1).className).toMatch(/revealed/);
      expect(getTile(tiles, 2).className).not.toMatch(/revealed/);
    });

    it('should show all letters when all are revealed', () => {
      const word = 'bed';
      const revealedLetters = [true, true, true];
      render(<LetterTiles word={word} currentIndex={3} revealedLetters={revealedLetters} />);

      expect(screen.getByLabelText('Letter b')).toHaveTextContent('b');
      expect(screen.getByLabelText('Letter e')).toHaveTextContent('e');
      expect(screen.getByLabelText('Letter d')).toHaveTextContent('d');
    });
  });

  describe('Current Letter Highlight', () => {
    it('should highlight the current letter tile', () => {
      const word = 'cat';
      const revealedLetters = [true, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={1} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 1).className).toMatch(/current/);
    });

    it('should have aria-current="true" on current tile', () => {
      const word = 'dog';
      const revealedLetters = [false, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0)).toHaveAttribute('aria-current', 'true');
      expect(getTile(tiles, 1)).toHaveAttribute('aria-current', 'false');
      expect(getTile(tiles, 2)).toHaveAttribute('aria-current', 'false');
    });

    it('should move highlight as currentIndex changes', () => {
      const word = 'sun';
      const { container, rerender } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={[false, false, false]} />
      );

      let tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).toMatch(/current/);
      expect(getTile(tiles, 1).className).not.toMatch(/current/);

      rerender(
        <LetterTiles word={word} currentIndex={1} revealedLetters={[true, false, false]} />
      );

      tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).not.toMatch(/current/);
      expect(getTile(tiles, 1).className).toMatch(/current/);
    });

    it('should highlight last tile when on last letter', () => {
      const word = 'map';
      const revealedLetters = [true, true, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={2} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 2).className).toMatch(/current/);
    });
  });

  describe('Past Letters Styling', () => {
    it('should apply past class to completed tiles', () => {
      const word = 'cup';
      const revealedLetters = [true, true, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={2} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).toMatch(/past/);
      expect(getTile(tiles, 1).className).toMatch(/past/);
      expect(getTile(tiles, 2).className).not.toMatch(/past/);
    });

    it('should not apply past class to current or future tiles', () => {
      const word = 'bus';
      const revealedLetters = [true, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={1} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).toMatch(/past/);
      expect(getTile(tiles, 1).className).not.toMatch(/past/); // current
      expect(getTile(tiles, 2).className).not.toMatch(/past/); // future
    });
  });

  describe('Visual State Combinations', () => {
    it('should correctly combine revealed and past states', () => {
      const word = 'toy';
      const revealedLetters = [true, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={1} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(getTile(tiles, 0).className).toMatch(/revealed/);
      expect(getTile(tiles, 0).className).toMatch(/past/);
      expect(getTile(tiles, 0).className).not.toMatch(/current/);
    });

    it('should show all visual states for a partially completed word', () => {
      const word = 'hello';
      const revealedLetters = [true, true, true, false, false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={3} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');

      // Past tiles (completed)
      expect(getTile(tiles, 0).className).toMatch(/revealed/);
      expect(getTile(tiles, 0).className).toMatch(/past/);
      expect(getTile(tiles, 1).className).toMatch(/revealed/);
      expect(getTile(tiles, 1).className).toMatch(/past/);
      expect(getTile(tiles, 2).className).toMatch(/revealed/);
      expect(getTile(tiles, 2).className).toMatch(/past/);

      // Current tile
      expect(getTile(tiles, 3).className).toMatch(/current/);
      expect(getTile(tiles, 3).className).not.toMatch(/past/);
      expect(getTile(tiles, 3).className).not.toMatch(/revealed/);

      // Future tiles
      expect(getTile(tiles, 4).className).not.toMatch(/current/);
      expect(getTile(tiles, 4).className).not.toMatch(/past/);
      expect(getTile(tiles, 4).className).not.toMatch(/revealed/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single letter words', () => {
      const word = 'a';
      const revealedLetters = [false];
      const { container } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(tiles).toHaveLength(1);
      expect(getTile(tiles, 0).className).toMatch(/current/);
    });

    it('should handle empty revealed array', () => {
      const word = 'cat';
      const revealedLetters: boolean[] = [];
      const { container } = render(
        <LetterTiles word={word} currentIndex={0} revealedLetters={revealedLetters} />
      );

      const tiles = container.querySelectorAll('[class*="tile"]');
      expect(tiles).toHaveLength(3);
    });
  });
});
