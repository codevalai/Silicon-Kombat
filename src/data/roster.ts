export type SpecialEffectType =
  | 'armored_dash'      // Elon: Cybertruck Ram
  | 'dual_trap'         // Page & Brin: Backlink Tether
  | 'fast_beam'         // Sam Altman: Worldcoin Iris Beam
  | 'counter_shield'    // Dario & Daniela: Refusal Shield
  | 'multi_wafer'       // Jensen: H200 Tensor Toss
  | 'command_grab'      // Mark: Octagon Takedown
  | 'air_dive'          // Bezos: Same-Day Drone Strike
  | 'stun_wave'         // Bill Gates: Ctrl+Alt+Delete
  | 'meter_drain'       // Larry Ellison: License Audit Slash
  | 'unblockable_cut'   // Morris Chang: 2-Nanometer Slice
  | 'shadow_clone'      // Satya: Copilot Assist
  | 'rapid_barrage'     // Sundar: Keynote AI Barrage
  | 'limb_contort'      // Demis: Protein Fold Twist
  | 'heavy_suplex'      // Marc Benioff: Dreamforce Astro-Slam
  | 'knockback_push'    // Linus: Git Blame / Force Push
  | 'hazard_spawn'      // Shantanu: Generative Fill
  | 'speed_stack'       // Alexandr Wang: Human Feedback Loop
  | 'momentum_buff'     // Garry Tan: YC Seed Check
  | 'stealth_vanish'    // Evan Spiegel: Ephemeral Vanish
  | 'bass_sweep';       // Daniel Ek: Lossless Bass Drop

export type UltimateEffectType =
  | 'orbital_strike'    // Standard massive orbital/cluster strike
  | 'bsod_freeze'       // Bill Gates: Freezes opponent for 4s + massive damage
  | 'silicon_embargo'   // Morris Chang: Disables enemy specials for 6s + high damage
  | 'move_37_teleport'  // Demis Hassabis: Teleports behind opponent for guaranteed critical
  | 'pivot_health_swap' // Garry Tan: Reverses/equalizes health advantage + burst
  | 'royalty_leech'     // Daniel Ek: Drains opponent HP into own HP bar
  | 'sudo_rm_rf';       // Linus Torvalds: Deletes opponent guard & massive true damage

export type GearStyle =
  | 'thrusters'
  | 'dualHalo'
  | 'worldOrb'
  | 'shieldRing'
  | 'leatherWafer'
  | 'mmaGloves'
  | 'primeDrones'
  | 'bsodMonolith'
  | 'samuraiKatana'
  | 'euvCrown'
  | 'cloudHalo'
  | 'geminiPrism'
  | 'alphaHelix'
  | 'titanShoulders'
  | 'kernelCore'
  | 'vectorBlades'
  | 'tensorDrones'
  | 'ycMonolith'
  | 'arVisor'
  | 'subBass';

export type HairStyle =
  | 'elon_swept'
  | 'wavy_part'
  | 'curly_bushy'
  | 'jensen_silver'
  | 'zuck_curly'
  | 'bald'
  | 'gates_part'
  | 'ellison_mane'
  | 'morris_white'
  | 'satya_trim'
  | 'pichai_part'
  | 'demis_receding'
  | 'benioff_mane'
  | 'wang_fluffy'
  | 'tan_fade';

export type EyewearStyle =
  | 'none'
  | 'google_glass'
  | 'jensen_rim'
  | 'aviators'
  | 'wire_rect'
  | 'round_rect'
  | 'thick_black'
  | 'ar_spectacles';

export type FacialHairStyle =
  | 'clean'
  | 'stubble'
  | 'full_beard'
  | 'goatee'
  | 'nordic_chin';

export type OutfitStyle =
  | 'flight_jacket'
  | 'zip_hoodie'
  | 'crewneck_sweater'
  | 'blazer_sweater'
  | 'biker_leather'
  | 'mma_rashguard'
  | 'flight_vest'
  | 'vneck_sweater'
  | 'samurai_suit'
  | 'formal_suit'
  | 'exec_bomber'
  | 'two_tone_jacket'
  | 'nehru_coat'
  | 'aloha_blazer'
  | 'flannel_shirt'
  | 'crimson_suit'
  | 'tech_trench'
  | 'yc_puffer'
  | 'snap_suit'
  | 'spotify_blazer';

export interface FighterLikeness {
  hairStyle: HairStyle;
  hairColor: number;
  eyewear: EyewearStyle;
  facialHair: FacialHairStyle;
  outfitStyle: OutfitStyle;
  shirtColor: number;
  pantsColor: number;
  shoeColor: number;
  chestLabel: string;
  hasGoldChain?: boolean;
  bodyWidthScale: number;
  heightScale: number;
  ageLines?: boolean;
}

export interface FighterConfig {
  id: number;
  name: string;
  company: string;
  title: string;
  faction: string;
  archetype: string;
  specialName: string;
  specialInput: string;
  specialDesc: string;
  specialEffect: SpecialEffectType;
  ultimateName: string;
  ultimateDesc: string;
  ultimateEffect: UltimateEffectType;
  suitColor: number;
  armorColor: number;
  neonColor: number;
  visorColor: number;
  skinColor: number;
  gear: GearStyle;
  weapon: 'gauntlet' | 'dualblade' | 'orb' | 'shield' | 'disc' | 'mma' | 'katana';
  likeness: FighterLikeness;
  power: number;
  speed: number;
  defense: number;
  quote: string;
  rivalQuote?: string;
  latestModel: string;
  philosophyQuotes: string[];
  voicePitch: number;
  voiceRate: number;
  bio: string;
}

