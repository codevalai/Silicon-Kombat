# 🤝 Contributing to Silicon Kombat: Sovereign Zenith

Thank you for helping push **Silicon Kombat: Sovereign Zenith** to the bleeding edge of browser-based 3D arcade fighting games!

---

## 🛠️ Development Workflow

1. **Fork & Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/silicon-kombat-sovereign-zenith.git
   cd silicon-kombat-sovereign-zenith
   npm install
   ```
2. **Start the Development Server**
   ```bash
   npm run dev
   ```
3. **Verify TypeScript & Build Before Submitting a PR**
   ```bash
   npm run lint
   npm run build
   ```

---

## ➕ How to Add a New Founder

1. **Add Roster Entry (`src/data/roster.ts`)**:
   - Add a new `FighterConfig` object with `id`, `name`, `company`, `latestModel`, `specialName`, `specialEffect`, `ultimateName`, `ultimateEffect`, and `philosophyQuotes`.
2. **Define 3D Anatomical DNA (`src/engine/FighterRig3D.ts`)**:
   - Add a preset entry in `getFounderDNA(id)` specifying `skinBase`, `skinShadow`, `irisColor`, `hairColor`, `jawWidth`, `hairStyle`, `glassesStyle`, `insult`, and `hitWords`.
3. **Add a 3D Hostile Takeover Fatality (`src/engine/SiliconArena3D.ts`)**:
   - Add a branch in `triggerHostileTakeoverFatality(winner, loser)` with custom 3D finisher geometry and popup text.

---

## 🏛️ How to Add a New 3D Tech Headquarters Stage

1. Open `src/engine/SiliconLandmarks3D.ts` and add your new stage ID to `LandmarkStageId`.
2. Implement a builder function returning a `StageController` with `update(t, dt)` and `triggerHazard(intensity)` animations.
3. Register the stage in `STAGE_ORDER` inside `src/App.tsx`.
