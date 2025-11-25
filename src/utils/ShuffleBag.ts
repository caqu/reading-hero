/**
 * ShuffleBag - A utility class for randomizing items without repeats.
 *
 * This class implements a shuffle bag algorithm that:
 * 1. Provides items in random order
 * 2. Ensures no item repeats until all items have been used once
 * 3. Automatically reshuffles when the bag is exhausted
 *
 * Perfect for games that need random content without immediate repeats.
 *
 * @example
 * ```ts
 * const bag = new ShuffleBag(['apple', 'banana', 'cherry']);
 * const item1 = bag.next(); // e.g., 'cherry'
 * const item2 = bag.next(); // e.g., 'apple' (guaranteed not 'cherry')
 * const item3 = bag.next(); // e.g., 'banana'
 * const item4 = bag.next(); // Reshuffled, could be any item
 * ```
 */
export class ShuffleBag<T> {
  private originalItems: T[];
  private currentBag: T[];

  /**
   * Creates a new ShuffleBag with the provided items.
   * @param items - Array of items to shuffle and draw from
   * @throws Error if items array is empty
   */
  constructor(items: T[]) {
    if (items.length === 0) {
      throw new Error('ShuffleBag cannot be initialized with an empty array');
    }

    this.originalItems = [...items];
    this.currentBag = [];
    this.refill();
  }

  /**
   * Refills and shuffles the bag with all original items.
   * Uses Fisher-Yates shuffle algorithm for unbiased randomization.
   */
  private refill(): void {
    this.currentBag = [...this.originalItems];
    this.shuffle();
  }

  /**
   * Fisher-Yates shuffle algorithm for in-place array shuffling.
   * Provides uniform distribution of permutations.
   */
  private shuffle(): void {
    for (let i = this.currentBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.currentBag[i]!;
      this.currentBag[i] = this.currentBag[j]!;
      this.currentBag[j] = temp;
    }
  }

  /**
   * Gets the next random item from the bag.
   * When the bag is empty, it automatically refills and reshuffles.
   *
   * @returns The next random item from the bag
   */
  next(): T {
    if (this.currentBag.length === 0) {
      this.refill();
    }

    // Remove and return the last item (O(1) operation)
    const item = this.currentBag.pop();
    if (item === undefined) {
      throw new Error('ShuffleBag is empty');
    }
    return item;
  }

  /**
   * Checks if the current bag has been exhausted (all items drawn once).
   * @returns true if the bag is empty and will refill on next(), false otherwise
   */
  isEmpty(): boolean {
    return this.currentBag.length === 0;
  }

  /**
   * Gets the number of items remaining in the current bag.
   * @returns Number of items left before refill
   */
  remaining(): number {
    return this.currentBag.length;
  }

  /**
   * Resets the bag to its initial state with a fresh shuffle.
   */
  reset(): void {
    this.refill();
  }
}
