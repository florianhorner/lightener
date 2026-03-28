import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("curve-footer")
export class CurveFooter extends LitElement {
  @property({ type: Boolean }) dirty = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Boolean }) saving = false;

  static styles = css`
    :host {
      display: block;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 0 0;
      min-height: 36px;
    }
    .read-only {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--secondary-text, #9e9e9e);
      margin-right: auto;
    }
    .lock-icon {
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }
    .unsaved-label {
      font-size: 12px;
      color: var(--warning-color, #ffa726);
      margin-right: auto;
    }
    button {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      padding: 6px 16px;
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .btn-save {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    .btn-save:hover:not(:disabled) {
      opacity: 0.9;
    }
    .btn-cancel {
      background: transparent;
      color: var(--secondary-text, #9e9e9e);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    }
    .btn-cancel:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.06);
    }
  `;

  private _onSave() {
    this.dispatchEvent(
      new CustomEvent("save-curves", { bubbles: true, composed: true })
    );
  }

  private _onCancel() {
    this.dispatchEvent(
      new CustomEvent("cancel-curves", { bubbles: true, composed: true })
    );
  }

  render() {
    if (this.readOnly) {
      return html`
        <div class="footer">
          <div class="read-only">
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            View only
          </div>
        </div>
      `;
    }

    if (!this.dirty) return html`<div class="footer"></div>`;

    return html`
      <div class="footer">
        <span class="unsaved-label">Unsaved changes</span>
        <button class="btn-cancel"
          @click=${this._onCancel}
          ?disabled=${this.saving}>Cancel</button>
        <button class="btn-save"
          @click=${this._onSave}
          ?disabled=${this.saving}>
          ${this.saving ? "Saving..." : "Save"}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "curve-footer": CurveFooter;
  }
}
