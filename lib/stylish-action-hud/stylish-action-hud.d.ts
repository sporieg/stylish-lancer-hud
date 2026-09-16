type MaybePromise<T> = T | Promise<T>;
type HorizontalAnchor = "left" | "center" | "right";
type VerticalAnchor = "top" | "bottom";
type PositionMode = "anchor" | "screen";

interface AttributeConfig extends Record<string, unknown> {
  path: string;
  label: string;
  color?: string;
  style?: "bar" | "dots" | "number" | "badge" | string;
  maxPath?: string | number;
  icon?: string;
  iconImg?: string;
  gmOnly?: boolean;
  ownerOnly?: boolean;
  combatOnly?: boolean;
  hideInCombat?: boolean;
  compactVisible?: boolean;
  compactIconOnly?: boolean;
  hitFeedback?: boolean;
}

interface HudStat extends AttributeConfig {
  value: number | string;
  max: number;
  percent: number;
  temp?: number;
  tempPercent?: number;
  subtype: string;
}

interface TrackableAttribute {
  path: string;
  label: string;
}

interface ConditionData {
  id: string;
  src: string;
  name: string;
  value: unknown | null;
}

interface QuickSlotData {
  img: string;
  name: string;
}

interface StatusEffectConfig extends Record<string, unknown> {
  id: string;
  label: string;
  filters?: {
    grayscale?: number;
    brightness?: number;
    contrast?: number;
    blur?: number;
    saturate?: number;
    sepia?: number;
  };
  overlayPath?: string;
  overlayScale?: number;
  overlayX?: number;
  overlayY?: number;
  overlayOpacity?: number;
  overlayBlend?: string;
  animation?: string;
  tintColor?: string;
  tintAlpha?: number;
  tintAnimation?: string;
}

interface CategoryVisibility {
  mode?: "all" | "only" | "except";
  actorTypes?: string[];
  actorIds?: string[];
}

interface ActionMenuCategory extends Record<string, unknown> {
  id: string;
  label: string;
  type: "submenu" | "sheet" | "system";
  icon?: string;
  img?: string;
  cssClass?: string;
  systemId?: string | null;
  sheetTab?: string;
  buttonImg?: string;
  buttonScale?: number;
  buttonX?: number;
  buttonY?: number;
  buttonFrameLayers?: Record<string, unknown>[];
  buttonFrameColor?: string;
}

interface CustomMenuTab extends Record<string, unknown> {
  label?: string;
  subLabel?: string;
  items?: Record<string, unknown>[];
}

interface LayoutConfig extends Record<string, unknown> {
  id?: string;
  label: string;
  type?: ActionMenuCategory["type"];
  icon?: string;
  img?: string;
  systemId?: string | null;
  tabs?: CustomMenuTab[];
  visibility?: CategoryVisibility;
}

interface SubMenuActionItem extends Record<string, unknown> {
  id: string;
  name: string;
  img?: string;
  cost?: string;
  description?: string;
  isHeader?: boolean;
  isFavorite?: boolean;
  favoritable?: boolean;
  isPersonal?: boolean;
  isExhausted?: boolean;
  isVirtual?: boolean;
  isSingleUse?: boolean;
  isSignature?: boolean;
  hasInlineControls?: boolean;
  uses?: { value: number; max: number };
  customCatIndex?: number;
  customTabIndex?: number;
  customItemIndex?: number;
}

interface SubMenuHeaderItem extends Record<string, unknown> {
  isHeader: true;
  name: string;
  id?: never;
}

type SubMenuItem = SubMenuActionItem | SubMenuHeaderItem;

type FlatSubMenuItems = SubMenuItem[];
type TabbedSubMenuItems = Record<string, SubMenuItem[]>;
type SidebarSubMenuItems = Record<string, Record<string, SubMenuItem[]>>;

interface SubMenuData extends Record<string, unknown> {
  title: string;
  theme?: string;
  hasTabs?: boolean;
  hasSubTabs?: boolean;
  items: FlatSubMenuItems | TabbedSubMenuItems | SidebarSubMenuItems;
  tabLabels?: Record<string, string>;
  tabTooltips?: Record<string, string>;
  subTabLabels?: Record<string, Record<string, string>>;
}

