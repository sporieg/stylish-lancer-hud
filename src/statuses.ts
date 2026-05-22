const baseList = [
  {
    "id": "immobilized",
    "name": "lancer.statusIconsNames.immobilized",
    "img": "systems/lancer/assets/icons/white/condition_immobilized.svg",
    "description": "IMMOBILIZED characters cannot make any voluntary movements, although involuntary movements are unaffected."
  },
  {
    "id": "impaired",
    "name": "lancer.statusIconsNames.impaired",
    "img": "systems/lancer/assets/icons/white/condition_impaired.svg",
    "description": "IMPAIRED characters receive +1 difficulty on all attacks, saves, and skill checks."
  },
  {
    "id": "jammed",
    "name": "lancer.statusIconsNames.jammed",
    "img": "systems/lancer/assets/icons/white/condition_jammed.svg",
    "description": "JAMMED characters can’t:<br />• use comms to talk to other characters;<br />• make attacks, other than IMPROVISED ATTACK, GRAPPLE, and RAM;<br />• take reactions, or take or benefit from tech actions."
  },
  {
    "id": "lockon",
    "name": "lancer.statusIconsNames.lockon",
    "img": "systems/lancer/assets/icons/white/condition_lockon.svg",
    "description": "Hostile characters can choose to consume a character’s LOCK ON condition in exchange for +1 accuracy on their next attack against that character.<br />LOCK ON is also required to use some talents and systems."
  },
  {
    "id": "shredded",
    "name": "lancer.statusIconsNames.shredded",
    "img": "systems/lancer/assets/icons/white/condition_shredded.svg",
    "description": "SHREDDED characters don’t benefit from ARMOR or RESISTANCE."
  },
  {
    "id": "slow",
    "name": "lancer.statusIconsNames.slow",
    "img": "systems/lancer/assets/icons/white/condition_slow.svg",
    "description": "The only movement SLOWED characters can make is their standard move, on their own turn – they can’t BOOST or make any special moves granted by talents, systems, or weapons."
  },
  {
    "id": "stunned",
    "name": "lancer.statusIconsNames.stunned",
    "img": "systems/lancer/assets/icons/white/condition_stunned.svg",
    "description": "STUNNED mechs cannot OVERCHARGE, move, or take any actions – including free actions and reactions. Pilots can still MOUNT, DISMOUNT, or EJECT from STUNNED mechs, and can take actions normally.<br />STUNNED mechs have a maximum of 5 EVASION, and automatically fail all HULL and AGILITY checks and saves.",
    "changes": [
      {
        "key": "system.evasion",
        "value": "5",
        "mode": 5,
        "priority": null
      },
      {
        "key": "system.evasion",
        "value": "5",
        "mode": 5,
        "priority": null
      },
      {
        "key": "system.evasion",
        "value": "5",
        "mode": 5,
        "priority": null
      },
      {
        "key": "system.evasion",
        "value": "5",
        "mode": 5,
        "priority": null
      }
    ]
  },
  {
    "id": "dangerzone",
    "name": "lancer.statusIconsNames.dangerzone",
    "img": "systems/lancer/assets/icons/white/status_dangerzone.svg",
    "description": "Characters are in the DANGER ZONE when half or more of their heat is filled in. They’re smoking hot, which enables some attacks, talents, and effects."
  },
  {
    "id": "downandout",
    "name": "lancer.statusIconsNames.downandout",
    "img": "systems/lancer/assets/icons/white/status_downandout.svg",
    "description": "Pilots that are DOWN AND OUT are unconscious and STUNNED – if they take any more damage, they die. They'll regain consciousness and half of their HP when they rest."
  },
  {
    "id": "engaged",
    "name": "lancer.statusIconsNames.engaged",
    "img": "systems/lancer/assets/icons/white/status_engaged.svg",
    "description": "If a character moves adjacent to a hostile character, they both gain the ENGAGED status for as long as they remain adjacent to one another. Ranged attacks made by an ENGAGED character receive +1 difficulty. Additionally, characters that become ENGAGED by targets of equal or greater SIZE during the course of a movement stop moving immediately and lose any unused movement."
  },
  {
    "id": "exposed",
    "name": "lancer.statusIconsNames.exposed",
    "img": "systems/lancer/assets/icons/white/status_exposed.svg",
    "description": "Characters become EXPOSED when they’re dealing with runaway heat buildup – their armor is weakened by overheating, their vents are open, and their weapons are spinning down, providing plenty of weak points. All kinetic, explosive, or energy damage taken by EXPOSED characters is doubled, before applying any reductions. A mech can clear EXPOSED by taking the STABILIZE action."
  },
  {
    "id": "hidden",
    "name": "lancer.statusIconsNames.hidden",
    "img": "systems/lancer/assets/icons/white/status_hidden.svg",
    "description": "HIDDEN characters can’t be targeted by hostile attacks or actions, don’t cause engagement, and enemies only know their approximate location. Attacking, forcing saves, taking reactions, using BOOST, and losing cover all remove HIDDEN after they resolve. Characters can find HIDDEN characters with SEARCH."
  },
  {
    "id": "invisible",
    "name": "lancer.statusIconsNames.invisible",
    "img": "systems/lancer/assets/icons/white/status_invisible.svg",
    "description": "All attacks against INVISIBLE characters, regardless of type, have a 50 percent chance to miss outright, before an attack roll is made. Roll a dice or flip a coin to determine if the attack misses.<br />Additionally, INVISIBLE characters can always HIDE, even without cover."
  },
  {
    "id": "intangible",
    "name": "lancer.statusIconsNames.intangible",
    "img": "systems/lancer/assets/icons/white/status_intangible.svg",
    "description": "INTANGIBLE characters can move through obstructions such as characters or terrain but not end their turns in them. They, their actions, and any effects they own or control can only affect other Intangible characters and objects. Tangible characters can move through INTANGIBLE characters and objects but not end their turns inside their spaces and can’t affect them in any way. INTANGIBLE characters cannot capture points or count for zones (for sitreps) and don’t count as adjacent to tangible characters.<br />Effects that are already active on a character when they become INTANGIBLE, such as statuses, remain active, but effects that require an ongoing interaction between two characters or objects (like traps or force fields) end. If a mech becomes INTANGIBLE, its pilot remains INTANGIBLE for the same duration."
  },
  {
    "id": "prone",
    "name": "lancer.statusIconsNames.prone",
    "img": "systems/lancer/assets/icons/white/status_prone.svg",
    "description": "Attacks against PRONE targets receive +1 accuracy.<br />Additionally, PRONE characters are SLOWED and count as moving in difficult terrain. Characters can remove PRONE by standing up instead of taking their standard move, unless they’re IMMOBILIZED. Standing up doesn’t count as movement, so doesn’t trigger OVERWATCH or other effects."
  },
  {
    "id": "shutdown",
    "name": "lancer.statusIconsNames.shutdown",
    "img": "systems/lancer/assets/icons/white/status_shutdown.svg",
    "description": "When a mech is SHUT DOWN:<br />• all heat is cleared and the EXPOSED status is removed;<br />• any cascading NHPs are stabilised and no longer cascading;<br />• any statuses and conditions affecting the mech caused by tech actions, such as LOCK ON, immediately end.<br />SHUT DOWN mechs have IMMUNITY to all tech actions and attacks, including any from allied characters.<br />While SHUT DOWN, mechs are STUNNED indefinitely. Nothing can prevent this condition, and it remains until the mech ceases to be SHUT DOWN."
  },
  {
    "id": "bolster",
    "name": "lancer.statusIconsNames.bolster",
    "img": "icons/svg/upgrade.svg"
  },
  {
    "id": "npc_tier_1",
    "name": "lancer.statusIconsNames.npc_tier_1",
    "img": "systems/lancer/assets/icons/white/npc_tier_1.svg"
  },
  {
    "id": "npc_tier_2",
    "name": "lancer.statusIconsNames.npc_tier_2",
    "img": "systems/lancer/assets/icons/white/npc_tier_2.svg"
  },
  {
    "id": "npc_tier_3",
    "name": "lancer.statusIconsNames.npc_tier_3",
    "img": "systems/lancer/assets/icons/white/npc_tier_3.svg"
  },
  {
    "id": "flying",
    "name": "lancer.statusIconsNames.flying",
    "img": "icons/svg/wing.svg"
  },
  {
    "id": "grappled",
    "name": "lancer.statusIconsNames.grappled",
    "img": "systems/lancer/assets/icons/alt-status/hayleycondstat/grappled.webp"
  },
  {
    "id": "resistance_burn",
    "name": "lancer.statusIconsNames.resistance_burn",
    "img": "systems/lancer/assets/icons/white/resistance_burn.svg"
  },
  {
    "id": "resistance_energy",
    "name": "lancer.statusIconsNames.resistance_energy",
    "img": "systems/lancer/assets/icons/white/resistance_energy.svg"
  },
  {
    "id": "resistance_explosive",
    "name": "lancer.statusIconsNames.resistance_explosive",
    "img": "systems/lancer/assets/icons/white/resistance_explosive.svg"
  },
  {
    "id": "resistance_heat",
    "name": "lancer.statusIconsNames.resistance_heat",
    "img": "systems/lancer/assets/icons/white/resistance_heat.svg"
  },
  {
    "id": "resistance_kinetic",
    "name": "lancer.statusIconsNames.resistance_kinetic",
    "img": "systems/lancer/assets/icons/white/resistance_kinetic.svg"
  },
  {
    "id": "cover_hard",
    "name": "lancer.statusIconsNames.cover_hard",
    "img": "systems/lancer/assets/icons/white/cover_hard.svg"
  },
  {
    "id": "cover_soft",
    "name": "lancer.statusIconsNames.cover_soft",
    "img": "systems/lancer/assets/icons/white/cover_soft.svg"
  },
  {
    "id": "blind",
    "name": "lancer.statusIconsNames.blind",
    "img": "systems/lancer/assets/icons/alt-status/hayleyutil/blind.webp"
  },
  {
    "id": "burn",
    "name": "lancer.statusIconsNames.burn",
    "img": "systems/lancer/assets/icons/alt-status/hayleyutil/burn.webp"
  },
  {
    "id": "overshield",
    "name": "lancer.statusIconsNames.overshield",
    "img": "systems/lancer/assets/icons/alt-status/hayleyutil/overshield.webp"
  },
  {
    "id": "reactor_meltdown",
    "name": "lancer.statusIconsNames.reactor_meltdown",
    "img": "systems/lancer/assets/icons/alt-status/hayleyutil/reactor-meltdown.webp"
  },
  {
    "id": "core_power_active",
    "name": "Core Power Active",
    "img": "systems/lancer/assets/icons/white/corepower.svg",
    "description": "",
    "changes": []
  },
  {
    "id": "infection",
    "name": "Infection",
    "img": "modules/lancer-automations/icons/infection.svg",
    "description": "Like Burn, but applies Heat instead of damage. Characters immediately take Heat equal to the Infection received, and the value stacks if Infection is already present. At the end of their turn, they roll a Systems check: on success they clear all Infection, otherwise they take Heat equal to the current Infection. Anything that clears Burn (e.g. Stabilize) also clears Infection."
  },
  {
    "id": "guardian",
    "name": "Guardian",
    "img": "modules/lancer-automations/icons/guarded-tower.svg",
    "description": "Allied characters adjacent to this character can use them as hard cover."
  },
  {
    "id": "cascading",
    "name": "Cascading",
    "img": "icons/svg/paralysis.svg"
  },
  {
    "id": "mia",
    "name": "M.I.A.",
    "img": "modules/lancer-automations/icons/mia_lg.svg"
  }
];
const defaults = [
  {id: "mia"},
  {id: "downandout"},
  {id: "cascading"},
  //{id: "core_power_active"}, when I find a setting to make this awesome
  {id: "reactor_meltdown"},
  {id: "overshield"},
  {id: "burn"},
  {id: "blind"},
  {id: "grappled"},
  {id: "shutdown"},
  {id: "prone"},
  {id: "intangible"},
  {id: "invisible"},
  {id: "exposed"},
  {id: "dangerzone"},
  {id: "stunned"},
  {id: "slow"},
  {id: "shredded"},
  {id: "lockon"},
  {id: "jammed"},
  {id: "impaired"},
  {
    id: "immobilized",
    filters: {},
    animation: "FX: Ice"
  }
]

