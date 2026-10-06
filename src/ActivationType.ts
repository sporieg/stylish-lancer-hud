import { LancerActor, type LancerMECH } from "foundryvtt-lancer/actor/lancer-actor";
import { ActionData } from "foundryvtt-lancer/models/bits/action";
import {
  LancerBOND,
  LancerFRAME,
  LancerItem,
  LancerMECH_SYSTEM,
  LancerMECH_WEAPON,
  LancerWEAPON_MOD,
} from "foundryvtt-lancer/item/lancer-item";
import { imgs } from "./Images.js";
import { logInvalidItem } from "./log.js";
import { itemActionId, itemActionPath } from "./ActivatedItem.js";
import type {
  EntryType,
  RangeType,
  DamageType,
  AttackType,
  ActivationType,
} from "foundryvtt-lancer/enums.js";

export type EntryTypeValue = `${EntryType}`;
export type ActivationTypeValue = `${ActivationType}`;
type RangeTypeValue = `${RangeType}`;
type DamageTypeValue = `${DamageType}`;
type AttackTypeValue = `${AttackType}`;
// Copied from foundryvtt-lancer/enums, actual values get borked in foundry loading.
export const ENTRY_TYPE = {
  CORE_BONUS: "core_bonus",
  DEPLOYABLE: "deployable",
  FRAME: "frame",
  MECH: "mech",
  LICENSE: "license",
  NPC: "npc",
  NPC_CLASS: "npc_class",
  NPC_TEMPLATE: "npc_template",
  NPC_FEATURE: "npc_feature",
  WEAPON_MOD: "weapon_mod",
  MECH_SYSTEM: "mech_system",
  MECH_WEAPON: "mech_weapon",
  ORGANIZATION: "organization",
  PILOT_ARMOR: "pilot_armor",
  PILOT_GEAR: "pilot_gear",
  PILOT_WEAPON: "pilot_weapon",
  PILOT: "pilot",
  RESERVE: "reserve",
  SKILL: "skill",
  STATUS: "status",
  TALENT: "talent",
  BOND: "bond",
} as const satisfies Record<string, EntryTypeValue>;
export type SheetTypes = Extract<EntryTypeValue, "mech" | "npc" | "pilot" | "deployable">;

export const ENTRY_TYPE_IMG_MAP: Record<keyof typeof ENTRY_TYPE, string> = {
  CORE_BONUS: imgs.lancer.corepower,
  DEPLOYABLE: imgs.lancer.deployable,
  FRAME: imgs.lancer.frame,
  MECH: imgs.lancer.mech,
  LICENSE: imgs.lancer.license,
  NPC: imgs.lancer.npc_class,
  NPC_CLASS: imgs.lancer.npc_class,
  NPC_TEMPLATE: imgs.lancer.npc_template,
  NPC_FEATURE: imgs.lancer.npc_feature,
  WEAPON_MOD: imgs.lancer.mech_weapon,
  MECH_SYSTEM: imgs.lancer.mech_system,
  MECH_WEAPON: imgs.lancer.mech_weapon,
  ORGANIZATION: imgs.la["angel-outfit"],
  PILOT_ARMOR: imgs.lancer.pilot,
  PILOT_GEAR: imgs.lancer.pilot,
  PILOT_WEAPON: imgs.lancer.pilot,
  PILOT: imgs.lancer.pilot,
  RESERVE: imgs.lancer.reserve_tac,
  SKILL: imgs.lancer.skill,
  STATUS: imgs.la["medical-pack"],
  TALENT: imgs.lancer.talent,
  BOND: imgs.lancer.bond,
};

// Keys are the ActivationType Enum, can't use it directly because enum is not erasable syntax;
export const RemapAction = {
  "Quick Tech": `Quick`,
  "Full Tech": `Full`,
};

