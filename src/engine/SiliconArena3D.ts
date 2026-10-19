import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ARENAS, ArenaConfig, FIGHTERS, FighterConfig } from '../data/roster';
import {
  ArticulatedFighterRig,
  buildArticulatedFighterRig,
  ExosuitFinishId,
  FounderAnatomicalDNA,
  getFounderDNA,
} from './FighterRig3D';
import {
  buildIconicTechStage,
  getFounderHomeStageId,
  getStageIdFromArenaId,
  LandmarkStageId,
  StageController,
} from './SiliconLandmarks3D';
import {
  applyBlendedPose,
  checkTrue3DBoneCollision,
  MARTIAL_MOVES,
  MoveDefinition,
  NEUTRAL_GUARD_POSE,
} from './SiliconCombatKinematics3D';
import { CyberAudioEngine } from './CyberAudio';

export type GameMode = 'story' | 'versus' | 'ai_vs_ai';
export type CameraAngleMode = 'broadcast' | 'low_cinema' | 'top_tactical' | 'closeup';
export type CombatInputType = 'light' | 'heavy' | 'grab' | 'special' | 'ultimate';

export interface FloatingPopup {
  id: number;
  text: string;
  subtext?: string;
  xPercent: number;
  yPercent: number;
  color: string;
}

export interface ProvocationBubble {
  id: number;
  speakerName: string;
  text: string;
  xPercent: number;
  yPercent: number;
  borderColor: string;
}

export interface FounderSpeechEvent {
  speakerName: string;
  company: string;
  latestModel: string;
  quote: string;
  isP1: boolean;
  accentColor: string;
}

export interface MatchEndSummary {
  p1Won: boolean;
  isCloseFight: boolean;
  winnerHp: number;
  p1Rounds: number;
  p2Rounds: number;
}

export interface CombatTelemetryState {
  p1Hp: number;
  p2Hp: number;
  p1Meter: number;
  p2Meter: number;
  p1Combo: number;
  p2Combo: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
  currentRound: number;
  timer: number;
  p1EmbargoTimer: number;
  p2EmbargoTimer: number;
  p1FreezeTimer: number;
  p2FreezeTimer: number;
  p1BuffTimer: number;
  p2BuffTimer: number;
  p1StealthTimer: number;
  p2StealthTimer: number;
  bannerText: string | null;
  bannerSub: string | null;
  activeSpeech: FounderSpeechEvent | null;
  activeBubble?: ProvocationBubble | null;
  aiReadout?: string;
  stageId?: LandmarkStageId;
  stageName?: string;
  stageSubtitle?: string;
  popups: FloatingPopup[];
}

interface ActiveProjectile {
  mesh: THREE.Object3D;
  owner: FighterActor;
  target: FighterActor;
  vx: number;
  vy: number;
  damage: number;
  unblockable: boolean;
  effectType: string;
  life: number;
}

interface SparkParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface ShockwaveRing {
  mesh: THREE.Mesh;
  scaleSpeed: number;
  life: number;
  maxLife: number;
}

export interface VirtualPadState {
  left: boolean;
  right: boolean;
  jump: boolean;
  block: boolean;
}

function dampRot(
  euler: THREE.Euler,
  tx: number,
  ty: number,
  tz: number,
  lambda: number,
  dt: number
) {
  euler.x = THREE.MathUtils.damp(euler.x, tx, lambda, dt);
  euler.y = THREE.MathUtils.damp(euler.y, ty, lambda, dt);
  euler.z = THREE.MathUtils.damp(euler.z, tz, lambda, dt);
}

class FighterActor {
  public isP1: boolean;
  public cfg: FighterConfig;
  public dna: FounderAnatomicalDNA;
  public isAI: boolean;
  public rig: ArticulatedFighterRig;

  public x: number;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public facing: number;

  public hp: number = 100;
  public meter: number = 50;
  public state: 'idle' | 'move' | 'attack' | 'hit' | 'ko' | 'dash' = 'idle';
  public attackType: CombatInputType | null = null;
  public currentMove: MoveDefinition | null = null;
  public comboStep: number = 0;
  public hitType: 'high' | 'mid' | 'low' | 'launch' = 'high';
  public wallSplatted: boolean = false;
  public frame: number = 0;
  public stateTimer: number = 0;
  public maxStateTimer: number = 16;
  public hitConnected: boolean = false;
  public cancelBuffer: CombatInputType | null = null;
  public blocking: boolean = false;
  public comboCount: number = 0;
  public comboResetTimer: number = 0;
  public aiCooldown: number = 0;

  public freezeTimer: number = 0;
  public embargoTimer: number = 0;
  public buffTimer: number = 0;
  public stealthTimer: number = 0;
  public counterShieldActive: boolean = false;
  public hitFlashTimer: number = 0;
  public quoteIndex: number = 0;
  public walkPhase: number = 0;
  public dirBuffer: { dir: 'L' | 'R' | 'D'; time: number }[] = [];

  constructor(
    isP1: boolean,
    cfg: FighterConfig,
    isAI: boolean,
    scene: THREE.Scene,
    exosuitFinish: ExosuitFinishId = 'standard'
  ) {
    this.isP1 = isP1;
    this.cfg = cfg;
    this.dna = getFounderDNA(cfg);
    this.isAI = isAI;
    this.x = isP1 ? -1.85 : 1.85;
    this.facing = isP1 ? 1 : -1;

    this.rig = buildArticulatedFighterRig(cfg, exosuitFinish);
    this.rig.root.position.set(this.x, 0, 0);
    this.rig.root.rotation.y = this.facing * (Math.PI * 0.34);
    scene.add(this.rig.root);
  }

  public recordDirection(dir: 'L' | 'R' | 'D') {
    const now = performance.now();
    this.dirBuffer.push({ dir, time: now });
    if (this.dirBuffer.length > 8) this.dirBuffer.shift();
  }

  public hasQuarterCircleMotion(): boolean {
    const now = performance.now();
    const recent = this.dirBuffer.filter((d) => now - d.time < 550);
    if (recent.length < 2) return false;
    const hasDown = recent.some((d) => d.dir === 'D');
    const forwardDir = this.facing === 1 ? 'R' : 'L';
    const hasForward = recent.some((d) => d.dir === forwardDir);
    return hasDown && hasForward;
  }

  public triggerHitFlash() {
    this.hitFlashTimer = 3;
    this.rig.hitFlashMaterials.forEach((mat) => {
      mat.emissive.setHex(0x334155);
      mat.emissiveIntensity = 0.16;
    });
  }

  public clearHitFlash() {
    this.rig.hitFlashMaterials.forEach((mat) => {
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
    });
  }

  public destroy(scene: THREE.Scene) {
    scene.remove(this.rig.root);
  }
}

export class SiliconArenaEngine {
  private container: HTMLElement;
  private audio: CyberAudioEngine;
  private onTelemetry: (t: CombatTelemetryState) => void;
  private onMatchEnd: (summary: MatchEndSummary) => void;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;

  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.PointLight;
  private stageController: StageController | null = null;
  public currentStageId: LandmarkStageId = 'starbase';

  private p1: FighterActor | null = null;
  private p2: FighterActor | null = null;
  private fatalityGroup: THREE.Group | null = null;
  public p1Exosuit: ExosuitFinishId = 'standard';
  public territoryDamageMultiplier: number = 1.0;
  public territoryMeterBonus: number = 0;
  private projectiles: ActiveProjectile[] = [];
  private sparks: SparkParticle[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private popups: FloatingPopup[] = [];
  private popupSeq: number = 1;

  private keys: Record<string, boolean> = {};
  private vPad: VirtualPadState = { left: false, right: false, jump: false, block: false };

  public combatActive: boolean = false;
  public gameMode: GameMode = 'story';
  public cameraMode: CameraAngleMode = 'broadcast';
  public currentArena: ArenaConfig = ARENAS[0];

  private matchTimer: number = 99;
  private p1RoundsWon: number = 0;
  private p2RoundsWon: number = 0;
  private currentRound: number = 1;

  private timerInterval: number | null = null;
  private hazardCooldown: number = 480;
  private philosophyBanterCooldown: number = 220;
  private hitStopFrames: number = 0;
  private slowMoFrames: number = 0;
  private shakeIntensity: number = 0;

  private bannerText: string | null = null;
  private bannerSub: string | null = null;
  private activeSpeech: FounderSpeechEvent | null = null;
  private activeBubble: ProvocationBubble | null = null;
  private aiReadout: string = '16-MOVE MATRIX & 3D BONE COLLISION ACTIVE';
  private speechTimeout: number | null = null;
  private bubbleTimeout: number | null = null;

  private camLookTarget = new THREE.Vector3(0, 1.35, 0);
  private clock = new THREE.Clock();
  private animFrameId: number = 0;

  constructor(
    container: HTMLElement,
    audio: CyberAudioEngine,
    onTelemetry: (t: CombatTelemetryState) => void,
    onMatchEnd: (summary: MatchEndSummary) => void
  ) {
    this.container = container;
    this.audio = audio;
    this.onTelemetry = onTelemetry;
    this.onMatchEnd = onMatchEnd;

    this.initThree();
    this.buildArenaEnvironment();
    this.bindEvents();
    this.spawnShowcaseFighters(FIGHTERS[0], FIGHTERS[2]);
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentArena.fogColor);
    this.scene.fog = new THREE.FogExp2(this.currentArena.fogColor, 0.025);

    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 150);
    this.camera.position.set(0, 1.65, 5.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.38, 0.35, 0.85);
    this.composer.addPass(this.bloomPass);