interface SystemAdapterInstance<T> {
  systemId: string;
  getStats(actor: T, configAttributes: AttributeConfig[]): HudStat[];
  updateAttribute(actor: T, path: string, input: string): Promise<void>;
  getConditions(actor: T): ConditionData[];
  removeCondition(actor: T, conditionId: string): Promise<void>;
  resolveQuickSlotData(actor: T, itemId: string): QuickSlotData | null;
  rollStat(actor: T, path: string, event: Event): MaybePromise<unknown> | null;
  isStatRollable(path: string): boolean;
  getActionCategories(actor: T): ActionMenuCategory[];
  getSubMenuData(
    actor: T,
    categoryId: string
  ): MaybePromise<SubMenuData | null>;
  executeAction(actor: T, actionId: string): Promise<unknown>;
  useItem(
    actor: T,
    itemId: string,
    event?: Event | null
  ): Promise<unknown>;
  getTrackableAttributes(actor: T): TrackableAttribute[];
  getDefaultAttributes(): AttributeConfig[];
  getDefaultStatusEffects(): StatusEffectConfig[];
  getDefaultLayout?(): LayoutConfig[];
}

type SystemAdapterClass<T> = new () => SystemAdapterInstance<T>;

declare abstract class BaseSystemAdapter implements SystemAdapterInstance {
  systemId: string;
  getStats(actor: unknown, configAttributes: AttributeConfig[]): HudStat[];
  updateAttribute(actor: unknown, path: string, input: string): Promise<void>;
  getConditions(actor: unknown): ConditionData[];
  removeCondition(actor: unknown, conditionId: string): Promise<void>;
  resolveQuickSlotData(actor: unknown, itemId: string): QuickSlotData | null;
  rollStat(actor: unknown, path: string, event: Event): MaybePromise<unknown> | null;
  isStatRollable(path: string): boolean;
  getActionCategories(actor: unknown): ActionMenuCategory[];
  getSubMenuData(actor: unknown, categoryId: string): MaybePromise<SubMenuData | null>;
  executeAction(actor: unknown, actionId: string): Promise<unknown>;
  useItem(actor: unknown, itemId: string, event?: Event | null): Promise<unknown>;
  getTrackableAttributes(actor: unknown): TrackableAttribute[];
  getDefaultAttributes(): AttributeConfig[];
  getDefaultStatusEffects(): StatusEffectConfig[];
  getDefaultLayout?(): LayoutConfig[];
}
type SystemAdapterFactory = () => SystemAdapterInstance;
type SystemAdapterRegistration =
  | SystemAdapterClass
  | SystemAdapterFactory
  | SystemAdapterInstance;

interface AdapterCompatibilityContext extends Record<string, unknown> {
  system?: unknown;
  modules?: unknown;
}

interface AdapterRegistrationOptions {
  priority?: number;
  source?: string;
  id?: string;
  isCompatible?: (context: AdapterCompatibilityContext) => boolean;
}

interface AdapterEntry {
  systemId: string;
  adapter: SystemAdapterRegistration;
  priority: number;
  order: number;
  isCompatible:
    | ((context: AdapterCompatibilityContext) => boolean)
    | null;
  source: string;
}

interface CreateSystemAdapterOptions {
  fallbackSystemId?: string;
  context?: AdapterCompatibilityContext;
}

interface DefaultResolutionContext extends Record<string, unknown> {
  systemId: string;
  adapter?: SystemAdapterInstance | null;
  system?: unknown;
  modules?: unknown;
  actor?: Actor;
}

interface DefaultResolveOptions extends Record<string, unknown> {
  actor?: Actor;
}

type DefaultProvider<T> =
  | T[]
  | ((context: DefaultResolutionContext) => T[]);

interface DefaultRegistrationOptions {
  priority?: number;
  mode?: "replace" | "append" | "prepend";
  source?: string;
  id?: string;
  isCompatible?: (context: DefaultResolutionContext) => boolean;
}

interface DefaultEntry<T> {
  systemId: string;
  data: DefaultProvider<T>;
  priority: number;
  order: number;
  isCompatible:
    | ((context: DefaultResolutionContext) => boolean)
    | null;
  mode: "replace" | "append" | "prepend";
  source: string;
}

interface CategoryRegistrationOptions {
  priority?: number;
  source?: string;
  id?: string;
  override?: boolean;
  isCompatible?: (context: { actor: Actor }) => boolean;
}

interface CategoryEntry {
  category: ActionMenuCategory;
  priority: number;
  order: number;
  override: boolean;
  isCompatible: ((context: { actor: Actor }) => boolean) | null;
  source: string;
}

type SubMenuProvider = (
  actor: Actor,
  categoryId: string
) => MaybePromise<SubMenuData | null | undefined>;

