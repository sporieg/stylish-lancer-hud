import {
  LancerActor,
  LancerMECH,
  LancerNPC,
  LancerPILOT,
} from "foundryvtt-lancer/actor/lancer-actor";
import { LancerItem, LancerSKILL } from "foundryvtt-lancer/item/lancer-item";
import type { ActionData } from "foundryvtt-lancer/models/bits/action";
import { debug } from "./log.js";
import { imgs } from "./Images.js";
import {
  ActionItem,
  ACTIVATION_TAG_MAP,
  ActivationLabels,
  ActivationType,
  bondSubMenuData,
  getActorActionItems,
  itemSubMenuData,
  RemapAction,
  SheetTypes,
  weaponsByMount,
} from "./ActivationType.js";
import { SimpleActionMacros } from "./SimpleActions.js";
import { getCombatant, pilotForMech } from "./adapters/helpers.js";
import { getItem } from "./ActivatedItem.js";
import attributeLooks from "./adapters/attributes.js";

const isInvade = (a: Pick<ActionData, "activation">) => a.activation === "Invade";

// Lancer icons at: https://github.com/massif-press/compcon/blob/master/src/assets/glyphs/glyphs.css
let macroInvade: SubMenuActionItem = {
  id: "macro-o3nZI3EidYMVc9UX",
  name: "Invasion Flow",
  img: imgs.lancer.tech_quick,
  cost: ActivationType.QuickTech + ActivationType.FullTech,
  description: "Trigger the invasion flow chart",
};

let missionRest: SubMenuActionItem = {
  id: "macro-MiJ9OGiYsgtHulQQ",
  name: "Rest",
  img: imgs.lancer.repair,
  cost: "Between Combat",
  description: "Repair between combat",
};

const Groups = {
  compconFlow: {
    id: "compcon",
    systemId: "compcon",
    label: "Turn Flow",
    icon: "cci cci-activate",
    type: "submenu",
  },
  skills: {
    id: "skills",
    systemId: "pilot-skills",
    label: "Skills",
    icon: "cci cci-skill",
    type: "submenu",
  },
  hase: {
    id: "hase",
    systemId: "pilot-hase",
    label: "Stats",
    icon: "cci cci-skill",
    type: "submenu",
  },
  attacks: {
    id: "attacks",
    systemId: "attacks",
    label: "Attacks",
    icon: "cci cci-role-striker",
    type: "submenu",
  },
  attack: {
    id: "weapons",
    systemId: "weapons",
    label: "Attacks",
    icon: "cci cci-weapon",
    type: "submenu",
  },
  invade: {
    id: "invade",
    systemId: "invade-systems",
    label: "Invade",
    icon: "cci cci-role-controller",
    type: "submenu",
  },
  tech: {
    id: "techs",
    systemId: "tech-systems",
    label: "Other Actions",
    icon: "cci cci-role-support",
    type: "submenu",
  },
  utility: {
    id: "utility",
    systemId: "utility-systems",
    label: "Utility",
    icon: "cci cci-mech-system",
    type: "submenu",
  },
  activate: {
    id: "activate",
    systemId: "activate-player",
    label: "Start Turn",
    icon: "cci cci-activate",
    type: "system",
  },
  recallDeployable: {
    id: "recall-deployable",
    systemId: "recall-deployable",
    label: "Recall",
    // Needs a better icon I thinks.
    icon: "cci cci-activate",
    type: "system",
  },
  status: {
    id: "apply-statuses",
    label: "Status And Conditions",
    systemId: "statuses-and-conditions",
    icon: "cci ",
    type: "submenu",
  },
} satisfies Record<string, ActionMenuCategory>;
type ActionMap = Record<string, SubMenuItem>;

