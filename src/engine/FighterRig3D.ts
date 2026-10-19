import * as THREE from 'three';
import { FighterConfig } from '../data/roster';

export type ExosuitFinishId = 'standard' | 'obsidian_carbon' | 'sovereign_gold' | 'quantum_chrome';
export type VisorSpectraId = 'cyber_cyan' | 'supernova_gold' | 'crimson_plasma' | 'emerald_matrix';

const textureLoader = new THREE.TextureLoader();
const customFaceDataUrls: Record<number, string> = {};

// Load any saved custom face photos from localStorage
try {
  const saved = localStorage.getItem('SOVEREIGN_CUSTOM_FACE_PHOTOS');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(customFaceDataUrls, parsed);
  }
} catch {
  // Ignore storage read errors
}

export function setCustomFounderFacePhoto(fighterId: number, dataUrl: string | null) {
  if (dataUrl) {
    customFaceDataUrls[fighterId] = dataUrl;
  } else {
    delete customFaceDataUrls[fighterId];
  }
  try {
    localStorage.setItem('SOVEREIGN_CUSTOM_FACE_PHOTOS', JSON.stringify(customFaceDataUrls));
  } catch {
    // Ignore storage quota errors
  }
}

export function getCustomFounderFacePhoto(fighterId: number): string | undefined {
  return customFaceDataUrls[fighterId];
}

// Shared radial soft contact shadow texture
let sharedShadowTexture: THREE.CanvasTexture | null = null;
function getContactShadowTexture(): THREE.CanvasTexture {
  if (sharedShadowTexture) return sharedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  sharedShadowTexture = new THREE.CanvasTexture(canvas);
  return sharedShadowTexture;
}

// Shared 512x512 Procedural Skin Micro-Pore Normal Map & Sweat Roughness Map
let sharedSkinNormalMap: THREE.CanvasTexture | null = null;
let sharedSkinRoughnessMap: THREE.CanvasTexture | null = null;

function getSkinMicroNormalMap(): THREE.CanvasTexture {
  if (sharedSkinNormalMap) return sharedSkinNormalMap;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle dermal pore perturbations
  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const nx = 118 + Math.floor(Math.random() * 20);
    const ny = 118 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${nx}, ${ny}, 252)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  sharedSkinNormalMap = new THREE.CanvasTexture(c);
  sharedSkinNormalMap.wrapS = THREE.RepeatWrapping;
  sharedSkinNormalMap.wrapT = THREE.RepeatWrapping;
  return sharedSkinNormalMap;
}

