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
    this._lightenerEntities = null;
    this._loadingEntities = false;
    this._requestedConfigEntryId = null;
    this._onCardDirtyState = (event) => {
      this._cardDirty = event.detail?.dirty === true;
      if (!this._cardDirty && !this._switchSaving) {
        this._pendingEntity = null;
      }
      this._renderPendingSwitch();
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
    if (customElements.get("lightener-curve-card")) {
      return;
    }
    if (!this._cardScriptPromise) {
      const moduleUrl = "/lightener/lightener-curve-card.js";
      this._cardScriptPromise = import(/* @vite-ignore */ moduleUrl);
    }
    await this._cardScriptPromise;
  }

  _detachCardListeners() {
    if (this._card) {
      this._card.removeEventListener("curve-dirty-state", this._onCardDirtyState);
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
      this._cardDirty = this._card.dirty === true;
    }
    this._renderPendingSwitch();
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

    const title = document.createElement("h2");
    title.textContent = this._requestedConfigEntryId
      ? "No editable Lightener group yet"
      : "No Lightener entities found";

    const body = document.createElement("p");
    body.textContent =
      "Lightener lets one virtual light control a group of real lights with per-light brightness curves. Set up a Lightener group first, then return here to shape how each light responds.";

    const steps = document.createElement("ol");
    steps.className = "empty-state-steps";
    ["Open Home Assistant Integrations.", "Add or open the Lightener integration.", "Create a Lightener group and come back to this editor."].forEach(
      (line) => {
        const item = document.createElement("li");
        item.textContent = line;
        steps.appendChild(item);
      }
    );

    const link = document.createElement("a");
    link.className = "empty-state-link";
    const baseUrl = (this._hass?.config?.frontend_url || "").replace(/\/$/, "");
    link.href = baseUrl + "/config/integrations";
    link.textContent = "Open Integrations";

    section.append(title, body, steps, link);
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
          .empty-state-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            padding: 10px 14px;
            border-radius: 999px;
            background: #2563eb;
            color: #fff;
            text-decoration: none;
            font-weight: 600;
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
            <div class="select-wrapper">
              <select id="entity-select"></select>
              <svg class="select-arrow" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
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
    }

    const select = this.shadowRoot.querySelector("#entity-select");
    const statusMsg = this.shadowRoot.querySelector("#status-msg");

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
        : "Set up a Lightener group, then return here to edit its curves.";
      this._renderEmptyState();
    }

    this._renderPendingSwitch();
  }
}

customElements.define("lightener-editor-panel", LightenerEditorPanel);