// In order to favorite, all non-item ids will need to start with macro-
// Basic routing, by using the id and starts with you can id thing that map to the same aciton, e.g. basic-attack/basic-attack-ram
const actions = {
  stabilize: {
    id: "macro-k4o9aWoJTVb2sd8a",
    name: `Stabilize`,
    cost: ActivationType.Full,
    img: imgs.lancer.marker,
    description: `When you STABILIZE, you enact emergency protocols to purge your mech’s systems of excess heat, repair your chassis where you can, or eliminate hostile code.`,
  },
  overcharge: {
    id: "overcharge",
    name: "Overcharge",
    cost: ActivationType.Free,
    img: "systems/lancer/assets/icons/macro-icons/overcharge.svg",
    description: `Once per turn, you can OVERCHARGE your mech, allowing you to make any quick action as a free action – even actions you have already taken this turn.`,
  },
  improvised_attack: {
    id: "basic-attack-improvised",
    name: "Improvised Attack",
    img: imgs.lancer.mech_weapon,
    cost: ActivationType.Full,
    description:
      "Make a melee or ranged attack using a non-weapon object or piece of terrain. On a hit, deal 1d6 AP kinetic damage.",
  },
  basic_attack: {
    id: "basic-attack",
    name: `Basic Attack`,
    cost: ActivationType.Quick,
    img: imgs.la.underhand,
    description: "Just roll to hit, useful for grapple and the likes.",
  },
  basic_ram: {
    id: "basic-attack-ram",
    name: `Ram Attack`,
    cost: ActivationType.Quick,
    img: imgs.la.ram,
    description: "Melee attack to ram your enemy",
  },
  basic_grapple: {
    id: "basic-attack-ram",
    name: `Grapple Attack`,
    img: imgs.la.grappling,
    cost: ActivationType.Quick,
    description: "Melee attack to grapple your enemy",
  },
} satisfies ActionMap;

/**
 * To build the overchage item, we need to know the cost by looking it up.
 * @param actor
 */
function overcharge(actor: LancerMECH): SubMenuItem {
  const cost = actor.system.overcharge.valueOf();
  let costs = actor.system.overcharge_sequence.split(",");
  const seq = costs[Math.min(cost, costs.length)];
  return {
    ...actions.overcharge,
    cost: `${actions.overcharge.cost} ${seq} Heat`,
  };
}

/**
 * Use a function to always create a new set of actions each time.
 * @constructor
 */
const FlowItems = () => ({
  mech: {
    protocol: [] as SubMenuItem[],
    quick: [
      SimpleActionMacros.Skirmish,
      macroInvade,
      SimpleActionMacros.Deploy_Item,
      SimpleActionMacros.Lock_On,
      SimpleActionMacros.Hide,
      SimpleActionMacros.Search,
      SimpleActionMacros.Scan,
      SimpleActionMacros.Bolster,
      SimpleActionMacros.Eject,
      actions.basic_attack,
      actions.basic_ram,
      actions.basic_grapple,
    ],
    full: [
      SimpleActionMacros.Barrage,
      SimpleActionMacros.Disengage,
      actions.stabilize,
      SimpleActionMacros.Dismount,
      actions.improvised_attack,
      SimpleActionMacros.Boot_Up,
    ],
    free: [] as SubMenuItem[],
    reactions: [SimpleActionMacros.Overwatch, SimpleActionMacros.Brace],
  },
  npc: {
    protocol: [] as SubMenuItem[],
    quick: [
      SimpleActionMacros.Skirmish,
      macroInvade,
      SimpleActionMacros.Deploy_Item,
      SimpleActionMacros.Lock_On,
      SimpleActionMacros.Hide,
      SimpleActionMacros.Search,
      actions.basic_attack,
      actions.basic_ram,
      actions.basic_grapple,
    ],
    full: [
      SimpleActionMacros.Barrage,
      SimpleActionMacros.Disengage,
      actions.stabilize,
      actions.improvised_attack,
      SimpleActionMacros.Boot_Up,
    ],
    free: [] as SubMenuItem[],
    reactions: [SimpleActionMacros.Overwatch],
  },
});

/*
 * The basic scaffolding before any systems are read from the actor.
 * This method is allowed to use the actor for simple reads, e.g. overcharge cost.
 */
