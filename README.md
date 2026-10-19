# ⚡ SILICON KOMBAT: SOVEREIGN ZENITH (Diamond Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183_WebGL2-000000?style=for-the-badge&logo=threedotjs&logoColor=00f3ff)](https://threejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Gemini 2.5 Flash TTS](https://img.shields.io/badge/Gemini_2.5_Flash-Fenrir_Neural_TTS-10B981?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffcc00?style=for-the-badge)](./LICENSE)

> **The Definitive 60FPS 3D WebGL Fighting Engine for Global Compute Hegemony.**  
> Pit 20 iconic Silicon Valley founders against each other across 10 architectural 3D Tech Headquarters with 4-phase martial arts kinematics, true 3D bone-to-limb collision detection, custom `THREE.TextureLoader` portrait face mapping, 3D *Hostile Takeover* Fatalities, and a persistent Silicon Valley Territory War meta-game.

---

## 🌟 Diamond-Status Highlights

### 1. 🧬 Neural 3D Face Mapping & Custom Portrait Photo Uploader (`src/engine/FighterRig3D.ts`)
- **Front-Projected 1024×1024 Portrait Mapping**: Every founder head uses a sculpted 64×48 cranial mesh with front-planar UV projection (`uProj`, `vProj`), dermal subsurface gradients, almond eyes with radial irises, catchlights, contoured noses, and real 3D ear/nose geometry.
- **Custom Face Photo Upload (`THREE.TextureLoader`)**: Click **`⚡ ELO • 📸 LOCKER`** in the top bar to upload any front-facing portrait image (`.jpg`, `.png`, `.webp`) for any founder. The engine loads it dynamically with `SRGBColorSpace` and `ClampToEdgeWrapping`, pairs it with procedural skin micro-pore normal maps (`normalMap`) and sweat/oil roughness maps (`roughnessMap`), and persists it in `localStorage`.
- **Zero-Occlusion Elevated 3D Hair Crown (`y = +0.215`, `z = -0.04`)**: Custom 3D hairstyles, metallic rimless/aviator glasses, and 1024×1024 PBR company chest logos (SpaceX, OpenAI, NVIDIA Blackwell, Meta Llama, Google Gemini, Anthropic, AWS, Sovereign Silicon).

### 2. 🥋 16-Move Master Martial Arts Matrix & 4-Phase Kinetic Sequencing (`src/engine/SiliconCombatKinematics3D.ts`)
- **4-Phase Strike Interpolation**: Every attack interpolates through **Phase 1: Coil/Windup → Phase 2: Snap Extension (`t^0.35`) → Phase 3: Active Impact Hold → Phase 4: Guard Recovery**.
- **True 3D World-Space Bone Collision (`checkTrue3DBoneCollision`)**: Computes real-time 3D Euclidean distances between the striking limb (`handL`, `handR`, `bootL`, `bootR`, `shinR`) and the defender's `head`, `torso`, and `hips` in world coordinates.
- **4 Anatomical Hit-Reaction Poses**: High Head-Whip, Mid Gut-Fold, Low Ankle-Sweep Tumble, and Airborne Juggle Launch.

### 3. 💀 Cinematic 3D "Hostile Takeover" Fatalities (`src/engine/SiliconArena3D.ts`)
- **Jensen Huang (`Blackwell Liquid-N2 Overload`)**: Summons an orbital NVIDIA Blackwell rack and flash-freezes the defeated opponent inside a glowing cyan/emerald crystalline silicon ice block.
- **Sam Altman (`$7 Trillion Monolith Drop`)**: Opens an emerald sky rift and drops a towering `$7T COMPUTE` monolith straight onto the defeated rival.
- **Mark Zuckerberg (`Kauai Octagon Submission Cage`)**: Encases the defeated rival inside an 8-pillar glowing blue laser Octagon cage.
- **Elon Musk (`Starship Booster Orbital Slam`)**: Drops a stainless-steel SpaceX Super Heavy booster column from orbit with plasma shockwave rings.

