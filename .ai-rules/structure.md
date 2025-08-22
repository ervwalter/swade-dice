---
title: Project Structure
description: "Defines the project's file organization, naming conventions, and architectural patterns."
inclusion: always
---

# Project Structure

## Root Directory Structure

```
/
├── src/                    # All source code
├── public/                 # Static assets (manifest, icons, logos)  
├── docs/                   # Documentation (architecture, features, operations, schemas)
├── .ai-rules/             # AI agent steering documentation
├── store-docs/            # Store listing documentation and assets
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration  
├── vite.config.ts         # Build tool configuration
├── index.html             # Main application entry
├── popover.html           # Plugin popover entry
├── background.html        # Background worker entry
└── README.md              # Project overview
```

## Source Code Organization (`/src`)

### Core Application Structure
```
src/
├── main.tsx               # Application entry point
├── App.tsx                # Root component
├── GlobalStyles.tsx       # Global CSS styles
├── popover.tsx           # Popover entry point
├── background.ts         # Background worker
└── vite-env.d.ts         # Vite environment types
```

### Feature-Based Directories

#### Dice System (`/dice`)
- `Dice.tsx` - Core dice component
- `DiceRoll.tsx` - Dice rolling logic  
- `InteractiveDice.tsx` - User-interactive dice
- `PhysicsDice.tsx` - Physics-enabled dice
- `store.ts` - Dice state management

#### User Controls (`/controls`) 
- `DiceRollControls.tsx` - Main roll interface
- `DicePicker.tsx` - Dice selection UI
- `DiceResults.tsx` - Roll results display
- `DiceHistory.tsx` - Roll history tracking
- `Sidebar.tsx` - Main UI sidebar
- `store.ts` - UI controls state

#### 3D Assets and Rendering

##### Materials (`/materials`)
- **Pattern**: `{style}/` subdirectories containing:
  - `{Style}Material.tsx` - Material component
  - `albedo.jpg` - Base color texture
  - `normal.jpg` - Normal map texture  
  - `orm.jpg` - Occlusion/Roughness/Metallic map
- **Styles**: galaxy, gemstone, glass, iron, nebula, sunrise, sunset, walnut, tray

##### Meshes (`/meshes`)
- `rounded/` - Rounded dice geometry (.glb files + React components)
- `sharp/` - Sharp dice geometry (.glb files + React components)
- `tray.glb` - Dice tray 3D model
- **Pattern**: Each mesh type has corresponding `.tsx` component and `.glb` file

##### Physics (`/colliders`)  
- `D{N}Collider.tsx` - Physics colliders for each die type
- `TrayColliders.tsx` - Tray collision geometry
- **Naming**: Matches die types (D4, D6, D8, D10, D12, D20)

##### Visual Previews (`/previews`)
- **Pattern**: `{style}/` subdirectories with PNG previews for each die type
- `all.png` - Combined preview image
- `DicePreview.tsx` - Preview rendering component

#### Audio System (`/audio`)
- `AudioListenerProvider.tsx` - Audio context management
- `getAudioBuffer.ts` - Audio loading utilities
- **Intensity Levels**: `light/`, `medium/`, `heavy/`
- **Material Sounds**: `dice/`, `leather/`, `wood/`, `shake/`
- **Format**: MP3 files with TypeScript index files

#### Platform Integration (`/plugin`)
- `PluginGate.tsx` - Plugin initialization
- `getPluginId.ts` - Plugin identifier utilities  
- `PopoverTray.tsx` - Popover interface
- `PlayerDiceRoll.tsx` - Multiplayer dice coordination
- **Pattern**: Owlbear Rodeo specific functionality isolated here

#### Type System (`/types`)
- **Naming**: PascalCase matching domain concepts
- **Core Types**: `Die.ts`, `DiceRoll.ts`, `DiceSet.ts`, `DiceStyle.ts`, `DiceType.ts`
- **Supporting Types**: Transform, vector, quaternion definitions

#### Utilities (`/helpers`)
- **Naming**: camelCase verbs (e.g., `getCombinedDiceValue.ts`)
- **Purpose**: Pure functions for calculations and transformations
- **Examples**: Random number generation, dice physics calculations, ID generation

## File Naming Conventions

### Components
- **Format**: PascalCase with descriptive names
- **Pattern**: `{Feature}{Component}.tsx` (e.g., `DiceRollControls.tsx`)
- **Exports**: Named exports matching filename

### Stores  
- **Location**: `store.ts` within feature directories
- **Pattern**: Zustand stores with typed interfaces
- **Exports**: Custom hooks (e.g., `useDiceStore`)

### Assets
- **3D Models**: `.glb` extension, lowercase with die type (`d20.glb`)
- **Textures**: `.jpg` for PBR maps, descriptive names (`albedo.jpg`, `normal.jpg`, `orm.jpg`)
- **Audio**: `.mp3` extension, numbered variants (`01.mp3`, `02.mp3`)
- **Images**: `.png` for UI, `.jpg` for textures

### Configuration Files
- **TypeScript**: `tsconfig.json`, `tsconfig.node.json`
- **Build**: `vite.config.ts`
- **Package**: `package.json`, `yarn.lock`

## Documentation Structure (`/docs`)

### Architecture Documentation (`/docs/architecture`)
- System design and technical architecture documents

### Feature Documentation (`/docs/features/{feature-name}`)  
- `requirements.md` - Feature requirements
- `design.md` - Implementation design
- `tasks.md` - Development tasks
- Additional feature-specific documentation

### Operations Documentation (`/docs/operations`)
- Deployment, monitoring, and operational procedures

### Schema Documentation (`/docs/schemas`)
- Data structure and API schema definitions

## Development Patterns

### Component Organization
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Complex UIs built from smaller, focused components  
- **Hooks**: Custom hooks for shared logic extraction

### State Management
- **Local First**: Use useState for component-specific state
- **Zustand**: For shared state across multiple components
- **Store Splitting**: Separate stores by feature domain

### Asset Loading
- **Lazy Loading**: Dynamic imports for performance
- **Type Safety**: TypeScript definitions for all assets
- **Organization**: Grouped by type and feature usage

This structure supports maintainability, scalability, and clear separation of concerns while enabling efficient development workflows.