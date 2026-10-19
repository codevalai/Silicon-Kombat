import * as THREE from 'three';
import { ArticulatedFighterRig } from './FighterRig3D';

export interface BonePose {
  hipY?: number;
  hipZ?: number;
  hipRotX?: number;
  hipRotY?: number;
  hipRotZ?: number;
  torsoRotX?: number;
  torsoRotY?: number;
  torsoRotZ?: number;
  headRotX?: number;
  headRotY?: number;
  armL: [number, number, number, number]; // [shoulderX, shoulderY, shoulderZ, elbowX]
  armR: [number, number, number, number];
  legL: [number, number, number, number]; // [hipX, hipY, hipZ, kneeX]
  legR: [number, number, number, number];
}

export type MartialMoveId =
  | 'jab'
  | 'cross'
  | 'spinning_backfist'
  | 'uppercut'
  | 'body_hook'
  | 'side_kick'
  | 'roundhouse'
  | 'axe_kick'
  | 'low_sweep'
  | 'flying_knee'
  | 'air_dive'
  | 'command_grab'
  | 'special_palm'
  | 'dragon_uppercut'
  | 'ult_rush'
  | 'sovereign_beam';

export interface MoveDefinition {
  id: MartialMoveId;
  name: string;
  totalFrames: number;
  activeStart: number;
  activeEnd: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  launchY: number;
  hitLocation: 'high' | 'mid' | 'low' | 'throw';
  activeLimb: 'handL' | 'handR' | 'bootL' | 'bootR' | 'kneeR' | 'bothHands';
  trailColor: number;
  lungeVel: number;
  windup: BonePose;
  strike: BonePose;
}

export const NEUTRAL_GUARD_POSE: BonePose = {
  hipY: 0.88,
  hipZ: 0,
  hipRotX: 0,
  hipRotY: -0.18,
  hipRotZ: 0,
  torsoRotX: 0.04,
  torsoRotY: -0.24,
  torsoRotZ: 0,
  armL: [-0.55, 0.2, 0.18, -1.35],
  armR: [-0.42, -0.2, -0.18, -1.25],
  legL: [-0.22, 0, 0.08, 0.42],
  legR: [0.24, 0, -0.08, 0.35],
};