interface SubMenuRegistrationOptions {
  priority?: number;
  source?: string;
  id?: string;
  isCompatible?: (
    context: { actor: Actor; categoryId: string }
  ) => boolean;
}

interface SubMenuEntry {
  categoryId: string;
  provider: SubMenuProvider;
  priority: number;
  order: number;
  isCompatible:
    | ((context: { actor: Actor; categoryId: string }) => boolean)
    | null;
  source: string;
}

interface ThemeDefinition {
  label: string;
  defaults?: Record<string, number | string | boolean>;
  sounds?: { click?: string; hover?: string };
  [key: string]: unknown;
}

interface EdgePosition {
  top?: number | null;
  right?: number | null;
  bottom?: number | null;
  left?: number | null;
  unit?: string;
}

interface AnchorPosition {
  anchorX: HorizontalAnchor;
  anchorY: VerticalAnchor;
  offsetX: number;
  offsetY: number;
}

interface ActorPosition extends Record<string, unknown> {
  relativeX?: number;
  relativeY?: number;
  anchorX?: HorizontalAnchor;
  anchorY?: VerticalAnchor;
  offsetX?: number;
  offsetY?: number;
  freeX?: number;
  freeY?: number;
  scale?: number;
}

interface ClientPositions extends Record<string, unknown> {
  global?: { pos?: EdgePosition; scale?: number; gap?: number };
  positionMode?: PositionMode;
  sound?: { enable?: boolean; volume?: number };
  actionMenuPos?: EdgePosition | AnchorPosition | null;
  actionMenuScale?: number;
  freeGroupAnchor?: AnchorPosition | null;
  // Other keys may be actor IDs whose values are ActorPosition.
}

interface Configuration extends Record<string, unknown> {
  actors?: string[];
  actorGroups?: Record<string, unknown>[];
  globalAttributes?: AttributeConfig[];
  actorAttributes?: Record<string, AttributeConfig[]>;
  actorSettings?: Record<string, Record<string, unknown>>;
  theme?: string;
  enableActionMenu?: boolean;
  customMenu?: LayoutConfig[];
  statusEffects?: StatusEffectConfig[];
  globalPos?: EdgePosition;
  globalScale?: number;
  globalGap?: number;
  layoutMode?: "stack" | "free" | string;
  layoutLocked?: boolean;
  positionMode?: PositionMode;
  actionMenuPos?: EdgePosition | AnchorPosition | null;
  actionMenuScale?: number;
  responsiveEnabled?: boolean;
  responsiveBaseWidth?: number;
  responsiveBaseHeight?: number;
  responsiveScaleMin?: number;
  responsiveScaleMax?: number;
  partyHudVisibility?: string;
  actionMenuVisibility?: string;
  partyHudDisplayMode?: string;
  ownerOnlyCards?: boolean;
  onlinePlayersOnly?: boolean;
  showSceneFriendlyNPCs?: boolean;
  collapseCards?: boolean;
  excludedActorTypes?: string;
}

interface OverlayLink {
  token: string;
  actorId: string;
  createdAt: number;
  expiresAt: number;
  url: string;
}

type OverlayValidationResult =
  | {
  valid: false;
  reason: "missing" | "not-found" | "actor-mismatch";
}
  | {
  valid: true;
  actorId: string;
  token: string;
  expiresAt?: number;
};

interface ExportPresetOptions {
  includeTheme?: boolean;
  includeGlobalAttributes?: boolean;
  includeCustomMenu?: boolean;
  includeActorPresets?: boolean;
}

interface ImportPresetOptions {
  merge?: boolean;
  skipSystemCheck?: boolean;
}

interface Preset {
  meta: {
    name: string;
    description: string;
    systemId: string;
    systemTitle: string;
    moduleVersion: string;
    exportDate: string;
    foundryVersion: string;
  };
  data: {
    theme?: string;
    globalAttributes?: AttributeConfig[];
    customMenu?: LayoutConfig[];
    actorPresets?: Record<string, object>;
  };
  macros: Record<string, MacroData>;
}

interface MacroData {
  uuid: string;
  name: string;
  img: string;
  type: string;
  isCompendium: boolean;
  command?: string;
}

interface ImportResult {
  success: boolean;
  error?: string;
  macrosCreated?: string[];
  macrosSkipped?: string[];
  warnings?: string[];
  actorPresetsImported?: number;
}

interface StylishActionHudAPI {
  BaseSystemAdapter: typeof BaseSystemAdapter;

