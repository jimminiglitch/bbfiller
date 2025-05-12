/**
 * Enhanced Accessibility Features
 * Provides comprehensive accessibility improvements including keyboard navigation,
 * screen reader support, high contrast mode, and reduced motion options
 */

document.addEventListener("DOMContentLoaded", () => {
  // Wait for boot sequence to complete
  window.addEventListener("boot-sequence-complete", initEnhancedAccessibility)
})

function initEnhancedAccessibility() {
  // Initialize all accessibility features
  addKeyboardNavigation()
  addScreenReaderSupport()
  addHighContrastMode()
  addReducedMotionSupport()
  addAccessibilityMenu()
  addTooltips()
  addFocusIndicators()
  addSkipToContentLink()
}

// Add keyboard navigation
function addKeyboardNavigation() {
  // Make desktop icons focusable
  document.querySelectorAll(".desktop-icon").forEach((icon, index) => {
    icon.setAttribute("tabindex", "0")
    icon.setAttribute("role", "button")
    icon.setAttribute("aria-label", `Open ${icon.querySelector("span")?.textContent || "application"}`)

    // Add keyboard event listeners
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        icon.click()
      }
    })
  })

  // Add keyboard shortcuts for window management
  document.addEventListener("keydown", (e) => {
    // Alt+Tab to cycle through open windows
    if (e.altKey && e.key === "Tab") {
      e.preventDefault()
      cycleWindows(e.shiftKey)
    }

    // Escape to close active window
    if (e.key === "Escape") {
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const closeButton = activeWindow.querySelector(".close")
        if (closeButton) closeButton.click()
      }
    }

    // Alt+F4 to close active window
    if (e.altKey && e.key === "F4") {
      e.preventDefault()
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const closeButton = activeWindow.querySelector(".close")
        if (closeButton) closeButton.click()
      }
    }

    // Alt+Space to open window menu
    if (e.altKey && e.key === " ") {
      e.preventDefault()
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        showWindowMenu(activeWindow)
      }
    }

    // Alt+M to minimize active window
    if (e.altKey && e.key === "m") {
      e.preventDefault()
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const minimizeButton = activeWindow.querySelector(".minimize")
        if (minimizeButton) minimizeButton.click()
      }
    }

    // Alt+Enter to toggle maximize/restore active window
    if (e.altKey && e.key === "Enter") {
      e.preventDefault()
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const maximizeButton = activeWindow.querySelector(".maximize")
        if (maximizeButton) maximizeButton.click()
      }
    }

    // Alt+1, Alt+2, etc. to open windows from taskbar
    if (e.altKey && !isNaN(Number.parseInt(e.key)) && Number.parseInt(e.key) > 0) {
      e.preventDefault()
      const index = Number.parseInt(e.key) - 1
      const taskbarButtons = document.querySelectorAll(".taskbar-button")
      if (taskbarButtons[index]) {
        taskbarButtons[index].click()
      }
    }

    // Alt+S to open start menu
    if (e.altKey && e.key === "s") {
      e.preventDefault()
      toggleStartMenu()
    }

    // Alt+H to toggle high contrast mode
    if (e.altKey && e.key === "h") {
      e.preventDefault()
      toggleHighContrast()
    }

    // Alt+R to toggle reduced motion
    if (e.altKey && e.key === "r") {
      e.preventDefault()
      toggleReducedMotion()
    }

    // Alt+A to open accessibility menu
    if (e.altKey && e.key === "a") {
      e.preventDefault()
      toggleAccessibilityMenu()
    }
  })

  // Add keyboard navigation for start menu
  document.addEventListener("keydown", (e) => {
    const startMenu = document.getElementById("start-menu")
    if (!startMenu || startMenu.style.display !== "block") return

    if (e.key === "Escape") {
      // Close start menu
      startMenu.style.display = "none"
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()

      const menuItems = Array.from(startMenu.querySelectorAll("a"))
      const focusedItem = document.activeElement
      let index = menuItems.indexOf(focusedItem as HTMLElement)

      if (index === -1) {
        // No item focused, focus first or last
        index = e.key === "ArrowDown" ? 0 : menuItems.length - 1
      } else {
        // Move focus
        index =
          e.key === "ArrowDown" ? (index + 1) % menuItems.length : (index - 1 + menuItems.length) % menuItems.length
      }

      menuItems[index].focus()
    } else if (e.key === "Enter" || e.key === " ") {
      // Activate focused item
      const focusedItem = document.activeElement
      if (focusedItem && focusedItem.tagName === "A") {
        e.preventDefault()
        ;(focusedItem as HTMLElement).click()
      }
    }
  })

  // Add keyboard navigation for window content
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Home") {
      // Scroll to top of active window content
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const content = activeWindow.querySelector(".window-content")
        if (content) {
          content.scrollTop = 0
        }
      }
    } else if (e.ctrlKey && e.key === "End") {
      // Scroll to bottom of active window content
      const activeWindow = document.querySelector(".window-active")
      if (activeWindow) {
        const content = activeWindow.querySelector(".window-content")
        if (content) {
          content.scrollTop = content.scrollHeight
        }
      }
    }
  })
}