// ============================================================================
// 16-MOVE MASTER MARTIAL ARTS MATRIX (FRAME-DATA & BALLISTIC KEYFRAMES)
// ============================================================================
export const MARTIAL_MOVES: Record<MartialMoveId, MoveDefinition> = {
  // 1. SNAP LEAD JAB (Left Hand)
  jab: {
    id: 'jab',
    name: 'SNAP JAB!',
    totalFrames: 13,
    activeStart: 3,
    activeEnd: 7,
    damage: 5.5,
    hitstun: 11,
    blockstun: 7,
    pushback: 0.08,
    launchY: 0,
    hitLocation: 'high',
    activeLimb: 'handL',
    trailColor: 0x00f3ff,
    lungeVel: 0.11,
    windup: {
      hipY: 0.85,
      hipRotY: -0.35,
      torsoRotX: 0.12,
      torsoRotY: -0.45,
      armL: [-0.85, 0.35, 0.25, -1.85],
      armR: [-0.55, -0.25, -0.2, -1.45],
      legL: [-0.35, 0, 0.1, 0.55],
      legR: [0.35, 0, -0.1, 0.45],
    },
    strike: {
      hipY: 0.84,
      hipZ: 0.16,
      hipRotY: 0.45,
      torsoRotX: 0.24,
      torsoRotY: 0.55,
      armL: [-1.57, -0.12, 0.0, -0.05],
      armR: [-0.45, -0.35, -0.35, -1.65],
      legL: [-0.55, 0, 0.12, 0.72],
      legR: [0.48, 0, -0.12, 0.22],
    },
  },

  // 2. TORQUE CROSS STRAIGHT (Right Hand)
  cross: {
    id: 'cross',
    name: 'TORQUE CROSS!',
    totalFrames: 16,
    activeStart: 4,
    activeEnd: 10,
    damage: 8.5,
    hitstun: 15,
    blockstun: 10,
    pushback: 0.14,
    launchY: 0,
    hitLocation: 'high',
    activeLimb: 'handR',
    trailColor: 0x38bdf8,
    lungeVel: 0.15,
    windup: {
      hipY: 0.83,
      hipRotY: 0.55,
      torsoRotX: 0.15,
      torsoRotY: 0.65,
      armL: [-1.1, 0.2, 0.2, -0.9],
      armR: [-0.65, -0.45, -0.4, -1.95],
      legL: [-0.45, 0, 0.1, 0.65],
      legR: [0.45, 0, -0.1, 0.55],
    },
    strike: {
      hipY: 0.81,
      hipZ: 0.24,
      hipRotY: -0.68,
      torsoRotX: 0.32,
      torsoRotY: -0.82,
      armL: [-0.4, 0.45, 0.45, -1.75],
      armR: [-1.58, 0.15, 0.0, -0.04],
      legL: [-0.68, 0, 0.15, 0.82],
      legR: [0.62, 0, -0.15, 0.18],
    },
  },

  // 3. SPINNING CYBER BACKFIST (Punch Tap 3)
  spinning_backfist: {
    id: 'spinning_backfist',
    name: 'SPINNING BACKFIST!',
    totalFrames: 18,
    activeStart: 5,
    activeEnd: 11,
    damage: 10.5,
    hitstun: 18,
    blockstun: 11,
    pushback: 0.18,
    launchY: 0.08,
    hitLocation: 'high',
    activeLimb: 'handL',
    trailColor: 0x22d3ee,
    lungeVel: 0.17,
    windup: {
      hipY: 0.82,
      hipRotY: 1.15,
      torsoRotX: 0.18,
      torsoRotY: 1.25,
      armL: [-0.8, -0.5, -0.4, -1.5],
      armR: [-0.6, 0.3, 0.3, -1.4],
      legL: [-0.5, 0, 0.12, 0.7],
      legR: [0.5, 0, -0.12, 0.5],
    },
    strike: {
      hipY: 0.83,
      hipZ: 0.24,
      hipRotY: -0.85,
      torsoRotX: 0.25,
      torsoRotY: -0.95,
      armL: [-1.55, 0.45, 0.35, -0.06],
      armR: [-0.45, -0.4, -0.4, -1.6],
      legL: [-0.65, 0, 0.14, 0.8],
      legR: [0.6, 0, -0.14, 0.2],
    },
  },

  // 4. RISING TIGER UPPERCUT (Punch Tap 4 Launcher)
  uppercut: {
    id: 'uppercut',
    name: 'TIGER UPPERCUT!',
    totalFrames: 24,
    activeStart: 6,
    activeEnd: 13,
    damage: 14,
    hitstun: 24,
    blockstun: 14,
    pushback: 0.12,
    launchY: 0.29,
    hitLocation: 'high',
    activeLimb: 'handR',
    trailColor: 0xffcc00,
    lungeVel: 0.16,
    windup: {
      hipY: 0.66,
      hipRotY: 0.45,
      torsoRotX: 0.52,
      torsoRotY: 0.45,
      armL: [-0.6, 0.3, 0.3, -1.6],
      armR: [0.25, -0.3, -0.2, -1.85],
      legL: [-0.85, 0, 0.15, 1.35],
      legR: [0.45, 0, -0.15, 1.15],
    },
    strike: {
      hipY: 1.06,
      hipZ: 0.22,
      hipRotY: -0.75,
      torsoRotX: -0.28,
      torsoRotY: -0.85,
      armL: [-0.3, 0.5, 0.5, -1.5],
      armR: [-2.45, 0.2, -0.1, -0.45],
      legL: [-0.15, 0, 0.1, 0.15],
      legR: [0.55, 0, -0.1, 0.85],
    },
  },

  // 5. LIVER RIPPER BODY HOOK (Down + Punch)
  body_hook: {
    id: 'body_hook',
    name: 'LIVER BODY HOOK!',
    totalFrames: 18,
    activeStart: 5,
    activeEnd: 10,
    damage: 10.5,
    hitstun: 18,
    blockstun: 11,
    pushback: 0.09,
    launchY: 0,
    hitLocation: 'mid',
    activeLimb: 'handL',
    trailColor: 0xf97316,
    lungeVel: 0.14,
    windup: {
      hipY: 0.72,
      hipRotY: -0.55,
      torsoRotX: 0.38,
      torsoRotZ: -0.25,
      armL: [-0.35, 0.65, 0.45, -1.65],
      armR: [-0.85, -0.2, -0.2, -1.6],
      legL: [-0.75, 0, 0.15, 1.1],
      legR: [0.35, 0, -0.1, 0.75],
    },
    strike: {
      hipY: 0.74,
      hipZ: 0.22,
      hipRotY: 0.65,
      torsoRotX: 0.42,
      torsoRotY: 0.75,
      torsoRotZ: 0.18,
      armL: [-1.15, -0.55, -0.35, -0.85],
      armR: [-0.75, -0.3, -0.2, -1.65],
      legL: [-0.65, 0, 0.15, 0.95],
      legR: [0.55, 0, -0.1, 0.35],
    },
  },

  // 6. MUAY THAI TEEP SIDE THRUST KICK (Kick Tap 1)
  side_kick: {
    id: 'side_kick',
    name: 'THRUST SIDE KICK!',
    totalFrames: 19,
    activeStart: 6,
    activeEnd: 11,
    damage: 10.5,
    hitstun: 16,
    blockstun: 11,
    pushback: 0.24,
    launchY: 0.06,
    hitLocation: 'mid',
    activeLimb: 'bootR',
    trailColor: 0xff2a55,
    lungeVel: 0.14,
    windup: {
      hipY: 0.88,
      hipRotY: 0.35,
      torsoRotX: -0.18,
      armL: [-0.8, 0.3, 0.3, -1.4],
      armR: [-0.8, -0.3, -0.3, -1.4],
      legL: [-0.15, 0, 0, 0.25],
      legR: [-1.45, 0.15, -0.15, 1.85],
    },
    strike: {
      hipY: 0.89,
      hipZ: 0.2,
      hipRotY: -0.55,
      torsoRotX: -0.45,
      torsoRotZ: -0.25,
      armL: [-0.9, 0.4, 0.4, -1.3],
      armR: [-0.4, -0.6, -0.6, -0.8],
      legL: [0.1, 0, 0, 0.22],
      legR: [-1.52, -0.15, -0.1, 0.04],
    },
  },

  // 7. WHIP HIGH ROUNDHOUSE KICK (Kick Tap 2)
  roundhouse: {
    id: 'roundhouse',
    name: 'HIGH ROUNDHOUSE!',
    totalFrames: 24,
    activeStart: 7,
    activeEnd: 14,
    damage: 14.5,
    hitstun: 22,
    blockstun: 14,
    pushback: 0.26,
    launchY: 0.16,
    hitLocation: 'high',
    activeLimb: 'bootR',
    trailColor: 0xff0055,
    lungeVel: 0.18,
    windup: {
      hipY: 0.86,
      hipRotY: 0.75,
      torsoRotX: -0.15,
      torsoRotY: 0.65,
      armL: [-0.9, 0.3, 0.3, -1.4],
      armR: [-0.5, -0.4, -0.4, -1.2],
      legL: [-0.25, 0, 0.1, 0.4],
      legR: [-1.1, 0.65, -0.55, 1.65],
    },
    strike: {
      hipY: 0.9,
      hipZ: 0.24,
      hipRotY: -0.95,
      torsoRotX: -0.52,
      torsoRotY: -0.75,
      torsoRotZ: -0.42,
      armL: [-0.4, 0.7, 0.6, -0.9],
      armR: [-1.1, -0.2, -0.2, -1.4],
      legL: [0.15, 0, 0, 0.18],
      legR: [-1.72, -0.35, 0.35, 0.06],
    },
  },

  // 8. OVERHEAD THUNDER AXE KICK (Kick Tap 3 Guard-Crusher)
  axe_kick: {
    id: 'axe_kick',
    name: 'THUNDER AXE KICK!',
    totalFrames: 26,
    activeStart: 8,
    activeEnd: 15,
    damage: 16,
    hitstun: 25,
    blockstun: 16,
    pushback: 0.22,
    launchY: 0.2,
    hitLocation: 'high',
    activeLimb: 'bootR',
    trailColor: 0xf43f5e,
    lungeVel: 0.19,
    windup: {
      hipY: 0.92,
      hipRotY: 0.25,
      torsoRotX: -0.55,
      armL: [-0.7, 0.4, 0.4, -1.2],
      armR: [-0.7, -0.4, -0.4, -1.2],
      legL: [0.15, 0, 0, 0.2],
      legR: [-2.25, 0, 0, 0.1],
    },
    strike: {
      hipY: 0.82,
      hipZ: 0.26,
      hipRotY: -0.35,
      torsoRotX: 0.38,
      armL: [-0.3, 0.5, 0.5, -1.4],
      armR: [-0.3, -0.5, -0.5, -1.4],
      legL: [-0.35, 0, 0, 0.55],
      legR: [-1.25, 0, 0, 0.05],
    },
  },

  // 9. 360° CYBER DRAGON LOW SWEEP (Down + Kick)
  low_sweep: {
    id: 'low_sweep',
    name: 'DRAGON TAIL SWEEP!',
    totalFrames: 24,
    activeStart: 7,
    activeEnd: 14,
    damage: 11.5,
    hitstun: 26,
    blockstun: 15,
    pushback: 0.1,
    launchY: 0.18,
    hitLocation: 'low',
    activeLimb: 'bootR',
    trailColor: 0x10b981,
    lungeVel: 0.16,
    windup: {
      hipY: 0.52,
      hipRotY: 1.2,
      torsoRotX: 0.45,
      armL: [-0.5, 0.4, 0.4, -1.2],
      armR: [-0.5, -0.4, -0.4, -1.2],
      legL: [-1.15, 0, 0.2, 1.85],
      legR: [-0.35, 0.55, -0.45, 0.95],
    },
    strike: {
      hipY: 0.46,
      hipZ: 0.26,
      hipRotY: -1.45,
      torsoRotX: 0.55,
      torsoRotZ: -0.35,
      armL: [-0.3, 0.8, 0.7, -0.6],
      armR: [-0.8, -0.3, -0.3, -1.1],
      legL: [-1.25, 0, 0.2, 1.95],
      legR: [-1.15, -0.45, -0.65, 0.05],
    },
  },

  // 10. FLYING TIGER BICYCLE KNEE (Dash/Forward + Kick)
  flying_knee: {
    id: 'flying_knee',
    name: 'TIGER FLYING KNEE!',
    totalFrames: 22,
    activeStart: 5,
    activeEnd: 13,
    damage: 14.5,
    hitstun: 22,
    blockstun: 12,
    pushback: 0.2,
    launchY: 0.22,
    hitLocation: 'high',
    activeLimb: 'kneeR',
    trailColor: 0xa855f7,
    lungeVel: 0.25,
    windup: {
      hipY: 0.95,
      hipRotY: 0.2,
      torsoRotX: 0.2,
      armL: [-0.6, 0.3, 0.3, -1.4],
      armR: [-0.6, -0.3, -0.3, -1.4],
      legL: [0.3, 0, 0, 0.6],
      legR: [-0.8, 0, 0, 1.4],
    },
    strike: {
      hipY: 1.18,
      hipZ: 0.28,
      hipRotY: -0.45,
      torsoRotX: -0.25,
      torsoRotY: -0.45,
      armL: [-1.3, 0.3, 0.3, -1.6],
      armR: [-0.2, -0.6, -0.6, -1.1],
      legL: [0.65, 0, 0, 1.25],
      legR: [-1.85, -0.1, 0, 2.25],
    },
  },

  // 11. METEOR AIR DIVE KICK (Air + Punch/Kick)
  air_dive: {
    id: 'air_dive',
    name: 'METEOR DIVE KICK!',
    totalFrames: 20,
    activeStart: 4,
    activeEnd: 14,
    damage: 12.5,
    hitstun: 20,
    blockstun: 12,
    pushback: 0.16,
    launchY: 0.14,
    hitLocation: 'high',
    activeLimb: 'bootR',
    trailColor: 0x38bdf8,
    lungeVel: 0.22,
    windup: {
      hipY: 1.05,
      torsoRotX: -0.35,
      armL: [-0.8, 0.4, 0.4, -1.2],
      armR: [-0.8, -0.4, -0.4, -1.2],
      legL: [-0.9, 0, 0, 1.6],
      legR: [-1.2, 0, 0, 1.4],
    },
    strike: {
      hipY: 0.92,
      hipZ: 0.25,
      torsoRotX: -0.55,
      armL: [-0.3, 0.6, 0.6, -0.9],
      armR: [-0.3, -0.6, -0.6, -0.9],
      legL: [-1.1, 0, 0, 1.8],
      legR: [-0.95, 0, 0, 0.04],
    },
  },

  // 12. HOSTILE TAKEOVER COMMAND THROW / CLINCH KNEE SMASH
  command_grab: {
    id: 'command_grab',
    name: 'HOSTILE TAKEOVER!',
    totalFrames: 26,
    activeStart: 5,
    activeEnd: 12,
    damage: 18,
    hitstun: 28,
    blockstun: 0,
    pushback: 0.26,
    launchY: 0.24,
    hitLocation: 'throw',
    activeLimb: 'bothHands',
    trailColor: 0xffcc00,
    lungeVel: 0.18,
    windup: {
      hipY: 0.84,
      torsoRotX: 0.25,
      armL: [-1.5, -0.2, 0.1, -0.3],
      armR: [-1.5, 0.2, -0.1, -0.3],
      legL: [-0.4, 0, 0, 0.6],
      legR: [0.4, 0, 0, 0.6],
    },
    strike: {
      hipY: 0.92,
      hipZ: 0.22,
      torsoRotX: 0.48,
      armL: [-0.95, -0.3, 0.2, -1.65],
      armR: [-0.95, 0.3, -0.2, -1.65],
      legL: [0.1, 0, 0, 0.2],
      legR: [-1.95, 0, 0, 2.15],
    },
  },

  // 13. STEP-IN PLASMA PALM + PROJECTILE
  special_palm: {
    id: 'special_palm',
    name: 'PLASMA PALM SURGE!',
    totalFrames: 26,
    activeStart: 6,
    activeEnd: 13,
    damage: 13,
    hitstun: 20,
    blockstun: 12,
    pushback: 0.22,
    launchY: 0.12,
    hitLocation: 'mid',
    activeLimb: 'bothHands',
    trailColor: 0x00f3ff,
    lungeVel: 0.18,
    windup: {
      hipY: 0.78,
      hipRotY: 0.3,
      torsoRotX: 0.2,
      armL: [-0.4, 0.5, 0.4, -1.8],
      armR: [-0.4, -0.5, -0.4, -1.8],
      legL: [-0.6, 0, 0.15, 0.9],
      legR: [0.5, 0, -0.15, 0.5],
    },
    strike: {
      hipY: 0.82,
      hipZ: 0.24,
      hipRotY: 0,
      torsoRotX: 0.36,
      armL: [-1.55, -0.15, 0, -0.08],
      armR: [-1.55, 0.15, 0, -0.08],
      legL: [-0.7, 0, 0.15, 0.95],
      legR: [0.65, 0, -0.15, 0.18],
    },
  },

  // 14. SHORYU DRAGON UPPERCUT (QCF + Special)
  dragon_uppercut: {
    id: 'dragon_uppercut',
    name: 'DRAGON SHORYU!',
    totalFrames: 28,
    activeStart: 4,
    activeEnd: 14,
    damage: 17.5,
    hitstun: 28,
    blockstun: 15,
    pushback: 0.2,
    launchY: 0.32,
    hitLocation: 'high',
    activeLimb: 'handR',
    trailColor: 0xfacc15,
    lungeVel: 0.22,
    windup: {
      hipY: 0.62,
      hipRotY: 0.65,
      torsoRotX: 0.55,
      torsoRotY: 0.65,
      armL: [-0.5, 0.3, 0.3, -1.5],
      armR: [0.35, -0.4, -0.3, -1.9],
      legL: [-0.95, 0, 0.15, 1.45],
      legR: [0.5, 0, -0.15, 1.25],
    },
    strike: {
      hipY: 1.18,
      hipZ: 0.26,
      hipRotY: -0.95,
      torsoRotX: -0.35,
      torsoRotY: -1.05,
      armL: [-0.2, 0.6, 0.5, -1.4],
      armR: [-2.65, 0.2, -0.1, -0.25],
      legL: [0.25, 0, 0.1, 0.95],
      legR: [-1.45, 0, -0.1, 1.65],
    },
  },

  // 15. SOVEREIGN OVERDRIVE RUSH FINISHER
  ult_rush: {
    id: 'ult_rush',
    name: 'SOVEREIGN OVERDRIVE!',
    totalFrames: 36,
    activeStart: 8,
    activeEnd: 22,
    damage: 25,
    hitstun: 32,
    blockstun: 16,
    pushback: 0.32,
    launchY: 0.28,
    hitLocation: 'high',
    activeLimb: 'bootR',
    trailColor: 0xfacc15,
    lungeVel: 0.26,
    windup: {
      hipY: 0.72,
      hipRotY: 0.85,
      torsoRotX: 0.35,
      armL: [-0.8, 0.4, 0.4, -1.5],
      armR: [-0.8, -0.4, -0.4, -1.5],
      legL: [-0.8, 0, 0.15, 1.2],
      legR: [-1.1, 0.5, -0.4, 1.7],
    },
    strike: {
      hipY: 1.02,
      hipZ: 0.28,
      hipRotY: -1.15,
      torsoRotX: -0.48,
      torsoRotY: -0.85,
      torsoRotZ: -0.38,
      armL: [-0.4, 0.7, 0.6, -0.8],
      armR: [-1.5, 0.2, 0, -0.2],
      legL: [0.2, 0, 0, 0.2],
      legR: [-1.78, -0.3, 0.3, 0.05],
    },
  },

  // 16. AGI SINGULARITY BEAM FINISHER
  sovereign_beam: {
    id: 'sovereign_beam',
    name: 'WEIGHTS DELETED!',
    totalFrames: 38,
    activeStart: 7,
    activeEnd: 24,
    damage: 26,
    hitstun: 34,
    blockstun: 18,
    pushback: 0.35,
    launchY: 0.3,
    hitLocation: 'high',
    activeLimb: 'bothHands',
    trailColor: 0x00f3ff,
    lungeVel: 0.2,
    windup: {
      hipY: 0.74,
      torsoRotX: -0.25,
      armL: [-0.2, 0.75, 0.65, -1.85],
      armR: [-0.2, -0.75, -0.65, -1.85],
      legL: [-0.7, 0, 0.18, 1.1],
      legR: [0.6, 0, -0.18, 0.75],
    },
    strike: {
      hipY: 0.84,
      hipZ: 0.26,
      torsoRotX: 0.42,
      armL: [-1.58, -0.1, 0, -0.04],
      armR: [-1.58, 0.1, 0, -0.04],
      legL: [-0.78, 0, 0.18, 1.05],
      legR: [0.7, 0, -0.18, 0.15],
    },
  },
};

