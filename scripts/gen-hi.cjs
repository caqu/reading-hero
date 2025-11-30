const fs = require("fs");
const path = require("path");

/**
 * Master list: 200 high-interest words divided by categories.
 * Each entry includes:
 *  - word
 *  - spanish translation
 *  - emoji (if available)
 */
const MASTER = {
  animals: [
    ["monkey", "mono", "🐒"],
    ["dolphin", "delfín", "🐬"],
    ["penguin", "pingüino", "🐧"],
    ["koala", "koala", "🐨"],
    ["owl", "búho", "🦉"],
    ["turtle", "tortuga", "🐢"],
    ["hamster", "hámster", "🐹"],
    ["panda", "panda", "🐼"],
    ["otter", "nutria", "🦦"],
    ["fox", "zorro", "🦊"],
    ["wolf", "lobo", "🐺"],
    ["tiger", "tigre", "🐯"],
    ["lion", "león", "🦁"],
    ["cheetah", "guepardo", "🐆"],
    ["bear", "oso", "🐻"],
    ["bat", "murciélago", "🦇"],
    ["zebra", "cebra", "🦓"],
    ["whale", "ballena", "🐋"],
    ["shark", "tiburón", "🦈"],
    ["horse", "caballo", "🐴"],
    ["camel", "camello", "🐪"],
    ["jellyfish", "medusa", "🐙"],
    ["octopus", "pulpo", "🐙"],
    ["crab", "cangrejo", "🦀"],
    ["lobster", "langosta", "🦞"],
    ["seahorse", "caballito de mar", "🐎"],
    ["butterfly", "mariposa", "🦋"],
    ["dragonfly", "libélula", "🐝"],
    ["parrot", "loro", "🦜"],
    ["eagle", "águila", "🦅"],
    ["hawk", "halcón", "🦅"],
    ["spider", "araña", "🕷️"],
    ["snail", "caracol", "🐌"],
    ["frog", "rana", "🐸"],
    ["lizard", "lagarto", "🦎"],
    ["hedgehog", "erizo", "🦔"],
    ["seal", "foca", "🦭"],
    ["walrus", "morsa", "🦭"],
    ["kangaroo", "canguro", "🦘"],
    ["sloth", "perezoso", "🦥"]
  ],

  food: [
    ["pizza", "pizza", "🍕"],
    ["burger", "hamburguesa", "🍔"],
    ["taco", "taco", "🌮"],
    ["donut", "donita", "🍩"],
    ["cookie", "galleta", "🍪"],
    ["brownie", "brownie", "🧁"],
    ["cupcake", "cupcake", "🧁"],
    ["pancake", "panqueque", "🥞"],
    ["waffle", "waffle", "🧇"],
    ["spaghetti", "espagueti", "🍝"],
    ["ramen", "ramen", "🍜"],
    ["noodles", "fideos", "🍜"],
    ["popsicle", "paleta", "🍭"],
    ["smoothie", "batido", "🥤"],
    ["cereal", "cereal", "🥣"],
    ["sandwich", "sándwich", "🥪"],
    ["hotdog", "perrito caliente", "🌭"],
    ["salad", "ensalada", "🥗"],
    ["grapes", "uvas", "🍇"],
    ["watermelon", "sandía", "🍉"],
    ["strawberry", "fresa", "🍓"],
    ["banana", "plátano", "🍌"],
    ["pineapple", "piña", "🍍"],
    ["mango", "mango", "🥭"],
    ["carrot", "zanahoria", "🥕"]
  ],

  fantasy: [
    ["wizard", "mago", "🧙‍♂️"],
    ["dragon", "dragón", "🐉"],
    ["unicorn", "unicornio", "🦄"],
    ["fairy", "hada", "🧚‍♀️"],
    ["goblin", "duende", "👹"],
    ["giant", "gigante", ""],
    ["mermaid", "sirena", "🧜‍♀️"],
    ["phoenix", "fénix", ""],
    ["troll", "trol", ""],
    ["castle", "castillo", "🏰"],
    ["treasure", "tesoro", "💰"],
    ["magic", "magia", "✨"],
    ["spell", "hechizo", "🪄"],
    ["portal", "portal", ""],
    ["pirate", "pirata", "🏴‍☠️"],
    ["knight", "caballero", "🤺"],
    ["princess", "princesa", "👸"],
    ["crown", "corona", "👑"],
    ["wand", "varita", "🪄"],
    ["cloak", "capa", ""],
    ["sword", "espada", "⚔️"],
    ["potion", "poción", "🧪"],
    ["crystal", "cristal", ""],
    ["monster", "monstruo", ""],
    ["ghost", "fantasma", "👻"]
  ],

  tech: [
    ["robot", "robot", "🤖"],
    ["selfie", "selfi", "🤳"],
    ["emoji", "emoji", "😊"],
    ["tablet", "tableta", "💊"],
    ["laptop", "computadora portátil", "💻"],
    ["keyboard", "teclado", "⌨️"],
    ["mouse", "ratón", "🖱️"],
    ["headphones", "audífonos", "🎧"],
    ["camera", "cámara", "📷"],
    ["drone", "dron", "🛸"],
    ["rocket", "cohete", "🚀"],
    ["satellite", "satélite", "🛰️"],
    ["joystick", "joystick", "🎮"],
    ["remote", "control remoto", "📺"],
    ["charger", "cargador", "🔌"],
    ["battery", "batería", "🔋"],
    ["sensor", "sensor", "📡"],
    ["antenna", "antena", "📡"],
    ["avatar", "avatar", "🧍"],
    ["podcast", "podcast", "🎙️"]
  ],

  nature: [
    ["rainbow", "arcoíris", "🌈"],
    ["thunder", "trueno", ""],
    ["lightning", "relámpago", "⚡"],
    ["forest", "bosque", "🌲"],
    ["mountain", "montaña", "⛰️"],
    ["ocean", "océano", "🌊"],
    ["river", "río", "🏞️"],
    ["waterfall", "cascada", ""],
    ["desert", "desierto", "🏜️"],
    ["canyon", "cañón", ""],
    ["volcano", "volcán", "🌋"],
    ["sunrise", "amanecer", "🌅"],
    ["sunset", "atardecer", "🌇"],
    ["moonlight", "luz de luna", "🌙"],
    ["snowflake", "copo de nieve", "❄️"],
    ["hurricane", "huracán", ""],
    ["tornado", "tornado", "🌪️"],
    ["earthquake", "terremoto", ""],
    ["island", "isla", "🏝️"],
    ["cave", "cueva", "🕳️"]
  ],

  actions: [
    ["jump", "saltar", ""],
    ["dance", "bailar", ""],
    ["run", "correr", ""],
    ["spin", "girar", ""],
    ["clap", "aplaudir", ""],
    ["kick", "patear", ""],
    ["swim", "nadar", ""],
    ["sing", "cantar", ""],
    ["laugh", "reír", ""],
    ["smile", "sonreír", ""],
    ["wink", "guiñar", ""],
    ["wave", "saludar", ""],
    ["yawn", "bostezar", ""],
    ["wiggle", "moverse", ""],
    ["crawl", "gatear", ""],
    ["climb", "escalar", ""],
    ["slide", "deslizar", ""],
    ["splash", "chapotear", ""],
    ["bounce", "rebotar", ""],
    ["zoom", "zumbar", ""],
    ["sparkle", "brillar", ""],
    ["glow", "resplandecer", ""],
    ["roar", "rugir", ""],
    ["soar", "elevarse", ""],
    ["whisper", "susurrar", ""]
  ],

  feelings: [
    ["happy", "feliz"],
    ["sad", "triste"],
    ["angry", "enojado"],
    ["excited", "emocionado"],
    ["scared", "asustado"],
    ["brave", "valiente"],
    ["proud", "orgulloso"],
    ["tired", "cansado"],
    ["shy", "tímido"],
    ["surprised", "sorprendido"]
  ],

  places: [
    ["beach", "playa", "🏖️"],
    ["castle", "castillo", "🏰"],
    ["forest", "bosque", "🌲"],
    ["desert", "desierto", "🏜️"],
    ["jungle", "jungla", "🌴"],
    ["city", "ciudad", "🏙️"],
    ["village", "pueblo", ""],
    ["school", "escuela", "🏫"],
    ["museum", "museo", "🏛️"],
    ["playground", "parque infantil", ""],
    ["park", "parque", "🌳"],
    ["zoo", "zoológico", "🦓"],
    ["space", "espacio", "🌌"],
    ["planet", "planeta", "🪐"],
    ["galaxy", "galaxia", "🌌"]
  ],

  activities: [
    ["soccer", "fútbol", "⚽"],
    ["baseball", "béisbol", "⚾"],
    ["basketball", "baloncesto", "🏀"],
    ["drawing", "dibujar", "✏️"],
    ["painting", "pintar", "🎨"],
    ["music", "música", "🎵"],
    ["dancing", "bailar", ""],
    ["cooking", "cocinar", "🍳"],
    ["fishing", "pescar", "🎣"],
    ["camping", "acampar", "🏕️"]
  ],

  nowWords: [
    ["meme", "meme", ""],
    ["avatar", "avatar", ""],
    ["filter", "filtro", ""],
    ["sticker", "pegatina", ""],
    ["emoji", "emoji", ""],
    ["selfie", "selfi", ""],
    ["hashtag", "hashtag", ""],
    ["video", "video", ""],
    ["stream", "transmitir", ""],
    ["playlist", "lista de reproducción", ""]
  ]
};

