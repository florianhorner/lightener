import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightCurve, Hass } from './utils/types.js';
import { EntityPickerLoader } from './utils/entity-picker-loader.js';
import { curvesToWsPayload, wsPayloadToCurves, cloneCurves, curvesEqual } from './utils/data.js';
import {
  addPointToCurves,
  canSelectCurve,
  interpolateControlPoints,
  mergeFinalAnimationFrame,
  pushToUndoStack,
  removePointFromCurves,
  shouldHandleKey,
  toggleCurveVisibility,
  toggleSelection,
} from './utils/card-logic.js';
import { easeOutCubic, sampleCurveAt, CURVE_COLORS } from './utils/graph-math.js';
import {
  CURVE_PRESETS,
  controlPointsAreLinearDefault,
  presetPolylinePoints,
  type PresetDef,
} from './utils/presets.js';
import {
  INITIAL_SAVE_STATE,
  type SaveState,
  errorMessage as saveErrorMessage,
  isSaved,
  isSaving,
  reduce as reduceSave,
} from './utils/save-lifecycle.js';
import './components/curve-graph.js';
import './components/curve-scrubber.js';
import './components/curve-legend.js';
import './components/curve-footer.js';

const CARD_VERSION = '2.15.0-dev.7';
const SAVE_SUCCESS_DISPLAY_MS = 2000;
const CANCEL_ANIM_DURATION_MS = 300;

if (typeof window !== 'undefined') {
  (
    window as typeof window & { __LIGHTENER_CURVE_CARD_VERSION__?: string }
  ).__LIGHTENER_CURVE_CARD_VERSION__ = CARD_VERSION;
}

const WARNING_ICON = html`<svg
  class="status-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path
    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  ></path>
  <line x1="12" y1="9" x2="12" y2="13"></line>
  <line x1="12" y1="17" x2="12.01" y2="17"></line>
</svg>`;

function createMockCurves(): LightCurve[] {
  return [
    {
      entityId: 'light.ceiling_light',
      friendlyName: 'Ceiling Light',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 20, target: 0 },
        { lightener: 60, target: 80 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: CURVE_COLORS[0],
    },
    {
      entityId: 'light.sofa_lamp',
      friendlyName: 'Sofa Lamp',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 10, target: 50 },
        { lightener: 40, target: 100 },
        { lightener: 70, target: 100 },
        { lightener: 100, target: 60 },
      ],
      visible: true,
      color: CURVE_COLORS[1],
    },
    {
      entityId: 'light.led_strip',
      friendlyName: 'LED Strip',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 1, target: 1 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: CURVE_COLORS[2],
    },
  ];
}

// --- Visual card editor for the HA dashboard UI ---

const LIGHT_DOMAINS = ['light'];

@customElement('lightener-curve-card-editor')
export class LightenerCurveCardEditor extends LitElement {
  @state() private _config: Record<string, unknown> = {};
  @state() private _hass: Hass | null = null;
  private _picker = new EntityPickerLoader(
    () => this.isConnected,
    () => this.requestUpdate()
  );

