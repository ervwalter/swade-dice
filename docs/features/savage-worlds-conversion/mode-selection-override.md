# Mode Selection Override Plan

## Overview
Current behavior infers mode from dice count: 1 die → Trait Test, 2+ dice → Damage. In Savage Worlds Pathfinder (SWADE setting), edge cases exist: some Trait Tests use multiple dice (still at most one Wild Die), and some Damage rolls use a single die. We will keep the convenient “auto” behavior, but add an explicit override so users can switch modes before rolling.

## Goals
- Preserve zero-friction defaults; allow explicit override when needed.
- Make mode visible, changeable pre-roll, and locked during roll.
- Ensure deterministic sync across clients (mode included in metadata).
- Keep Wild Die rules consistent (Trait only; at most one Wild Die).

## Non‑Goals
- Rework core explosion logic or physics.
- Add new die types or change SWADE math.

## UX Proposal
- Top-row toggle: removed. We will not use a persistent mode selector in the top bar.
- Pre‑roll prompt: when the roll overlay appears (about‑to‑roll state), show a small two‑option selector with the automatic choice pre‑selected and the alternative available as a one‑click switch.
  - Example: “Mode: [Trait (Auto)]  [Damage]” when 1 die is selected; switchable before the throw.
  - Persist user’s explicit pick during the current session until they return to `Auto`.
  - Do not persist across sessions; on load, default back to `Auto`.
- Behavior matrix:
  - Auto: 1 die → Trait; 2+ dice → Damage.
  - Manual `Trait`: allowed with 1+ dice; UI shows Wild Die toggle; if multiple dice selected, still roll as Trait (see results model below). No automatic removal of extra trait dice.
  - Manual `Damage`: allowed with 1+ dice; hides Wild Die toggle and excludes it from roll.
- Lock mode + controls while dice are rolling; allow changes again after result.

## Wireframes

Top Bar (persistent selector with Auto chip):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Wild Die [✓] │ TN [4] [6] [8] [✎] │ Trait Mod [+2] │ Damage Mod [+1]     │
│ Mode: (•) Auto  ( ) Trait  ( ) Damage     [Auto → Trait]                 │
└──────────────────────────────────────────────────────────────────────────┘
```

Pre‑Roll Overlay (appears when Roll UI is active; shows automatic pick with one‑click alternative):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Mode: [ Trait (Auto) ]   [ Damage ]                                       │
│                                                                          │
│  Press & hold anywhere to throw                                          │
│                                                                          │
│  • In Trait mode with multiple dice: one Wild Die may replace one trait. │
│    Results will show N independent tests; highlight which used Wild.     │
└──────────────────────────────────────────────────────────────────────────┘
```

Notes:
- When Auto is selected in the top bar, the overlay pre‑selects the inferred option and shows the other as a toggle.
- If user switches modes here, persist that explicit choice for subsequent rolls (until switching back to Auto).

### Results Reporting (mirror current UX)

Status quo (single‑die Trait):

```
Trait (d8): 8💥 + 5 = 13
Wild (d6): 6💥 + 2 = 8
Modifier: +2
Result: 15   ✓ Success vs TN 4 (2 raises)
```

Multi‑die Trait (add additional Trait rows; keep layout and multiple Result lines):

```
Trait (d8): 8💥 + 4 = 12
Trait (d8): 3
Wild (d6): 6💥 + 5 = 11
Modifier: +0
Result: 12   ✓ Success vs TN 4 (2 raises)
Result: 11   ✓ Success vs TN 4 (1 raise)
```

Top summary bar (comma‑delimited list with per‑result status):

```
Results: 12 ✓ ↑↑, 11 ✓ ↑   (Trait)
```

Notes:
- Detailed panel: simply add more `Trait (dx)` rows as needed and continue to show a single `Wild (d6)` row and `Modifier` line. Add multiple independent `Result:` rows, each with its own success/failure and raises indicator.
- Summary bar: when multiple Trait results exist, show a comma‑delimited list with per‑result status (e.g., “Results: 12 ✓ ↑↑, 11 ✓ ↑”). Keep single value for one‑die Trait and Damage (labeled as Total).
- Phase 1 prototype: layout only (static/mocked values). Logic and data changes come in later phases.


## State & API Changes
- `controls/store.ts` (new/updated)
  - `rollMode: 'AUTO' | 'TRAIT' | 'DAMAGE'` (default `AUTO`).
  - `setRollMode(mode)`, `getEffectiveRollMode(counts): 'TRAIT' | 'DAMAGE'` (if `AUTO`, derive by counts; else return explicit).
  - When `rollMode === 'DAMAGE'`, force `wildDieEnabled = false` in UI and roll config.
- `dice/store.ts`
  - Use `controls.getEffectiveRollMode()` when building `startRoll` config.
  - Set internal `rollMode: 'TRAIT' | 'DAMAGE'` for result calculation and syncing.
- `savageWorldsConfig`/metadata
  - Include `rollMode` explicitly in `OBR.player.setMetadata` control settings and in `currentRollResult`.

