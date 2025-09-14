import { Controller } from "@hotwired/stimulus"

// Adds/removes a predefined CSS snippet in the custom styles textarea
// to enable a Slack-style left sidebar on desktop while keeping mobile unchanged.
export default class extends Controller {
  static targets = ["textarea", "checkbox"]

  connect() {
    // Initialize toggle state based on presence of the snippet markers
    const hasSnippet = this.#currentValueIncludesSnippet() || this.#currentValueIncludesLegacy()
    if (this.hasCheckboxTarget) this.checkboxTarget.checked = hasSnippet
  }

  toggle(event) {
    const on = this.checkboxTarget.checked
    const current = this.#textareaValue()

    if (on) {
      let next = current
      // If legacy or old-version marked snippet exists, replace with latest
      if (this.#currentValueIncludesLegacy() || (this.#currentValueIncludesSnippet() && !this.#currentValueIsLatest())) {
        next = this.#removeLegacy(next)
        next = this.#removeMarked(next)
      }
      if (!this.#currentValueIncludesSnippet()) {
        const prefix = next.trim().length > 0 ? "\n\n" : ""
        this.#setTextareaValue(next + prefix + this.#snippet())
      }
    } else {
      // Remove both marked and legacy snippets, including surrounding blank lines
      let next = this.#removeMarked(current)
      next = this.#removeLegacy(next)
      next = next.replace(/\n{3,}/g, "\n\n").trimEnd()
      this.#setTextareaValue(next)
    }
  }

  // Private helpers
  #textareaValue() {
    return this.hasTextareaTarget ? this.textareaTarget.value : ""
  }

  #setTextareaValue(v) {
    if (this.hasTextareaTarget) this.textareaTarget.value = v
  }

  #currentValueIncludesSnippet() {
    const v = this.#textareaValue()
    return v.includes(this.#startMarker()) && v.includes(this.#endMarker())
  }

  #currentValueIncludesLegacy() {
    const v = this.#textareaValue()
    return v.includes("/* Slack-style left sidebar (desktop only) */")
  }

  #currentValueIsLatest() {
    const v = this.#textareaValue()
    return v.includes(this.#versionMarker())
  }

  #startMarker() {
    return "/* CAMPFIRE_LEFT_SIDEBAR_TOGGLE_START */"
  }

  #removeMarked(text) {
    const pattern = new RegExp(
      `\\n?\\s*${this.#escapeForRegex(this.#startMarker())}[\\s\\S]*?${this.#escapeForRegex(this.#endMarker())}\\s*\\n?`,
      "m"
    )
    return text.replace(pattern, "")
  }

  #removeLegacy(text) {
    const start = this.#escapeForRegex("/* Slack-style left sidebar (desktop only) */")
    const end = this.#escapeForRegex("/* Mobile is unchanged; the sidebar still slides in from the right */")
    const pattern = new RegExp(`\\n?\\s*${start}[\\s\\S]*?${end}\\s*\\n?`, "m")
    return text.replace(pattern, "")
  }

  #escapeForRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  #endMarker() {
    return "/* CAMPFIRE_LEFT_SIDEBAR_TOGGLE_END */"
  }

  #versionMarker() {
    return "/* CAMPFIRE_LEFT_SIDEBAR_TOGGLE_V2 */"
  }

  #snippet() {
    return `
${this.#startMarker()}
${this.#versionMarker()}
/* Slack-style left sidebar (desktop only) */
@media (min-width: 100ch) {
  /* Put the sidebar on the left when sidebar is active */
  body.sidebar {
    grid-template-areas:
      "sidebar nav"
      "sidebar main";
    grid-template-columns: var(--sidebar-width) 1fr;
  }

  /* Offset the top nav from the left sidebar instead of the right */
  body.sidebar #nav {
    inset-inline-end: auto !important;
    inset-inline-start: var(--sidebar-width) !important;
  }

  /* Keep a gutter on the right of the main content (mirrors original) */
  body.sidebar #main-content {
    margin-inline: 0 5vw !important;
  }

  /* Dock the sidebar tools to the left edge on desktop */
  body.sidebar .sidebar__tools {
    inset-inline-start: 0 !important;
    inset-inline-end: auto !important;
  }

  /* Move the Once logo to the lower-right when sidebar is on the left */
  body.sidebar #app-logo {
    inset: auto 0 0 auto !important;
  }

  /* When a center panel is present, hide sidebar and center content */
  body.sidebar:has(.panel) {
    grid-template-columns: 0 1fr !important;
  }
  body.sidebar:has(.panel) #nav {
    inset-inline-start: 0 !important;
    inset-inline-end: 0 !important;
  }
  body.sidebar:has(.panel) #main-content {
    margin-inline: 0 !important;
  }
  body.sidebar:has(.panel) #sidebar {
    display: none !important;
  }
  body.sidebar:has(.panel) [data-sidebar-resize-target="handle"] {
    display: none !important;
  }
}
/* Mobile is unchanged; the sidebar still slides in from the right */
${this.#endMarker()}`.trim()
  }
}
