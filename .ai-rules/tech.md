---
title: Technical Stack
description: "Defines the project's technology choices, build processes, and development practices."
inclusion: always
---

# Technical Stack

## Core Technologies

### Frontend Framework
- **React 18.2.0**: Main UI framework with React 18 features
- **TypeScript 4.6.4**: Type-safe development with strict mode enabled
- **Vite 3.1.0**: Fast build tool and development server

### 3D Graphics & Physics  
- **Three.js 0.153.0**: 3D rendering engine
- **React Three Fiber 8.13.4**: React renderer for Three.js
- **React Three Drei 9.77.4**: Useful Three.js helpers and components
- **React Three Rapier 1.1.1**: Physics simulation integration
- **Rapier**: Deterministic physics engine (WASM-based)

### UI Components & Styling
- **Material-UI 5.10.9**: Primary component library
- **Emotion**: CSS-in-JS styling solution (via MUI)
- **Material-UI Icons**: Icon system
- **MUI X-Charts 6.19.4**: Data visualization for fairness testing

### State Management & Utilities
- **Zustand 4.1.2**: Lightweight state management
- **Immer 9.0.15**: Immutable state updates
- **Lodash.throttle**: Performance optimization utilities
- **UUID**: Unique identifier generation

### Platform Integration
- **Owlbear Rodeo SDK 1.3.9**: Virtual tabletop platform integration
- **Web Audio API**: Sound effects system via Three.js AudioListener

### Build & Development
- **Package Manager**: Yarn (preferred) with yarn.lock
- **Module System**: ES Modules with Vite bundling
- **Asset Pipeline**: Supports .glb 3D models, .hdr environment maps, .mp3 audio
- **Multi-Entry Build**: Supports main app, popover, and background worker builds

## Build Commands

### Development
```bash
yarn dev          # Start development server
```

### Production
```bash  
yarn build        # TypeScript compilation + Vite production build
yarn preview      # Preview production build locally
```

### Dependencies
```bash
yarn              # Install all dependencies
```

## Architecture Patterns

### Component Architecture
- **Functional Components**: React function components with hooks
- **Custom Hooks**: Shared logic extraction (e.g., usePlayerDice)
- **Context Providers**: Audio system, theme management
- **Suspense**: Lazy loading for performance optimization

### State Management
- **Zustand Stores**: Modular state management
  - `dice/store.ts`: Dice rolling state
  - `controls/store.ts`: UI controls state
  - `debug/store.ts`: Development debugging
- **Local Component State**: useState for component-specific state
- **Immer Integration**: Immutable updates in complex state scenarios

### Asset Management
- **3D Models**: .glb files for dice geometry and colliders
- **Materials**: PBR textures (albedo, normal, ORM maps)
- **Audio**: Organized by intensity (light/medium/heavy) and material type
- **Images**: PNG previews for UI, static assets

### Code Organization
- **Feature-based**: Organized by functionality (dice, controls, materials, etc.)
- **Type Definitions**: Centralized in `/types` directory
- **Shared Utilities**: Helper functions in `/helpers` directory
- **Plugin Isolation**: Owlbear-specific code in `/plugin` directory

## Performance Considerations
- **Physics Simulation**: Runs at consistent framerate for determinism
- **Audio Loading**: Lazy loading with user interaction requirement
- **3D Asset Optimization**: Compressed geometry and textures
- **Code Splitting**: Lazy loading for fairness testing components
- **Throttling**: Performance optimization for intensive operations

## Browser Compatibility
- **Modern Browsers**: ES2020+ features required
- **WebGL**: Required for 3D rendering
- **Web Audio**: Required for sound effects
- **WebAssembly**: Required for Rapier physics engine