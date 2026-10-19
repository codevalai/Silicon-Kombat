import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Camera,
  Swords,
  Shield,
  Zap,
  Play,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ZoomIn
} from 'lucide-react';
import {
  ARENAS,
  ArenaConfig,
  FACTIONS,
  FIGHTERS,
  FighterConfig,
  STORY_LADDER_IDS
} from './data/roster';
import { CyberAudioEngine } from './engine/CyberAudio';
import {
  CameraAngleMode,
  CombatTelemetryState,
  GameMode,
  MatchEndSummary,
  SiliconArenaEngine,
  VirtualPadState
} from './engine/SiliconArena3D';
import {
  ExosuitFinishId,
  getCustomFounderFacePhoto,
  setCustomFounderFacePhoto
} from './engine/FighterRig3D';
import { LandmarkStageId } from './engine/SiliconLandmarks3D';
import { FounderPortrait } from './components/FounderPortrait';

const STAGE_ORDER: LandmarkStageId[] = [
  'starbase',
  'colossus',
  'openai_hq',
  'googleplex',
  'meta_hq',
  'nvidia_voyager',
  'anthropic_vault',
  'tsmc_fab18',
  'oracle_aws',
  'apple_park',
];

export interface DiamondProfile {
  handle: string;
  faction: string;
  elo: number;
  wins: number;
  matches: number;
  computeCredits: number;
  exosuit: ExosuitFinishId;
  territories: Record<string, boolean>;
}

const DEFAULT_TERRITORIES: Record<string, boolean> = {
  'Silicon Valley': true,
  'Austin Starbase': false,
  'Seattle Cloud': false,
  'Taipei Fab 18': false,
  'SF Mission AI': false,
  'Virginia Ashburn': false,
};

const SECTOR_META: Record<
  string,
  { stageId: LandmarkStageId; defenderId: number; buffLabel: string }
> = {
  'Silicon Valley': {
    stageId: 'googleplex',
    defenderId: 11,
    buffLabel: '+10% STARTING METER',
  },
  'Austin Starbase': {
    stageId: 'starbase',
    defenderId: 0,
    buffLabel: '+8% STRIKE DAMAGE',
  },
  'Seattle Cloud': {
    stageId: 'oracle_aws',
    defenderId: 6,
    buffLabel: '+10% ULTIMATE CHARGE',
  },
  'Taipei Fab 18': {
    stageId: 'tsmc_fab18',
    defenderId: 4,
    buffLabel: '+12% SILICON OVERCLOCK',
  },
  'SF Mission AI': {
    stageId: 'openai_hq',
    defenderId: 2,
    buffLabel: '+8% COUNTER CRIT DAMAGE',
  },
  'Virginia Ashburn': {
    stageId: 'anthropic_vault',
    defenderId: 3,
    buffLabel: '+10% GUARD ARMOR',
  },
};

function getEloRankTitle(elo: number): string {
  if (elo >= 1600) return 'SOVEREIGN AGI GRANDMASTER';
  if (elo >= 1400) return 'FRONTIER LAB DIRECTOR';
  if (elo >= 1250) return 'STAFF ML ARCHITECT';
  return 'JUNIOR PROMPT ENGINEER';
}

type ActiveScreen = 'roster' | 'combat' | 'factions' | 'codex' | 'warmap';