### 4. 🗺️ Global Silicon Valley Faction Territory War Room (`src/App.tsx`)
- Conquer **6 strategic compute sectors** (**Silicon Valley**, **Austin Starbase**, **Seattle Cloud**, **Taipei Fab 18**, **SF Mission AI**, and **Virginia Ashburn**).
- Each secured territory grants live combat buffs (`+3% Strike Damage` and `+8 Starting Meter` per conquered sector) and advances your **Sovereign Passport Elo Rating** from *Junior Prompt Engineer* (`1200`) to *Sovereign AGI Grandmaster* (`1600+`).

### 5. 🔊 Spatialized `Fenrir` Neural Esports Announcer & 3-Layer WebAudio Synthesis (`src/engine/CyberAudio.ts` & `server.ts`)
- **Server-Side Gemini 2.5 Flash TTS (`/api/tts/announcer`)**: Configured with the deep, booming male esports voice **`Fenrir`**, decoded from 24kHz 16-bit mono PCM and spatialized across the 3D stereo field (`StereoPannerNode`) based on arena X coordinates.
- **3-Layer Procedural Strike Audio**: Simultaneously synthesizes a **Low-End Sub-Bass Drop** (`155Hz → 28Hz` sine wave), **Mid-Range Leather Crack** (bandpass-filtered noise burst), and **High-End Metallic Ring** (sawtooth transient on heavy/counter hits).

---

## 🏛️ 10 Iconic 3D Tech Headquarters Stages (`src/engine/SiliconLandmarks3D.ts`)

| Stage ID | Landmark HQ | Signature 3D Architecture & Corner Wall-Splat Hazards |
| :--- | :--- | :--- |
| `starbase` | **SpaceX Starbase (Boca Chica)** | Towering Mechazilla Chopsticks & stainless-steel Starship Super Heavy stack; corner impacts trigger Raptor engine ignition plumes. |
| `colossus` | **xAI Colossus 100k H200 Supercluster** | Liquid-cooled NVIDIA H200 server corridors & pulsing optical interconnect conduits. |
| `openai_hq` | **OpenAI Stargate Compute Vault** | Floating emerald AGI containment core & towering tensor monoliths. |
| `googleplex` | **Googleplex & DeepMind Quantum Bay** | 4-color Tensor Processing Unit (TPU v6) rings & suspended cryostat chandeliers. |
| `meta_hq` | **1 Hacker Way & Kauai MMA Octagon** | Laser-fenced cage perimeter, holographic Llama weights, and tropical volcanic backdrop. |
| `nvidia_voyager` | **NVIDIA Voyager Santa Clara** | Giant triangular glass exoskeleton & golden Blackwell B200 silicon wafer monolith. |
| `anthropic_vault` | **Anthropic Constitutional Vault** | Warm terracotta & obsidian safety monoliths with golden alignment rings. |
| `tsmc_fab18` | **TSMC Fab 18 EUV Cleanroom (Tainan)** | Extreme Ultraviolet (EUV) lithography scanner lasers & overhead FOUP wafer transport pods. |
| `oracle_aws` | **AWS Us-East-1 & Oracle Cloud Citadel** | Hyperscale server towers, autonomous Prime delivery drones, and red database obelisks. |
| `apple_park` | **Apple Park Spaceship Ring** | Curved glass neo-brutalist ring & glowing M4 Ultra neural silicon floor die. |

---

## 🎮 Complete Controls & 16-Move Martial Arts Matrix