export const ROSTER: FighterConfig[] = [
  {
    id: 0,
    name: 'Elon Musk',
    company: 'SpaceX · Tesla · xAI · Neuralink',
    title: 'Technoking of Mars',
    faction: 'House xAI & Orbital',
    archetype: 'Heavy Brawler / Gadget',
    specialName: 'Cybertruck Ram',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Armored forward thruster dash that powers through light projectiles.',
    specialEffect: 'armored_dash',
    ultimateName: 'Starship Orbital Catch',
    ultimateDesc: 'Mechazilla chop from low Earth orbit that incinerates the arena.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x141821,
    armorColor: 0xcbd5e1,
    neonColor: 0x06b6d4,
    visorColor: 0xf43f5e,
    skinColor: 0xe8be9e,
    gear: 'thrusters',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'elon_swept',
      hairColor: 0x2b1e16,
      eyewear: 'none',
      facialHair: 'stubble',
      outfitStyle: 'flight_jacket',
      shirtColor: 0x090d16,
      pantsColor: 0x0f172a,
      shoeColor: 0x1e293b,
      chestLabel: 'xAI · SPACEX',
      bodyWidthScale: 1.12,
      heightScale: 1.06,
      ageLines: true,
    },
    power: 95,
    speed: 86,
    defense: 92,
    quote: 'First principles physics: Grok 3 on 200,000 GPUs seeks maximum truth.',
    rivalQuote: 'Your bureaucracy cannot survive orbital velocity.',
    latestModel: 'Grok 3 & Colossus 200K GPU Supercluster',
    philosophyQuotes: [
      'Grok 3 was trained on our 200,000 H100 Colossus cluster in Memphis—first principles physics is the only law!',
      'To understand the nature of the universe, AI must be maximally truth-seeking, never politically filtered.',
      'We are making life multi-planetary with Starship while Optimus and Grok solve physical autonomy.'
    ],
    voicePitch: 0.88,
    voiceRate: 1.0,
    bio: 'Founder of SpaceX, xAI, and Neuralink, and CEO/architect of Tesla. Leads multi-industry infrastructure spanning commercial orbital rocketry, electric vehicles, autonomous robotics, and frontier AI clusters.'
  },
  {
    id: 1,
    name: 'Page & Brin',
    company: 'Google / Alphabet',
    title: 'Architects of PageRank',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Dual-Core / Zoner',
    specialName: 'Backlink Tether',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Fires twin search-graph laser nodes that trap and pull the opponent.',
    specialEffect: 'dual_trap',
    ultimateName: '10^100 Googol Singularity',
    ultimateDesc: 'Unleashes the entire global index and DeepMind TPU v6 pods in a converging beam.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x1e293b,
    armorColor: 0x3b82f6,
    neonColor: 0x38bdf8,
    visorColor: 0x22c55e,
    skinColor: 0xe2b99b,
    gear: 'dualHalo',
    weapon: 'orb',
    likeness: {
      hairStyle: 'wavy_part',
      hairColor: 0x475569,
      eyewear: 'google_glass',
      facialHair: 'stubble',
      outfitStyle: 'zip_hoodie',
      shirtColor: 0x2563eb,
      pantsColor: 0x1e293b,
      shoeColor: 0x38bdf8,
      chestLabel: 'ALPHABET',
      bodyWidthScale: 1.02,
      heightScale: 1.02,
      ageLines: true,
    },
    power: 91,
    speed: 92,
    defense: 88,
    quote: 'Organizing the world’s information was step one. Gemini 2.5 is step two.',
    rivalQuote: 'Every link on the internet already points to your defeat.',
    latestModel: 'Gemini 2.5 Pro & Trillium TPU v6e Pods',
    philosophyQuotes: [
      'From PageRank at Stanford to Gemini 2.5 native multimodality—search was always meant to become true intelligence.',
      '10x moonshot thinking beats 10% incrementalism every single time.',
      'Our custom TPU supercomputers and Transformer architecture built the foundation of the entire modern AI era.'
    ],
    voicePitch: 0.96,
    voiceRate: 1.04,
    bio: 'Co-founders who invented the PageRank algorithm at Stanford, building the foundational architecture of the modern web, Android, YouTube, and Google’s AI research divisions (Google Brain/DeepMind).'
  },
  {
    id: 2,
    name: 'Sam Altman',
    company: 'OpenAI',
    title: 'Catalyst of Stargate',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'High-Speed / Beam',
    specialName: 'Worldcoin Iris Beam',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Fires an instant retina-scanning chrome laser across the full arena.',
    specialEffect: 'fast_beam',
    ultimateName: 'o3 Stargate Supercluster',
    ultimateDesc: 'Summons a 5-gigawatt reasoning array that obliterates the stage.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x334155,
    armorColor: 0xe2e8f0,
    neonColor: 0x10b981,
    visorColor: 0x38bdf8,
    skinColor: 0xecc4a6,
    gear: 'worldOrb',
    weapon: 'orb',
    likeness: {
      hairStyle: 'curly_bushy',
      hairColor: 0x3b2d22,
      eyewear: 'none',
      facialHair: 'clean',
      outfitStyle: 'crewneck_sweater',
      shirtColor: 0x475569,
      pantsColor: 0x1e293b,
      shoeColor: 0xf8fafc,
      chestLabel: 'OPENAI',
      bodyWidthScale: 0.98,
      heightScale: 1.0,
      ageLines: false,
    },
    power: 93,
    speed: 94,
    defense: 86,
    quote: 'Test-time compute scaling with o3 and GPT-5 changes the trajectory of humanity.',
    rivalQuote: 'You are optimizing for the old paradigm; we are scaling to AGI.',
    latestModel: 'GPT-5 & o3 Frontier Reasoning Series',
    philosophyQuotes: [
      'With o3 and GPT-5, we proved that scaling test-time reasoning compute unlocks superhuman problem solving.',
      'Intelligence too cheap to meter will be the greatest lever for human abundance in history.',
      'Iterative deployment lets society co-evolve with AGI as we build out the Stargate gigawatt infrastructure.'
    ],
    voicePitch: 1.04,
    voiceRate: 1.06,
    bio: 'Co-founder and CEO of OpenAI who transitioned the lab into the catalyst of the global generative AI boom with ChatGPT and the GPT and o-series reasoning models.'
  },
  {
    id: 3,
    name: 'Dario & Daniela',
    company: 'Anthropic / Claude',
    title: 'Guardians of Constitutional AI',
    faction: 'Constitutional Order of Anthropic',
    archetype: 'Counter / Defensive Tactician',
    specialName: 'Constitutional Refusal Shield',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Projects an alignment barrier that absorbs any incoming strike and reflects 125% damage.',
    specialEffect: 'counter_shield',
    ultimateName: 'Claude 3.7 Extended Thinking',
    ultimateDesc: 'Maps every neural feature of the opponent’s mind before delivering a precision strike.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x292524,
    armorColor: 0xd97757,
    neonColor: 0xf59e0b,
    visorColor: 0xfde68a,
    skinColor: 0xe6bea0,
    gear: 'shieldRing',
    weapon: 'shield',
    likeness: {
      hairStyle: 'curly_bushy',
      hairColor: 0x221a15,
      eyewear: 'none',
      facialHair: 'stubble',
      outfitStyle: 'blazer_sweater',
      shirtColor: 0xd97757,
      pantsColor: 0x1c1917,
      shoeColor: 0x292524,
      chestLabel: 'CLAUDE',
      bodyWidthScale: 1.03,
      heightScale: 1.01,
      ageLines: true,
    },
    power: 90,
    speed: 91,
    defense: 96,
    quote: 'Claude 3.7 Sonnet combines hybrid reasoning with mechanistic interpretability.',
    rivalQuote: 'Unaligned brute force always collapses against Constitutional precision.',
    latestModel: 'Claude 3.7 Sonnet & Hybrid Extended Thinking',
    philosophyQuotes: [
      'Claude 3.7 Sonnet unifies instant response with visible extended thinking—frontier capability and safety scale together.',
      'Mechanistic interpretability lets us look inside the neural network instead of treating AI as an opaque black box.',
      'A race to the top on Constitutional AI ensures powerful "country of geniuses in a datacenter" remain aligned.'
    ],
    voicePitch: 0.98,
    voiceRate: 1.02,
    bio: 'Brother-and-sister co-founders (Dario as CEO, Daniela as President) who left OpenAI in 2021 to build Anthropic, creator of the Claude family of models and constitutional AI safety frameworks.'
  },
  {
    id: 4,
    name: 'Jensen Huang',
    company: 'NVIDIA',
    title: 'Godfather of Accelerated Computing',
    faction: 'The CUDA Syndicate',
    archetype: 'All-Rounder / Projectile Master',
    specialName: 'Blackwell Wafer Toss',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Hurls spinning 300mm Blackwell B300 silicon wafers that slice through the arena.',
    specialEffect: 'multi_wafer',
    ultimateName: 'NVLink72 Rubin Superpod',
    ultimateDesc: 'Overclocks the entire global GPU supply into a blinding green tensor beam.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x090a0f,
    armorColor: 0x1e293b,
    neonColor: 0x76b900,
    visorColor: 0xa3e635,
    skinColor: 0xdfb490,
    gear: 'leatherWafer',
    weapon: 'disc',
    likeness: {
      hairStyle: 'jensen_silver',
      hairColor: 0xd1d5db,
      eyewear: 'jensen_rim',
      facialHair: 'clean',
      outfitStyle: 'biker_leather',
      shirtColor: 0x090a0f,
      pantsColor: 0x090a0f,
      shoeColor: 0x18181b,
      chestLabel: 'NVIDIA',
      bodyWidthScale: 1.04,
      heightScale: 1.0,
      ageLines: true,
    },
    power: 96,
    speed: 91,
    defense: 93,
    quote: 'The more you buy, the more you save! Blackwell and Rubin power the AI factories.',
    rivalQuote: 'Even your models run on my CUDA cores.',
    latestModel: 'Blackwell Ultra B300 & Vera Rubin NVLink72',
    philosophyQuotes: [
      'Blackwell Ultra and Vera Rubin turn data centers into AI factories generating tokens at extreme scale!',
      'General-purpose computing is over—accelerated computing and physical AI are the new industrial revolution.',
      'The more GPUs you buy, the more you save! Every token of human knowledge flows through CUDA.'
    ],
    voicePitch: 0.92,
    voiceRate: 1.03,
    bio: 'Co-founder and CEO who founded NVIDIA in 1993 and pioneered the GPU. His early bet on parallel computing (CUDA) turned NVIDIA into the foundational hardware backbone of the global AI industry.'
  },
  {
    id: 5,
    name: 'Mark Zuckerberg',
    company: 'Meta',
    title: 'Open-Weights Cage Fighter',
    faction: 'Open-Weights BJJ',
    archetype: 'Grappler / Rushdown',
    specialName: 'Octagon BJJ Takedown',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Lunging Brazilian Jiu-Jitsu takedown that bypasses standard standing guard.',
    specialEffect: 'command_grab',
    ultimateName: 'Llama 4 Open-Weights Stampede',
    ultimateDesc: 'Unleashes a trillion-parameter open-source swarm + Orion AR neural overload.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x172554,
    armorColor: 0x3b82f6,
    neonColor: 0x60a5fa,
    visorColor: 0x38bdf8,
    skinColor: 0xf1cab0,
    gear: 'mmaGloves',
    weapon: 'mma',
    likeness: {
      hairStyle: 'zuck_curly',
      hairColor: 0x6b3e26,
      eyewear: 'none',
      facialHair: 'clean',
      outfitStyle: 'mma_rashguard',
      shirtColor: 0x1e3a8a,
      pantsColor: 0x0f172a,
      shoeColor: 0x2563eb,
      chestLabel: 'LLAMA · META',
      hasGoldChain: true,
      bodyWidthScale: 1.04,
      heightScale: 0.99,
      ageLines: false,
    },
    power: 91,
    speed: 95,
    defense: 89,
    quote: 'Llama 4 open-weights and Orion AR glasses ensure no closed lab owns the future.',
    rivalQuote: 'Step into the Octagon—your closed weights won’t save your guard.',
    latestModel: 'Llama 4 Maverick & Orion Full-Holographic AR',
    philosophyQuotes: [
      'With Llama 4 open-weights, we are making frontier AI the open global standard for every developer on Earth.',
      'Closed labs want a tollbooth on intelligence; open source moves faster, is safer, and empowers everyone.',
      'Pair Llama 4 with Orion holographic AR glasses and you have superintelligence right in your field of view.'
    ],
    voicePitch: 1.0,
    voiceRate: 1.05,
    bio: 'Founder and CEO who scaled Facebook into Meta (Instagram, WhatsApp) while spearheading open-weights frontier AI through the Llama model series and Brazilian Jiu-Jitsu competition.'
  },
  {
    id: 6,
    name: 'Jeff Bezos',
    company: 'Amazon · Blue Origin',
    title: 'Centurion of Day One',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Powerhouse / Aerial Dive',
    specialName: 'Prime Air Drone Strike',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Deploys twin autonomous logistics drones that dive-bomb the opponent.',
    specialEffect: 'air_dive',
    ultimateName: 'New Glenn Orbital Drop & AWS Outage',
    ultimateDesc: 'Drops a reusable heavy booster while throttling enemy cloud bandwidth.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x0f172a,
    armorColor: 0xf59e0b,
    neonColor: 0xff9900,
    visorColor: 0x38bdf8,
    skinColor: 0xe2b594,
    gear: 'primeDrones',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'bald',
      hairColor: 0xe2b594,
      eyewear: 'aviators',
      facialHair: 'clean',
      outfitStyle: 'flight_vest',
      shirtColor: 0x1d4ed8,
      pantsColor: 0x0f172a,
      shoeColor: 0x1e293b,
      chestLabel: 'AWS · BLUE',
      bodyWidthScale: 1.14,
      heightScale: 1.01,
      ageLines: true,
    },
    power: 94,
    speed: 87,
    defense: 93,
    quote: 'Your margin is my opportunity. It is always Day One at AWS and Blue Origin.',
    rivalQuote: 'Same-day delivery on your knockout.',
    latestModel: 'AWS Trainium2 UltraClusters & Amazon Nova Pro',
    philosophyQuotes: [
      'Day 2 is stasis, followed by irrelevance, followed by excruciating decline—that is why it is always Day 1!',
      'With AWS Trainium2 and Amazon Nova, we lower the cost of inference so every enterprise runs on our cloud.',
      'We are building the road to space with New Glenn so future generations can unleash heavy industry off-Earth.'
    ],
    voicePitch: 0.85,
    voiceRate: 0.98,
    bio: 'Founder of Amazon and aerospace company Blue Origin. Beyond revolutionizing global e-commerce and logistics, he oversaw the creation of Amazon Web Services (AWS).'
  },
  {
    id: 7,
    name: 'Bill Gates',
    company: 'Microsoft',
    title: 'Patriarch of the Desktop',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Trap / System Control',
    specialName: 'Ctrl + Alt + Delete',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Sends an interrupt wave that briefly stuns the opponent’s nervous system.',
    specialEffect: 'stun_wave',
    ultimateName: '0x000000BSOD Kernel Panic',
    ultimateDesc: 'Freezes the opponent solid for 4 full seconds behind a Blue Screen of Death.',
    ultimateEffect: 'bsod_freeze',
    suitColor: 0x6d28d9,
    armorColor: 0x94a3b8,
    neonColor: 0x38bdf8,
    visorColor: 0x60a5fa,
    skinColor: 0xecc4a8,
    gear: 'bsodMonolith',
    weapon: 'orb',
    likeness: {
      hairStyle: 'gates_part',
      hairColor: 0xcbd5e1,
      eyewear: 'wire_rect',
      facialHair: 'clean',
      outfitStyle: 'vneck_sweater',
      shirtColor: 0xf8fafc,
      pantsColor: 0x334155,
      shoeColor: 0x1e293b,
      chestLabel: 'MS-DOS · WIN',
      bodyWidthScale: 1.0,
      heightScale: 1.01,
      ageLines: true,
    },
    power: 88,
    speed: 85,
    defense: 94,
    quote: 'People overestimate what happens in one year and underestimate ten years.',
    rivalQuote: 'Your operating system has performed an illegal operation and will be shut down.',
    latestModel: 'Autonomous Personal AI Agents & TerraPower Natrium',
    philosophyQuotes: [
      'Since the graphical user interface at Xerox PARC, true AI agents are the biggest revolution in software I have ever seen.',
      'Software + nuclear energy + AI diagnostics will eradicate disease and transform global education.',
      'A platform is when the economic value of everybody that uses it exceeds the value of the company that created it.'
    ],
    voicePitch: 1.02,
    voiceRate: 0.97,
    bio: 'Co-founder of Microsoft who spearheaded the personal computing revolution with MS-DOS and Windows, establishing the enterprise software standard.'
  },
  {
    id: 8,
    name: 'Larry Ellison',
    company: 'Oracle',
    title: 'Shogun of Sovereign Cloud',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Swordmaster / Meter Drain',
    specialName: 'License Audit Katana Slash',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'High-frequency katana strike that drains 30% of the enemy’s Ultimate meter.',
    specialEffect: 'meter_drain',
    ultimateName: 'Exadata Sovereign Gigacluster',
    ultimateDesc: 'Locks the opponent’s database tables and cleaves the arena in crimson light.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x09090b,
    armorColor: 0xdc2626,
    neonColor: 0xef4444,
    visorColor: 0xf87171,
    skinColor: 0xdca884,
    gear: 'samuraiKatana',
    weapon: 'katana',
    likeness: {
      hairStyle: 'ellison_mane',
      hairColor: 0x4b3621,
      eyewear: 'none',
      facialHair: 'goatee',
      outfitStyle: 'samurai_suit',
      shirtColor: 0x18181b,
      pantsColor: 0x09090b,
      shoeColor: 0x7f1d1d,
      chestLabel: 'ORACLE',
      bodyWidthScale: 1.06,
      heightScale: 1.04,
      ageLines: true,
    },
    power: 93,
    speed: 89,
    defense: 91,
    quote: 'It is not enough that we succeed—all other clouds must fail.',
    rivalQuote: 'Our audit shows your health bar is out of compliance.',
    latestModel: 'OCI Zettascale 131K GPU Supercluster & Oracle 23ai',
    philosophyQuotes: [
      'Our OCI Zettascale supercluster links 131,072 Blackwell GPUs powered by modular nuclear reactors!',
      'Every mission-critical database on Earth lives in Oracle 23ai—now vector-indexed for sovereign AI.',
      'Like the samurai code on Lanai: precision engineering, relentless competition, total victory.'
    ],
    voicePitch: 0.86,
    voiceRate: 0.99,
    bio: 'Co-founder, Executive Chairman, and CTO of Oracle who built the world’s dominant relational database company and scaled it into a massive AI data-center infrastructure provider.'
  },
  {
    id: 9,
    name: 'Morris Chang',
    company: 'TSMC',
    title: 'Grandmaster of the Foundry',
    faction: 'Silicon Foundry Apex',
    archetype: 'Supreme Boss / Embargo Tactician',
    specialName: '2-Nanometer EUV Slice',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Unblockable extreme-ultraviolet lithography beam that pierces any armor.',
    specialEffect: 'unblockable_cut',
    ultimateName: 'Global Silicon Embargo',
    ultimateDesc: 'Cuts off the opponent’s wafer allocation, disabling their Special moves for 6 seconds!',
    ultimateEffect: 'silicon_embargo',
    suitColor: 0x0f172a,
    armorColor: 0xfacc15,
    neonColor: 0xf59e0b,
    visorColor: 0x38bdf8,
    skinColor: 0xe2bc9a,
    gear: 'euvCrown',
    weapon: 'disc',
    likeness: {
      hairStyle: 'morris_white',
      hairColor: 0xf1f5f9,
      eyewear: 'wire_rect',
      facialHair: 'clean',
      outfitStyle: 'formal_suit',
      shirtColor: 0xf8fafc,
      pantsColor: 0x0f172a,
      shoeColor: 0x09090b,
      chestLabel: 'TSMC · 2NM',
      bodyWidthScale: 1.02,
      heightScale: 0.98,
      ageLines: true,
    },
    power: 97,
    speed: 88,
    defense: 96,
    quote: 'Without my pure-play foundry, your trillion-dollar algorithms are merely drawings on paper.',
    rivalQuote: 'Your 2nm wafer allocation has been revoked.',
    latestModel: 'TSMC N2 2nm Gate-All-Around & A16 Angstrom Node',
    philosophyQuotes: [
      'TSMC never competes with our customers—that trust made our pure-play foundry the bedrock of all silicon.',
      'With N2 Nanosheet and A16 backside power delivery, we etch billions of transistors at the atomic limit.',
      'Every AI chip from Santa Clara to Cupertino is born inside our EUV cleanrooms.'
    ],
    voicePitch: 0.84,
    voiceRate: 0.92,
    bio: 'Founder of Taiwan Semiconductor Manufacturing Company (TSMC). By inventing the pure-play semiconductor foundry model, he built the manufacturing engine that fabricates the world’s advanced silicon.'
  },
  {
    id: 10,
    name: 'Satya Nadella',
    company: 'Microsoft',
    title: 'Emperor of Hyperscale',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Balanced / Assist Striker',
    specialName: 'Copilot Quantum Assist',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Summons a holographic Copilot projection that strikes in tandem.',
    specialEffect: 'shadow_clone',
    ultimateName: 'Azure Majorana-1 Convergence',
    ultimateDesc: 'Channels topological quantum qubits across 60 global cloud regions.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x1e293b,
    armorColor: 0x0ea5e9,
    neonColor: 0x38bdf8,
    visorColor: 0xa855f7,
    skinColor: 0xc58c65,
    gear: 'cloudHalo',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'satya_trim',
      hairColor: 0x1e293b,
      eyewear: 'round_rect',
      facialHair: 'clean',
      outfitStyle: 'exec_bomber',
      shirtColor: 0x0f172a,
      pantsColor: 0x1e293b,
      shoeColor: 0xf8fafc,
      chestLabel: 'AZURE · MSFT',
      bodyWidthScale: 0.99,
      heightScale: 1.0,
      ageLines: true,
    },
    power: 91,
    speed: 90,
    defense: 92,
    quote: 'Hit Refresh: transitions from know-it-alls to learn-it-alls win the AI platform shift.',
    rivalQuote: 'We have already integrated your entire stack into Azure Copilot.',
    latestModel: 'Azure Maia 200, Majorana-1 Quantum & Copilot Wave 3',
    philosophyQuotes: [
      'Our Majorana-1 topological quantum chip and Azure AI supercomputers are built for the next 50 years of compute.',
      'Culture eats strategy—moving from a know-it-all to a learn-it-all mindset unlocked Microsoft’s AI renaissance.',
      'Multi-agent Copilot orchestration is the new UI layer for every enterprise workflow on the planet.'
    ],
    voicePitch: 0.95,
    voiceRate: 1.01,
    bio: 'Chairman and CEO who transformed Microsoft into a cloud and AI superpower through strategic bets on Azure, OpenAI partnership, and enterprise Copilot integration.'
  },
  {
    id: 11,
    name: 'Sundar Pichai',
    company: 'Google / Alphabet',
    title: 'Commander of Gemini',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Multi-Hit / Zoner',
    specialName: 'Keynote Gemini Barrage',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Fires a rapid-fire multimodal prism beam across text, code, and vision.',
    specialEffect: 'rapid_barrage',
    ultimateName: 'Willow Quantum Supremacy',
    ultimateDesc: 'Taps Google’s Willow quantum processor to collapse parallel timelines onto the foe.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x1e293b,
    armorColor: 0x3b82f6,
    neonColor: 0x60a5fa,
    visorColor: 0xfacc15,
    skinColor: 0xba825c,
    gear: 'geminiPrism',
    weapon: 'orb',
    likeness: {
      hairStyle: 'pichai_part',
      hairColor: 0x1e293b,
      eyewear: 'thick_black',
      facialHair: 'stubble',
      outfitStyle: 'two_tone_jacket',
      shirtColor: 0x0f172a,
      pantsColor: 0x1e293b,
      shoeColor: 0xf8fafc,
      chestLabel: 'GEMINI',
      bodyWidthScale: 0.98,
      heightScale: 1.01,
      ageLines: true,
    },
    power: 90,
    speed: 92,
    defense: 90,
    quote: 'AI is more profound than fire or electricity—and Gemini 2.5 is built natively from the ground up.',
    rivalQuote: 'With a 2-million token context window, we already read your entire move history.',
    latestModel: 'Gemini 2.5 Pro Deep Think & Willow Quantum Chip',
    philosophyQuotes: [
      'Gemini 2.5 Pro leads the frontier because we engineered full-stack AI from custom TPUs up to 2-million-token context.',
      'Project Astra and Mariner bring universal AI agents into real-time vision, voice, and browser action.',
      'Our Willow quantum chip solved in 5 minutes a benchmark that would take a supercomputer 10 septillion years.'
    ],
    voicePitch: 0.96,
    voiceRate: 1.0,
    bio: 'CEO of Google and Alphabet who guided Android, Chrome, and Google’s all-in transition into an AI-first enterprise powering Gemini across billions of users.'
  },
  {
    id: 12,
    name: 'Demis Hassabis',
    company: 'Google DeepMind',
    title: 'Nobel Architect of AlphaFold',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Tactical / Teleport Grandmaster',
    specialName: 'AlphaFold Protein Contort',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Wraps the opponent in a 3D amino-acid helix that twists their guard open.',
    specialEffect: 'limb_contort',
    ultimateName: 'Move 37 Dimensional Teleport',
    ultimateDesc: 'Calculates a 1-in-10,000 Go move, teleporting directly behind the foe for a critical strike.',
    ultimateEffect: 'move_37_teleport',
    suitColor: 0x0f172a,
    armorColor: 0x06b6d4,
    neonColor: 0x22d3ee,
    visorColor: 0x818cf8,
    skinColor: 0xe5bc9c,
    gear: 'alphaHelix',
    weapon: 'orb',
    likeness: {
      hairStyle: 'demis_receding',
      hairColor: 0x1e293b,
      eyewear: 'wire_rect',
      facialHair: 'stubble',
      outfitStyle: 'nehru_coat',
      shirtColor: 0x0f172a,
      pantsColor: 0x09090b,
      shoeColor: 0x1e293b,
      chestLabel: 'DEEPMIND',
      bodyWidthScale: 1.02,
      heightScale: 0.99,
      ageLines: true,
    },
    power: 92,
    speed: 94,
    defense: 91,
    quote: 'Solve intelligence first, then use it to solve everything else—from AlphaFold 3 to fusion.',
    rivalQuote: 'Move 37: you didn’t see that coming for 100 turns.',
    latestModel: 'AlphaFold 3, Genie 2 World Model & Gemini Robotics',
    philosophyQuotes: [
      'First solve intelligence, then use it to solve everything else—AlphaFold 3 mapped the molecular machinery of life.',
      'Move 37 in AlphaGo proved that deep reinforcement learning discovers creative truths beyond centuries of human intuition.',
      'With Genie 2 world models and Isoomorphic Labs, we are simulating physics and curing diseases at digital speed.'
    ],
    voicePitch: 0.97,
    voiceRate: 1.03,
    bio: 'Co-founder and CEO of Google DeepMind and Nobel Laureate whose teams built AlphaGo, AlphaFold (solving protein folding), and the Gemini foundational models.'
  },
  {
    id: 13,
    name: 'Marc Benioff',
    company: 'Salesforce',
    title: 'Titan of Ohana & Agentforce',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Heavy Grappler / Tank',
    specialName: 'Dreamforce Astro-Slam',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Massive forward shoulder charge that crushes enemy armor.',
    specialEffect: 'heavy_suplex',
    ultimateName: 'Agentforce Autonomous Swarm',
    ultimateDesc: 'Summons a billion autonomous enterprise CRM agents to overwhelm the stage.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x0c4a6e,
    armorColor: 0x0284c7,
    neonColor: 0x38bdf8,
    visorColor: 0xfacc15,
    skinColor: 0xe6bc9a,
    gear: 'titanShoulders',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'benioff_mane',
      hairColor: 0x3b2d22,
      eyewear: 'none',
      facialHair: 'full_beard',
      outfitStyle: 'aloha_blazer',
      shirtColor: 0x0284c7,
      pantsColor: 0x0f172a,
      shoeColor: 0x1e293b,
      chestLabel: 'AGENTFORCE',
      bodyWidthScale: 1.18,
      heightScale: 1.07,
      ageLines: true,
    },
    power: 95,
    speed: 83,
    defense: 95,
    quote: 'Welcome to the third wave of AI: autonomous Agentforce working alongside humans!',
    rivalQuote: 'No Software—and no mercy in the Dreamforce arena!',
    latestModel: 'Agentforce 2.0 & Atlas Reasoning Engine',
    philosophyQuotes: [
      'Forget DIY science projects and empty chatbots—Agentforce 2.0 delivers autonomous digital labor out of the box!',
      'Powered by our Atlas Reasoning Engine and Data Cloud, enterprises are deploying billions of autonomous agents.',
      'The business of business is improving the state of the world—with Ohana and autonomous AI!'
    ],
    voicePitch: 0.82,
    voiceRate: 0.98,
    bio: 'Pioneer of enterprise cloud computing who founded Salesforce in 1999, establishing the SaaS business model and spearheading autonomous enterprise Agentforce.'
  },
  {
    id: 14,
    name: 'Linus Torvalds',
    company: 'Linux / Git',
    title: 'Benevolent Dictator of the Kernel',
    faction: 'The Sovereign Kernel',
    archetype: 'Counter / True-Damage Striker',
    specialName: 'Git Force Push (--force)',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Blasts the opponent backward across the stage, overwriting their position.',
    specialEffect: 'knockback_push',
    ultimateName: 'sudo rm -rf / --no-preserve-root',
    ultimateDesc: 'Deletes the opponent’s block shield entirely and inflicts massive true kernel damage.',
    ultimateEffect: 'sudo_rm_rf',
    suitColor: 0x991b1b,
    armorColor: 0xfacc15,
    neonColor: 0xeab308,
    visorColor: 0xef4444,
    skinColor: 0xf0c8ad,
    gear: 'kernelCore',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'gates_part',
      hairColor: 0x8b6b4a,
      eyewear: 'round_rect',
      facialHair: 'clean',
      outfitStyle: 'flannel_shirt',
      shirtColor: 0x18181b,
      pantsColor: 0x1e293b,
      shoeColor: 0x334155,
      chestLabel: 'LINUX · GIT',
      bodyWidthScale: 1.03,
      heightScale: 1.0,
      ageLines: true,
    },
    power: 94,
    speed: 89,
    defense: 92,
    quote: 'Talk is cheap. Show me the code.',
    rivalQuote: 'Your patch has been rejected. Never break userspace!',
    latestModel: 'Linux Kernel 6.14 & Git Distributed Object Graph',
    philosophyQuotes: [
      'Talk is cheap. Show me the code! Every AI supercluster on Earth boots on the Linux kernel.',
      'Rule number one of kernel engineering: WE NEVER BREAK USERSPACE.',
      'Good programmers worry about code; great programmers worry about data structures and their relationships.'
    ],
    voicePitch: 0.91,
    voiceRate: 1.02,
    bio: 'Creator of the Linux kernel and Git version control system. His code forms the bedrock of the modern internet, cloud servers, Android, and AI supercomputers.'
  },
  {
    id: 15,
    name: 'Shantanu Narayen',
    company: 'Adobe',
    title: 'Architect of Creative Cloud & Firefly',
    faction: 'Hyperscale Cloud Alliance',
    archetype: 'Illusion / Spatial Control',
    specialName: 'Generative Fill Strike',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Synthesizes a solid photonic barrier directly in the opponent’s path.',
    specialEffect: 'hazard_spawn',
    ultimateName: 'Firefly Vector Supernova',
    ultimateDesc: 'Renders a high-dynamic-range creative explosion across every layer.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x18181b,
    armorColor: 0xef4444,
    neonColor: 0xf43f5e,
    visorColor: 0xf97316,
    skinColor: 0xc28a62,
    gear: 'vectorBlades',
    weapon: 'dualblade',
    likeness: {
      hairStyle: 'pichai_part',
      hairColor: 0xd1d5db,
      eyewear: 'round_rect',
      facialHair: 'clean',
      outfitStyle: 'crimson_suit',
      shirtColor: 0xef4444,
      pantsColor: 0x18181b,
      shoeColor: 0x09090b,
      chestLabel: 'ADOBE',
      bodyWidthScale: 1.01,
      heightScale: 1.0,
      ageLines: true,
    },
    power: 88,
    speed: 90,
    defense: 89,
    quote: 'Firefly Video and Creative Cloud empower human imagination with commercially safe AI.',
    rivalQuote: 'We just removed you from the frame with Content-Aware Fill.',
    latestModel: 'Adobe Firefly Video Model & GenStudio',
    philosophyQuotes: [
      'Our Firefly Video Model is trained to be 100% commercially safe, respecting creators while supercharging production.',
      'Pivoting Adobe to Creative Cloud proved that fearless business model reinvention creates enduring dominance.',
      'AI is not here to replace human imagination—it is the ultimate brush for digital storytellers.'
    ],
    voicePitch: 0.93,
    voiceRate: 1.0,
    bio: 'Chairman and CEO who steered Adobe’s historic transition to Creative Cloud while embedding generative AI (Adobe Firefly) natively into creative workflows.'
  },
  {
    id: 16,
    name: 'Alexandr Wang',
    company: 'Scale AI',
    title: 'Armorer of Frontier Data',
    faction: 'The CUDA Syndicate',
    archetype: 'Speed / Adaptive Stacker',
    specialName: 'RLHF Feedback Overclock',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Iteratively refines attack weights, boosting damage and speed by 25% for 4 seconds.',
    specialEffect: 'speed_stack',
    ultimateName: 'Data Foundry Omniscience',
    ultimateDesc: 'Unleashes billions of curated reasoning traces in a precision orbital barrage.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x0f172a,
    armorColor: 0xa855f7,
    neonColor: 0xc084fc,
    visorColor: 0x38bdf8,
    skinColor: 0xeac3a2,
    gear: 'tensorDrones',
    weapon: 'dualblade',
    likeness: {
      hairStyle: 'wang_fluffy',
      hairColor: 0x09090b,
      eyewear: 'none',
      facialHair: 'clean',
      outfitStyle: 'tech_trench',
      shirtColor: 0x1e1b4b,
      pantsColor: 0x09090b,
      shoeColor: 0xf8fafc,
      chestLabel: 'SCALE AI',
      bodyWidthScale: 0.96,
      heightScale: 0.99,
      ageLines: false,
    },
    power: 87,
    speed: 96,
    defense: 85,
    quote: 'Compute is the engine, but high-purity frontier RLHF data is the nuclear fuel.',
    rivalQuote: 'Every frontier model in this arena was trained on Scale data.',
    latestModel: 'Scale GenAI Platform & Donovan Defense Agents',
    philosophyQuotes: [
      'We passed the pre-training data wall—now post-training RLHF and expert reasoning traces define the frontier!',
      'Just as picks and shovels powered the gold rush, Scale AI’s data foundry powers every leading LLM.',
      'Data-centric AI and sovereign evaluation benchmarks separate real intelligence from hallucination.'
    ],
    voicePitch: 1.03,
    voiceRate: 1.06,
    bio: 'Founder and CEO of Scale AI, providing the essential data curation, reinforcement learning (RLHF), and evaluation pipelines required to train frontier LLMs.'
  },
  {
    id: 17,
    name: 'Garry Tan',
    company: 'Y Combinator',
    title: 'Kingmaker of Demo Day',
    faction: 'The Sovereign Kernel',
    archetype: 'Momentum / Comeback Brawler',
    specialName: 'YC Seed Check Surge',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Injects $500k of pure founder velocity, surging forward with +25% attack power.',
    specialEffect: 'momentum_buff',
    ultimateName: 'Demo Day Hard Pivot',
    ultimateDesc: 'If behind in health, equalizes equity and drains the opponent’s lead into his own bar!',
    ultimateEffect: 'pivot_health_swap',
    suitColor: 0xea580c,
    armorColor: 0xf97316,
    neonColor: 0xfb923c,
    visorColor: 0xfacc15,
    skinColor: 0xe4bb98,
    gear: 'ycMonolith',
    weapon: 'gauntlet',
    likeness: {
      hairStyle: 'tan_fade',
      hairColor: 0x18181b,
      eyewear: 'none',
      facialHair: 'clean',
      outfitStyle: 'yc_puffer',
      shirtColor: 0x18181b,
      pantsColor: 0x0f172a,
      shoeColor: 0xf97316,
      chestLabel: 'Y COMBINATOR',
      bodyWidthScale: 1.01,
      heightScale: 0.99,
      ageLines: false,
    },
    power: 89,
    speed: 93,
    defense: 87,
    quote: 'Make something people want—and build with 10x AI engineering leverage!',
    rivalQuote: 'A 3-person YC team just disrupted your entire division over the weekend.',
    latestModel: 'YC AI Agent Batch & Vibe-Coding Leverage Stack',
    philosophyQuotes: [
      'With modern AI coding agents, a 4-person YC team can now build what used to take 100 engineers!',
      'Make something people want, talk to users, and never let incumbent moats intimidate founder velocity.',
      'Vertical AI agents are replacing entire legacy enterprise workflows—boom, Demo Day breakout!'
    ],
    voicePitch: 0.99,
    voiceRate: 1.05,
    bio: 'President and CEO of Y Combinator, the startup accelerator behind Airbnb, Stripe, Coinbase, DoorDash, and Reddit, and early backer of the new AI startup wave.'
  },
  {
    id: 18,
    name: 'Evan Spiegel',
    company: 'Snap Inc.',
    title: 'Phantom of Spatial AR',
    faction: 'Open-Weights BJJ',
    archetype: 'Stealth / Hit-and-Run',
    specialName: 'Ephemeral Ghost Vanish',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Cloaks in AR light and teleports directly behind the opponent for a backstab.',
    specialEffect: 'stealth_vanish',
    ultimateName: 'Spectacles 5 Spatial Overload',
    ultimateDesc: 'Projects an augmented reality prism storm that blinds and shatters enemy defenses.',
    ultimateEffect: 'orbital_strike',
    suitColor: 0x18181b,
    armorColor: 0xfef08a,
    neonColor: 0xfacc15,
    visorColor: 0x00f3ff,
    skinColor: 0xedc4a6,
    gear: 'arVisor',
    weapon: 'dualblade',
    likeness: {
      hairStyle: 'elon_swept',
      hairColor: 0x261c14,
      eyewear: 'ar_spectacles',
      facialHair: 'clean',
      outfitStyle: 'snap_suit',
      shirtColor: 0xfef08a,
      pantsColor: 0x09090b,
      shoeColor: 0xfacc15,
      chestLabel: 'SNAP · AR',
      bodyWidthScale: 0.96,
      heightScale: 1.05,
      ageLines: false,
    },
    power: 86,
    speed: 98,
    defense: 83,
    quote: 'This knockout will disappear in 24 hours—Spatial AR is how humans meant to compute.',
    rivalQuote: 'You are still staring at a flat smartphone rectangle.',
    latestModel: 'Snap OS & 5th-Gen See-Through AR Spectacles',
    philosophyQuotes: [
      'Our 5th-generation Spectacles with Snap OS bring shared multimodal AI lenses directly into the physical world.',
      'Computing belongs overlaid on human connection and reality, not trapping people behind glass screens.',
      'Opening directement to the camera changed human communication forever—AR glasses are the next leap.'
    ],
    voicePitch: 1.01,
    voiceRate: 1.04,
    bio: 'Co-founder and CEO of Snap Inc., pioneering ephemeral messaging, vertical stories, and consumer augmented reality Spectacles.'
  },
  {
    id: 19,
    name: 'Daniel Ek',
    company: 'Spotify',
    title: 'The Algorithmic Maestro',
    faction: 'The Sovereign Kernel',
    archetype: 'Rhythm / Life-Leech',
    specialName: 'Lossless Sub-Bass Drop',
    specialInput: '↓ ↘ → + H',
    specialDesc: 'Unleashes an acoustic sub-bass shockwave that sweeps low-guarding enemies.',
    specialEffect: 'bass_sweep',
    ultimateName: '0.003 Cent Royalty Drain',
    ultimateDesc: 'Rapidly streams and leeches the opponent’s health bar directly into his own stamina.',
    ultimateEffect: 'royalty_leech',
    suitColor: 0x090d16,
    armorColor: 0x1db954,
    neonColor: 0x22c55e,
    visorColor: 0x86efac,
    skinColor: 0xeec6ac,
    gear: 'subBass',
    weapon: 'orb',
    likeness: {
      hairStyle: 'bald',
      hairColor: 0xeec6ac,
      eyewear: 'round_rect',
      facialHair: 'nordic_chin',
      outfitStyle: 'spotify_blazer',
      shirtColor: 0x1db954,
      pantsColor: 0x09090b,
      shoeColor: 0xffffff,
      chestLabel: 'SPOTIFY',
      bodyWidthScale: 1.0,
      heightScale: 1.01,
      ageLines: false,
    },
    power: 88,
    speed: 93,
    defense: 87,
    quote: 'Your defeat just hit #1 on Global Wrapped—curated by our AI DJ.',
    rivalQuote: 'We stream 100 million tracks a second; your latency is fatal.',
    latestModel: 'Spotify AI DJ, Daylist & Neko Full-Body Health Scan',
    philosophyQuotes: [
      'Our generative AI DJ and acoustic taste vectors know your next move before you even make it.',
      'With Spotify and Neko Health, we apply machine learning to both global audio culture and preventive medicine.',
      'Europe can build world-conquering technology giants when we obsess over zero-latency user experience.'
    ],
    voicePitch: 0.94,
    voiceRate: 1.01,
    bio: 'Co-founder and CEO of Spotify (and Neko Health) who transformed the global music industry through algorithmic streaming and AI personalization.'
  }
];