export const ActivationLabels = {
  Core: "Core Power",
  Protocol: "Protocol",
  None: "None",
  Passive: "Passive",
  Quick: `Quick`,
  Invade: "Invade",
  Full: `Full`,
  Other: "Other",
  Reaction: "Reaction",
  Free: "Free",
};

export const ActivationTypeIcon = {
  Core: "Core Power",
  None: "None",
  Passive: "Passive",
  Quick: `<i class="mdi mdi-hexagon-slice-3" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  QuickTech: `<i class="mdi mdi-hexagon-slice-3" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  Invade: "Invade",
  Full: `<i class="mdi mdi-hexagon-slice-6" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  FullTech: `<i class="mdi mdi-hexagon-slice-6" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  Other: "Other",
  Reaction: `<i class="cci cci-reaction" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  Protocol: `<i class="cci cci-protocol" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
  Free: `<i class="cci cci-free-action" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>`,
};
export const ACTIVATION_TAG_MAP = {
  Quick: "tg_quick_action",
  Full: "tg_full_action",
  "Quick Tech": "tg_quick_tech",
  "Full Tech": "tg_full_tech",
  Protocol: "tg_protocol",
  Reaction: "tg_reaction",
  Free: "tg_free_action",
  Deactivate: "tg_deactivate",
  Invade: "tg_invade",
};

type ActivationKey = keyof typeof ACTIVATION_TAG_MAP;
type ActivationValue = (typeof ACTIVATION_TAG_MAP)[ActivationKey];

const actionTags = Object.values(ACTIVATION_TAG_MAP) as ActivationValue[];
type InvertedActivationMap = {
  [K in ActivationValue]: ActivationKey;
};
const INVERTED_ACTIVATION_TAG_MAP = Object.fromEntries(
  Object.entries(ACTIVATION_TAG_MAP).map(([key, value]) => [value, key]),
) as InvertedActivationMap;

export type ActionItem = {
  item: LancerItem;
  actions: {
    action: Pick<ActionData, "activation">;
    // A path to reach back to your action on the item.
    subMenuItem: SubMenuActionItem;
  }[];
};

/**
 *
 */
function la(): LancerAutomationsAPI {
  // @ts-ignore
  return game.modules.get("lancer-automations").api as LancerAutomationsAPI;
}

export function isUsableItem(item: LancerItem) {
  let system = item.system;

  if ("destroyed" in system && system.destroyed) return false;
  if (item.is_npc_feature() && item.system.charged) return false;
  if ("isLoading" in system && item.isLoading() && "loaded" in system && !system.loaded)
    return false;
  if ("uses" in system && system.uses.value <= 0 && system.uses.max > 0) return false;
  return true;
}
//Todo: Wrap numbers for tags and stuff in public/fonts/compcon/glyphs.css
/*function threatAndRange() {
  "<i class=\"cci cci-line\"></i>";
  return '<i class="cci cci-threat"></i>';
}*/

/**
 * I could put the help on system, but I think there are enough potential edge cases
 * among system.weapon/system/other taggable things just put it here.s
 * @param value not enough time on this earth for all the system types.
 * @param tags
 */
export function tagsCostAndDescription(value: LancerItem) {
  const tags = value.getTags();
  if (!tags) return { cost: "", description: "" };
  let { cost, description } = tags.reduce(
    ({ cost, description }, t) => {
      // I dunno what happens with is_limited tag and not is_limited, save me jon lancer.
      if (t.is_limited && value.isLimited()) {
        let max = value.system.uses.max;
        t.name.replace("{VAL}", `${max}`);
        cost.push(`${value.system.uses.value}/${max}`);
        description.push(t.name.replace("{VAL}", max.toString()));
      } else if (t.is_selfheat) {
        cost.push(`${t.val} Heat`);
      } else {
        description.push(t.name.replace("{VAL}", t.val));
      }
      return { cost, description };
    },
    { cost: [] as string[], description: [] as string[] },
  );
  return {
    cost: cost.join(", "),
    description: description.join(" "),
  };
}