// Smoothly interpolate between two BonePose keyframes
export function applyBlendedPose(
  rig: ArticulatedFighterRig,
  poseA: BonePose,
  poseB: BonePose,
  alpha: number
) {
  const lerp = THREE.MathUtils.lerp;
  const t = THREE.MathUtils.clamp(alpha, 0, 1);

  rig.hips.position.y = lerp(poseA.hipY ?? 0.88, poseB.hipY ?? 0.88, t);
  rig.hips.position.z = lerp(poseA.hipZ ?? 0, poseB.hipZ ?? 0, t);
  rig.hips.rotation.set(
    lerp(poseA.hipRotX ?? 0, poseB.hipRotX ?? 0, t),
    lerp(poseA.hipRotY ?? 0, poseB.hipRotY ?? 0, t),
    lerp(poseA.hipRotZ ?? 0, poseB.hipRotZ ?? 0, t)
  );

  rig.torso.rotation.set(
    lerp(poseA.torsoRotX ?? 0, poseB.torsoRotX ?? 0, t),
    lerp(poseA.torsoRotY ?? 0, poseB.torsoRotY ?? 0, t),
    lerp(poseA.torsoRotZ ?? 0, poseB.torsoRotZ ?? 0, t)
  );

  rig.armL.rotation.set(
    lerp(poseA.armL[0], poseB.armL[0], t),
    lerp(poseA.armL[1], poseB.armL[1], t),
    lerp(poseA.armL[2], poseB.armL[2], t)
  );
  rig.forearmL.rotation.x = lerp(poseA.armL[3], poseB.armL[3], t);

  rig.armR.rotation.set(
    lerp(poseA.armR[0], poseB.armR[0], t),
    lerp(poseA.armR[1], poseB.armR[1], t),
    lerp(poseA.armR[2], poseB.armR[2], t)
  );
  rig.forearmR.rotation.x = lerp(poseA.armR[3], poseB.armR[3], t);

  rig.legL.rotation.set(
    lerp(poseA.legL[0], poseB.legL[0], t),
    lerp(poseA.legL[1], poseB.legL[1], t),
    lerp(poseA.legL[2], poseB.legL[2], t)
  );
  rig.shinL.rotation.x = lerp(poseA.legL[3], poseB.legL[3], t);

  rig.legR.rotation.set(
    lerp(poseA.legR[0], poseB.legR[0], t),
    lerp(poseA.legR[1], poseB.legR[1], t),
    lerp(poseA.legR[2], poseB.legR[2], t)
  );
  rig.shinR.rotation.x = lerp(poseA.legR[3], poseB.legR[3], t);
}

