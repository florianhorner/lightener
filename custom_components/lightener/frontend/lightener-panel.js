const CARD_VERSION = "2.15.0-dev.5";
const CARD_VERSION_GLOBAL = "__LIGHTENER_CURVE_CARD_VERSION__";
const PANEL_VERSION_GLOBAL = "__LIGHTENER_PANEL_CARD_VERSION__";
const CARD_STALE_RELOAD_KEY = "lightener_curve_card_reload_version";
// Expose the panel's compiled-in card version for debugging and tests.
window[PANEL_VERSION_GLOBAL] = CARD_VERSION;

class LightenerEditorPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._selectedEntity = null;
    this._pendingEntity = null;
    this._card = null;
    this._cardDirty = false;
    this._switchSaving = false;
    this._cardScriptPromise = null;
    this._cardUsedFallback = false;
    this._lightenerEntities = null;
    this._loadingEntities = false;
    this._requestedConfigEntryId = null;
    this._onCardDirtyState = (event) => {
      this._cardDirty = event.detail?.dirty === true;
      if (!this._cardDirty && !this._switchSaving) {
        if (this._pendingEntity) {
          this._setSelectedEntity(this._pendingEntity);
          return;
        }
        this._pendingEntity = null;
      }
      this._renderPendingSwitch();
    };
    this._onGroupDeleted = (event) => {
      const deletedEntityId = event.detail?.entityId;
      this._handleGroupDeleted(deletedEntityId);
    };
    try {
      this._requestedConfigEntryId = new URLSearchParams(window.location.search).get("config_entry");
    } catch (err) {}
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loadingEntities && this._lightenerEntities === null) {
      this._loadLightenerEntities();
    }

    const entities = this._getEditorEntities();

    if (!this._selectedEntity || !entities.some((entity) => entity.entity_id === this._selectedEntity)) {
      let saved = null;
      try { saved = window.localStorage.getItem("lightener_editor_entity"); } catch { /* private browsing */ }
      if (saved && entities.some((entity) => entity.entity_id === saved)) {
        this._selectedEntity = saved;
      } else {
        this._selectedEntity = entities[0]?.entity_id ?? null;
      }
      this._cardDirty = false;
      this._pendingEntity = null;
    }

    this._render();
    this._syncCard();
  }

  connectedCallback() {
    this._render();
  }

  disconnectedCallback() {
    this._detachCardListeners();
  }

  _getFallbackEntities() {
    if (!this._hass || !this._hass.states) {
      return [];
    }
    const statesRef = this._hass.states;
    if (this._fallbackEntitiesCache && this._fallbackEntitiesStatesRef === statesRef) {
      return this._fallbackEntitiesCache;
    }
    const result = Object.keys(statesRef)
      .filter((entityId) => entityId.startsWith("light.") && statesRef[entityId]?.attributes?.entity_id)
      .map((entityId) => ({
        entity_id: entityId,
        name: statesRef[entityId].attributes.friendly_name || entityId,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    this._fallbackEntitiesCache = result;
    this._fallbackEntitiesStatesRef = statesRef;
    return result;
  }

  _getEditorEntities() {
    if (Array.isArray(this._lightenerEntities)) {
      if (this._requestedConfigEntryId) {
        return this._lightenerEntities.filter((entity) => entity.config_entry_id === this._requestedConfigEntryId);
      }
      if (this._lightenerEntities.length) {
        return this._lightenerEntities;
      }
    }
    if (this._requestedConfigEntryId) {
      return [];
    }
    return this._getFallbackEntities();
  }

  _getEntityLabel(entityId) {
    const entity = this._getEditorEntities().find((item) => item.entity_id === entityId);
    if (entity) {
      return entity.name;
    }
    return entityId || "this Lightener entity";
  }

  async _loadLightenerEntities() {
    if (!this._hass || !this._hass.callWS) {
      return;
    }

    this._loadingEntities = true;
    try {
      const result = await this._hass.callWS({ type: "lightener/list_entities" });
      const entities = Array.isArray(result?.entities) ? result.entities : [];
      this._lightenerEntities = entities;
    } catch (err) {
      this._lightenerEntities = [];
    } finally {
      this._loadingEntities = false;
      if (this._hass) {
        this.hass = this._hass;
      }
    }
  }

  async _ensureCardScriptLoaded() {
    const loadedVersion = window[CARD_VERSION_GLOBAL];
    const cardAlreadyRegistered = customElements.get("lightener-curve-card");
    if (cardAlreadyRegistered) {
      if (!CARD_VERSION || loadedVersion === CARD_VERSION) {
        return;
      }
      this._reloadForStaleCard();
      return;
    }
    if (!this._cardScriptPromise) {
      // Strip SemVer build metadata (e.g. +build.4) — the server registers the
      // path without the + segment because + is reserved in URL paths.
      const cardUrlVersion = CARD_VERSION ? CARD_VERSION.split("+")[0] : "";
      const moduleUrl = cardUrlVersion
        ? `/lightener/lightener-curve-card.${cardUrlVersion}.js`
        : "/lightener/lightener-curve-card.js";
      this._cardModuleUrl = moduleUrl;
      const fallbackUrl = "/lightener/lightener-curve-card.js";
      this._cardUsedFallback = false;
      this._cardScriptPromise = import(/* @vite-ignore */ moduleUrl)
        .catch((err) => {
          // Versioned URL not found — likely a SW-cached stale panel requesting an
          // old path-stamped URL the new server hasn't registered. Fall back to the
          // unversioned path so the load succeeds rather than hard-erroring.
          console.debug("[lightener] versioned card URL failed, falling back to unversioned:", err);
          this._cardUsedFallback = true;
          this._cardModuleUrl = fallbackUrl;
          return import(/* @vite-ignore */ fallbackUrl);
        })
        .then((module) => {
          // Only stamp the version global when the versioned URL was used. When falling
          // back to the unversioned path the card bundle sets the global at eval time
          // with its own actual version — leaving it untouched lets the stale-card
          // reload guard see the real card version rather than the panel's assumption.
          if (CARD_VERSION && !this._cardUsedFallback) {
            window[CARD_VERSION_GLOBAL] = CARD_VERSION;
          }
          return module;
        })
        .catch((err) => {
          // Both versioned and fallback imports failed. Clear the cached promise so
          // the next _syncCard() call retries from scratch rather than permanently
          // re-throwing this rejection.
          this._cardScriptPromise = null;
          throw err;
        });
    }
    await this._cardScriptPromise;
    // When the fallback (unversioned) URL was used, the card bundle sets
    // window[CARD_VERSION_GLOBAL] at eval time. If it reports a different version
    // than what this panel was compiled for, trigger the stale-card reload so the
    // correct bundle takes over — the same guard that runs for pre-registered classes.
    if (this._cardUsedFallback && CARD_VERSION && window[CARD_VERSION_GLOBAL] !== CARD_VERSION) {
      this._reloadForStaleCard();
    }
  }

  _reloadForStaleCard() {
    if (!CARD_VERSION) {
      return;
    }
    try {
      if (window.sessionStorage.getItem(CARD_STALE_RELOAD_KEY) === CARD_VERSION) {
        return;
      }
      window.sessionStorage.setItem(CARD_STALE_RELOAD_KEY, CARD_VERSION);
    } catch {
      // sessionStorage unavailable — skip reload to avoid an infinite reload loop.
      return;
    }
    console.debug(
      "[lightener] stale card detected (loaded:",
      window[CARD_VERSION_GLOBAL],
      "expected:",
      CARD_VERSION,
      "). Reloading once."
    );
    window.location.reload();
  }

  _detachCardListeners() {
    if (this._card) {
      this._card.removeEventListener("curve-dirty-state", this._onCardDirtyState);
      this._card.removeEventListener("lightener-group-deleted", this._onGroupDeleted);
    }
  }

  _attachCardListeners(card) {
    if (this._card === card) {
      return;
    }
    this._detachCardListeners();
    this._card = card;
    if (this._card) {
      this._card.addEventListener("curve-dirty-state", this._onCardDirtyState);
      this._card.addEventListener("lightener-group-deleted", this._onGroupDeleted);
      this._cardDirty = this._card.dirty === true;
    }
    this._renderPendingSwitch();
  }

  async _handleGroupDeleted(deletedEntityId) {
    this._cardDirty = false;
    this._pendingEntity = null;
    await this._loadLightenerEntities();
    const entities = this._getEditorEntities();
    const next = entities.find((e) => e.entity_id !== deletedEntityId) || null;
    this._setSelectedEntity(next ? next.entity_id : null);
  }

  _clearCard() {
    const mount = this.shadowRoot.querySelector("#card-mount");
    if (mount) {
      mount.replaceChildren();
    }
    this._detachCardListeners();
    this._card = null;
    this._cardDirty = false;
  }

  _setSelectedEntity(entityId) {
    this._selectedEntity = entityId;
    this._pendingEntity = null;
    this._switchSaving = false;
    this._cardDirty = false;
    try {
      if (entityId) {
        window.localStorage.setItem("lightener_editor_entity", entityId);
      } else {
        window.localStorage.removeItem("lightener_editor_entity");
      }
    } catch {
      // Silently ignore — private browsing or quota-exceeded; entity selection just won't persist
    }
    this._render();
    this._syncCard();
  }

  async _confirmPendingSwitchSave() {
    if (!this._pendingEntity || !this._card || this._switchSaving) {
      return;
    }

    this._switchSaving = true;
    this._renderPendingSwitch();

    const saveCurves = typeof this._card.saveCurves === "function" ? this._card.saveCurves.bind(this._card) : null;
    let saved = false;
    try {
      saved = saveCurves ? await saveCurves() : false;
    } catch (err) {
      console.error("[Lightener] Entity switch save failed:", err);
    }

    if (saved) {
      this._setSelectedEntity(this._pendingEntity);
      return;
    }

    this._switchSaving = false;
    this._renderPendingSwitch();
  }

  _confirmPendingSwitchDiscard() {
    if (!this._pendingEntity) {
      return;
    }
    this._setSelectedEntity(this._pendingEntity);
  }

  _renderPendingSwitch() {
    const guard = this.shadowRoot.querySelector("#switch-guard");
    if (!guard) {
      return;
    }

    const text = this.shadowRoot.querySelector("#switch-guard-text");
    const saveButton = this.shadowRoot.querySelector("#switch-save");
    const discardButton = this.shadowRoot.querySelector("#switch-discard");

    if (!this._pendingEntity || !this._cardDirty) {
      guard.hidden = true;
      text.textContent = "";
      saveButton.disabled = false;
      saveButton.textContent = "Save";
      discardButton.disabled = false;
      return;
    }

    guard.hidden = false;
    text.textContent = `Unsaved changes in ${this._getEntityLabel(this._selectedEntity)}. Save or discard before switching to ${this._getEntityLabel(this._pendingEntity)}.`;
    saveButton.disabled = this._switchSaving;
    saveButton.textContent = this._switchSaving ? "Saving..." : "Save";
    discardButton.disabled = this._switchSaving;
  }

  _buildEmptyState() {
    const section = document.createElement("section");
    section.className = "empty-state";

    const illustration = document.createElement("div");
    illustration.className = "empty-state-illustration";
    illustration.innerHTML = `
      <svg viewBox="0 0 240 120" aria-hidden="true">
        <defs>
          <linearGradient id="curve-grad-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#2563eb"/>
            <stop offset="1" stop-color="#2563eb" stop-opacity="0.4"/>
          </linearGradient>
        </defs>
        <line x1="20" y1="100" x2="220" y2="100" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
        <line x1="20" y1="20" x2="20" y2="100" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
        <path d="M 20 100 C 70 100, 110 90, 220 20" fill="none" stroke="url(#curve-grad-1)" stroke-width="3" stroke-linecap="round"/>
        <path d="M 20 100 C 80 70, 140 50, 220 20" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-opacity="0.7"/>
        <path d="M 20 100 C 100 100, 140 30, 220 20" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-opacity="0.7"/>
      </svg>
    `;

    const title = document.createElement("h2");
    title.textContent = this._requestedConfigEntryId
      ? "No editable Lightener group yet"
      : "Create your first Lightener group";

    const body = document.createElement("p");
    body.textContent =
      "Lightener lets one virtual light control a group of real lights with per-light brightness curves. Pick the lights, set a starting curve, and you're ready to shape how each one responds.";

    section.append(illustration, title, body);

    // In scoped-config-entry mode, the create flow makes a different config entry that
    // would be filtered out — leaving the panel empty after "success." Match the
    // header button gating and link out to HA Integrations instead.
    if (this._requestedConfigEntryId) {
      const link = document.createElement("a");
      link.className = "empty-state-cta";
      const baseUrl = (this._hass?.config?.frontend_url || "").replace(/\/$/, "");
      link.href = baseUrl + "/config/integrations";
      link.textContent = "Open Integrations";
      section.append(link);
    } else {
      const cta = document.createElement("button");
      cta.type = "button";
      cta.className = "empty-state-cta";
      cta.textContent = "Create Lightener group";
      cta.addEventListener("click", () => this._openCreateGroupModal());
      section.append(cta);
    }

    return section;
  }

  _renderEmptyState() {
    const mount = this.shadowRoot.querySelector("#card-mount");
    if (!mount) {
      return;
    }
    mount.replaceChildren(this._buildEmptyState());
  }

  _renderCardLoadError() {
    const mount = this.shadowRoot.querySelector("#card-mount");
    if (!mount) {
      return;
    }
    const error = document.createElement("div");
    error.className = "error";
    error.textContent = "Failed to load curve editor card. Check browser console.";
    mount.replaceChildren(error);
  }

  async _syncCard() {
    if (!this._selectedEntity) {
      this._clearCard();
      this._renderEmptyState();
      return;
    }

    if (!this._hass) {
      return;
    }

    try {
      await this._ensureCardScriptLoaded();
    } catch (err) {
      this._clearCard();
      this._renderCardLoadError();
      return;
    }

    const mount = this.shadowRoot.querySelector("#card-mount");
    if (!mount) {
      return;
    }

    if (!this._card) {
      this._attachCardListeners(document.createElement("lightener-curve-card"));
      mount.replaceChildren(this._card);
    }

    this._card.setConfig({
      type: "custom:lightener-curve-card",
      entity: this._selectedEntity,
      embedded: true,
    });
    this._card.hass = this._hass;
  }

  _handleEntitySelectChange(event) {
    const nextEntity = event.target.value || null;
    if (!nextEntity || nextEntity === this._selectedEntity) {
      return;
    }

    // Ignore a second change while a switch is already pending (double-click race)
    if (this._pendingEntity) {
      event.target.value = this._selectedEntity || "";
      return;
    }

    if (this._cardDirty) {
      this._pendingEntity = nextEntity;
      event.target.value = this._selectedEntity || "";
      this._renderPendingSwitch();
      return;
    }

    this._setSelectedEntity(nextEntity);
  }

  _render() {
    const entities = this._getEditorEntities();

    if (!this.shadowRoot.querySelector("#entity-select")) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 18px 20px 28px;
            box-sizing: border-box;
            max-width: 100%;
            overflow-x: hidden;
            --lightener-panel-surface: color-mix(
              in srgb,
              var(--card-background-color) 95%,
              var(--primary-text-color) 5%
            );
            --lightener-panel-border: color-mix(
              in srgb,
              var(--divider-color) 70%,
              transparent
            );
          }
          .shell {
            max-width: 1360px;
            margin: 0 auto;
          }
          h1 {
            margin: 0 0 8px;
            font-size: clamp(1.45rem, 2vw, 1.8rem);
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          p {
            margin: 0 0 16px;
            color: var(--secondary-text-color);
            max-width: 66ch;
          }
          label {
            display: block;
            margin: 0 0 6px;
            font-size: 0.9rem;
            color: var(--secondary-text-color);
          }
          .control-row {
            margin-bottom: 16px;
            padding: 16px 18px;
            border-radius: 18px;
            border: 1px solid var(--lightener-panel-border);
            background:
              linear-gradient(
                180deg,
                color-mix(in srgb, var(--lightener-panel-surface) 92%, transparent),
                color-mix(in srgb, var(--lightener-panel-surface) 98%, transparent)
              );
          }
          .select-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
            max-width: 640px;
          }
          select {
            width: 100%;
            height: 44px;
            padding: 0 40px 0 14px;
            border-radius: 12px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            appearance: none;
            -webkit-appearance: none;
            font-family: var(--mdc-typography-body1-font-family, var(--paper-font-body1_-_font-family, 'Roboto', sans-serif));
            font-size: 14px;
            cursor: pointer;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          select:hover {
            border-color: var(--primary-color, #2563eb);
          }
          select:focus {
            border-color: var(--primary-color, #2563eb);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
          }
          .select-arrow {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: var(--secondary-text-color);
            opacity: 0.6;
          }
          .hint {
            font-size: 0.9rem;
            margin-top: 10px;
            color: var(--secondary-text-color);
          }
          .error {
            color: var(--error-color);
            margin-top: 10px;
          }
          .switch-guard {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 14px;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid color-mix(in srgb, var(--warning-color, #f59e0b) 35%, transparent);
            background: color-mix(in srgb, var(--warning-color, #f59e0b) 10%, transparent);
            color: var(--primary-text-color);
          }
          .switch-guard[hidden] {
            display: none;
          }
          .switch-copy {
            font-size: 0.92rem;
            line-height: 1.4;
          }
          .switch-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .switch-button {
            border: none;
            border-radius: 999px;
            padding: 9px 14px;
            font: inherit;
            cursor: pointer;
          }
          .switch-button.primary {
            background: #2563eb;
            color: #fff;
          }
          .switch-button.secondary {
            background: transparent;
            color: var(--primary-text-color);
            border: 1px solid var(--lightener-panel-border);
          }
          .switch-button:disabled {
            opacity: 0.6;
            cursor: default;
          }
          #card-mount {
            min-height: 320px;
          }
          .empty-state {
            display: grid;
            gap: 14px;
            max-width: 720px;
            padding: 28px;
            border-radius: 22px;
            border: 1px dashed var(--lightener-panel-border);
            background:
              radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 30%),
              linear-gradient(
                180deg,
                color-mix(in srgb, var(--lightener-panel-surface) 92%, transparent),
                color-mix(in srgb, var(--lightener-panel-surface) 98%, transparent)
              );
          }
          .empty-state h2 {
            margin: 0;
            font-size: 1.15rem;
            letter-spacing: -0.01em;
          }
          .empty-state p {
            margin: 0;
            max-width: 56ch;
          }
          .empty-state-steps {
            margin: 0;
            padding-left: 1.2rem;
            color: var(--secondary-text-color);
          }
          .empty-state-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            padding: 10px 18px;
            border-radius: 999px;
            background: #2563eb;
            color: #fff;
            border: none;
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.15s ease;
          }
          .empty-state-cta:hover {
            opacity: 0.9;
          }
          .empty-state-illustration {
            color: var(--secondary-text-color);
            max-width: 240px;
          }
          .empty-state-illustration svg {
            width: 100%;
            height: auto;
            display: block;
          }
          .entity-select-row {
            display: flex;
            gap: 10px;
            align-items: stretch;
          }
          .new-group-btn {
            min-width: 44px;
            height: 44px;
            padding: 0 14px;
            border-radius: 12px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: border-color 0.15s ease, color 0.15s ease;
          }
          .new-group-btn:hover {
            border-color: var(--primary-color, #2563eb);
            color: var(--primary-color, #2563eb);
          }
          .new-group-btn svg {
            width: 16px;
            height: 16px;
          }
          .modal {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .modal[hidden] {
            display: none;
          }
          .modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
          }
          .modal-content {
            position: relative;
            width: 100%;
            max-width: 520px;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            background: var(--card-background-color);
            color: var(--primary-text-color);
            border-radius: 16px;
            padding: 22px 22px 20px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
          }
          .modal-content h2 {
            margin: 0 0 16px;
            font-size: 1.25rem;
          }
          .modal-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 14px;
          }
          .modal-field label {
            font-size: 0.85rem;
            color: var(--secondary-text-color);
            margin: 0;
          }
          .modal-field input[type="text"] {
            height: 40px;
            padding: 0 12px;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            font-family: inherit;
            font-size: 14px;
          }
          .modal-field input[type="text"]:focus {
            outline: none;
            border-color: var(--primary-color, #2563eb);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
          }
          .modal-presets {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          @media (max-width: 499px) {
            .modal-presets {
              grid-template-columns: 1fr;
            }
          }
          .modal-preset-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 44px;
            padding: 8px 10px;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            font-family: inherit;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            text-align: left;
            transition: border-color 0.15s ease, background 0.15s ease;
          }
          .modal-preset-btn:hover {
            border-color: var(--primary-color, #2563eb);
          }
          .modal-preset-btn.active {
            border-color: var(--primary-color, #2563eb);
            background: rgba(37, 99, 235, 0.1);
          }
          .modal-preset-btn svg {
            width: 56px;
            height: 36px;
            flex-shrink: 0;
          }
          .modal-preset-btn polyline {
            fill: none;
            stroke: var(--primary-color, #2563eb);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .modal-error {
            padding: 10px 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            background: rgba(220, 38, 38, 0.1);
            color: #b91c1c;
            font-size: 0.9rem;
          }
          .modal-error[hidden] {
            display: none;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 18px;
          }
          .modal-btn {
            padding: 9px 18px;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: transparent;
            color: var(--primary-text-color);
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }
          .modal-btn.primary {
            background: #2563eb;
            border-color: #2563eb;
            color: #fff;
          }
          .modal-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }
          @media (max-width: 900px) {
            :host {
              padding: 14px 14px 22px;
            }
            .control-row,
            .empty-state {
              padding: 14px;
              border-radius: 14px;
            }
            .switch-guard {
              align-items: stretch;
              flex-direction: column;
            }
          }
        </style>
        <div class="shell">
          <h1>Lightener Curve Editor</h1>
          <p>Pick a Lightener light entity and edit its curves directly here.</p>
          <div class="control-row">
            <label for="entity-select">Light entity</label>
            <div class="entity-select-row">
              <div class="select-wrapper">
                <select id="entity-select"></select>
                <svg class="select-arrow" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </div>
              <button id="new-group-btn" class="new-group-btn" type="button" hidden title="Create new Lightener group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New group
              </button>
            </div>
            <div id="status-msg"></div>
            <div id="switch-guard" class="switch-guard" hidden>
              <div id="switch-guard-text" class="switch-copy"></div>
              <div class="switch-actions">
                <button id="switch-save" class="switch-button primary" type="button">Save</button>
                <button id="switch-discard" class="switch-button secondary" type="button">Discard</button>
              </div>
            </div>
          </div>
          <div id="card-mount"></div>
          <div id="create-group-modal" class="modal" hidden>
            <div class="modal-backdrop" id="create-group-backdrop"></div>
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
              <h2 id="create-group-title">Create Lightener group</h2>
              <div id="create-group-error" class="modal-error" hidden></div>
              <form id="create-group-form">
                <div class="modal-field">
                  <label for="cgf-name">Name</label>
                  <input id="cgf-name" type="text" placeholder="e.g. Living Room" required>
                </div>
                <div class="modal-field">
                  <label>Lights to control</label>
                  <div id="cgf-lights-mount"></div>
                </div>
                <div class="modal-field">
                  <label>Starting curve</label>
                  <div id="cgf-presets" class="modal-presets"></div>
                </div>
                <div class="modal-actions">
                  <button id="cgf-cancel" type="button" class="modal-btn">Cancel</button>
                  <button id="cgf-submit" type="submit" class="modal-btn primary">Create group</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;

      this.shadowRoot.querySelector("#entity-select").addEventListener("change", (event) => {
        this._handleEntitySelectChange(event);
      });
      this.shadowRoot.querySelector("#switch-save").addEventListener("click", () => {
        this._confirmPendingSwitchSave();
      });
      this.shadowRoot.querySelector("#switch-discard").addEventListener("click", () => {
        this._confirmPendingSwitchDiscard();
      });
      this.shadowRoot.querySelector("#new-group-btn").addEventListener("click", () => {
        this._openCreateGroupModal();
      });
      this.shadowRoot.querySelector("#cgf-cancel").addEventListener("click", () => {
        this._closeCreateGroupModal();
      });
      this.shadowRoot.querySelector("#create-group-backdrop").addEventListener("click", () => {
        if (!this._createGroupSubmitting) this._closeCreateGroupModal();
      });
      this.shadowRoot.querySelector("#create-group-form").addEventListener("submit", (event) => {
        event.preventDefault();
        this._submitCreateGroup();
      });
      this.shadowRoot.querySelector("#cgf-name").addEventListener("input", () => {
        this._setCreateGroupSubmitDisabled();
      });
    }

    const select = this.shadowRoot.querySelector("#entity-select");
    const statusMsg = this.shadowRoot.querySelector("#status-msg");
    const newGroupBtn = this.shadowRoot.querySelector("#new-group-btn");

    select.innerHTML = "";
    if (entities.length) {
      select.disabled = false;
      entities.forEach((entity) => {
        const option = document.createElement("option");
        option.value = entity.entity_id;
        option.textContent = `${entity.name} (${entity.entity_id})`;
        option.selected = entity.entity_id === this._selectedEntity;
        select.appendChild(option);
      });
      statusMsg.className = "hint";
      statusMsg.textContent = "Select the Lightener group entity you want to edit.";
    } else {
      select.disabled = true;
      statusMsg.className = "hint";
      statusMsg.textContent = this._requestedConfigEntryId
        ? "This Lightener integration does not have an editable group yet."
        : "Pick lights and curves; we'll wire up the integration for you.";
      this._renderEmptyState();
    }

    if (newGroupBtn) {
      const isAdmin = !!(this._hass?.user?.is_admin);
      newGroupBtn.hidden = !isAdmin || !!this._requestedConfigEntryId;
    }

    this._renderPendingSwitch();
  }

  _openCreateGroupModal() {
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (!modal) return;
    this._createGroupSubmitting = false;
    this._createGroupSelectedPreset = "linear";
    this._createGroupSelectedLights = [];
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    nameInput.value = "";
    const errorEl = this.shadowRoot.querySelector("#create-group-error");
    errorEl.hidden = true;
    errorEl.textContent = "";
    this._renderCreateGroupPresets();
    this._renderCreateGroupLightsPicker();
    this._setCreateGroupSubmitDisabled();
    modal.hidden = false;
    setTimeout(() => nameInput.focus(), 0);
  }

  _closeCreateGroupModal() {
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (modal) modal.hidden = true;
  }

  _renderCreateGroupPresets() {
    const presets = [
      { id: "linear", name: "Linear", points: "4,36 60,4" },
      { id: "dim_accent", name: "Dim accent", points: "4,36 18,33 32,29 60,18" },
      { id: "late_starter", name: "Late starter", points: "4,36 30,35 42,18 60,4" },
      { id: "night_mode", name: "Night mode", points: "4,36 14,34 32,30 60,26" },
    ];
    const mount = this.shadowRoot.querySelector("#cgf-presets");
    mount.innerHTML = "";
    presets.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "modal-preset-btn";
      btn.dataset.preset = preset.id;
      if (preset.id === this._createGroupSelectedPreset) btn.classList.add("active");
      btn.setAttribute("aria-pressed", preset.id === this._createGroupSelectedPreset ? "true" : "false");
      btn.innerHTML = `
        <svg viewBox="0 0 64 40" aria-hidden="true">
          <polyline points="${preset.points}"></polyline>
        </svg>
        <span>${preset.name}</span>
      `;
      btn.addEventListener("click", () => {
        this._createGroupSelectedPreset = preset.id;
        this._renderCreateGroupPresets();
      });
      mount.appendChild(btn);
    });
  }

  _renderCreateGroupLightsPicker() {
    const mount = this.shadowRoot.querySelector("#cgf-lights-mount");
    mount.innerHTML = "";
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass;
    picker.includeDomains = ["light"];
    picker.allowCustomEntity = true;
    picker.value = "";
    picker.addEventListener("value-changed", (event) => {
      const id = (event.detail?.value || "").trim();
      if (!id) return;
      if (!this._createGroupSelectedLights.includes(id)) {
        this._createGroupSelectedLights.push(id);
        this._renderSelectedLights();
        this._setCreateGroupSubmitDisabled();
      }
      // Reset the picker so users can keep adding lights
      picker.value = "";
    });
    mount.appendChild(picker);
    const list = document.createElement("div");
    list.id = "cgf-selected-lights";
    list.style.marginTop = "8px";
    list.style.display = "flex";
    list.style.flexWrap = "wrap";
    list.style.gap = "6px";
    mount.appendChild(list);
    this._renderSelectedLights();
  }

  _renderSelectedLights() {
    const list = this.shadowRoot.querySelector("#cgf-selected-lights");
    if (!list) return;
    list.innerHTML = "";
    this._createGroupSelectedLights.forEach((entityId) => {
      const chip = document.createElement("span");
      chip.style.display = "inline-flex";
      chip.style.alignItems = "center";
      chip.style.gap = "6px";
      chip.style.padding = "4px 10px";
      chip.style.borderRadius = "999px";
      chip.style.background = "rgba(37,99,235,0.12)";
      chip.style.color = "var(--primary-text-color)";
      chip.style.fontSize = "12px";
      const friendly = this._hass?.states?.[entityId]?.attributes?.friendly_name || entityId;
      chip.textContent = friendly;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${friendly}`);
      remove.style.border = "none";
      remove.style.background = "transparent";
      remove.style.color = "inherit";
      remove.style.cursor = "pointer";
      remove.style.fontSize = "16px";
      remove.style.lineHeight = "1";
      remove.style.padding = "0";
      remove.addEventListener("click", () => {
        this._createGroupSelectedLights = this._createGroupSelectedLights.filter((id) => id !== entityId);
        this._renderSelectedLights();
        this._setCreateGroupSubmitDisabled();
      });
      chip.appendChild(remove);
      list.appendChild(chip);
    });
  }

  _setCreateGroupSubmitDisabled() {
    const btn = this.shadowRoot.querySelector("#cgf-submit");
    if (!btn) return;
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    const hasName = !!(nameInput?.value || "").trim();
    const hasLights = this._createGroupSelectedLights.length > 0;
    btn.disabled = this._createGroupSubmitting || !hasName || !hasLights;
  }

  async _submitCreateGroup() {
    if (!this._hass || !this._hass.callWS || this._createGroupSubmitting) return;
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    const errorEl = this.shadowRoot.querySelector("#create-group-error");
    const submitBtn = this.shadowRoot.querySelector("#cgf-submit");
    const name = (nameInput?.value || "").trim();
    if (!name || this._createGroupSelectedLights.length === 0) return;

    this._createGroupSubmitting = true;
    errorEl.hidden = true;
    errorEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating…";

    try {
      const init = await this._hass.callWS({
        type: "config_entries/flow/init",
        handler: "lightener",
        show_advanced_options: false,
      });
      let flowId = init?.flow_id;
      let step = init;
      if (!flowId || step?.type === "abort") {
        throw new Error(step?.reason || "Could not start config flow");
      }

      step = await this._hass.callWS({
        type: "config_entries/flow/configure",
        flow_id: flowId,
        user_input: { name },
      });
      this._raiseFlowError(step, "Could not set group name");

      step = await this._hass.callWS({
        type: "config_entries/flow/configure",
        flow_id: flowId,
        user_input: {},
      });
      this._raiseFlowError(step, "Could not skip area filter");

      step = await this._hass.callWS({
        type: "config_entries/flow/configure",
        flow_id: flowId,
        user_input: {
          controlled_entities: this._createGroupSelectedLights,
          curve_preset: this._createGroupSelectedPreset || "linear",
        },
      });

      if (step?.type !== "create_entry") {
        this._raiseFlowError(step, "Couldn't create group");
        throw new Error("Unexpected flow result");
      }

      this._closeCreateGroupModal();
      await this._loadLightenerEntities();
      const newEntities = this._getEditorEntities();
      const expectedTitle = step.title || name;
      const newEntity =
        newEntities.find((e) => e.name === expectedTitle) ||
        newEntities[newEntities.length - 1];
      if (newEntity) {
        this._setSelectedEntity(newEntity.entity_id);
      }
    } catch (err) {
      console.error("[Lightener] Create group failed:", err);
      errorEl.textContent = err?.message || "Couldn't create group — try again.";
      errorEl.hidden = false;
    } finally {
      this._createGroupSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Create group";
      this._setCreateGroupSubmitDisabled();
    }
  }

  _raiseFlowError(step, fallback) {
    if (!step) throw new Error(fallback);
    if (step.type === "abort") {
      throw new Error(step.reason || fallback);
    }
    if (step.type === "form" && step.errors && Object.keys(step.errors).length) {
      const code = Object.values(step.errors)[0];
      throw new Error(typeof code === "string" ? code : fallback);
    }
  }
}

customElements.define("lightener-editor-panel", LightenerEditorPanel);
