/**
 * Letter to phoneme mapping for Text-to-Speech
 * Maps each letter to its phonetic sound pronunciation
 */

export const LETTER_SOUNDS: Record<string, string> = {
  a: "ah",
  b: "bah",
  c: "kuh",
  d: "duh",
  e: "eh",
  f: "fuh",
  g: "ga",
  h: "huh",
  i: "i",
  j: "juh",
  k: "kuh",
  l: "la",
  m: "muh",
  n: "nuh",
  o: "oh",
  p: "puh",
  q: "kuh",
  r: "RH",
  s: "sz",
  t: "tuh",
  u: "uh",
  v: "vuh",
  w: "wuh",
  x: "ks",
  y: "yuh",
  z: "z",
};

/**
 * Get the phonetic sound for a letter
 */
export function getLetterSound(letter: string): string {
  const normalized = letter.toLowerCase();
  return LETTER_SOUNDS[normalized] || letter;
}

/**
 * Get all letters that have sounds defined
 */
export function getAllLetters(): string[] {
  return Object.keys(LETTER_SOUNDS);
}
