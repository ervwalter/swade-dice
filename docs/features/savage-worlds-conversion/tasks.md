# Implementation Plan

## Phase 1: Extension Rebranding and Core Setup

- [ ] 1. Rebrand extension to "Savage Worlds Dice"
  - Update manifest.json with new name and unique plugin ID
  - Update all user-facing text references from generic dice to Savage Worlds
  - Update store metadata and descriptions
  - **Definition of Done**: Extension loads with new name, no conflicts with original extension, all branding updated
  - **Tests Required**: Manual testing of extension installation alongside original, verify unique ID registration
  - **Code Review**: Review all text changes for consistency, verify no D20 references remain

- [ ] 2. Remove D20 and D100 dice support
  - [ ] 2.1 Update type definitions to remove D20 and D100
    - Remove D20 and D100 from DiceType definitions
    - Update all TypeScript interfaces that reference these types
    - **Definition of Done**: TypeScript compilation succeeds without D20/D100 types
    - **Tests Required**: Type checking passes, no runtime errors
    - **Code Review**: Verify all type references updated

  - [ ] 2.2 Remove D20/D100 mesh and collider files
    - Delete D20 and D100 mesh components and .glb files
    - Delete D20 and D100 collider components
    - Remove imports and references in mesh/collider index files
    - **Definition of Done**: All D20/D100 3D assets removed, no broken imports
    - **Tests Required**: Build succeeds, no 404 errors for missing assets
    - **Code Review**: Verify complete removal of files and references

  - [ ] 2.3 Update dice sets and previews
    - Remove D20/D100 from all dice set configurations
    - Remove D20/D100 preview images and references
    - Update fairness tester to exclude these dice
    - **Definition of Done**: UI shows only D4-D12, no visual references to D20/D100
    - **Tests Required**: Manual UI testing, verify dice picker shows correct options
    - **Code Review**: Check all dice set configurations updated

- [ ] 3. Remove advantage/disadvantage system
  - [ ] 3.1 Remove advantage UI components
    - Delete DieAdvantage.tsx component
    - Remove advantage controls from DiceRollControls
    - Remove advantage state from controls store
    - **Definition of Done**: No advantage/disadvantage UI elements visible
    - **Tests Required**: UI testing to verify removal, no console errors
    - **Code Review**: Verify complete removal of advantage logic

  - [ ] 3.2 Remove advantage rolling logic
    - Remove advantage/disadvantage from getDiceToRoll function
    - Remove HIGHEST/LOWEST combination logic
    - Clean up dice generation to remove advantage branching
    - **Definition of Done**: Dice rolling works without advantage logic
    - **Tests Required**: Unit tests for dice generation, integration tests for rolling
    - **Code Review**: Verify all advantage-related code paths removed

## Phase 2: Core Savage Worlds Mechanics

- [ ] 4. Implement exploding dice logic
  - [ ] 4.1 Create explosion detection system
    - Implement function to check if die value equals max for its type
    - Create explosion queue management in dice store
    - Add explosion counter with 50-roll limit
    - **Definition of Done**: System correctly identifies when dice should explode
    - **Tests Required**: Unit tests for all die types (D4=4, D6=6, etc.), limit testing
    - **Code Review**: Logic review for edge cases, verify limit enforcement

  - [ ] 4.2 Implement explosion animation system
    - Create new dice spawning for explosions
    - Implement sequential explosion processing
    - Add visual delay between explosion rolls
    - **Definition of Done**: New dice visually appear when explosions occur
    - **Tests Required**: Manual testing of explosion animations, performance testing
    - **Code Review**: Animation timing review, performance optimization check

  - [ ] 4.3 Create explosion result tracking
    - Store explosion chains per die
    - Calculate totals including all explosions
    - Maintain explosion history for display
    - **Definition of Done**: Accurate explosion totals calculated and stored
    - **Tests Required**: Unit tests for chain calculations, integration tests for multiple explosions
    - **Code Review**: Verify accurate math, check data structure efficiency

- [ ] 5. Implement roll mode system
  - [ ] 5.1 Create mode selection UI
    - Design and implement mode toggle component
    - Add TRAIT/DAMAGE mode state to controls store
    - Implement mode persistence across sessions
    - **Definition of Done**: Users can switch between modes, selection persists
    - **Tests Required**: UI testing for mode switching, localStorage persistence tests
    - **Code Review**: UX review for mode selection clarity

  - [ ] 5.2 Create trait test mode interface
    - Implement trait die selector (D4-D12)
    - Add wild die toggle with default enabled
    - Create target number input with quick selects (4, 6, 8)
    - Add modifier input with +/- controls
    - **Definition of Done**: All trait test controls functional and intuitive
    - **Tests Required**: UI testing for all controls, input validation tests
    - **Code Review**: UX review, accessibility check

  - [ ] 5.3 Create damage roll mode interface
    - Implement multi-die selector for each type
    - Add increment/decrement controls per die type
    - Create modifier input for damage bonuses
    - **Definition of Done**: Users can select multiple dice combinations with modifiers
    - **Tests Required**: UI testing for die selection, boundary testing for counts
    - **Code Review**: UX review for multi-die selection

## Phase 3: Wild Die and Result Processing

