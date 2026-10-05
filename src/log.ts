import { LancerActor } from "foundryvtt-lancer/actor/lancer-actor";

const PREFIX = "SUH-LANCER |";

// oxlint-disable-next-line no-unused-vars
export function log(message?: any, ...optionalParams: any[]) {
  console.log(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function debug(message?: any, ...optionalParams: any[]) {
  console.debug(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function info(message?: any, ...optionalParams: any[]) {
  console.info(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function warn(message?: any, ...optionalParams: any[]) {
  console.warn(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function error(message?: any, ...optionalParams: any[]) {
  console.error(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function table(tabularData?: any, properties?: string[]) {
  console.table(tabularData, properties);
}

// oxlint-disable-next-line no-unused-vars
export function group(label?: any, ...optionalParams: any[]) {
  console.group(`${PREFIX} ${label}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function groupCollapsed(label?: any, ...optionalParams: any[]) {
  console.groupCollapsed(`${PREFIX} ${label}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function groupEnd() {
  console.groupEnd();
}

// oxlint-disable-next-line no-unused-vars
export function time(label?: string) {
  console.time(label);
}

// oxlint-disable-next-line no-unused-vars
export function timeEnd(label?: string) {
  console.timeEnd(label);
}

// oxlint-disable-next-line no-unused-vars
export function timeLog(label?: string, ...data: any[]) {
  console.timeLog(label, ...data);
}

// oxlint-disable-next-line no-unused-vars
export function count(label?: string) {
  console.count(label);
}

// oxlint-disable-next-line no-unused-vars
export function countReset(label?: string) {
  console.countReset(label);
}

// oxlint-disable-next-line no-unused-vars
export function assert(condition?: boolean, ...data: any[]) {
  console.assert(condition, ...data);
}

// oxlint-disable-next-line no-unused-vars
export function dir(item?: any, options?: any) {
  console.dir(item, options);
}

// oxlint-disable-next-line no-unused-vars
export function dirxml(...data: any[]) {
  console.dirxml(...data);
}

// oxlint-disable-next-line no-unused-vars
export function trace(message?: any, ...optionalParams: any[]) {
  console.trace(`${PREFIX} ${message}`, ...optionalParams);
}

// oxlint-disable-next-line no-unused-vars
export function clear() {
  console.clear();
}

export function logInvalidItem(item: unknown, actor?: LancerActor, context = "") {
  if (!item) {
    const actorName = actor?.name || "Unknown Actor";
    const actorUuid = actor?.uuid || "Unknown UUID";
    const ctx = context ? `[${context}] ` : "";
    warn(`${ctx}Invalid or null item encountered. Actor: ${actorName}, UUID: ${actorUuid}`, item);
  }
}
