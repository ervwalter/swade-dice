# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `yarn`
- **Development server**: `yarn dev` (starts Vite server at http://localhost:5173)
- **Production build**: `yarn build` (TypeScript compilation followed by Vite build)
- **Preview production build**: `yarn preview`
- **Type checking**: `npx tsc --noEmit` or `yarn tsc --noEmit`

The build process requires both TypeScript compilation (`tsc`) and Vite bundling to succeed.

## Project Architecture

This is a React application built with Three.js and Rapier physics for 3D dice simulation, designed as both a standalone app and an Owlbear Rodeo extension.

### Core Application Structure

- **Multi-entry build system**: Three HTML entry points via Vite
  - `index.html` → `src/main.tsx` → `src/App.tsx` (mainTapplication)
  - `popover.html` → `src/popover.tsx` (player tray popover for Owlbear Rodeo)  
  - `background.html` → `src/background.ts` (Owlbear Rodeo extension registration)

- **State management**: Zustand stores with Immer middleware
  - `src/dice/store.ts` - Core dice rolling state and SWADE game mechanics
  - `src/controls/store.ts` - UI controls and settings
  - `src/plugin/rollHistoryStore.ts` - Roll history for multiplayer sync

- **Physics simulation**: Deterministic dice rolls using Rapier physics engine
  - Results are reproducible across clients via shared seeds
  - Physics transforms determine final dice values
  - Explosion mechanics for SWADE rules (dice "explode" on max values)

### Key Directory Structure

- `src/dice/` - Physics-based dice rolling, SWADE mechanics, explosion handling
- `src/tray/` - 3D tray rendering and interaction
- `src/controls/` - UI controls (sidebar, top bar, settings)
- `src/plugin/` - Owlbear Rodeo integration (metadata sync, popovers, themes)
- `src/types/` - TypeScript type definitions for dice, rolls, SWADE mechanics
- `src/sets/` - Dice set configurations and definitions
- `src/materials/`, `src/meshes/`, `src/colliders/` - 3D assets and rendering
- `src/tests/` - Fairness testing tools (distribution charts, chi-squared tests)
- `src/audio/` - Sound effects for dice interactions

### SWADE Game Mechanics Implementation

The application implements Savage Worlds Adventure Edition rules:
- **Trait tests**: Single trait die + optional Wild Die (d6), best result wins
- **Damage rolls**: Multiple dice, explosions on max face values
- **Target numbers and raises**: Success at TN, raises every +4 above
- **Exploding dice**: When a die shows its maximum value, roll again and add

### Owlbear Rodeo Integration

- Synchronizes dice state via player metadata
- Deterministic physics ensure consistent results across all players
- Player popovers show other players' dice trays
- Theme integration with Owlbear Rodeo's light/dark modes

## Technology Stack

- **Framework**: React 18 with TypeScript
- **3D Graphics**: Three.js via @react-three/fiber and @react-three/drei  
- **Physics**: @dimforge/rapier3d-compat with @react-three/rapier
- **UI Components**: Material-UI (@mui/material, @mui/icons-material)
- **State Management**: Zustand with Immer middleware
- **Build Tool**: Vite with React plugin
- **Platform Integration**: @owlbear-rodeo/sdk