// @ts-ignore
Hooks.once("stylish-action-hud.apiReady", (api: StylishActionHudAPI) => {
  /**
   * We can break our status handling into 3 broad categories.
   *
   * 1. Bad for you (impaired, etc)
   * 2. Good for you (Core power active)
   * 3. Nothing (Tier 3/Snipers Mark/etc)
   *
   *
   * Category 1 needs negative looking mapping by default.
   * Category 2 should maybe look cooler or a positive.
   * Category 3 is not needed for card representation, but could be in the action menu to find easier.
   */
  const statuses = () => CONFIG.statusEffects
    .flatMap((status) => {
      if (!status.id) return [];
      const importantStatus = defaults.find(s => s.id === status.id)
      if (!importantStatus) return [];
      // First grab out defaults from the status config,
      // Then mix in some sensible layout default for the status ovelay.
      // Last, the configs from above is mixed it letting more specific configs set over the geneneal.
      let label = game.i18n.localize(status.name);
      return [({
        label: label,
        filters: {
          grayscale: 50,
          brightness: 90,
          contrast: 90,
          blur: 0,
          saturate: 50,
          sepia: 20,
        },
        overlayPath: status.img,
        overlayScale: 0.5,
        overlayX: 30,
        overlayY: -10, // 우측
        overlayOpacity: 0.8,
        overlayBlend: "normal",
        animation: "pulse",
        tintColor: "#555555",
        tintAlpha: 0.3,
        tintAnimation: "",
        ...importantStatus
      })];
    });

  // The system id for foundryvtt-lancer, must match the game id.
  // This registration is called when you hit the rest in the UI.
  api.registerDefaultStatusEffects("lancer", ctx => {
    return statuses()
  });
})
