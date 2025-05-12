/**
 * Enhanced Window Manager
 * Provides advanced window management with physics-based dragging,
 * window snapping, and liquid-metal closing animations
 */

document.addEventListener("DOMContentLoaded", () => {
  // Wait for boot sequence to complete
  window.addEventListener("boot-sequence-complete", initEnhancedWindowManager)
})

function initEnhancedWindowManager() {
  // Store window states
  const windowStates = {}

  // Track active window
  let activeWindow = null

  // Track highest z-index
  let highestZIndex = 100

  // Initialize all windows
  document.querySelectorAll(".popup-window").forEach((window) => {
    initWindow(window)
  })

  // Initialize taskbar
  initTaskbar()

  // Initialize window
  function initWindow(window) {
    const id = window.id

    // Store initial state
    windowStates[id] = {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      size: { width: 600, height: 400 },
      velocity: { x: 0, y: 0 },
      prevSize: null,
      prevPosition: null,
    }

    // Set initial position and size
    window.style.left = `${windowStates[id].position.x}px`
    window.style.top = `${windowStates[id].position.y}px`
    window.style.width = `${windowStates[id].size.width}px`
    window.style.height = `${windowStates[id].size.height}px`
    window.style.zIndex = "10"

    // Add window-container class for animation targeting
    window.classList.add("window-container")

    // Make header draggable
    const header = window.querySelector(".window-header")
    if (header) {
      makeDraggable(window, header)

      // Double-click header to maximize/restore
      header.addEventListener("dblclick", () => {
        toggleMaximize(window)
      })
    }

    // Make window resizable
    makeResizable(window)

    // Add button event listeners
    const closeBtn = window.querySelector(".close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeWindow(window)
      })
    }

    const minimizeBtn = window.querySelector(".minimize")
    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        minimizeWindow(window)
      })
    }

    const maximizeBtn = window.querySelector(".maximize")
    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", () => {
        toggleMaximize(window)
      })
    }

    // Add click event to bring window to front
    window.addEventListener("mousedown", () => {
      bringToFront(window)
    })
  }

  // Make window draggable with physics
  function makeDraggable(window, handle) {
    let isDragging = false
    let startX, startY
    let startLeft, startTop
    let lastX, lastY
    let timestamp

    handle.addEventListener("mousedown", startDrag)
    handle.addEventListener("touchstart", startDrag, { passive: false })

    function startDrag(e) {
      e.preventDefault()

      // Don't drag if maximized
      if (windowStates[window.id].isMaximized) return

      isDragging = true

      // Get initial positions
      if (e.type === "touchstart") {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      } else {
        startX = e.clientX
        startY = e.clientY
      }

      startLeft = Number.parseInt(window.style.left) || 0
      startTop = Number.parseInt(window.style.top) || 0

      lastX = startX
      lastY = startY
      timestamp = Date.now()

      // Add move and end event listeners
      document.addEventListener("mousemove", drag)
      document.addEventListener("touchmove", drag, { passive: false })
      document.addEventListener("mouseup", endDrag)
      document.addEventListener("touchend", endDrag)

      // Add dragging class
      window.classList.add("dragging")

      // Bring window to front
      bringToFront(window)
    }

    function drag(e) {
      if (!isDragging) return
      e.preventDefault()

      let currentX, currentY

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX
        currentY = e.touches[0].clientY
      } else {
        currentX = e.clientX
        currentY = e.clientY
      }

      // Calculate new position
      const deltaX = currentX - startX
      const deltaY = currentY - startY

      let newLeft = startLeft + deltaX
      let newTop = startTop + deltaY

      // Calculate velocity for momentum
      const now = Date.now()
      const elapsed = now - timestamp

      if (elapsed > 0) {
        windowStates[window.id].velocity.x = ((currentX - lastX) / elapsed) * 20
        windowStates[window.id].velocity.y = ((currentY - lastY) / elapsed) * 20
      }

      lastX = currentX
      lastY = currentY
      timestamp = now

      // Apply window snapping
      const snapDistance = 20
      const windowWidth = Number.parseInt(window.style.width)
      const windowHeight = Number.parseInt(window.style.height)

      // Snap to screen edges
      if (newLeft < snapDistance) newLeft = 0
      if (newTop < snapDistance) newTop = 0
      if (newLeft + windowWidth > window.innerWidth - snapDistance) {
        newLeft = window.innerWidth - windowWidth
      }
      if (newTop + windowHeight > window.innerHeight - snapDistance) {
        newTop = window.innerHeight - windowHeight
      }

      // Update position
      window.style.left = `${newLeft}px`
      window.style.top = `${newTop}px`

      // Update stored position
      windowStates[window.id].position.x = newLeft
      windowStates[window.id].position.y = newTop
    }

    function endDrag() {
      if (!isDragging) return

      isDragging = false

      // Remove event listeners
      document.removeEventListener("mousemove", drag)
      document.removeEventListener("touchmove", drag)
      document.removeEventListener("mouseup", endDrag)
      document.removeEventListener("touchend", endDrag)

      // Remove dragging class
      window.classList.remove("dragging")

      // Apply momentum
      applyMomentum(window)
    }
  }

  // Apply momentum after dragging
  function applyMomentum(window) {
    const id = window.id
    const velocity = windowStates[id].velocity

    // If velocity is too low, don't apply momentum
    if (Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5) return

    const friction = 0.95
    const position = windowStates[id].position

    function animate() {
      // Apply friction
      velocity.x *= friction
      velocity.y *= friction

      // Update position
      position.x += velocity.x
      position.y += velocity.y

      // Apply bounds
      const windowWidth = Number.parseInt(window.style.width)
      const windowHeight = Number.parseInt(window.style.height)

      if (position.x < 0) {
        position.x = 0
        velocity.x = -velocity.x * 0.5 // Bounce
      }

      if (position.y < 0) {
        position.y = 0
        velocity.y = -velocity.y * 0.5 // Bounce
      }

      if (position.x + windowWidth > window.innerWidth) {
        position.x = window.innerWidth - windowWidth
        velocity.x = -velocity.x * 0.5 // Bounce
      }

      if (position.y + windowHeight > window.innerHeight) {
        position.y = window.innerHeight - windowHeight
        velocity.y = -velocity.y * 0.5 // Bounce
      }

      // Update window position
      window.style.left = `${position.x}px`
      window.style.top = `${position.y}px`

      // Continue animation if velocity is still significant
      if (Math.abs(velocity.x) > 0.2 || Math.abs(velocity.y) > 0.2) {
        requestAnimationFrame(animate)
      }
    }

    // Start animation
    requestAnimationFrame(animate)
  }

  // Make window resizable
  function makeResizable(window) {
    const id = window.id
    const resizeHandleSize = 10

    // Create resize handles
    const handles = [
      { position: "n", cursor: "ns-resize" },
      { position: "e", cursor: "ew-resize" },
      { position: "s", cursor: "ns-resize" },
      { position: "w", cursor: "ew-resize" },
      { position: "ne", cursor: "ne-resize" },
      { position: "se", cursor: "se-resize" },
      { position: "sw", cursor: "sw-resize" },
      { position: "nw", cursor: "nw-resize" },
    ]

    handles.forEach((handle) => {
      const div = document.createElement("div")
      div.className = `resize-handle resize-${handle.position}`
      div.style.position = "absolute"
      div.style.zIndex = "1000"

      // Set position and size based on handle position
      switch (handle.position) {
        case "n":
          div.style.top = "0"
          div.style.left = resizeHandleSize + "px"
          div.style.right = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
        case "e":
          div.style.top = resizeHandleSize + "px"
          div.style.right = "0"
          div.style.bottom = resizeHandleSize + "px"
          div.style.width = resizeHandleSize + "px"
          break
        case "s":
          div.style.bottom = "0"
          div.style.left = resizeHandleSize + "px"
          div.style.right = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
        case "w":
          div.style.top = resizeHandleSize + "px"
          div.style.left = "0"
          div.style.bottom = resizeHandleSize + "px"
          div.style.width = resizeHandleSize + "px"
          break
        case "ne":
          div.style.top = "0"
          div.style.right = "0"
          div.style.width = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
        case "se":
          div.style.bottom = "0"
          div.style.right = "0"
          div.style.width = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
        case "sw":
          div.style.bottom = "0"
          div.style.left = "0"
          div.style.width = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
        case "nw":
          div.style.top = "0"
          div.style.left = "0"
          div.style.width = resizeHandleSize + "px"
          div.style.height = resizeHandleSize + "px"
          break
      }

      div.style.cursor = handle.cursor

      // Add resize functionality
      div.addEventListener("mousedown", (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Don't resize if maximized
        if (windowStates[id].isMaximized) return

        // Bring window to front
        bringToFront(window)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = Number.parseInt(window.style.width)
        const startHeight = Number.parseInt(window.style.height)
        const startLeft = Number.parseInt(window.style.left)
        const startTop = Number.parseInt(window.style.top)

        // Add resize class
        window.classList.add("resizing")

        function resize(e) {
          e.preventDefault()

          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY

          let newWidth = startWidth
          let newHeight = startHeight
          let newLeft = startLeft
          let newTop = startTop

          // Resize based on handle position
          switch (handle.position) {
            case "n":
              newHeight = startHeight - deltaY
              newTop = startTop + deltaY
              break
            case "e":
              newWidth = startWidth + deltaX
              break
            case "s":
              newHeight = startHeight + deltaY
              break
            case "w":
              newWidth = startWidth - deltaX
              newLeft = startLeft + deltaX
              break
            case "ne":
              newWidth = startWidth + deltaX
              newHeight = startHeight - deltaY
              newTop = startTop + deltaY
              break
            case "se":
              newWidth = startWidth + deltaX
              newHeight = startHeight + deltaY
              break
            case "sw":
              newWidth = startWidth - deltaX
              newHeight = startHeight + deltaY
              newLeft = startLeft + deltaX
              break
            case "nw":
              newWidth = startWidth - deltaX
              newHeight = startHeight - deltaY
              newLeft = startLeft + deltaX
              newTop = startTop + deltaY
              break
          }

          // Apply minimum size
          const minWidth = 200
          const minHeight = 150

          if (newWidth < minWidth) {
            newWidth = minWidth
            if (handle.position.includes("w")) {
              newLeft = startLeft + (startWidth - minWidth)
            }
          }

          if (newHeight < minHeight) {
            newHeight = minHeight
            if (handle.position.includes("n")) {
              newTop = startTop + (startHeight - minHeight)
            }
          }

          // Update window size and position
          window.style.width = `${newWidth}px`
          window.style.height = `${newHeight}px`
          window.style.left = `${newLeft}px`
          window.style.top = `${newTop}px`

          // Update stored size and position
          windowStates[id].size.width = newWidth
          windowStates[id].size.height = newHeight
          windowStates[id].position.x = newLeft
          windowStates[id].position.y = newTop
        }

        function stopResize() {
          document.removeEventListener("mousemove", resize)
          document.removeEventListener("mouseup", stopResize)

          // Remove resize class
          window.classList.remove("resizing")
        }

        document.addEventListener("mousemove", resize)
        document.addEventListener("mouseup", stopResize)
      })

      window.appendChild(div)
    })
  }

  // Open window
  function openWindow(id) {
    const window = document.getElementById(id)
    if (!window) return

    // If window is already open but minimized, restore it
    if (windowStates[id].isOpen && windowStates[id].isMinimized) {
      restoreWindow(window)
      return
    }

    // If window is already open, just bring it to front
    if (windowStates[id].isOpen) {
      bringToFront(window)
      return
    }

    // Update state
    windowStates[id].isOpen = true
    windowStates[id].isMinimized = false

    // Show window
    window.classList.remove("hidden")

    // Add opening animation
    window.style.transform = "scale(0.9)"
    window.style.opacity = "0"

    // Trigger reflow
    window.offsetHeight

    // Apply animation
    window.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out"
    window.style.transform = "scale(1)"
    window.style.opacity = "1"

    // Bring to front
    bringToFront(window)

    // Add to taskbar
    addToTaskbar(id)

    // Play open sound
    playSound("open")

    // Reset transition after animation completes
    setTimeout(() => {
      window.style.transition = ""
    }, 300)
  }

  // Close window with liquid-metal animation
  function closeWindow(window) {
    const id = window.id

    // Update state
    windowStates[id].isOpen = false
    windowStates[id].isMinimized = false

    // Create closing animation
    const rect = window.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Create animation overlay
    const overlay = document.createElement("div")
    overlay.className = "close-animation"
    overlay.style.position = "fixed"
    overlay.style.left = `${rect.left}px`
    overlay.style.top = `${rect.top}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
    overlay.style.borderRadius = "8px"
    overlay.style.background = "linear-gradient(135deg, #00f0ff, #0070ff)"
    overlay.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.7)"
    overlay.style.zIndex = window.style.zIndex
    overlay.style.opacity = "0.8"

    document.body.appendChild(overlay)

    // Hide original window
    window.classList.add("hidden")

    // Animate overlay
    overlay.animate(
      [
        {
          transform: "scale(1)",
          borderRadius: "8px",
          opacity: 0.8,
        },
        {
          transform: "scale(0.5)",
          borderRadius: "50%",
          opacity: 0,
        },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    ).onfinish = () => {
      overlay.remove()

      // Remove from taskbar
      removeFromTaskbar(id)
    }

    // Play close sound
    playSound("close")
  }

  // Minimize window
  function minimizeWindow(window) {
    const id = window.id

    // Update state
    windowStates[id].isMinimized = true

    // Get taskbar button position for animation
    const taskbarButton = document.querySelector(`.taskbar-button[data-window="${id}"]`)
    const buttonRect = taskbarButton ? taskbarButton.getBoundingClientRect() : null

    // Create animation
    if (buttonRect) {
      const windowRect = window.getBoundingClientRect()

      // Animate window to taskbar button
      window.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out"
      window.style.transformOrigin = "center bottom"
      window.style.transform = `
        translate(
          ${buttonRect.left - windowRect.left + (buttonRect.width / 2) - windowRect.width / 2}px,
          ${buttonRect.top - windowRect.top}px
        )
        scale(0.1)
      `
      window.style.opacity = "0"

      // After animation, hide window
      setTimeout(() => {
        window.classList.add("minimized")
        window.style.transform = ""
        window.style.opacity = ""
        window.style.transition = ""
      }, 300)
    } else {
      // Fallback if button not found
      window.classList.add("minimized")
    }

    // Update taskbar button
    if (taskbarButton) {
      taskbarButton.classList.remove("active")
    }

    // Update active window
    if (activeWindow === window) {
      activeWindow = null
    }

    // Play minimize sound
    playSound("minimize")
  }

  // Restore minimized window
  function restoreWindow(window) {
    const id = window.id

    // Update state
    windowStates[id].isMinimized = false

    // Show window
    window.classList.remove("minimized")

    // Add restore animation
    window.style.transform = "scale(0.9)"
    window.style.opacity = "0"

    // Trigger reflow
    window.offsetHeight

    // Apply animation
    window.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out"
    window.style.transform = "scale(1)"
    window.style.opacity = "1"

    // Bring to front
    bringToFront(window)

    // Update taskbar button
    const taskbarButton = document.querySelector(`.taskbar-button[data-window="${id}"]`)
    if (taskbarButton) {
      taskbarButton.classList.add("active")
    }

    // Play restore sound
    playSound("restore")

    // Reset transition after animation completes
    setTimeout(() => {
      window.style.transition = ""
    }, 300)
  }

  // Toggle maximize/restore
  function toggleMaximize(window) {
    const id = window.id

    if (windowStates[id].isMaximized) {
      // Restore window
      const prevSize = windowStates[id].prevSize
      const prevPosition = windowStates[id].prevPosition

      if (prevSize && prevPosition) {
        window.style.width = `${prevSize.width}px`
        window.style.height = `${prevSize.height}px`
        window.style.left = `${prevPosition.x}px`
        window.style.top = `${prevPosition.y}px`

        // Update state
        windowStates[id].size = { ...prevSize }
        windowStates[id].position = { ...prevPosition }
        windowStates[id].isMaximized = false

        // Update maximize button icon
        const maximizeBtn = window.querySelector(".maximize")
        if (maximizeBtn) {
          maximizeBtn.textContent = "▭"
        }
      }
    } else {
      // Save current size and position
      windowStates[id].prevSize = { ...windowStates[id].size }
      windowStates[id].prevPosition = { ...windowStates[id].position }

      // Calculate available space (accounting for taskbar)
      const taskbarHeight = document.getElementById("start-bar")?.offsetHeight || 40

      // Maximize window
      window.style.width = `${window.innerWidth}px`
      window.style.height = `${window.innerHeight - taskbarHeight}px`
      window.style.left = "0"
      window.style.top = "0"

      // Update state
      windowStates[id].size = {
        width: window.innerWidth,
        height: window.innerHeight - taskbarHeight,
      }
      windowStates[id].position = { x: 0, y: 0 }
      windowStates[id].isMaximized = true

      // Update maximize button icon
      const maximizeBtn = window.querySelector(".maximize")
      if (maximizeBtn) {
        maximizeBtn.textContent = "❐"
      }
    }
  }

  // Bring window to front
  function bringToFront(window) {
    const id = window.id

    // Skip if already active
    if (activeWindow === window) return

    // Update z-index
    highestZIndex += 1
    window.style.zIndex = highestZIndex

    // Update active window
    if (activeWindow) {
      activeWindow.classList.remove("window-active")

      // Update taskbar button
      const prevId = activeWindow.id
      const prevButton = document.querySelector(`.taskbar-button[data-window="${prevId}"]`)
      if (prevButton) {
        prevButton.classList.remove("active")
      }
    }

    activeWindow = window
    window.classList.add("window-active")

    // Update taskbar button
    const taskbarButton = document.querySelector(`.taskbar-button[data-window="${id}"]`)
    if (taskbarButton) {
      taskbarButton.classList.add("active")
    }
  }

  // Initialize taskbar
  function initTaskbar() {
    const taskbarIcons = document.getElementById("taskbar-icons")
    if (!taskbarIcons) return

    // Clear existing icons
    taskbarIcons.innerHTML = ""
  }

  // Add window to taskbar
  function addToTaskbar(id) {
    const taskbarIcons = document.getElementById("taskbar-icons")
    if (!taskbarIcons) return

    // Skip if already in taskbar
    if (document.querySelector(`.taskbar-button[data-window="${id}"]`)) return

    const window = document.getElementById(id)
    if (!window) return

    // Get window title and icon
    const titleEl = window.querySelector(".window-header span")
    const title = titleEl ? titleEl.textContent : id

    // Create taskbar button
    const button = document.createElement("button")
    button.className = "taskbar-button"
    button.dataset.window = id
    button.innerHTML = `<span>${title}</span>`

    // Add active class if window is active
    if (activeWindow === window) {
      button.classList.add("active")
    }

    // Add click handler
    button.addEventListener("click", () => {
      const window = document.getElementById(id)

      if (windowStates[id].isMinimized) {
        restoreWindow(window)
      } else if (activeWindow === window) {
        minimizeWindow(window)
      } else {
        bringToFront(window)
      }
    })

    // Add to taskbar
    taskbarIcons.appendChild(button)

    // Add taskbar animation
    button.style.transform = "scale(0)"

    // Trigger reflow
    button.offsetHeight

    // Apply animation
    button.style.transition = "transform 0.2s ease-out"
    button.style.transform = "scale(1)"

    // Reset transition after animation completes
    setTimeout(() => {
      button.style.transition = ""
    }, 200)
  }

  // Remove window from taskbar
  function removeFromTaskbar(id) {
    const button = document.querySelector(`.taskbar-button[data-window="${id}"]`)
    if (!button) return

    // Add remove animation
    button.style.transition = "transform 0.2s ease-in, opacity 0.2s ease-in"
    button.style.transform = "scale(0)"
    button.style.opacity = "0"

    // Remove after animation
    setTimeout(() => {
      button.remove()
    }, 200)
  }

  // Play window sound
  function playSound(type) {
    // Check if audio is muted
    if (localStorage.getItem("soundsMuted") === "true") return

    const audio = new Audio(`/audio/window-${type}.mp3`)
    audio.volume = 0.5
    audio.play().catch((error) => {
      console.error(`Error playing ${type} sound:`, error)
    })
  }

  // Expose window manager functions globally
  window.windowManager = {
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    bringToFront,
  }
}
