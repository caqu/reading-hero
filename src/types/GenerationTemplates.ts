/**
 * GenerationTemplates Schema
 *
 * Templates for dynamically generating phrases and micro-sentences.
 * Used by the content generator to create novel combinations.
 */

export interface PhraseTemplate {
  id: string;
  pattern: string[]; // e.g. ["the", "{noun}"]
  allowedCategories?: string[];
}

export interface SentenceTemplate {
  id: string;
  pattern: string[]; // e.g. ["the", "{noun}", "{verb}s"]
  maxWords: number;  // enforce micro-sentence 4–7 words
  allowedCategories?: string[];
  silly?: boolean;   // used by surprise injector
}