// Frames are intrinsically special and contain whole trees of actions.
function coreSystem(item: LancerFRAME): ActionItem {
  const itemId = item.id;
  const core_system = item.system.core_system;
  const coreAction: ActionItem = {
    item,
    actions: [
      {
        action: core_system,
        subMenuItem: {
          id: itemActionPath(itemId, "system.core_system"),
          img: imgs.lancer.corepower,
          name: core_system.active_name,
          description: [core_system.description, core_system.active_effect].join("<br/>"),
        },
      },
      ...core_system.passive_actions.map<ActionItem["actions"][number]>((action, idx) => ({
        action,
        subMenuItem: {
          id: itemActionId(itemId, idx, "system.core_system.passive_actions"),
          img: item.img,
          name: action.name,
          description: action.detail,
        },
      })),
      ...core_system.active_actions.map<ActionItem["actions"][number]>((action, idx) => ({
        action,
        subMenuItem: {
          id: itemActionId(itemId, idx, "system.core_system.active_actions"),
          img: imgs.lancer.mech,
          name: action.name,
          description: action.detail,
        },
      })),
      ...item.system.traits.flatMap((p, idx) =>
        p.actions.map<ActionItem["actions"][number]>((action, adx) => ({
          action,
          subMenuItem: {
            id: itemActionPath(itemId, `system.traits.${idx}.actions.${adx}`),
            img: imgs.lancer.mech,
            name: p.name,
            description: action.detail,
          },
        })),
      ),
    ],
  };
  return coreAction;
}

function modSubItem(m: LancerWEAPON_MOD) {
  let { cost, description } = tagsCostAndDescription(m);

  return {
    id: m.id,
    name: "^[Mod]" + m.name,
    description: [m.system.effect, description].join(" "),
    cost: cost,
  };
}

//const Ranges: Record<RangeTypeValue, string> = {};

function _weaponItem(weapon: LancerMECH_WEAPON) {
  const system = weapon.system;
  const destroyed = system.destroyed;
  const p = system.active_profile;
  const d = p.damage.map((d) => `${d.val} ${d.type}`).join("+");
  const ranges = p.range.map((r) => r.formatted).join(" ");
  let { cost, description: td } = tagsCostAndDescription(weapon);
  return {
    id: weapon.id,
    name: destroyed
      ? `<s class="horus--subtle" style="opacity:0.7;color:#e50000;">${weapon.name}</s>`
      : weapon.name,
    description: `${system.size} ${p.type}<br/>${d}<br/>${ranges}<br/>${td}`,
    cost, //TODO: We can style cost so that it contains the Ranges/Threats/Damage  That is how SUH does 5e weapons
    isExhausted: !isUsableItem(weapon),
    uses: weapon.isLimited() && weapon.system.uses,
  };
}

/**
 * Builds out the mechs weapons as a list with each mount as a header.
 * @param actor
 */
export function weaponsByMount(actor: LancerMECH): SubMenuItem[] {
  const mounts = actor.system.loadout.weapon_mounts;
  if (!Array.isArray(mounts)) {
    logInvalidItem(mounts, actor, "buildWeapons");
    return [];
  }
  return mounts
    .filter((m, mountIdx) => {
      if (!Array.isArray(m.slots)) {
        logInvalidItem(m, actor, `mechLoadout.mounts[${mountIdx}]`);
        return false;
      }
      const slots = m.slots.filter((s) => !!s?.weapon);
      if (slots.length === 0) return false;
      if (slots.some((s) => s.weapon && (!s.weapon.value || !s.weapon.id))) {
        logInvalidItem(slots, actor, `mechLoadout.mounts[${mountIdx}].slots[].weapon`);
        return false;
      }
      return m.slots.length > 0 && !m.bracing;
    })
    .flatMap<SubMenuItem>((m) => {
      return [
        {
          isHeader: true,
          name: m.type,
          cost: ActivationTypeIcon.Quick,
        },
        ...m.slots.flatMap((s) => {
          if (!s.weapon) return [];
          const value = s.weapon.value;
          if (!value) return [];
          let wItem: SubMenuItem = _weaponItem(value);
          if (!s.mod || !s.mod.value) return [wItem];
          return [wItem, modSubItem(s.mod.value)];
        }),
      ] as SubMenuItem[];
    });
}

