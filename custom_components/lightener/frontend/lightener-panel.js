class LightenerEditorPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._selectedEntity = null;
    this._card = null;
    this._cardScriptPromise = null;
    this._lightenerEntities = null;
    this._loadingEntities = false;
    this._requestedConfigEntryId = null;
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

    if (!this._selectedEntity || !entities.some((e) => e.entity_id === this._selectedEntity)) {
      const saved = window.localStorage.getItem("lightener_editor_entity");
      if (saved && entities.some((e) => e.entity_id === saved)) {
        this._selectedEntity = saved;
      } else {
        this._selectedEntity = entities[0]?.entity_id ?? null;
      }
    }

    this._render();
    this._syncCard();
  }

  connectedCallback() {
    this._render();
  }

  _getFallbackEntities() {
    if (!this._hass || !this._hass.states) {
      return [];
    }
    return Object.keys(this._hass.states)
      .filter((entityId) => entityId.startsWith("light.") && this._hass.states[entityId]?.attributes?.entity_id)
      .map((entityId) => ({
        entity_id: entityId,
        name: this._hass.states[entityId].attributes.friendly_name || entityId,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
      this._cardScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/lightener/lightener-curve-card.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Could not load lightener-curve-card.js"));
        document.head.appendChild(script);
      });
    }
    await this._cardScriptPromise;
  }

  _clearCard() {
    const mount = this.shadowRoot.querySelector("#card-mount");
    if (mount) {
      mount.replaceChildren();
    }
    this._card = null;
  }

  async _syncCard() {
    if (!this._selectedEntity) {
      this._clearCard();
      return;
    }

    if (!this._hass) {
      return;
    }

    try {
      await this._ensureCardScriptLoaded();
    } catch (err) {
      const mount = this.shadowRoot.querySelector("#card-mount");
      if (mount) {
        mount.innerHTML = `<div class="error">Failed to load curve editor card. Check browser console.</div>`;
      }
      this._card = null;
      return;
    }

    const mount = this.shadowRoot.querySelector("#card-mount");
    if (!mount) {
      return;
    }

    if (!this._card) {
      this._card = document.createElement("lightener-curve-card");
      mount.replaceChildren(this._card);
    }

    this._card.setConfig({ type: "custom:lightener-curve-card", entity: this._selectedEntity });
    this._card.hass = this._hass;
  }

  _render() {
    const entities = this._getEditorEntities();

    // Build the DOM structure only once so that #card-mount and its contents
    // (the curve editor card) are never wiped on subsequent hass updates.
    if (!this.shadowRoot.querySelector("#entity-select")) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 16px;
            box-sizing: border-box;
          }
          .shell {
            max-width: 1100px;
            margin: 0 auto;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 1.35rem;
            line-height: 1.2;
          }
          p {
            margin: 0 0 12px;
            color: var(--secondary-text-color);
          }
          label {
            display: block;
            margin: 0 0 6px;
            font-size: 0.9rem;
            color: var(--secondary-text-color);
          }
          select {
            width: 100%;
            max-width: 720px;
            height: 40px;
            padding: 0 10px;
            border-radius: 8px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            margin-bottom: 16px;
          }
          .hint {
            font-size: 0.9rem;
            margin-bottom: 16px;
          }
          .error {
            color: var(--error-color);
          }
        </style>
        <div class="shell">
          <h1>Lightener Curve Editor</h1>
          <p>Pick a Lightener light entity and edit its curves directly here.</p>
          <label for="entity-select">Light entity</label>
          <select id="entity-select"></select>
          <div id="status-msg"></div>
          <div id="card-mount"></div>
        </div>
      `;

      this.shadowRoot.querySelector("#entity-select").addEventListener("change", (ev) => {
        this._selectedEntity = ev.target.value;
        window.localStorage.setItem("lightener_editor_entity", this._selectedEntity);
        this._syncCard();
      });
    }

    const select = this.shadowRoot.querySelector("#entity-select");
    const statusMsg = this.shadowRoot.querySelector("#status-msg");

    // Update select options in-place without touching #card-mount.
    select.innerHTML = "";
    if (entities.length) {
      select.disabled = false;
      entities.forEach((entity) => {
        const opt = document.createElement("option");
        opt.value = entity.entity_id;
        opt.textContent = `${entity.name} (${entity.entity_id})`;
        if (entity.entity_id === this._selectedEntity) opt.selected = true;
        select.appendChild(opt);
      });
      statusMsg.className = "hint";
      statusMsg.textContent = "Select the Lightener group entity you want to edit.";
    } else {
      select.disabled = true;
      statusMsg.className = "error";
      statusMsg.textContent = this._requestedConfigEntryId
        ? "No Lightener entity found for this integration entry."
        : "No Lightener entities found.";
    }
  }
}

customElements.define("lightener-editor-panel", LightenerEditorPanel);