  registerSystemAdapter(
    systemId: string,
    adapter: SystemAdapterRegistration,
    options?: AdapterRegistrationOptions
  ): AdapterEntry;

  createSystemAdapter(
    systemId: string,
    options?: CreateSystemAdapterOptions
  ): SystemAdapterInstance;

  getRegisteredAdapters(systemId: string): AdapterEntry[];
  listSystemAdapters(): Array<[string, AdapterEntry[]]>;

  registerDefaultAttributes(
    systemId: string,
    data: DefaultProvider<AttributeConfig>,
    options?: DefaultRegistrationOptions
  ): DefaultEntry<AttributeConfig>;

  registerDefaultLayout(
    systemId: string,
    data: DefaultProvider<LayoutConfig>,
    options?: DefaultRegistrationOptions
  ): DefaultEntry<LayoutConfig>;

  registerDefaultStatusEffects(
    systemId: string,
    data: DefaultProvider<StatusEffectConfig>,
    options?: DefaultRegistrationOptions
  ): DefaultEntry<StatusEffectConfig>;

  registerTrackableAttributes(
    systemId: string,
    data: DefaultProvider<TrackableAttribute>,
    options?: DefaultRegistrationOptions
  ): DefaultEntry<TrackableAttribute>;

  getDefaultAttributes(
    systemId: string,
    adapter: SystemAdapterInstance,
    options?: DefaultResolveOptions
  ): AttributeConfig[];

  getDefaultLayout(
    systemId: string,
    adapter: SystemAdapterInstance,
    options?: DefaultResolveOptions
  ): LayoutConfig[];

  getDefaultStatusEffects(
    systemId: string,
    adapter: SystemAdapterInstance,
    options?: DefaultResolveOptions
  ): StatusEffectConfig[];

  getTrackableAttributes(
    systemId: string,
    adapter: SystemAdapterInstance,
    options?: DefaultResolveOptions
  ): TrackableAttribute[];

  listDefaultAttributes(
    systemId?: string
  ): DefaultEntry<AttributeConfig>[] |
    Array<[string, DefaultEntry<AttributeConfig>[]]>;

  listDefaultLayouts(
    systemId?: string
  ): DefaultEntry<LayoutConfig>[] |
    Array<[string, DefaultEntry<LayoutConfig>[]]>;

  listDefaultStatusEffects(
    systemId?: string
  ): DefaultEntry<StatusEffectConfig>[] |
    Array<[string, DefaultEntry<StatusEffectConfig>[]]>;

  listTrackableAttributes(
    systemId?: string
  ): DefaultEntry<TrackableAttribute>[] |
    Array<[string, DefaultEntry<TrackableAttribute>[]]>;

  registerActionMenuCategory(
    category: ActionMenuCategory,
    options?: CategoryRegistrationOptions
  ): CategoryEntry;

  registerActionMenuSubMenu(
    categoryId: string,
    provider: SubMenuProvider,
    options?: SubMenuRegistrationOptions
  ): SubMenuEntry;

  getRegisteredActionMenuCategories(): CategoryEntry[];
  getRegisteredActionMenuSubMenus(): Array<[string, SubMenuEntry[]]>;

  registerTheme(
    key: string,
    themeData: ThemeDefinition
  ): ThemeDefinition | null;
  getThemes(): Record<string, ThemeDefinition>;

  onModifyActionMenuCategories(
    callback: (categories: ActionMenuCategory[], actor: Actor) => void
  ): number;

  onModifyActionMenuData(
    callback: (
      data: SubMenuData,
      actor: Actor,
      categoryId: string
    ) => void
  ): number;

  updateConfiguration(
    updates: Partial<Configuration>,
    options?: { replace?: boolean }
  ): Promise<Configuration>;

  updateClientPositions(
    updates: Partial<ClientPositions>,
    options?: { replace?: boolean }
  ): Promise<ClientPositions>;

  exportPreset(options?: ExportPresetOptions): Promise<Preset>;
  importPreset(
    presetData: Preset,
    options?: ImportPresetOptions
  ): Promise<ImportResult>;
  downloadPreset(preset: Preset, filename?: string | null): void;
  importPresetFromFile(
    options?: ImportPresetOptions
  ): Promise<ImportResult>;

  createOverlayLink(
    actorId: string,
    options?: { ttlHours?: number }
  ): Promise<OverlayLink>;

  validateOverlayLink(
    actorId: string,
    token: string
  ): Promise<OverlayValidationResult>;
}