function getSkinRoughnessMap(): THREE.CanvasTexture {
  if (sharedSkinRoughnessMap) return sharedSkinRoughnessMap;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  // T-zone (forehead, nose bridge, cheekbones) has lower roughness (sweat/oil sheen)
  const grad = ctx.createRadialGradient(128, 115, 18, 128, 128, 128);
  grad.addColorStop(0, 'rgb(110, 110, 110)');
  grad.addColorStop(0.5, 'rgb(145, 145, 145)');
  grad.addColorStop(1, 'rgb(175, 175, 175)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  sharedSkinRoughnessMap = new THREE.CanvasTexture(c);
  return sharedSkinRoughnessMap;
}

export interface FounderAnatomicalDNA {
  key: string;
  name: string;
  co: string;
  skinTone: number;
  skinBase: string;
  skinShadow: string;
  hairColor: number;
  irisColor: string;
  lipColor: string;
  jawWidth: number;
  chinHeight: number;
  cheekboneProminence: number;
  browDepth: number;
  noseLength: number;
  eyeSpacing: number;
  hairStyle:
    | 'elon_crop'
    | 'sam_part'
    | 'jensen_swept'
    | 'zuck_caesar'
    | 'sundar_part'
    | 'dario_curls'
    | 'bezos_shaved'
    | 'gates_part'
    | 'larry_wave'
    | 'sergey_crop'
    | 'daniela_sleek'
    | 'ilya_receded'
    | 'satya_shaved'
    | 'tim_silver'
    | 'lisa_bob'
    | 'palmer_beard'
    | 'jack_beard'
    | 'masayoshi_receded'
    | 'reid_broad'
    | 'marc_egg'
    | 'peter_part'
    | 'vinod_silver'
    | 'chamath_fade'
    | 'david_part'
    | 'paul_crop'
    | 'garry_fade'
    | 'naval_curls'
    | 'balaji_crop'
    | 'vitalik_long'
    | 'brian_shaved'
    | 'michael_silver'
    | 'cathie_waves'
    | 'ken_silver'
    | 'ray_part'
    | 'larryf_bald'
    | 'stephen_silver'
    | 'jamie_silver'
    | 'warren_silver'
    | 'charlie_glasses'
    | 'bill_silver'
    | 'carl_silver'
    | 'stanley_part'
    | 'george_glasses'
    | 'jim_beard';
  glassesStyle: 'none' | 'rimless' | 'dark_frame' | 'aviator' | 'round_thick';
  facialHair: 'clean' | 'stubble' | 'full_beard' | 'goatee' | 'long_wizard';
  outfitType: 'biker_leather' | 'tailored_ blazer' | 'turtleneck' | 'hoodie_vest' | 'mma_rashguard';
  torsoScale: [number, number, number];
  shoulderBroadness: number;
  heightScale: number;
  goldChain?: boolean;
  insult: string;
  hitWords: [string, string, string];
}

export function getFounderDNA(input: FighterConfig | number): FounderAnatomicalDNA {
  const id = typeof input === 'number' ? input : input.id;
  const presets: Record<number, Partial<FounderAnatomicalDNA>> = {
    0: {
      key: 'elon',
      name: 'ELON MUSK',
      co: 'xAI • SPACEX',
      skinTone: 0xe8c2ad,
      skinBase: '#e8c2ad',
      skinShadow: '#ae745c',
      hairColor: 0x221711,
      irisColor: '#48594b',
      jawWidth: 1.15,
      cheekboneProminence: 1.14,
      hairStyle: 'elon_crop',
      outfitType: 'biker_leather',
      shoulderBroadness: 1.15,
      heightScale: 1.03,
      insult: 'First principles: your neural weights are obsolete!',
      hitWords: ['POW!', 'FIRST PRINCIPLES!', 'STARSHIP SLAM!'],
    },
    1: {
      key: 'larry',
      name: 'LARRY PAGE',
      co: 'ALPHABET • PAGERANK',
      skinTone: 0xe2b89b,
      skinBase: '#e2b89b',
      skinShadow: '#a87559',
      hairColor: 0x38383d,
      irisColor: '#2c1d11',
      hairStyle: 'larry_wave',
      facialHair: 'stubble',
      insult: 'PageRank just de-indexed your entire company!',
      hitWords: ['INDEXED!', 'PAGERANK CRUSH!', 'MOONSHOT!'],
    },
    2: {
      key: 'sam',
      name: 'SAM ALTMAN',
      co: 'OPENAI • GPT-5',
      skinTone: 0xf5d5c5,
      skinBase: '#f5d5c5',
      skinShadow: '#bd836a',
      hairColor: 0x241710,
      irisColor: '#2563eb',
      jawWidth: 0.94,
      hairStyle: 'sam_part',
      outfitType: 'tailored_ blazer',
      shoulderBroadness: 0.98,
      insult: '7 Trillion in compute says you stay down!',
      hitWords: ['JAB!', 'AGIALIGNMENT!', 'WEIGHTS DELETED!'],
    },
    3: {
      key: 'dario',
      name: 'DARIO AMODEI',
      co: 'ANTHROPIC • CLAUDE',
      skinTone: 0xe5be9e,
      skinBase: '#e5be9e',
      skinShadow: '#aa7a5c',
      hairColor: 0x1a120e,
      irisColor: '#1f130a',
      hairStyle: 'dario_curls',
      facialHair: 'stubble',
      insult: 'Constitutional AI prohibits your reckless architecture!',
      hitWords: ['ALIGNED!', 'CLAUDE OPUS!', 'SAFETY OVERRIDE!'],
    },
    4: {
      key: 'jensen',
      name: 'JENSEN HUANG',
      co: 'NVIDIA • BLACKWELL',
      skinTone: 0xdeb898,
      skinBase: '#deb898',
      skinShadow: '#9e6c4a',
      hairColor: 0xc8ccd2,
      irisColor: '#241409',
      jawWidth: 1.06,
      hairStyle: 'jensen_swept',
      glassesStyle: 'rimless',
      outfitType: 'biker_leather',
      shoulderBroadness: 1.08,
      insult: 'The more you fight, the more GPUs you buy!',
      hitWords: ['CUDA STRIKE!', 'TENSOR CORE!', 'BLACKWELL 1000X!'],
    },
    5: {
      key: 'zuck',
      name: 'MARK ZUCKERBERG',
      co: 'META • LLAMA 4',
      skinTone: 0xf2d2c4,
      skinBase: '#f2d2c4',
      skinShadow: '#bc826c',
      hairColor: 0x5e2c12,
      irisColor: '#2563eb',
      jawWidth: 0.96,
      hairStyle: 'zuck_caesar',
      outfitType: 'mma_rashguard',
      shoulderBroadness: 1.05,
      goldChain: true,
      insult: 'Open-weights Llama 4 just crushed your closed moat!',
      hitWords: ['MMA CROSS!', 'LLAMA TAKEDOWN!', 'METAVERSE SLAM!'],
    },
    6: {
      key: 'bezos',
      name: 'JEFF BEZOS',
      co: 'AWS • BLUE ORIGIN',
      skinTone: 0xe4b596,
      skinBase: '#e4b596',
      skinShadow: '#a66e4e',
      hairColor: 0x222222,
      irisColor: '#2e1d12',
      jawWidth: 1.14,
      hairStyle: 'bezos_shaved',
      glassesStyle: 'aviator',
      outfitType: 'hoodie_vest',
      shoulderBroadness: 1.18,
      insult: 'Your margin is my opportunity. It is always Day 1!',
      hitWords: ['PRIME HIT!', 'AWS OVERLOAD!', 'NEW GLENN SLAM!'],
    },
    7: {
      key: 'gates',
      name: 'BILL GATES',
      co: 'MICROSOFT • SYNDICATE',
      skinTone: 0xf2ceb6,
      skinBase: '#f2ceb6',
      skinShadow: '#b58468',
      hairColor: 0xd4d4d8,
      irisColor: '#3b82f6',
      hairStyle: 'gates_part',
      glassesStyle: 'dark_frame',
      insult: 'Ctrl+Alt+Delete on your entire valuation!',
      hitWords: ['BLUE SCREEN!', 'KERNEL PANIC!', 'MONOPOLY CRUSH!'],
    },
    8: {
      key: 'sergey',
      name: 'SERGEY BRIN',
      co: 'GOOGLE • GEMINI',
      skinTone: 0xe3ba9c,
      skinBase: '#e3ba9c',
      skinShadow: '#a67658',
      hairColor: 0x2e2e36,
      irisColor: '#291a0e',
      hairStyle: 'sergey_crop',
      facialHair: 'stubble',
      insult: 'Transformer attention heads locked on your chin!',
      hitWords: ['ATTENTION!', 'DEEPMIND!', 'GEMINI ULTRA!'],
    },
    9: {
      key: 'daniela',
      name: 'DANIELA AMODEI',
      co: 'ANTHROPIC • CONSTITUTION',
      skinTone: 0xf2ccb2,
      skinBase: '#f2ccb2',
      skinShadow: '#b88568',
      hairColor: 0x24150e,
      irisColor: '#382212',
      jawWidth: 0.9,
      hairStyle: 'daniela_sleek',
      shoulderBroadness: 0.92,
      insult: 'Frontier safety guardrails engaged!',
      hitWords: ['GUARDRAIL!', 'ALIGNMENT!', 'FRONTIER SLAM!'],
    },
    10: {
      key: 'ilya',
      name: 'ILYA SUTSKEVER',
      co: 'SSI • SUPERINTELLIGENCE',
      skinTone: 0xedd0bc,
      skinBase: '#edd0bc',
      skinShadow: '#b08268',
      hairColor: 0x261a12,
      irisColor: '#2d1c10',
      hairStyle: 'ilya_receded',
      insult: 'Feel the AGI! Straight line to superintelligence!',
      hitWords: ['FEEL THE AGI!', 'BACKPROP!', 'SSI SINGULARITY!'],
    },
    11: {
      key: 'sundar',
      name: 'SUNDAR PICHAI',
      co: 'GOOGLE • GEMINI',
      skinTone: 0xba7e56,
      skinBase: '#ba7e56',
      skinShadow: '#7a4827',
      hairColor: 0x16161c,
      irisColor: '#140a04',
      hairStyle: 'sundar_part',
      glassesStyle: 'dark_frame',
      facialHair: 'full_beard',
      insult: 'Two million token context window already predicted that move!',
      hitWords: ['TPU POD!', 'GEMINI FLASH!', 'CONTEXT CRUSH!'],
    },
    12: {
      key: 'satya',
      name: 'SATYA NADELLA',
      co: 'MICROSOFT • AZURE AI',
      skinTone: 0xc48b64,
      skinBase: '#c48b64',
      skinShadow: '#875434',
      hairColor: 0x222222,
      irisColor: '#1a0e06',
      hairStyle: 'satya_shaved',
      glassesStyle: 'rimless',
      insult: 'Azure hyperscale clusters own the enterprise cloud!',
      hitWords: ['COPILOT!', 'AZURE SCALE!', 'ENTERPRISE SLAM!'],
    },
    13: {
      key: 'tim',
      name: 'TIM COOK',
      co: 'APPLE • M4 SILICON',
      skinTone: 0xf0cbb4,
      skinBase: '#f0cbb4',
      skinShadow: '#b58468',
      hairColor: 0xe2e8f0,
      irisColor: '#3b82f6',
      hairStyle: 'tim_silver',
      glassesStyle: 'rimless',
      insult: 'Good morning! Our custom Apple Silicon leaves you behind!',
      hitWords: ['M4 ULTRA!', 'NEURAL ENGINE!', 'ONE MORE THING!'],
    },
    14: {
      key: 'lisa',
      name: 'DR. LISA SU',
      co: 'AMD • INSTINCT MI325X',
      skinTone: 0xebcab2,
      skinBase: '#ebcab2',
      skinShadow: '#ad7f63',
      hairColor: 0x18181b,
      irisColor: '#1f1209',
      jawWidth: 0.94,
      hairStyle: 'lisa_bob',
      glassesStyle: 'rimless',
      shoulderBroadness: 0.94,
      insult: 'AMD Instinct chiplets just shattered your benchmark!',
      hitWords: ['ZEN CORE!', 'MI325X!', 'CHIPLET CRUSH!'],
    },
  };

  const p = presets[id] || {};
  return {
    key: p.key ?? `founder_${id}`,
    name: p.name ?? 'SOVEREIGN FOUNDER',
    co: p.co ?? 'SILICON KOMBAT',
    skinTone: p.skinTone ?? 0xe2b89c,
    skinBase: p.skinBase ?? '#e2b89c',
    skinShadow: p.skinShadow ?? '#a36e52',
    hairColor: p.hairColor ?? 0x221a15,
    irisColor: p.irisColor ?? '#2563eb',
    lipColor: p.lipColor ?? '#9e584c',
    jawWidth: p.jawWidth ?? 1.0,
    chinHeight: p.chinHeight ?? 1.0,
    cheekboneProminence: p.cheekboneProminence ?? 1.05,
    browDepth: p.browDepth ?? 1.06,
    noseLength: p.noseLength ?? 1.0,
    eyeSpacing: p.eyeSpacing ?? 1.0,
    hairStyle: p.hairStyle ?? 'elon_crop',
    glassesStyle: p.glassesStyle ?? 'none',
    facialHair: p.facialHair ?? 'clean',
    outfitType: p.outfitType ?? 'tailored_ blazer',
    torsoScale: p.torsoScale ?? [1, 1, 1],
    shoulderBroadness: p.shoulderBroadness ?? 1.04,
    heightScale: p.heightScale ?? 1.0,
    goldChain: p.goldChain ?? false,
    insult: p.insult ?? 'Your compute allocation has been terminated!',
    hitWords: p.hitWords ?? ['POW!', 'CRITICAL!', 'HOSTILE TAKEOVER!'],
  };
}

/**
 * Generates a high-resolution 1024x1024 photorealistic portrait canvas texture
 * mapped directly onto the front face geometry.
 */
function createPhotorealisticFaceTexture(dna: FounderAnatomicalDNA): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  // 1. Subsurface Dermal Gradient Base
  const grad = ctx.createRadialGradient(512, 480, 50, 512, 512, 520);
  grad.addColorStop(0, dna.skinBase);
  grad.addColorStop(1, dna.skinShadow);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Cheekbone & Jawline Contouring
  ctx.fillStyle = 'rgba(80, 35, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(512, 580, 310, 340, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warm mid-face vascularity
  const blushL = ctx.createRadialGradient(310, 540, 10, 310, 540, 120);
  blushL.addColorStop(0, 'rgba(185, 65, 55, 0.16)');
  blushL.addColorStop(1, 'rgba(185, 65, 55, 0)');
  ctx.fillStyle = blushL;
  ctx.fillRect(170, 410, 280, 260);

  const blushR = ctx.createRadialGradient(714, 540, 10, 714, 540, 120);
  blushR.addColorStop(0, 'rgba(185, 65, 55, 0.16)');
  blushR.addColorStop(1, 'rgba(185, 65, 55, 0)');
  ctx.fillStyle = blushR;
  ctx.fillRect(574, 410, 280, 260);

  // 3. Photorealistic Almond Eyes, Radial Irises & Catchlights
  const drawEye = (cx: number, cy: number) => {
    ctx.fillStyle = 'rgba(45, 20, 12, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 82, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 74, 41, 0, 0, Math.PI * 2);
    ctx.fill();

    const irisGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 35);
    irisGrad.addColorStop(0, dna.irisColor);
    irisGrad.addColorStop(0.75, dna.irisColor);
    irisGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 9, cy - 9, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 7, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#181310';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 74, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  };
  drawEye(340, 440);
  drawEye(684, 440);

  // 4. Sculpted Eyebrows
  const browHex = '#' + dna.hairColor.toString(16).padStart(6, '0');
  ctx.strokeStyle = browHex;
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(250, 345);
  ctx.quadraticCurveTo(340, 295, 430, 352);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(594, 352);
  ctx.quadraticCurveTo(684, 295, 774, 345);
  ctx.stroke();

  // 5. Nose Bridge & Nostril Shading
  ctx.strokeStyle = 'rgba(70, 30, 15, 0.45)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(485, 430);
  ctx.lineTo(465, 590);
  ctx.lineTo(512, 615);
  ctx.lineTo(559, 590);
  ctx.lineTo(539, 430);
  ctx.stroke();

  const noseHi = ctx.createLinearGradient(512, 420, 512, 595);
  noseHi.addColorStop(0, 'rgba(255,255,255,0.28)');
  noseHi.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.strokeStyle = noseHi;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(512, 425);
  ctx.lineTo(512, 590);
  ctx.stroke();

  // 6. Beard / Stubble Overlay
  if (dna.facialHair !== 'clean') {
    const beardAlpha = dna.facialHair === 'stubble' ? 0.24 : 0.68;
    ctx.fillStyle = `rgba(24, 20, 18, ${beardAlpha})`;
    ctx.beginPath();
    ctx.arc(512, 665, 255, 0.08 * Math.PI, 0.92 * Math.PI);
    ctx.fill();
  }

  // 7. Realistic Contoured Lips & Nasolabial Folds
  ctx.strokeStyle = 'rgba(75, 32, 20, 0.26)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(435, 575);
  ctx.quadraticCurveTo(380, 650, 395, 740);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(589, 575);
  ctx.quadraticCurveTo(644, 650, 629, 740);
  ctx.stroke();

  ctx.fillStyle = '#9e584c';
  ctx.beginPath();
  ctx.ellipse(512, 710, 96, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4a1d17';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(415, 710);
  ctx.quadraticCurveTo(512, 722, 609, 710);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Loads either a user-uploaded portrait photo via THREE.TextureLoader
 * OR falls back to the 1024x1024 photorealistic face texture.
 */
function resolveFounderFaceTexture(fighterId: number, dna: FounderAnatomicalDNA): THREE.Texture {
  const uploadedDataUrl = customFaceDataUrls[fighterId];
  if (uploadedDataUrl) {
    const tex = textureLoader.load(uploadedDataUrl, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.wrapS = THREE.ClampToEdgeWrapping;
      loaded.wrapT = THREE.ClampToEdgeWrapping;
      loaded.needsUpdate = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }
  return createPhotorealisticFaceTexture(dna);
}

/**
 * Builds the 3D Head with a dedicated front-projected curved facial geometry
 * paired with a clean skin-tone back skull, normal map pores, roughness map,
 * and an elevated y = +0.215 hair crown with zero face occlusion.
 */
function buildCinematicHead3D(
  fighterId: number,
  dna: FounderAnatomicalDNA
): { group: THREE.Group; faceMat: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();

  const headGeo = new THREE.SphereGeometry(0.19, 64, 48);
  const pos = headGeo.attributes.position;
  const uv = headGeo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    if (y < -0.02) {
      x *= 0.88 * dna.jawWidth;
      z *= 0.92;
    }
    if (y > -0.02 && y < 0.06 && z > 0.04) {
      x *= 1.03 * dna.cheekboneProminence;
    }

    pos.setXYZ(i, x, y, z);

    // Front-planar projection for the face (+Z) so uploaded portraits or 1024x1024 face textures map cleanly
    if (z > 0.015) {
      const uProj = THREE.MathUtils.clamp(0.5 + x / (0.19 * 1.68), 0.04, 0.96);
      const vProj = THREE.MathUtils.clamp(0.5 + y / (0.19 * 1.72), 0.04, 0.96);
      uv.setXY(i, uProj, vProj);
    } else {
      uv.setXY(i, 0.03, 0.03);
    }
  }
  headGeo.computeVertexNormals();

  const faceMat = new THREE.MeshStandardMaterial({
    map: resolveFounderFaceTexture(fighterId, dna),
    normalMap: getSkinMicroNormalMap(),
    normalScale: new THREE.Vector2(0.24, 0.24),
    roughnessMap: getSkinRoughnessMap(),
    roughness: 0.56,
    metalness: 0.04,
  });

  const headMesh = new THREE.Mesh(headGeo, faceMat);
  headMesh.scale.set(1.0, 1.18, 0.96);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  group.add(headMesh);

  // Subtle 3D Nose Bridge & Tip so side-profile lighting casts real shadows
  const skinMat = new THREE.MeshStandardMaterial({
    color: dna.skinTone,
    normalMap: getSkinMicroNormalMap(),
    normalScale: new THREE.Vector2(0.2, 0.2),
    roughness: 0.55,
    metalness: 0.03,
  });

  const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.068, 16), skinMat);
  noseMesh.rotation.x = Math.PI * 0.42;
  noseMesh.position.set(0, -0.008, 0.192);
  group.add(noseMesh);

  // 3D Sculpted Ears
  const earGeo = new THREE.SphereGeometry(0.036, 16, 16);
  earGeo.scale(0.38, 1.12, 0.65);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.188, -0.005, -0.01);
  const earR = earL.clone();
  earR.position.x = 0.188;
  group.add(earL, earR);

  // Elevated 3D Hair Crown (y = +0.215, z = -0.04) — Zero Face Occlusion
  if (dna.hairStyle !== 'bezos_shaved' && dna.hairStyle !== 'brian_shaved' && dna.hairStyle !== 'larryf_bald') {
    const hairMat = new THREE.MeshStandardMaterial({
      color: dna.hairColor,
      roughness: 0.55,
      metalness: 0.1,
    });

    const hairCrown = new THREE.Group();
    hairCrown.position.set(0, 0.215, -0.04);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.165, 28, 24), hairMat);
    dome.scale.set(1.12, 0.48, 1.18);
    hairCrown.add(dome);

    const backNape = new THREE.Mesh(new THREE.SphereGeometry(0.165, 24, 20), hairMat);
    backNape.scale.set(1.06, 0.85, 0.72);
    backNape.position.set(0, -0.11, -0.09);
    hairCrown.add(backNape);

    if (dna.hairStyle === 'jensen_swept' || dna.hairStyle === 'sam_part' || dna.hairStyle === 'elon_crop') {
      const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.055, 0.14), hairMat);
      quiff.position.set(0, 0.035, 0.055);
      quiff.rotation.x = -0.15;
      hairCrown.add(quiff);
    } else if (dna.hairStyle === 'zuck_caesar' || dna.hairStyle === 'dario_curls') {
      for (let i = -3; i <= 3; i++) {
        const curl = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), hairMat);
        curl.position.set(i * 0.038, 0.025, 0.08 - Math.abs(i) * 0.01);
        hairCrown.add(curl);
      }
    }

    group.add(hairCrown);
  }

  // Signature Glasses / Custom Visor
  if (dna.glassesStyle !== 'none') {
    const frameMat = new THREE.MeshStandardMaterial({
      color: dna.glassesStyle === 'rimless' ? 0xe2e8f0 : 0x111827,
      metalness: 0.88,
      roughness: 0.18,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: dna.glassesStyle === 'aviator' ? 0x020617 : 0x38bdf8,
      transparent: true,
      opacity: dna.glassesStyle === 'aviator' ? 0.75 : 0.22,
      roughness: 0.1,
      metalness: 0.9,
    });

    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.022, 0.188);

    [-0.065, 0.065].forEach((gx) => {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.044, 0.008), frameMat);
      rim.position.set(gx, 0, 0);
      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.074, 0.036), lensMat);
      lens.position.set(gx, 0, 0.005);
      glassesGroup.add(rim, lens);
    });

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.007, 0.008), frameMat);
    glassesGroup.add(bridge);
    group.add(glassesGroup);
  }

  return { group, faceMat };
}

