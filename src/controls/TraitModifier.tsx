import { useDiceControlsStore } from "./store";
import { useDiceMode } from "../hooks/useDiceMode";
import { ModifierControl } from "./ModifierControl";

export function TraitModifier() {
  const modifier = useDiceControlsStore((state) => state.traitModifier);
  const setModifier = useDiceControlsStore((state) => state.setTraitModifier);
  const { isTraitTest, hasActiveRoll, currentSelectionCount } = useDiceMode();
  
  // Enabled when: no dice selected OR in trait mode OR viewing trait results
  const isEnabled = (!hasActiveRoll && (currentSelectionCount === 0 || isTraitTest)) || 
                    (hasActiveRoll && isTraitTest);

  const config = {
    modifier,
    setModifier,
    isEnabled,
    icon: "🎯",
    tooltipLabel: "Trait Modifier",
    inactiveTooltip: "Trait Modifier (inactive for damage rolls)",
    menuId: "trait-modifier-menu",
  };

  return <ModifierControl config={config} />;
}