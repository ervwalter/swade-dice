# Savage Worlds Dice

Beautiful, deterministic 3D dice for Savage Worlds Adventure Edition (SWADE), built with React, Three.js, and the Rapier physics engine. Ships as an Owlbear Rodeo extension and runs standalone for local testing.

![Example](/docs/header.jpg)

## Features
- SWADE mechanics: Trait and Damage rolls, exploding dice, target number and raises, optional Wild Die.
- Deterministic physics: results sync across players by sharing seeds and initial throws (no network jitter issues).
- Rich visuals and audio: multiple materials, accurate colliders, environment lighting, and roll sounds.
- Player popovers in Owlbear Rodeo: preview other players’ trays and open their tray in focus.
- Fairness tooling: built‑in roll distribution charts and chi‑squared check for sanity testing.

## How It Works
The roll pipeline seeds a Rapier simulation, derives per‑die throws deterministically, and computes values from final transforms. Explosions are spawned when a die lands on its max face (e.g., D6→6). For Trait tests, the Wild Die (Nebula D6) is rolled alongside your trait die and the best total (plus modifiers) is compared to the target number; raises are calculated in steps of +4.

In Owlbear Rodeo, the extension syncs via player metadata. Because physics are deterministic, only inputs (seed, throws, dice) and results are shared; each client simulates locally for smooth animation.

## Using the App
- Local UI: pick a set and dice in the left rail, set Target Number and modifiers in the top bar, then press and hold on the tray to “charge” a stronger throw. Results appear with total, raises, and explosion history.
- Wild Die: enable in the top bar when making Trait tests (single trait die selected). The UI highlights the best die.
- Fairness Tester: toggle from the sidebar and run distributions to visualize balance.

## Develop & Build
- Install: `yarn`
- Dev server: `yarn dev` (Vite at http://localhost:5173)
- Production build: `yarn build` → outputs to `dist/`
- Preview build: `yarn preview`

Owlbear Rodeo extension entry points:
- `index.html` → main app (`src/main.tsx` / `src/App.tsx`)
- `background.html` → registers the popover (`src/background.ts`)
- `popover.html` → player trays (`src/popover.tsx`)

## Project Structure
- `src/tray`, `src/dice`, `src/controls`: tray rendering, physics roll flow, and UI controls.
- `src/plugin`: Owlbear Rodeo integration (metadata sync, popovers, themes).
- `src/materials`, `src/meshes`, `src/colliders`, `src/previews`: assets and rendering helpers.
- `src/tests`: manual fairness tools (charts, tester button).
- `src/sets`: dice set definitions.

## Attributions
d8 by Leonardo Henrique Martini from <a href="https://thenounproject.com/browse/icons/term/d8/" target="_blank" title="d8 Icons">Noun Project</a> (CC BY 3.0)

## License
GNU GPLv3. See LICENSE for details.
