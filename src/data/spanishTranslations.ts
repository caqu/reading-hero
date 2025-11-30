/**
 * Spanish translations for English words
 * Used for bilingual TTS feature
 *
 * TODO: Expand this dictionary as needed
 */

export const spanishTranslations: Record<string, string> = {
  // Animals
  shark: "tiburón",
  bird: "pájaro",
  chicken: "pollo",
  dolphin: "delfín",
  dragon: "dragón",
  duck: "pato",
  eagle: "águila",
  fish: "pez",
  owl: "búho",
  parrot: "loro",
  peacock: "pavo real",
  penguin: "pingüino",
  snake: "serpiente",
  swan: "cisne",
  whale: "ballena",
  bear: "oso",
  fox: "zorro",
  frog: "rana",
  koala: "koala",
  monkey: "mono",
  orangutan: "orangután",
  panda: "panda",
  poodle: "caniche",
  rabbit: "conejo",
  turtle: "tortuga",
  wolf: "lobo",
  zebra: "cebra",

  // Fruits
  grapes: "uvas",
  melon: "melón",
  orange: "naranja",
  watermelon: "sandía",

  // Food
  pizza: "pizza",

  // Fantasy
  wizard: "mago",

  // Test words
  test: "prueba",
};

/**
 * Get Spanish translation for an English word
 * Returns undefined if translation not available
 */
export function getSpanishTranslation(word: string): string | undefined {
  return spanishTranslations[word.toLowerCase()];
}
