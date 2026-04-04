import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { LightCurve, Hass } from './utils/types.js';
import { curvesToWsPayload, wsPayloadToCurves, cloneCurves, curvesEqual } from './utils/data.js';
import './components/curve-graph.js';
import './components/curve-scrubber.js';
import './components/curve-legend.js';
import './components/curve-footer.js';

const SAVE_SUCCESS_DISPLAY_MS = 2000;

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

const CURVE_COLORS = [
  '#42a5f5',
  '#ef5350',
  '#5c6bc0',
  '#ffa726',
  '#ab47bc',
  '#26c6da',
  '#ec407a',
  '#8d6e63',
  '#ffca28',
  '#7e57c2',
];

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

@customElement('lightener-curve-card')
export class LightenerCurveCard extends LitElement {
  @state() private _curves: LightCurve[] = [];
  @state() private _originalCurves: LightCurve[] = [];
  @state() private _config: Record<string, unknown> = {};
  @state() private _selectedCurveId: string | null = null;
  @state() private _saving = false;
  @state() private _loadError: string | null = null;
  @state() private _saveError: string | null = null;
  @state() private _saveSuccess = false;
  @state() private _loading = false;

  @state() private _hass: Hass | null = null;
  private _loaded = false;
  private _loadedEntityId: string | undefined = undefined;
  private _boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private _boundBeforeUnload: ((e: BeforeUnloadEvent) => void) | null = null;
  private _saveSuccessTimer: ReturnType<typeof setTimeout> | null = null;

  static styles = css`
    :host {
      --card-bg: var(--ha-card-background, var(--card-background-color, #fff));
      --text-color: var(--primary-text-color, #212121);
      --secondary-text: var(--secondary-text-color, #616161);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
      --graph-bg: var(--card-background-color, var(--ha-card-background, #fafafa));
      --panel-bg: color-mix(in srgb, var(--card-bg) 95%, var(--secondary-text, #616161) 5%);
      --text-xs: 9px;
      --text-sm: 12px;
      --text-md: 13px;
      --text-lg: 14px;

      display: block;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
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
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .header-icon {
      width: 18px;
      height: 18px;
      opacity: 0.5;
    }
    h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .graph-panel {
      border-radius: 12px;
      padding: 12px;
      background: var(--panel-bg);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .error {
      font-size: var(--text-sm);
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .error .retry-link {
      cursor: pointer;
      text-decoration: underline;
      opacity: 0.8;
    }
    .error .retry-link:hover {
      opacity: 1;
    }
    .success {
      font-size: var(--text-sm);
      color: #2563eb;
      padding: 8px 0 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      animation: fade-in 0.2s ease;
    }
    .status-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      font-size: var(--text-sm);
      color: var(--secondary-text);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

  // --- HA card interface ---

  setConfig(config: Record<string, unknown>): void {
    this._config = config;
    this._tryLoadCurves();
  }

  set hass(hass: Hass) {
    this._hass = hass;
    this._tryLoadCurves();
  }

  getCardSize(): number {
    return 4;
  }

  // --- Data loading ---

  private get _isAdmin(): boolean {
    return this._hass?.user?.is_admin ?? false;
  }

  private get _entityId(): string | undefined {
    return this._config.entity as string | undefined;
  }

  private get _isDirty(): boolean {
    return !curvesEqual(this._curves, this._originalCurves);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Reset load state on re-mount so data is refreshed
    this._loaded = false;
    this._loadedEntityId = undefined;
    this._tryLoadCurves();

    this._boundKeyHandler = this._onKeyDown.bind(this);
    this._boundBeforeUnload = this._onBeforeUnload.bind(this);
    window.addEventListener('keydown', this._boundKeyHandler);
    window.addEventListener('beforeunload', this._boundBeforeUnload);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
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
  }

  private _onKeyDown(e: KeyboardEvent): void {
    // Ctrl+S / Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      if (this._isDirty && this._isAdmin && !this._saving) {
        e.preventDefault();
        this._onSave();
      }
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      if (this._isDirty && !this._saving) {
        e.preventDefault();
        this._onCancel();
      }
    }
  }

  private _onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this._isDirty) {
      e.preventDefault();
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
      }
      return;
    }

    this._loadError = null;
    this._loading = true;

    try {
      const result = await this._hass.callWS<{
        entities: Record<string, { brightness: Record<string, string> }>;
      }>({
        type: 'lightener/get_curves',
        entity_id: this._entityId,
      });

      const curves = wsPayloadToCurves(result.entities, this._hass.states, CURVE_COLORS);
      this._curves = curves;
      this._originalCurves = cloneCurves(curves);
      this._loaded = true;
      this._loadedEntityId = this._entityId;
    } catch (err) {
      console.error('[Lightener] Failed to load curves:', err);
      this._loadError = String(err);
      // _loaded stays false so the next hass update can retry.
    } finally {
      this._loading = false;
    }
  }

  // --- Event handlers ---

  private _onSelectCurve(e: CustomEvent): void {
    const { entityId } = e.detail;
    const curve = this._curves.find((c) => c.entityId === entityId);
    // Cannot select a hidden curve
    if (curve && !curve.visible) return;
    // Toggle: deselect if already selected
    this._selectedCurveId = this._selectedCurveId === entityId ? null : entityId;
  }

  private _onPointMove(e: CustomEvent): void {
    const { curveIndex, pointIndex, lightener, target } = e.detail;
    const curves = [...this._curves];
    const curve = { ...curves[curveIndex] };
    const points = [...curve.controlPoints];
    points[pointIndex] = { lightener, target };
    curve.controlPoints = points;
    curves[curveIndex] = curve;
    this._curves = curves;
  }

  private _onPointDrop(_e: CustomEvent): void {
    // Dirty state is tracked automatically via _isDirty getter.
    // Save happens explicitly via the footer button.
  }

  private _onPointAdd(e: CustomEvent): void {
    const { lightener, target, entityId } = e.detail;
    // Determine which curve to add the point to
    const targetEntityId = entityId ?? this._selectedCurveId;
    if (!targetEntityId) return;

    const curveIdx = this._curves.findIndex((c) => c.entityId === targetEntityId);
    if (curveIdx < 0) return;

    // Reject if a point already exists at this lightener value
    const existing = this._curves[curveIdx].controlPoints;
    if (existing.some((cp) => cp.lightener === lightener)) return;

    const curves = [...this._curves];
    const curve = { ...curves[curveIdx] };
    const points = [...curve.controlPoints, { lightener, target }];
    // Sort by lightener value to maintain order
    points.sort((a, b) => a.lightener - b.lightener);
    curve.controlPoints = points;
    curves[curveIdx] = curve;
    this._curves = curves;
  }

  private _onPointRemove(e: CustomEvent): void {
    const { curveIndex, pointIndex } = e.detail;
    const curve = this._curves[curveIndex];
    if (!curve) return;
    // Must keep at least 2 points (origin + one more)
    if (curve.controlPoints.length <= 2) return;

    const curves = [...this._curves];
    const updated = { ...curves[curveIndex] };
    updated.controlPoints = updated.controlPoints.filter((_, i) => i !== pointIndex);
    curves[curveIndex] = updated;
    this._curves = curves;
  }

  private _onToggleCurve(e: CustomEvent): void {
    const { entityId } = e.detail;
    const curves = this._curves.map((c) =>
      c.entityId === entityId ? { ...c, visible: !c.visible } : c
    );
    this._curves = curves;
    // If hiding the selected curve, clear selection
    if (this._selectedCurveId === entityId) {
      const curve = curves.find((c) => c.entityId === entityId);
      if (curve && !curve.visible) {
        this._selectedCurveId = null;
      }
    }
  }

  private async _onSave(): Promise<void> {
    if (!this._hass || !this._entityId || this._saving) return;

    this._saving = true;
    this._saveError = null;
    try {
      const payload = curvesToWsPayload(this._curves);
      await this._hass.callWS({
        type: 'lightener/save_curves',
        entity_id: this._entityId,
        curves: payload,
      });
      this._originalCurves = cloneCurves(this._curves);
      // Re-fetch from backend in case reload normalised data
      this._loaded = false;
      this._tryLoadCurves();
      this._saveSuccess = true;
      this._saveSuccessTimer = setTimeout(() => {
        this._saveSuccess = false;
        this._saveSuccessTimer = null;
      }, SAVE_SUCCESS_DISPLAY_MS);
    } catch (err) {
      console.error('[Lightener] Failed to save curves:', err);
      this._saveError = 'Save failed. Check connection.';
    } finally {
      this._saving = false;
    }
  }

  private _retryLoad(): void {
    this._loaded = false;
    this._loadError = null;
    this._tryLoadCurves();
  }

  private _onCancel(): void {
    this._curves = cloneCurves(this._originalCurves);
    this._selectedCurveId = null;
  }

  render() {
    return html`
      <div class="card" role="region" aria-label="Brightness Curves Editor">
        <div class="header">
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 20 C6 20, 8 4, 12 4 S18 20, 22 20" />
          </svg>
          <h2>Brightness Curves</h2>
        </div>

