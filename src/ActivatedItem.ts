/**
 * This file contains the helper methods to deal with pathing to/from items with activations.
 */
import { LancerActor } from "foundryvtt-lancer/actor/lancer-actor";
import { pilotForMech } from "./HudActorManagement.js";
import { LancerItem } from "foundryvtt-lancer/item/lancer-item";

type IndexedPath = `system.traits.${number}.actions.${number}`;
export type ItemActionPath =
  | "system.actions"
  | "system.core_system"
  | "system.core_system.passive_actions"
  | "system.core_system.active_actions"
  | IndexedPath;

export const ID_DELIMITER = ">";

export type ID_PATH = `${string}${typeof ID_DELIMITER}${string}`;

/*
You might use this for a core item, that has a default path instead of other items where you must have the indexed path
 */
export function itemActionPath(itemId: string, path: ItemActionPath = "system.actions"): ID_PATH {
  return [itemId, path].join(ID_DELIMITER) as ID_PATH;
}

export function itemActionId(
  itemId: string,
  idx: number,
  path: Exclude<ItemActionPath, IndexedPath> = "system.actions",
): ID_PATH {
  return itemActionPath(itemId, `${path}.${idx}` as ItemActionPath);
}

/**
 * Gets a complex activation from an actionId route.
 * Returns the item + path pair you could use later to target a specific activation on the item.
 * @param actor
 * @param actionId
 */
export function getItem(actor: LancerActor, actionId: string): [LancerItem, string] {
  const activationParts = actionId.split(ID_DELIMITER);
  const itemId = activationParts[0];
  const dataPath = activationParts[1];
  // @ts-ignore
  let item: LancerItem = actor.items.get(itemId);
  if (!item && actor.is_mech()) {
    return getItem(pilotForMech(actor), actionId);
  }
  return [item, dataPath];
}
