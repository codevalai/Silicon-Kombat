import * as THREE from 'three';

export type LandmarkStageId =
  | 'starbase'
  | 'colossus'
  | 'openai_hq'
  | 'googleplex'
  | 'meta_hq'
  | 'nvidia_voyager'
  | 'anthropic_vault'
  | 'tsmc_fab18'
  | 'apple_park'
  | 'oracle_aws';

export interface StageController {
  id: LandmarkStageId;
  name: string;
  subtitle: string;
  group: THREE.Group;
  update: (time: number) => void;
  triggerHazard: (intensity?: number) => void;
  triggerWallSplat: (side: -1 | 1) => void;
  destroy: (scene: THREE.Scene) => void;
}

export function getFounderHomeStageId(founderId: number): LandmarkStageId {
  const map: Record<number, LandmarkStageId> = {
    0: 'starbase',        // Elon Musk -> SpaceX Starbase Mechazilla Pad
    1: 'googleplex',      // Page & Brin -> Googleplex Bay View
    2: 'openai_hq',       // Sam Altman -> OpenAI Pioneer & Stargate Core
    3: 'anthropic_vault', // Dario & Daniela -> Anthropic Constitutional Library
    4: 'nvidia_voyager',  // Jensen Huang -> NVIDIA Voyager Triangle HQ
    5: 'meta_hq',         // Mark Zuckerberg -> Meta 1 Hacker Way & Kauai Octagon
    6: 'oracle_aws',      // Jeff Bezos -> AWS US-East-1 & Blue Origin Pad
    7: 'openai_hq',       // Bill Gates -> Redmond / Stargate Core
    8: 'oracle_aws',      // Larry Ellison -> Oracle Red Shogun Exadata Vault
    9: 'tsmc_fab18',      // Morris Chang -> TSMC Fab 18 2nm EUV Cleanroom
    10: 'openai_hq',      // Satya Nadella -> Azure Stargate Core
    11: 'googleplex',     // Sundar Pichai -> Googleplex Bay View Dragonscale
    12: 'colossus',       // Masayoshi Son -> Compute Gigafactory
    13: 'oracle_aws',     // Marc Benioff -> Cloud Tower
    14: 'colossus',       // Linus Torvalds -> Kernel Server Corridor
    15: 'googleplex',     // Demis Hassabis -> DeepMind Sycamore Quantum Lab
    16: 'colossus',       // Alexandr Wang -> Scale Data Foundry
    17: 'anthropic_vault',// Garry Tan -> San Francisco Pioneer Vault
    18: 'apple_park',     // Evan Spiegel -> California Glass Ring
    19: 'meta_hq',        // Daniel Ek -> Audio Octagon Arena
  };
  return map[founderId] || 'starbase';
}

export function getStageIdFromArenaId(arenaId: number): LandmarkStageId {
  const stages: LandmarkStageId[] = [
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
  return stages[arenaId % stages.length];
}

// Helper: Crisp 3D Architectural Signage Banner
function makeSignMesh(
  text: string,
  subtext: string,
  bgHex: string,
  borderHex: string,
  textHex: string,
  w = 3.6,
  h = 0.75
): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 1008, 240);

  ctx.fillStyle = textHex;
  ctx.font = '900 76px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 512, 128);

  ctx.fillStyle = borderHex;
  ctx.font = '700 36px Rajdhani, sans-serif';
  ctx.fillText(subtext, 512, 204);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}