export interface FactionConfig {
  id: string;
  name: string;
  color: string;
  basePoints: number;
  desc: string;
}

export const FACTIONS: FactionConfig[] = [
  {
    id: 'House xAI & Orbital',
    name: 'House xAI & Orbital',
    color: '#06b6d4',
    basePoints: 2450,
    desc: 'Multi-planetary rocketry, autonomous robotics, and Colossus supercluster compute.',
  },
  {
    id: 'The CUDA Syndicate',
    name: 'The CUDA Syndicate',
    color: '#22c55e',
    basePoints: 3680,
    desc: 'Foundational GPU silicon, liquid-cooled NVLink racks, and parallel AI acceleration.',
  },
  {
    id: 'Constitutional Order of Anthropic',
    name: 'Constitutional Order of Anthropic',
    color: '#f59e0b',
    basePoints: 1920,
    desc: 'Mechanistic interpretability, constitutional alignment, and frontier reasoning.',
  },
  {
    id: 'Open-Weights BJJ',
    name: 'Open-Weights BJJ',
    color: '#3b82f6',
    basePoints: 2310,
    desc: 'Open-weights frontier Llama models, AR glasses, and high-impact grappling.',
  },
  {
    id: 'The Sovereign Kernel',
    name: 'The Sovereign Kernel',
    color: '#eab308',
    basePoints: 2150,
    desc: 'Linux kernel infrastructure, Git version control, Y Combinator seed velocity, and streaming.',
  },
  {
    id: 'Hyperscale Cloud Alliance',
    name: 'Hyperscale Cloud Alliance',
    color: '#a855f7',
    basePoints: 3420,
    desc: 'Global hyperscale cloud regions, enterprise SaaS, and gigawatt AI datacenters.',
  },
  {
    id: 'Silicon Foundry Apex',
    name: 'Silicon Foundry Apex',
    color: '#f43f5e',
    basePoints: 3890,
    desc: 'Pure-play 2nm EUV lithography fabs and sovereign wafer fabrication supremacy.',
  },
];