### Player 1 (Keyboard & Touch Glassmorphic Arcade Deck)
| Input | Move Name | Damage | Hit Location | Notes |
| :--- | :--- | :---: | :---: | :--- |
| `A` / `D` | **High-Speed Arcade Footwork** | — | — | Instant acceleration (`ACCEL = 0.45`, `FRICTION = 0.78`) |
| `W` | **High-Arc Jump** | — | — | Enables airborne dive kicks (`vy = 0.42`) |
| `S` (Hold) | **Energy Guard Dome** | — | — | Blocks high/mid strikes; reduces chip damage by 80% |
| `E` / `Shift` | **Forward Burst Dash** | — | — | Instant gap-closer with neon spark trail |
| `F` → `F` → `F` → `F` | **4-Hit Boxing Target Combo** | `6 → 8.5 → 12 → 15` | High / Launch | *Snap Jab → Right Cross → Spinning Backfist → Haymaker Uppercut* |
| `G` → `G` → `G` | **3-Hit Muay Thai Target Combo** | `9.5 → 13 → 16` | Mid / High / Launch | *Teep Side Kick → High Roundhouse → Axe Heel Drop* |
| `S` + `F` | **Liver Body Hook** | `9.0` | Mid | Heavy gut-fold stagger |
| `S` + `G` | **360° Low Leg Sweep** | `11.0` | Low | Unblockable standing; triggers ankle-sweep tumble |
| `Forward` + `G` | **Flying Tiger Bicycle Knee** | `14.5` | High / Launch | Advancing airborne knee launch |
| `Air` + `F` / `G` | **Meteor Air Dive Kick** | `12.5` | High | Diagonal air-to-ground dive strike |
| `T` | **Clinch Knee Takeover (Grab)** | `15.0` | Throw | **Unblockable** command grab; shatters guard domes |
| `H` | **Founder Signature Special** | `12.0+` | Special | Projectile / Counter Shield / Teleport / Armored Dash |
| `↓ ↘ →` + `H` | **Dragon Shoryu Uppercut (QCF)** | `17.5` | Launch | `+18%` motion input bonus + high vertical juggle launch |
| `R` | **Sovereign Overdrive Ultimate** | `24.0–28.0` | Ultimate | Requires `50%` Meter; triggers cinematic slow-mo & match Fatality |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** `v20+` (or **Bun** `v1.1+`)
- Optional: A **Google Gemini API Key** (`GEMINI_API_KEY`) for the server-side `Fenrir` Neural TTS announcer (automatically falls back to deep male Web Speech synthesis if omitted).

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/silicon-kombat-sovereign-zenith.git
cd silicon-kombat-sovereign-zenith
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (optional for neural TTS announcer)
```

### 3. Launch Full-Stack Dev Server (Port 3000)
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Typecheck & Production Build
```bash
npm run lint    # Runs strict TypeScript validation (tsc --noEmit)
npm run build   # Bundles optimized production client assets into dist/
npm start       # Starts the Express + Gemini TTS production server
```

---

## 📂 Repository Structure

```text
silicon-kombat-sovereign-zenith/
├── .github/workflows/ci.yml           # Automated GitHub Actions CI (TypeScript + Vite Build)
├── public/
│   └── silicon-kombat-diamond.html    # Portable single-file HTML5/Three.js Diamond Edition
├── src/
│   ├── components/
│   │   └── FounderPortrait.tsx        # SVG & procedural founder portrait renderer
│   ├── data/
│   │   └── roster.ts                  # 20-Founder stats, specials, ultimates, and quotes
│   ├── engine/
│   │   ├── CyberAudio.ts              # 3-layer WebAudio synth & spatialized Fenrir TTS player
│   │   ├── FighterRig3D.ts            # 3D anatomical rig, TextureLoader face map, normal maps
│   │   ├── SiliconArena3D.ts          # Core 60FPS 3D combat loop, AI, & 3D Fatalities
│   │   ├── SiliconCombatKinematics3D.ts # 16-Move keyframes, 4-phase interpolation, 3D bone collision
│   │   └── SiliconLandmarks3D.ts      # 10 procedural 3D Tech Headquarters stages & hazards
│   ├── App.tsx                        # HUD, War Map, Sovereign Passport, Locker & P2P Room UI
│   ├── index.css                      # Tailwind CSS v4 + custom arcade typography
│   └── main.tsx                       # React 19 entry point
├── ARCHITECTURE.md                    # Deep-dive 3D engine & kinematics documentation
├── CONTRIBUTING.md                    # Guide for adding new founders, stages, and moves
├── Dockerfile                         # Production container image definition
├── LICENSE                            # MIT License
├── package.json                       # Dependencies and scripts
├── README.md                          # Project documentation
└── server.ts                          # Express server + /api/tts/announcer Gemini 2.5 Flash route
```

---

## 📜 License

Released under the **[MIT License](./LICENSE)**. Built for high-speed 60FPS browser arcade combat.
