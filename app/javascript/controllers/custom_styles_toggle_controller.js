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
      if (!this.#currentValueIncludesSnippet()) {
        // If legacy snippet exists, replace it with the marked snippet
        let next = current
        if (this.#currentValueIncludesLegacy()) {
          next = this.#removeLegacy(next)
        }
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

  #snippet() {
    return `
${this.#startMarker()}
/* Slack-style left sidebar (desktop only) */
@media (min-width: 100ch) {
  /* Put the sidebar on the left; keep nav on top */
  body {
    grid-template-areas:
      "sidebar nav"
      "sidebar main";
    grid-template-columns: var(--sidebar-width) 1fr;
  }

  /* Offset the top nav from the left sidebar instead of the right */
  #nav {
    inset-inline-end: auto !important;
    inset-inline-start: var(--sidebar-width) !important;
  }

  /* Keep a gutter on the right of the main content (mirrors original) */
  .sidebar #main-content {
    margin-inline: 0 5vw !important;
  }

  /* Dock the sidebar tools to the left edge on desktop */
  .sidebar .sidebar__tools {
    inset-inline-start: 0 !important;
    inset-inline-end: auto !important;
  }
}
/* Mobile is unchanged; the sidebar still slides in from the right */
${this.#endMarker()}`.trim()
  }
}
