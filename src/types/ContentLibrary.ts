/**
 * ContentLibrary Schema
 *
 * Master structure for all content items.
 * Organized by type: words, phrases, sentences.
 */

import { ContentItem } from "./ContentItem";

export interface ContentLibrary {
  words: ContentItem[];
  phrases: ContentItem[];
  sentences: ContentItem[];
}