    // Balanced Studio 3-Point Lighting (Anti-Washout Calibrated for 3D Multi-Part Faces)
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    this.scene.add(hemi);

    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 1.15);
    this.keyLight.position.set(3, 8, 6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    this.fillLight.position.set(-6, 4, 5);
    this.scene.add(this.fillLight);

    const rimCyan = new THREE.PointLight(0x00f3ff, 2.6, 14);
    rimCyan.position.set(-4, 3, -2.5);
    this.scene.add(rimCyan);

    this.rimLight = new THREE.PointLight(this.currentArena.rimColor, 2.6, 14);
    this.rimLight.position.set(4, 3, -2.5);
    this.scene.add(this.rimLight);
  }

  private buildArenaEnvironment() {
    if (this.stageController) {
      this.stageController.destroy(this.scene);
    }
    this.stageController = buildIconicTechStage(this.scene, this.currentStageId);
  }

  public setStage(stageId: LandmarkStageId) {
    this.currentStageId = stageId;
    this.buildArenaEnvironment();
    this.emitTelemetry();
  }

  public setArena(arena: ArenaConfig) {
    this.currentArena = arena;
    this.scene.background = new THREE.Color(arena.fogColor);
    this.scene.fog = new THREE.FogExp2(arena.fogColor, 0.025);
    this.rimLight.color.setHex(arena.rimColor);
    const stageId = getStageIdFromArenaId(arena.id);
    this.setStage(stageId);
  }

  public setCameraMode(mode: CameraAngleMode) {
    this.cameraMode = mode;
  }

  public setVirtualInput(key: keyof VirtualPadState, active: boolean) {
    this.vPad[key] = active;
    if (active && this.p1 && this.combatActive) {
      if (key === 'left') this.p1.recordDirection('L');
      if (key === 'right') this.p1.recordDirection('R');
      if (key === 'block') this.p1.recordDirection('D');
    }
  }

  public spawnProvocationBubble(_actor: FighterActor, _customInsult?: string) {
    // Talking blocks and speech bubbles removed for clean broadcast display
  }

  public triggerFounderSpeech(actor: FighterActor, customQuote?: string) {
    const quotes = actor.cfg.philosophyQuotes;
    const text =
      customQuote ||
      quotes[actor.quoteIndex % quotes.length] ||
      actor.cfg.quote;
    actor.quoteIndex += 1;
    // Speak audio only — no on-screen talking blocks or subtitle boxes
    this.activeSpeech = null;
    this.audio.speakFounderQuote(text, actor.cfg.voicePitch, actor.cfg.voiceRate);
  }

  public setExosuitFinish(finish: ExosuitFinishId) {
    this.p1Exosuit = finish;
    this.refreshFightersAppearance();
  }

  public setTerritoryBuffs(damageMult: number, startingMeterBonus: number) {
    this.territoryDamageMultiplier = damageMult;
    this.territoryMeterBonus = startingMeterBonus;
  }

  public refreshFightersAppearance() {
    if (!this.p1 || !this.p2) return;
    const c1 = this.p1.cfg;
    const c2 = this.p2.cfg;
    const p1X = this.p1.x;
    const p2X = this.p2.x;
    const p1Hp = this.p1.hp;
    const p2Hp = this.p2.hp;
    const p1Meter = this.p1.meter;
    const p2Meter = this.p2.meter;

    this.p1.destroy(this.scene);
    this.p2.destroy(this.scene);

    const p1IsAI = this.combatActive && this.gameMode === 'ai_vs_ai';
    const p2IsAI = !this.combatActive || this.gameMode !== 'versus';

    this.p1 = new FighterActor(true, c1, p1IsAI, this.scene, this.p1Exosuit);
    this.p2 = new FighterActor(false, c2, p2IsAI, this.scene, 'standard');
    this.p1.x = p1X;
    this.p2.x = p2X;
    this.p1.hp = p1Hp;
    this.p2.hp = p2Hp;
    this.p1.meter = p1Meter;
    this.p2.meter = p2Meter;
  }

  public triggerCinematicImpact(isHeavy: boolean) {
    this.shakeIntensity = isHeavy ? 0.32 : 0.14;
    this.hitStopFrames = isHeavy ? 7 : 4;
    this.renderer.toneMappingExposure = isHeavy ? 1.52 : 1.22;
    window.setTimeout(() => {
      if (this.renderer) this.renderer.toneMappingExposure = 1.05;
    }, 80);
  }

  public spawnShowcaseFighters(c1: FighterConfig, c2: FighterConfig) {
    this.combatActive = false;
    this.clearEntities();
    this.p1 = new FighterActor(true, c1, false, this.scene, this.p1Exosuit);
    this.p2 = new FighterActor(false, c2, true, this.scene, 'standard');
    this.emitTelemetry();
  }

  public startMatch(c1: FighterConfig, c2: FighterConfig, mode: GameMode) {
    this.audio.init();
    this.gameMode = mode;
    this.p1RoundsWon = 0;
    this.p2RoundsWon = 0;
    this.currentRound = 1;
    if (mode === 'story') {
      this.setStage(getFounderHomeStageId(c2.id));
    }
    this.startRound(c1, c2);
  }

  private startRound(c1: FighterConfig, c2: FighterConfig) {
    this.clearEntities();
    const p1IsAI = this.gameMode === 'ai_vs_ai';
    const p2IsAI = this.gameMode !== 'versus';

    this.p1 = new FighterActor(true, c1, p1IsAI, this.scene, this.p1Exosuit);
    this.p2 = new FighterActor(false, c2, p2IsAI, this.scene, 'standard');
    this.p1.meter = Math.min(100, 50 + this.territoryMeterBonus);

    this.matchTimer = 99;
    this.hazardCooldown = 440;
    this.philosophyBanterCooldown = 200;
    this.combatActive = true;

    this.audio.playRoundStart();
    // Fenrir Deep Male Announcer Round Call
    this.audio.speakAnnouncer(`Round ${this.currentRound}. ${c1.name} versus ${c2.name}. Fight!`);
    this.spawnProvocationBubble(this.currentRound % 2 === 1 ? this.p1 : this.p2);

    this.emitTelemetry();

    if (this.timerInterval) window.clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (!this.combatActive || !this.p1 || !this.p2) return;
      this.matchTimer = Math.max(0, this.matchTimer - 1);
      this.emitTelemetry();
      if (this.matchTimer <= 0) {
        this.resolveRoundOver(this.p1.hp >= this.p2.hp);
      }
    }, 1000);
  }

  public stopMatch() {
    this.combatActive = false;
    this.audio.stopSpeech();
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.speechTimeout) {
      window.clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (this.bubbleTimeout) {
      window.clearTimeout(this.bubbleTimeout);
      this.bubbleTimeout = null;
    }
    this.vPad = { left: false, right: false, jump: false, block: false };
  }

  private clearEntities() {
    if (this.p1) this.p1.destroy(this.scene);
    if (this.p2) this.p2.destroy(this.scene);
    if (this.fatalityGroup) {
      this.scene.remove(this.fatalityGroup);
      this.fatalityGroup = null;
    }
    this.projectiles.forEach((p) => {
      this.scene.remove(p.mesh);
    });
    this.sparks.forEach((s) => this.scene.remove(s.mesh));
    this.shockwaves.forEach((w) => this.scene.remove(w.mesh));
    this.projectiles = [];
    this.sparks = [];
    this.shockwaves = [];
    this.popups = [];
    this.activeBubble = null;
  }

  private addPopup(
    text: string,
    subtext: string | undefined,
    worldX: number,
    worldY: number,
    color: string
  ) {
    const vec = new THREE.Vector3(worldX, worldY, 0);
    vec.project(this.camera);
    const xPercent = Math.min(86, Math.max(14, ((vec.x + 1) / 2) * 100));
    const yPercent = Math.min(76, Math.max(22, ((-vec.y + 1) / 2) * 100));

    const id = this.popupSeq++;
    this.popups.push({ id, text, subtext, xPercent, yPercent, color });
    if (this.popups.length > 5) this.popups.shift();
    this.emitTelemetry();

    window.setTimeout(() => {
      this.popups = this.popups.filter((p) => p.id !== id);
      this.emitTelemetry();
    }, 680);
  }

  private spawnShockwave(x: number, y: number, color: number, maxScale = 2.2) {
    const geo = new THREE.TorusGeometry(0.28, 0.025, 10, 32);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.88,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);
    mesh.rotation.y = Math.PI / 2;
    this.scene.add(mesh);
    this.shockwaves.push({
      mesh,
      scaleSpeed: maxScale * 0.11,
      life: 16,
      maxLife: 16,
    });
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const code = e.code;
    this.keys[code] = true;

    if (!this.combatActive || !this.p1 || !this.p2) return;

    if (!this.p1.isAI) {
      if (code === 'KeyA') this.p1.recordDirection('L');
      if (code === 'KeyD') this.p1.recordDirection('R');
      if (code === 'KeyS') this.p1.recordDirection('D');

      if (code === 'KeyE' || code === 'ShiftLeft' || code === 'ShiftRight') {
        this.triggerDash(this.p1);
      }
      if (code === 'KeyF') this.startMove(this.p1, this.p2, 'light');
      if (code === 'KeyG') this.startMove(this.p1, this.p2, 'heavy');
      if (code === 'KeyT') this.startMove(this.p1, this.p2, 'grab');
      if (code === 'KeyH') this.startMove(this.p1, this.p2, 'special');
      if (code === 'KeyR') this.startMove(this.p1, this.p2, 'ultimate');
    }

    if (!this.p2.isAI) {
      if (code === 'ArrowLeft') this.p2.recordDirection('L');
      if (code === 'ArrowRight') this.p2.recordDirection('R');
      if (code === 'ArrowDown') this.p2.recordDirection('D');

      if (code === 'Slash') this.triggerDash(this.p2);
      if (code === 'KeyJ') this.startMove(this.p2, this.p1, 'light');
      if (code === 'KeyK') this.startMove(this.p2, this.p1, 'heavy');
      if (code === 'KeyU') this.startMove(this.p2, this.p1, 'grab');
      if (code === 'KeyL') this.startMove(this.p2, this.p1, 'special');
      if (code === 'KeyP') this.startMove(this.p2, this.p1, 'ultimate');
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public triggerDash(actor?: FighterActor) {
    const targetActor = actor || this.p1;
    if (!this.combatActive || !targetActor || targetActor.isAI) return;
    if (targetActor.state !== 'idle' && targetActor.state !== 'move') return;
    if (targetActor.freezeTimer > 0) return;

    targetActor.state = 'dash';
    targetActor.frame = 0;
    targetActor.stateTimer = 12;
    targetActor.maxStateTimer = 12;
    targetActor.vx = targetActor.facing * 0.28;
    this.audio.playDash();
    this.spawnSparks(targetActor.x, targetActor.y + 0.9, targetActor.cfg.neonColor, 10);
  }

  public triggerUIAction(
    type: 'light' | 'heavy' | 'grab' | 'special' | 'ultimate' | 'qcf' | 'dash'
  ) {
    if (!this.combatActive || !this.p1 || !this.p2 || this.p1.isAI) return;
    if (type === 'dash') {
      this.triggerDash(this.p1);
      return;
    }
    if (type === 'qcf') {
      this.p1.recordDirection('D');
      this.p1.recordDirection(this.p1.facing === 1 ? 'R' : 'L');
      this.startMove(this.p1, this.p2, 'special');
      return;
    }
    this.startMove(this.p1, this.p2, type);
  }

  // ============================================================================
  // 16-MOVE MASTER MARTIAL ARTS RESOLVER & CHAIN-CANCEL ENGINE
  // ============================================================================
  private resolveMartialMove(
    attacker: FighterActor,
    type: CombatInputType
  ): MoveDefinition {
    const isDown = attacker.isP1
      ? Boolean(this.keys['KeyS'] || this.vPad.block)
      : Boolean(this.keys['ArrowDown']);
    const isForward = attacker.isP1
      ? Boolean(
          (attacker.facing === 1 && (this.keys['KeyD'] || this.vPad.right)) ||
            (attacker.facing === -1 && (this.keys['KeyA'] || this.vPad.left))
        )
      : Boolean(
          (attacker.facing === 1 && this.keys['ArrowRight']) ||
            (attacker.facing === -1 && this.keys['ArrowLeft'])
        );

    if (type === 'grab') {
      return MARTIAL_MOVES.command_grab;
    }
    if (type === 'special') {
      return attacker.hasQuarterCircleMotion()
        ? MARTIAL_MOVES.dragon_uppercut
        : MARTIAL_MOVES.special_palm;
    }
    if (type === 'ultimate') {
      return attacker.comboStep % 2 === 0
        ? MARTIAL_MOVES.ult_rush
        : MARTIAL_MOVES.sovereign_beam;
    }

    // Airborne Meteor Dive Kick
    if (attacker.y > 0.14) {
      return MARTIAL_MOVES.air_dive;
    }

    if (type === 'light') {
      if (isDown) {
        return MARTIAL_MOVES.body_hook;
      }
      // 4-Hit Master Boxing Target Combo: Snap Jab -> Torque Cross -> Spinning Backfist -> Tiger Uppercut
      const step = attacker.comboStep % 4;
      attacker.comboStep = (attacker.comboStep + 1) % 4;
      if (step === 0) return MARTIAL_MOVES.jab;
      if (step === 1) return MARTIAL_MOVES.cross;
      if (step === 2) return MARTIAL_MOVES.spinning_backfist;
      return MARTIAL_MOVES.uppercut;
    }

    // Heavy Kick Command Moves
    if (isDown) {
      return MARTIAL_MOVES.low_sweep;
    }
    if (attacker.state === 'dash' || isForward) {
      return MARTIAL_MOVES.flying_knee;
    }
    // 3-Hit Master Kick Target Combo: Muay Thai Side Kick -> High Roundhouse -> Thunder Axe Kick
    const kStep = attacker.comboStep % 3;
    attacker.comboStep = (attacker.comboStep + 1) % 3;
    if (kStep === 0) return MARTIAL_MOVES.side_kick;
    if (kStep === 1) return MARTIAL_MOVES.roundhouse;
    return MARTIAL_MOVES.axe_kick;
  }

  private startMove(
    attacker: FighterActor,
    defender: FighterActor,
    type: CombatInputType
  ) {
    if (attacker.state === 'hit' || attacker.state === 'ko' || attacker.freezeTimer > 0) return;

    // Expanded Target Combo Chain Cancel Window
    if (attacker.state === 'attack') {
      if (attacker.frame >= 3) {
        attacker.cancelBuffer = type;
      }
      return;
    }

    this.performAttack(attacker, defender, type);
  }

  private performAttack(
    attacker: FighterActor,
    defender: FighterActor,
    type: CombatInputType
  ) {
    if (attacker.freezeTimer > 0) return;

    if (type === 'special' && attacker.embargoTimer > 0) {
      this.addPopup('EMBARGOED!', 'TSMC LOCK', attacker.x, attacker.y + 1.9, '#ef4444');
      return;
    }

    if (type === 'ultimate' && attacker.meter < 50) {
      type = 'special';
    }

    const move = this.resolveMartialMove(attacker, type);

    attacker.state = 'attack';
    attacker.attackType = type;
    attacker.currentMove = move;
    attacker.frame = 0;
    attacker.stateTimer = move.totalFrames;
    attacker.maxStateTimer = move.totalFrames;
    attacker.hitConnected = false;
    attacker.cancelBuffer = null;
    attacker.blocking = false;
    attacker.facing = defender.x >= attacker.x ? 1 : -1;
    attacker.vx = attacker.facing * Math.max(0.18, move.lungeVel);

    if (type === 'light' || type === 'grab') {
      this.audio.playHit(false);
    } else if (type === 'heavy') {
      this.audio.playHit(true);
    } else if (type === 'special') {
      this.audio.playSpecial();
      if (Math.random() < 0.35) {
        this.spawnProvocationBubble(attacker);
      }
      const qcfBonus = attacker.hasQuarterCircleMotion() ? 1.18 : 1.0;
      this.executeAttackPayload(attacker, defender, 'special', qcfBonus);
    } else if (type === 'ultimate') {
      attacker.meter = Math.max(0, attacker.meter - 50);
      this.slowMoFrames = 14;
      this.shakeIntensity = 0.28;
      this.stageController?.triggerHazard(1.0);
      this.audio.playUltimate();
      this.spawnProvocationBubble(attacker);
      this.audio.speakAnnouncer(`${attacker.cfg.name} unleashes ${attacker.cfg.ultimateName}!`);
      this.spawnSparks(attacker.x, attacker.y + 1.35, attacker.cfg.neonColor, 26);
      this.spawnShockwave(attacker.x, attacker.y + 1.1, attacker.cfg.neonColor, 3.2);
      this.addPopup(
        'WEIGHTS DELETED!',
        attacker.cfg.ultimateName,
        attacker.x,
        attacker.y + 2.0,
        '#facc15'
      );
      this.executeAttackPayload(attacker, defender, 'ultimate', 1.0);
    }
  }

  private executeAttackPayload(
    attacker: FighterActor,
    defender: FighterActor,
    type: 'special' | 'ultimate',
    qcfBonus: number
  ) {
    const powMult =
      (attacker.cfg.power / 88) * (attacker.buffTimer > 0 ? 1.25 : 1.0) * qcfBonus;

    if (type === 'special') {
      const eff = attacker.cfg.specialEffect;
      if (eff === 'counter_shield') {
        attacker.counterShieldActive = true;
        attacker.rig.shieldMesh.material.opacity = 0.45;
        this.addPopup(
          'CONSTITUTIONAL SHIELD!',
          'COUNTER ACTIVE',
          attacker.x,
          attacker.y + 1.9,
          '#d97757'
        );
        window.setTimeout(() => {
          attacker.counterShieldActive = false;
          attacker.rig.shieldMesh.material.opacity = 0;
        }, 1200);
        return;
      }

      if (eff === 'stealth_vanish') {
        attacker.stealthTimer = 180;
        attacker.x = Math.max(-4.2, Math.min(4.2, defender.x - defender.facing * 1.1));
        this.spawnSparks(attacker.x, attacker.y + 1.2, 0xfef08a, 22);
        this.addPopup('GHOST VANISH!', 'BACKSTAB', attacker.x, attacker.y + 1.9, '#fef08a');
        return;
      }

      if (eff === 'momentum_buff' || eff === 'speed_stack') {
        attacker.buffTimer = 240;
        attacker.vx = attacker.facing * 0.24;
        this.spawnSparks(attacker.x, attacker.y + 1.2, attacker.cfg.neonColor, 20);
        this.addPopup(
          eff === 'momentum_buff' ? 'YC SEED SURGE!' : 'RLHF OVERCLOCK!',
          '+25% OUTPUT',
          attacker.x,
          attacker.y + 1.9,
          '#f97316'
        );
        return;
      }

      if (eff === 'armored_dash' || eff === 'heavy_suplex' || eff === 'command_grab') {
        attacker.vx = attacker.facing * 0.28;
        return;
      }

      if (eff === 'unblockable_cut' || eff === 'meter_drain') {
        attacker.vx = attacker.facing * 0.22;
        if (eff === 'meter_drain' && Math.abs(attacker.x - defender.x) < 2.2) {
          defender.meter = Math.max(0, defender.meter - 30);
          attacker.meter = Math.min(100, attacker.meter + 25);
          this.addPopup('LICENSE AUDIT!', '-30% METER', defender.x, defender.y + 1.9, '#ef4444');
        }
        return;
      }

      this.spawnSpecialProjectile(attacker, defender, 12 * powMult, qcfBonus > 1.0);
      return;
    }

    if (type === 'ultimate') {
      const ult = attacker.cfg.ultimateEffect;
      if (ult === 'move_37_teleport') {
        attacker.x = Math.max(-4.2, Math.min(4.2, defender.x - defender.facing * 1.1));
        this.spawnSparks(attacker.x, 1.25, attacker.cfg.neonColor, 34);
        this.applyDamage(attacker, defender, 26 * powMult, true, MARTIAL_MOVES.ult_rush);
        return;
      }
      if (ult === 'bsod_freeze') {
        defender.freezeTimer = 210;
        this.addPopup('0x000000BSOD!', 'SYSTEM HALTED', defender.x, defender.y + 2.0, '#38bdf8');
        this.applyDamage(attacker, defender, 24 * powMult, true, MARTIAL_MOVES.ult_rush);
        return;
      }
      if (ult === 'silicon_embargo') {
        defender.embargoTimer = 320;
        this.addPopup(
          'SILICON EMBARGO!',
          'SPECIALS LOCKED',
          defender.x,
          defender.y + 2.0,
          '#f59e0b'
        );
        this.applyDamage(attacker, defender, 25 * powMult, true, MARTIAL_MOVES.ult_rush);
        return;
      }
      if (ult === 'pivot_health_swap') {
        if (defender.hp > attacker.hp) {
          const diff = (defender.hp - attacker.hp) * 0.45;
          attacker.hp = Math.min(100, attacker.hp + diff);
          defender.hp = Math.max(5, defender.hp - diff);
          this.addPopup(
            'DEMO DAY PIVOT!',
            'EQUITY REBALANCED',
            attacker.x,
            attacker.y + 2.0,
            '#f97316'
          );
        } else {
          this.applyDamage(attacker, defender, 26 * powMult, true, MARTIAL_MOVES.ult_rush);
        }
        this.emitTelemetry();
        return;
      }
      if (ult === 'royalty_leech') {
        const leech = 22 * powMult;
        attacker.hp = Math.min(100, attacker.hp + leech * 0.6);
        this.addPopup(
          'ROYALTY STREAM!',
          `+${Math.round(leech * 0.6)} HP`,
          attacker.x,
          attacker.y + 2.0,
          '#22c55e'
        );
        this.applyDamage(attacker, defender, leech, true, MARTIAL_MOVES.ult_rush);
        return;
      }
      if (ult === 'sudo_rm_rf') {
        defender.blocking = false;
        this.addPopup('SUDO RM -RF /!', 'GUARD DELETED', defender.x, defender.y + 2.0, '#facc15');
        this.applyDamage(attacker, defender, 28 * powMult, true, MARTIAL_MOVES.ult_rush);
        return;
      }

      this.spawnUltimateBeam(attacker, defender, 24 * powMult);
      return;
    }
  }

  private spawnSpecialProjectile(
    attacker: FighterActor,
    defender: FighterActor,
    damage: number,
    isMotionBoosted: boolean
  ) {
    const eff = attacker.cfg.specialEffect;
    const color = attacker.cfg.neonColor;
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: eff !== 'multi_wafer',
    });

    let mesh: THREE.Object3D;
    if (eff === 'multi_wafer') {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 24), mat);
      mesh.rotation.z = Math.PI / 4;
    } else if (eff === 'stun_wave') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.12), mat);
    } else if (eff === 'bass_sweep') {
      mesh = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 12, 24), mat);
    } else {
      mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 1), mat);
    }

    const startX = attacker.x + attacker.facing * 0.65;
    const startY = attacker.y + 1.15;
    mesh.position.set(startX, startY, 0);
    this.scene.add(mesh);

    const speed = eff === 'fast_beam' ? 0.32 : 0.24;
    this.projectiles.push({
      mesh,
      owner: attacker,
      target: defender,
      vx: attacker.facing * speed,
      vy: 0,
      damage,
      unblockable: isMotionBoosted,
      effectType: eff,
      life: 75,
    });

    if (isMotionBoosted) {
      this.addPopup('★ MOTION INPUT!', '+18% POWER', attacker.x, attacker.y + 1.9, '#facc15');
    }
  }

  private spawnUltimateBeam(attacker: FighterActor, defender: FighterActor, damage: number) {
    const beamGeo = new THREE.CylinderGeometry(0.28, 0.28, 12, 20);
    const beamMat = new THREE.MeshBasicMaterial({
      color: attacker.cfg.neonColor,
      transparent: true,
      opacity: 0.8,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(attacker.x + attacker.facing * 6.0, attacker.y + 1.18, 0);
    this.scene.add(beam);

    window.setTimeout(() => this.scene.remove(beam), 320);

    const correctSide =
      (attacker.facing === 1 && defender.x > attacker.x) ||
      (attacker.facing === -1 && defender.x < attacker.x);
    if (correctSide) {
      this.applyDamage(attacker, defender, damage, true, MARTIAL_MOVES.sovereign_beam);
    }
  }

  private applyDamage(
    attacker: FighterActor,
    defender: FighterActor,
    rawDamage: number,
    unblockable: boolean,
    move?: MoveDefinition,
    contactPoint?: THREE.Vector3
  ) {
    if (!this.combatActive) return;

    if (defender.counterShieldActive) {
      defender.counterShieldActive = false;
      defender.rig.shieldMesh.material.opacity = 0;
      this.audio.playSpecial();
      this.addPopup(
        'CONSTITUTIONAL COUNTER!',
        'REFLECTED',
        defender.x,
        defender.y + 1.9,
        '#d97757'
      );
      this.applyDamage(defender, attacker, rawDamage * 1.25, true);
      return;
    }

    const isCounterHit = defender.state === 'attack';
    const isHeavy = rawDamage >= 11 || Boolean(move && move.launchY > 0.12);
    const defMitigation = 1 - (defender.cfg.defense - 70) * 0.004;
    let finalDmg = rawDamage * defMitigation * (isCounterHit ? 1.25 : 1.0);

    const isGrabThrow = move?.hitLocation === 'throw';

    if (defender.blocking && !unblockable && !isGrabThrow && !isCounterHit) {
      finalDmg *= 0.2;
      defender.state = 'hit';
      defender.stateTimer = move ? move.blockstun : 9;
      defender.maxStateTimer = defender.stateTimer;
      defender.vx = attacker.facing * (move ? move.pushback * 0.7 : 0.11);
      this.hitStopFrames = 3;
      this.audio.playBlock();
      this.spawnSparks(defender.x, defender.y + 1.2, 0x00f3ff, 12);
      this.addPopup(
        'GUARDED!',
        `-${Math.round(finalDmg)}`,
        defender.x,
        defender.y + 1.8,
        '#00f3ff'
      );
    } else {
      defender.state = 'hit';
      defender.wallSplatted = false;
      defender.stateTimer = move ? move.hitstun : isHeavy ? 18 : 12;
      defender.maxStateTimer = defender.stateTimer;
      defender.vx = attacker.facing * (move ? move.pushback : isHeavy ? 0.21 : 0.12);

      // Set Anatomical Hit-Reaction Pose based on move hit location & launch
      if (move && move.launchY > 0.12) {
        defender.vy = move.launchY;
        defender.hitType = 'launch';
      } else if (move?.hitLocation === 'low') {
        defender.vy = 0.12;
        defender.hitType = 'low';
      } else if (move?.hitLocation === 'mid') {
        defender.hitType = 'mid';
      } else {
        defender.hitType = 'high';
        if (isHeavy) defender.vy = 0.14;
      }

      defender.triggerHitFlash();
      attacker.comboCount += 1;
      attacker.comboResetTimer = 115;

      // Authentic Street Fighter Hitstop Freeze, Exposure Flash & Spatialized 3-Layer Impact Audio
      this.triggerCinematicImpact(Boolean(isHeavy || isCounterHit));
      const panX = THREE.MathUtils.clamp(defender.x / 4.2, -1, 1);
      this.audio.playHit(isHeavy ? 'heavy' : 'light', panX);

      const hitX = contactPoint ? contactPoint.x : (attacker.x + defender.x) * 0.5;
      const hitY = contactPoint ? contactPoint.y : defender.y + 1.25;
      const sparkColor = move ? move.trailColor : attacker.cfg.neonColor;

      this.spawnSparks(hitX, hitY, sparkColor, isHeavy ? 22 : 12);
      if (isHeavy) {
        this.spawnShockwave(hitX, hitY, sparkColor, 2.2);
      }

      // Comic-Style Hit Words ("CUDA STRIKE!", "CRITICAL!", "WEIGHTS DELETED!", "POW!", "JAB!")
      const hexColor = '#' + attacker.cfg.neonColor.toString(16).padStart(6, '0');
      const hitWords = isHeavy
        ? attacker.dna.hitWords
        : ['POW!', 'JAB!', attacker.dna.hitWords[0] || 'STRIKE!'];
      const chosenWord = isCounterHit
        ? 'COUNTER CRITICAL!'
        : hitWords[Math.floor(Math.random() * hitWords.length)];

      this.addPopup(
        chosenWord,
        attacker.comboCount > 1
          ? `${attacker.comboCount}x ${move?.name || 'COMBO'} (-${Math.round(finalDmg)})`
          : `-${Math.round(finalDmg)} HP`,
        defender.x,
        defender.y + 1.85,
        isCounterHit ? '#ffcc00' : hexColor
      );

      if ((isHeavy || attacker.comboCount >= 3) && Math.random() < 0.25) {
        this.audio.speakAnnouncer(`${attacker.cfg.name} dominates!`, panX);
      }
    }

    const territoryBoost = attacker.isP1 ? this.territoryDamageMultiplier : 1.0;
    defender.hp = Math.max(0, defender.hp - finalDmg * territoryBoost);
    attacker.meter = Math.min(100, attacker.meter + 12);
    defender.meter = Math.min(100, defender.meter + 8);

    this.emitTelemetry();

    if (defender.hp <= 0) {
      defender.state = 'ko';
      this.resolveRoundOver(attacker.isP1);
    }
  }

  /**
   * Triggers a signature 3D "Hostile Takeover" Fatality directly onto the defeated rival!
   */
  public triggerHostileTakeoverFatality(winner: FighterActor, loser: FighterActor) {
    if (this.fatalityGroup) {
      this.scene.remove(this.fatalityGroup);
    }
    const group = new THREE.Group();
    group.position.set(loser.x, 0, 0);
    this.scene.add(group);
    this.fatalityGroup = group;

    this.audio.playFatalitySound();
    this.triggerCinematicImpact(true);

    const wId = winner.cfg.id;
    let fatalityTitle = 'HOSTILE TAKEOVER!';
    let fatalitySub = 'VALUATION ZEROED';

    if (wId === 4) {
      // Jensen Huang: Blackwell Liquid-Nitrogen Overload Freeze
      fatalityTitle = 'BLACKWELL LIQUID-N2 OVERLOAD!';
      fatalitySub = 'FLASH-FROZEN IN SILICON';
      const iceBlock = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 2.1, 0.95),
        new THREE.MeshStandardMaterial({
          color: 0x00f3ff,
          emissive: 0x10b981,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.58,
          roughness: 0.08,
          metalness: 0.9,
        })
      );
      iceBlock.position.y = 1.05;
      group.add(iceBlock);
    } else if (wId === 2) {
      // Sam Altman: $7 Trillion Server Monolith Drop
      fatalityTitle = '$7 TRILLION MONOLITH DROP!';
      fatalitySub = 'FLATTENED BY AGI COMPUTE';
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 2.6, 1.1),
        new THREE.MeshStandardMaterial({
          color: 0x064e3b,
          emissive: 0x10b981,
          emissiveIntensity: 0.55,
          roughness: 0.2,
          metalness: 0.85,
        })
      );
      monolith.position.y = 1.3;
      group.add(monolith);
      loser.rig.root.scale.y = 0.18;
    } else if (wId === 5) {
      // Mark Zuckerberg: Kauai Octagon Cage & VR Shatter
      fatalityTitle = 'KAUAI OCTAGON SUBMISSION!';
      fatalitySub = 'METAVERSE CAGE LOCKED';
      const cage = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 2.3, 8, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        })
      );
      cage.position.y = 1.15;
      group.add(cage);
    } else if (wId === 0) {
      // Elon Musk: Starship Orbital Booster Slam
      fatalityTitle = 'STARSHIP BOOSTER SLAM!';
      fatalitySub = 'ORBITAL CATCH COMPLETE';
      const booster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.75, 3.2, 24),
        new THREE.MeshStandardMaterial({
          color: 0xcbd5e1,
          metalness: 0.92,
          roughness: 0.18,
        })
      );
      booster.position.y = 1.6;
      group.add(booster);
      loser.rig.root.scale.y = 0.22;
    } else {
      // Sovereign Orbital Beam & Silicon Monolith
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 8, 24),
        new THREE.MeshBasicMaterial({
          color: winner.cfg.neonColor,
          transparent: true,
          opacity: 0.65,
        })
      );
      beam.position.y = 4.0;
      group.add(beam);
    }

    this.spawnSparks(loser.x, 1.2, winner.cfg.neonColor, 36);
    this.spawnShockwave(loser.x, 0.8, winner.cfg.neonColor, 3.8);
    this.addPopup(fatalityTitle, fatalitySub, loser.x, 2.1, '#ffcc00');
  }

  private resolveRoundOver(p1WonRound: boolean) {
    if (!this.combatActive || !this.p1 || !this.p2) return;
    this.combatActive = false;
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (p1WonRound) this.p1RoundsWon += 1;
    else this.p2RoundsWon += 1;

    this.slowMoFrames = 28;
    this.audio.playKO();

    const roundWinnerActor = p1WonRound ? this.p1 : this.p2;
    const roundLoserActor = p1WonRound ? this.p2 : this.p1;
    const roundWinner = roundWinnerActor.cfg;
    const matchWon = this.p1RoundsWon >= 2 || this.p2RoundsWon >= 2;

    const panX = THREE.MathUtils.clamp(roundWinnerActor.x / 4.2, -1, 1);

    if (matchWon) {
      this.triggerHostileTakeoverFatality(roundWinnerActor, roundLoserActor);
      this.audio.speakAnnouncer(
        `Hostile takeover fatality! ${roundWinner.name} conquers the sector!`,
        panX
      );

      const p1WonMatch = this.p1RoundsWon >= 2;
      const winnerHp = Math.round(roundWinnerActor.hp);
      const isCloseFight =
        (this.p1RoundsWon === 1 && this.p2RoundsWon === 2) ||
        (this.p1RoundsWon === 2 && this.p2RoundsWon === 1) ||
        winnerHp <= 34;

      window.setTimeout(() => {
        this.onMatchEnd({
          p1Won: p1WonMatch,
          isCloseFight,
          winnerHp,
          p1Rounds: this.p1RoundsWon,
          p2Rounds: this.p2RoundsWon,
        });
      }, 2600);
    } else {
      this.audio.speakAnnouncer(`Round goes to ${roundWinner.name}!`, panX);
      const c1 = this.p1.cfg;
      const c2 = this.p2.cfg;
      window.setTimeout(() => {
        this.currentRound += 1;
        this.startRound(c1, c2);
      }, 2000);
    }
  }

  public spawnSparks(x: number, y: number, color: number, count: number) {
    const geo = new THREE.OctahedronGeometry(0.036, 0);
    const mat = new THREE.MeshBasicMaterial({ color });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, (Math.random() - 0.5) * 0.3);
      this.scene.add(mesh);
      this.sparks.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.24,
        vy: Math.random() * 0.18 + 0.04,
        vz: (Math.random() - 0.5) * 0.18,
        life: 16 + Math.random() * 8,
        maxLife: 24,
      });
    }
  }

  // ============================================================================
  // HIGH-SPEED ARCADE MOVEMENT, TRUE 3D BONE COLLISION & WALL-SPLAT PHYSICS
  // ============================================================================
  private updateActor(actor: FighterActor, opponent: FighterActor, elapsed: number, dt: number) {
    const dtScale = Math.min(2.0, dt * 60);

    if (actor.hitFlashTimer > 0) {
      actor.hitFlashTimer--;
      if (actor.hitFlashTimer === 0) actor.clearHitFlash();
    }

    if (actor.freezeTimer > 0) actor.freezeTimer--;
    if (actor.embargoTimer > 0) actor.embargoTimer--;
    if (actor.buffTimer > 0) actor.buffTimer--;
    if (actor.stealthTimer > 0) actor.stealthTimer--;
    if (actor.aiCooldown > 0) actor.aiCooldown--;

    if (actor.comboResetTimer > 0) {
      actor.comboResetTimer--;
      if (actor.comboResetTimer === 0) {
        actor.comboCount = 0;
        actor.comboStep = 0;
      }
    }

    if (actor.state === 'ko') {
      actor.rig.root.rotation.z = THREE.MathUtils.damp(
        actor.rig.root.rotation.z,
        -actor.facing * (Math.PI / 2),
        12,
        dt
      );
      actor.rig.hips.position.y = THREE.MathUtils.damp(actor.rig.hips.position.y, 0.32, 12, dt);
      return;
    }

    if (this.combatActive && (actor.state === 'idle' || actor.state === 'move')) {
      actor.facing = opponent.x >= actor.x ? 1 : -1;
    }
    const targetYaw = actor.facing * (Math.PI * 0.34);
    actor.rig.root.rotation.y += (targetYaw - actor.rig.root.rotation.y) * 0.28;

    // Instantaneous High-Acceleration Arcade Physics (ACCEL = 0.45, FRICTION = 0.78)
    const ACCEL = 0.45;
    const FRICTION = 0.78;
    const MAX_SPEED = 0.22 + (actor.cfg.speed / 100) * 0.05 + (actor.buffTimer > 0 ? 0.04 : 0);

    if (this.combatActive && actor.freezeTimer <= 0) {
      if (!actor.isAI) {
        const leftKey = actor.isP1 ? this.keys['KeyA'] || this.vPad.left : this.keys['ArrowLeft'];
        const rightKey = actor.isP1 ? this.keys['KeyD'] || this.vPad.right : this.keys['ArrowRight'];
        const jumpKey = actor.isP1 ? this.keys['KeyW'] || this.vPad.jump : this.keys['ArrowUp'];
        const blockKey = actor.isP1 ? this.keys['KeyS'] || this.vPad.block : this.keys['ArrowDown'];

        actor.blocking = Boolean(
          blockKey && (actor.state === 'idle' || actor.state === 'move') && actor.y === 0
        );
        const targetShieldOpacity = actor.blocking ? 0.32 : actor.counterShieldActive ? 0.45 : 0;
        actor.rig.shieldMesh.material.opacity = THREE.MathUtils.damp(
          actor.rig.shieldMesh.material.opacity,
          targetShieldOpacity,
          18,
          dt
        );

        if (actor.state === 'idle' || actor.state === 'move') {
          if (leftKey && !actor.blocking) {
            actor.vx = Math.max(-MAX_SPEED, actor.vx - ACCEL);
            actor.state = 'move';
          } else if (rightKey && !actor.blocking) {
            actor.vx = Math.min(MAX_SPEED, actor.vx + ACCEL);
            actor.state = 'move';
          } else {
            actor.vx *= FRICTION;
            if (Math.abs(actor.vx) < 0.008) {
              actor.vx = 0;
              actor.state = 'idle';
            }
          }

          if (jumpKey && actor.y === 0 && !actor.blocking) {
            actor.vy = 0.35;
          }
        } else if (actor.state !== 'dash') {
          actor.vx *= FRICTION;
        }
      } else {
        this.runTacticalUtilityAI(actor, opponent, MAX_SPEED, dt);
      }
    }

    actor.x += actor.vx * dtScale;
    if (actor.state !== 'move' && actor.state !== 'dash') {
      actor.vx *= FRICTION;
    }

    if (actor.y > 0 || actor.vy > 0) {
      actor.y += actor.vy * dtScale;
      actor.vy -= 0.024 * dtScale;
      if (actor.y <= 0) {
        actor.y = 0;
        actor.vy = 0;
      }
    }

    // Interactive Corner Wall-Splat Barrier Detection!
    if (
      this.combatActive &&
      actor.state === 'hit' &&
      !actor.wallSplatted &&
      Math.abs(actor.x) >= 4.25 &&
      Math.abs(actor.vx) > 0.08
    ) {
      actor.wallSplatted = true;
      const side: -1 | 1 = actor.x > 0 ? 1 : -1;
      this.stageController?.triggerWallSplat(side);
      actor.hp = Math.max(1, actor.hp - 8);
      actor.vy = 0.2;
      actor.vx = -side * 0.14;
      actor.hitType = 'launch';
      this.hitStopFrames = 6;
      this.shakeIntensity = 0.22;
      this.audio.playHit(true);
      this.spawnSparks(side * 4.4, actor.y + 1.2, 0xff2a55, 24);
      this.spawnShockwave(side * 4.4, actor.y + 1.2, 0xff2a55, 2.5);
      this.addPopup('WALL SPLAT!', '-8 CORNER CRUSH', actor.x, actor.y + 2.0, '#ff2a55');
      this.emitTelemetry();
    }

    actor.x = THREE.MathUtils.clamp(actor.x, -4.35, 4.35);

    const dx = opponent.x - actor.x;
    if (Math.abs(dx) < 0.72 && Math.abs(actor.y - opponent.y) < 0.95) {
      const push = (0.72 - Math.abs(dx)) * 0.5;
      const sign = dx >= 0 ? 1 : -1;
      actor.x -= sign * push;
      opponent.x += sign * push;
    }

    actor.rig.root.position.x = actor.x;
    actor.rig.root.position.y = actor.y;

    this.poseAnatomicalRig(actor, elapsed, dt);
    actor.rig.root.updateMatrixWorld(true);
    opponent.rig.root.updateMatrixWorld(true);

    if (actor.stateTimer > 0) {
      actor.frame++;
      actor.stateTimer -= dtScale;

      if (actor.state === 'attack' && actor.currentMove && !actor.hitConnected) {
        const move = actor.currentMove;
        if (actor.frame >= move.activeStart && actor.frame <= move.activeEnd) {
          const collision = checkTrue3DBoneCollision(
            actor.rig,
            actor.x,
            opponent.rig,
            opponent.x,
            move
          );

          if (collision.hit) {
            actor.hitConnected = true;
            const powMult =
              (actor.cfg.power / 88) * (actor.buffTimer > 0 ? 1.25 : 1.0);
            const dmg = move.damage * powMult;
            const unblockable = move.hitLocation === 'throw';

            this.applyDamage(
              actor,
              opponent,
              dmg,
              unblockable,
              move,
              collision.contactPoint
            );

            if (actor.cancelBuffer) {
              const nextMove = actor.cancelBuffer;
              actor.cancelBuffer = null;
              this.performAttack(actor, opponent, nextMove);
              return;
            }
          }
        }
      }

      if (actor.stateTimer <= 0) {
        actor.stateTimer = 0;
        actor.frame = 0;
        actor.state = 'idle';
        actor.attackType = null;
        actor.currentMove = null;
      }
    }
  }

  private runTacticalUtilityAI(
    ai: FighterActor,
    target: FighterActor,
    maxSpeed: number,
    dt: number
  ) {
    const dist = Math.abs(target.x - ai.x);
    const dirToTarget = target.x >= ai.x ? 1 : -1;
    const targetAttacking = target.state === 'attack';

    if (
      targetAttacking &&
      target.frame <= 8 &&
      dist < 1.75 &&
      (ai.state === 'idle' || ai.state === 'move')
    ) {
      ai.blocking = true;
      ai.vx = 0;
      ai.rig.shieldMesh.material.opacity = THREE.MathUtils.damp(
        ai.rig.shieldMesh.material.opacity,
        0.34,
        18,
        dt
      );
      this.aiReadout = `PARRYING ${target.currentMove?.name || 'STRIKE'} STARTUP`;
      return;
    }
    ai.blocking = false;
    if (!ai.counterShieldActive) {
      ai.rig.shieldMesh.material.opacity = THREE.MathUtils.damp(
        ai.rig.shieldMesh.material.opacity,
        0,
        18,
        dt
      );
    }

    if (
      target.blocking &&
      dist < 1.45 &&
      ai.aiCooldown === 0 &&
      (ai.state === 'idle' || ai.state === 'move')
    ) {
      this.aiReadout = 'HOSTILE TAKEOVER GUARD BREAK!';
      this.startMove(ai, target, 'grab');
      ai.aiCooldown = 18;
      return;
    }

    if (
      targetAttacking &&
      target.frame > 9 &&
      dist < 2.15 &&
      ai.aiCooldown === 0 &&
      (ai.state === 'idle' || ai.state === 'move')
    ) {
      this.aiReadout = 'WHIFF PUNISH EXECUTED!';
      this.startMove(ai, target, ai.meter >= 50 ? 'ultimate' : 'heavy');
      ai.aiCooldown = 16;
      return;
    }

    if (
      target.y > 0.15 &&
      dist < 1.65 &&
      ai.aiCooldown === 0 &&
      (ai.state === 'idle' || ai.state === 'move')
    ) {
      this.aiReadout = 'ANTI-AIR INTERCEPT!';
      this.startMove(ai, target, 'heavy');
      ai.aiCooldown = 18;
      return;
    }

    if (ai.state === 'idle' || ai.state === 'move') {
      if (dist > 2.0) {
        if (dist > 2.7 && ai.aiCooldown === 0 && Math.random() < 0.06) {
          this.aiReadout = 'ZONING SPECIAL PROJECTILE';
          this.startMove(ai, target, 'special');
          ai.aiCooldown = 26;
        } else {
          ai.vx = dirToTarget * maxSpeed * 0.78;
          ai.state = 'move';
        }
      } else if (dist >= 1.05 && dist <= 2.0) {
        ai.vx = 0;
        ai.state = 'idle';
        if (ai.aiCooldown === 0) {
          this.aiReadout = '16-MOVE TARGET COMBO';
          this.startMove(ai, target, 'light');
          window.setTimeout(() => {
            if (this.combatActive && ai.state === 'attack') {
              this.startMove(ai, target, Math.random() < 0.5 ? 'light' : 'heavy');
            }
          }, 85);
          ai.aiCooldown = 22;
        }
      } else {
        ai.vx = -dirToTarget * maxSpeed * 0.55;
        ai.state = 'move';
      }
    }
  }

  private poseAnatomicalRig(actor: FighterActor, t: number, dt: number) {
    const {
      hips,
      torso,
      head,
      armL,
      forearmL,
      armR,
      forearmR,
      legL,
      shinL,
      legR,
      shinR,
      gearGroup,
    } = actor.rig;

    gearGroup.rotation.z = Math.sin(t * 2.0) * 0.06;
    if (actor.freezeTimer > 0) return;

    const headTy = -actor.rig.root.rotation.y * 0.35;

    // 4-PHASE KINETIC SEQUENCING: Coil/Windup -> Snap Extension -> Impact Hold -> Guard Recovery
    if (actor.state === 'attack' && actor.currentMove) {
      const move = actor.currentMove;
      const f = actor.frame;
      const coilEnd = Math.max(1, Math.floor(move.activeStart * 0.7));

      if (f <= coilEnd) {
        // Phase 1: Coil / Windup (Cocking shoulders and hips back)
        const alpha = THREE.MathUtils.smoothstep(f / coilEnd, 0, 1);
        applyBlendedPose(actor.rig, NEUTRAL_GUARD_POSE, move.windup, alpha);
      } else if (f <= move.activeStart) {
        // Phase 2: Snap Extension (Explosive velocity into strike)
        const snapSpan = Math.max(1, move.activeStart - coilEnd);
        const alpha = Math.pow(THREE.MathUtils.clamp((f - coilEnd) / snapSpan, 0, 1), 0.35);
        applyBlendedPose(actor.rig, move.windup, move.strike, alpha);
      } else if (f <= move.activeEnd) {
        // Phase 3: Impact Hold (Rigid active hit frames at full extension)
        applyBlendedPose(actor.rig, move.windup, move.strike, 1.0);
      } else {
        // Phase 4: Guard Recovery
        const recFrames = Math.max(1, move.totalFrames - move.activeEnd);
        const alpha = THREE.MathUtils.smoothstep((f - move.activeEnd) / recFrames, 0, 1);
        applyBlendedPose(actor.rig, move.strike, NEUTRAL_GUARD_POSE, alpha);
      }
      dampRot(head.rotation, 0, headTy, 0, 24, dt);
      return;
    }

    hips.position.z = THREE.MathUtils.damp(hips.position.z, 0, 20, dt);

    const bounce = Math.sin(t * 9.5 + (actor.isP1 ? 0 : Math.PI));
    const baseHipY = 0.88;
    let targetHipY = baseHipY;

    let torsoTx = 0,
      torsoTy = 0,
      torsoTz = 0;
    let headTx = 0,
      headTz = 0;

    let armLTx = -0.55,
      armLTy = 0.2,
      armLTz = -0.18;
    let foreLTx = -1.35;
    let armRTx = -0.42,
      armRTy = -0.2,
      armRTz = 0.18;
    let foreRTx = -1.25;

    let legLTx = -0.22,
      legLTy = 0,
      legLTz = -0.08;
    let shinLTx = 0.42;
    let legRTx = 0.24,
      legRTy = 0,
      legRTz = 0.08;
    let shinRTx = 0.35;

    let lambda = 22;

    if (actor.blocking) {
      targetHipY = 0.84;
      torsoTx = 0.18;
      armLTx = -1.35;
      armLTy = 0.4;
      armLTz = 0.3;
      foreLTx = -1.6;
      armRTx = -1.35;
      armRTy = -0.4;
      armRTz = -0.3;
      foreRTx = -1.6;
    } else if (actor.state === 'move' || actor.state === 'dash') {
      lambda = 24;
      const w = t * (actor.state === 'dash' ? 22 : 14);
      targetHipY = 0.86 + Math.abs(Math.sin(w)) * 0.04;
      torsoTx = actor.state === 'dash' ? 0.32 : 0.12;
      legLTx = Math.sin(w) * 0.65;
      shinLTx = Math.max(0.1, Math.cos(w) * 0.65);
      legRTx = -Math.sin(w) * 0.65;
      shinRTx = Math.max(0.1, -Math.cos(w) * 0.65);
      armLTx = -0.5 + Math.cos(w) * 0.45;
      armRTx = -0.5 - Math.cos(w) * 0.45;
    } else if (actor.state === 'hit') {
      lambda = 28;
      if (actor.hitType === 'high') {
        targetHipY = 0.86;
        torsoTx = -0.48;
        headTx = -0.55;
        armLTz = -0.7;
        armRTz = 0.7;
      } else if (actor.hitType === 'mid') {
        targetHipY = 0.74;
        torsoTx = 0.62;
        headTx = 0.35;
        armLTx = -0.9;
        armRTx = -0.9;
        foreLTx = -1.7;
        foreRTx = -1.7;
      } else if (actor.hitType === 'low') {
        targetHipY = 0.56;
        torsoTx = -0.55;
        legLTx = -0.95;
        legRTx = -0.85;
        shinLTx = 1.2;
        shinRTx = 1.2;
      } else {
        targetHipY = 0.96;
        torsoTx = -0.68;
        armLTx = -1.2;
        armRTx = -1.2;
        legLTx = -0.65;
        legRTx = -0.45;
      }
    } else {
      lambda = 18;
      targetHipY = 0.88 + bounce * 0.022;
      torsoTy = -0.22;
      armLTx = -0.55 + bounce * 0.06;
      armRTx = -0.42 - bounce * 0.06;
    }

    hips.position.y = THREE.MathUtils.damp(hips.position.y, targetHipY, lambda, dt);
    dampRot(torso.rotation, torsoTx, torsoTy, torsoTz, lambda, dt);
    dampRot(head.rotation, headTx, headTy, headTz, lambda, dt);
    dampRot(armL.rotation, armLTx, armLTy, armLTz, lambda, dt);
    forearmL.rotation.x = THREE.MathUtils.damp(forearmL.rotation.x, foreLTx, lambda, dt);
    dampRot(armR.rotation, armRTx, armRTy, armRTz, lambda, dt);
    forearmR.rotation.x = THREE.MathUtils.damp(forearmR.rotation.x, foreRTx, lambda, dt);
    dampRot(legL.rotation, legLTx, legLTy, legLTz, lambda, dt);
    shinL.rotation.x = THREE.MathUtils.damp(shinL.rotation.x, shinLTx, lambda, dt);
    dampRot(legR.rotation, legRTx, legRTy, legRTz, lambda, dt);
    shinR.rotation.x = THREE.MathUtils.damp(shinR.rotation.x, shinRTx, lambda, dt);
  }

  private updateProjectilesAndParticles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.x += p.vx;
      p.mesh.rotation.x += 0.2;
      p.mesh.rotation.y += 0.25;
      p.life--;

      const hitDist = Math.abs(p.mesh.position.x - p.target.x);
      const hitY = Math.abs(p.target.y);

      if (hitDist < 0.58 && hitY < 0.9 && this.combatActive) {
        if (p.effectType === 'stun_wave') {
          p.target.freezeTimer = 85;
          this.addPopup('CTRL+ALT+DEL!', 'STUNNED', p.target.x, p.target.y + 1.9, '#38bdf8');
        }
        this.applyDamage(p.owner, p.target, p.damage, p.unblockable);
        this.spawnShockwave(p.mesh.position.x, 1.15, p.owner.cfg.neonColor, 2.0);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life <= 0 || Math.abs(p.mesh.position.x) > 10) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.mesh.position.x += s.vx;
      s.mesh.position.y += s.vy;
      s.mesh.position.z += s.vz;
      s.vy -= 0.012;
      s.life--;
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        this.sparks.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const w = this.shockwaves[i];
      w.mesh.scale.addScalar(0.22);
      w.life--;
      (w.mesh.material as THREE.MeshBasicMaterial).opacity *= 0.84;
      if (w.life <= 0) {
        this.scene.remove(w.mesh);
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateArenaHazardAndBanter() {
    if (!this.combatActive || !this.p1 || !this.p2) return;

    this.philosophyBanterCooldown--;
    if (this.philosophyBanterCooldown <= 0) {
      this.philosophyBanterCooldown = 360;
      if (!this.activeSpeech) {
        const speaker = Math.random() < 0.5 ? this.p1 : this.p2;
        this.triggerFounderSpeech(speaker);
      }
    }

    this.hazardCooldown--;
    if (this.hazardCooldown <= 0) {
      this.hazardCooldown = 540;
      const hx = (Math.random() - 0.5) * 5;
      this.stageController?.triggerHazard(1.0);
      this.spawnSparks(hx, 1.2, this.currentArena.primaryColor, 20);
      this.spawnShockwave(hx, 1.1, this.currentArena.primaryColor, 2.5);
      this.shakeIntensity = 0.16;

      [this.p1, this.p2].forEach((actor) => {
        if (Math.abs(actor.x - hx) < 1.6 && !actor.blocking) {
          actor.hp = Math.max(5, actor.hp - 8);
          actor.triggerHitFlash();
          this.addPopup('STAGE HAZARD!', '-8 HP', actor.x, actor.y + 1.9, '#ef4444');
        }
      });
      this.emitTelemetry();
    }
  }

  private updateCamera(dt: number) {
    if (!this.p1 || !this.p2) return;
    const midX = (this.p1.x + this.p2.x) * 0.5;
    const dist = Math.abs(this.p1.x - this.p2.x);
    const isPortrait = (this.camera.aspect || 1.5) < 1.0;

    let targetPos = new THREE.Vector3();
    let lookPos = new THREE.Vector3(midX, 1.35, 0);

    if (this.cameraMode === 'closeup') {
      targetPos.set(midX, 1.66, isPortrait ? 3.05 : 2.3);
      lookPos.set(midX, 1.54, 0);
    } else if (this.cameraMode === 'low_cinema') {
      const zDist = (isPortrait ? 4.8 : 3.7) + dist * 0.48;
      targetPos.set(midX * 0.85, 1.18, zDist);
      lookPos.set(midX, 1.38, 0);
    } else if (this.cameraMode === 'top_tactical') {
      const zDist = (isPortrait ? 6.4 : 5.2) + dist * 0.52;
      targetPos.set(midX, 3.6, zDist);
      lookPos.set(midX, 1.1, 0);
    } else {
      const zDist = (isPortrait ? 5.6 : 4.2) + dist * 0.55;
      targetPos.set(midX, 1.65, zDist);
      lookPos.set(midX, 1.35, 0);
    }

    if (this.shakeIntensity > 0.005) {
      targetPos.x += (Math.random() - 0.5) * this.shakeIntensity;
      targetPos.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.8;
    } else {
      this.shakeIntensity = 0;
    }

    const damp = 1 - Math.exp(-10.0 * dt);
    this.camera.position.lerp(targetPos, damp);
    this.camLookTarget.lerp(lookPos, damp);
    this.camera.lookAt(this.camLookTarget);
  }

  private emitTelemetry() {
    if (!this.p1 || !this.p2) return;
    this.onTelemetry({
      p1Hp: this.p1.hp,
      p2Hp: this.p2.hp,
      p1Meter: this.p1.meter,
      p2Meter: this.p2.meter,
      p1Combo: this.p1.comboCount,
      p2Combo: this.p2.comboCount,
      p1RoundsWon: this.p1RoundsWon,
      p2RoundsWon: this.p2RoundsWon,
      currentRound: this.currentRound,
      timer: this.matchTimer,
      p1EmbargoTimer: this.p1.embargoTimer,
      p2EmbargoTimer: this.p2.embargoTimer,
      p1FreezeTimer: this.p1.freezeTimer,
      p2FreezeTimer: this.p2.freezeTimer,
      p1BuffTimer: this.p1.buffTimer,
      p2BuffTimer: this.p2.buffTimer,
      p1StealthTimer: this.p1.stealthTimer,
      p2StealthTimer: this.p2.stealthTimer,
      bannerText: this.bannerText,
      bannerSub: this.bannerSub,
      activeSpeech: this.activeSpeech,
      activeBubble: this.activeBubble,
      aiReadout: this.aiReadout,
      stageId: this.stageController?.id || this.currentStageId,
      stageName: this.stageController?.name || 'SPACEX STARBASE: MECHAZILLA PAD',
      stageSubtitle: this.stageController?.subtitle || 'BOCA CHICA ORBITAL LAUNCH MOUNT',
      popups: [...this.popups],
    });
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const rawDt = Math.min(this.clock.getDelta(), 0.06);
    const elapsed = this.clock.getElapsedTime();

    this.stageController?.update(elapsed);

    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      this.composer.render();
      return;
    }

    if (this.slowMoFrames > 0) {
      this.slowMoFrames--;
      if (this.slowMoFrames % 2 === 1) {
        this.composer.render();
        return;
      }
    }

    if (this.p1 && this.p2) {
      this.updateActor(this.p1, this.p2, elapsed, rawDt);
      this.updateActor(this.p2, this.p1, elapsed, rawDt);
    }

    this.updateProjectilesAndParticles();
    this.updateArenaHazardAndBanter();
    this.updateCamera(rawDt);

    this.composer.render();
  };

  public dispose() {
    this.stopMatch();
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.renderer.dispose();
  }
}
