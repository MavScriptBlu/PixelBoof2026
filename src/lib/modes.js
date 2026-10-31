/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEMES = {
  arcade: {
    name: 'Arcade & Platform',
    shortName: 'Arcade',
    emoji: '🕹️',
    desc: '8-bit sprites, platformers & speedsters',
    modes: [
      {
        key: 'mario',
        name: 'Pipe Panic',
        emoji: '🍄',
        color: '#ef4444',
        prompt: `Transform the person in the photo into a new, original character that would fit into the Super Mario universe, in a cartoon sticker style. No overalls, plumber hats, or Mushrooms.`
      },
      {
        key: '8bit',
        name: '8-bit',
        emoji: '🎮',
        color: '#06b6d4',
        prompt: `Transform the person's face into an 8-bit pixel art character sprite. The final image should be a die-cut sticker of the sprite with a thick white border, isolated on a flat black background.`
      },
      {
        key: 'sonic',
        name: 'Speedster Spin',
        emoji: '🌀',
        color: '#3b82f6',
        prompt: `Transform the person in the photo into an original character from the Sonic the Hedgehog universe, capturing the fast, energetic, and rebellious attitude of the 90s games. The character should have large, expressive eyes, and resemble a cartoon animal.`
      },
      {
        key: 'pacman',
        name: 'Maze-Muncher',
        emoji: '🟡',
        color: '#eab308',
        prompt: `Create a new, original ghost character for the Pac-Man universe based on the person in the photo.`
      },
      {
        key: 'donkeykong',
        name: 'Banana Brawl',
        emoji: '🦍',
        color: '#d97706',
        prompt: `Transform the person in the photo into a new, original cartoon animal character from the Donkey Kong Country universe, such as a primate or reptile.`
      },
      {
        key: 'kirby',
        name: 'Puff Pal',
        emoji: '💖',
        color: '#ec4899',
        prompt: `Transform the person in the photo into a new, original cute, round, friendly creature. The style should be soft, pastel, and cheerful, with a simple, bubbly design.`
      },
      {
        key: 'bubsy',
        name: 'Whiskers',
        emoji: '😼',
        color: '#f97316',
        prompt: `Transform the person in the photo into a new, original character from the Bubsy the Bobcat universe, a wisecracking bobcat with a t-shirt and a sassy attitude. The style should be a vibrant 90s cartoon sticker.`
      }
    ]
  },
  rpg: {
    name: 'RPG & Fantasy',
    shortName: 'RPG/Fantasy',
    emoji: '⚔️',
    desc: 'Heroic quests, 90s anime RPGs & gothic hunters',
    modes: [
      {
        key: 'zelda',
        name: 'Chronicles of Hero',
        emoji: '🛡️',
        color: '#10b981',
        prompt: `Transform the person in the photo into a new, original character from The Legend of Zelda universe, in a classic anime sticker style. No green tunics.`
      },
      {
        key: 'finalfantasy',
        name: 'Last Dream',
        emoji: '🧙',
        color: '#8b5cf6',
        prompt: `Transform the person in the photo into a new, original character from the Final Fantasy universe, in the detailed and ornate illustrative style of classic 90s concept art. The character should have flowing hair and intricate, fantasy-inspired clothing.`
      },
      {
        key: 'chronotrigger',
        name: 'Time Jolt',
        emoji: '⏳',
        color: '#f59e0b',
        prompt: `Transform the person in the photo into a new, original character from the Chrono Trigger universe, in Akira Toriyama's distinct 90s anime style.`
      },
      {
        key: 'pokemon',
        name: 'Tall Grass Trainer',
        emoji: '⚡',
        color: '#eab308',
        prompt: `Turn the person in the photo into a new, original Pokémon trainer, complete with a cap with a unique emblem (not a pokeball or circular) and fingerless gloves. No Poké Balls or red-and-white spheres.`
      },
      {
        key: 'castlevania',
        name: 'Draculight',
        emoji: '🦇',
        color: '#991b1b',
        prompt: `Transform the person in the photo into a new, original gothic vampire hunter from the Castlevania universe, in a dark, dramatic anime sticker style.`
      },
      {
        key: 'earthbound',
        name: 'Home-bound',
        emoji: '🌎',
        color: '#ec4899',
        prompt: `Transform the person in the photo into a new, original quirky character from the world of Earthbound. The art style should be simple, charming, and clay-like, with a vibrant, offbeat color palette.`
      }
    ]
  },
  action: {
    name: 'Action & Sci-Fi',
    shortName: 'Action/Sci-Fi',
    emoji: '🥊',
    desc: 'Arcade fighters, cyber armor & tomb raiders',
    modes: [
      {
        key: 'megaman',
        name: 'Armor Ace',
        emoji: '🤖',
        color: '#0ea5e9',
        prompt: `Transform the person in the photo into a new, original 'Robot Master' character from the Mega Man universe, in a classic anime sticker style.`
      },
      {
        key: 'streetfighter',
        name: 'Sidewalk Showdown',
        emoji: '🥊',
        color: '#ef4444',
        prompt: `Transform the person in the photo into a new, original Street Fighter character, in a vibrant, dynamic 90s arcade sticker style.`
      },
      {
        key: 'mortalkombat',
        name: 'Fatal Conflict',
        emoji: '🐉',
        color: '#f59e0b',
        prompt: `Transform the person in the photo into a new, original warrior from the Mortal Kombat universe. The style should be gritty and realistic, like digitized arcade sprites, with a dynamic fighting pose.`
      },
      {
        key: 'metroid',
        name: 'Robo-tron',
        emoji: '👽',
        color: '#14b8a6',
        prompt: `Transform the person in the photo into a new, original bounty hunter from the Metroid universe, encased in unique, futuristic power armor. The style should be dark, atmospheric, and sci-fi.`
      },
      {
        key: 'metalgear',
        name: 'Tin Tactics',
        emoji: '📦',
        color: '#64748b',
        prompt: `Transform the person in the photo into a new, original tactical espionage operative from the Metal Gear Solid universe, with heavy ink strokes and a muted color palette.`
      },
      {
        key: 'tombraider',
        name: 'Artifact Protocol',
        emoji: '💎',
        color: '#0d9488',
        prompt: `Transform the person in the photo into a new, original rugged adventurer in the style of Tomb Raider, with practical gear for exploring ancient ruins and a confident expression.`
      },
      {
        key: 'artifactprotocol',
        name: 'Artifact PS1',
        emoji: '⛏️',
        color: '#78716c',
        prompt: `Transform the person in the photo into a new, original character in the style of a 1990s PlayStation 1 low-polygon 3D video game model with pixelated textures.`
      }
    ]
  },
  fursona: {
    name: 'Fursona',
    shortName: 'Fursona',
    emoji: '🐾',
    desc: 'Anthropomorphic animals with holo foil sheen',
    modes: [
      {
        key: 'furAuto',
        name: 'Spirit Animal',
        emoji: '🐾',
        color: '#a855f7',
        prompt: `Transform the person in the photo into a vibrant anthropomorphic spirit animal character that matches their vibe and expression, in a glossy die-cut sticker style.`
      },
      {
        key: 'furFox',
        name: 'Fox',
        emoji: '🦊',
        color: '#f97316',
        prompt: `Transform the person in the photo into a clever, stylish anthropomorphic fox character wearing their outfit and accessories, in a vibrant cartoon sticker style.`
      },
      {
        key: 'furWolf',
        name: 'Wolf',
        emoji: '🐺',
        color: '#64748b',
        prompt: `Transform the person in the photo into a cool, heroic anthropomorphic wolf character in a vibrant arcade sticker style.`
      },
      {
        key: 'furCat',
        name: 'Cat',
        emoji: '🐱',
        color: '#ec4899',
        prompt: `Transform the person in the photo into an expressive anthropomorphic cat character in a colorful retro anime sticker style.`
      },
      {
        key: 'furDragon',
        name: 'Dragon',
        emoji: '🐉',
        color: '#10b981',
        prompt: `Transform the person in the photo into a majestic, friendly anthropomorphic dragon character with iridescent scales, in a fantasy sticker style.`
      },
      {
        key: 'furOwl',
        name: 'Owl',
        emoji: '🦉',
        color: '#b45309',
        prompt: `Transform the person in the photo into a wise, scholarly anthropomorphic owl character with ornate feathers, in a storybook game sticker style.`
      },
      {
        key: 'furTiger',
        name: 'Tiger',
        emoji: '🐯',
        color: '#ea580c',
        prompt: `Transform the person in the photo into a bold, energetic anthropomorphic tiger character in a 90s arcade mascot sticker style.`
      },
      {
        key: 'furPanda',
        name: 'Panda',
        emoji: '🐼',
        color: '#475569',
        prompt: `Transform the person in the photo into a cheerful anthropomorphic panda character in a cute pixel-toon sticker style.`
      },
      {
        key: 'furRabbit',
        name: 'Rabbit',
        emoji: '🐰',
        color: '#f472b6',
        prompt: `Transform the person in the photo into a speedy, upbeat anthropomorphic rabbit adventurer in a retro platformer sticker style.`
      },
      {
        key: 'furPenguin',
        name: 'Penguin',
        emoji: '🐧',
        color: '#0284c7',
        prompt: `Transform the person in the photo into a cool anthropomorphic penguin character with chill arcade vibes, in a die-cut sticker style.`
      }
    ]
  },
  cards_toons: {
    name: 'Cards & Toons',
    shortName: 'Cards/Toons',
    emoji: '🃏',
    desc: 'Collector cards, holo foils & animated toons',
    modes: [
      {
        key: 'pokemoncard',
        name: 'Pokémon Card',
        emoji: '🃏',
        color: '#eab308',
        prompt: `Transform the person in the photo into an illustrated collector trading card character inside a fantasy elemental card frame with HP stats and ability text, as a die-cut sticker.`
      },
      {
        key: 'holocard',
        name: 'Holo Foil Card',
        emoji: '✨',
        color: '#c084fc',
        prompt: `Transform the person in the photo into a holographic foil collector card hero with prismatic rainbow shimmer and retro arcade stats, as a die-cut sticker.`
      },
      {
        key: 'sportcard',
        name: 'Sports Card',
        emoji: '🏆',
        color: '#22c55e',
        prompt: `Transform the person in the photo into a vintage 90s championship arcade sports trading card star with a bold nameplate frame, as a die-cut sticker.`
      },
      {
        key: 'codcard',
        name: 'Operator ID',
        emoji: '🎖️',
        color: '#475569',
        prompt: `Transform the person in the photo into a tactical sci-fi squad operator ID badge with futuristic HUD accents, in a die-cut sticker style.`
      },
      {
        key: 'mlp',
        name: 'My Little Pony',
        emoji: '🦄',
        color: '#ec4899',
        prompt: `Transform the person in the photo into a magical pastel pegasus or unicorn toon character inspired by classic animated friendship cartoons, as a die-cut sticker.`
      },
      {
        key: 'lilo',
        name: 'Experiment 626',
        emoji: '👽',
        color: '#3b82f6',
        prompt: `Transform the person in the photo into a cute, mischievous tropical sci-fi alien creature in a watercolor cartoon sticker style.`
      },
      {
        key: 'kingdomhearts',
        name: 'Kingdom Hearts',
        emoji: '🗝️',
        color: '#6366f1',
        prompt: `Transform the person in the photo into a Square Enix style action-RPG hero with oversized zippers, belts, and a mystical key-shaped weapon, as a die-cut sticker.`
      }
    ]
  },
  pride_duos: {
    name: 'Pride & Duos',
    shortName: 'Pride/Duos',
    emoji: '🌈',
    desc: 'Rainbow royalty & 2-player couple/duo modes',
    modes: [
      {
        key: 'pride',
        name: 'Rainbow Royalty',
        emoji: '🌈',
        color: '#ec4899',
        prompt: `Transform the person in the photo into a dazzling Rainbow Royalty arcade hero with vibrant prism cape and crown accents, in a celebratory die-cut sticker style.`
      },
      {
        key: 'dragqueen',
        name: 'Slay Queen',
        emoji: '💅',
        color: '#d946ef',
        prompt: `Transform the person in the photo into a glamorous, high-fashion runway superstar with dramatic hair, fierce makeup, and sparkling stage attire, as a die-cut sticker.`
      },
      {
        key: 'pridewarrior',
        name: 'Pride Warrior',
        emoji: '⚔️',
        color: '#8b5cf6',
        prompt: `Transform the person in the photo into a heroic fantasy paladin with iridescent rainbow crystal armor and a glowing shield, in an anime sticker style.`
      },
      {
        key: 'shipcouple',
        name: 'Ship It! (2P)',
        emoji: '💑',
        color: '#f43f5e',
        prompt: `Transform the two people in the photo into an adorable 16-bit anime duo posing together inside a pixel heart emblem frame, as a single die-cut sticker.`
      },
      {
        key: 'fantasymates',
        name: 'Quest Duo (2P)',
        emoji: '⚔️',
        color: '#f59e0b',
        prompt: `Transform the two people in the photo into a co-op RPG adventurer duo ready for a quest together, in a 90s fantasy anime die-cut sticker style.`
      },
      {
        key: 'moonlightpair',
        name: 'Moonlight (2P)',
        emoji: '🌙',
        color: '#38bdf8',
        prompt: `Transform the two people in the photo into a cosmic stargazer duo framed by a crescent moon and pixel stars, in a synthwave anime die-cut sticker style.`
      }
    ]
  }
}

// Build flat modes dictionary for backward compatibility across components
const modes = {
  custom: {
    name: 'Custom Prompt',
    emoji: '✏️',
    color: '#ffcc00',
    prompt: ''
  }
}

Object.values(THEMES).forEach(theme => {
  theme.modes.forEach(m => {
    modes[m.key] = {
      name: m.name,
      emoji: m.emoji,
      color: m.color,
      prompt: m.prompt
    }
  })
})

export default modes
