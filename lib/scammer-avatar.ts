// Deterministic emoji avatar generator for scammers
const SCAMMER_EMOJIS = [
  '\u{1F40D}', // snake
  '\u{1F3AD}', // masks
  '\u{1F921}', // clown
  '\u{1F99D}', // raccoon
  '\u{1F400}', // rat
  '\u{1F577}', // spider
  '\u{1F9A8}', // skunk
  '\u{1F41B}', // bug
  '\u{1F47B}', // ghost
  '\u{1F479}', // ogre
  '\u{1F47A}', // goblin
  '\u{1F916}', // robot
  '\u{1F9DF}', // zombie
  '\u{1F9B9}', // villain
  '\u{1F4A9}', // poop
  '\u{2620}',  // skull and crossbones
];

const BACKGROUND_COLORS = [
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#1a0a2e',
  '#2e1a1a',
  '#1a2e1a',
  '#2e2e1a',
  '#0a1a2e',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getScammerAvatar(identifier: string): { emoji: string; bgColor: string } {
  const hash = hashString(identifier.toLowerCase());
  const emojiIndex = hash % SCAMMER_EMOJIS.length;
  const colorIndex = (hash >> 4) % BACKGROUND_COLORS.length;

  return {
    emoji: SCAMMER_EMOJIS[emojiIndex],
    bgColor: BACKGROUND_COLORS[colorIndex],
  };
}

export function getScammerEmojiPair(identifier: string): string {
  const hash = hashString(identifier.toLowerCase());
  const emoji1 = SCAMMER_EMOJIS[hash % SCAMMER_EMOJIS.length];
  const emoji2 = SCAMMER_EMOJIS[(hash >> 4) % SCAMMER_EMOJIS.length];
  return `${emoji1}${emoji2}`;
}