/** Small helper functions */
const estimateSyllables = (word) =>
  Math.max(1, (word.match(/[aeiouy]+/gi) || []).length);

const complexity = (word) =>
  /sh|ch|th|ph|wh|igh|eau|tion/.test(word) ? 2 : 1;

function toContentItem(word, spanish, emoji, category) {
  return {
    id: `hi-${word.toLowerCase()}`,
    text: word,
    type: "word",
    stage: 2,
    category,
    emoji: emoji || "",
    syllables: estimateSyllables(word),
    letterCount: word.length,
    orthographicComplexity: complexity(word),
    noveltyScore: 0.8,
    concretenessScore: 1.0,
    spanish: {
      text: spanish,
      voiceGender: "female"
    },
    asl: {
      placeholderId: `asl-hi-${word.toLowerCase()}`,
      hasVideo: false
    },
    hasImage: true,
    hasASL: false,
    hasSpanish: true,
    srBin: "A"
  };
}

let items = [];

for (const category in MASTER) {
  for (const row of MASTER[category]) {
    const [word, spanish, emoji] = row;
    items.push(toContentItem(word, spanish, emoji, category));
  }
}

const output = `import { ContentItem } from "../types/ContentItem";

export const highInterestWords: ContentItem[] = ${JSON.stringify(
  items,
  null,
  2
)};`;

const outPath = path.join(
  process.cwd(),
  "src/content/highInterestWords.ts"
);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, "utf8");

console.log(`✔ Generated ${items.length} items at: ${outPath}`);