function hexToCss(num: number): string {
  return '#' + num.toString(16).padStart(6, '0');
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SiliconArenaEngine | null>(null);
  const audioRef = useRef<CyberAudioEngine>(new CyberAudioEngine());

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('roster');
  const [gameMode, setGameMode] = useState<GameMode>('story');
  const [p1Fighter, setP1Fighter] = useState<FighterConfig>(FIGHTERS[0]); // Elon Musk
  const [p2Fighter, setP2Fighter] = useState<FighterConfig>(FIGHTERS[4]); // Jensen Huang
  const [selectingSlot, setSelectingSlot] = useState<'p1' | 'p2'>('p1');
  const [selectedArena, setSelectedArena] = useState<ArenaConfig>(ARENAS[0]);
  const [cameraMode, setCameraMode] = useState<CameraAngleMode>('broadcast');
  const [muted, setMuted] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  // Story & A2A Story Ladder State
  const [storyStageIndex, setStoryStageIndex] = useState<number>(0);
  const [matchResultModal, setMatchResultModal] = useState<{
    open: boolean;
    p1Won: boolean;
    isCloseFight: boolean;
    winnerHp: number;
    p1Rounds: number;
    p2Rounds: number;
  }>({
    open: false,
    p1Won: false,
    isCloseFight: false,
    winnerHp: 100,
    p1Rounds: 0,
    p2Rounds: 0,
  });
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Diamond Persistent Operator Passport & Territory War State
  const [diamondProfile, setDiamondProfile] = useState<DiamondProfile>(() => {
    try {
      const saved = localStorage.getItem('SOVEREIGN_DIAMOND_PROFILE');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          handle: parsed.handle || 'SovereignArchitect',
          faction: parsed.faction || 'House xAI',
          elo: typeof parsed.elo === 'number' ? parsed.elo : 1200,
          wins: parsed.wins || 0,
          matches: parsed.matches || 0,
          computeCredits: parsed.computeCredits ?? 250,
          exosuit: parsed.exosuit || 'standard',
          territories: { ...DEFAULT_TERRITORIES, ...(parsed.territories || {}) },
        };
      }
    } catch {
      // Ignore parse error
    }
    return {
      handle: 'SovereignArchitect',
      faction: 'House xAI',
      elo: 1200,
      wins: 0,
      matches: 0,
      computeCredits: 250,
      exosuit: 'standard',
      territories: { ...DEFAULT_TERRITORIES },
    };
  });

  const [passportModalOpen, setPassportModalOpen] = useState<boolean>(false);
  const [roomModalOpen, setRoomModalOpen] = useState<boolean>(false);
  const [githubModalOpen, setGithubModalOpen] = useState<boolean>(false);
  const [githubUsername, setGithubUsername] = useState<string>('YOUR_GITHUB_USERNAME');
  const [githubRepoName, setGithubRepoName] = useState<string>('silicon-kombat-sovereign-zenith');
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('GROK-99');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [faceUploadVersion, setFaceUploadVersion] = useState<number>(0);

  // Faction War Persistent State
  const [factionPoints, setFactionPoints] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    FACTIONS.forEach((f) => {
      base[f.id] = f.basePoints;
    });
    return base;
  });

  // Live Combat Telemetry State
  const [telemetry, setTelemetry] = useState<CombatTelemetryState>({
    p1Hp: 100,
    p2Hp: 100,
    p1Meter: 0,
    p2Meter: 0,
    p1Combo: 0,
    p2Combo: 0,
    p1RoundsWon: 0,
    p2RoundsWon: 0,
    currentRound: 1,
    timer: 99,
    p1EmbargoTimer: 0,
    p2EmbargoTimer: 0,
    p1FreezeTimer: 0,
    p2FreezeTimer: 0,
    p1BuffTimer: 0,
    p2BuffTimer: 0,
    p1StealthTimer: 0,
    p2StealthTimer: 0,
    bannerText: null,
    bannerSub: null,
    activeSpeech: null,
    popups: [],
  });

  const gameModeRef = useRef(gameMode);
  const p1Ref = useRef(p1Fighter);
  const p2Ref = useRef(p2Fighter);
  useEffect(() => {
    gameModeRef.current = gameMode;
    p1Ref.current = p1Fighter;
    p2Ref.current = p2Fighter;
  }, [gameMode, p1Fighter, p2Fighter]);

  // Sync Territory Buffs & Exosuit Finish into the 3D Arena Engine
  useEffect(() => {
    if (!engineRef.current) return;
    const conqueredCount = Object.values(diamondProfile.territories).filter(Boolean).length;
    const dmgMult = 1.0 + conqueredCount * 0.03;
    const meterBonus = conqueredCount * 8;
    engineRef.current.setTerritoryBuffs(dmgMult, meterBonus);
    engineRef.current.setExosuitFinish(diamondProfile.exosuit);
  }, [diamondProfile]);

  useEffect(() => {
    if (!canvasMountRef.current) return;
    const engine = new SiliconArenaEngine(
      canvasMountRef.current,
      audioRef.current,
      (newTelemetry) => {
        setTelemetry({ ...newTelemetry });
      },
      (summary: MatchEndSummary) => {
        const winner = summary.p1Won ? p1Ref.current : p2Ref.current;
        setFactionPoints((prev) => ({
          ...prev,
          [winner.faction]: (prev[winner.faction] || 1000) + 75,
        }));

        // Update Persistent Sovereign Passport Elo, Compute Credits & Conquered Sector
        setDiamondProfile((prev) => {
          const nextTerritories = { ...prev.territories };
          if (summary.p1Won) {
            const firstUnconquered = Object.keys(nextTerritories).find(
              (k) => !nextTerritories[k]
            );
            if (firstUnconquered) {
              nextTerritories[firstUnconquered] = true;
            }
          }
          const updated: DiamondProfile = {
            ...prev,
            matches: prev.matches + 1,
            wins: summary.p1Won ? prev.wins + 1 : prev.wins,
            elo: summary.p1Won ? prev.elo + 28 : Math.max(1000, prev.elo - 18),
            computeCredits: prev.computeCredits + (summary.p1Won ? 120 : 40),
            territories: nextTerritories,
          };
          try {
            localStorage.setItem('SOVEREIGN_DIAMOND_PROFILE', JSON.stringify(updated));
          } catch {
            // Ignore storage quota errors
          }
          return updated;
        });

        setMatchResultModal({
          open: true,
          p1Won: summary.p1Won,
          isCloseFight: summary.isCloseFight,
          winnerHp: summary.winnerHp,
          p1Rounds: summary.p1Rounds,
          p2Rounds: summary.p2Rounds,
        });
      }
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    if (activeScreen !== 'combat') {
      engineRef.current.spawnShowcaseFighters(p1Fighter, p2Fighter);
    }
  }, [p1Fighter, p2Fighter, activeScreen]);

  // Automatic Rematch (if close fight) or Next Challenger progression in A2A Story Mode & Story Mode
  useEffect(() => {
    if (!matchResultModal.open) {
      setAutoAdvanceCountdown(null);
      return;
    }
    if (gameMode === 'ai_vs_ai' || gameMode === 'story') {
      setAutoAdvanceCountdown(5);
      const interval = window.setInterval(() => {
        setAutoAdvanceCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            window.clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => window.clearInterval(interval);
    }
  }, [matchResultModal.open, gameMode]);

  useEffect(() => {
    if (autoAdvanceCountdown === 0 && matchResultModal.open) {
      if (matchResultModal.isCloseFight) {
        handleRematchNow();
      } else {
        handleAdvanceToNextFighter();
      }
    }
  }, [autoAdvanceCountdown, matchResultModal.open]);

  const handleSelectArena = (arena: ArenaConfig) => {
    audioRef.current.init();
    audioRef.current.playSelect();
    setSelectedArena(arena);
    engineRef.current?.setArena(arena);
  };

  const handleCycleCamera = () => {
    const order: CameraAngleMode[] = ['broadcast', 'closeup', 'low_cinema', 'top_tactical'];
    const next = order[(order.indexOf(cameraMode) + 1) % order.length];
    setCameraMode(next);
    engineRef.current?.setCameraMode(next);
  };

  const handleToggleCloseup = () => {
    const next: CameraAngleMode = cameraMode === 'closeup' ? 'broadcast' : 'closeup';
    setCameraMode(next);
    engineRef.current?.setCameraMode(next);
  };

  const handleCycleStage = () => {
    if (!engineRef.current) return;
    audioRef.current.init();
    audioRef.current.playSelect();
    const cur = engineRef.current.currentStageId;
    const next = STAGE_ORDER[(STAGE_ORDER.indexOf(cur) + 1) % STAGE_ORDER.length];
    engineRef.current.setStage(next);
  };

  const handleQuickSwapFounder = (fighter: FighterConfig) => {
    audioRef.current.init();
    audioRef.current.playSelect(true);
    const rival = FIGHTERS[(fighter.id + 2) % FIGHTERS.length];
    setP1Fighter(fighter);
    setP2Fighter(rival);
    if (activeScreen === 'combat') {
      engineRef.current?.startMatch(fighter, rival, gameMode);
    } else {
      engineRef.current?.spawnShowcaseFighters(fighter, rival);
    }
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
    if (next) audioRef.current.stopSpeech();
  };

  const handleQuickLaunchCombat = () => {
    audioRef.current.init();
    audioRef.current.playSelect();
    setMatchResultModal((prev) => ({ ...prev, open: false }));
    if (cameraMode === 'closeup') {
      setCameraMode('broadcast');
      engineRef.current?.setCameraMode('broadcast');
    }
    setActiveScreen('combat');
    engineRef.current?.startMatch(p1Fighter, p2Fighter, gameMode);
  };

  const handleRematchNow = () => {
    audioRef.current.init();
    audioRef.current.playSelect();
    setMatchResultModal((prev) => ({ ...prev, open: false }));
    setActiveScreen('combat');
    engineRef.current?.startMatch(p1Fighter, p2Fighter, gameMode);
  };

  const handleAdvanceToNextFighter = () => {
    audioRef.current.init();
    audioRef.current.playSelect();
    setMatchResultModal((prev) => ({ ...prev, open: false }));

    const reigningP1 =
      gameMode === 'ai_vs_ai' && !matchResultModal.p1Won ? p2Fighter : p1Fighter;
    if (gameMode === 'ai_vs_ai' && !matchResultModal.p1Won) {
      setP1Fighter(reigningP1);
    }

    const nextStage = (storyStageIndex + 1) % STORY_LADDER_IDS.length;
    setStoryStageIndex(nextStage);
    const oppId = STORY_LADDER_IDS[nextStage];
    const nextOpp =
      FIGHTERS.find((f) => f.id === oppId && f.id !== reigningP1.id) ||
      FIGHTERS[(oppId + 1) % FIGHTERS.length];
    setP2Fighter(nextOpp);

    const nextArena = ARENAS[nextStage % ARENAS.length];
    setSelectedArena(nextArena);
    engineRef.current?.setArena(nextArena);

    setActiveScreen('combat');
    engineRef.current?.startMatch(reigningP1, nextOpp, gameMode);
  };

  const handleReturnToRoster = () => {
    engineRef.current?.stopMatch();
    setMatchResultModal((prev) => ({ ...prev, open: false }));
    setActiveScreen('roster');
  };

  const handleCardSelect = (fighter: FighterConfig) => {
    audioRef.current.init();
    audioRef.current.playSelect();
    audioRef.current.speakFounderQuote(
      `${fighter.name}. ${fighter.latestModel}. ${fighter.quote}`,
      fighter.voicePitch,
      fighter.voiceRate
    );
    if (selectingSlot === 'p1') {
      setP1Fighter(fighter);
      if (gameMode !== 'story') {
        setSelectingSlot('p2');
      }
    } else {
      setP2Fighter(fighter);
    }
  };

  const handleRandomizeMatchup = () => {
    audioRef.current.init();
    audioRef.current.playSelect();
    const idx1 = Math.floor(Math.random() * FIGHTERS.length);
    let idx2 = Math.floor(Math.random() * FIGHTERS.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % FIGHTERS.length;
    setP1Fighter(FIGHTERS[idx1]);
    setP2Fighter(FIGHTERS[idx2]);
  };

  const bindPadButton = (key: keyof VirtualPadState) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      engineRef.current?.setVirtualInput(key, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      engineRef.current?.setVirtualInput(key, false);
    },
    onPointerLeave: () => {
      engineRef.current?.setVirtualInput(key, false);
    },
    onPointerCancel: () => {
      engineRef.current?.setVirtualInput(key, false);
    },
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#050811] text-[#F8FAFC]">
      {/* Dedicated Three.js WebGL Mount Container */}
      <div ref={canvasMountRef} className="fixed inset-0 z-0" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-2.5 sm:px-5 h-11 bg-white/[0.04] border-b border-white/15">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sky-400 rotate-45" />
          <span className="font-display text-[11px] sm:text-xs font-black tracking-[0.14em] text-white uppercase">
            SILICON KOMBAT
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => {
              if (activeScreen === 'combat') handleReturnToRoster();
              else setActiveScreen('roster');
            }}
            className={`px-2 py-1 text-[10px] sm:text-xs font-display font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeScreen === 'roster'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => {
              engineRef.current?.stopMatch();
              setActiveScreen('warmap');
            }}
            className={`px-2 py-1 text-[10px] sm:text-xs font-display font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeScreen === 'warmap'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            🗺️ War Map
          </button>
          <button
            onClick={() => {
              engineRef.current?.stopMatch();
              setActiveScreen('factions');
            }}
            className={`px-2 py-1 text-[10px] sm:text-xs font-display font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeScreen === 'factions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Factions
          </button>
          <button
            onClick={() => {
              engineRef.current?.stopMatch();
              setActiveScreen('codex');
            }}
            className={`px-2 py-1 text-[10px] sm:text-xs font-display font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeScreen === 'codex'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Models
          </button>
        </nav>

        {/* Right Actions: Passport/Locker + P2P Room + 3D HQ + Zoom + Sound + Fight CTA */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPassportModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 text-[10px] font-mono text-amber-300 uppercase tracking-wider transition-colors cursor-pointer"
            title="Open Sovereign Passport, Custom Face Photo Texture Upload & Exosuit Locker"
          >
            <span>⚡ ELO {diamondProfile.elo}</span>
            <span className="hidden lg:inline text-sky-300">• 📸 LOCKER</span>
          </button>

          <button
            onClick={() => setRoomModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/50 text-[10px] font-mono text-sky-200 uppercase tracking-wider transition-colors cursor-pointer"
            title="Open Sovereign P2P Room Code Lobby"
          >
            <span>🌐 {activeRoomCode ? `ROOM: ${activeRoomCode}` : 'P2P LOBBY'}</span>
          </button>

          <button
            onClick={() => setGithubModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/50 text-[10px] font-mono text-emerald-300 uppercase tracking-wider transition-colors cursor-pointer"
            title="Open GitHub Repository & One-Click Push Command Center"
          >
            <span>📦 GITHUB</span>
          </button>

          <button
            onClick={handleCycleStage}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-[10px] font-mono text-amber-300 uppercase tracking-wider transition-colors"
            title="Cycle 10 Iconic 3D Tech HQ Landmarks (Starbase, Colossus, Stargate, Googleplex, Meta Octagon...)"
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden md:inline">
              HQ: {(telemetry.stageId || 'starbase').toUpperCase()}
            </span>
          </button>

          <button
            onClick={handleToggleCloseup}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${
              cameraMode === 'closeup'
                ? 'bg-sky-400/20 border-sky-400/60 text-sky-200'
                : 'bg-white/[0.06] border-white/20 text-slate-200 hover:bg-white/[0.12]'
            }`}
            title="Inspect 3D Multi-Part Founder Faces"
          >
            <ZoomIn className="w-3 h-3" />
            <span className="hidden sm:inline">
              {cameraMode === 'closeup' ? 'CAM: FACE SCULPT ZOOM' : 'CAM: BROADCAST'}
            </span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-md bg-white/[0.06] border border-white/20 text-slate-200 hover:bg-white/[0.12]"
            title={muted ? 'Unmute Male Voice & SFX' : 'Mute Male Voice & SFX'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-300" />}
          </button>

          {activeScreen !== 'combat' ? (
            <button
              onClick={handleQuickLaunchCombat}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-display text-[10px] sm:text-xs font-black tracking-wider uppercase cursor-pointer"
            >
              <Swords className="w-3 h-3" />
              <span>FIGHT</span>
            </button>
          ) : (
            <button
              onClick={handleReturnToRoster}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.16] border border-white/25 text-white font-display text-[10px] font-bold tracking-wider uppercase cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Roster</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================
          SCREEN 1: ROSTER & MATCHUP SELECTOR (Translucent Glassmorphic UI)
         ========================================================= */}
      {activeScreen === 'roster' && (
        <main className="relative z-10 flex flex-col justify-between h-[calc(100vh-2.75rem)] p-2 sm:p-3 overflow-y-auto lg:overflow-hidden">
          {/* TOP BAR: Mode Switcher + Arena Selector + Matchup Launcher */}
          <div className="flex flex-col gap-2 bg-slate-950/65 border border-white/15 rounded-xl p-2 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'story', label: '1P Story' },
                    { id: 'ai_vs_ai', label: 'A2A Story' },
                    { id: 'versus', label: '2P Versus' },
                  ] as { id: GameMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setGameMode(m.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-display font-bold uppercase tracking-wider border transition-colors ${
                      gameMode === m.id
                        ? 'bg-sky-400/20 border-sky-400/60 text-sky-200'
                        : 'bg-white/[0.05] border-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                {ARENAS.map((arena) => (
                  <button
                    key={arena.id}
                    onClick={() => handleSelectArena(arena)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border whitespace-nowrap transition-colors ${
                      selectedArena.id === arena.id
                        ? 'bg-amber-400/20 border-amber-400/60 text-amber-200'
                        : 'bg-white/[0.05] border-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    {arena.name.split(' ')[0]} {arena.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIVE MATCHUP LAUNCH BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectingSlot('p1')}
                className={`md:col-span-4 flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                  selectingSlot === 'p1'
                    ? 'bg-sky-500/20 border-sky-400/70'
                    : 'bg-white/[0.04] border-white/15 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FounderPortrait fighter={p1Fighter} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-sky-400 text-slate-950">
                        P1
                      </span>
                      <span className="text-[9px] font-mono text-amber-300 truncate">
                        {p1Fighter.latestModel}
                      </span>
                    </div>
                    <div className="font-display text-xs font-black text-white uppercase truncate mt-0.5">
                      {p1Fighter.name}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-300 ml-2 shrink-0">Pick</span>
              </button>

              <div className="md:col-span-4 flex items-center justify-center gap-1.5">
                <button
                  onClick={handleQuickLaunchCombat}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-display text-xs font-black tracking-[0.12em] uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{gameMode === 'ai_vs_ai' ? 'START A2A STORY' : 'START FIGHT NOW'}</span>
                </button>
                <button
                  onClick={handleRandomizeMatchup}
                  className="p-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.15] border border-white/20 text-slate-200 hover:text-white"
                  title="Randomize Fighters"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setSelectingSlot('p2')}
                className={`md:col-span-4 flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
                  selectingSlot === 'p2'
                    ? 'bg-rose-500/20 border-rose-400/70'
                    : 'bg-white/[0.04] border-white/15 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FounderPortrait fighter={p2Fighter} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-rose-500 text-white">
                        P2
                      </span>
                      <span className="text-[9px] font-mono text-amber-300 truncate">
                        {p2Fighter.latestModel}
                      </span>
                    </div>
                    <div className="font-display text-xs font-black text-white uppercase truncate mt-0.5">
                      {p2Fighter.name}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-300 ml-2 shrink-0">Pick</span>
              </button>
            </div>
          </div>

          {/* Unobstructed 3D Center Stage */}
          <div className="my-auto" />

          {/* BOTTOM 20-FOUNDER ROSTER GRID */}
          <div className="bg-slate-950/65 border border-white/15 rounded-xl p-2 sm:p-2.5 mt-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">
                SELECT {selectingSlot === 'p1' ? 'PLAYER 1 (BLUE)' : 'OPPONENT P2 (RED)'} • TAP TO HEAR MALE VOICE & MODEL
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectingSlot('p1')}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                    selectingSlot === 'p1'
                      ? 'bg-sky-400 text-slate-950 border-sky-300 font-bold'
                      : 'bg-white/[0.06] text-slate-300 border-white/15'
                  }`}
                >
                  Pick P1
                </button>
                <button
                  onClick={() => setSelectingSlot('p2')}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                    selectingSlot === 'p2'
                      ? 'bg-rose-500 text-white border-rose-400 font-bold'
                      : 'bg-white/[0.06] text-slate-300 border-white/15'
                  }`}
                >
                  Pick P2
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-1.5 max-h-[28vh] sm:max-h-[24vh] overflow-y-auto pr-1">
              {FIGHTERS.map((f) => {
                const isP1 = p1Fighter.id === f.id;
                const isP2 = p2Fighter.id === f.id;
                const accent = hexToCss(f.neonColor);
                return (
                  <button
                    key={f.id}
                    onClick={() => handleCardSelect(f)}
                    className={`group relative flex items-center gap-1.5 text-left p-1.5 rounded-lg transition-all border cursor-pointer ${
                      isP1
                        ? 'bg-sky-500/25 border-sky-400'
                        : isP2
                        ? 'bg-rose-500/25 border-rose-400'
                        : 'bg-white/[0.05] border-white/15 hover:bg-white/[0.1] hover:border-white/30'
                    }`}
                  >
                    <FounderPortrait fighter={f} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[8px] font-mono font-bold uppercase tracking-wider truncate"
                          style={{ color: accent }}
                        >
                          {f.company.split(' ')[0]}
                        </span>
                        {isP1 && (
                          <span className="px-1 rounded text-[7px] font-mono font-black bg-sky-400 text-slate-950">
                            P1
                          </span>
                        )}
                        {isP2 && (
                          <span className="px-1 rounded text-[7px] font-mono font-black bg-rose-500 text-white">
                            P2
                          </span>
                        )}
                      </div>
                      <div className="font-display text-[10px] font-bold text-white truncate mt-0.5">
                        {f.name}
                      </div>
                      <div className="text-[8px] font-mono text-slate-300 truncate">
                        {f.latestModel.split('&')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* =========================================================
          SCREEN 2: ACTIVE COMBAT HUD (Zero Middle-Screen Blocks + Sleek Glassmorphic Controls!)
         ========================================================= */}
      {activeScreen === 'combat' && (
        <div className="relative z-10 flex flex-col justify-between h-[calc(100vh-2.75rem)] pointer-events-none p-1.5 sm:p-3">
          {/* TOP COMPACT GLASSMORPHIC HEALTH HUD + SLIM TOP AUDIO TICKER */}
          <div className="w-full max-w-5xl mx-auto pointer-events-auto">
            <div className="grid grid-cols-11 items-center gap-1.5 sm:gap-3 bg-slate-950/55 border border-white/20 rounded-xl p-1.5 sm:p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              {/* P1 Health & Market Cap */}
              <div className="col-span-5 flex items-center gap-2">
                <div className="hidden sm:block">
                  <FounderPortrait fighter={p1Fighter} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-display text-[11px] sm:text-sm font-black text-white uppercase truncate">
                      {p1Fighter.name}
                    </span>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-sky-300 ml-1">
                      {Math.round(telemetry.p1Hp)}%
                    </span>
                  </div>

                  <div className="w-full h-2 sm:h-3 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-100"
                      style={{ width: `${telemetry.p1Hp}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-1">
                      {[0, 1].map((r) => (
                        <span
                          key={r}
                          className={`w-2 h-2 rotate-45 border ${
                            telemetry.p1RoundsWon > r
                              ? 'bg-amber-400 border-amber-200'
                              : 'bg-white/10 border-white/25'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ${
                          telemetry.p1Meter >= 100 ? 'bg-amber-400 animate-pulse' : 'bg-amber-400/80'
                        }`}
                        style={{ width: `${telemetry.p1Meter}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-amber-300">
                      {Math.round(telemetry.p1Meter)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Match Clock */}
              <div className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-amber-400/40 bg-white/[0.06] py-0.5">
                <span className="text-[7px] font-mono uppercase text-amber-300">
                  R0{telemetry.currentRound}
                </span>
                <div className="font-display text-sm sm:text-lg font-black text-amber-400">
                  {telemetry.timer}
                </div>
              </div>

              {/* P2 Health & Market Cap */}
              <div className="col-span-5 flex items-center gap-2 text-right">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-rose-300 mr-1">
                      {Math.round(telemetry.p2Hp)}%
                    </span>
                    <span className="font-display text-[11px] sm:text-sm font-black text-white uppercase truncate">
                      {p2Fighter.name}
                    </span>
                  </div>

                  <div className="w-full h-2 sm:h-3 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-rose-500 via-orange-500 to-amber-400 ml-auto transition-all duration-100"
                      style={{ width: `${telemetry.p2Hp}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1.5 mt-1">
                    <span className="text-[8px] font-mono text-amber-300">
                      {Math.round(telemetry.p2Meter)}%
                    </span>
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ml-auto transition-all duration-100 ${
                          telemetry.p2Meter >= 100 ? 'bg-amber-400 animate-pulse' : 'bg-amber-400/80'
                        }`}
                        style={{ width: `${telemetry.p2Meter}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1].map((r) => (
                        <span
                          key={r}
                          className={`w-2 h-2 rotate-45 border ${
                            telemetry.p2RoundsWon > r
                              ? 'bg-amber-400 border-amber-200'
                              : 'bg-white/10 border-white/25'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <FounderPortrait fighter={p2Fighter} size="sm" />
                </div>
              </div>
            </div>

            {/* SLIM AI FRAME-TRAP TELEMETRY, QUICK FOUNDER PILLS & 16-MOVE MATRIX READOUT BAR */}
            <div className="mt-1 px-2.5 py-1 rounded-lg bg-slate-950/65 border-l-2 border-amber-400 border border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] sm:text-[10px] text-slate-200 pointer-events-auto">
              <span className="truncate">
                AI ENGINE: {telemetry.aiReadout || '16-MOVE MATRIX & 3D BONE COLLISION ACTIVE'}
              </span>

              {/* Quick Founder Switcher Pills */}
              <div className="hidden lg:flex items-center gap-1">
                {[FIGHTERS[0], FIGHTERS[2], FIGHTERS[4], FIGHTERS[5], FIGHTERS[11], FIGHTERS[3]].map(
                  (f) => (
                    <button
                      key={f.id}
                      onClick={() => handleQuickSwapFounder(f)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-display font-bold uppercase transition-colors cursor-pointer ${
                        p1Fighter.id === f.id
                          ? 'bg-sky-400 text-slate-950'
                          : 'bg-slate-900/90 border border-white/15 text-slate-300 hover:text-white'
                      }`}
                    >
                      {f.name.split(' ')[0]}
                    </button>
                  )
                )}
              </div>

              <span className="text-amber-300 font-bold shrink-0">
                {telemetry.p1Combo > 1
                  ? `${telemetry.p1Combo}x P1 CHAIN!`
                  : telemetry.p2Combo > 1
                  ? `${telemetry.p2Combo}x P2 CHAIN!`
                  : '16-MOVE MATRIX [F/G/T/H/R]'}
              </span>
            </div>

          </div>

          {/* COMIC-STYLE HIT WORDS ONLY (Zero Talking Blocks or Chat Bubbles) */}
          <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
            {telemetry.popups.map((pop) => (
              <div
                key={pop.id}
                style={{ left: `${pop.xPercent}%`, top: `${pop.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300"
              >
                <div
                  className="font-display italic text-lg sm:text-2xl font-black uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
                  style={{
                    color: pop.color,
                    textShadow: '0 0 10px #000, 2px 2px 0px #ff2a55',
                  }}
                >
                  {pop.text}
                </div>
                {pop.subtext && (
                  <div className="font-mono text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/20 inline-block mt-0.5">
                    {pop.subtext}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 100% UNOBSTRUCTED MIDDLE 3D ARENA VIEWPORT */}
          <div className="my-auto" />

          {/* =========================================================
              BOTTOM COMPACT TRANSLUCENT GLASSMORPHIC CONTROL CAPSULE
              (Slim, centered, see-through glass buttons — never bulky or blackish!)
             ========================================================= */}
          <div className="w-full max-w-sm mx-auto pointer-events-auto mt-auto px-1">
            <div className="flex justify-between items-center mb-1 px-1">
              <button
                onClick={handleCycleCamera}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-[9px] font-mono text-slate-200 uppercase"
              >
                <Camera className="w-3 h-3 text-sky-300" />
                <span>{cameraMode.replace('_', ' ')}</span>
              </button>

              {gameMode === 'ai_vs_ai' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-200 font-mono text-[8px] uppercase">
                  A2A Story Active
                </span>
              )}

              <button
                onClick={() => setDockCollapsed(!dockCollapsed)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-[9px] font-mono text-slate-200 uppercase"
              >
                <span>{dockCollapsed ? 'Show HUD' : 'Hide HUD'}</span>
                {dockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {!dockCollapsed && (
              <div className="bg-white/[0.05] border border-white/20 rounded-2xl p-1.5 space-y-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.22)]">
                {/* ROW 1: COMPACT GLASSMORPHIC PUNCH / KICK / GRAB / SPECIAL / ULTIMATE */}
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction('light');
                    }}
                    className="h-9 rounded-xl bg-sky-400/15 hover:bg-sky-400/25 active:bg-sky-400/45 border border-sky-300/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-sky-100 font-display text-[10px] font-bold uppercase flex items-center justify-center touch-none cursor-pointer transition-all"
                  >
                    PUNCH [F]
                  </button>

                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction('heavy');
                    }}
                    className="h-9 rounded-xl bg-rose-400/15 hover:bg-rose-400/25 active:bg-rose-400/45 border border-rose-300/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-rose-100 font-display text-[10px] font-bold uppercase flex items-center justify-center touch-none cursor-pointer transition-all"
                  >
                    KICK [G]
                  </button>

                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction('grab');
                    }}
                    className="h-9 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 active:bg-amber-400/45 border border-amber-300/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-amber-100 font-display text-[10px] font-bold uppercase flex items-center justify-center touch-none cursor-pointer transition-all"
                  >
                    GRAB [T]
                  </button>

                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction('special');
                    }}
                    disabled={telemetry.p1EmbargoTimer > 0}
                    className="h-9 rounded-xl bg-cyan-400/15 hover:bg-cyan-400/25 active:bg-cyan-400/45 border border-cyan-300/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-cyan-100 font-display text-[10px] font-bold uppercase flex items-center justify-center touch-none cursor-pointer transition-all"
                  >
                    SPEC [H]
                  </button>

                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction(
                        telemetry.p1Meter >= 50 ? 'ultimate' : 'qcf'
                      );
                    }}
                    className={`h-9 rounded-xl font-display text-[10px] font-black uppercase flex items-center justify-center border shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all touch-none cursor-pointer ${
                      telemetry.p1Meter >= 50
                        ? 'bg-amber-400/40 text-amber-100 border-amber-300 animate-pulse'
                        : 'bg-purple-400/15 hover:bg-purple-400/25 text-purple-100 border-purple-300/45'
                    }`}
                  >
                    {telemetry.p1Meter >= 50 ? '★ ULT [R]' : '★ QCF'}
                  </button>
                </div>

                {/* ROW 2: COMPACT GLASSMORPHIC MOVEMENT & DEFENSE */}
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    {...bindPadButton('left')}
                    className="h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:bg-sky-400/35 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-white font-display text-[10px] font-bold uppercase flex items-center justify-center gap-0.5 touch-none"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>L</span>
                  </button>

                  <button
                    {...bindPadButton('jump')}
                    className="h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:bg-sky-400/35 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-slate-100 font-mono text-[9px] font-bold uppercase flex items-center justify-center gap-0.5 touch-none"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>JMP</span>
                  </button>

                  <button
                    {...bindPadButton('block')}
                    className="h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:bg-sky-400/35 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-sky-200 font-mono text-[9px] font-bold uppercase flex items-center justify-center gap-0.5 touch-none"
                  >
                    <Shield className="w-3 h-3" />
                    <span>GRD</span>
                  </button>

                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      engineRef.current?.triggerUIAction('dash');
                    }}
                    className="h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:bg-emerald-400/35 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-emerald-200 font-mono text-[9px] font-bold uppercase flex items-center justify-center gap-0.5 touch-none"
                  >
                    <Zap className="w-3 h-3" />
                    <span>DSH</span>
                  </button>

                  <button
                    {...bindPadButton('right')}
                    className="h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:bg-sky-400/35 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-white font-display text-[10px] font-bold uppercase flex items-center justify-center gap-0.5 touch-none"
                  >
                    <span>R</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 3: GLOBAL FACTION WAR STANDINGS
         ========================================================= */}
      {activeScreen === 'factions' && (
        <div className="relative z-10 max-w-5xl mx-auto my-4 sm:my-6 bg-slate-950/80 border border-white/20 rounded-2xl p-4 sm:p-6 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
                GLOBAL COMPUTE HEGEMONY
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-white uppercase mt-1">
                SOVEREIGN FACTION LEADERBOARD
              </h1>
            </div>
            <button
              onClick={() => setActiveScreen('roster')}
              className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-display text-xs font-black uppercase tracking-wider"
            >
              Back to Roster
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {FACTIONS.map((fac) => {
              const pts = factionPoints[fac.id] || fac.basePoints;
              const members = FIGHTERS.filter((f) => f.faction === fac.id);
              return (
                <div key={fac.id} className="bg-white/[0.05] border border-white/15 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display text-sm font-black uppercase"
                      style={{ color: fac.color }}
                    >
                      {fac.name}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {pts.toLocaleString()} PTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{fac.desc}</p>
                  <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, (pts / 2000) * 100)}%`,
                        backgroundColor: fac.color,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono bg-white/[0.06] border border-white/15 text-slate-200"
                      >
                        <FounderPortrait fighter={m} size="sm" className="w-5 h-5" />
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 4: 20-FOUNDER FLAGSHIP MODELS, PHILOSOPHIES & MOVESET CODEX
         ========================================================= */}
      {activeScreen === 'codex' && (
        <div className="relative z-10 max-w-6xl mx-auto my-4 sm:my-6 bg-slate-950/80 border border-white/20 rounded-2xl p-4 sm:p-6 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">
                FRONTIER MODELS, ENGINEERING PHILOSOPHIES & MOVESETS
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-white uppercase mt-1">
                20-FOUNDER CODEX & MALE VOICE ARCHIVE
              </h1>
            </div>
            <button
              onClick={handleQuickLaunchCombat}
              className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-display text-xs font-black uppercase tracking-wider"
            >
              Fight Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {FIGHTERS.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-white/[0.05] border border-white/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <FounderPortrait fighter={f} size="md" />
                      <div>
                        <span className="font-display text-sm font-black text-white uppercase">
                          {f.name}
                        </span>
                        <div className="text-xs font-mono text-sky-400">{f.company}</div>
                        <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                          MODEL: {f.latestModel}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => {
                          audioRef.current.init();
                          audioRef.current.speakFounderQuote(
                            f.philosophyQuotes[0],
                            f.voicePitch,
                            f.voiceRate
                          );
                        }}
                        className="px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-amber-300 font-mono text-[9px] uppercase"
                      >
                        🗣 Hear Voice
                      </button>
                      <button
                        onClick={() => {
                          setP1Fighter(f);
                          handleQuickLaunchCombat();
                        }}
                        className="px-2 py-1 rounded bg-sky-400/20 hover:bg-sky-400 hover:text-slate-950 border border-sky-400/60 text-sky-200 font-mono text-[9px] font-bold uppercase"
                      >
                        Fight as {f.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 bg-black/40 p-2 rounded-lg border-l-2 border-amber-400">
                    {f.philosophyQuotes.map((q, idx) => (
                      <p key={idx} className="text-[11px] text-slate-200 italic">
                        • "{q}"
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="font-mono text-sky-300 font-bold">
                      {f.specialInput} • {f.specialName}
                    </div>
                    <div className="text-slate-300 mt-0.5">{f.specialDesc}</div>
                  </div>
                  <div>
                    <div className="font-mono text-amber-300 font-bold">
                      [R] • {f.ultimateName}
                    </div>
                    <div className="text-slate-300 mt-0.5">{f.ultimateDesc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 5: SILICON VALLEY FACTION TERRITORY WAR ROOM MAP
         ========================================================= */}
      {activeScreen === 'warmap' && (
        <div className="relative z-10 max-w-4xl mx-auto my-4 sm:my-6 bg-slate-950/90 border-2 border-sky-400/70 rounded-2xl p-5 sm:p-6 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-[0_0_50px_rgba(0,243,255,0.28)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
                {diamondProfile.handle.toUpperCase()} // {diamondProfile.faction.toUpperCase()} // ELO: {diamondProfile.elo} ({getEloRankTitle(diamondProfile.elo)})
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-sky-300 uppercase mt-1">
                SILICON VALLEY TERRITORY WAR ROOM
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRoomModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 border border-amber-400 text-amber-300 font-display text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                🌐 P2P Room Lobby
              </button>
              <button
                onClick={handleQuickLaunchCombat}
                className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-display text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                ⚔️ Launch Battle
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 font-mono">
            Click any global compute sector below to deploy {p1Fighter.name} and capture regional server hegemony:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {Object.keys(DEFAULT_TERRITORIES).map((sectorName) => {
              const owned = Boolean(diamondProfile.territories[sectorName]);
              const meta = SECTOR_META[sectorName];
              const defender =
                FIGHTERS.find((f) => f.id === meta.defenderId) || FIGHTERS[4];

              return (
                <div
                  key={sectorName}
                  onClick={() => {
                    audioRef.current.init();
                    audioRef.current.playSelect(true);
                    setP2Fighter(defender);
                    engineRef.current?.setStage(meta.stageId);
                    setActiveScreen('combat');
                    engineRef.current?.startMatch(p1Fighter, defender, gameMode);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    owned
                      ? 'bg-emerald-500/10 border-emerald-400/70 hover:bg-emerald-500/20'
                      : 'bg-slate-900/80 border-white/15 hover:border-sky-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-black text-white uppercase">
                        {sectorName}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          owned
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {owned ? 'SECURED' : 'CONTESTED'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-amber-300 mt-1">
                      {meta.buffLabel}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span>BOSS: {defender.name}</span>
                    <span className="text-sky-300 font-bold">DEPLOY →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SOVEREIGN PASSPORT, EXOSUIT LOCKER & FACE PHOTO UPLOADER
         ========================================================= */}
      {passportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-lg w-full bg-slate-950 border-2 border-sky-400 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,243,255,0.35)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <h2 className="font-display text-lg font-black text-amber-400 uppercase">
                  SOVEREIGN PASSPORT & LOCKER
                </h2>
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  ELO: {diamondProfile.elo} • {getEloRankTitle(diamondProfile.elo)} • ⚡ {diamondProfile.computeCredits} CC
                </div>
              </div>
              <button
                onClick={() => setPassportModalOpen(false)}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-white cursor-pointer"
              >
                ✕ ESC
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {/* Operator Handle & Faction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-sky-300 uppercase mb-1">
                    OPERATOR HANDLE
                  </label>
                  <input
                    type="text"
                    value={diamondProfile.handle}
                    onChange={(e) => {
                      const updated = { ...diamondProfile, handle: e.target.value };
                      setDiamondProfile(updated);
                      localStorage.setItem('SOVEREIGN_DIAMOND_PROFILE', JSON.stringify(updated));
                    }}
                    className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-sky-300 uppercase mb-1">
                    FACTION ALLIANCE
                  </label>
                  <select
                    value={diamondProfile.faction}
                    onChange={(e) => {
                      const updated = { ...diamondProfile, faction: e.target.value };
                      setDiamondProfile(updated);
                      localStorage.setItem('SOVEREIGN_DIAMOND_PROFILE', JSON.stringify(updated));
                    }}
                    className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-400"
                  >
                    <option value="House xAI">House xAI (Grok)</option>
                    <option value="OpenAI">OpenAI (GPT-5)</option>
                    <option value="Anthropic">Anthropic (Claude)</option>
                    <option value="Google DeepMind">Google DeepMind (Gemini)</option>
                    <option value="NVIDIA Sovereign">NVIDIA Sovereign (Blackwell)</option>
                    <option value="Meta Open">Meta Open (Llama 4)</option>
                  </select>
                </div>
              </div>

              {/* Exosuit Shader Customization */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-amber-300 uppercase mb-1.5">
                  3D EXOSUIT MATERIAL SHADER ({p1Fighter.name})
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'standard', label: 'Standard Issue' },
                      { id: 'obsidian_carbon', label: 'Obsidian Carbon-Fiber' },
                      { id: 'sovereign_gold', label: 'Sovereign Gold-Plated' },
                      { id: 'quantum_chrome', label: 'Quantum Chrome' },
                    ] as { id: ExosuitFinishId; label: string }[]
                  ).map((suit) => (
                    <button
                      key={suit.id}
                      onClick={() => {
                        const updated = { ...diamondProfile, exosuit: suit.id };
                        setDiamondProfile(updated);
                        localStorage.setItem('SOVEREIGN_DIAMOND_PROFILE', JSON.stringify(updated));
                        engineRef.current?.setExosuitFinish(suit.id);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-display font-bold uppercase cursor-pointer transition-all ${
                        diamondProfile.exosuit === suit.id
                          ? 'bg-sky-400 text-slate-950 border-sky-300'
                          : 'bg-slate-900/90 text-slate-200 border-white/15 hover:border-sky-400/60'
                      }`}
                    >
                      {suit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase 1: Custom Face Portrait Photo Uploader (THREE.TextureLoader) */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-400/40">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-display font-black text-white uppercase">
                      📸 NEURAL 3D FACE PHOTO MAP ({p1Fighter.name})
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Upload any front-facing portrait photo to wrap directly onto {p1Fighter.name}&apos;s 3D head mesh via THREE.TextureLoader:
                    </p>
                  </div>
                  {getCustomFounderFacePhoto(p1Fighter.id) && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[9px] uppercase shrink-0">
                      CUSTOM PHOTO ACTIVE ({faceUploadVersion >= 0 ? 'MAPPED' : ''})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <label className="px-3 py-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-display text-xs font-black uppercase cursor-pointer">
                    <span>Upload Portrait Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setCustomFounderFacePhoto(p1Fighter.id, reader.result);
                            setFaceUploadVersion((v) => v + 1);
                            engineRef.current?.refreshFightersAppearance();
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  {getCustomFounderFacePhoto(p1Fighter.id) && (
                    <button
                      onClick={() => {
                        setCustomFounderFacePhoto(p1Fighter.id, null);
                        setFaceUploadVersion((v) => v + 1);
                        engineRef.current?.refreshFightersAppearance();
                      }}
                      className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-rose-200 font-mono text-xs uppercase cursor-pointer"
                    >
                      Reset to Default 3D Sculpt
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setPassportModalOpen(false);
                    setActiveScreen('warmap');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  🗺️ Enter War Room
                </button>
                <button
                  onClick={() => setPassportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SOVEREIGN P2P ROOM CODE LOBBY
         ========================================================= */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-slate-950 border-2 border-amber-400 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(255,204,0,0.3)]">
            <h2 className="font-display text-xl font-black text-amber-400 uppercase">
              SOVEREIGN LOBBY P2P
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-1 mb-4">
              Enter a 4-character Room Code to synchronize peer matchups:
            </p>

            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. GROK-99"
              className="w-full bg-slate-900 border border-sky-400/60 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-[0.25em] text-white outline-none"
            />

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => {
                  const code = roomCodeInput.trim() || 'GROK-99';
                  setActiveRoomCode(code);
                  setRoomModalOpen(false);
                  setGameMode('versus');
                  handleQuickLaunchCombat();
                }}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Connect Room
              </button>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: GITHUB REPOSITORY & PUSH COMMAND CENTER
         ========================================================= */}
      {githubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-2xl w-full bg-slate-950 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-black text-emerald-400 uppercase">
                  📦 GITHUB REPOSITORY & PUSH CENTER
                </h2>
                <div className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">
                  Full Production Repo Ready • README.md • ARCHITECTURE.md • CI/CD • Dockerfile • MIT License
                </div>
              </div>
              <button
                onClick={() => setGithubModalOpen(false)}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-white cursor-pointer"
              >
                ✕ ESC
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-emerald-300 uppercase mb-1">
                    GITHUB USERNAME / ORG
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value.trim())}
                    className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-emerald-300 uppercase mb-1">
                    REPOSITORY NAME
                  </label>
                  <input
                    type="text"
                    value={githubRepoName}
                    onChange={(e) => setGithubRepoName(e.target.value.trim())}
                    className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-sky-300 uppercase">
                    TERMINAL COMMANDS TO CREATE & PUSH YOUR REPO
                  </span>
                  <button
                    onClick={() => {
                      const cmd = `git init\ngit add .\ngit commit -m "feat: release Silicon Kombat: Sovereign Zenith (Diamond Edition)"\ngit branch -M main\ngit remote add origin https://github.com/${githubUsername || 'YOUR_USERNAME'}/${githubRepoName || 'silicon-kombat-sovereign-zenith'}.git\ngit push -u origin main`;
                      navigator.clipboard?.writeText(cmd);
                      setCopiedGitCmd(true);
                      window.setTimeout(() => setCopiedGitCmd(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display text-[10px] font-black uppercase cursor-pointer"
                  >
                    {copiedGitCmd ? '✓ COPIED TO CLIPBOARD' : '📋 COPY GIT COMMANDS'}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900/95 border border-emerald-400/40 font-mono text-[11px] text-emerald-200 overflow-x-auto leading-relaxed select-all">
{`git init
git add .
git commit -m "feat: release Silicon Kombat: Sovereign Zenith (Diamond Edition)"
git branch -M main
git remote add origin https://github.com/${githubUsername || 'YOUR_USERNAME'}/${githubRepoName || 'silicon-kombat-sovereign-zenith'}.git
git push -u origin main`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/15">
                <div className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-2">
                  INCLUDED PRODUCTION REPOSITORY FILES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-200">
                  <div>• <span className="text-sky-300">README.md</span> (Badges, 16-Move Matrix, Setup)</div>
                  <div>• <span className="text-sky-300">ARCHITECTURE.md</span> (3D Rig & Collision Spec)</div>
                  <div>• <span className="text-sky-300">CONTRIBUTING.md</span> (Founder & Stage Guide)</div>
                  <div>• <span className="text-sky-300">LICENSE</span> (MIT Open-Source License)</div>
                  <div>• <span className="text-sky-300">.github/workflows/ci.yml</span> (GitHub Actions CI)</div>
                  <div>• <span className="text-sky-300">Dockerfile</span> (Node 20 Cloud Container)</div>
                  <div>• <span className="text-sky-300">server.ts</span> (Express + Gemini 2.5 Fenrir TTS)</div>
                  <div>• <span className="text-sky-300">src/engine/*</span> (Full 3D WebGL Engine Suite)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          POST-MATCH VERDICT — CLOSE-FIGHT REMATCH OR NEXT CHALLENGER
         ========================================================= */}
      {matchResultModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
          <div className="max-w-lg w-full bg-slate-950/90 border border-amber-400/70 rounded-2xl p-5 sm:p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-center mb-3">
              <FounderPortrait
                fighter={matchResultModal.p1Won ? p1Fighter : p2Fighter}
                size="lg"
              />
            </div>

            <div className="text-xs font-mono uppercase tracking-[0.18em] text-amber-400">
              {matchResultModal.isCloseFight
                ? `⚡ RAZOR-CLOSE PHOTO FINISH (${matchResultModal.winnerHp}% HP LEFT)`
                : `🏆 DECISIVE VICTORY (${matchResultModal.p1Rounds} - ${matchResultModal.p2Rounds})`}
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase mt-1">
              {matchResultModal.p1Won ? p1Fighter.name : p2Fighter.name} WINS
            </h2>

            <div className="mt-3 p-3 rounded-xl bg-white/[0.05] border border-white/15 text-left">
              <div className="text-[10px] font-mono text-amber-300 uppercase font-bold">
                FLAGSHIP MODEL: {(matchResultModal.p1Won ? p1Fighter : p2Fighter).latestModel}
              </div>
              <p className="text-xs text-slate-200 italic mt-1">
                "{(matchResultModal.p1Won ? p1Fighter : p2Fighter).philosophyQuotes[1]}"
              </p>
            </div>

            {(gameMode === 'ai_vs_ai' || gameMode === 'story') && autoAdvanceCountdown !== null && (
              <div className="mt-3 py-1.5 px-3 rounded-lg bg-sky-500/15 border border-sky-400/50 text-sky-200 font-mono text-xs">
                {matchResultModal.isCloseFight
                  ? `Close Fight! Instant Rematch starting in ${autoAdvanceCountdown}s...`
                  : `Advancing to Next Story Challenger in ${autoAdvanceCountdown}s...`}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
              <button
                onClick={handleReturnToRoster}
                className="py-2.5 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] border border-white/20 text-xs font-mono uppercase text-slate-200 cursor-pointer"
              >
                Roster
              </button>
              <button
                onClick={handleRematchNow}
                className={`py-2.5 px-3 rounded-xl font-display text-xs font-black uppercase tracking-wider cursor-pointer ${
                  matchResultModal.isCloseFight
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/25'
                }`}
              >
                Rematch Now
              </button>
              <button
                onClick={handleAdvanceToNextFighter}
                className={`py-2.5 px-3 rounded-xl font-display text-xs font-black uppercase tracking-wider cursor-pointer ${
                  !matchResultModal.isCloseFight
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                    : 'bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/25'
                }`}
              >
                Next Fighter →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
