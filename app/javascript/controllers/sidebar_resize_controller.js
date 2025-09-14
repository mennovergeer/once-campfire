import { Controller } from "@hotwired/stimulus"

// Draggable resizer for the sidebar width. Works for both right and left sidebars.
export default class extends Controller {
  static targets = ["handle"]

  connect() {
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)

    // Initialize side and persisted width
    this.updateSide()
    this.applyPersistedWidth()
  }

  updateSide() {
    const sidebarRect = this.element.getBoundingClientRect()
    const main = document.getElementById("main-content")
    const mainRect = main ? main.getBoundingClientRect() : { left: 0 }
    // If sidebar is positioned to the left of main, it's a left sidebar
    this.side = sidebarRect.left < mainRect.left ? "left" : "right"

    // Position the handle on the boundary edge
    if (this.hasHandleTarget) {
      if (this.side === "left") {
        this.handleTarget.style.insetInlineStart = "auto"
        this.handleTarget.style.insetInlineEnd = "0"
      } else {
        this.handleTarget.style.insetInlineStart = "0"
        this.handleTarget.style.insetInlineEnd = "auto"
      }
    }
  }

  applyPersistedWidth() {
    const px = Number(window.localStorage.getItem(this.#storageKey()))
    const isActive = document.body.classList.contains("sidebar")
    if (isActive && px && Number.isFinite(px)) {
      document.body.style.setProperty("--sidebar-width", `${px}px`)
    } else {
      // Ensure we don't offset layouts that shouldn't have a sidebar
      document.body.style.removeProperty("--sidebar-width")
    }
  }

  // Pointer handlers
  startResize(event) {
    // Desktop/tablet only: ignore on small viewports
    if (window.matchMedia("(max-width: 100ch)").matches) return
    // Only when sidebar is active in layout
    if (!document.body.classList.contains("sidebar")) return

    this.updateSide()
    this.startX = event.clientX
    this.startWidth = this.element.getBoundingClientRect().width
    document.body.classList.add("is-resizing-sidebar")

    // Capture pointer across the window
    window.addEventListener("pointermove", this.onPointerMove)
    window.addEventListener("pointerup", this.onPointerUp, { once: true })
  }

  onPointerMove(event) {
    const dx = event.clientX - this.startX
    let nextWidth = this.side === "left" ? this.startWidth + dx : this.startWidth - dx

    // Clamp width
    const min = 220 // px
    const max = Math.max(320, Math.min(window.innerWidth * 0.7, 900))
    nextWidth = Math.max(min, Math.min(max, nextWidth))

    document.body.style.setProperty("--sidebar-width", `${Math.round(nextWidth)}px`)
  }

  onPointerUp() {
    window.removeEventListener("pointermove", this.onPointerMove)
    document.body.classList.remove("is-resizing-sidebar")

    // Persist width
    const width = getComputedStyle(document.body).getPropertyValue("--sidebar-width").trim()
    const px = parseFloat(width)
    if (Number.isFinite(px)) {
      window.localStorage.setItem(this.#storageKey(), String(Math.round(px)))
    }
  }

  #storageKey() {
    // Keyed by origin; could be extended with account identifier if needed
    return "campfire.sidebar.width"
  }
}