### Result Model Changes (Trait with multiple dice)
- Keep per‑die explosion chains as today.
- For `TRAIT` mode with N trait dice and exactly one wild die:
  - Compute totals for each trait chain and the wild chain.
  - Allow the wild chain to replace at most one trait chain (choose the replacement that yields the greatest improvement).
  - Produce N independent results (tests): one may be the wild‑replaced result; the rest are the original trait totals.
  - Compute success/raises per result against the Target Number.
  - Summary should present a comma‑delimited list with per‑result status (✓/✗ and raises arrows). This can be derived from `traitTestResults` (no separate field required), or exposed as a view model by the results hook.
- Data additions:
  - `currentRollResult.mode`: `'TRAIT' | 'DAMAGE'` (explicit).
  - `currentRollResult.traitTestResults?: Array<{ dieId: string; total: number; usedWild: boolean; rolls: number[]; success?: boolean; raises?: number }>`
  - `currentRollResult.wildUsedForDieId?: string` to identify which trait was replaced.
  - Optional view model: `summaryResults?: Array<{ total: number; success?: boolean; raises?: number }>` if we want to precompute for the summary bar; otherwise derive from `traitTestResults` in the UI.
  - Maintain existing `traitDieResult`, `wildDieResult`, `bestResult` for single‑die trait tests to avoid breaking UI; extend results UI to show multiple independent outcomes when present.

## Logic Rules & Edge Cases
- Wild Die:
  - Only available in `TRAIT`; if switching to `DAMAGE`, disable and hide the toggle (don’t persist true in that state).
  - In `TRAIT` with multiple dice, still roll exactly one Wild Die; it can replace at most one trait chain.
- Single-die damage:
  - Supported by switching to `DAMAGE` manually while one die is selected.
- Post‑selection changes:
  - Changing dice counts while `AUTO` can flip the effective mode; show chip update live.
  - If user manually selects `TRAIT`/`DAMAGE`, changing counts does not change mode until the user returns to `AUTO`.
- During roll:
  - Freeze mode and wild-die settings; unfreeze when `pendingDice.length === 0`.

## Owlbear Rodeo Sync
- Add `rollMode` to `controlSettings` and `currentRollResult` metadata keys.
- Remote clients must prefer explicit `rollMode` over inference.

## History & Reroll
- History entry should capture the effective `rollMode: 'TRAIT' | 'DAMAGE'` used at roll time (not just an inferred boolean).
- Persist alongside existing fields: `wildDieEnabled`, modifiers, target number, `counts`, and `diceById`.
- Reroll behavior: restore modifiers/TN/wild‑die, then call `startRoll({... , savageWorldsConfig: { rollType: rollMode, modifier, targetNumber, wildDieId? } })` so the new roll exactly matches the original mode.
- Optional: also store `selectionMode: 'AUTO' | 'MANUAL'` for analytics; not required for reroll fidelity.

## Migration
- Initialize `rollMode` to `AUTO` on every load (no persistence across sessions).
- No data migration required; history entries can remain without mode; new entries include mode.

## Acceptance Criteria
- Users can toggle between `Auto`, `Trait`, and `Damage` before rolling.
- In `Auto`, effective mode matches current behavior and is visibly indicated.
- Wild Die is only offered in `Trait`; it is disabled/hidden in `Damage`.
- Single-die Damage and multi-die Trait are both supported via manual override.
- Mode is included in sync metadata and results; remote views match local behavior.
 - Pre‑roll prompt presents both mode options with the automatic choice pre‑selected.
- For multi‑die Trait tests, results report multiple independent outcomes with at most one wild replacement; UI shows multiple `Result:` lines and the summary bar shows a comma‑delimited list.

- Phase 1: UI Prototype (non‑functional)
  - Skip top‑bar toggle; focus on pre‑roll overlay selector with auto‑choice; toggles only update local UI state.
  - Add results panel variants for multi‑die Trait (use mocked data to preview layout).
- Phase 2: State & Types
  - Add `rollMode` and actions to controls store; implement `getEffectiveRollMode`.
  - Add explicit `mode` and multi‑result structures to `currentRollResult` type.
- Phase 3: History & Sync Prep
  - Extend history entries to include explicit `rollMode` and, if in Trait, multi‑result data schema.
  - Add `rollMode` to OBR control metadata (no behavior change yet).
- Phase 4: Roll Integration
  - Use effective mode in `startRoll`; set dice store `rollMode` for active roll.
  - Implement Wild replacement logic for multi‑die Trait; compute per‑result success/raises.
  - Disable mode and wild‑die controls while rolling.
- Phase 5: Remote Sync & UI Binding
  - Populate metadata with explicit `rollMode` and multi‑result summaries.
  - Bind results UI to real data; ensure remote views match local outcomes.
- Phase 6: QA & Docs
  - Test edge cases: multi‑die Trait, single‑die Damage, switching modes mid‑setup, hidden rolls.
  - Update README + user docs with override behavior and multi‑result reporting.

## Decisions
- `rollMode` defaults to `AUTO` and is not persisted across sessions. Within a session, an explicit pick can persist until the user returns to `AUTO`.
- No UI warning when manually selecting `TRAIT` with multiple dice.
- Manual `TRAIT` mode does not limit the number of trait dice; users can select any count.