/**
 * A vanilla mapper for items that are just id'd as themselves with no special handling.
 * @param item
 */
export function itemSubMenuData(item: LancerItem): SubMenuItem {
  return {
    favoritable: true,
    id: item.id,
    name: item.name,
    img: ENTRY_TYPE_IMG_MAP[item.type],
    isExhausted: !isUsableItem(item),
  };
}

let bondAvailable = `<i class="mdi mdi-hexagon-slice-6 power-uses-hex"></i>`;
let bondExausted = `<i class="mdi mdi-hexagon-outline power-uses-hex"></i>`;
export function bondSubMenuData(bond: LancerBOND): SubMenuItem[] {
  return bond.system.powers
    .filter((p) => p.unlocked)
    .map<SubMenuItem>((p) => {
      return {
        id: bond.id,
        name: p.name,
        cost: p.frequency,
        img: ENTRY_TYPE_IMG_MAP.BOND,
        description: p.description,
        isExhausted: !isUsableItem(bond),
      };
    });
}

function formatName(item: LancerItem) {
  const usable = isUsableItem(item);
}

/**
 * Slice up the loadout into something flatter and easier to work with for a menu.
 *
 * Returns an array of Item/Action/subMenuItem data so that is can be sliced and dices as needed by the menu.
 *
 * Feel free to modify the subMenuItem as well, its just a suggestion with defaults filled in based on item/action
 *
 * e.g.  getActionActionItem(actor).filter(byActionType("Protocol"))
 */
export function getActorActionItems(actor?: LancerActor): ActionItem[] {
  // NPCS have other tags, we will need to reverse this out maybe?
  // const tagLid = ACTIVATION_TAG_MAP[activationType];
  // We need an item/action/index ste
  //???
  //TODO: Deployable e.g.  A mine in addition to grenade.
  if (!actor) return [];
  let loadOut = actor.loadoutHelper.listLoadout();
  return (
    loadOut
      // They have special rendering and npc is defered work.
      .filter((i) => !(i.is_mech_weapon() || i.is_weapon_mod() || i.is_npc_feature()))
      .flatMap((item): ActionItem[] => {
        const itemId = item.id;
        const options: ActionItem[] = [];
        if (item.is_frame()) {
          options.push(coreSystem(item));
        }
        const acts = la().getItemActions(item) as ActionData[];
        const { cost, description } = tagsCostAndDescription(item);
        const usable = isUsableItem(item);
        //Try and match to a light theme image if one matches well.
        let img = ENTRY_TYPE_IMG_MAP[item.type.toUpperCase()] ?? item.img;
        const name = usable
          ? item.name
          : `<s class="horus--subtle" style="opacity:0.7;color:#e50000;">${item.name}</s>`;
        if (acts.length > 0) {
          options.push({
            item,
            actions: acts.map((action, idx) => {
              let fmtName = `${action.name}`;
              if (action.name === "Action") {
                fmtName = item.name;
              }
              const name = (item.system as any).destroyed
                ? `<s class="horus--subtle" style="opacity:0.7;color:#e50000;">${fmtName}</s>`
                : fmtName;
              return {
                action,
                subMenuItem: {
                  id: itemActionId(itemId, idx, "system.actions"),
                  name,
                  img,
                  description: action.detail,
                  cost,
                  isExhausted: !usable,
                  uses: item.isLimited() && item.system.uses,
                },
              };
            }),
          });
        }
        return options;
      })
  );
}
