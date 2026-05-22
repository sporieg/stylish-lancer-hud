import {LancerActor} from "foundryvtt-lancer/actor/lancer-actor";

export function debug(message?: any, ...optionalParams: any[]) {
  console.log(`SUH-LANCER | ${message}`, ...optionalParams)
}

export function logInvalidItem(item: unknown, actor?: LancerActor, context = "") {
  if (!item) {
    const actorName = actor?.name || "Unknown Actor";
    const actorUuid = actor?.uuid || "Unknown UUID";
    const ctx = context ? `[${context}] ` : "";
    console.warn(`${ctx}Invalid or null item encountered. Actor: ${actorName}, UUID: ${actorUuid}`, item);
  }
}