        ${this._loading
          ? html`<div class="loading-indicator">Loading curves...</div>`
          : html`<div class="graph-panel">
              <curve-graph
                .curves=${this._curves}
                .selectedCurveId=${this._selectedCurveId}
                .readOnly=${!this._isAdmin}
                @point-move=${this._onPointMove}
                @point-drop=${this._onPointDrop}
                @point-add=${this._onPointAdd}
                @point-remove=${this._onPointRemove}
              ></curve-graph>
            </div>`}

        <curve-scrubber .curves=${this._curves} .readOnly=${!this._isAdmin}></curve-scrubber>

        <curve-legend
          .curves=${this._curves}
          .selectedCurveId=${this._selectedCurveId}
          @select-curve=${this._onSelectCurve}
          @toggle-curve=${this._onToggleCurve}
        ></curve-legend>

        <curve-footer
          .dirty=${this._isDirty}
          .readOnly=${!this._isAdmin}
          .saving=${this._saving}
          @save-curves=${this._onSave}
          @cancel-curves=${this._onCancel}
        ></curve-footer>

        ${this._saveSuccess
          ? html`<div class="success">
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
          ? html`<div class="error">
              ${WARNING_ICON} Failed to load curves
              <span class="retry-link" @click=${this._retryLoad}>Tap to retry</span>
            </div>`
          : nothing}
        ${this._saveError
          ? html`<div class="error">
              ${WARNING_ICON} Save failed
              <span class="retry-link" @click=${this._onSave}>Tap to retry</span>
            </div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lightener-curve-card': LightenerCurveCard;
  }
}
