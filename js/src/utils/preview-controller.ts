/**
 * PreviewController owns the live-preview lifecycle: requestAnimationFrame
 * handles, throttle timers, and a per-light brightness-restore snapshot.
 *
 * It is a stateful class (driven through a host interface), unlike
 * `load-lifecycle.ts` which is a pure reducer the card owns state for. That
 * split is deliberate: load state is plain data and reduces cleanly to a pure
 * function, while preview state is inherently imperative (timers, animation
 * frames) and would just leak back into the card if forced into a reducer
 * shape. Do not "fix" the inconsistency by collapsing both onto one pattern.
 */
import { sampleCurveAt } from './graph-math.js';
import type { Hass, LightCurve } from './types.js';

type PreviewBrightness = number | 'off';

export interface PreviewControllerHost {
  getHass(): Hass | null;
  getCurves(): LightCurve[];
  getScrubberPosition(): number | null;
  setScrubberPosition(position: number): void;
  getStorageEntityId(): string | undefined;
  persistScrubberPosition(entityId: string, position: number): void;
  setPreviewActive(active: boolean): void;
}

export class PreviewController {
  private _active = false;
  private _rafPending = false;
  private _trailingTimer: ReturnType<typeof setTimeout> | null = null;
  private _restoreBrightness: Map<string, number | null | undefined> = new Map();
  private _lastBrightness: Map<string, PreviewBrightness> = new Map();
  private _frameGeneration = 0;
  private _pendingPosition: number | null = null;

  public lastPreviewTime = 0;

  public constructor(
    private readonly _host: PreviewControllerHost,
    private readonly _intervalMs = 300
  ) {}

  public get active(): boolean {
    return this._active;
  }

  public start(): void {
    const hass = this._host.getHass();
    if (!hass || this._active) return;
    this._active = true;
    this._host.setPreviewActive(true);
    if (this._host.getScrubberPosition() === null) {
      this._host.setScrubberPosition(50);
      const entityId = this._host.getStorageEntityId();
      if (entityId) {
        this._host.persistScrubberPosition(entityId, 50);
      }
    }

    this._restoreBrightness.clear();
    this._lastBrightness.clear();
    for (const curve of this._host.getCurves()) {
      if (!curve.visible) continue;
      const state = hass.states[curve.entityId];
      if (state) {
        this._restoreBrightness.set(
          curve.entityId,
          state.state === 'off' ? null : (state.attributes.brightness ?? undefined)
        );
      }
    }
    this.refresh(true);
  }

  public stop(): void {
    if (!this._active) return;
    // Deactivate FIRST. A null-hass disconnect must still leave the controller
    // inactive and restartable — only the brightness-restore service calls
    // below need a live hass; the state reset does not.
    this._active = false;
    this._host.setPreviewActive(false);
    this._rafPending = false;
    this._frameGeneration++;
    this._clearTrailingTimer();

    const hass = this._host.getHass();
    if (hass) {
      for (const [entityId, brightness] of this._restoreBrightness) {
        if (brightness === null) {
          hass.callService('light', 'turn_off', { entity_id: entityId }).catch(() => {});
        } else if (brightness === undefined) {
          hass.callService('light', 'turn_on', { entity_id: entityId }).catch(() => {});
        } else {
          hass.callService('light', 'turn_on', { entity_id: entityId, brightness }).catch(() => {});
        }
      }
    }
    this._restoreBrightness.clear();
    this._lastBrightness.clear();
  }

  public disconnect(): void {
    this.stop();
    this._clearTrailingTimer();
    this._rafPending = false;
    this._pendingPosition = null;
    this._frameGeneration++;
  }

  public refresh(force = false): void {
    if (!this._active) return;
    if (this._host.getScrubberPosition() === null) {
      this._host.setScrubberPosition(50);
    }
    this.previewLights(this._host.getScrubberPosition() ?? 50, force);
  }

  public previewLights(position: number, force = false): void {
    const hass = this._host.getHass();
    if (!this._active || !hass) return;
    this._pendingPosition = position;
    if (force) {
      this.lastPreviewTime = 0;
      this._rafPending = false;
      this._frameGeneration++;
      this._lastBrightness.clear();
      this._clearTrailingTimer();
    }

    const now = Date.now();
    const elapsed = now - this.lastPreviewTime;
    if (elapsed < this._intervalMs) {
      if (!this._trailingTimer) {
        this._trailingTimer = setTimeout(() => {
          this._trailingTimer = null;
          if (this._pendingPosition !== null) {
            this.previewLights(this._pendingPosition);
          }
        }, this._intervalMs - elapsed);
      }
      return;
    }
    if (this._rafPending) return;
    this._clearTrailingTimer();
    this._rafPending = true;
    const frameGeneration = this._frameGeneration;

    requestAnimationFrame(() => {
      if (frameGeneration !== this._frameGeneration) return;
      this._rafPending = false;
      const frameHass = this._host.getHass();
      if (!this._active || !frameHass) return;
      this.lastPreviewTime = Date.now();
      const previewPosition = this._pendingPosition ?? position;

      for (const curve of this._host.getCurves()) {
        if (!curve.visible) continue;
        const value = Math.round(sampleCurveAt(curve.controlPoints, previewPosition));
        const brightness = Math.round((value / 100) * 255);
        if (brightness === 0) {
          if (this._lastBrightness.get(curve.entityId) === 'off') continue;
          this._lastBrightness.set(curve.entityId, 'off');
          frameHass.callService('light', 'turn_off', { entity_id: curve.entityId }).catch(() => {});
        } else {
          if (this._lastBrightness.get(curve.entityId) === brightness) continue;
          this._lastBrightness.set(curve.entityId, brightness);
          frameHass
            .callService('light', 'turn_on', { entity_id: curve.entityId, brightness })
            .catch(() => {});
        }
      }
    });
  }

  private _clearTrailingTimer(): void {
    if (this._trailingTimer) {
      clearTimeout(this._trailingTimer);
      this._trailingTimer = null;
    }
  }
}
