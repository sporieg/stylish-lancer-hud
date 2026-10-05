import { ENTRY_TYPE, SheetTypes } from "../ActivationType.js";

/**
 * Static path lookups for the different classes of Actor.
 * Its okay to have static values as long as they are not specific actor dependant,
 * which none are in lancer imo.
 */
let pilot: TrackableAttribute[] = [
  {
    path: "system.bond_state.xp.value",
    label: "Xp",
  },
  {
    path: "system.bond_state.stress.value",
    label: "Stress",
  },
  {
    path: "system.hp.value",
    label: "Hp",
  },
  {
    path: "system.callsign",
    label: "Call Sign",
  },
  {
    path: "system.background",
    label: "Background",
  },
  {
    path: "system.level",
    label: "Level",
  },
  {
    path: "name",
    label: "Name",
  },
  {
    path: "system.active_mech.value.name",
    label: "Role",
  },
];

const npc: TrackableAttribute[] = [
  {
    path: "system.hp.value",
    label: "Hp",
  },
  {
    path: "system.overshield.value",
    label: "Overshield",
  },
  {
    path: "system.heat.value",
    label: "Heat",
  },
  {
    path: "system.stress.value",
    label: "Stress",
  },
  {
    path: "system.structure.value",
    label: "Structure",
  },
];

const mech: TrackableAttribute[] = [
  {
    path: "system.repairs.value",
    label: "Repairs",
  },
  {
    path: "system.hp.value",
    label: "Hp",
  },
  {
    path: "system.overshield.value",
    label: "Overshield",
  },
  {
    path: "system.heat.value",
    label: "Heat",
  },
  {
    path: "system.stress.value",
    label: "Stress",
  },
  {
    path: "system.structure.value",
    label: "Structure",
  },
  {
    path: "system.armor",
    label: "Armor",
  },
  {
    path: "system.core_energy",
    label: "Core Power Available",
  },
  {
    path: "system.core_active",
    label: "Core Active",
  },
  {
    path: "system.edef",
    label: "E Defense",
  },
  {
    path: "system.burn",
    label: "Burn",
  },
  {
    path: "system.agi",
    label: "Agility",
  },
  {
    path: "system.eng",
    label: "Engineering",
  },
  {
    path: "system.evasion",
    label: "Evasion",
  },
  {
    path: "system.hull",
    label: "Hull",
  },
  {
    path: "system.save",
    label: "Save",
  },
  {
    path: "system.sensor_range",
    label: "Sensors",
  },
  {
    path: "system.sys",
    label: "Systems",
  },
];

const lookup: Record<SheetTypes, TrackableAttribute[]> = {
  [ENTRY_TYPE.MECH]: mech,
  [ENTRY_TYPE.PILOT]: pilot,
  [ENTRY_TYPE.NPC]: npc,
  [ENTRY_TYPE.DEPLOYABLE]: [
    {
      path: "system.hp.value",
      label: "Hp",
    },
  ],
};

export default lookup;
