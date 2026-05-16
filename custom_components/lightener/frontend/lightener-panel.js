const CARD_VERSION = "2.15.0-dev.9";
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
    try {
      // ?action=new lets the cog flow (HA Settings -> Add Integration -> Lightener)
      // hand off into this panel and immediately open the create-group wizard,
      // unifying the two onboarding entry points so users see the same UX
      // regardless of where they started. Consumed once on first hass set.
      this._pendingAction = new URLSearchParams(window.location.search).get("action");
    } catch (err) {
      this._pendingAction = null;
    }
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
    this._maybeAutoOpenCreateGroup();
  }

  _maybeAutoOpenCreateGroup() {
    // Consume the ?action=new handoff exactly once — only if the panel can
    // actually open the wizard (admin user, no scoped config-entry mode).
    if (this._pendingAction !== "new") return;
    const isAdmin = !!(this._hass?.user?.is_admin);
    if (!isAdmin || this._requestedConfigEntryId) {
      this._pendingAction = null;
      return;
    }
    if (!this.shadowRoot?.querySelector("#create-group-modal")) {
      // Render hasn't built the modal DOM yet; try again on next hass set.
      return;
    }
    this._pendingAction = null;
    this._openCreateGroupModal();
    // Strip ?action=new so a page refresh doesn't re-open the modal. Preserve
    // every other query param (e.g. ?config_entry=X) the panel may rely on.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState(null, "", url.toString());
    } catch (err) {}
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
    return entityId || "this Lightener group";
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
    // Restrict post-delete selection to confirmed Lightener entities. Reading
    // _lightenerEntities directly avoids _getEditorEntities()'s fallback path,
    // which returns any HA light group when the Lightener list is empty —
    // selecting one of those would point the card at an entity the
    // integration doesn't own and produce an invalid editing state.
    // If _requestedConfigEntryId is set (scoped panel) we still need that
    // filter applied; _getEditorEntities() handles that case correctly.
    const candidates = this._requestedConfigEntryId
      ? this._getEditorEntities()
      : Array.isArray(this._lightenerEntities)
        ? this._lightenerEntities
        : [];
    const next = candidates.find((e) => e.entity_id !== deletedEntityId) || null;
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
      const isAdmin = !!this._hass?.user?.is_admin;
      if (isAdmin) {
        const cta = document.createElement("button");
        cta.type = "button";
        cta.className = "empty-state-cta";
        cta.textContent = "Create Lightener group";
        cta.addEventListener("click", () => this._openCreateGroupModal());
        section.append(cta);
      } else {
        const note = document.createElement("p");
        note.className = "empty-state-note";
        note.textContent = "Ask an admin to create a Lightener group.";
        section.append(note);
      }
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
          .empty-state-note {
            margin: 0;
            color: var(--secondary-text-color);
            font-size: 14px;
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
            white-space: nowrap;
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
          .modal-hint {
            margin: -2px 0 14px;
            font-size: 0.85rem;
            color: var(--secondary-text-color);
            line-height: 1.4;
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
          .modal-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }
          .step-indicator {
            list-style: none;
            display: flex;
            gap: 8px;
            padding: 0;
            margin: 0;
            font-size: 0.78rem;
            color: var(--secondary-text-color);
          }
          .step-indicator li {
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 0.55;
          }
          .step-indicator li.active {
            opacity: 1;
            color: var(--primary-text-color);
          }
          .step-indicator li.done {
            opacity: 0.85;
          }
          .step-dot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--divider-color, rgba(0,0,0,0.12));
            color: var(--primary-text-color);
            font-size: 0.75rem;
            font-weight: 600;
          }
          .step-indicator li.active .step-dot {
            background: #2563eb;
            color: #fff;
          }
          .step-indicator li.done .step-dot {
            background: rgba(37, 99, 235, 0.25);
            color: #2563eb;
          }
          .step-indicator li:not(:last-child)::after {
            content: "";
            display: inline-block;
            width: 18px;
            height: 1px;
            background: var(--divider-color, rgba(0,0,0,0.12));
            margin-left: 4px;
          }
          .modal-step[hidden] {
            display: none;
          }
          .modal-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 18px;
          }
          .modal-actions-spacer {
            flex: 1;
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
          @media (max-width: 500px) {
            .modal {
              padding: 0;
            }
            .modal-content {
              max-width: 100%;
              width: 100%;
              height: 100vh;
              max-height: 100vh;
              border-radius: 0;
              padding: 18px 16px 14px;
            }
            .modal-actions {
              position: sticky;
              bottom: 0;
              padding-top: 12px;
              background: var(--card-background-color);
            }
          }
        </style>
        <div class="shell">
          <h1>Lightener Curve Editor</h1>
          <p>Pick a Lightener group to edit its curves directly here.</p>
          <div class="control-row">
            <label for="entity-select">Lightener group</label>
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
              <div class="modal-header">
                <h2 id="create-group-title">Create Lightener group</h2>
                <ol id="cgf-step-indicator" class="step-indicator" aria-label="Wizard progress">
                  <li data-step="0" class="active"><span class="step-dot">1</span><span class="step-label">Name</span></li>
                  <li data-step="1"><span class="step-dot">2</span><span class="step-label">Area</span></li>
                  <li data-step="2"><span class="step-dot">3</span><span class="step-label">Lights</span></li>
                </ol>
              </div>
              <div id="create-group-error" class="modal-error" hidden></div>
              <form id="create-group-form">
                <div class="modal-step" data-step="0">
                  <div class="modal-field">
                    <label for="cgf-name">Name</label>
                    <input id="cgf-name" type="text" placeholder="e.g. Living Room" required>
                    <p class="modal-hint">A room or area name works best — e.g. "Living Room" or "Kitchen".</p>
                  </div>
                </div>
                <div class="modal-step" data-step="1" hidden>
                  <div class="modal-field">
                    <label>Filter lights by area (optional)</label>
                    <div id="cgf-area-mount"></div>
                    <p class="modal-hint">Pick a room to narrow the lights picker on the next step. Leave empty to see every light. Useful when you have lots of lights.</p>
                  </div>
                </div>
                <div class="modal-step" data-step="2" hidden>
                  <div class="modal-field">
                    <label>Lights to control</label>
                    <div id="cgf-lights-mount"></div>
                  </div>
                  <p class="modal-hint">Each light starts on a linear curve. Pick a preset and shape it visually after the group is created.</p>
                </div>
                <div class="modal-actions">
                  <button id="cgf-cancel" type="button" class="modal-btn">Cancel</button>
                  <span class="modal-actions-spacer"></span>
                  <button id="cgf-back" type="button" class="modal-btn" hidden>Back</button>
                  <button id="cgf-next" type="button" class="modal-btn primary">Next</button>
                  <button id="cgf-submit" type="submit" class="modal-btn primary" hidden>Create group</button>
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
        if (!this._createGroupSubmitting) this._closeCreateGroupModal();
      });
      this.shadowRoot.querySelector("#create-group-backdrop").addEventListener("click", () => {
        if (!this._createGroupSubmitting) this._closeCreateGroupModal();
      });
      this.shadowRoot.querySelector("#create-group-form").addEventListener("submit", (event) => {
        event.preventDefault();
        // Form submit can fire from Enter on any input. Route to the wizard:
        // last step -> create the group, earlier steps -> advance.
        if (this._createGroupStep === 2) {
          this._submitCreateGroup();
        } else {
          this._goCreateGroupNext();
        }
      });
      this.shadowRoot.querySelector("#cgf-back").addEventListener("click", () => {
        if (!this._createGroupSubmitting) this._goCreateGroupBack();
      });
      this.shadowRoot.querySelector("#cgf-next").addEventListener("click", () => {
        if (!this._createGroupSubmitting) this._goCreateGroupNext();
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
      statusMsg.textContent = "Select the Lightener group you want to edit.";
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

  async _ensureEntityPickerLoaded() {
    if (customElements.get("ha-entity-picker")) return;
    try {
      if (typeof window.loadCardHelpers === "function") {
        await window.loadCardHelpers();
      }
    } catch (_) {}
    try {
      const cls = customElements.get("hui-entities-card");
      await cls?.getConfigElement?.();
    } catch (_) {}
    await Promise.race([
      customElements.whenDefined("ha-entity-picker"),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  }

  async _ensureAreaPickerLoaded() {
    if (customElements.get("ha-area-picker")) return;
    try {
      if (typeof window.loadCardHelpers === "function") {
        await window.loadCardHelpers();
      }
    } catch (_) {}
    try {
      const cls = customElements.get("hui-entities-card");
      await cls?.getConfigElement?.();
    } catch (_) {}
    await Promise.race([
      customElements.whenDefined("ha-area-picker"),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  }

  _openCreateGroupModal() {
    if (this._createGroupSubmitting) return;
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (!modal) return;
    // Bump the open-cycle token so any in-flight async picker render from a
    // prior open is rejected before it can append a stale picker into this
    // session's mount.
    this._createGroupOpenToken = (this._createGroupOpenToken || 0) + 1;
    this._createGroupSubmitting = false;
    this._createGroupSelectedLights = [];
    this._createGroupAreaId = null;
    this._createGroupStep = 0;
    // Track the highest step the user has reached so the indicator can
    // mark visited steps as "done" even after the user clicks Back.
    this._createGroupMaxStep = 0;
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    nameInput.value = "";
    const errorEl = this.shadowRoot.querySelector("#create-group-error");
    errorEl.hidden = true;
    errorEl.textContent = "";
    this._renderCreateGroupStep();
    this._setCreateGroupSubmitDisabled();
    modal.hidden = false;
    setTimeout(() => nameInput.focus(), 0);
  }

  _closeCreateGroupModal() {
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (modal) modal.hidden = true;
  }

  _renderCreateGroupStep() {
    const step = this._createGroupStep || 0;
    const root = this.shadowRoot;
    if (!root) return;
    // Toggle step panels.
    root.querySelectorAll(".modal-step").forEach((el) => {
      const elStep = Number(el.getAttribute("data-step"));
      el.hidden = elStep !== step;
    });
    // Update step indicator. "done" reflects the highest step ever visited,
    // so navigating Back doesn't visually undo the user's progress.
    const maxStep = Math.max(this._createGroupMaxStep || 0, step);
    this._createGroupMaxStep = maxStep;
    root.querySelectorAll("#cgf-step-indicator li").forEach((el) => {
      const elStep = Number(el.getAttribute("data-step"));
      el.classList.remove("active", "done");
      el.removeAttribute("aria-current");
      if (elStep === step) {
        el.classList.add("active");
        el.setAttribute("aria-current", "step");
      } else if (elStep <= maxStep) {
        el.classList.add("done");
      }
    });
    // Toggle action buttons.
    const backBtn = root.querySelector("#cgf-back");
    const nextBtn = root.querySelector("#cgf-next");
    const submitBtn = root.querySelector("#cgf-submit");
    if (backBtn) backBtn.hidden = step === 0;
    if (nextBtn) nextBtn.hidden = step === 2;
    if (submitBtn) submitBtn.hidden = step !== 2;
    // Bump the per-render token before kicking off async picker mounts.
    // This invalidates any in-flight render from a prior step change so
    // rapid Next/Back navigation can't append duplicate pickers into the
    // same mount once their lazy-load resolves.
    this._createGroupRenderToken = (this._createGroupRenderToken || 0) + 1;
    const renderToken = this._createGroupRenderToken;
    if (step === 1) {
      this._renderCreateGroupAreaPicker(this._createGroupOpenToken, renderToken);
    } else if (step === 2) {
      this._renderCreateGroupLightsPicker(this._createGroupOpenToken, renderToken);
    }
    this._setCreateGroupSubmitDisabled();
    // Move focus into the active step for keyboard users.
    if (step === 0) {
      const name = root.querySelector("#cgf-name");
      if (name) setTimeout(() => name.focus(), 0);
    }
  }

  _goCreateGroupNext() {
    const step = this._createGroupStep || 0;
    if (step >= 2) return;
    // Name is required to leave step 0 OR to advance from any later step
    // (e.g. user could have cleared the name input via Back navigation).
    // Validating on every Next keeps the contract symmetric with the submit
    // button, which is also gated on hasName.
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    const name = (nameInput?.value || "").trim();
    if (!name) {
      // Snap user back to the name step so they can fix it.
      this._createGroupStep = 0;
      this._renderCreateGroupStep();
      nameInput?.focus();
      return;
    }
    this._createGroupStep = step + 1;
    this._renderCreateGroupStep();
  }

  _goCreateGroupBack() {
    const step = this._createGroupStep || 0;
    if (step <= 0) return;
    this._createGroupStep = step - 1;
    this._renderCreateGroupStep();
  }

  async _renderCreateGroupAreaPicker(openToken = this._createGroupOpenToken, renderToken = this._createGroupRenderToken) {
    const mount = this.shadowRoot.querySelector("#cgf-area-mount");
    if (!mount) return;
    mount.innerHTML = "";
    await this._ensureAreaPickerLoaded();
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (
      openToken !== this._createGroupOpenToken ||
      renderToken !== this._createGroupRenderToken ||
      !this.shadowRoot.querySelector("#cgf-area-mount") ||
      !modal ||
      modal.hidden
    ) {
      return;
    }
    if (customElements.get("ha-area-picker")) {
      const picker = document.createElement("ha-area-picker");
      picker.hass = this._hass;
      picker.value = this._createGroupAreaId || "";
      picker.addEventListener("value-changed", (event) => {
        // Defensive: third-party HA forks have been observed to emit
        // event.detail.value as an object ({area_id, name}) instead of a
        // plain string. Coerce to string before trimming so we never throw.
        const rawValue = event.detail?.value;
        const id = typeof rawValue === "string" ? rawValue.trim() : "";
        this._createGroupAreaId = id || null;
      });
      mount.appendChild(picker);
    } else {
      // Fallback: HA never registered <ha-area-picker>. Skip the area step
      // gracefully — the user can still proceed without filtering.
      const note = document.createElement("p");
      note.className = "modal-hint";
      note.textContent = "Area picker unavailable — skip this step.";
      mount.appendChild(note);
    }
  }

  _lightenerEntityIds() {
    const ids = new Set();
    if (Array.isArray(this._lightenerEntities)) {
      for (const e of this._lightenerEntities) {
        if (e?.entity_id) ids.add(e.entity_id);
      }
    }
    return Array.from(ids);
  }

  async _loadCreateGroupEligibleLights(areaId) {
    if (!areaId || !this._hass?.callWS) return null;
    const result = await this._hass.callWS({
      type: "lightener/list_eligible_lights",
      area_id: areaId,
    });
    return Array.isArray(result?.entities) ? result.entities : [];
  }

  async _renderCreateGroupLightsPicker(openToken = this._createGroupOpenToken, renderToken = this._createGroupRenderToken) {
    const mount = this.shadowRoot.querySelector("#cgf-lights-mount");
    if (!mount) return;
    mount.innerHTML = "";
    const areaId = this._createGroupAreaId;
    let areaLights = null;
    await Promise.all([
      this._ensureEntityPickerLoaded(),
      (async () => {
        if (!areaId) return;
        try {
          areaLights = await this._loadCreateGroupEligibleLights(areaId);
        } catch (err) {
          console.warn(
            "[lightener] could not load area-filtered eligible lights; showing all lights.",
            err,
          );
        }
      })(),
    ]);
    // The mount stays in the DOM while the modal is hidden, so checking its
    // existence is not enough to detect a close-and-reopen during the warm-up.
    // Reject this render if the open-cycle token, the per-render token, or
    // the modal visibility has moved on. The render token guards against
    // rapid Next/Back navigation appending duplicate pickers into the mount.
    const modal = this.shadowRoot.querySelector("#create-group-modal");
    if (
      openToken !== this._createGroupOpenToken ||
      renderToken !== this._createGroupRenderToken ||
      !this.shadowRoot.querySelector("#cgf-lights-mount") ||
      !modal ||
      modal.hidden
    ) {
      return;
    }
    // Existing Lightener entities must not appear in the picker — selecting one
    // creates a recursive group that deadlocks the HA event loop. The backend
    // also enforces this; the client-side filter is for UX
    // clarity so the user never sees an invalid option.
    const excluded = this._lightenerEntityIds();
    // Honor backend area filtering even when it resolves to zero lights — show
    // an empty picker rather than silently widening to ALL lights.
    let picker;
    if (customElements.get("ha-entity-picker")) {
      picker = document.createElement("ha-entity-picker");
      picker.hass = this._hass;
      picker.includeDomains = ["light"];
      picker.allowCustomEntity = true;
      picker.value = "";
      if (excluded.length) picker.excludeEntities = excluded;
      if (areaLights !== null) {
        // areaLights is [] when the area genuinely has no lights — pass it
        // through so the picker accurately reflects "your area is empty"
        // instead of silently widening to every light.
        picker.includeEntities = areaLights.filter((id) => !excluded.includes(id));
      }
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
    } else {
      // Fallback: HA never registered ha-entity-picker. Use a plain input so
      // the user can still proceed by typing entity IDs by hand.
      console.warn(
        "[lightener] <ha-entity-picker> not available — falling back to plain input.",
      );
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.gap = "8px";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "light.entity_id";
      input.style.flex = "1";
      input.style.padding = "8px";
      input.style.borderRadius = "4px";
      input.style.border = "1px solid var(--divider-color, #ccc)";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = "Add";
      const commit = () => {
        const id = input.value.trim();
        if (!id) return;
        if (!this._createGroupSelectedLights.includes(id)) {
          this._createGroupSelectedLights.push(id);
          this._renderSelectedLights();
          this._setCreateGroupSubmitDisabled();
        }
        input.value = "";
        input.focus();
      };
      addBtn.addEventListener("click", commit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      });
      wrap.append(input, addBtn);
      picker = wrap;
    }
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
    const submitBtn = this.shadowRoot.querySelector("#cgf-submit");
    const nextBtn = this.shadowRoot.querySelector("#cgf-next");
    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    const hasName = !!(nameInput?.value || "").trim();
    const hasLights = this._createGroupSelectedLights.length > 0;
    if (submitBtn) {
      submitBtn.disabled = this._createGroupSubmitting || !hasName || !hasLights;
    }
    if (nextBtn) {
      // Next on step 0 requires a name; on step 1 (area) it's always enabled.
      const step = this._createGroupStep || 0;
      nextBtn.disabled = this._createGroupSubmitting || (step === 0 && !hasName);
    }
  }

  async _submitCreateGroup() {
    if (!this._hass || !this._hass.callApi || this._createGroupSubmitting) return;
    // Set submitting flag synchronously before any awaits to prevent double-click
    // races (TOCTOU between the check above and the API calls below).
    this._createGroupSubmitting = true;

    const nameInput = this.shadowRoot.querySelector("#cgf-name");
    const errorEl = this.shadowRoot.querySelector("#create-group-error");
    const submitBtn = this.shadowRoot.querySelector("#cgf-submit");
    const cancelBtn = this.shadowRoot.querySelector("#cgf-cancel");
    const backBtn = this.shadowRoot.querySelector("#cgf-back");
    const name = (nameInput?.value || "").trim();
    // Snapshot mutable modal state before any awaits — the user can keep
    // editing the lights list while the API calls are in flight.
    const selectedLights = [...this._createGroupSelectedLights];
    const areaId = this._createGroupAreaId || null;
    if (!name || selectedLights.length === 0) {
      this._createGroupSubmitting = false;
      return;
    }

    errorEl.hidden = true;
    errorEl.textContent = "";
    submitBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;
    if (backBtn) backBtn.disabled = true;
    submitBtn.textContent = "Creating…";

    let flowId = null;
    try {
      console.debug("[lightener] create-group: init", { name, lights: selectedLights, areaId });
      const init = await this._hass.callApi("POST", "config/config_entries/flow", {
        handler: "lightener",
        show_advanced_options: false,
      });
      flowId = init?.flow_id;
      let step = init;
      console.debug("[lightener] create-group: init result", step);
      if (!flowId || step?.type === "abort") {
        throw new Error(step?.reason || "Could not start config flow");
      }

      // Verify the flow init landed at the expected step before walking
      // forward. If a future backend reshuffle (e.g. step 4 of the unify
      // plan collapses these into a single redirect step) changes the
      // shape, this catches the mismatch before we POST a malformed body.
      this._assertFlowStep(init, "user", "Lightener config flow looks out of date — try refreshing the page");

      console.debug("[lightener] create-group: name step");
      step = await this._hass.callApi("POST", `config/config_entries/flow/${flowId}`, { name });
      console.debug("[lightener] create-group: name result", step);
      this._raiseFlowError(step, "Could not set group name");
      this._assertFlowStep(step, "area", "Could not set group name");

      console.debug("[lightener] create-group: area step", { areaId });
      const areaPayload = areaId ? { area_id: areaId } : {};
      step = await this._hass.callApi("POST", `config/config_entries/flow/${flowId}`, areaPayload);
      console.debug("[lightener] create-group: area result", step);
      this._raiseFlowError(step, "Could not apply area filter");
      this._assertFlowStep(step, "lights", "Could not apply area filter");

      console.debug("[lightener] create-group: lights step");
      step = await this._hass.callApi("POST", `config/config_entries/flow/${flowId}`, {
        controlled_entities: selectedLights,
      });
      console.debug("[lightener] create-group: lights result", step);

      if (step?.type !== "create_entry") {
        this._raiseFlowError(step, "Couldn't create group");
        throw new Error("Unexpected flow result");
      }
      // Flow consumed by create_entry — no abort needed.
      flowId = null;

      this._closeCreateGroupModal();
      await this._loadLightenerEntities();
      const newEntities = this._getEditorEntities();
      const newEntryId = step.result?.entry_id;
      const newEntity = newEntryId ? newEntities.find((e) => e.config_entry_id === newEntryId) : null;
      const fallback = newEntities.find((e) => e.name === (step.title || name)) || newEntities[newEntities.length - 1];
      const selected = newEntity || fallback;
      if (selected) {
        // If the current card has unsaved curve edits, route the switch through
        // the pending-switch flow so the user gets the save/discard guard.
        // Otherwise switch immediately.
        if (this._cardDirty && this._selectedEntity && selected.entity_id !== this._selectedEntity) {
          this._pendingEntity = selected.entity_id;
          this._renderPendingSwitch();
        } else {
          this._setSelectedEntity(selected.entity_id);
        }
      }
    } catch (err) {
      console.error("[Lightener] Create group failed:", err);
      errorEl.textContent = err?.message || "Couldn't create group — try again.";
      errorEl.hidden = false;
      // Abort the orphaned flow so HA doesn't accumulate stale flow_ids.
      if (flowId) {
        try {
          await this._hass.callApi("DELETE", `config/config_entries/flow/${flowId}`);
        } catch (abortErr) {
          // Best-effort cleanup; ignore.
        }
      }
    } finally {
      this._createGroupSubmitting = false;
      submitBtn.disabled = false;
      if (cancelBtn) cancelBtn.disabled = false;
      if (backBtn) backBtn.disabled = false;
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

  _assertFlowStep(step, expectedStepId, fallback) {
    // Defensive: confirm the backend advanced to the step we expect before
    // sending the next payload. Catches frontend/backend version skew where
    // the flow shape changed under us — without this, the next POST sends
    // valid-looking JSON to the wrong step and the user sees a misleading
    // error from the wrong layer.
    if (step?.type === "form" && step.step_id && step.step_id !== expectedStepId) {
      throw new Error(
        `${fallback} (expected step "${expectedStepId}", got "${step.step_id}")`
      );
    }
  }
}

customElements.define("lightener-editor-panel", LightenerEditorPanel);