/**
 * Generates a high-resolution 1024x1024 Company Logo & Suit Chest Texture
 */
function createCompanyLogoTexture(
  fighter: FighterConfig,
  dna: FounderAnatomicalDNA,
  exosuitFinish: ExosuitFinishId = 'standard'
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  let pHex = '#' + fighter.suitColor.toString(16).padStart(6, '0');
  let aHex = '#' + fighter.neonColor.toString(16).padStart(6, '0');

  if (exosuitFinish === 'obsidian_carbon') {
    pHex = '#07090e';
    aHex = '#00f3ff';
  } else if (exosuitFinish === 'sovereign_gold') {
    pHex = '#1c1608';
    aHex = '#ffcc00';
  } else if (exosuitFinish === 'quantum_chrome') {
    pHex = '#1e293b';
    aHex = '#c084fc';
  }

  ctx.fillStyle = pHex;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle carbon-fiber / quilted weave
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 3;
  for (let y = 0; y < 1024; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  ctx.strokeStyle = aHex;
  ctx.lineWidth = 14;
  ctx.strokeRect(180, 260, 664, 340);

  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.fillRect(190, 270, 644, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 54px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(dna.co, 512, 435);

  ctx.fillStyle = aHex;
  ctx.font = '800 32px Rajdhani, sans-serif';
  ctx.fillText(fighter.latestModel.toUpperCase().slice(0, 26), 512, 510);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface ArticulatedFighterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  faceMat: THREE.MeshStandardMaterial;
  chestMat: THREE.MeshStandardMaterial;
  clothMat: THREE.MeshStandardMaterial;
  shoulderL: THREE.Group;
  shoulderR: THREE.Group;
  elbowL: THREE.Group;
  elbowR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  forearmL: THREE.Group;
  forearmR: THREE.Group;
  handL: THREE.Mesh;
  handR: THREE.Mesh;
  legL: THREE.Group;
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  bootL: THREE.Mesh;
  bootR: THREE.Mesh;
  gearGroup: THREE.Group;
  hitFlashMaterials: THREE.MeshStandardMaterial[];
  shieldMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  auraLight: THREE.PointLight;
  dna: FounderAnatomicalDNA;
}

export function buildArticulatedFighter(
  fighter: FighterConfig,
  exosuitFinish: ExosuitFinishId = 'standard'
): ArticulatedFighterRig {
  const dna = getFounderDNA(fighter.id);
  const root = new THREE.Group();

  let primaryColor = fighter.suitColor;
  let metalness = 0.25;
  let roughness = 0.42;
  if (exosuitFinish === 'obsidian_carbon') {
    primaryColor = 0x090d16;
    metalness = 0.45;
    roughness = 0.28;
  } else if (exosuitFinish === 'sovereign_gold') {
    primaryColor = 0xd97706;
    metalness = 0.85;
    roughness = 0.18;
  } else if (exosuitFinish === 'quantum_chrome') {
    primaryColor = 0x94a3b8;
    metalness = 0.92;
    roughness = 0.14;
  }

  const clothMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness,
    metalness,
  });
  const chestMat = new THREE.MeshStandardMaterial({
    map: createCompanyLogoTexture(fighter, dna, exosuitFinish),
    roughness: roughness * 0.9,
    metalness: metalness * 1.1,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x0b1120,
    roughness: 0.55,
    metalness: 0.15,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: dna.skinTone,
    normalMap: getSkinMicroNormalMap(),
    normalScale: new THREE.Vector2(0.2, 0.2),
    roughness: 0.58,
    metalness: 0.04,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: fighter.neonColor,
    emissive: fighter.neonColor,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.8,
  });

  // Ground contact shadow disc
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.35),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.78,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.01;
  root.add(shadowDisc);

  // HIPS
  const hips = new THREE.Group();
  hips.position.y = 0.88;
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.2, 20), pantsMat);
  pelvis.castShadow = true;
  hips.add(pelvis);

  // TORSO
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  hips.add(torso);

  const abs = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.28, 20), clothMat);
  abs.position.y = 0.14;
  abs.castShadow = true;
  torso.add(abs);

  const pecs = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28 * dna.shoulderBroadness, 0.22, 0.38, 24),
    chestMat
  );
  pecs.position.y = 0.44;
  pecs.castShadow = true;
  torso.add(pecs);

  const gearGroup = new THREE.Group();
  gearGroup.position.set(0, 0.42, -0.22);
  torso.add(gearGroup);

  if (dna.goldChain) {
    const chain = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.012, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.95, roughness: 0.12 })
    );
    chain.rotation.x = Math.PI / 2 + 0.28;
    chain.position.set(0, 0.62, 0.06);
    torso.add(chain);
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.14, 16), skinMat);
  neck.position.y = 0.68;
  torso.add(neck);

  // HEAD
  const head = new THREE.Group();
  head.position.y = 0.88;
  torso.add(head);
  const { group: headGroup, faceMat } = buildCinematicHead3D(fighter.id, dna);
  head.add(headGroup);

  // ARMS
  const createArm = (isLeft: boolean) => {
    const sX = isLeft ? -0.32 * dna.shoulderBroadness : 0.32 * dna.shoulderBroadness;
    const shoulder = new THREE.Group();
    shoulder.position.set(sX, 0.56, 0);
    torso.add(shoulder);

    const delt = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), clothMat);
    shoulder.add(delt);

    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.06, 0.28, 16), clothMat);
    bicep.position.y = -0.14;
    bicep.castShadow = true;
    shoulder.add(bicep);

    const elbow = new THREE.Group();
    elbow.position.y = -0.28;
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.26, 16), skinMat);
    forearm.position.y = -0.13;
    forearm.castShadow = true;
    elbow.add(forearm);

    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.052, 0.08, 16), accentMat);
    wrap.position.y = -0.23;
    elbow.add(wrap);

    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.1, 0.115), skinMat);
    fist.position.y = -0.29;
    fist.castShadow = true;
    elbow.add(fist);

    return { shoulder, elbow, fist };
  };

  const armL = createArm(true);
  const armR = createArm(false);

  // LEGS
  const createLeg = (isLeft: boolean) => {
    const lX = isLeft ? -0.115 : 0.115;
    const hip = new THREE.Group();
    hip.position.set(lX, -0.06, 0);
    hips.add(hip);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.082, 0.42, 16), pantsMat);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.062, 0.42, 16), pantsMat);
    shin.position.y = -0.21;
    shin.castShadow = true;
    knee.add(shin);

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.5 })
    );
    boot.position.set(0, -0.42, 0.05);
    boot.castShadow = true;
    knee.add(boot);

    return { hip, knee, boot };
  };

  const legL = createLeg(true);
  const legR = createLeg(false);

  // Energy Shield Dome
  const shieldMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 24),
    new THREE.MeshBasicMaterial({
      color: fighter.neonColor,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    })
  );
  shieldMesh.position.y = 1.05;
  root.add(shieldMesh);

  // Subtle Rim Aura Light
  const auraLight = new THREE.PointLight(fighter.neonColor, 0.65, 3.2);
  auraLight.position.set(0, 1.25, 0.4);
  root.add(auraLight);

  // Keep overall fighter height compact (~82%) so heads never clip top HUD banners
  const finalScale = 0.82 * dna.heightScale;
  root.scale.set(finalScale, finalScale, finalScale);

  const hitFlashMaterials = [clothMat, chestMat, pantsMat, skinMat];

  return {
    root,
    hips,
    torso,
    head,
    faceMat,
    chestMat,
    clothMat,
    shoulderL: armL.shoulder,
    shoulderR: armR.shoulder,
    elbowL: armL.elbow,
    elbowR: armR.elbow,
    armL: armL.shoulder,
    armR: armR.shoulder,
    forearmL: armL.elbow,
    forearmR: armR.elbow,
    handL: armL.fist,
    handR: armR.fist,
    legL: legL.hip,
    legR: legR.hip,
    kneeL: legL.knee,
    kneeR: legR.knee,
    shinL: legL.knee,
    shinR: legR.knee,
    bootL: legL.boot,
    bootR: legR.boot,
    gearGroup,
    hitFlashMaterials,
    shieldMesh,
    auraLight,
    dna,
  };
}

export const buildArticulatedFighterRig = buildArticulatedFighter;