const CompconFLow = (actor: LancerActor) => {
  let items = FlowItems()[actor.type];
  if (actor.is_mech()) {
    items.free.push(overcharge(actor));
  }
  return {
    title: "Active Mode",
    hasTabs: true,
    tabLabels: {
      protocol: "Protocol",
      quick: `${ActivationType.Quick}Quick`,
      full: `${ActivationType.Full}Full`,
      free: "Free",
      reactions: "Reactions",
    },
    items,
  } as const satisfies SubMenuData;
};

const actionCategoriesByType: Record<SheetTypes, ActionMenuCategory[]> = {
  deployable: [Groups.recallDeployable],
  mech: [Groups.compconFlow, Groups.attack, Groups.invade, Groups.tech, Groups.utility],
  npc: [Groups.compconFlow],
  pilot: [Groups.skills],
};

/**
 * Hits an embedde activation in the system item.
 * @param actor
 * @param actionId
 */
function activateSystem(actor: LancerActor, actionId: string) {
  const [item, dataPath] = getItem(actor, actionId);
  if (!item) {
    ui.notifications?.warn(`Item not found: ${actionId}`);
    return;
  }
  return item.beginActivationFlow(dataPath);
}

function activateCoreSystem(actor: LancerActor, actionId: string) {
  const [item, dataPath] = getItem(actor, actionId);
  return item.beginCoreActiveFlow(dataPath);
}

type _SubMenuData = {
  theme?: string;
  hasTabs?: boolean;
  hasSubTabs?: boolean;
  items: FlatSubMenuItems | TabbedSubMenuItems | SidebarSubMenuItems;
  tabLabels?: Record<string, string>;
  tabTooltips?: Record<string, string>;
  subTabLabels?: Record<string, Record<string, string>>;
};

function fixupSmItems(sm: SubMenuData): SubMenuData {
  // Sub Men Items that are macros have a hidden property, globalFlavor.  Set that here from the description
  // to bring back a useful tooltip;
  let items = sm.items;
  // Its all side effects, might be cleaner to just visit the items instead, oh well.
  if (!Array.isArray(items)) {
    items = Object.values(items).flatMap((x) => x);
  }
  items.forEach((i) => {
    i.globalFlavor = i.description;
  });
  return sm;
}