- [ ] 6. Implement wild die system
  - [ ] 6.1 Create wild die visual differentiation
    - Implement color override system for wild die
    - Create consistent wild die theme across all materials
    - Ensure wild die stands out from trait dice
    - **Definition of Done**: Wild die visually distinct in all themes
    - **Tests Required**: Visual testing across all material styles
    - **Code Review**: Design review for visual clarity

  - [ ] 6.2 Implement wild die rolling logic
    - Auto-generate D6 wild die when enabled
    - Process wild die explosions independently
    - Track wild die results separately
    - **Definition of Done**: Wild die rolls correctly with explosions
    - **Tests Required**: Integration tests for wild die with trait dice
    - **Code Review**: Logic review for wild die handling

  - [ ] 6.3 Implement best die selection
    - Compare trait die total vs wild die total
    - Select and highlight the better result
    - Store which die was used for final result
    - **Definition of Done**: System correctly selects higher total
    - **Tests Required**: Unit tests for comparison logic, edge case testing
    - **Code Review**: Verify selection logic accuracy

- [ ] 7. Implement success and raise calculation
  - [ ] 7.1 Create success evaluation system
    - Compare final result to target number
    - Calculate success/failure status
    - Store success state in roll result
    - **Definition of Done**: Accurate success/failure determination
    - **Tests Required**: Unit tests for various TN values and results
    - **Code Review**: Verify calculation accuracy

  - [ ] 7.2 Implement raise calculation
    - Calculate raises as (result - TN) / 4
    - Handle partial raises correctly (round down)
    - Store raise count in roll result
    - **Definition of Done**: Correct raise count for all scenarios
    - **Tests Required**: Unit tests for raise calculations, boundary testing
    - **Code Review**: Mathematical accuracy review

## Phase 4: Results Display and UI Polish

- [ ] 8. Create Savage Worlds results display
  - [ ] 8.1 Implement explosion chain display
    - Show roll sequences with explosion indicators (💥)
    - Display running totals for each die
    - Format chains clearly (e.g., "8💥 + 8💥 + 3 = 19")
    - **Definition of Done**: Clear, readable explosion chains displayed
    - **Tests Required**: UI testing with various explosion scenarios
    - **Code Review**: UX review for readability

  - [ ] 8.2 Create trait test results display
    - Show trait die and wild die results separately
    - Indicate which die was selected
    - Display modifier and final total
    - Show success/failure with raise count
    - **Definition of Done**: Complete trait test information displayed clearly
    - **Tests Required**: UI testing for all result combinations
    - **Code Review**: Information hierarchy and clarity review

  - [ ] 8.3 Create damage roll results display
    - Show all dice results individually
    - Display explosion chains for each die
    - Show modifier and final damage total
    - **Definition of Done**: Clear damage breakdown with total
    - **Tests Required**: UI testing with multiple dice combinations
    - **Code Review**: UX review for complex damage rolls

- [ ] 9. Update roll history for Savage Worlds
  - [ ] 9.1 Adapt history storage
    - Store Savage Worlds specific data (mode, explosions, raises)
    - Maintain detailed breakdown in history
    - Implement history size limits
    - **Definition of Done**: History stores all relevant Savage data
    - **Tests Required**: Integration tests for history storage, size limit tests
    - **Code Review**: Data structure efficiency review

  - [ ] 9.2 Update history display
    - Show roll type (Trait/Damage) in history
    - Display success/raises for trait tests
    - Maintain explosion indicators in historical rolls
    - **Definition of Done**: History clearly shows Savage Worlds information
    - **Tests Required**: UI testing for history display
    - **Code Review**: UX review for historical data presentation

## Phase 5: Testing and Documentation

- [ ] 10. Comprehensive testing
  - [ ] 10.1 Create unit tests for Savage Worlds mechanics
    - Test explosion logic for all die types
    - Test wild die selection logic
    - Test raise calculations
    - Test modifier applications
    - **Definition of Done**: 90%+ code coverage for new logic
    - **Tests Required**: Full unit test suite with edge cases
    - **Code Review**: Test coverage and quality review

  - [ ] 10.2 Perform integration testing
    - Test complete roll flows for both modes
    - Test explosion chains with multiple dice
    - Test UI state management
    - Test multiplayer synchronization
    - **Definition of Done**: All user flows work end-to-end
    - **Tests Required**: Manual and automated integration tests
    - **Code Review**: Test scenario completeness review

  - [ ] 10.3 Conduct performance testing
    - Test with maximum explosion chains
    - Test with many dice rolling simultaneously
    - Verify 60fps maintained during rolls
    - **Definition of Done**: Smooth performance under stress
    - **Tests Required**: Performance profiling, stress testing
    - **Code Review**: Performance optimization review

- [ ] 11. Update documentation
  - [ ] 11.1 Update user documentation
    - Create Savage Worlds specific README
    - Document new features and modes
    - Add examples of common roll types
    - **Definition of Done**: Complete user guide for Savage Worlds features
    - **Tests Required**: Documentation accuracy review
    - **Code Review**: Clarity and completeness review

  - [ ] 11.2 Update technical documentation
    - Document new architecture components
    - Update type definitions documentation
    - Document explosion logic and limits
    - **Definition of Done**: Technical documentation reflects all changes
    - **Tests Required**: Code-documentation consistency check
    - **Code Review**: Technical accuracy review

- [ ] 12. Final polish and release preparation
  - [ ] 12.1 UI/UX refinement
    - Fine-tune animations and transitions
    - Optimize layout for different screen sizes
    - Ensure consistent styling throughout
    - **Definition of Done**: Polished, professional UI
    - **Tests Required**: Cross-browser and device testing
    - **Code Review**: Final UX review and sign-off

  - [ ] 12.2 Prepare for store release
    - Create store listing with Savage Worlds branding
    - Generate screenshots and demo videos
    - Prepare release notes
    - **Definition of Done**: Store listing ready for submission
    - **Tests Required**: Final smoke test of release build
    - **Code Review**: Marketing material review, final approval