import { ActivationType } from "./ActivationType.js";
import { imgs } from "./Images.js";

export const SimpleActionMacros = {
  Reactor_Explosion: {
    id: "macro-42AtSqvHlbdrBumG",
    name: "Reactor_Explosion",
    img: imgs.la["mushroom-cloud"],
    cost: ActivationType.None,
    description: "",
  },
  Interact: {
    id: "macro-5eUNhWdKGguZo6KX",
    name: "Interact",
    img: imgs.la.click,
    cost: ActivationType.None,
    description: "",
  },
  Throw_Weapon: {
    id: "macro-6WdpcfoLGYv6TBgz",
    name: "Throw_Weapon",
    img: imgs.la["throw"],
    cost: ActivationType.None,
    description: "",
  },
  Lock_On: {
    id: "macro-oryUerpTOBkzCnFv",
    name: "Lock On",
    cost: ActivationType.Quick,
    description:
      "Choose a character within SENSORS and line of sight. They gain the LOCK ON condition. Any character making an attack against a character with LOCK ON may choose to gain +1 Accuracy on that attack and then clear the LOCK ON condition after that attack resolves.",
    img: "systems/lancer/assets/icons/white/condition_lockon.svg",
  },
  Invade: {
    id: "macro-EDZT73HLBPiuuPSj",
    name: "Invade",
    img: "systems/lancer/assets/icons/white/tech_quick.svg",
    cost: ActivationType.None,
    description: "",
  },
  Knockback: {
    id: "macro-FIvBse85JC29PuD2",
    name: "Knockback",
    img: imgs.la["push"],
    cost: ActivationType.None,
    description: "",
  },
  "End_Active Item": {
    id: "macro-GXFvnEStTZPUeIw7",
    name: "End_Active_Item",
    img: imgs.la["pause-button"],
    cost: ActivationType.None,
    description: "",
  },
  Shut_Down: {
    id: "macro-I712dklTcadB3WJS",
    name: "Shut_Down",
    img: "systems/lancer/assets/icons/white/status_shutdown.svg",
    cost: ActivationType.None,
    description: "",
  },
  Deploy_Item: {
    id: "macro-IkOLk9FObJMDgjVz",
    name: "Deploy_Item",
    img: "systems/lancer/assets/icons/white/deployable.svg",
    cost: ActivationType.None,
    description: `Deploy a drone?`,
  },
  Ram: {
    id: "macro-Jzjjxi8hOZMTQk7e",
    name: "Ram",
    img: imgs.la["ram"],
    cost: ActivationType.None,
    description: "",
  },
  Choice_Menu: {
    id: "macro-VO5nTNciwFctDznc",
    name: "Choice_Menu",
    img: imgs.la["vote"],
    cost: ActivationType.None,
    description: "",
  },
  Eject: {
    id: "macro-LIuBoGRinNIYwM7v",
    name: "Eject",
    cost: ActivationType.Quick,
    description:
      "EJECT as a quick action, flying 6 spaces in the direction of your choice; however, this is a single-use system for emergency use only – it leaves your mech IMPAIRED. Your mech remains IMPAIRED and you cannot EJECT again until your next FULL REPAIR.",
    img: imgs.la["parachute"],
  },
  Skirmish: {
    id: "macro-LJGEwce2QZfqBAiE",
    name: "Skirmish",
    img: imgs.la["skirmish"],
    cost: ActivationType.Quick,
    description:
      "When you SKIRMISH, you attack with a single weapon.<br/>" +
      "To SKIRMISH, choose a weapon and a valid target within RANGE (or THREAT) then make an attack.<br/>" +
      "• In addition to your primary attack, you may also attack with a different AUXILIARY weapon on the same mount. That weapon doesn’t deal bonus damage.<br/>" +
      "• SUPERHEAVY weapons are too cumbersome to use in a SKIRMISH, and can only be fired as part of a BARRAGE.",
  },
  Overwatch: {
    id: "macro-NWHdUGG4AV1JgetJ",
    name: "Overwatch",
    img: "systems/lancer/assets/icons/white/reaction.svg",
    cost: ActivationType.Reaction,
    description: "Skirmish as a reaction to something, usually starting movement in your threat.",
  },
  Disengage: {
    id: "macro-PnvAp6uz9wGWh0vp",
    name: "Disengage",
    cost: ActivationType.Full,
    description: "Move from engagement and avoid all reactions",
    img: imgs.la["disengage"],
  },
  "Reload_One Weapon": {
    id: "macro-Rw7qhTO7Uet06lsr",
    name: "Reload_One_Weapon",
    img: imgs.la["reload"],
    cost: ActivationType.None,
    description: "",
  },
  Search: {
    id: "macro-TAV2Q3LXY9kgpGSC",
    name: "Search",
    cost: ActivationType.Quick,
    description:
      "To SEARCH in a mech, choose a character within your SENSORS that you suspect is HIDDEN and make a contested SYSTEMS check against their AGILITY. To SEARCH as a pilot on foot, make a contested skill check, adding bonuses from triggers as normal. This can be used to reveal characters within RANGE 5. Once a HIDDEN character has been found using SEARCH, they immediately lose HIDDEN and can be located again by any character.",
    img: imgs.la["search"],
  },
  Handle: {
    id: "macro-U3rlQUisrQ1hTwBo",
    name: "Handle",
    img: imgs.la["hand-truck"],
    cost: ActivationType.None,
    description: "",
  },
  Aid: {
    id: "macro-URhRNebzYJuWJKp8",
    name: "Aid",
    img: imgs.la["medical-pack"],
    cost: ActivationType.None,
    description: "",
  },
  Bolster: {
    id: "macro-V6YtQmnKs1iJWcln",
    name: "Bolster",
    cost: ActivationType.Quick,
    description:
      "Choose a character within SENSORS. They receive +2 Accuracy on the next skill check or save they make between now and the end of their next turn. Characters can only benefit from one BOLSTER at a time.",
    img: "icons/svg/upgrade.svg",
  },
  Downtime: {
    id: "macro-Z4nCOCNzg5e01CmZ",
    name: "Downtime",
    img: "systems/lancer/assets/icons/white/downtime.svg",
    cost: ActivationType.None,
    description: "",
  },
  Barrage: {
    id: "macro-ZuOrSrPrg767I1eR",
    name: "Barrage",
    img: imgs.la["barrage"],
    cost: ActivationType.Full,
    description:
      "When you BARRAGE, you attack with two weapons, or with one SUPERHEAVY weapon.<br/>" +
      "To BARRAGE, choose your weapons and either one target or different targets – within range – then make an attack with each weapon.<br/>" +
      "• In addition to your primary attacks, you may also attack with an AUXILIARY weapon on each mount that was fired, so long as the AUXILIARY weapon hasn’t yet been fired this action. These AUXILIARY weapons don’t deal bonus damage.\n" +
      "• SUPERHEAVY weapons can only be fired as part of a BARRAGE.",
  },
  Dismount: {
    id: "macro-a7SgQOzT3hc9WESl",
    name: "Dismount",
    cost: ActivationType.Full,
    description:
      "When you DISMOUNT, you climb off of a mech. You can DISMOUNT as a full action. When you DISMOUNT, you are placed in an adjacent space – if there are no free spaces, you cannot DISMOUNT. Additionally, you can also DISMOUNT willing allied mechs or vehicles you have MOUNTED.",
    img: imgs.la["dismount"],
  },
  Squeeze: {
    id: "macro-cFwOkjJW45AeEWxv",
    name: "Squeeze",
    img: imgs.la["contract"],
    cost: ActivationType.None,
    description: "",
  },
  Reinforcement: {
    id: "macro-dbOhbkignU6Ldmqo",
    name: "Reinforcement",
    img: imgs.la["rally-the-troops"],
    cost: ActivationType.None,
    description: "",
  },
  Pickup_Weapon: {
    id: "macro-fEyqaIxJ2zrQBvED",
    name: "Pickup_Weapon",
    img: imgs.la["pickup"],
    cost: ActivationType.None,
    description: "",
  },
  Brace: {
    id: "macro-fphucClJxHblW9ww",
    name: "Brace",
    cost: '<i class="cci cci-reaction" style="font-size:1.15em;margin-right:5px;vertical-align:middle;flex-shrink:0;"></i>',
    description:
      "You count as having RESISTANCE to all damage, burn, and heat from the triggering attack, and until the end of your next turn, all other attacks against you are made at +1 difficulty. Due to the stress of bracing, you cannot take reactions until the end of your next turn and on that turn, you can only take one quick action – you cannot OVERCHARGE, move normally, take full actions, or take free actions.",
    img: imgs.la["brace"],
  },
  Scan: {
    id: "macro-g7ydDbpR5frMbd4x",
    name: "Scan",
    img: imgs.la["radar-sweep"],
    cost: ActivationType.Quick,
    description: "",
  },
  Reactor_Meltdown: {
    id: "macro-gbwpEEiRMKAO99DT",
    name: "Reactor_Meltdown",
    img: imgs.la["time-bomb"],
    cost: ActivationType.None,
    description: "",
  }, //Macro.TAV2Q3LXY9kgpGSC
  Boot_Up: {
    id: "macro-jSHdRqemfzFQE5HG",
    name: "Boot Up",
    cost: ActivationType.Full,
    description:
      "You can BOOT UP a mech that you are piloting as a full action, clearing SHUT DOWN and restoring your mech to a powered state.",
    img: imgs.la["boot"],
  },
  Fragment_Signal: {
    id: "macro-pzXWRjBIZ0zUETKr",
    name: "Fragment_Signal",
    img: "systems/lancer/assets/icons/white/tech_quick.svg",
    cost: ActivationType.Quick,
    description: "",
  },
  Hide: {
    id: "macro-qZ1ChJevGewqjM2l",
    name: "Hide",
    cost: ActivationType.Quick,
    description:
      "Obscure the position of your mech, becoming HIDDEN and unable to be identified, precisely located, or be targeted directly by attacks or hostile actions",
    img: "systems/lancer/assets/icons/white/status_hidden.svg",
  },
  Grapple_Choice: {
    id: "macro-vHeXwtAP3DwOA144",
    name: "Grapple_Choice",
    img: imgs.la["grappling"],
    cost: ActivationType.None,
    description: "",
  },
};
