export interface StoryTheme {
  id: string;
  title: string;
  emoji: string;
  description: string;
  badgeColor: string;
  loreIntro: string;
  words: PhonicsWord[];
}

export interface PhonicsWord {
  word: string;
  pattern: 'silent-k' | 'silent-w' | 'silent-g' | 'digraph-ph' | 'digraph-ch' | 'digraph-sh' | 'vowel-team-ea' | 'vowel-team-oa' | 'vowel-team-ai' | 'blends';
  categoryLabel: string;
  syllables: string[];
  phoneticBreakdown: { chunk: string; type: 'silent' | 'vowel' | 'consonant' | 'blend'; color: string }[];
  difficulty: number;
  storySentence: string; // Punchy, ultra-simple 3-5 word hint sentence
  storyClue: string;     // Short clue for the student
}

export const STORY_THEMES: StoryTheme[] = [
  {
    id: 'castle_quest',
    title: 'Castle of the Golden Knight',
    emoji: '🏰',
    description: 'Help the young hero solve the ancient fortress riddle',
    badgeColor: 'border-yellow-400 text-yellow-300 bg-yellow-950/40',
    loreIntro: 'Sir Cedric embarks on a quest to open the enchanted castle gates...',
    words: [
      {
        word: 'KNIGHT',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NIGHT'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500 shadow-[0_0_10px_#f87171]' },
          { chunk: 'N', type: 'consonant', color: 'text-cyan-400 border-cyan-500 shadow-[0_0_10px_#22d3ee]' },
          { chunk: 'IGH', type: 'vowel', color: 'text-yellow-400 border-yellow-500 shadow-[0_0_10px_#facc15]' },
          { chunk: 'T', type: 'consonant', color: 'text-green-400 border-green-500 shadow-[0_0_10px_#4ade80]' }
        ],
        difficulty: 1,
        storySentence: 'Brave hero in armor',
        storyClue: 'A noble medieval warrior in shiny armor'
      },
      {
        word: 'KNOT',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NOT'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NOT', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Tie the tight rope',
        storyClue: 'A fastened loop in a piece of rope'
      },
      {
        word: 'KNIFE',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NIFE'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NIFE', type: 'consonant', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Sharp blade cuts vines',
        storyClue: 'A sharp tool with a blade'
      },
      {
        word: 'DRAGON',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['DRA', 'GON'],
        phoneticBreakdown: [
          { chunk: 'DR', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'GON', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Friendly green fire monster',
        storyClue: 'A legendary mythical winged reptile'
      },
      {
        word: 'BEACON',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['BEA', 'CON'],
        phoneticBreakdown: [
          { chunk: 'B', type: 'consonant', color: 'text-gray-300 border-gray-400' },
          { chunk: 'EA', type: 'vowel', color: 'text-green-400 border-green-500' },
          { chunk: 'CON', type: 'consonant', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Bright guiding light tower',
        storyClue: 'A guiding signal fire or tower light'
      },
      {
        word: 'SHIELD',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHIELD'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-pink-400 border-pink-500' },
          { chunk: 'IE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'LD', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Golden armor guards hero',
        storyClue: 'A protective board held to block attacks'
      },
      {
        word: 'CROWN',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['CROWN'],
        phoneticBreakdown: [
          { chunk: 'CR', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OWN', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Royal hat for king',
        storyClue: 'A shiny headpiece worn by royalty'
      },
      {
        word: 'SWORD',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['S', 'WORD'],
        phoneticBreakdown: [
          { chunk: 'S', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'ORD', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Blade of the knight',
        storyClue: 'A long steel weapon with a hilt'
      },
      {
        word: 'REACH',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['REACH'],
        phoneticBreakdown: [
          { chunk: 'R', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Stretch hand to gate',
        storyClue: 'To extend your arm toward something'
      },
      {
        word: 'KNEEL',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NEEL'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'N', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EEL', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Bow low to king',
        storyClue: 'To rest on your knees in honor'
      }
    ]
  },
  {
    id: 'ocean_mystery',
    title: 'Ocean Deep Expedition',
    emoji: '🌊',
    description: 'Explore coral reefs and decipher underwater messages',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-950/40',
    loreIntro: 'Dive into the sapphire reef to uncover mysteries of the marine abyss...',
    words: [
      {
        word: 'DOLPHIN',
        pattern: 'digraph-ph',
        categoryLabel: 'Digraph (PH)',
        syllables: ['DOL', 'PHIN'],
        phoneticBreakdown: [
          { chunk: 'DOL', type: 'consonant', color: 'text-blue-400 border-blue-500' },
          { chunk: 'PHIN', type: 'blend', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Playful jumper in waves',
        storyClue: 'An intelligent friendly sea mammal'
      },
      {
        word: 'STREAM',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['STRE', 'AM'],
        phoneticBreakdown: [
          { chunk: 'STR', type: 'blend', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-green-400 border-green-500' },
          { chunk: 'M', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Fresh water flowing river',
        storyClue: 'A small, narrow river of water'
      },
      {
        word: 'WRESTLE',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['WRES', 'TLE'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RES', type: 'consonant', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'TLE', type: 'blend', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 2,
        storySentence: 'Fight strong sea currents',
        storyClue: 'To struggle or fight against force'
      },
      {
        word: 'PHANTOM',
        pattern: 'digraph-ph',
        categoryLabel: 'Digraph (PH)',
        syllables: ['PHAN', 'TOM'],
        phoneticBreakdown: [
          { chunk: 'PH', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AN', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'TOM', type: 'consonant', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 2,
        storySentence: 'Glowing ghost jellyfish underwater',
        storyClue: 'An elusive or ghost-like sea creature'
      },
      {
        word: 'BLAST',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['BLAST'],
        phoneticBreakdown: [
          { chunk: 'BL', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'AST', type: 'consonant', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 1,
        storySentence: 'Sudden burst of wind',
        storyClue: 'A sudden burst of wind or energy'
      },
      {
        word: 'WHALE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['WHALE'],
        phoneticBreakdown: [
          { chunk: 'WH', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ALE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Giant swimming ocean friend',
        storyClue: 'The largest mammal swimming in the sea'
      },
      {
        word: 'FLOAT',
        pattern: 'vowel-team-oa',
        categoryLabel: 'Vowel Team (OA)',
        syllables: ['FLOAT'],
        phoneticBreakdown: [
          { chunk: 'FL', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'T', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Drift on top of water',
        storyClue: 'To rest gently on the water surface'
      },
      {
        word: 'SHARK',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHARK'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'ARK', type: 'vowel', color: 'text-[#ffd166] border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Fast swimmer with fin',
        storyClue: 'A quick ocean fish with a top fin'
      },
      {
        word: 'SHELL',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHELL'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'ELL', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Hard beach sea treasure',
        storyClue: 'A hard outer cover found on the beach'
      },
      {
        word: 'BEACH',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['BEACH'],
        phoneticBreakdown: [
          { chunk: 'B', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Sandy shore near ocean',
        storyClue: 'Sandy land at the edge of the sea'
      }
    ]
  },
  {
    id: 'forest_enchanted',
    title: 'The Enchanted Forest Secret',
    emoji: '🌲',
    description: 'Solve the riddle of the magical woodland creatures',
    badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-950/40',
    loreIntro: 'Deep within the whispering woods, magical creatures share hidden knowledge...',
    words: [
      {
        word: 'GNOME',
        pattern: 'silent-g',
        categoryLabel: 'Silent G (GN-)',
        syllables: ['G', 'NOME'],
        phoneticBreakdown: [
          { chunk: 'G', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NOME', type: 'consonant', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 2,
        storySentence: 'Little garden forest friend',
        storyClue: 'A small magical creature dwelling in woods'
      },
      {
        word: 'WRITTEN',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['WRIT', 'TEN'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RIT', type: 'vowel', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'TEN', type: 'consonant', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 2,
        storySentence: 'Magic letters carved on stone',
        storyClue: 'Marked letters or words on a surface'
      },
      {
        word: 'WRIST',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'RIST'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RIST', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Wear bracelet on arm joint',
        storyClue: 'The joint connecting the hand to the forearm'
      },
      {
        word: 'KNUCKLE',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['KNUCK', 'LE'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NUCK', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'LE', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 2,
        storySentence: 'Knock soft on wood door',
        storyClue: 'A finger joint used when knocking'
      },
      {
        word: 'ACORN',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['A', 'CORN'],
        phoneticBreakdown: [
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'CORN', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Oak tree nut for squirrel',
        storyClue: 'A small nut dropped from oak trees'
      },
      {
        word: 'LEAF',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['LEAF'],
        phoneticBreakdown: [
          { chunk: 'L', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'F', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Green plant on tree branch',
        storyClue: 'A flat green part of a plant'
      },
      {
        word: 'CHIRP',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['CHIRP'],
        phoneticBreakdown: [
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'IRP', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Sweet song of forest bird',
        storyClue: 'A short high sound made by a small bird'
      },
      {
        word: 'WREATH',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'REATH'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'ATH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 2,
        storySentence: 'Ring of forest leaves',
        storyClue: 'A circle of woven flowers or leaves'
      },
      {
        word: 'SHADE',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHADE'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'ADE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Cool spot under giant tree',
        storyClue: 'A dark cool area out of the sun'
      },
      {
        word: 'TWIG',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['TWIG'],
        phoneticBreakdown: [
          { chunk: 'TW', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'IG', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Tiny small wood stick',
        storyClue: 'A very small branch of a tree'
      }
    ]
  },
  {
    id: 'space_voyage',
    title: 'Cosmic Starship Odyssey',
    emoji: '🚀',
    description: 'Pilot your starship through asteroid belts and cosmic nebulae',
    badgeColor: 'border-indigo-400 text-indigo-300 bg-indigo-950/40',
    loreIntro: 'Commander Orion steers the starship toward the outer galaxy boundary...',
    words: [
      {
        word: 'PLANET',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['PLA', 'NET'],
        phoneticBreakdown: [
          { chunk: 'PL', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'NET', type: 'consonant', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Giant purple world in space',
        storyClue: 'A celestial body revolving around a star'
      },
      {
        word: 'SHADOW',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHA', 'DOW'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-pink-400 border-pink-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'DOW', type: 'consonant', color: 'text-blue-400 border-blue-500' }
        ],
        difficulty: 1,
        storySentence: 'Dark shape behind the light',
        storyClue: 'A dark shape created when light is blocked'
      },
      {
        word: 'CRUISE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['CRUISE'],
        phoneticBreakdown: [
          { chunk: 'CR', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'UI', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'SE', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 2,
        storySentence: 'Fly smooth in starship',
        storyClue: 'To travel at a steady, controlled speed'
      },
      {
        word: 'GNASH',
        pattern: 'silent-g',
        categoryLabel: 'Silent G (GN-)',
        syllables: ['G', 'NASH'],
        phoneticBreakdown: [
          { chunk: 'G', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'N', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ASH', type: 'blend', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 2,
        storySentence: 'Monster bites space rocks',
        storyClue: 'To grind or strike teeth together'
      },
      {
        word: 'STAR',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['STAR'],
        phoneticBreakdown: [
          { chunk: 'ST', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AR', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Glowing sun in night sky',
        storyClue: 'A bright burning sun far away in space'
      },
      {
        word: 'ROBOT',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['RO', 'BOT'],
        phoneticBreakdown: [
          { chunk: 'RO', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'BOT', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Metal friendly starship helper',
        storyClue: 'A mechanical helper powered by electricity'
      },
      {
        word: 'LAUNCH',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['LAUNCH'],
        phoneticBreakdown: [
          { chunk: 'L', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AU', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'NCH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Blast off rocket into sky',
        storyClue: 'To send a rocket flying into space'
      },
      {
        word: 'ORBIT',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['OR', 'BIT'],
        phoneticBreakdown: [
          { chunk: 'OR', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'BIT', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Circle around giant planet',
        storyClue: 'To travel in a curved path around a planet'
      },
      {
        word: 'SHINE',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHINE'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'INE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Glow bright like starlight',
        storyClue: 'To give off bright light'
      },
      {
        word: 'SPACE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['SPACE'],
        phoneticBreakdown: [
          { chunk: 'SP', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ACE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Cosmic ocean of stars',
        storyClue: 'The vast area beyond Earth atmosphere'
      }
    ]
  },
  {
    id: 'jurassic_safari',
    title: 'Dino Valley Safari',
    emoji: '🦖',
    description: 'Track prehistoric dinosaurs through the foggy volcano jungle',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-950/40',
    loreIntro: 'Rangers trek into the hidden valley where ancient giants still roam...',
    words: [
      {
        word: 'BRANCH',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['BRANCH'],
        phoneticBreakdown: [
          { chunk: 'BR', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'AN', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'CH', type: 'blend', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 1,
        storySentence: 'Tall tree wood arm',
        storyClue: 'A woody part of a tree growing out from the trunk'
      },
      {
        word: 'WRECK',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'RECK'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RECK', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Crash and smash camp',
        storyClue: 'To destroy or break something completely'
      },
      {
        word: 'CHOMP',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['CHOMP'],
        phoneticBreakdown: [
          { chunk: 'CH', type: 'blend', color: 'text-pink-400 border-pink-500' },
          { chunk: 'OMP', type: 'consonant', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Big crunchy dinosaur bite',
        storyClue: 'To bite or chew loudly and eagerly'
      },
      {
        word: 'TRACK',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['TRACK'],
        phoneticBreakdown: [
          { chunk: 'TR', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'ACK', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Giant foot print in mud',
        storyClue: 'A trail or mark left by an animal passing'
      },
      {
        word: 'ROAR',
        pattern: 'vowel-team-oa',
        categoryLabel: 'Vowel Team (OA)',
        syllables: ['ROAR'],
        phoneticBreakdown: [
          { chunk: 'R', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'R', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Loud dino jungle shout',
        storyClue: 'A deep loud sound made by a big beast'
      },
      {
        word: 'STOMP',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['STOMP'],
        phoneticBreakdown: [
          { chunk: 'ST', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OMP', type: 'consonant', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Heavy foot step on ground',
        storyClue: 'To walk with heavy loud steps'
      },
      {
        word: 'BONE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['BONE'],
        phoneticBreakdown: [
          { chunk: 'B', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ONE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Fossil hard dino skeleton',
        storyClue: 'A hard piece of an animal skeleton'
      },
      {
        word: 'CLAW',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['CLAW'],
        phoneticBreakdown: [
          { chunk: 'CL', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AW', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Sharp toe nail of beast',
        storyClue: 'A sharp curved nail on an animal toe'
      },
      {
        word: 'TAIL',
        pattern: 'vowel-team-ai',
        categoryLabel: 'Vowel Team (AI)',
        syllables: ['TAIL'],
        phoneticBreakdown: [
          { chunk: 'T', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AI', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'L', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Long wiggling dino back',
        storyClue: 'The long back part of an animal body'
      },
      {
        word: 'NEST',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['NEST'],
        phoneticBreakdown: [
          { chunk: 'N', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EST', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Cozy egg bed in jungle',
        storyClue: 'A soft place where eggs are kept safe'
      }
    ]
  },
  {
    id: 'cyber_city',
    title: 'Cyber City Detective',
    emoji: '🤖',
    description: 'Crack digital security codes and catch the elusive neon bandit',
    badgeColor: 'border-violet-400 text-violet-300 bg-violet-950/40',
    loreIntro: 'Detective Neo patrols the futuristic skyline beneath glowing neon rain...',
    words: [
      {
        word: 'PHONE',
        pattern: 'digraph-ph',
        categoryLabel: 'Digraph (PH)',
        syllables: ['PHONE'],
        phoneticBreakdown: [
          { chunk: 'PH', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ONE', type: 'vowel', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 1,
        storySentence: 'Call on cyber device',
        storyClue: 'A device used for voice communication and calls'
      },
      {
        word: 'WRONG',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'RONG'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RONG', type: 'consonant', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Not correct code answer',
        storyClue: 'Incorrect or not true'
      },
      {
        word: 'KNOW',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NOW'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NOW', type: 'vowel', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Understand the mystery clue',
        storyClue: 'To understand or have information about something'
      },
      {
        word: 'SHIELD',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHIELD'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-pink-400 border-pink-500' },
          { chunk: 'IE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'LD', type: 'consonant', color: 'text-blue-400 border-blue-500' }
        ],
        difficulty: 1,
        storySentence: 'Blue glowing energy defender',
        storyClue: 'A barrier designed to defend and protect'
      },
      {
        word: 'CHIP',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['CHIP'],
        phoneticBreakdown: [
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'IP', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Tiny computer memory data card',
        storyClue: 'A small microchip holding digital information'
      },
      {
        word: 'CODE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['CODE'],
        phoneticBreakdown: [
          { chunk: 'C', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ODE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Secret digital number key',
        storyClue: 'A set of secret letters or numbers'
      },
      {
        word: 'GRAPH',
        pattern: 'digraph-ph',
        categoryLabel: 'Digraph (PH)',
        syllables: ['GRAPH'],
        phoneticBreakdown: [
          { chunk: 'GR', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'PH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Data chart on holographic screen',
        storyClue: 'A chart or diagram showing data'
      },
      {
        word: 'LIGHT',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['LIGHT'],
        phoneticBreakdown: [
          { chunk: 'L', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'IGH', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'T', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Neon glow in city rain',
        storyClue: 'Bright glow coming from a lamp or sign'
      },
      {
        word: 'TRACK',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['TRACK'],
        phoneticBreakdown: [
          { chunk: 'TR', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ACK', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Follow cyber bandit trail',
        storyClue: 'To hunt or follow digital footsteps'
      },
      {
        word: 'FLASH',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['FLASH'],
        phoneticBreakdown: [
          { chunk: 'FL', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Quick bright burst of light',
        storyClue: 'A sudden burst of bright light'
      }
    ]
  },
  {
    id: 'pyramid_archaeology',
    title: 'Secret Tomb of the Pharaoh',
    emoji: '🏺',
    description: 'Decipher hieroglyphics and avoid ancient sandbox traps',
    badgeColor: 'border-orange-400 text-orange-300 bg-orange-950/40',
    loreIntro: 'Explorers step into the sunlit desert tomb to uncover forgotten golden relics...',
    words: [
      {
        word: 'COACH',
        pattern: 'vowel-team-oa',
        categoryLabel: 'Vowel Team (OA)',
        syllables: ['COACH'],
        phoneticBreakdown: [
          { chunk: 'C', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OA', type: 'vowel', color: 'text-green-400 border-green-500' },
          { chunk: 'CH', type: 'blend', color: 'text-pink-400 border-pink-500' }
        ],
        difficulty: 1,
        storySentence: 'Horse cart desert ride',
        storyClue: 'A wheeled passenger vehicle or wagon'
      },
      {
        word: 'FLOAT',
        pattern: 'vowel-team-oa',
        categoryLabel: 'Vowel Team (OA)',
        syllables: ['FLOAT'],
        phoneticBreakdown: [
          { chunk: 'FL', type: 'blend', color: 'text-green-400 border-green-500' },
          { chunk: 'OA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'T', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Rest gentle on water',
        storyClue: 'To rest or move on the surface of liquid'
      },
      {
        word: 'KNEEL',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NEEL'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'N', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EEL', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Bend down on knees',
        storyClue: 'To rest on one or both knees'
      },
      {
        word: 'WRATH',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'RATH'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'RATH', type: 'consonant', color: 'text-orange-400 border-orange-500' }
        ],
        difficulty: 2,
        storySentence: 'Fierce pharaoh anger storm',
        storyClue: 'Extreme anger or fierce fury'
      },
      {
        word: 'GOLD',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['GOLD'],
        phoneticBreakdown: [
          { chunk: 'G', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OLD', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Shiny yellow treasure metal',
        storyClue: 'A precious yellow shiny metal'
      },
      {
        word: 'STONE',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['STONE'],
        phoneticBreakdown: [
          { chunk: 'ST', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ONE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Heavy rock tomb wall',
        storyClue: 'Hard solid rock material'
      },
      {
        word: 'SAND',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['SAND'],
        phoneticBreakdown: [
          { chunk: 'S', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AND', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Golden desert dust floor',
        storyClue: 'Tiny grains of rock on desert ground'
      },
      {
        word: 'MAP',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['MAP'],
        phoneticBreakdown: [
          { chunk: 'M', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'AP', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Guide scroll to hidden tomb',
        storyClue: 'A drawing showing paths to secret locations'
      },
      {
        word: 'CHAIN',
        pattern: 'vowel-team-ai',
        categoryLabel: 'Vowel Team (AI)',
        syllables: ['CHAIN'],
        phoneticBreakdown: [
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'AI', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'N', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Heavy metal door lock links',
        storyClue: 'Connected metal rings used to hold doors'
      },
      {
        word: 'BEAD',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['BEAD'],
        phoneticBreakdown: [
          { chunk: 'B', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'D', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Tiny glass jewel necklace piece',
        storyClue: 'A small round piece of jewelry'
      }
    ]
  },
  {
    id: 'warriors_hoops',
    title: 'Golden State Warriors Hoops',
    emoji: '🏀',
    description: 'Splash three-pointers and championship passes with the Bay Area Warriors!',
    badgeColor: 'border-yellow-400 text-blue-300 bg-blue-950/40',
    loreIntro: 'Step onto the Chase Center court with the Golden State Warriors to sink three-pointers...',
    words: [
      {
        word: 'CHAMPION',
        pattern: 'digraph-ch',
        categoryLabel: 'Digraph (CH)',
        syllables: ['CHAM', 'PI', 'ON'],
        phoneticBreakdown: [
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'AM', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'PI', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'ON', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Golden State trophy winner',
        storyClue: 'A team or player winning the final title trophy'
      },
      {
        word: 'SPLASH',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SPLASH'],
        phoneticBreakdown: [
          { chunk: 'SPL', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'A', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Pure net long shot',
        storyClue: 'A perfect shot swishing through the net'
      },
      {
        word: 'SHOOT',
        pattern: 'digraph-sh',
        categoryLabel: 'Digraph (SH)',
        syllables: ['SHOOT'],
        phoneticBreakdown: [
          { chunk: 'SH', type: 'blend', color: 'text-purple-400 border-purple-500' },
          { chunk: 'OO', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'T', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Launch basketball at hoop',
        storyClue: 'To release the ball toward the basket'
      },
      {
        word: 'KNIGHT',
        pattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        syllables: ['K', 'NIGHT'],
        phoneticBreakdown: [
          { chunk: 'K', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'NIGHT', type: 'consonant', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Brave arena warrior player',
        storyClue: 'A courageous warrior fighting on court'
      },
      {
        word: 'REBOUND',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['RE', 'BOUND'],
        phoneticBreakdown: [
          { chunk: 'RE', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'BOUND', type: 'blend', color: 'text-cyan-400 border-cyan-500' }
        ],
        difficulty: 1,
        storySentence: 'Grab missed shot ball',
        storyClue: 'Catching the ball off the rim or backboard'
      },
      {
        word: 'SCREEN',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['SCREEN'],
        phoneticBreakdown: [
          { chunk: 'SCR', type: 'blend', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EEN', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Block defender for shooter',
        storyClue: 'Setting a wall to free up your teammate'
      },
      {
        word: 'COACH',
        pattern: 'vowel-team-oa',
        categoryLabel: 'Vowel Team (OA)',
        syllables: ['COACH'],
        phoneticBreakdown: [
          { chunk: 'C', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'CH', type: 'blend', color: 'text-purple-400 border-purple-500' }
        ],
        difficulty: 1,
        storySentence: 'Warriors team bench leader',
        storyClue: 'The basketball instructor directing the play'
      },
      {
        word: 'TEAM',
        pattern: 'vowel-team-ea',
        categoryLabel: 'Vowel Team (EA)',
        syllables: ['TEAM'],
        phoneticBreakdown: [
          { chunk: 'T', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'EA', type: 'vowel', color: 'text-yellow-400 border-yellow-500' },
          { chunk: 'M', type: 'consonant', color: 'text-green-400 border-green-500' }
        ],
        difficulty: 1,
        storySentence: 'Five players together court',
        storyClue: 'A group of athletes playing on the same side'
      },
      {
        word: 'GOLD',
        pattern: 'blends',
        categoryLabel: 'Standard Blends',
        syllables: ['GOLD'],
        phoneticBreakdown: [
          { chunk: 'G', type: 'consonant', color: 'text-cyan-400 border-cyan-500' },
          { chunk: 'OLD', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 1,
        storySentence: 'Golden State blue jersey',
        storyClue: 'The bright shiny yellow color of Dubs'
      },
      {
        word: 'WREATH',
        pattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        syllables: ['W', 'REATH'],
        phoneticBreakdown: [
          { chunk: 'W', type: 'silent', color: 'text-red-400 border-red-500' },
          { chunk: 'REATH', type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
        ],
        difficulty: 2,
        storySentence: 'Championship victory ring crown',
        storyClue: 'A ring of triumph awarded to winners'
      }
    ]
  }
];

export const PHONICS_CATALOG: PhonicsWord[] = STORY_THEMES.flatMap(theme => theme.words);

export function getPhonicsData(wordStr: string): PhonicsWord {
  const normalized = wordStr.trim().toUpperCase();
  const match = PHONICS_CATALOG.find((p) => p.word === normalized);
  if (match) return match;

  // Fallback dynamic syllabication
  return {
    word: normalized,
    pattern: 'blends',
    categoryLabel: 'Target Phonics',
    syllables: [normalized.slice(0, Math.ceil(normalized.length / 2)), normalized.slice(Math.ceil(normalized.length / 2))],
    phoneticBreakdown: [
      { chunk: normalized.slice(0, 2), type: 'blend', color: 'text-cyan-400 border-cyan-500' },
      { chunk: normalized.slice(2), type: 'vowel', color: 'text-yellow-400 border-yellow-500' }
    ],
    difficulty: 1,
    storySentence: `Read aloud: ${normalized}`,
    storyClue: `Target word for oral reading practice`
  };
}
