# Requirements Document

## Introduction

Convert the existing D20-based dice rolling extension into a Savage Worlds-specific dice roller that supports the unique mechanics of the Savage Worlds Adventure Edition (SWADE) system. This will be a complete fork and rebrand of the original extension to "Savage Worlds Dice" allowing both extensions to coexist in Owlbear Rodeo.

## Requirements

### Requirement 1: Extension Rebranding
**User Story:** As a user, I want to install "Savage Worlds Dice" as a separate extension, so that I can use it alongside other dice extensions without conflicts.

#### Acceptance Criteria
1. WHEN the extension is installed THEN the system SHALL display "Savage Worlds Dice" as the extension name
2. WHEN the extension registers with Owlbear Rodeo THEN the system SHALL use a unique plugin ID different from the original extension
3. WHEN the extension is listed in the store THEN the system SHALL show Savage Worlds-specific branding and descriptions
4. IF both the original and Savage Worlds extensions are installed THEN the system SHALL allow both to function independently

### Requirement 2: Dice Type Support
**User Story:** As a Savage Worlds player, I want access to only the dice types used in the system, so that the interface is streamlined for my game.

#### Acceptance Criteria
1. WHEN viewing available dice THEN the system SHALL only display D4, D6, D8, D10, and D12 dice types
2. WHEN searching for D20 or D100 dice THEN the system SHALL NOT display these options
3. WHEN loading the dice picker THEN the system SHALL show all five supported die types with their current visual style

### Requirement 3: Trait Test Mode
**User Story:** As a player, I want to roll trait tests with my skill/attribute die and wild die, so that I can resolve actions according to Savage Worlds rules.

#### Acceptance Criteria
1. WHEN in trait test mode THEN the system SHALL allow selection of one trait die (D4, D6, D8, D10, or D12)
2. WHEN rolling a trait test THEN the system SHALL automatically include a D6 wild die by default
3. WHEN the wild die option is enabled THEN the system SHALL visually distinguish the wild die with a different color scheme from the trait die
4. IF the user is not a Wild Card THEN the system SHALL allow disabling the wild die
5. WHEN both dice are rolled THEN the system SHALL take the higher total as the result
6. WHEN setting a target number THEN the system SHALL default to 4 with quick-select options for 4, 6, and 8
7. IF a custom target number is needed THEN the system SHALL allow manual input of any positive integer
8. WHEN setting modifiers THEN the system SHALL allow positive or negative values (e.g., +2 for skill bonus, -2 for wounds)
9. IF a modifier is set THEN the system SHALL apply it to the final result after selecting the best die

### Requirement 4: Exploding Dice (Aces)
**User Story:** As a player, I want dice to explode when they roll their maximum value, so that exceptional successes are possible as per Savage Worlds rules.

#### Acceptance Criteria
1. WHEN any die rolls its maximum value THEN the system SHALL automatically roll that die again
2. WHEN a die explodes THEN the system SHALL animate a new die rolling in addition to the original
3. WHEN calculating the total THEN the system SHALL add all explosion results to the original roll
4. IF a die continues to roll maximum values THEN the system SHALL continue exploding up to 50 times
5. WHEN the 50-explosion limit is reached THEN the system SHALL stop rolling and use the accumulated total
6. WHEN displaying results THEN the system SHALL show the explosion chain with indicators next to each exploded value (e.g., "8💥 + 8💥 + 6 = 22")

### Requirement 5: Success and Raise Calculation
**User Story:** As a player, I want to see whether my roll succeeded and how many raises I achieved, so that I know the outcome of my action.

#### Acceptance Criteria
1. WHEN a trait test completes AND a target number is set THEN the system SHALL compare the best result to the target number
2. IF the result equals or exceeds the target number THEN the system SHALL display "Success!"
3. IF the result is 4 or more points above the target number THEN the system SHALL calculate raises
4. WHEN raises are achieved THEN the system SHALL display the count (e.g., "Success with 2 raises!")
5. IF the result is below the target number THEN the system SHALL display "Failure"
6. WHEN no target number is set THEN the system SHALL only display the numeric result

### Requirement 6: Damage Roll Mode
**User Story:** As a player, I want to roll damage with multiple dice combinations, so that I can resolve combat damage according to weapon stats.

#### Acceptance Criteria
1. WHEN in damage roll mode THEN the system SHALL allow selection of multiple dice of different types
2. WHEN rolling damage THEN the system SHALL NOT include a wild die
3. WHEN damage dice explode THEN the system SHALL follow the same explosion rules as trait tests
4. WHEN displaying damage results THEN the system SHALL show the total sum of all dice
5. IF multiple dice of the same type are rolled THEN the system SHALL display them individually in the results
6. WHEN showing the breakdown THEN the system SHALL clearly indicate which dice exploded
7. WHEN setting damage modifiers THEN the system SHALL allow positive or negative values (e.g., +1 for STR bonus, +2 for magic weapon)
8. IF a modifier is set THEN the system SHALL add it to the total damage result

### Requirement 7: Results Display
**User Story:** As a player, I want clear and detailed roll results, so that I can verify the outcome and explain it to other players.

#### Acceptance Criteria
1. WHEN a trait test completes THEN the system SHALL display both the trait die and wild die results separately
2. WHEN showing the final result THEN the system SHALL indicate which die was used (trait or wild)
3. IF dice exploded THEN the system SHALL show the complete roll chain with explosion indicators
4. WHEN displaying explosion chains THEN the system SHALL use visual indicators (emoji or icons) immediately after each exploded value
5. WHEN showing raises THEN the system SHALL display them as text (e.g., "Success with 2 raises!")
6. IF the roll history is viewed THEN the system SHALL maintain the detailed breakdown for each historical roll

### Requirement 8: User Interface Adaptation
**User Story:** As a user, I want an interface optimized for Savage Worlds gameplay, so that I can quickly access the features I need.

#### Acceptance Criteria
1. WHEN opening the roller THEN the system SHALL display mode selection (Trait Test / Damage Roll)
2. WHEN in trait test mode THEN the system SHALL prominently display trait die selection, wild die toggle, and target number input
3. WHEN in damage roll mode THEN the system SHALL display a multi-die selector without wild die options
4. IF the interface needs more space THEN the system SHALL expand or reorganize the sidebar for better usability
5. WHEN switching modes THEN the system SHALL preserve the selected dice style/theme
6. WHEN viewing any mode THEN the system SHALL clearly indicate the current mode

### Requirement 9: Roll History Adaptation
**User Story:** As a player, I want the roll history to show Savage Worlds-specific information, so that I can review past rolls in context.

#### Acceptance Criteria
1. WHEN viewing roll history THEN the system SHALL display the roll type (Trait Test or Damage)
2. IF the roll was a trait test THEN the system SHALL show the target number if one was set
3. WHEN displaying historical trait tests THEN the system SHALL show success/failure and raise count
4. IF dice exploded in a historical roll THEN the system SHALL maintain the explosion chain display
5. WHEN viewing a historical roll with wild die THEN the system SHALL show which die (trait or wild) was used for the result