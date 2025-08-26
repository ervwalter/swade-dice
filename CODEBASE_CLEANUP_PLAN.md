# Savage Worlds Dice - Codebase Cleanup Plan

*Generated: 2025-08-26*
*Status: In Progress*

## Overview

This document outlines a comprehensive refactoring plan to eliminate "vibe coding artifacts" - unused code, repetitive patterns, and technical debt - while maintaining 100% functional compatibility. All changes are pure refactoring exercises with zero behavior modifications.

## Project Context

**Savage Worlds Dice** is a sophisticated 3D dice rolling application for the Savage Worlds Adventure Edition (SWADE) tabletop RPG system. The project recently underwent a major conversion from a generic D20 system to specialized Savage Worlds implementation, leaving behind some technical debt and code artifacts.

## Issues Identified by Analysis

### 🔴 HIGH PRIORITY ISSUES

#### 1. TypeScript Type Safety Issues
**Problem**: 11 instances of `any` type usage without proper typing
**Impact**: Poor type safety, potential runtime errors, degraded developer experience

**Files Affected**:
- `/src/plugin/PopoverTray.tsx:13-14` - `player: any; result: any;`
- `/src/plugin/rollHistoryStore.ts:8,19` - `result: any` and `set: any`
- `/src/plugin/DiceRollSync.tsx:19` - `state: any` 
- `/src/plugin/PlayerRollPill.tsx:13` - `result?: any`
- `/src/plugin/PopoverTrays.tsx:13,23` - `result: any` and `currentPlayerMetadata: any`
- `/src/controls/SavageWorldsResultsSummary.tsx:50` - `outcome: any`
- `/src/hooks/useRemotePlayerResults.ts:8` - `currentRollResult: any`

**Solution**: Replace all `any` types with proper TypeScript interfaces based on existing type definitions in `SavageWorldsTypes.ts`

#### 2. Repetitive Code - Dice Colliders (5 Files)
**Problem**: Identical component structure across all dice colliders
**Impact**: Maintenance burden, code bloat

**Files Affected**:
- `/src/colliders/D4Collider.tsx`
- `/src/colliders/D6Collider.tsx` 
- `/src/colliders/D8Collider.tsx`
- `/src/colliders/D10Collider.tsx`
- `/src/colliders/D12Collider.tsx`

**Pattern**:
```tsx
import { ConvexHullCollider } from "@react-three/rapier";
const vertices = [...].map((n) => n / 10);
export function D[X]Collider() {
  return <ConvexHullCollider args={[vertices]} />;
}
```

**Solution**: Create generic `DiceCollider` component that accepts `diceType` prop and looks up vertices from a configuration object

#### 3. Repetitive Code - Material Components (~8 Files)
**Problem**: Nearly identical structure across material components
**Impact**: Significant code duplication, inconsistent patterns

**Files Affected**:
- `/src/materials/galaxy/GalaxyMaterial.tsx`
- `/src/materials/gemstone/GemstoneMaterial.tsx`
- `/src/materials/glass/GlassMaterial.tsx`
- `/src/materials/iron/IronMaterial.tsx`
- `/src/materials/nebula/NebulaMaterial.tsx`
- `/src/materials/sunrise/SunriseMaterial.tsx`
- `/src/materials/sunset/SunsetMaterial.tsx`
- `/src/materials/walnut/WalnutMaterial.tsx`

**Pattern**:
```tsx
import { useTexture } from "@react-three/drei";
import albedo from "./albedo.jpg";
import orm from "./orm.jpg"; 
import normal from "./normal.jpg";
// ... identical useTexture and texture application
```

**Solution**: Create `BaseMaterial` factory function that accepts material-specific properties and texture paths

#### 4. Repetitive Code - Modifier Components (200+ Lines Duplicated)
**Problem**: TraitModifier and DamageModifier are 90% identical
**Impact**: Major code duplication, maintenance issues

**Files Affected**:
- `/src/controls/TraitModifier.tsx`
- `/src/controls/DamageModifier.tsx`

