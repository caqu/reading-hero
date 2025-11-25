// src/tests/unit/useGameState.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as useGameStateModule from "../../hooks/useGameState";
import type { Word } from "../../types";

// Mock the shuffleArray function to return the array unchanged for predictable tests
vi.mock("../../hooks/useGameState", async () => {
  const actual = await vi.importActual("../../hooks/useGameState");
  return {
    ...actual,
    shuffleArray: <T,>(array: T[]) => array, // Return unchanged array for tests
  };
});

describe("useGameState", () => {
  const mockWords: Word[] = [
    {
      id: "cat",
      text: "cat",
      imageUrl: "/images/cat.png",
      signImageUrl: "/images/sign_cat.png",
      difficulty: "easy",
    },
    {
      id: "dog",
      text: "dog",
      imageUrl: "/images/dog.png",
      signImageUrl: "/images/sign_dog.png",
      difficulty: "easy",
    },
    {
      id: "fish",
      text: "fish",
      imageUrl: "/images/fish.png",
      signImageUrl: "/images/sign_fish.png",
      difficulty: "medium",
    },
  ];

  const { useGameState } = useGameStateModule;

  describe("Initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.words).toEqual(mockWords);
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.correctAttempts).toBe(0);
      expect(result.current.incorrectAttempts).toBe(0);
      expect(result.current.totalAttempts).toBe(0);
    });

    it("should set current word to first word", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.currentWord).toEqual(mockWords[0]);
      expect(result.current.currentWord?.text).toBe("cat");
    });

    it("should set current letter to first letter of first word", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.currentLetter).toBe("c");
    });

    it("should handle empty word list", () => {
      const { result } = renderHook(() => useGameState([]));

      expect(result.current.words).toEqual([]);
      expect(result.current.currentWord).toBeNull();
      expect(result.current.currentLetter).toBeNull();
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe("handleKeyPress - Correct Input", () => {
    it("should accept correct lowercase letter", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      let isCorrect: boolean = false;
      act(() => {
        isCorrect = result.current.handleKeyPress("c");
      });

      expect(isCorrect).toBe(true);
      expect(result.current.correctAttempts).toBe(1);
      expect(result.current.incorrectAttempts).toBe(0);
      expect(result.current.currentLetterIndex).toBe(1);
    });

    it("should accept correct uppercase letter (case-insensitive)", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      let isCorrect: boolean = false;
      act(() => {
        isCorrect = result.current.handleKeyPress("C");
      });

      expect(isCorrect).toBe(true);
      expect(result.current.correctAttempts).toBe(1);
      expect(result.current.incorrectAttempts).toBe(0);
      expect(result.current.currentLetterIndex).toBe(1);
    });

    it("should advance letter index on correct input", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
      });
      expect(result.current.currentLetterIndex).toBe(1);
      expect(result.current.currentLetter).toBe("a");

      act(() => {
        result.current.handleKeyPress("a");
      });
      expect(result.current.currentLetterIndex).toBe(2);
      expect(result.current.currentLetter).toBe("t");
    });

    it("should handle multiple correct inputs in sequence", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
      });

      expect(result.current.correctAttempts).toBe(2);
      expect(result.current.incorrectAttempts).toBe(0);
      expect(result.current.currentLetterIndex).toBe(2);
    });
  });

  describe("handleKeyPress - Incorrect Input", () => {
    it("should reject incorrect letter", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      let isCorrect: boolean = true;
      act(() => {
        isCorrect = result.current.handleKeyPress("x");
      });

      expect(isCorrect).toBe(false);
      expect(result.current.incorrectAttempts).toBe(1);
      expect(result.current.correctAttempts).toBe(0);
      expect(result.current.currentLetterIndex).toBe(0);
    });

    it("should not advance on incorrect input", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("x");
      });

      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.currentLetter).toBe("c");
    });

    it("should track multiple incorrect attempts", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("x");
        result.current.handleKeyPress("y");
        result.current.handleKeyPress("z");
      });

      expect(result.current.incorrectAttempts).toBe(3);
      expect(result.current.correctAttempts).toBe(0);
    });

    it("should track total attempts correctly", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("x");
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("z");
        result.current.handleKeyPress("a");
      });

      expect(result.current.correctAttempts).toBe(2);
      expect(result.current.incorrectAttempts).toBe(2);
      expect(result.current.totalAttempts).toBe(4);
    });
  });

  describe("Word Completion", () => {
    it("should automatically advance to next word when current word is complete", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.handleKeyPress("t");
      });

      expect(result.current.currentWordIndex).toBe(1);
      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.currentWord?.text).toBe("dog");
      expect(result.current.currentLetter).toBe("d");
    });

    it("should complete multiple words in sequence", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.handleKeyPress("t");
      });

      expect(result.current.currentWord?.text).toBe("dog");

      act(() => {
        result.current.handleKeyPress("d");
        result.current.handleKeyPress("o");
        result.current.handleKeyPress("g");
      });

      expect(result.current.currentWord?.text).toBe("fish");
      expect(result.current.currentWordIndex).toBe(2);
    });

    it("should track statistics across multiple words", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("x");
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.handleKeyPress("t");
      });

      expect(result.current.correctAttempts).toBe(3);
      expect(result.current.incorrectAttempts).toBe(1);
      expect(result.current.currentWordIndex).toBe(1);
    });
  });

  describe("Game Completion", () => {
    it("should mark game as complete when all words are finished", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        "cat".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "dog".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "fish".split("").forEach((letter) => result.current.handleKeyPress(letter));
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.currentWordIndex).toBe(3);
      expect(result.current.currentWord).toBeNull();
      expect(result.current.currentLetter).toBeNull();
    });

    it("should not accept input after game is complete", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        "cat".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "dog".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "fish".split("").forEach((letter) => result.current.handleKeyPress(letter));
      });

      const attemptsBeforeExtra = result.current.totalAttempts;

      let isCorrect: boolean = true;
      act(() => {
        isCorrect = result.current.handleKeyPress("x");
      });

      expect(isCorrect).toBe(false);
      expect(result.current.totalAttempts).toBe(attemptsBeforeExtra);
    });

    it("should maintain final statistics after completion", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("x");
        "cat".split("").forEach((letter) => result.current.handleKeyPress(letter));
        result.current.handleKeyPress("y");
        "dog".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "fish".split("").forEach((letter) => result.current.handleKeyPress(letter));
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.correctAttempts).toBe(10);
      expect(result.current.incorrectAttempts).toBe(2);
      expect(result.current.totalAttempts).toBe(12);
    });
  });

  describe("nextWord Function", () => {
    it("should manually advance to next word", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.nextWord();
      });

      expect(result.current.currentWordIndex).toBe(1);
      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.currentWord?.text).toBe("dog");
    });

    it("should reset letter index when advancing word", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.nextWord();
      });

      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.currentLetter).toBe("d");
    });

    it("should not advance beyond last word", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.nextWord();
        result.current.nextWord();
        result.current.nextWord();
        result.current.nextWord();
      });

      expect(result.current.currentWordIndex).toBe(3);
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe("resetGame Function", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.handleKeyPress("x");
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.correctAttempts).toBe(0);
      expect(result.current.incorrectAttempts).toBe(0);
      expect(result.current.totalAttempts).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.currentWord?.text).toBe("cat");
      expect(result.current.currentLetter).toBe("c");
    });

    it("should reset from completed state", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        "cat".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "dog".split("").forEach((letter) => result.current.handleKeyPress(letter));
        "fish".split("").forEach((letter) => result.current.handleKeyPress(letter));
      });

      expect(result.current.isComplete).toBe(true);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.isComplete).toBe(false);
      expect(result.current.currentWordIndex).toBe(0);
      expect(result.current.currentWord?.text).toBe("cat");
    });

    it("should allow playing again after reset", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.resetGame();
      });

      act(() => {
        result.current.handleKeyPress("c");
      });

      expect(result.current.correctAttempts).toBe(1);
      expect(result.current.currentLetterIndex).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single-letter words", () => {
      const singleLetterWords: Word[] = [
        { id: "a", text: "a", imageUrl: "/images/a.png", signImageUrl: "/images/sign_a.png", difficulty: "easy" },
        { id: "i", text: "i", imageUrl: "/images/i.png", signImageUrl: "/images/sign_i.png", difficulty: "easy" },
      ];

      const { result } = renderHook(() => useGameState(singleLetterWords));

      act(() => {
        result.current.handleKeyPress("a");
      });

      expect(result.current.currentWordIndex).toBe(1);
      expect(result.current.currentWord?.text).toBe("i");
    });

    it("should handle words with repeated letters", () => {
      const repeatedLetterWords: Word[] = [
        { id: "moon", text: "moon", imageUrl: "/images/moon.png", signImageUrl: "/images/sign_moon.png", difficulty: "easy" },
      ];

      const { result } = renderHook(() => useGameState(repeatedLetterWords));

      act(() => {
        result.current.handleKeyPress("m");
        result.current.handleKeyPress("o");
        result.current.handleKeyPress("o");
        result.current.handleKeyPress("n");
      });

      expect(result.current.currentWordIndex).toBe(1);
      expect(result.current.isComplete).toBe(true);
    });

    it("should handle mixed case words correctly", () => {
      const mixedCaseWords: Word[] = [
        { id: "Cat", text: "Cat", imageUrl: "/images/cat.png", signImageUrl: "/images/sign_cat.png", difficulty: "easy" },
      ];

      const { result } = renderHook(() => useGameState(mixedCaseWords));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("A");
        result.current.handleKeyPress("T");
      });

      expect(result.current.correctAttempts).toBe(3);
      expect(result.current.isComplete).toBe(true);
    });

    it("should not crash with empty string key", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      act(() => {
        result.current.handleKeyPress("");
      });

      expect(result.current.currentLetterIndex).toBe(0);
      expect(result.current.incorrectAttempts).toBe(1);
    });
  });

  describe("Computed Values", () => {
    it("should compute totalAttempts correctly", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.totalAttempts).toBe(0);

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("x");
        result.current.handleKeyPress("y");
        result.current.handleKeyPress("a");
      });

      expect(result.current.totalAttempts).toBe(4);
    });

    it("should update currentWord when word index changes", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.currentWord?.text).toBe("cat");

      act(() => {
        result.current.nextWord();
      });

      expect(result.current.currentWord?.text).toBe("dog");
    });

    it("should update currentLetter when letter index changes", () => {
      const { result } = renderHook(() => useGameState(mockWords));

      expect(result.current.currentLetter).toBe("c");

      act(() => {
        result.current.handleKeyPress("c");
      });

      expect(result.current.currentLetter).toBe("a");
    });

    it("should return null for currentWord and currentLetter when complete", () => {
      const shortList: Word[] = [mockWords[0]!];
      const { result } = renderHook(() => useGameState(shortList));

      act(() => {
        result.current.handleKeyPress("c");
        result.current.handleKeyPress("a");
        result.current.handleKeyPress("t");
      });

      expect(result.current.currentWord).toBeNull();
      expect(result.current.currentLetter).toBeNull();
    });
  });

  describe("Callback Stability", () => {
    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useGameState(mockWords));

      const initialHandleKeyPress = result.current.handleKeyPress;
      const initialNextWord = result.current.nextWord;
      const initialResetGame = result.current.resetGame;

      act(() => {
        result.current.handleKeyPress("c");
      });

      rerender();

      expect(result.current.handleKeyPress).toBe(initialHandleKeyPress);
      expect(result.current.nextWord).toBe(initialNextWord);
      expect(result.current.resetGame).toBe(initialResetGame);
    });
  });
});
