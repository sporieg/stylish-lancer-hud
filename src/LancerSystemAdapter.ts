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
  ActivationTypeIcon,
  ActivationTypeValue,
  bondSubMenuData,
  ENTRY_TYPE,
  getActorActionItems,
  itemSubMenuData,
  RemapAction,
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
  cost: ActivationTypeIcon.QuickTech + ActivationTypeIcon.FullTech,
  description: "Trigger the invasion flow chart",
};

let missionRest: SubMenuActionItem = {
  id: "macro-MiJ9OGiYsgtHulQQ",
  name: "Rest",
  img: imgs.lancer.repair,
  cost: "Between Combat",
  description: "Repair between combat",
};

type SuperCategory = LayoutConfig & Omit<ActionMenuCategory, "id">;

const Groups = {
  activate: {
    systemId: "activate-player",
    label: "Start Turn",
    icon: "cci cci-activate",
    type: "system",
    visibility: {
      mode: "except",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
  compconFlow: {
    systemId: "compcon",
    label: "Turn Flow",
    icon: "cci cci-activate",
    type: "submenu",
    visibility: {
      mode: "except",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
  skills: {
    systemId: "pilot-skills",
    label: "Skills",
    icon: "cci cci-skill",
    type: "submenu",
    visibility: {
      mode: "only",
      actorTypes: [ENTRY_TYPE.PILOT],
    },
  },
  attack: {
    systemId: "weapons",
    label: "Attacks",
    icon: "cci cci-weapon",
    type: "submenu",
    visibility: {
      mode: "except",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
  invade: {
    systemId: "invade-systems",
    label: "Invade",
    icon: "cci cci-role-controller",
    type: "submenu",
    visibility: {
      mode: "except",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
  tech: {
    systemId: "tech-systems",
    label: "Other Actions",
    icon: "cci cci-role-support",
    type: "submenu",
    visibility: {
      mode: "except",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
  utility: {
    systemId: "utility-systems",
    label: "Utility",
    icon: "cci cci-mech-system",
    type: "submenu",
  },
  recallDeployable: {
    systemId: "recall-deployable",
    label: "Recall",
    icon: "cci cci-activate",
    type: "system",
    visibility: {
      mode: "only",
      actorTypes: [ENTRY_TYPE.DEPLOYABLE],
    },
  },
} satisfies Record<string, SuperCategory>;
type ActionMap = Record<string, SubMenuItem>;

// In order to favorite, all non-item ids will need to start with macro-
// Basic routing, by using the id and starts with you can id thing that map to the same aciton, e.g. basic-attack/basic-attack-ram
const actions = {
  stabilize: {
    id: "macro-k4o9aWoJTVb2sd8a",
    name: `Stabilize`,
    cost: ActivationTypeIcon.Full,
    img: imgs.lancer.marker,
    description: `When you STABILIZE, you enact emergency protocols to purge your mech’s systems of excess heat, repair your chassis where you can, or eliminate hostile code.`,
  },
  overcharge: {
    id: "overcharge",
    name: "Overcharge",
    cost: ActivationTypeIcon.Free,
    img: "systems/lancer/assets/icons/macro-icons/overcharge.svg",
    description: `Once per turn, you can OVERCHARGE your mech, allowing you to make any quick action as a free action – even actions you have already taken this turn.`,
  },
  improvised_attack: {
    id: "basic-attack-improvised",
    name: "Improvised Attack",
    img: imgs.lancer.mech_weapon,
    cost: ActivationTypeIcon.Full,
    description:
      "Make a melee or ranged attack using a non-weapon object or piece of terrain. On a hit, deal 1d6 AP kinetic damage.",
  },
  basic_attack: {
    id: "basic-attack",
    name: `Basic Attack`,
    cost: ActivationTypeIcon.Quick,
    img: imgs.la.underhand,
    description: "Just roll to hit, useful for grapple and the likes.",
  },
  basic_ram: {
    id: "basic-attack-ram",
    name: `Ram Attack`,
    cost: ActivationTypeIcon.Quick,
    img: imgs.la.ram,
    description: "Melee attack to ram your enemy",
  },
  basic_grapple: {
    id: "basic-attack-ram",
    name: `Grapple Attack`,
    img: imgs.la.grappling,
    cost: ActivationTypeIcon.Quick,
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

function _isCategoryVisible(visibility: CategoryVisibility, actor: LancerActor) {
  if (!visibility || !visibility.mode || visibility.mode === "all") return true;
  if (!actor) return true;

  const actorType = actor.type;
  const actorId = actor.id;
  const types = visibility.actorTypes || [];
  const ids = visibility.actorIds || [];

  const isMatched = types.includes(actorType) || ids.includes(actorId);

  if (visibility.mode === "only") return isMatched;
  if (visibility.mode === "except") return !isMatched;

  return true;
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
      quick: `${ActivationTypeIcon.Quick}Quick`,
      full: `${ActivationTypeIcon.Full}Full`,
      free: "Free",
      reactions: "Reactions",
    },
    items,
  } as const satisfies SubMenuData;
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

function byActionType(...activationType: ActivationTypeValue[]) {
  return (a: ActionItem): [SubMenuHeaderItem, ...SubMenuActionItem[]] | [] => {
    const validationActions = a.actions.filter((at) =>
      activationType.includes(at.action.activation),
    );
    if (validationActions.length === 0) return [];
    return [
      {
        name: a.item.name,
        isHeader: true,
      },
      ...validationActions.map((a) => a.subMenuItem),
    ];
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

    getResourceForEdit(actor: LancerActor, itemId: string) {
      //If itemId is a macro, remove it.  There is a bug in SUH where it never opens the normal macro method.
      if (itemId.startsWith("macro-")) {
        const macroId = itemId.replace("macro-", "");
        // @ts-ignore
        const existingMacros: string[] = actor.getFlag("stylish-action-hud", "macros") || [];
        const exists = existingMacros.find((id) => id !== macroId);
        // You know I really should check if the macro exists and something the player dropepd on.
        if (exists) {
          // @ts-ignore
          StylishAction.removeMacro(macroId);
        }
      }
      const item = (actor.items.get(itemId, {
        strict: false,
      }) ?? getItem(actor, itemId)[0]) as LancerItem | null;
      if (item) {
        if (
          item.isLimited() &&
          item.system.uses &&
          (item.system.uses.max || item.system.uses.value > 0)
        ) {
          return {
            itemId: item.id,
            isItem: true,
            itemName: item.name,

            label: "Uses",
            value: item.system.uses.value ?? 0,
            max: item.system.uses.max,
            path: "system.uses.value",
            isSpent: false,
          };
        } /*
        if(item.isLoading() && item.is_mech_weapon()) {
          return {
            itemId: item.id,
            isItem: true,
            itemName: item.name,
            label: "Loaded",
            //max: 1,
            //value: item.system.loaded ? 1 : 0,
            isSpent: !item.system.loaded,
            path: "system.loaded"
          }
        }
        return {
          itemName: item.name,
          lebel: "Just a man",
          itemId: item.id,
          isItem: false,
          isSpent: false
        }*/
        return null; //What should even happy when you set the value of Hacker 1 to 7?
      }
      return null;
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

    /**
     * The ordering of checks is very specific.  A action subm menu item could be many things.
     * In order we go
     *
     * * Macros.
     * * Specific menu actions like overcharge.
     * * Mech core system, that is not other sub items like passive/active.
     * * Pathed mech items that have an targeted internal activation.
     * * Generic items with one real use like skill/bond.
     * * Finally, anything falling back to generic activate.
     * @param actor
     * @param itemId
     * @param _event
     */
    override async useItem(actor: LancerActor, itemId: string, _event = null) {
      const item = actor.items.get(itemId, {
        strict: false,
      }) as LancerItem | null;

      // Send macros to our base adapter.
      if (itemId.startsWith("macro-")) return super.useItem(actor, itemId);

      if (itemId === actions.overcharge.id) return actor.beginOverchargeFlow();
      if (itemId.startsWith("basic-attack")) return actor.beginBasicAttackFlow("Basic Attack");
      if (itemId.startsWith("basic-tech")) return actor.beginBasicTechAttackFlow("Basic Tech");
      // We built an encoded id for system activations. Go specialized to general-purpose system flows.
      if (
        itemId.includes("system.core_system") &&
        !itemId.includes("system.core_system.active_actions") &&
        !itemId.includes("system.core_system.passive_actions")
      ) {
        return activateCoreSystem(actor, itemId);
      }
      if (itemId.includes("system")) return activateSystem(actor, itemId);
      if (!item) {
        ui.notifications?.warn(`Item not found: ${itemId}`);
        return;
      }
      const hasActions = item.hasActions() && item.system.actions.length > 0;
      if (item.is_weapon()) return item.beginWeaponAttackFlow();
      if (item.is_mech_system()) return item.beginSystemFlow();
      if (item.is_skill()) return item.beginSkillFlow();
      if (item.is_bond()) return item.beginBondPowerFlow(0);
      if (item.is_weapon_mod() && hasActions) {
        return item.beginActivationFlow();
      }
      return item.sheet.render(true);
    }

    override async executeAction(actor: LancerActor, actionId: string) {
      const categories = this.getActionCategories(actor);
      const category = categories.find((entry) => entry.id === actionId);
      switch (category.systemId) {
        case Groups.activate.systemId:
          const combatant = getCombatant(actor);
          // @ts-ignore
          return await game.combat.activateCombatant(combatant.id);
        case Groups.recallDeployable.systemId:
          const tokenA = actor.token;
          // This kills the crab
          return tokenA.delete();
      }
    }

    override getActionCategories(actor: LancerActor): ActionMenuCategory[] {
      let core = this.getDefaultLayout()
        .filter((a) => _isCategoryVisible(a.visibility, actor))
        .filter((a) => {
          // Leave activate on, if you got activations.
          const combatant = getCombatant(actor);
          return a.systemId !== Groups.activate.systemId || combatant?.activations.value > 0;
        })
        .map<ActionMenuCategory>((cat, index) => ({
          id: `menu-${index}`,
          systemId: cat.systemId,
          label: cat.label,
          icon: cat.icon,
          type: cat.type,
        }));
      return core;
    }

    // Dramatically simplified from core stylish hud.
    override getSubMenuData(actor: LancerActor, categoryId: string) {
      const categories = this.getActionCategories(actor);
      const category = categories.find((entry) => entry.id === categoryId);

      if (!category?.systemId) {
        return { title: "", items: [] };
      }

      return this._getSystemSubMenuData(actor, category.systemId, category);
    }

    _getSystemSubMenuData(
      actor: LancerActor,
      systemId: string,
      menuData: ActionMenuCategory,
    ): SubMenuData {
      let menu: _SubMenuData | undefined;
      if (systemId === Groups.attack.systemId && actor.is_mech()) {
        menu = this._buildWeapons(actor);
      } else if (systemId === Groups.invade.systemId && actor.is_mech()) {
        menu = this._buildInvades(actor);
      } else if (systemId === Groups.tech.systemId) {
        menu = this._buildTechActivations(actor);
      } else if (systemId === Groups.utility.systemId) {
        menu = this._buildUtility(actor);
      } else if (systemId === Groups.compconFlow.systemId && (actor.is_mech() || actor.is_npc())) {
        menu = this._buildCompconFlow(actor);
      } else if (systemId === Groups.skills.systemId && actor.is_pilot()) {
        menu = this._buildSkills(actor);
      }

      return fixupSmItems({
        ...(menu ?? { items: [] }),
        title: menuData.label,
      });
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

    //Can we put skilsl/bonds here?
    _buildUtility(actor: LancerActor): _SubMenuData {
      const categories: SubMenuData["subTabLabels"] = {
        macro: { label: game.i18n.localize("IBHUD.Dnd5e.Macros") },
        misc: {
          label: "Misc",
        },
        betweenCombat: {
          label: "Between Combat.",
        },
      };
      const items: SidebarSubMenuItems = {
        macro: { all: [] },
        misc: {
          all: [actions.stabilize, ...(actor.is_mech() ? [overcharge(actor)] : [])],
        },
        betweenCombat: {
          all: [missionRest],
        },
      };
      // @ts-ignore
      const macroIds: string[] = actor.getFlag("stylish-action-hud", "macros") || [];
      if (macroIds.length > 0) {
        macroIds.forEach((id) => {
          const macro = game.macros.get(id);
          if (macro) {
            items["macro"]["all"].push({
              id: `macro-${macro.id}`,
              name: macro.name,
              img: macro.img,
              //isPersonal: true,
              //customCatIndex: 0,
              cost: "",
              description: game.i18n.localize("IBHUD.UI.RightClickRemove"),
            });
          }
        });
      } else {
        // 매크로가 하나도 없으면 안내 아이템 추가
        items["macro"]["all"].push({
          id: "macro-help", // 클릭해도 아무 일 안 일어남 (useItem에서 무시됨)
          name: game.i18n.localize("IBHUD.UI.DragMacrosHere"), // "매크로를 이곳에 드래그"
          img: "icons/svg/down.svg", // 화살표 아이콘
          cost: "",
          description: "Drag & Drop macros from the hotbar to the Action Menu.",
          isHeader: false, // 헤더는 아니지만 클릭은 안 됨
          favoritable: false,
        });
      }
      const primaryLabels = Object.keys(categories).reduce((acc, key) => {
        if (key === "macro" && items["macro"]["all"].length === 0) return acc;
        acc[key] = categories[key].label;
        return acc;
      }, {});

      return {
        //title: game.i18n.localize("IBHUD.Titles.Utility"),
        hasTabs: true,
        hasSubTabs: true,
        items: items,
        tabLabels: primaryLabels,
        tabTooltips: primaryLabels,
        subTabLabels: {
          macro: { all: "Macro" },
          misc: {
            all: "Miscel",
          },
          betweenCombat: {
            all: "Between Combat",
          },
        },
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
      keyItems.Quick.push(SimpleActionMacros.Deploy_Item);
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

    override getDefaultLayout(): SuperCategory[] {
      return Object.values(Groups);
    }
  }

  api.registerSystemAdapter("lancer", LancerSystemAdapter);
});
