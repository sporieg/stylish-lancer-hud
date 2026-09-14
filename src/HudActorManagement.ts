import { debug } from "./log.js";
import type { LancerActor, LancerMECH, LancerPILOT } from "foundryvtt-lancer/actor/lancer-actor";

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

function sh(): StylishActionHudAPI {
  // @ts-expect-error
  return game.modules.get("stylish-action-hud").api;
}

function shConfig() {
  // @ts-expect-error
  return game.settings.get("stylish-action-hud", "configuration") as unknown as any;
}

export async function changeActors(api: StylishActionHudAPI = sh()) {
  const currentActors = shConfig().actors as string[];
  const { mech, pilot } = currentActors
    .map((id) => {
      // @ts-expect-error
      return game.actors.get(id) as LancerActor;
    })
    .reduce(
      (acc, a) => {
        if (a.is_mech()) acc.mech.push(a);
        if (a.is_pilot()) acc.pilot.push(a);
        return acc;
      },
      { mech: [], pilot: [] } as { mech: LancerMECH[]; pilot: LancerPILOT[] },
    );
  if (mech.length > 0 && pilot.length > 0) {
    debug("Cannot swap with mixed Pilot|Mech, fix manually");
    return;
  }
  // Copy to keep any NPC we might have, just swap the pilots in place.
  const newActors = [...currentActors];
  if (mech.length) {
    mech.forEach((m) => {
      const p = pilotForMech(m);
      if (p) {
        newActors[currentActors.indexOf(m.id)] = p.id;
      }
    });
  }
  if (pilot.length) {
    pilot.forEach((p) => {
      const m = mechForPilot(p);
      if (m) {
        newActors[currentActors.indexOf(p.id)] = m.id;
      }
    });
  }
  await api.updateConfiguration({
    actors: newActors,
  });
}

type ActorSettings = {
  portraitVariants: Portrait[];
};

type Portrait = {
  id: string;
  img: string;
  label: string;
  scale: null;
  x: null;
  y: null;
};

export function playerActors(): (LancerPILOT | LancerMECH)[] {
  // @ts-expect-error
  return game.actors.filter((a: LancerActor) => a.is_mech() || a.is_pilot());
}

function getImgs(a: LancerPILOT | LancerMECH): string[] {
  const owningPlayers = game.users
    .filter((user) => user && !user.isGM)
    .filter((user) => !user.isGM && a.testUserPermission(user, "OWNER"));
  if (!owningPlayers) return;
  // If you just want the first/primary player owner
  const primaryOwner = owningPlayers[0];
  const allActors = game.actors
    .filter((a) => a.testUserPermission(primaryOwner, "OWNER"))
    .map((a) => a.img ?? "icons/svg/mystery-man.svg");
  return [...new Set(allActors)];
}

export function setAllPortraits(api: StylishActionHudAPI = sh()) {
  const actorSettings = shConfig().actorSettings as Record<string, ActorSettings>;
  playerActors().map((pm) => {
    const myId = pm.id;
    const allPossibleImgs = getImgs(pm);
    const { portraitVariants } = actorSettings[myId];
    // now for each each imp, check if a potraitVarient already exists and if not, push the new one one.
    allPossibleImgs.forEach((pa) => {
      if (!portraitVariants.some((pv) => pv.img === pa)) {
        portraitVariants.push({
          id: foundry.utils.randomID(),
          label: `${game.i18n.localize("IBHUD.Config.Portrait.DefaultLabel")} ${portraitVariants.length + 1}`,
          img: pa,
          scale: null,
          x: null,
          y: null,
        });
      }
    });
  });
}