// ============================================================================
// TRUE 3D WORLD-SPACE BONE COLLISION CHECK (FIST/BOOT -> HEAD/TORSO/LEGS)
// ============================================================================
export function checkTrue3DBoneCollision(
  attackerRig: ArticulatedFighterRig,
  attackerX: number,
  defenderRig: ArticulatedFighterRig,
  defenderX: number,
  move: MoveDefinition
): { hit: boolean; contactPoint: THREE.Vector3 } {
  const strikeWorldPos = new THREE.Vector3();

  if (move.activeLimb === 'handL') {
    attackerRig.handL.getWorldPosition(strikeWorldPos);
  } else if (move.activeLimb === 'handR' || move.activeLimb === 'bothHands') {
    attackerRig.handR.getWorldPosition(strikeWorldPos);
  } else if (move.activeLimb === 'bootR') {
    attackerRig.bootR.getWorldPosition(strikeWorldPos);
  } else if (move.activeLimb === 'kneeR') {
    attackerRig.shinR.getWorldPosition(strikeWorldPos);
  } else {
    attackerRig.bootL.getWorldPosition(strikeWorldPos);
  }

  const headPos = new THREE.Vector3();
  const chestPos = new THREE.Vector3();
  const pelvisPos = new THREE.Vector3();
  defenderRig.head.getWorldPosition(headPos);
  defenderRig.torso.getWorldPosition(chestPos);
  chestPos.y += 0.35;
  defenderRig.hips.getWorldPosition(pelvisPos);

  const dHead = strikeWorldPos.distanceTo(headPos);
  const dChest = strikeWorldPos.distanceTo(chestPos);
  const dPelvis = strikeWorldPos.distanceTo(pelvisPos);
  const minDist = Math.min(dHead, dChest, dPelvis);

  const rootDist = Math.abs(attackerX - defenderX);

  if (minDist <= 0.64 || rootDist <= 1.08) {
    return {
      hit: true,
      contactPoint: strikeWorldPos.clone().lerp(dHead < dChest ? headPos : chestPos, 0.5),
    };
  }
  return { hit: false, contactPoint: strikeWorldPos };
}
