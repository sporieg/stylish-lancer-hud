import { LancerActor, LancerMECH, LancerPILOT } from "foundryvtt-lancer/actor/lancer-actor.js";
import type { ActionData } from "foundryvtt-lancer/models/bits/action";
import { LancerCombatant } from "foundryvtt-lancer/combat/lancer-combat.js";

export const isInvade = (a: Pick<ActionData, "activation">) => a.activation === "Invade";

export function pilotForMech(actor: LancerMECH): LancerPILOT | undefined {
  const pilot = actor.system?.pilot;
  if (!pilot || pilot.status !== "resolved") return undefined;
  return pilot.value;
}

export function mechForPilot(p: LancerPILOT): LancerMECH | undefined {
  const m = p.system.active_mech;
  if (!m || m.status !== "resolved") {
    ui.notifications.warn(`${p.name} does not have an active mech to swap to.`);
    return;
  }
  return m.value;
}

export function playerActors(): (LancerPILOT | LancerMECH)[] {
  // @ts-expect-error
  return game.actors.filter((a: LancerActor) => a.is_mech() || a.is_pilot());
}

export function getCombatant(actor: LancerActor): LancerCombatant | null {
  const tokens = canvas.tokens.controlled.filter((t) => t.actor?.id === actor.id);
  if (tokens.length != 1) {
    //ui.notifications?.warn("You must have one token selected to use this action.");
    return null;
  }
  const token = tokens[0];
  if (token?.combatant && (actor.is_mech() || actor.is_npc())) {
    return token.combatant as unknown as LancerCombatant;
  }
  return null;
}

// Native equiv for lodash get.
export const get = (obj, path, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

/**
 * When you need to mutate every subitem, regardless of its location in an Array, Record, or Record<Record>
 * @param items
 * @param mutate
 */
export function visitSubMenuItems(
  items: FlatSubMenuItems | TabbedSubMenuItems | SidebarSubMenuItems,
  mutate: (item: SubMenuItem) => void,
) {
  function visit(valu: SubMenuItem[] | TabbedSubMenuItems | SidebarSubMenuItems) {
    if (Array.isArray(valu)) {
      valu.forEach(mutate);
    } else {
      Object.values(valu).forEach(visit);
    }
  }
  return visit(items);
}