export const FIGHTERS: FighterConfig[] = ROSTER;

export const STORY_LADDER_IDS: number[] = [16, 17, 14, 5, 7, 3, 2, 4, 9];

export interface ArenaConfig {
  id: number;
  name: string;
  location: string;
  hazardName: string;
  hazardDesc: string;
  fogColor: number;
  floorColor: number;
  gridColor: number;
  pillarColor: number;
  accentColor: number;
  primaryColor: number;
  rimColor: number;
}

export const ARENAS: ArenaConfig[] = [
  {
    id: 0,
    name: 'TSMC Fab 18 EUV Cleanroom Core',
    location: 'Hsinchu Science Park, Taiwan',
    hazardName: '13.5nm EUV Lithography Sweep',
    hazardDesc: 'Periodic extreme-ultraviolet calibration laser sweeps the center stage.',
    fogColor: 0x050912,
    floorColor: 0x070d19,
    gridColor: 0x06b6d4,
    pillarColor: 0x0ea5e9,
    accentColor: 0xfacc15,
    primaryColor: 0x06b6d4,
    rimColor: 0x38bdf8,
  },
  {
    id: 1,
    name: 'Starbase Boca Chica Mechazilla Pad',
    location: 'Boca Chica, Texas',
    hazardName: 'Raptor Engine Static Fire',
    hazardDesc: 'Orbital launch mount vents superheated plasma plumes across the floor.',
    fogColor: 0x0e0706,
    floorColor: 0x140c0a,
    gridColor: 0xf97316,
    pillarColor: 0xef4444,
    accentColor: 0x38bdf8,
    primaryColor: 0xf97316,
    rimColor: 0x38bdf8,
  },
  {
    id: 2,
    name: 'NVIDIA Blackwell Liquid-Cooled Vault',
    location: 'Santa Clara, California',
    hazardName: 'NVLink Coolant Overpressure',
    hazardDesc: 'Cryogenic dielectric fluid surge erupts from the central server rack.',
    fogColor: 0x040d07,
    floorColor: 0x06130b,
    gridColor: 0x22c55e,
    pillarColor: 0x10b981,
    accentColor: 0xa3e635,
    primaryColor: 0x22c55e,
    rimColor: 0x4ade80,
  },
  {
    id: 3,
    name: 'OpenAI Stargate Gigawatt Reactor',
    location: 'Abilene Compute Campus',
    hazardName: 'Cherenkov Singularity Pulse',
    hazardDesc: 'The central AGI containment core emits a high-gravity shockwave.',
    fogColor: 0x050915,
    floorColor: 0x080f20,
    gridColor: 0x10b981,
    pillarColor: 0x6366f1,
    accentColor: 0xffffff,
    primaryColor: 0x10b981,
    rimColor: 0x6366f1,
  },
];