  static styles = css`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color, #616161);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    input {
      padding: 8px 12px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-size: 14px;
      font-family: inherit;
    }
    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .hint {
      font-size: 11px;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._picker.ensureLoaded();
  }

  setConfig(config: Record<string, unknown>): void {
    this._config = config;
    this._picker.ensureLoaded();
  }

  set hass(hass: Hass) {
    this._hass = hass;
    this._picker.ensureLoaded();
  }

  private _fireConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onEntityChange(e: CustomEvent): void {
    const value = e.detail?.value ?? '';
    this._config = { ...this._config, entity: value || undefined };
    this._fireConfigChanged();
  }

  private _onTitleChange(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    this._config = { ...this._config, title: value || undefined };
    this._fireConfigChanged();
  }

  private _onFallbackEntityInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value.trim();
    this._config = { ...this._config, entity: value || undefined };
    this._fireConfigChanged();
  }

  render() {
    const currentEntity = (this._config.entity as string) ?? '';
    const currentTitle = (this._config.title as string) ?? '';

    return html`
      <div class="form">
        <div class="field">
          <label>Entity</label>
          ${this._picker.ready
            ? html`
                <ha-entity-picker
                  .hass=${this._hass}
                  .value=${currentEntity}
                  .includeDomains=${LIGHT_DOMAINS}
                  allow-custom-entity
                  @value-changed=${this._onEntityChange}
                ></ha-entity-picker>
                <span class="hint">Select a Lightener group to edit its brightness curves.</span>
              `
            : html`
                <input
                  type="text"
                  .value=${currentEntity}
                  placeholder="light.your_lightener_group"
                  @change=${this._onFallbackEntityInput}
                />
                <span class="hint">
                  Entity picker unavailable — enter a Lightener group entity ID manually (must start
                  with <code>light.</code>).
                </span>
              `}
        </div>
        <div class="field">
          <label>Title (optional)</label>
          <input
            type="text"
            .value=${currentTitle}
            placeholder="Brightness Curves"
            @input=${this._onTitleChange}
          />
        </div>
      </div>
    `;
  }
}

@customElement('lightener-curve-card')
export class LightenerCurveCard extends LitElement {
  @state() private _curves: LightCurve[] = [];
  @state() private _originalCurves: LightCurve[] = [];
  @state() private _config: Record<string, unknown> = {};
  @state() private _selectedCurveId: string | null = null;
  @state() private _saveState: SaveState = INITIAL_SAVE_STATE;
  @state() private _loadError: string | null = null;
  @state() private _loading = false;
  @state() private _manageError: string | null = null;
  @state() private _managingLights = false;
  @state() private _groupDeleted = false;

  private get _saving(): boolean {
    return isSaving(this._saveState);
  }
  private get _saveSuccess(): boolean {
    return isSaved(this._saveState);
  }
  private get _saveError(): string | null {
    return saveErrorMessage(this._saveState);
  }

  private _dispatchSave(action: Parameters<typeof reduceSave>[1]): void {
    this._saveState = reduceSave(this._saveState, action);
  }
  @state() private _scrubberPosition: number | null = null;
  @state() private _cancelAnimating = false;

  @state() private _hass: Hass | null = null;
  private _undoStack: LightCurve[][] = [];
  private _dragUndoPushed = false;
  private _dragActive = false;
  private _loaded = false;
  private _loadedEntityId: string | undefined = undefined;
  private _loadErrorEntityId: string | undefined = undefined;
  private _pendingReloadEntityId: string | undefined = undefined;
  private _reloadAfterLoadEntityId: string | undefined = undefined;
  // entity_ids we have already auto-opened the preset chooser for. Once a
  // user has seen the auto-open for a given group, we never auto-open it
  // again on the same card instance — even after they switch away to
  // another group and come back. Per-card, not persisted.
  private _autoPresetsShownFor: Set<string> = new Set();
  private _boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private _boundBeforeUnload: ((e: BeforeUnloadEvent) => void) | null = null;
  private _saveSuccessTimer: ReturnType<typeof setTimeout> | null = null;
  private _cancelAnimFrame: number | null = null;
  @state() private _previewActive = false;
  @state() private _showPresets = false;
  @state() private _legendCloseAddSignal = 0;
  @state() private _legendCloseRemoveSignal = 0;
  @state() private _manageMode = false;
  @state() private _eligibleAddLightIds: string[] | null = null;
  private _previewRafPending = false;
  private _previewTrailingTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastPreviewTime = 0;
  private _previewRestoreBrightness: Map<string, number | null | undefined> = new Map();
  private _lastPreviewBrightness: Map<string, number | 'off'> = new Map();
  private _previewFrameGeneration = 0;
  private _lastEmittedDirtyState = false;
  private _dirtyVersion = 0;
  private _cleanVersion = 0;

  private get _embedded(): boolean {
    return this._config.embedded === true;
  }

  static styles = css`
    :host {
      --card-bg: var(--ha-card-background, var(--card-background-color, #fff));
      --text-color: var(--primary-text-color, #212121);
      --secondary-text: var(--secondary-text-color, #616161);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
      --accent: var(--primary-color, #2563eb);
      --graph-bg: var(--card-background-color, var(--ha-card-background, #fafafa));
      --panel-bg: color-mix(in srgb, var(--card-bg) 95%, var(--secondary-text, #616161) 5%);
      --text-xs: 9px;
      --text-sm: 12px;
      --text-md: 13px;
      --text-lg: 14px;

      display: block;
      font-family: var(
        --mdc-typography-body1-font-family,
        var(--paper-font-body1_-_font-family, 'Roboto', sans-serif)
      );
      height: fit-content;
    }
    .card {
      background: var(--card-bg);
      border-radius: var(--ha-card-border-radius, 16px);
      box-shadow: var(
        --ha-card-box-shadow,
        0 1px 3px rgba(0, 0, 0, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.06)
      );
      padding: 20px;
      color: var(--text-color);
    }
    .card.embedded {
      --curve-graph-max-height: 520px;
      --curve-graph-min-height: 360px;
      --curve-legend-max-height: 440px;
      --curve-scrubber-badges-max-height: 72px;

      box-shadow: none;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .workspace {
      display: grid;
      gap: 12px;
    }
    .main-stack,
    .side-rail,
    .footer-slot,
    .status-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }
    .graph-panel {
      border-radius: 12px;
      padding: 12px;
      background: var(--panel-bg);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }
    .card.embedded .header {
      margin-bottom: 12px;
      padding-inline: 2px;
    }
    .card.embedded .graph-panel {
      padding: 14px;
    }
    .card.embedded h2 {
      font-size: 0.95rem;
      letter-spacing: 0.01em;
      color: var(--secondary-text);
    }
    .error {
      font-size: var(--text-sm);
      color: var(--error-color, #db4437);
      padding: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .error .retry-link {
      cursor: pointer;
      text-decoration: underline;
      opacity: 0.8;
      background: none;
      border: none;
      font: inherit;
      color: inherit;
      padding: 0;
    }
    .error .retry-link:hover {
      opacity: 1;
    }
    .success {
      font-size: var(--text-sm);
      color: var(--accent);
      padding: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: success-fade 2s ease forwards;
    }
    @keyframes success-fade {
      0% {
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .status-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .loading-indicator {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 280px;
      gap: 16px;
      padding: 28px 20px;
      border-radius: 12px;
      background: var(--panel-bg);
    }
    .loading-graph {
      position: relative;
      min-height: 240px;
      border-radius: 10px;
      overflow: hidden;
      background:
        linear-gradient(
          90deg,
          transparent,
          var(--divider-color, rgba(127, 127, 127, 0.15)),
          transparent
        ),
        linear-gradient(rgba(128, 128, 128, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(128, 128, 128, 0.08) 1px, transparent 1px);
      background-size:
        200px 100%,
        100% 25%,
        25% 100%;
      background-position:
        -200px 0,
        0 0,
        0 0;
      animation: shimmer 1.8s ease-in-out infinite;
    }
    .loading-graph::before,
    .loading-graph::after {
      content: '';
      position: absolute;
    }
    .loading-graph::before {
      inset: 18px 18px 18px 28px;
      border-left: 1px solid rgba(128, 128, 128, 0.18);
      border-bottom: 1px solid rgba(128, 128, 128, 0.18);
      border-radius: 0 0 0 6px;
    }
    .loading-graph::after {
      inset: auto 40px 52px 44px;
      height: 90px;
      border-radius: 999px;
      background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--accent) 8%, transparent) 0%,
        color-mix(in srgb, var(--accent) 30%, transparent) 45%,
        color-mix(in srgb, var(--accent) 8%, transparent) 100%
      );
      clip-path: polygon(0% 78%, 18% 78%, 38% 45%, 62% 18%, 82% 22%, 100% 0, 100% 100%, 0 100%);
    }
    .loading-caption {
      font-size: var(--text-sm);
      color: var(--secondary-text);
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes shimmer {
      0% {
        background-position:
          -200px 0,
          0 0,
          0 0;
      }
      100% {
        background-position:
          calc(100% + 200px) 0,
          0 0,
          0 0;
      }
    }
    @media (min-width: 1100px) {
      .card.embedded {
        --curve-graph-max-height: 360px;
        --curve-graph-min-height: 240px;
      }
      .card.embedded .workspace {
        grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
        align-items: start;
        grid-template-areas:
          'main side'
          'main footer';
      }
      .card.embedded .main-stack {
        grid-area: main;
      }
      .card.embedded .side-rail {
        grid-area: side;
      }
      .card.embedded .footer-slot {
        grid-area: footer;
      }
    }
    @media (max-width: 1099px) {
      .card.embedded {
        --curve-graph-max-height: 420px;
        --curve-graph-min-height: 300px;
        --curve-legend-max-height: none;
      }
      .card.embedded .footer-slot {
        order: 2;
        position: sticky;
        bottom: max(0px, env(safe-area-inset-bottom));
        z-index: 3;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
        background: color-mix(in srgb, var(--card-bg) 72%, transparent);
        backdrop-filter: blur(14px);
      }
      .card.embedded .side-rail {
        order: 3;
      }
    }
    @media (max-width: 700px) {
      .card.embedded {
        --curve-graph-min-height: 240px;
      }
    }
    .presets-btn {
      margin-left: auto;
      padding: 4px 10px;
      min-height: 44px;
      font-size: 12px;
      font-weight: 500;
      background: transparent;
      border: 1px solid var(--divider);
      border-radius: 6px;
      color: var(--secondary-text);
      cursor: pointer;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
      flex-shrink: 0;
    }
    .presets-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .presets-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .presets-btn.active {
      border-color: var(--accent);
      color: var(--accent);
    }
    .presets-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-bottom: 8px;
      animation: fade-in 0.15s ease;
    }
    .presets-header {
      grid-column: 1 / -1;
      font-size: 11px;
      color: var(--secondary-text);
      opacity: 0.7;
      padding-bottom: 2px;
    }
    .preset-option {
      border: 1px solid var(--divider);
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      background: transparent;
      text-align: left;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        background 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preset-option:hover {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .preset-option:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .preset-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-color);
    }
    .preset-desc {
      font-size: 10px;
      color: var(--secondary-text);
      opacity: 0.75;
      line-height: 1.35;
    }
    .preset-preview {
      display: block;
      opacity: 0.65;
      margin-bottom: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .loading-graph {
        animation: none;
      }
    }
  `;

  // --- HA card interface ---

  static getConfigElement(): HTMLElement {
    return document.createElement('lightener-curve-card-editor');
  }

  static getStubConfig(): Record<string, unknown> {
    return { type: 'custom:lightener-curve-card' };
  }

  setConfig(config: Record<string, unknown>): void {
    const entityChanged = config.entity !== this._config.entity;
    this._config = config;
    if (entityChanged) {
      if (this._previewActive) this._stopPreview();
      this._dragActive = false;
      this._loaded = false;
      this._loadedEntityId = undefined;
      this._loadErrorEntityId = undefined;
      this._groupDeleted = false;
      this._showPresets = false;
      this._selectedCurveId = null;
      this._undoStack = [];
      this._pendingReloadEntityId = undefined;
      this._reloadAfterLoadEntityId = undefined;
      this._eligibleAddLightIds = null;
      // Abandon any unsaved edits so the dirty-reload guard in _tryLoadCurves()
      // does not block the incoming response for the new entity.
      this._cleanVersion = this._dirtyVersion;
      this._tryLoadCurves();
    }
  }

  set hass(hass: Hass) {
    const hadHass = !!this._hass;
    this._hass = hass;
    // Only load on first hass assignment or if not yet loaded
    if (!hadHass || !this._loaded) {
      if (!this._dragActive) {
        this._tryLoadCurves();
      }
    }
  }

  getCardSize(): number {
    return 4;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: 9,
      min_columns: 6,
      min_rows: 6,
    };
  }

  // --- Data loading ---

  private get _isAdmin(): boolean {
    return this._hass?.user?.is_admin ?? false;
  }

  private get _entityId(): string | undefined {
    return this._config.entity as string | undefined;
  }

  private get _isDirty(): boolean {
    return this._dirtyVersion !== this._cleanVersion;
  }

  private get _canManageLights(): boolean {
    return (
      this._isAdmin &&
      !!this._hass &&
      !!this._entityId &&
      !this._isDirty &&
      !this._saving &&
      !this._cancelAnimating &&
      !this._loading &&
      !this._managingLights &&
      !this._loadError &&
      !this._groupDeleted
    );
  }

  public get dirty(): boolean {
    return this._isDirty;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Reset load state on re-mount so data is refreshed.
    // Skip the reset if we already have a load error for the same entity — avoids
    // re-spamming the backend (and the HA log) every time the card re-mounts on a
    // misconfigured entity ID.
    if (this._loadErrorEntityId !== this._entityId) {
      this._loaded = false;
      this._loadedEntityId = undefined;
    }
    // If the card was previously deleted from inside this instance and the
    // dashboard has since been re-pointed at a different entity, clear the
    // sentinel so the new entity loads. If the entity is unchanged across
    // remount (navigate away and back, conditional re-render), keep the
    // deleted state — re-fetching curves for a removed config entry would
    // either 404 or render an empty grid that looks like a fresh group.
    if (this._groupDeleted && this._loadedEntityId !== this._entityId) {
      this._groupDeleted = false;
      this._loaded = false;
      this._loadedEntityId = undefined;
    }
    this._tryLoadCurves();

    this._boundKeyHandler = this._onKeyDown.bind(this);
    this._boundBeforeUnload = this._onBeforeUnload.bind(this);
    window.addEventListener('keydown', this._boundKeyHandler);
    window.addEventListener('beforeunload', this._boundBeforeUnload);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._previewActive) this._stopPreview();
    this._dragActive = false;
    if (this._boundKeyHandler) {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }
    if (this._boundBeforeUnload) {
      window.removeEventListener('beforeunload', this._boundBeforeUnload);
    }
    if (this._saveSuccessTimer) {
      clearTimeout(this._saveSuccessTimer);
      this._saveSuccessTimer = null;
    }
    if (this._cancelAnimFrame) {
      cancelAnimationFrame(this._cancelAnimFrame);
      this._cancelAnimFrame = null;
      this._cancelAnimating = false;
    }
  }

  protected updated(changedProps: Map<PropertyKey, unknown>): void {
    super.updated(changedProps);

    if (
      changedProps.has('_curves') ||
      changedProps.has('_originalCurves') ||
      changedProps.has('_cancelAnimating')
    ) {
      const dirty = this._isDirty;
      if (dirty !== this._lastEmittedDirtyState) {
        this._lastEmittedDirtyState = dirty;
        this.dispatchEvent(
          new CustomEvent('curve-dirty-state', {
            detail: { dirty },
            bubbles: true,
            composed: true,
          })
        );
        if (dirty) {
          this._dispatchSave({ type: 'dirty' });
        }
      }
    }
  }

  private _togglePresets(): void {
    if (this._managingLights) return;
    if (this._curves.length === 0) return;
    const opening = !this._showPresets;
    this._showPresets = opening;
    if (opening) {
      this._legendCloseAddSignal++;
      this._legendCloseRemoveSignal++;
    }
  }

  private _onLegendPanelOpen(): void {
    this._showPresets = false;
    void this._loadEligibleAddLights();
  }

  private async _loadEligibleAddLights(): Promise<void> {
    if (!this._hass || !this._isAdmin || this._eligibleAddLightIds !== null) return;
    try {
      const result = await this._hass.callWS<{ entities?: string[] }>({
        type: 'lightener/list_eligible_lights',
      });
      this._eligibleAddLightIds = Array.isArray(result?.entities) ? result.entities : [];
    } catch (err) {
      console.warn('[Lightener] Failed to load eligible add-light entities:', err);
      this._eligibleAddLightIds = null;
    }
  }

  private _applyPreset(preset: PresetDef): void {
    if (this._cancelAnimating || this._saving || this._managingLights) return;
    if (this._curves.length === 0) return;
    this._pushUndo();
    const pts = preset.controlPoints.map((cp) => ({ ...cp }));
    if (this._selectedCurveId !== null) {
      this._curves = this._curves.map((c) =>
        c.entityId === this._selectedCurveId ? { ...c, controlPoints: pts } : c
      );
    } else {
      this._curves = this._curves.map((c) => ({ ...c, controlPoints: pts }));
    }
    this._dirtyVersion++;
    this._showPresets = false;
    this._refreshActivePreview(true);
  }

  private _renderPresetsPanel() {
    const targetLabel =
      this._selectedCurveId !== null
        ? `Applying to ${this._curves.find((c) => c.entityId === this._selectedCurveId)?.friendlyName ?? 'selected light'}`
        : `Applying to all lights`;

    return html`
      <div class="presets-panel">
        <div class="presets-header">${targetLabel}</div>
        ${CURVE_PRESETS.map(
          (preset) => html`
            <button class="preset-option" @click=${() => this._applyPreset(preset)}>
              <svg
                class="preset-preview"
                viewBox="0 0 64 40"
                width="64"
                height="40"
                aria-hidden="true"
              >
                <polyline
                  points="${presetPolylinePoints(preset)}"
                  fill="none"
                  stroke="var(--accent, #2563eb)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="preset-name">${preset.name}</div>
              <div class="preset-desc">${preset.description}</div>
            </button>
          `
        )}
      </div>
    `;
  }

  private _onKeyDown(e: KeyboardEvent): void {
    // Only handle shortcuts when focus is inside this card (or nothing specific is focused)
    if (!shouldHandleKey(document.activeElement, this)) return;

    // Ctrl+S / Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      if (this._isDirty && this._isAdmin && !this._saving && !this._managingLights) {
        e.preventDefault();
        this._onSave();
      }
    }
    // Ctrl+Z / Cmd+Z to undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      if (
        !this._saving &&
        !this._cancelAnimating &&
        !this._managingLights &&
        this._undoStack.length > 0
      ) {
        e.preventDefault();
        this._undo();
      }
    }
    // Escape to close presets panel or cancel edits
    if (e.key === 'Escape') {
      if (this._showPresets) {
        e.preventDefault();
        this._showPresets = false;
      } else if (
        this._isDirty &&
        !this._saving &&
        !this._cancelAnimating &&
        !this._managingLights
      ) {
        e.preventDefault();
        this._onCancel();
      }
    }
  }

  private _onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this._isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  private async _tryLoadCurves(): Promise<void> {
    // Re-load if the entity changed since last load
    if (this._loaded && this._loadedEntityId === this._entityId) return;
    if (this._loading) return;

    if (!this._hass || !this._entityId) {
      // No hass or entity yet — use mock data for dev/preview
      if (this._curves.length === 0) {
        const mock = createMockCurves();
        this._curves = mock;
        this._originalCurves = cloneCurves(mock);
        this._cleanVersion = this._dirtyVersion;
      }
      return;
    }

    this._loadError = null;
    this._loading = true;
    // Capture the entity we're loading so we can discard stale responses
    const requestedEntity = this._entityId;
    let shouldRunQueuedReload = false;

    try {
      const result = await this._hass.callWS<{
        entities: Record<string, { brightness: Record<string, string> }>;
      }>({
        type: 'lightener/get_curves',
        entity_id: requestedEntity,
      });

      // Discard if entity changed while the request was in flight
      if (this._entityId !== requestedEntity) return;
      if (this._reloadAfterLoadEntityId === requestedEntity) {
        shouldRunQueuedReload = true;
      } else {
        const curves = wsPayloadToCurves(result.entities, this._hass.states, CURVE_COLORS);
        if (this._isDirty) {
          // Do not overwrite unsaved local curve edits with an in-flight reload response.
          // Mark as loaded so set hass() stops re-triggering on every HA state update.
          // Clear error state and mark the entity as seen for auto-preset suppression
          // — the same housekeeping the success path does below.
          this._pendingReloadEntityId = requestedEntity;
          this._loaded = true;
          this._loadedEntityId = requestedEntity;
          this._loadErrorEntityId = undefined;
          this._autoPresetsShownFor.add(requestedEntity);
          return;
        }
        this._pendingReloadEntityId = undefined;
        this._curves = curves;
        this._originalCurves = cloneCurves(curves);
        this._cleanVersion = this._dirtyVersion;
        this._loaded = true;
        this._loadedEntityId = requestedEntity;
        this._loadErrorEntityId = undefined;

        // Onboarding handoff: a freshly-created group lands here with linear
        // default curves. Auto-open the preset chooser so the user picks a
        // starting curve visually instead of being told "nothing here yet."
        // One-shot per entity for the card's lifetime — switching away and
        // back must not re-open after the user dismissed it.
        if (
          !this._autoPresetsShownFor.has(requestedEntity) &&
          curves.length > 0 &&
          curves.every((c) => controlPointsAreLinearDefault(c.controlPoints))
        ) {
          this._showPresets = true;
        }
        this._autoPresetsShownFor.add(requestedEntity);
        if (this._saveState.phase === 'confirming') {
          this._dispatchSave({ type: 'save-confirmed' });
          if (this._saveSuccessTimer) clearTimeout(this._saveSuccessTimer);
          this._saveSuccessTimer = setTimeout(() => {
            this._dispatchSave({ type: 'save-clear' });
            this._saveSuccessTimer = null;
          }, SAVE_SUCCESS_DISPLAY_MS);
        }
      }
    } catch (err) {
      if (this._entityId !== requestedEntity) return;
      console.error('[Lightener] Failed to load curves:', err);
      this._loadError = String(err);
      this._loaded = true;
      this._loadedEntityId = requestedEntity;
      // Remember which entity caused the error so re-mounts don't re-request
      // and re-spam the HA log for a permanently misconfigured entity.
      this._loadErrorEntityId = requestedEntity;
      if (this._saveState.phase === 'confirming') {
        this._dispatchSave({ type: 'save-error', message: 'Save failed. Check connection.' });
      }
    } finally {
      this._loading = false;
      // If entity changed during flight, trigger reload for the new entity
      if (this._entityId !== requestedEntity) {
        void this._tryLoadCurves();
      }
    }
    if (
      shouldRunQueuedReload ||
      (this._reloadAfterLoadEntityId === requestedEntity && this._entityId === requestedEntity)
    ) {
      this._reloadAfterLoadEntityId = undefined;
      this._loaded = false;
      void this._tryLoadCurves();
    }
  }

  // --- Event handlers ---

  private _onScrubberMove(e: CustomEvent): void {
    this._scrubberPosition = e.detail.position;
    if (this._previewActive) {
      this._previewLights(e.detail.position);
    }
  }

  private _onScrubberStart(): void {
    // No-op: preview is now controlled by the explicit preview toggle button
  }

  private _onScrubberEnd(): void {
    // No-op: preview is now controlled by the explicit preview toggle button
  }

  private _onPreviewToggle = (): void => {
    if (this._previewActive) {
      this._stopPreview();
    } else {
      this._startPreview();
    }
  };

  private _startPreview = (): void => {
    if (!this._hass || this._previewActive) return;
    this._previewActive = true;
    // Ensure the graph shows a scrubber indicator even if the user never touched the slider
    if (this._scrubberPosition === null) {
      this._scrubberPosition = 50;
    }
    // Snapshot current brightness for each controlled light so we can restore later.
    // null = was off; undefined = was on but no brightness attribute (on/off-only light).
    this._previewRestoreBrightness.clear();
    this._lastPreviewBrightness.clear();
    for (const curve of this._curves) {
      const state = this._hass.states[curve.entityId];
      if (state) {
        this._previewRestoreBrightness.set(
          curve.entityId,
          state.state === 'off' ? null : (state.attributes.brightness ?? undefined)
        );
      }
    }
    this._refreshActivePreview(true);
  };

  private _stopPreview = (): void => {
    if (!this._previewActive || !this._hass) return;
    this._previewActive = false;
    this._previewRafPending = false;
    this._previewFrameGeneration++;
    if (this._previewTrailingTimer) {
      clearTimeout(this._previewTrailingTimer);
      this._previewTrailingTimer = null;
    }
    // Restore original brightness for each light.
    // null = turn off; undefined = on/off-only light that was on (no brightness attr); otherwise restore exact brightness.
    for (const [entityId, brightness] of this._previewRestoreBrightness) {
      if (brightness === null) {
        this._hass.callService('light', 'turn_off', { entity_id: entityId }).catch(() => {});
      } else if (brightness === undefined) {
        this._hass.callService('light', 'turn_on', { entity_id: entityId }).catch(() => {});
      } else {
        this._hass
          .callService('light', 'turn_on', { entity_id: entityId, brightness })
          .catch(() => {});
      }
    }
    this._previewRestoreBrightness.clear();
    this._lastPreviewBrightness.clear();
  };

  /**
   * Push interpolated brightness to physical lights.
   * Throttled to at most once per 300 ms to avoid congesting Zigbee/Matter/MQTT buses.
   * At 60 fps the unthrottled RAF approach issued ~300 commands/sec for 5 lights; this
   * caps it at ~15 commands/sec which keeps the command backlog from piling up.
   */
  private readonly _PREVIEW_INTERVAL_MS = 300;

  private _pendingPreviewPosition: number | null = null;

  private _refreshActivePreview(force = false): void {
    if (!this._previewActive) return;
    if (this._scrubberPosition === null) {
      this._scrubberPosition = 50;
    }
    this._previewLights(this._scrubberPosition, force);
  }

  private _previewLights(position: number, force = false): void {
    if (!this._previewActive || !this._hass) return;
    this._pendingPreviewPosition = position;
    if (force) {
      this._lastPreviewTime = 0;
      this._previewRafPending = false;
      this._previewFrameGeneration++;
      this._lastPreviewBrightness.clear();
      if (this._previewTrailingTimer) {
        clearTimeout(this._previewTrailingTimer);
        this._previewTrailingTimer = null;
      }
    }
    const now = Date.now();
    const elapsed = now - this._lastPreviewTime;
    if (elapsed < this._PREVIEW_INTERVAL_MS) {
      // Schedule a trailing-edge call so the final position is never dropped.
      // Read from _pendingPreviewPosition at fire time so rapid moves don't get stale.
      if (!this._previewTrailingTimer) {
        this._previewTrailingTimer = setTimeout(() => {
          this._previewTrailingTimer = null;
          if (this._pendingPreviewPosition !== null) {
            this._previewLights(this._pendingPreviewPosition);
          }
        }, this._PREVIEW_INTERVAL_MS - elapsed);
      }
      return;
    }
    if (this._previewRafPending) return;
    // Cancel any trailing timer since we're about to send
    if (this._previewTrailingTimer) {
      clearTimeout(this._previewTrailingTimer);
      this._previewTrailingTimer = null;
    }
    this._previewRafPending = true;
    const frameGeneration = this._previewFrameGeneration;

    requestAnimationFrame(() => {
      if (frameGeneration !== this._previewFrameGeneration) return;
      this._previewRafPending = false;
      if (!this._previewActive || !this._hass) return;
      this._lastPreviewTime = Date.now();
      const previewPosition = this._pendingPreviewPosition ?? position;

      for (const curve of this._curves) {
        if (!curve.visible) continue;
        const value = Math.round(sampleCurveAt(curve.controlPoints, previewPosition));
        // Convert 0-100% to HA brightness 0-255
        const brightness = Math.round((value / 100) * 255);
        if (brightness === 0) {
          if (this._lastPreviewBrightness.get(curve.entityId) === 'off') continue;
          this._lastPreviewBrightness.set(curve.entityId, 'off');
          this._hass
            .callService('light', 'turn_off', { entity_id: curve.entityId })
            .catch(() => {});
        } else {
          if (this._lastPreviewBrightness.get(curve.entityId) === brightness) continue;
          this._lastPreviewBrightness.set(curve.entityId, brightness);
          this._hass
            .callService('light', 'turn_on', { entity_id: curve.entityId, brightness })
            .catch(() => {});
        }
      }
    });
  }

  private _onSelectCurve(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    const { entityId } = e.detail;
    // Always allow deselect of the currently-selected curve, even if it has
    // since gone missing (race during reload). Otherwise require the curve
    // to exist and be visible.
    if (entityId !== this._selectedCurveId && !canSelectCurve(this._curves, entityId)) return;
    this._selectedCurveId = toggleSelection(this._selectedCurveId, entityId);
    this._refreshActivePreview(true);
  }

  private _onFocusCurve(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    const { entityId } = e.detail;
    const curve = this._curves.find((item) => item.entityId === entityId);
    if (!curve || !curve.visible) return;
    this._selectedCurveId = entityId;
    this._refreshActivePreview(true);
  }

  private _pushUndo(): void {
    pushToUndoStack(this._undoStack, this._curves);
  }

  private _undo(): void {
    if (this._undoStack.length === 0 || this._cancelAnimFrame !== null) return;
    this._animateCurvesTo(this._undoStack.pop()!);
  }

  /**
   * Animate curves from current state to endCurves over CANCEL_ANIM_DURATION_MS.
   * Shared by undo and cancel. onComplete runs after the final frame.
   */
  private _animateCurvesTo(endCurves: LightCurve[], onComplete?: () => void): void {
    const startCurves = cloneCurves(this._curves);
    this._cancelAnimating = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / CANCEL_ANIM_DURATION_MS, 1);
      const t = easeOutCubic(rawT);

      const interpolated: LightCurve[] = endCurves.map((endCurve, ci) => {
        const startCurve = startCurves[ci];
        if (!startCurve) return endCurve;

        const startPts = startCurve.controlPoints;
        const endPts = endCurve.controlPoints;
        const points = interpolateControlPoints(startPts, endPts, t);

        // Extra end points snap in on final frame
        if (endPts.length > points.length && rawT >= 1) {
          for (let pi = points.length; pi < endPts.length; pi++) points.push({ ...endPts[pi] });
        }
        // Extra start points kept until final frame
        if (startPts.length > points.length && rawT < 1) {
          for (let pi = points.length; pi < startPts.length; pi++) points.push({ ...startPts[pi] });
        }

        points.sort((a, b) => a.lightener - b.lightener);
        // Preserve live visible state — don't restore from snapshot
        return { ...endCurve, controlPoints: points, visible: startCurve.visible };
      });

      this._curves = interpolated;

      if (rawT < 1) {
        this._cancelAnimFrame = requestAnimationFrame(tick);
      } else {
        // Preserve live visible state on final frame too
        this._curves = mergeFinalAnimationFrame(startCurves, endCurves);
        this._cancelAnimating = false;
        this._cancelAnimFrame = null;
        // If undo/cancel landed back at the clean state, sync versions so _isDirty is O(1).
        const landedClean = curvesEqual(this._curves, this._originalCurves);
        if (landedClean) {
          this._cleanVersion = this._dirtyVersion;
        }
        onComplete?.();
        if (landedClean) this._reloadPendingDirtyResponse();
      }
    };

    this._cancelAnimFrame = requestAnimationFrame(tick);
  }

  private _onPointMove(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    this._dragActive = true;
    this._showPresets = false;
    // Push undo once at start of each drag gesture
    if (!this._dragUndoPushed) {
      this._pushUndo();
      this._dragUndoPushed = true;
    }
    const { curveIndex, pointIndex, lightener, target } = e.detail;
    // Auto-select the curve being dragged so others dim
    const draggedCurve = this._curves[curveIndex];
    if (draggedCurve && this._selectedCurveId !== draggedCurve.entityId) {
      this._selectedCurveId = draggedCurve.entityId;
    }
    const curves = [...this._curves];
    const curve = { ...curves[curveIndex] };
    const points = [...curve.controlPoints];
    points[pointIndex] = { lightener, target };
    curve.controlPoints = points;
    curves[curveIndex] = curve;
    this._curves = curves;
    this._dirtyVersion++;
    this._refreshActivePreview();
  }

  private _onPointDrop(_e: CustomEvent): void {
    this._dragUndoPushed = false;
    this._dragActive = false;
    if (!this._loaded && this._hass) {
      this._tryLoadCurves();
    }
  }

  private _onPointAdd(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    const { lightener, target, entityId } = e.detail;
    const targetEntityId = entityId ?? this._selectedCurveId;
    if (!targetEntityId) return;

    const next = addPointToCurves(this._curves, targetEntityId, lightener, target);
    if (next === null) return;

    this._pushUndo();
    this._curves = next;
    this._dirtyVersion++;
    this._refreshActivePreview(true);
  }

  private _onPointRemove(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    // Reset drag-undo flag in case removal came from long-press (which skips point-drop)
    this._dragUndoPushed = false;
    this._dragActive = false;
    if (!this._loaded && this._hass) {
      this._tryLoadCurves();
    }
    const { curveIndex, pointIndex } = e.detail;

    const next = removePointFromCurves(this._curves, curveIndex, pointIndex);
    if (next === null) return;

    this._pushUndo();
    this._curves = next;
    this._dirtyVersion++;
    this._refreshActivePreview(true);
  }

  private _onToggleCurve(e: CustomEvent): void {
    if (this._cancelAnimating) return;
    const { entityId } = e.detail;
    // Intentionally no _dirtyVersion++ — visibility is local UI state, not persisted to backend.
    this._curves = toggleCurveVisibility(this._curves, entityId);
    // If hiding the selected curve, clear selection
    if (this._selectedCurveId === entityId) {
      const curve = this._curves.find((c) => c.entityId === entityId);
      if (curve && !curve.visible) {
        this._selectedCurveId = null;
      }
    }
  }

  private async _onAddLight(e: CustomEvent): Promise<void> {
    if (!this._hass || !this._entityId || this._managingLights) return;
    const { entityId, preset } = e.detail as { entityId: string; preset?: string };
    if (!entityId) return;
    if (this._previewActive) this._stopPreview();
    this._manageError = null;
    this._managingLights = true;
    try {
      const payload: Record<string, unknown> = {
        type: 'lightener/add_light',
        entity_id: this._entityId,
        controlled_entity_id: entityId,
      };
      if (preset) payload.preset = preset;
      await this._hass.callWS(payload);
      this._undoStack = [];
      this._eligibleAddLightIds = null;
      this._loaded = false;
      await this._tryLoadCurves();
      this._manageMode = false;
      this._legendCloseAddSignal++;
    } catch (err) {
      console.error('[Lightener] Failed to add light:', err);
      this._manageError = this._formatManageError(err, 'Could not add light.');
    } finally {
      this._managingLights = false;
    }
  }

  private _onManageToggle(e: CustomEvent): void {
    const detail = e.detail as { manageMode?: boolean } | null;
    const next =
      detail && typeof detail.manageMode === 'boolean' ? detail.manageMode : !this._manageMode;
    this._manageMode = next;
    if (next) {
      void this._loadEligibleAddLights();
    } else {
      this._legendCloseAddSignal++;
      this._legendCloseRemoveSignal++;
    }
  }

  private async _onDeleteGroup(): Promise<void> {
    if (!this._hass || !this._entityId || this._managingLights) return;
    if (this._previewActive) this._stopPreview();
    const entityId = this._entityId;
    this._manageError = null;
    this._managingLights = true;
    try {
      const reg = (await this._hass.callWS({
        type: 'config/entity_registry/get',
        entity_id: entityId,
      })) as { config_entry_id?: string | null; platform?: string } | null;
      if (reg?.platform !== 'lightener') {
        throw new Error('Entity is not a Lightener group — cannot delete from this card.');
      }
      const configEntryId = reg?.config_entry_id;
      if (!configEntryId) {
        throw new Error('Group is not backed by a config entry — cannot delete from the card.');
      }
      await this._hass.callApi('DELETE', `config/config_entries/entry/${configEntryId}`);
      // Reset manage mode locally before the handoff. The panel auto-selects
      // another group on this event — if _manageMode survives the switch, the
      // next group opens already showing remove/delete affordances.
      this._manageMode = false;
      this._legendCloseAddSignal++;
      this._legendCloseRemoveSignal++;
      // Standalone Lovelace card: no parent panel listens for the event, so
      // clear our own state immediately and surface a deleted-group view.
      // The panel handles its own teardown via _handleGroupDeleted (which
      // navigates away), so the deleted-group view is only seen when this
      // card is mounted directly in a Lovelace dashboard.
      // _groupDeleted gates _canManageLights and the render path, preventing
      // affordances (add light, manage mode) against a config entry that no
      // longer exists.
      this._curves = [];
      this._originalCurves = [];
      this._undoStack = [];
      this._loaded = true;
      this._loadedEntityId = entityId;
      this._selectedCurveId = null;
      this._loadError = null;
      this._loadErrorEntityId = undefined;
      this._groupDeleted = true;
      this.dispatchEvent(
        new CustomEvent('lightener-group-deleted', {
          detail: { entityId, configEntryId },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error('[Lightener] Failed to delete group:', err);
      this._manageError = this._formatManageError(err, 'Could not delete group.');
    } finally {
      this._managingLights = false;
    }
  }

  private async _onRemoveLight(e: CustomEvent): Promise<void> {
    if (!this._hass || !this._entityId || this._managingLights) return;
    const { entityId } = e.detail as { entityId: string };
    if (!entityId) return;
    if (this._previewActive) this._stopPreview();
    this._manageError = null;
    this._managingLights = true;
    try {
      await this._hass.callWS({
        type: 'lightener/remove_light',
        entity_id: this._entityId,
        controlled_entity_id: entityId,
      });
      if (this._selectedCurveId === entityId) {
        this._selectedCurveId = null;
      }
      this._undoStack = [];
      this._eligibleAddLightIds = null;
      this._loaded = false;
      await this._tryLoadCurves();
    } catch (err) {
      console.error('[Lightener] Failed to remove light:', err);
      this._manageError = this._formatManageError(err, 'Could not remove light.');
    } finally {
      this._managingLights = false;
    }
  }

  private _formatManageError(err: unknown, fallback: string): string {
    const anyErr = err as { message?: string; code?: string } | null | undefined;
    if (anyErr?.message) return anyErr.message;
    return fallback;
  }

  public async saveCurves(): Promise<boolean> {
    return this._onSave();
  }

  private async _onSave(): Promise<boolean> {
    if (
      !this._hass ||
      !this._entityId ||
      this._saving ||
      this._cancelAnimating ||
      this._managingLights
    )
      return false;

    if (this._previewActive) this._stopPreview();

    const savedEntityId = this._entityId;
    this._dispatchSave({ type: 'save-start' });
    try {
      const payload = curvesToWsPayload(this._curves);
      await this._hass.callWS({
        type: 'lightener/save_curves',
        entity_id: savedEntityId,
        curves: payload,
      });
      // If user switched entity while save was in flight, don't corrupt the new entity's state.
      // Clear undo stack so stale history for the old entity can't be replayed after a switch-back.
      if (this._entityId !== savedEntityId) {
        if (this._previewActive) this._stopPreview();
        this._undoStack = [];
        this._dispatchSave({ type: 'reset' });
        return false;
      }
      // Clear dirty state before the re-fetch so _tryLoadCurves won't skip overwriting curves.
      // _originalCurves is intentionally left stale until the backend re-fetch overwrites it.
      this._cleanVersion = this._dirtyVersion;
      this._undoStack = [];
      this._pendingReloadEntityId = undefined;
      this._dispatchSave({ type: 'save-success' }); // → confirming; controls stay disabled
      // Inline reload: _tryLoadCurves dispatches save-confirmed (and starts the success timer)
      // once the re-fetch completes. In the stale-load case, queue behind the in-flight load.
      this._loaded = false;
      if (this._loading) {
        this._reloadAfterLoadEntityId = savedEntityId;
      } else {
        await this._tryLoadCurves();
      }
      return true;
    } catch (err) {
      console.error('[Lightener] Failed to save curves:', err);
      this._dispatchSave({ type: 'save-error', message: 'Save failed. Check connection.' });
      return false;
    }
  }

  private _retryLoad(): void {
    this._loaded = false;
    this._loadError = null;
    this._loadErrorEntityId = undefined;
    this._pendingReloadEntityId = undefined;
    this._reloadAfterLoadEntityId = undefined;
    this._tryLoadCurves();
  }

  private _reloadCurvesAfterCurrentLoad(entityId: string): void {
    this._loaded = false;
    if (this._loading) {
      this._reloadAfterLoadEntityId = entityId;
      return;
    }
    void this._tryLoadCurves();
  }

  private _reloadPendingDirtyResponse(): void {
    const entityId = this._pendingReloadEntityId;
    if (!entityId || entityId !== this._entityId) return;
    this._pendingReloadEntityId = undefined;
    this._reloadCurvesAfterCurrentLoad(entityId);
  }

  private _onCancel(): void {
    if (this._cancelAnimating) return;
    if (this._previewActive) this._stopPreview();
    this._showPresets = false;
    this._undoStack = [];
    this._animateCurvesTo(cloneCurves(this._originalCurves), () => {
      this._selectedCurveId = null;
      this._dispatchSave({ type: 'reset' });
    });
  }

  private _renderLoadingSkeleton() {
    return html`
      <div class="loading-indicator" role="status" aria-live="polite">
        <div class="loading-graph" aria-hidden="true"></div>
        <div class="loading-caption">Loading curves…</div>
      </div>
    `;
  }

  render() {
    return html`
      <div
        class="card ${this._embedded ? 'embedded' : ''}"
        role="region"
        aria-label="Brightness Curves Editor"
      >
        <div class="header">
          <h2>${(this._config.title as string) ?? 'Brightness Curves'}</h2>
          ${!this._loading && this._isAdmin && this._curves.length > 0
            ? html`<button
                class="presets-btn ${this._showPresets ? 'active' : ''}"
                @click=${this._togglePresets}
                ?disabled=${this._managingLights}
                aria-expanded=${this._showPresets}
              >
                Presets
              </button>`
            : nothing}
        </div>

        ${this._showPresets ? this._renderPresetsPanel() : nothing}

        <div class="workspace">
          <div class="main-stack">
            ${this._loading
              ? this._renderLoadingSkeleton()
              : html`<div class="graph-panel">
                  <curve-graph
                    .curves=${this._curves}
                    .selectedCurveId=${this._selectedCurveId}
                    .entityId=${this._entityId ?? null}
                    .readOnly=${!this._isAdmin || this._cancelAnimating || this._managingLights}
                    .scrubberPosition=${this._scrubberPosition}
                    @point-move=${this._onPointMove}
                    @point-drop=${this._onPointDrop}
                    @point-add=${this._onPointAdd}
                    @point-remove=${this._onPointRemove}
                    @focus-curve=${this._onFocusCurve}
                  ></curve-graph>
                </div>`}
            ${this._curves.length > 0
              ? html`<curve-scrubber
                  .curves=${this._curves}
                  .readOnly=${!this._isAdmin || this._managingLights}
                  .canPreview=${this._isAdmin && !this._cancelAnimating && !this._managingLights}
                  .previewActive=${this._previewActive}
                  @scrubber-move=${this._onScrubberMove}
                  @scrubber-start=${this._onScrubberStart}
                  @scrubber-end=${this._onScrubberEnd}
                  @preview-toggle=${this._onPreviewToggle}
                ></curve-scrubber>`
              : nothing}
          </div>

          <div class="side-rail">
            <curve-legend
              .curves=${this._curves}
              .selectedCurveId=${this._selectedCurveId}
              .scrubberPosition=${this._scrubberPosition}
              .canManage=${this._canManageLights}
              .managing=${this._managingLights}
              .manageMode=${this._manageMode}
              .excludeEntityIds=${this._entityId ? [this._entityId] : []}
              .includeEntityIds=${this._eligibleAddLightIds}
              .closeAddSignal=${this._legendCloseAddSignal}
              .closeRemoveSignal=${this._legendCloseRemoveSignal}
              .hass=${this._hass}
              @select-curve=${this._onSelectCurve}
              @toggle-curve=${this._onToggleCurve}
              @add-panel-open=${this._onLegendPanelOpen}
              @remove-panel-open=${this._onLegendPanelOpen}
              @add-light=${this._onAddLight}
              @remove-light=${this._onRemoveLight}
              @manage-toggle=${this._onManageToggle}
              @delete-group=${this._onDeleteGroup}
            ></curve-legend>
            ${this._manageError
              ? html`<div class="error" role="alert">${WARNING_ICON} ${this._manageError}</div>`
              : nothing}
          </div>

          <div class="footer-slot">
            <curve-footer
              .dirty=${this._isDirty || this._cancelAnimating}
              .readOnly=${!this._isAdmin || this._managingLights}
              .saving=${this._saving || this._cancelAnimating || this._managingLights}
              .canUndo=${this._undoStack.length > 0 &&
              !this._cancelAnimating &&
              !this._managingLights}
              @save-curves=${this._onSave}
              @cancel-curves=${this._onCancel}
              @undo-curves=${() => this._undo()}
            ></curve-footer>
          </div>
        </div>

        <div class="status-stack">
          ${this._saveSuccess
            ? html`<div class="success" role="status" aria-live="polite">
                <svg
                  class="status-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Saved successfully
              </div>`
            : nothing}
          ${this._loadError
            ? html`<div class="error" role="alert">
                ${WARNING_ICON} Failed to load curves
                <button type="button" class="retry-link" @click=${this._retryLoad}>Retry</button>
              </div>`
            : nothing}
          ${this._groupDeleted
            ? html`<div class="error" role="status">
                ${WARNING_ICON} This Lightener group was deleted. Remove this card or point it at a
                different group.
              </div>`
            : nothing}
          ${this._saveError
            ? html`<div class="error" role="alert">
                ${WARNING_ICON} Save failed
                <button type="button" class="retry-link" @click=${this._onSave}>Retry</button>
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lightener-curve-card': LightenerCurveCard;
  }
}