**Differences Only**:
- Store selector (`traitModifier` vs `damageModifier`)  
- Tooltip text ("Trait Modifier" vs "Damage Modifier")
- Icon (🎯 vs ⚔️)
- Enable condition

**Solution**: Create generic `ModifierControl` component accepting configuration props

#### 5. Unused Code Cleanup
**Problem**: Dead code, unused imports, debug statements left in production code
**Impact**: Bundle bloat, confusion, potential maintenance issues

**Items to Remove**:

*Unused Components*:
- `/src/controls/DieBonus.tsx` - Complete component, never imported/used

*Unused Imports*:
- `/src/controls/BottomControls.tsx:3` - `DiceRollSync` imported but never used

*Debug Code (15+ instances)*:
- `/src/plugin/rollHistoryStore.ts` - 4 console.log statements (lines 24, 34, 44, 48)
- `/src/plugin/DiceRollSync.tsx` - 4 statements (lines 39, 115, 127, 141) 
- `/src/plugin/PopoverTrays.tsx` - 6 statements (lines 44, 53, 65, 79, 90, 169)
- `/src/controls/store.ts` - 1 console.error (lines 62, 108, 157)

*Commented Code*:
- `/src/App.tsx:26` - `{/* <BottomControls /> */}` (imported but commented out)

### 🟡 MEDIUM PRIORITY ISSUES

#### 6. Deep Nesting Issues
**Problem**: Excessive nesting (4+ levels) reducing code readability
**Impact**: Hard to read and maintain code

**Files Affected**:
- `/src/dice/store.ts` - Multiple nested conditionals and loops
- `/src/controls/SavageWorldsResultsSummary.tsx` - Deep JSX nesting
- `/src/plugin/PopoverTrays.tsx` - Nested state processing loops

**Solution**: Extract nested logic into separate functions using early returns and guard clauses

#### 7. Audio/Preview Index Files (12+ Files)
**Problem**: Identical boilerplate code across all audio/preview index files
**Impact**: Maintenance burden, code duplication

**Files Affected**:
- `/src/audio/heavy/dice/index.ts`
- `/src/audio/light/dice/index.ts` 
- `/src/audio/medium/dice/index.ts`
- Plus leather/wood variants
- `/src/previews/[material]/index.ts` files

**Pattern**:
```ts
import a1 from "./01.mp3";
import a2 from "./02.mp3";
import a3 from "./03.mp3";
import a4 from "./04.mp3";
export { a1, a2, a3, a4 };
```

**Solution**: Create utility functions for dynamic imports

#### 8. Missing Error Handling
**Problem**: Async operations without proper error handling
**Impact**: Poor user experience on API failures, potential crashes

**Files Affected**:
- `/src/plugin/PartyTrays.tsx:21` - `OBR.party.getPlayers().then(setPlayers)` - no .catch()
- `/src/plugin/PluginThemeProvider.tsx:88` - `OBR.theme.getTheme().then(updateTheme)` - no .catch()
- `/src/plugin/PopoverTrays.tsx` - Several OBR calls (lines 52, 78) without error handling

**Solution**: Add .catch() handlers or wrap in try/catch blocks

#### 9. Legacy Code Comments Cleanup
**Problem**: Outdated comments about deleted features and legacy code
**Impact**: Code confusion, misleading documentation

**Items to Clean Up**:

*Legacy Field Comments*:
- `/src/types/SavageWorldsTypes.ts:58` - "Legacy types kept for compatibility during migration"
- `/src/controls/history.ts:8` - "Legacy field, kept for compatibility"
- `/src/controls/DiceRollControls.tsx:148` - "Legacy field" comment

*Disabled Feature Comments*:
- `/src/dice/InteractiveDice.tsx:69-70` - "Drag-to-reroll disabled for Savage Worlds"
- `/src/helpers/random.ts:3-4` - Legacy helper deprecation comments

*Temporary Code Comments*:
- `/src/dice/PhysicsDice.tsx:161` - TODO for upstream dependency merge
- Multiple "incomplete implementation" comments in DiceRollControls.tsx

**Solution**: Remove outdated comments, clean up legacy field references where safe

### 🟢 LOW PRIORITY (NOTED BUT NOT FIXING)

