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
    ui.notifications?.warn("You must have one token selected to use this action.");
    return null;
  }
  const token = tokens[0];
  if (token?.combatant && (actor.is_mech() || actor.is_npc())) {
    return token.combatant as unknown as LancerCombatant;
  }
  return null;
}