// Native equiv for lodash get.
const get = (obj, path, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

function byActionType(...activationType: (keyof typeof ACTIVATION_TAG_MAP)[]) {
  return (a: ActionItem): SubMenuItem[] => {
    // @ts-ignore
    if (activationType.includes(a.action.activation)) return [a.subMenuItem];
    return [];
  };
}

/**
 * Categories
 *
 * * Weapon Actions
 * * Invade Actions
 * * Deployables
 * * Other Systems
 */
// @ts-ignore
Hooks.once("stylish-action-hud.apiReady", (api: StylishActionHudAPI) => {
  debug("Registering Lancer System Adapter");

  class LancerSystemAdapter extends api.BaseSystemAdapter {
    systemId: string = "lancer-system";

    constructor() {
      super();
    }

    override getStats(actor: LancerActor, configAttributes: AttributeConfig[]) {
      return super.getStats(actor, configAttributes).map((a) => {
        if (/^system\.(hull|agi|sys|eng)$/.test(a.path)) {
          a.max = 6;
        }
        //Most attributes won't change, but just in case.
        a.hitFeedback = /^system\.(hp|structure|heat|stress)$/.test(a.path);
        return a;
      });
    }

    override updateAttribute(actor: LancerActor, path: string, input: string) {
      return super.updateAttribute(actor, path, input);
    }

    override getConditions(actor: LancerActor) {
      return (actor.temporaryEffects || [])
        .filter((e) => e.img)
        .map<ConditionData>((e) => {
          return {
            id: e.id || e.name,
            src: e.img,
            name: e.name || "Unknown",
            value: null,
          };
        });
    }

    override rollStat(actor: LancerActor, path: string, _event: Event) {
      if (this.isStatRollable(path)) {
        return actor.beginStatFlow(path);
      }
      return null;
    }

    isEditable(path: string) {
      return /^system\.(hp|heat|stress|)/.test(path);
    }

    override isStatRollable(path: string) {
      return /^system\.(hull|agi|sys|eng|grit)$/.test(path);
    }

    override resolveQuickSlotData(actor: LancerActor, itemId: string): QuickSlotData {
      const base = super.resolveQuickSlotData(actor, itemId);
      if (base) {
        return base;
      }
      const action = Object.values(actions).find((a) => a.id === itemId);
      if (action) {
        return action;
      }
      const [embeddedItemAction, path] = getItem(actor, itemId);
      let activ: ActionData | undefined = get(embeddedItemAction, path);
      if (embeddedItemAction) {
        return {
          name: activ?.name ?? embeddedItemAction.name,
          // I want the action name, imm,
          img: embeddedItemAction.img,
        };
      }
      return null;
    }

    override async useItem(actor: LancerActor, itemId: string, _event = null) {
      const item = actor.items.get(itemId, {
        strict: false,
      }) as LancerItem | null;

      // Send macros to our base adapter.
      if (itemId.startsWith("macro-")) return super.useItem(actor, itemId);
      if (itemId === actions.overcharge.id) return actor.beginOverchargeFlow();
      // We built an encoded id for system activations. Go specialized to general-purpose system flows.
      if (
        itemId.includes("system.core_system") &&
        !itemId.includes("system.core_system.active_actions") &&
        !itemId.includes("system.core_system.passive_actions")
      ) {
        return activateCoreSystem(actor, itemId);
      }
      if (itemId.includes("system")) return activateSystem(actor, itemId);
      if (itemId.startsWith("basic-attack")) return actor.beginBasicAttackFlow("Basic Attack");
      if (itemId.startsWith("basic-tech")) return actor.beginBasicTechAttackFlow("Basic Tech");
      if (!item) {
        ui.notifications?.warn(`Item not found: ${itemId}`);
        return;
      }
      if (item.is_weapon()) return item.beginWeaponAttackFlow();
      if (item.is_weapon_mod()) return item.beginActivationFlow();
      if (item.is_mech_system()) return item.beginSystemFlow();
      if (item.is_skill()) return item.beginSkillFlow();
      if (item.is_bond()) return item.beginBondPowerFlow(0);
      return item.sheet.render(true);
    }

    override async executeAction(actor: LancerActor, actionId: string) {
      switch (actionId) {
        case Groups.activate.id:
          const combatant = getCombatant(actor);
          // @ts-ignore
          return await game.combat.activateCombatant(combatant.id);
        case Groups.recallDeployable.id:
          const tokenA = actor.token;
          // This kills the crab
          return tokenA.delete();
      }
    }

    getCoreLancerActions(actor: LancerActor): ActionMenuCategory[] {
      const cats = actionCategoriesByType[actor.type];
      return cats ?? [{ id: "sheet", label: "Sheet", icon: "fa-solid fa-id-card", type: "sheet" }];
    }

    override getActionCategories(actor: LancerActor): ActionMenuCategory[] {
      let customized = super.getActionCategories(actor);
      const basicActions = this.getCoreLancerActions(actor).map((a, idx) => {
        if (a.type == "submenu") {
          a.id = `${a.id}-${idx}`;
        }
        return a;
      });
      const combatant = getCombatant(actor);
      if (combatant?.activations.value > 0) {
        basicActions.push(Groups.activate);
      }
      if (customized?.length > 0) {
        basicActions.push(...customized);
      }
      return basicActions;
    }

    override _getSystemSubMenuData(
      actor: LancerActor,
      systemId: string,
      menuData: ActionMenuCategory,
    ): SubMenuData {
      // fixupSmItems(subMenuData);
      const menu: SubMenuData = {
        title: menuData.label,
        items: [],
      };
      if (systemId === Groups.attack.systemId && actor.is_mech()) {
        menu.items = this._buildWeapons(actor).items;
      } else if (systemId === Groups.invade.systemId && actor.is_mech()) {
        menu.items = this._buildInvades(actor).items;
      } else if (systemId === Groups.tech.systemId) {
        menu.items = this._buildTechActivations(actor).items;
      } else if (systemId === Groups.utility.systemId) {
        menu.items = this._buildUtility(actor).items;
      } else if (systemId === Groups.compconFlow.systemId && (actor.is_mech() || actor.is_npc())) {
        menu.items = this._buildCompconFlow(actor).items;
      } else if (systemId === Groups.skills.systemId && actor.is_pilot()) {
        menu.items = this._buildSkills(actor).items;
      }
      return fixupSmItems(menu);
    }

    _buildCompconFlow(actor: LancerMECH | LancerNPC) {
      const base = CompconFLow(actor);
      const { protocol, quick, full, free, reactions } = base.items;
      let mechActionItems = getActorActionItems(actor);
      let pilotActionTimes = actor.is_mech() ? getActorActionItems(pilotForMech(actor)) : [];
      let mechHeader = {
        id: "none",
        name: "Mech Systems",
        isHeader: true,
      };
      let pHeader = {
        id: "none",
        name: "Pilot Systems",
        isHeader: true,
      };

      function push(to: SubMenuItem[], filter: (a: ActionItem) => SubMenuItem[]) {
        const mActions = mechActionItems.flatMap(filter);
        const pActions = pilotActionTimes.flatMap(filter);
        if (mActions.length > 0) {
          to.push(mechHeader, ...mActions);
        }
        if (pActions.length > 0) {
          to.push(pHeader, ...pActions);
        }
      }

      push(protocol, byActionType("Protocol"));
      push(quick, byActionType("Quick", "Quick Tech"));
      push(full, byActionType("Full", "Full Tech"));
      push(free, byActionType("Free"));
      push(reactions, byActionType("Reaction"));
      return base;
    }

    _buildUtility(actor: LancerActor): _SubMenuData {
      return {
        items: [
          actions.stabilize,
          ...(actor.is_mech() ? [overcharge(actor)] : []),
          SimpleActionMacros.Deploy_Item,
          SimpleActionMacros.Skirmish,
          SimpleActionMacros.Barrage,
          macroInvade,
          missionRest,
        ],
      };
    }

    _buildSkills(actor: LancerPILOT): _SubMenuData {
      const skills = actor.items
        .map((x) => x as LancerItem)
        .filter((i): i is LancerSKILL => i.is_skill());
      const bond = actor.system.bond;
      const bondPowers = bondSubMenuData(bond);
      let skillItems = [
        {
          id: "",
          isHeader: true,
          name: "Skills",
        },
        ...skills.map((skill: LancerSKILL) => {
          const s = skill.system;
          return {
            ...itemSubMenuData(skill),
            cost: `+${s.curr_rank * 2}`,
            description: s.description,
          };
        }),
      ];
      let bondItems = [
        ...(bondPowers.length > 0
          ? [
              {
                id: "",
                isHeader: true,
                name: "Bond Powers",
              },
            ]
          : []),
        ...bondPowers,
      ];
      return {
        items: [...bondItems, ...skillItems],
      };
    }

    _buildWeapons(actor: LancerMECH): _SubMenuData {
      let weaponItems = weaponsByMount(actor);
      let tabLabels = {
        attack: "Attacks",
        mounts: "Mounts",
      };
      let items = {
        attack: [
          SimpleActionMacros.Skirmish,
          SimpleActionMacros.Barrage,
          {
            isHeader: true,
            name: "Basic Attacks",
          } as SubMenuHeaderItem,
          actions.basic_attack,
          actions.basic_ram,
          actions.basic_grapple,
        ],
        mounts: weaponItems,
      };
      return {
        theme: "red",
        hasTabs: true,
        tabLabels: tabLabels,
        items: items,
      };
    }

    _buildInvades(actor: LancerMECH): SubMenuData {
      const invades = [...getActorActionItems(actor), ...getActorActionItems(pilotForMech(actor))]
        .map((ai) => ({
          item: ai.item,
          actions: ai.actions.filter((a) => isInvade(a.action)),
        }))
        .filter((ai) => ai.actions.length > 0)
        .flatMap<SubMenuItem>((ai) => [
          {
            isHeader: true,
            name: ai.item.name,
          },
          ...ai.actions.map((a) => a.subMenuItem),
        ]);
      const items: TabbedSubMenuItems = {
        flow: [macroInvade, SimpleActionMacros.Fragment_Signal],
        full: [SimpleActionMacros.Fragment_Signal, ...invades],
      };
      return {
        title: "Invade Options",
        hasTabs: true,
        tabLabels: {
          flow: "Invade Flow",
          full: "All Invade Options",
        },
        items,
      };
    }

    _buildTechActivations(actor: LancerActor): SubMenuData {
      // ToDO: We should also add the item as a header for each action/pair of actins.
      const keyItems: Record<keyof typeof ActivationLabels, SubMenuItem[]> = Object.fromEntries(
        Object.keys(ActivationLabels).map((k) => [k, []]),
      ) as Record<keyof typeof ActivationLabels, SubMenuItem[]>;
      // I could just use the enum if it weren't for needing to filter it out.
      const tabLabels: Record<keyof typeof ActivationLabels, string> = {
        ...ActivationLabels,
      } as Record<keyof typeof ActivationLabels, string>;
      const actions = getActorActionItems(actor);
      if (actor.is_mech()) {
        let pactions = getActorActionItems(pilotForMech(actor));
        actions.push(...pactions);
      }
      actions
        .map((ai) => ({
          item: ai.item,
          actions: ai.actions.filter((a) => !isInvade(a.action)),
        }))
        .filter((ai) => ai.actions.length > 0)
        .flatMap((ai) => ai.actions)
        .forEach((at) => {
          const activ = at.action.activation;
          const mapped = RemapAction[activ];
          const k = keyItems[mapped ?? activ];
          if (!k) {
            console.error("Missing key for", at);
            return;
          }
          k.push(at.subMenuItem);
        });
      // No nice collections way of doing this :(
      // Remove our empties and add in a headers splitter.
      for (const key of Object.keys(keyItems)) {
        const value = keyItems[key];
        if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
          delete keyItems[key];
          delete tabLabels[key];
        }
      }
      return {
        title: "Systems",
        tabLabels,
        items: keyItems,
        hasTabs: true,
      };
    }

    override getDefaultAttributes() {
      return [
        { path: "system.hp", label: "HP", color: "#2ca020", style: "bar", combatOnly: true },
        { path: "system.heat", label: "Heat", color: "#e61c34", style: "bar", combatOnly: true },
        {
          path: "system.bond_state.stress",
          label: "Heat",
          color: "#e61c34",
          style: "bar",
          hideInCombat: true,
        },
        // style number = just the number, text number/max
        {
          path: "system.structure",
          label: "Structure",
          color: "#195e14",
          style: "bar",
          combatOnly: true,
        },
        {
          path: "system.stress",
          label: "Stress",
          color: "#80101c",
          style: "bar",
          combatOnly: true,
        },
        // Put your own saves in
        {
          path: "system.hull",
          label: "Hull",
          color: "#1a6f73",
          style: "dots",
          ownerOnly: true,
          combatOnly: true,
        },
        {
          path: "system.agi",
          label: "Agility",
          color: "#1a6f73",
          style: "dots",
          ownerOnly: true,
          combatOnly: true,
        },
        {
          path: "system.sys",
          label: "System",
          color: "#1a6f73",
          style: "dots",
          ownerOnly: true,
          combatOnly: true,
        },
        {
          path: "system.eng",
          label: "Engineering",
          color: "#1a6f73",
          style: "dots",
          ownerOnly: true,
          combatOnly: true,
        },
        {
          path: "system.grit",
          label: "Grit",
          color: "#e61c34",
          style: "dots",
          ownerOnly: true,
          combatOnly: true,
        },
      ];
    }

    getTrackableAttributes(actor: LancerActor): TrackableAttribute[] {
      const type = actor.type;
      return attributeLooks[type];
    }
  }

  api.registerSystemAdapter("lancer", LancerSystemAdapter);
});