#### 10. Mesh Component Repetition
**Issue**: Similar patterns in rounded/sharp mesh components
**Decision**: KEEP - Each mesh has unique geometry requirements
**Reason**: Less critical than other repetitions, geometry-specific logic needed

#### 11. State Mutations in Zustand
**Issue**: Direct mutations within immer drafts  
**Decision**: KEEP - This is the correct pattern for Zustand with immer
**Reason**: Acceptable and intended usage pattern

#### 12. String Literal Repetition
**Issue**: Repeated mode strings, color values, styling patterns
**Decision**: KEEP - User specifically excluded magic number/constant extraction
**Reason**: Per user request to avoid this type of refactoring

## Implementation Plan

### Phase 1: Unused Code and Comment Cleanup
**Goal**: Remove dead weight and misleading documentation
**Files**: ~5 files modified, 1 file deleted
**Tasks**:
1. Delete unused `DieBonus.tsx` component
2. Remove unused import from `BottomControls.tsx`
3. Remove all console.log/error debug statements
4. Clean up commented-out code in `App.tsx`
5. Remove legacy comments and outdated documentation

### Phase 2: TypeScript Type Safety
**Goal**: Replace all `any` types with proper interfaces
**Files**: ~7 files modified
**Tasks**:
1. Define proper interfaces for plugin types
2. Replace `any` types in plugin components
3. Update roll result types in hooks and stores
4. Ensure full TypeScript compliance

### Phase 3: Consolidate Repetitive Components
**Goal**: Major code reduction through consolidation
**Files**: ~20 files eliminated, 5 new generic components
**Tasks**:
1. Create generic `DiceCollider` component
2. Create `BaseMaterial` factory function
3. Create generic `ModifierControl` component
4. Update all imports and references
5. Test that consolidated components work identically

### Phase 4: Address Deep Nesting
**Goal**: Improve code readability
**Files**: 3-4 files modified
**Tasks**:
1. Extract nested logic in dice store functions
2. Simplify deeply nested JSX in results components
3. Use early returns and guard clauses
4. Maintain identical functionality

### Phase 5: Clean Up Audio/Preview Files
**Goal**: Reduce boilerplate
**Files**: ~12 files eliminated, 2 utility functions added
**Tasks**:
1. Create dynamic import utilities
2. Replace repetitive index files
3. Update build process if needed
4. Ensure audio/preview loading still works

### Phase 6: Add Error Handling
**Goal**: Improve robustness
**Files**: 3-4 files modified
**Tasks**:
1. Add error handlers to OBR API calls
2. Implement graceful degradation
3. Add logging for debugging
4. Test error scenarios

## Expected Outcomes

### Quantitative Improvements
- **Files eliminated**: 25-30 files
- **Code reduction**: ~40% less duplication  
- **Type safety**: 100% TypeScript compliance (0 `any` types)
- **Bundle size**: Reduced through dead code elimination

### Qualitative Improvements  
- **Maintainability**: Significantly improved through consolidation
- **Readability**: Less nesting, cleaner comments
- **Developer Experience**: Better types, fewer duplicate patterns
- **Robustness**: Better error handling for external APIs

## Testing Strategy

Since this is pure refactoring with zero functional changes, testing approach:

1. **Visual Testing**: Ensure UI looks identical before/after
2. **Functional Testing**: Verify dice rolling behavior unchanged
3. **Type Checking**: Ensure TypeScript compilation succeeds
4. **Build Testing**: Verify application builds and runs correctly
5. **Plugin Testing**: Test Owlbear Rodeo integration still works

## Risk Mitigation

**Low Risk**: All changes are pure refactoring without behavior modification
**Backup Strategy**: Git commits for each phase allow easy rollback
**Validation**: Extensive testing at each phase before proceeding

## Success Criteria

✅ All existing functionality works identically
✅ TypeScript compilation with no `any` types
✅ Significantly reduced code duplication
✅ Cleaner, more maintainable codebase
✅ Faster build times due to less code
✅ Better developer experience

---

*This document will be updated as the cleanup progresses to track completion status and any issues encountered.*