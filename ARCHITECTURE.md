# 🏛️ Architecture & 3D Engine Specification

**SILICON KOMBAT: SOVEREIGN ZENITH** is engineered as a zero-dependency-asset, 60FPS WebGL 2.0 fighting game built on **Three.js**, **React 19**, **Express**, and **Google Gemini 2.5 Flash Neural TTS**. Every 3D character rig, normal map, company logo, stage landmark, and strike sound effect is synthesized in real time or hot-loaded via `THREE.TextureLoader`.

---

## 1. 3D Anatomical Skeletal Rig & Neural Face Pipeline (`src/engine/FighterRig3D.ts`)

### Hierarchical Bone Graph
Each fighter is constructed as a hierarchical `THREE.Group` skeletal tree scaled to `0.82 × heightScale` so characters never clip the top broadcast HUD:
```text
root (THREE.Group)
 ├── shadowDisc (Radial contact shadow plane)
 ├── shieldMesh (Wireframe energy guard sphere)
 ├── auraLight (PointLight rim aura)
 └── hips (Pelvis root @ y = 0.88)
      ├── torso (Abs, V-taper Pecs with 1024x1024 Company Logo, Neck, Gear)
      │    ├── head (64x48 Cranium + 3D Nose + 3D Ears + Elevated Hair Crown @ y = +0.215)
      │    ├── shoulderL (armL) -> elbowL (forearmL) -> handL (Fist hitbox bone)
      │    └── shoulderR (armR) -> elbowR (forearmR) -> handR (Fist hitbox bone)
      ├── legL -> kneeL (shinL) -> bootL (Left boot hitbox bone)
      └── legR -> kneeR (shinR) -> bootR (Right boot hitbox bone)
```

### Front-Planar Facial UV Unwrap & `THREE.TextureLoader` Override
- Forward-facing vertices (`z > 0.015`) on the 64×48 cranial sphere are projected onto `[0.04, 0.96]` UV coordinates (`uProj`, `vProj`), preventing polar pinching.
- By default, `createPhotorealisticFaceTexture(dna)` renders a 1024×1024 portrait canvas with dermal subsurface scattering, almond eyes, radial irises, catchlights, eyebrows, nasolabial folds, and facial hair.
- When a user uploads a custom portrait image in the **Sovereign Locker**, `resolveFounderFaceTexture()` loads the image via `THREE.TextureLoader` (`SRGBColorSpace`, `ClampToEdgeWrapping`) and binds it alongside procedural 256×256 micro-pore normal maps (`getSkinMicroNormalMap()`) and T-zone roughness maps (`getSkinRoughnessMap()`).

---

## 2. 4-Phase Martial Arts Kinematics & True 3D Bone Collision (`src/engine/SiliconCombatKinematics3D.ts`)

### 4-Phase Strike Interpolation
Instead of linear interpolation, active moves in `SiliconArena3D.ts` transition through four distinct biomechanical phases:
1. **Coil / Windup (`0 → 70%` of startup)**: Cocks the rear shoulder and rotates the hips away from the target.
2. **Snap Extension (`70% → 100%` of startup)**: Applies a non-linear power curve (`alpha = Math.pow(t, 0.35)`) for explosive fist/boot velocity.
3. **Impact Hold (`activeStart → activeEnd`)**: Locks the striking limb at full extension during active hit frames, paired with 4–7 frames of arcade **hitstop freeze**.
4. **Guard Recovery (`activeEnd → totalFrames`)**: Smoothly interpolates (`smoothstep`) back to `NEUTRAL_GUARD_POSE`.

### World-Space Euclidean Bone Collision (`checkTrue3DBoneCollision`)
During active frames (`frame >= move.activeStart && frame <= move.activeEnd`), the engine queries the exact 3D world-space matrix position of the active striking bone (`handL`, `handR`, `bootL`, `bootR`, or `shinR`) via `mesh.getWorldPosition(strikeWorldPos)` and measures its 3D Euclidean distance against the defender's `head`, `torso`, and `hips`.

---

## 3. Post-Processing & Lighting Pipeline (`src/engine/SiliconArena3D.ts`)

- **Tone Mapping**: `THREE.ACESFilmicToneMapping` at base exposure `1.05`. Heavy impacts and Ultimates invoke `triggerCinematicImpact(true)`, spiking exposure to `1.52` for `80ms` alongside camera trauma shake.
- **Bloom Pipeline**: `EffectComposer` + `RenderPass` + `UnrealBloomPass(strength: 0.38, radius: 0.35, threshold: 0.85)` so neon stage elements, projectiles, and energy shields glow without washing out facial skin tones.
- **3-Point Studio Lighting**: Warm key directional light (`2048×2048` PCFSoftShadowMap), cool fill light, and dual arena-colored rim point lights.

---

## 4. Spatialized Neural TTS & 3-Layer Audio Synthesis (`src/engine/CyberAudio.ts` & `server.ts`)

- **Server-Side Gemini 2.5 Flash TTS (`/api/tts/announcer`)**: `server.ts` proxies requests to `gemini-2.5-flash-preview-tts` with `voiceName: 'Fenrir'`. The client decodes raw 24kHz 16-bit mono PCM into a `Float32Array` `AudioBuffer` and routes it through a `StereoPannerNode` panned according to the fighter's 3D X position (`pan = clamp(x / 4.2, -1, 1)`).
- **3-Layer Procedural Strike Audio**: Every hit synthesizes three concurrent WebAudio layers:
  - **Layer 1 (Sub-Bass Thud)**: Sine oscillator sweeping `155Hz → 28Hz`.
  - **Layer 2 (Leather Crack)**: Bandpass-filtered white noise burst with exponential decay.
  - **Layer 3 (Metallic Transient Ring)**: Sawtooth harmonic transient on heavy/counter hits.