// Cycle through open windows
function cycleWindows(reverse = false) {
  const openWindows = Array.from(document.querySelectorAll(".popup-window:not(.hidden):not(.minimized)"))
  if (openWindows.length === 0) return

  const activeWindow = document.querySelector(".window-active")
  let nextIndex = 0

  if (activeWindow) {
    const currentIndex = openWindows.indexOf(activeWindow)
    if (reverse) {
      nextIndex = (currentIndex - 1 + openWindows.length) % openWindows.length
    } else {
      nextIndex = (currentIndex + 1) % openWindows.length
    }
  }

  // Bring next window to front
  const nextWindow = openWindows[nextIndex]
  if (nextWindow && window.windowManager) {
    window.windowManager.bringToFront(nextWindow)

    // Announce window change
    announceScreenReader(`Switched to ${nextWindow.querySelector(".window-header span")?.textContent || "window"}`)
  }
}

// Show window menu
function showWindowMenu(window) {
  // Create window menu if it doesn't exist
  let windowMenu = document.getElementById("window-menu")
  if (!windowMenu) {
    windowMenu = document.createElement("div")
    windowMenu.id = "window-menu"
    windowMenu.className = "window-menu"
    windowMenu.setAttribute("role", "menu")
    windowMenu.setAttribute("aria-label", "Window menu")
    document.body.appendChild(windowMenu)
    
    // Style the menu
    windowMenu.style.position = "absolute"
    windowMenu.style.background = "rgba(10, 15, 25, 0.95)"
    windowMenu.style.border = "2px solid #00f0ff"
    windowMenu.style.borderRadius = "8px"
    windowMenu.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.5)"
    windowMenu.style.padding = "5px 0"
    windowMenu.style.zIndex = "10002"
    windowMenu.style.backdropFilter = "blur(10px)"
  }
  
  // Clear existing menu items
  windowMenu.innerHTML = ""
  
  // Add menu items
  const menuItems = [
    { label: "Restore", action: "restore", disabled: !window.classList.contains("minimized") && !window.classList.contains("maximized") },
    { label: "Move", action: "move", disabled: window.classList.contains("maximized") },
    { label: "Size", action: "size", disabled: window.classList.contains("maximized") },
    { label: "Minimize", action: "minimize", disabled: window.classList.contains("minimized") },
    { label: "Maximize", action: "maximize", disabled: window.classList.contains("maximized") },
    { label: "Close", action: "close", disabled: false },
  ]
  
  menuItems.forEach((item) => {
    const menuItem = document.createElement("button")
    menuItem.className = "window-menu-item"
    menuItem.textContent = item.label
    menuItem.setAttribute("role", "menuitem")
    
    if (item.disabled) {
      menuItem.disabled = true
      menuItem.style.opacity = "0.5"
      menuItem.style.cursor = "default"
    } else {
      menuItem.addEventListener("click", () => {
        // Handle menu item action
        switch (item.action) {
          case "restore":
            if (window.classList.contains("minimized")) {
              window.windowManager.restoreWindow(window)
            } else if (window.classList.contains("maximized")) {
              window.windowManager.toggleMaximize(window)
            }
            break
          case "move":
            // Enable keyboard moving
            enableKeyboardMove(window)
            break
          case "size":
            // Enable keyboard resizing
            enableKeyboardResize(window)
            break
          case "minimize":
            window.windowManager.minimizeWindow(window)
            break
          case "maximize":
            window.windowManager.toggleMaximize(window)
            break
          case "close":
            window.windowManager.closeWindow(window)
            break
        }
        
        // Hide menu
        windowMenu.style.display = "none"
      })
    }
    
    // Style the menu item
    menuItem.style.display = "block"
    menuItem.style.width = "100%"
    menuItem.style.padding = "8px 15px"
    menuItem.style.textAlign = "left"
    menuItem.style.background =
