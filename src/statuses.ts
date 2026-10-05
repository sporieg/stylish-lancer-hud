const defaults = [
  { id: "mia" },
  { id: "downandout" },
  { id: "cascading" },
  //{id: "core_power_active"}, when I find a setting to make this awesome
  { id: "reactor_meltdown" },
  { id: "overshield" },
  { id: "burn" },
  { id: "blind" },
  { id: "grappled" },
  { id: "shutdown" },
  { id: "prone" },
  { id: "intangible" },
  { id: "invisible" },
  { id: "exposed" },
  { id: "dangerzone" },
  { id: "stunned" },
  { id: "slow" },
  { id: "shredded" },
  { id: "lockon" },
  { id: "jammed" },
  { id: "impaired" },
  {
    id: "immobilized",
    filters: {},
    animation: "FX: Ice",
  },
];

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
  const statuses = () =>
    CONFIG.statusEffects.flatMap((status) => {
      if (!status.id) return [];
      const importantStatus = defaults.find((s) => s.id === status.id);
      if (!importantStatus) return [];
      // First grab out defaults from the status config,
      // Then mix in some sensible layout default for the status ovelay.
      // Last, the configs from above is mixed it letting more specific configs set over the geneneal.
      let label = game.i18n.localize(status.name);
      return [
        {
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
          ...importantStatus,
        },
      ];
    });

  // The system id for foundryvtt-lancer, must match the game id.
  // This registration is called when you hit the rest in the UI.
  api.registerDefaultStatusEffects("lancer", (_ctx) => {
    return statuses();
  });
});
