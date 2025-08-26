import { useDiceControlsStore } from "./store";
import { useDiceMode } from "../hooks/useDiceMode";
import { ModifierControl } from "./ModifierControl";

export function DamageModifier() {
  const modifier = useDiceControlsStore((state) => state.damageModifier);
  const setModifier = useDiceControlsStore((state) => state.setDamageModifier);
  const { isDamageRoll } = useDiceMode();

  const config = {
    modifier,
    setModifier,
    isEnabled: isDamageRoll,
    icon: "⚔️",
    tooltipLabel: "Damage Modifier",
    inactiveTooltip: "Damage Modifier (inactive for single die rolls)",
    menuId: "damage-modifier-menu",
  };

  return <ModifierControl config={config} />;
}