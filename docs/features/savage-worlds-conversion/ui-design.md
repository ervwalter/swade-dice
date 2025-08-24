# Savage Worlds UI Design Specification

## Overview

The Savage Worlds dice roller maintains the existing clean, vertical icon-based UI while adding context-aware controls for trait tests and damage rolls. The interface automatically detects the intended roll type based on dice selection and enables/disables relevant controls accordingly.

## Mode Detection Logic

The system automatically determines the roll mode based on the number of dice selected:

- **Trait Test Mode**: Activated when exactly 1 die is selected
- **Damage Roll Mode**: Activated when 2 or more dice are selected

No explicit mode switching is required - the UI adapts based on user actions.

## UI Layout

### Consistent Control Stack

The sidebar maintains the same vertical button layout regardless of mode:

```
[Dice Set Picker]        <- Existing dropdown for dice themes
─────────────           
[D4] [D6] [D8]          <- Dice selection buttons with badge counts
[D10] [D12]             
─────────────
[⭐] Wild Die           <- NEW: Wild die toggle (context-enabled)
[🎯] Target Number      <- NEW: Target number selector (context-enabled)
─────────────
[+/-] Modifier          <- Existing modifier control
[👁️] Hidden Roll        <- Existing hidden roll toggle
[📜] Roll History       <- Existing history viewer
[🧪] Fairness Tester    <- Existing tester button
```

## Control Behaviors

### Wild Die Toggle Button [⭐]

**Enabled State (1 die selected):**
- Icon: Star or special die icon
- Default: ON (golden/highlighted appearance)
- Click action: Toggles wild die on/off
- When ON: Automatically adds a D6 with special golden material to the roll
- When OFF: No wild die included (for non-Wild Card NPCs)
- Tooltip: "Wild Die (D6)"

**Disabled State (2+ dice selected):**
- Appearance: Grayed out with reduced opacity (0.3)
- Click action: None
- Tooltip: "Wild Die (disabled for damage rolls)"

### Target Number Button [🎯]

**Enabled State (1 die selected):**
- Icon: Target or number icon showing current TN
- Default: Shows "4" 
- Click action: Opens popover menu
- Popover contents:
  ```
  Quick Select:
  [4] [6] [8]           <- Common target numbers
  
  Custom:
  [−] [number input] [+] <- For other values
  ```
- Tooltip: "Target Number (TN: {current})"

**Disabled State (2+ dice selected):**
- Appearance: Grayed out with reduced opacity (0.3)
- Click action: None
- Tooltip: "Target Number (disabled for damage rolls)"

## Visual Distinctions

### Wild Die Visualization

When the wild die is enabled in trait test mode:
- The D6 uses a distinct material/color (golden or special theme)
- Appears alongside the selected trait die in the tray
- Maintains the same physics and explosion behavior
- Clearly distinguishable from the trait die

### Mode Indicators

While there's no explicit mode label, users understand the current mode through:
1. Which controls are enabled/disabled
2. The dice count badges
3. The results display format

## Results Display

### Trait Test Results

When rolling in trait test mode (1 die + optional wild die):

```
┌────────────────────────────────┐
│ Trait (d8): 8💥 + 3 = 11       │  <- Shows explosion chains
│ Wild (d6): 6💥 + 2 = 8         │  <- Shown if wild die enabled
│ Modifier: +2                   │  <- If non-zero
│ ─────────────                  │
│ Result: 13                     │  <- Best die + modifier
│                                │
│ ✓ Success vs TN 4              │  <- Only if TN was set
│ ⭐⭐ 2 Raises!                  │  <- If applicable
└────────────────────────────────┘
```

### Damage Roll Results

When rolling in damage mode (2+ dice):

```
┌────────────────────────────────┐
│ 2d6: 6💥 + 4 + 3               │  <- Just show each die result with explosions noted
│ 1d8: 5                         │  <- Group by die type
│ Modifier: +2                   │  <- If non-zero
│ ─────────────                  │
│ Total: 20               │  <- Sum of all dice + modifier
└────────────────────────────────┘
```

## State Management

### Controls Store Additions

```typescript
interface SavageWorldsControlsState {
  // New fields
  wildDieEnabled: boolean;      // Default: true
  targetNumber: number;          // Default: 4
  
  // New actions
  toggleWildDie: () => void;
  setTargetNumber: (tn: number) => void;
}
```

### Persistence

- `wildDieEnabled`: Stored in localStorage, persists across sessions
- `targetNumber`: Stored in localStorage, remembers last used value

## User Flows

### Typical Attack Sequence

1. **Player declares attack**
   - Clicks their Fighting die (e.g., D8)
   - Wild die automatically enabled (default)
   - Sets TN if different from 4
   - Rolls
   - Sees success/raises

2. **Player rolls damage**
   - Clicks damage dice (e.g., D6 twice for 2d6)
   - Wild die and TN buttons automatically disable
   - Adds STR modifier if needed
   - Rolls
   - Sees total damage

### GM Rolling for Non-Wild Card

1. **GM selects NPC's skill die**
   - Clicks appropriate die (e.g., D6)
   - Clicks wild die button to disable it
   - Sets appropriate TN
   - Rolls
   - Sees single die result vs TN

## Implementation Notes

### Button Implementation

Both new buttons follow the existing pattern:
- Use Material-UI `IconButton` component
- 24x24px icon size
- Consistent padding and spacing
- Tooltip on hover
- Smooth transitions for enable/disable states

### Popover Behavior

The Target Number popover follows the same pattern as the existing Modifier popover:
- Anchored to the button
- Closes on outside click
- Maintains focus management
- Smooth open/close animations

### Responsive Design

- Buttons remain vertically stacked
- No horizontal expansion
- Maintains 60px sidebar width
- All interactions work on touch devices

## Accessibility

- All buttons have appropriate ARIA labels
- Disabled states are communicated to screen readers
- Keyboard navigation supported throughout
- Clear visual feedback for all interactions

## Migration Path

When users first load the Savage Worlds version:
1. Wild die defaults to enabled
2. Target number defaults to 4
3. Existing modifier/hidden/history controls work unchanged
4. New buttons appear naturally in the flow

This design ensures a smooth transition while adding the essential Savage Worlds mechanics without disrupting the clean, minimal aesthetic of the original interface.