export function buildIconicTechStage(
  scene: THREE.Scene,
  stageId: LandmarkStageId
): StageController {
  const group = new THREE.Group();
  scene.add(group);

  let hazardTimer = 0;
  const animatedParts: Array<(t: number, hazard: number) => void> = [];

  // Shared Stage Combat Floor & Corner Wall-Splat Barriers
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0b101b,
    roughness: 0.28,
    metalness: 0.72,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Left & Right Interactive Corner Force-Barriers (At X = -4.35 and X = +4.35)
  const leftWallMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const rightWallMat = new THREE.MeshBasicMaterial({
    color: 0xff2a55,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const wallSplats = {
    left: new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), leftWallMat),
    right: new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), rightWallMat),
  };
  wallSplats.left.position.set(-4.35, 1.6, 0);
  wallSplats.left.rotation.y = Math.PI / 2;
  wallSplats.right.position.set(4.35, 1.6, 0);
  wallSplats.right.rotation.y = Math.PI / 2;
  group.add(wallSplats.left, wallSplats.right);

  let title = '';
  let subtitle = '';

  // ==========================================================================
  // STAGE 1: SPACEX STARBASE // BOCA CHICA MECHAZILLA LAUNCH COMPLEX
  // ==========================================================================
  if (stageId === 'starbase') {
    title = 'SPACEX STARBASE';
    subtitle = 'BOCA CHICA, TX // MECHAZILLA ORBITAL PAD A';
    scene.background = new THREE.Color(0x090d18);
    scene.fog = new THREE.FogExp2(0x090d18, 0.032);

    const grid = new THREE.GridHelper(32, 32, 0xf97316, 0x1e293b);
    grid.position.y = 0.01;
    group.add(grid);

    // 1. Mechazilla Integration Tower (Tall Dark Steel Lattice at X = -1.5, Z = -6.5)
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.25,
    });
    const towerCore = new THREE.Mesh(new THREE.BoxGeometry(1.15, 9.5, 1.15), towerMat);
    towerCore.position.set(-1.5, 4.75, -6.5);
    group.add(towerCore);

    const towerCage = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 9.5, 1.22, 2, 12, 2),
      new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true })
    );
    towerCage.position.copy(towerCore.position);
    group.add(towerCage);

    // 2. Articulated "Chopstick" Catch Arms
    const chopstickGroup = new THREE.Group();
    chopstickGroup.position.set(-1.5, 5.4, -5.9);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 2.4), towerMat);
      arm.position.set(0.65 + side * 0.42, 0, 0.8);
      chopstickGroup.add(arm);
    }
    group.add(chopstickGroup);

    // 3. Full Stainless-Steel Starship + Super Heavy Booster Stack
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.14,
    });
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(-0.35, 3.2, -5.5);

    const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.6, 28), steelMat);
    const shipBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 28), steelMat);
    shipBody.position.y = 2.9;
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 28), steelMat);
    noseCone.position.y = 4.55;
    const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.05), tileMat);
    flapL.position.set(0, 3.2, 0);
    rocketGroup.add(booster, shipBody, noseCone, flapL);
    group.add(rocketGroup);

    // 4. Raptor Engine Plasma Plume
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.45,
    });
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.6, 20), plumeMat);
    plume.rotation.x = Math.PI;
    plume.position.set(-0.35, 0.9, -5.5);
    group.add(plume);
    const raptorLight = new THREE.PointLight(0xf97316, 4, 14);
    raptorLight.position.set(-0.35, 1.2, -4.5);
    group.add(raptorLight);

    // 5. Starbase Highway Sign & Water Tank Farm
    const sign = makeSignMesh(
      'STARBASE',
      'SPACEX GATEWAY TO MARS • BOCA CHICA, TX',
      '#090d16',
      '#f97316',
      '#ffffff',
      3.4,
      0.72
    );
    sign.position.set(2.2, 2.8, -5.2);
    group.add(sign);

    for (let i = 0; i < 3; i++) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.8, 20), steelMat);
      tank.position.set(1.4 + i * 0.95, 1.4, -6.2);
      group.add(tank);
    }

    animatedParts.push((t, haz) => {
      const hover = Math.sin(t * 1.6) * 0.08 + (haz > 0 ? Math.sin(t * 28) * 0.15 : 0);
      rocketGroup.position.y = 3.2 + hover;
      chopstickGroup.position.y = 5.0 + hover;
      plume.scale.set(1 + Math.sin(t * 35) * 0.15 + haz * 0.8, 1 + haz * 1.2, 1);
      plumeMat.opacity = 0.42 + haz * 0.55;
      raptorLight.intensity = 3.5 + haz * 10;
    });
  }

  // ==========================================================================
  // STAGE 2: xAI MEMPHIS "COLOSSUS" GIGAFACTORY OF COMPUTE
  // ==========================================================================
  else if (stageId === 'colossus') {
    title = 'xAI COLOSSUS SUPERCLUSTER';
    subtitle = 'MEMPHIS, TN // 200,000 H200 LIQUID-COOLED GIGAFACTORY';
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.035);

    const grid = new THREE.GridHelper(32, 32, 0x00f3ff, 0x1e293b);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      'xAI COLOSSUS',
      'MEMPHIS SUPERCLUSTER • 200,000 GPUS ONLINE',
      '#050811',
      '#00f3ff',
      '#ffffff',
      4.4,
      0.82
    );
    sign.position.set(0, 3.65, -5.6);
    group.add(sign);

    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.18,
    });
    const cyanPipeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const orangePipeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 3.2, 0.9), rackMat);
      rack.position.set(i * 1.05, 1.6, -5.2 - Math.abs(i) * 0.25);
      group.add(rack);

      for (let b = 0; b < 6; b++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.56, 0.04, 0.02),
          b % 2 === 0 ? cyanPipeMat : orangePipeMat
        );
        blade.position.set(rack.position.x, 0.45 + b * 0.42, rack.position.z + 0.46);
        group.add(blade);
      }
    }

    for (const zOff of [-4.2, -5.0]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 10, 16), cyanPipeMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, 3.1, zOff);
      group.add(pipe);
    }

    const grokRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.05, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    grokRing.position.set(0, 1.85, -5.2);
    grokRing.rotation.x = 0.35;
    group.add(grokRing);

    animatedParts.push((t, haz) => {
      grokRing.rotation.z = t * (1.2 + haz * 4);
      grokRing.scale.setScalar(1 + Math.sin(t * 4) * 0.05 + haz * 0.25);
    });
  }

  // ==========================================================================
  // STAGE 3: OPENAI PIONEER BUILDING & STARGATE QUANTUM CORE (SAN FRANCISCO)
  // ==========================================================================
  else if (stageId === 'openai_hq') {
    title = 'OPENAI PIONEER & STARGATE';
    subtitle = 'SAN FRANCISCO, CA // FRONTIER REASONING ATRIUM';
    scene.background = new THREE.Color(0x04120e);
    scene.fog = new THREE.FogExp2(0x04120e, 0.034);

    const grid = new THREE.GridHelper(32, 32, 0x10b981, 0x064e3b);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      'OPENAI // STARGATE',
      'PIONEER ATRIUM • O3 & GPT-5 COMPUTE CORE',
      '#04120e',
      '#10b981',
      '#ffffff',
      4.2,
      0.78
    );
    sign.position.set(0, 3.6, -5.5);
    group.add(sign);

    const blossomGroup = new THREE.Group();
    blossomGroup.position.set(0, 1.95, -4.8);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.45,
      metalness: 0.8,
      roughness: 0.2,
    });
    for (let p = 0; p < 6; p++) {
      const angle = (p / 6) * Math.PI * 2;
      const torusPetal = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.055, 12, 48), petalMat);
      torusPetal.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0);
      blossomGroup.add(torusPetal);
    }
    group.add(blossomGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.55 });
    for (const side of [-1, 1]) {
      for (let c = 1; c <= 3; c++) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.2, 0.45), woodMat);
        col.position.set(side * (1.4 + c * 1.1), 2.1, -5.2);
        group.add(col);
      }
    }

    animatedParts.push((t, haz) => {
      blossomGroup.rotation.z = t * (0.65 + haz * 3.0);
      blossomGroup.rotation.y = Math.sin(t * 0.8) * 0.35;
    });
  }

  // ==========================================================================
  // STAGE 4: GOOGLE BAY VIEW "DRAGONSCALE" & SYCAMORE QUANTUM LAB
  // ==========================================================================
  else if (stageId === 'googleplex') {
    title = 'GOOGLEPLEX BAY VIEW';
    subtitle = 'MOUNTAIN VIEW, CA // DRAGONSCALE CANOPY & SYCAMORE QUANTUM CORE';
    scene.background = new THREE.Color(0x070d1c);
    scene.fog = new THREE.FogExp2(0x070d1c, 0.032);

    const grid = new THREE.GridHelper(32, 32, 0x3b82f6, 0x1e293b);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      'GOOGLE DEEPMIND',
      'BAY VIEW DRAGONSCALE • GEMINI ULTRA & SYCAMORE',
      '#070d1c',
      '#3b82f6',
      '#ffffff',
      4.4,
      0.78
    );
    sign.position.set(0, 3.65, -5.6);
    group.add(sign);

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    for (let a = 0; a < 3; a++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(3.8 - a * 0.55, 0.08, 10, 48, Math.PI),
        roofMat
      );
      arch.position.set(0, 1.2 + a * 0.25, -5.8 - a * 0.4);
      group.add(arch);
    }

    const gColors = [0x4285f4, 0xea4335, 0xfbbc05, 0x34a853];
    const xPositions = [-3.2, -1.7, 1.7, 3.2];
    xPositions.forEach((xPos, idx) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 3.4, 24),
        new THREE.MeshStandardMaterial({
          color: gColors[idx],
          emissive: gColors[idx],
          emissiveIntensity: 0.45,
        })
      );
      pillar.position.set(xPos, 1.7, -5.0);
      group.add(pillar);
    });

    const chandelier = new THREE.Group();
    chandelier.position.set(0, 2.35, -4.6);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.95,
      roughness: 0.12,
    });
    [0.65, 0.48, 0.32, 0.18].forEach((radius, tier) => {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.05, 28), goldMat);
      disc.position.y = -tier * 0.32;
      chandelier.add(disc);
    });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12), goldMat);
    rod.position.y = -0.5;
    chandelier.add(rod);
    group.add(chandelier);

    animatedParts.push((t, haz) => {
      chandelier.rotation.y = t * (0.8 + haz * 3);
      chandelier.position.y = 2.35 + Math.sin(t * 2) * 0.06;
    });
  }

  // ==========================================================================
  // STAGE 5: META "1 HACKER WAY" & KAUAI MMA OCTAGON CAGE
  // ==========================================================================
  else if (stageId === 'meta_hq') {
    title = 'META // 1 HACKER WAY OCTAGON';
    subtitle = 'MENLO PARK & KAUAI COMPOUND // OPEN-WEIGHTS CAGE MATCH';
    scene.background = new THREE.Color(0x060d1f);
    scene.fog = new THREE.FogExp2(0x060d1f, 0.034);

    const grid = new THREE.GridHelper(32, 32, 0x38bdf8, 0x1e3a8a);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      '1 HACKER WAY',
      'META FAIR • LLAMA OPEN-WEIGHTS OCTAGON',
      '#060d1f',
      '#38bdf8',
      '#ffffff',
      4.2,
      0.78
    );
    sign.position.set(0, 3.6, -5.5);
    group.add(sign);

    const metaLoop = new THREE.Group();
    metaLoop.position.set(0, 1.95, -4.8);
    const loopMat = new THREE.MeshStandardMaterial({
      color: 0x0081fb,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.45,
    });
    const leftLoop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 16, 48), loopMat);
    leftLoop.position.x = -0.45;
    leftLoop.rotation.y = 0.35;
    const rightLoop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 16, 48), loopMat);
    rightLoop.position.x = 0.45;
    rightLoop.rotation.y = -0.35;
    metaLoop.add(leftLoop, rightLoop);
    group.add(metaLoop);

    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 });
    for (let p = -3; p <= 3; p++) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.5, 8, 12), cageMat);
      panel.position.set(p * 1.4, 1.25, -4.2);
      group.add(panel);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 12), postMat);
      post.position.set(p * 1.4 - 0.68, 1.3, -4.2);
      group.add(post);
    }

    animatedParts.push((t, haz) => {
      metaLoop.rotation.y = Math.sin(t * 1.2) * 0.45;
      metaLoop.scale.setScalar(1 + haz * 0.25);
    });
  }

  // ==========================================================================
  // STAGE 6: NVIDIA "VOYAGER" TRIANGLE HQ & BLACKWELL VAULT (SANTA CLARA)
  // ==========================================================================
  else if (stageId === 'nvidia_voyager') {
    title = 'NVIDIA VOYAGER & ENDEAVOR HQ';
    subtitle = 'SANTA CLARA, CA // BLACKWELL TENSOR CORE CATHEDRAL';
    scene.background = new THREE.Color(0x040d06);
    scene.fog = new THREE.FogExp2(0x040d06, 0.034);

    const grid = new THREE.GridHelper(32, 32, 0x22c55e, 0x052e16);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      'NVIDIA VOYAGER',
      'SANTA CLARA HQ • BLACKWELL B200 & CUDA MATRIX',
      '#040d06',
      '#22c55e',
      '#ffffff',
      4.4,
      0.78
    );
    sign.position.set(0, 3.65, -5.6);
    group.add(sign);

    const trussMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true });
    for (let i = 0; i < 3; i++) {
      const tri = new THREE.Mesh(new THREE.ConeGeometry(2.6 - i * 0.4, 2.2, 3), trussMat);
      tri.position.set(0, 2.2, -5.0 - i * 0.6);
      group.add(tri);
    }

    const wafer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.06, 36),
      new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.95, roughness: 0.12 })
    );
    wafer.rotation.x = Math.PI / 2;
    wafer.position.set(0, 1.9, -4.8);
    group.add(wafer);

    animatedParts.push((t, haz) => {
      wafer.rotation.z = t * (0.9 + haz * 4);
    });
  }

  // ==========================================================================
  // STAGE 7..10: TSMC FAB 18 / ANTHROPIC VAULT / ORACLE AWS / APPLE PARK
  // ==========================================================================
  else {
    const isTSMC = stageId === 'tsmc_fab18';
    const isOracle = stageId === 'oracle_aws';
    const isApple = stageId === 'apple_park';

    title = isTSMC
      ? 'TSMC FAB 18 EUV CLEANROOM'
      : isOracle
      ? 'ORACLE EXADATA & AWS VAULT'
      : isApple
      ? 'CUPERTINO SPACESHIP RING'
      : 'ANTHROPIC CONSTITUTIONAL VAULT';
    subtitle = isTSMC
      ? 'TAINAN, TAIWAN // 2-NANOMETER HIGH-NA EUV LITHOGRAPHY CORE'
      : isOracle
      ? 'US-EAST-1 & REDWOOD SHORES // SOVEREIGN CLOUD OBELISKS'
      : isApple
      ? 'CUPERTINO, CA // NEURAL SILICON PAVILION'
      : 'SAN FRANCISCO, CA // CONSTITUTIONAL ALIGNMENT ARCHIVE';

    const themeHex = isTSMC ? 0xffcc00 : isOracle ? 0xef4444 : isApple ? 0x38bdf8 : 0xf59e0b;
    const bgHex = isOracle ? 0x140608 : isApple ? 0x070d16 : 0x120c05;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.034);

    const grid = new THREE.GridHelper(32, 32, themeHex, 0x3b2816);
    grid.position.y = 0.01;
    group.add(grid);

    const sign = makeSignMesh(
      title,
      subtitle.split('//')[1]?.trim() || subtitle,
      '#120c05',
      '#' + themeHex.toString(16).padStart(6, '0'),
      '#ffffff',
      4.4,
      0.78
    );
    sign.position.set(0, 3.65, -5.6);
    group.add(sign);

    const slabs: THREE.Mesh[] = [];
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x291d14,
      emissive: themeHex,
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.2,
    });
    for (let s = -2; s <= 2; s++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.18), slabMat);
      slab.position.set(s * 1.35, 1.9, -4.8 - Math.abs(s) * 0.2);
      group.add(slab);
      slabs.push(slab);
    }

    animatedParts.push((t, haz) => {
      slabs.forEach((s, idx) => {
        s.position.y = 1.9 + Math.sin(t * 2 + idx) * 0.14;
        s.rotation.y = Math.sin(t + idx) * 0.25 + haz * 0.5;
      });
    });
  }

  return {
    id: stageId,
    name: title,
    subtitle,
    group,
    update(time: number) {
      if (hazardTimer > 0) hazardTimer = Math.max(0, hazardTimer - 0.025);
      animatedParts.forEach((fn) => fn(time, hazardTimer));
      leftWallMat.opacity = Math.max(0.12, leftWallMat.opacity * 0.92);
      rightWallMat.opacity = Math.max(0.12, rightWallMat.opacity * 0.92);
    },
    triggerHazard(intensity = 1.0) {
      hazardTimer = intensity;
    },
    triggerWallSplat(side: -1 | 1) {
      const mat = side === -1 ? leftWallMat : rightWallMat;
      mat.opacity = 0.95;
      hazardTimer = 0.85;
    },
    destroy(scn: THREE.Scene) {
      scn.remove(group);
    },
  };
}
