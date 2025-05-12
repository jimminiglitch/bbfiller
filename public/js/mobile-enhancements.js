/**
 * Enhanced mobile experience for bbfiller
 * Provides touch-friendly interactions and responsive adjustments
 */

document.addEventListener("DOMContentLoaded", () => {
  // Wait for boot sequence to complete
  window.addEventListener("boot-sequence-complete", initMobileEnhancements)
})

function initMobileEnhancements() {
  // Check if device is mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768

  if (isMobile) {
    addMobileStyles()
    addTouchInteractions()
    optimizeForMobile()
  }

  // Add responsive listener for orientation changes
  window.addEventListener("resize", handleResize)
}

// Add mobile-specific styles
function addMobileStyles() {
  const mobileStyles = document.createElement("style")
  mobileStyles.id = "mobile-enhancements"
  mobileStyles.textContent = `
    /* Increase tap target sizes */
    .desktop-icon {
      width: 80px;
      height: 80px;
      margin: 15px;
    }
    
    .icon-img {
      width: 48px;
      height: 48px;
    }
    
    .icon-label {
      font-size: 14px;
    }
    
    /* Adjust window controls for touch */
    .window-title-bar {
      height: 40px;
    }
    
    .window-control {
      width: 30px;
      height: 30px;
      margin-left: 8px;
    }
    
    /* Adjust taskbar for mobile */
    .taskbar {
      height: 50px;
    }
    
    .taskbar-button {
      height: 40px;
      padding: 0 12px;
    }
    
    /* Add mobile-specific scrolling */
    .window-content {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Optimize forms for mobile */
    input, select, textarea, button {
      font-size: 16px; /* Prevents zoom on focus in iOS */
      padding: 10px;
    }
    
    /* Add pull-to-refresh indicator */
    .pull-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: #00f0ff;
      font-family: 'VT323', monospace;
      transform: translateY(-100%);
      transition: transform 0.3s;
      z-index: 9999;
    }
    
    /* Mobile menu button */
    .mobile-menu-button {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #00f0ff;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: pointer;
    }
    
    .mobile-menu-button span {
      display: block;
      width: 20px;
      height: 2px;
      background: #00f0ff;
      margin: 2px 0;
      transition: all 0.3s;
    }
    
    .mobile-menu-button.active span:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }
    
    .mobile-menu-button.active span:nth-child(2) {
      opacity: 0;
    }
    
    .mobile-menu-button.active span:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }
    
    /* Mobile menu */
    .mobile-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 250px;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s;
      border-left: 2px solid #00f0ff;
      box-shadow: -5px 0 15px rgba(0, 240, 255, 0.3);
      padding: 60px 20px 20px;
      overflow-y: auto;
    }
    
    .mobile-menu.active {
      transform: translateX(0);
    }
    
    .mobile-menu-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 240, 255, 0.3);
      color: #fff;
      font-family: 'VT323', monospace;
      font-size: 18px;
      cursor: pointer;
    }
    
    .mobile-menu-item img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }
    
    /* Fullscreen button */
    .fullscreen-button {
      position: fixed;
      top: 10px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #00f0ff;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      cursor: pointer;
    }
    
    .fullscreen-button svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: #00f0ff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `

  document.head.appendChild(mobileStyles)

  // Add mobile indicator class to body
  document.body.classList.add("mobile-device")
}

// Add touch-friendly interactions
function addTouchInteractions() {
  // Add mobile menu button
  const menuButton = document.createElement("div")
  menuButton.classList.add("mobile-menu-button")
  menuButton.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `
  document.body.appendChild(menuButton)

  // Add mobile menu
  const mobileMenu = document.createElement("div")
  mobileMenu.classList.add("mobile-menu")
  document.body.appendChild(mobileMenu)

  // Populate menu with desktop icons
  const desktopIcons = document.querySelectorAll(".desktop-icon")
  desktopIcons.forEach((icon) => {
    const iconImg = icon.querySelector(".icon-img")
    const iconLabel = icon.querySelector(".icon-label")

    if (iconImg && iconLabel) {
      const menuItem = document.createElement("div")
      menuItem.classList.add("mobile-menu-item")
      menuItem.innerHTML = `
        <img src="${iconImg.getAttribute("src")}" alt="">
        <span>${iconLabel.textContent}</span>
      `

      // Add click handler
      menuItem.addEventListener("click", () => {
        icon.click()
        toggleMobileMenu(false)
      })

      mobileMenu.appendChild(menuItem)
    }
  })

  // Toggle menu on button click
  menuButton.addEventListener("click", () => {
    toggleMobileMenu()
  })

  // Add fullscreen button
  const fullscreenButton = document.createElement("div")
  fullscreenButton.classList.add("fullscreen-button")
  fullscreenButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  `
  document.body.appendChild(fullscreenButton)

  // Toggle fullscreen on button click
  fullscreenButton.addEventListener("click", toggleFullscreen)

  // Add pull-to-refresh indicator
  const pullIndicator = document.createElement("div")
  pullIndicator.classList.add("pull-indicator")
  pullIndicator.textContent = "Pull down to refresh"
  document.body.appendChild(pullIndicator)

  // Add touch gestures for windows
  addWindowTouchGestures()

  // Add swipe navigation for galleries
  addGallerySwipeSupport()
}

// Toggle mobile menu
function toggleMobileMenu(force) {
  const menuButton = document.querySelector(".mobile-menu-button")
  const mobileMenu = document.querySelector(".mobile-menu")

  if (!menuButton || !mobileMenu) return

  const newState = force !== undefined ? force : !menuButton.classList.contains("active")

  if (newState) {
    menuButton.classList.add("active")
    mobileMenu.classList.add("active")
  } else {
    menuButton.classList.remove("active")
    mobileMenu.classList.remove("active")
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// Add touch gestures for windows
function addWindowTouchGestures() {
  // Track touch positions
  let touchStartX = 0
  let touchStartY = 0
  let touchTimeStart = 0

  // Add event listeners to window title bars
  document.addEventListener(
    "touchstart",
    (e) => {
      const titleBar = e.target.closest(".window-title-bar")
      if (!titleBar) return

      const window = titleBar.closest(".popup-window")
      if (!window) return

      // Record start position
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchTimeStart = Date.now()

      // Bring window to front
      window.style.zIndex = getHighestZIndex() + 1
    },
    { passive: true },
  )

  document.addEventListener(
    "touchend",
    (e) => {
      const titleBar = e.target.closest(".window-title-bar")
      if (!titleBar) return

      const window = titleBar.closest(".popup-window")
      if (!window) return

      // Calculate touch duration and distance
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchDuration = Date.now() - touchTimeStart

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      // Detect swipe down to minimize
      if (deltaY > 100 && Math.abs(deltaX) < 50 && touchDuration < 300) {
        const minimizeBtn = window.querySelector(".window-minimize")
        if (minimizeBtn) minimizeBtn.click()
      }

      // Detect swipe up to maximize
      if (deltaY < -100 && Math.abs(deltaX) < 50 && touchDuration < 300) {
        // Toggle maximize
        if (window.classList.contains("maximized")) {
          window.classList.remove("maximized")
          window.style.width = window.dataset.prevWidth || "600px"
          window.style.height = window.dataset.prevHeight || "400px"
          window.style.top = window.dataset.prevTop || "50px"
          window.style.left = window.dataset.prevLeft || "50px"
        } else {
          // Save current dimensions
          window.dataset.prevWidth = window.style.width
          window.dataset.prevHeight = window.style.height
          window.dataset.prevTop = window.style.top
          window.dataset.prevLeft = window.style.left

          // Maximize
          window.classList.add("maximized")
          window.style.width = "100%"
          window.style.height = "calc(100% - 50px)" // Account for taskbar
          window.style.top = "0"
          window.style.left = "0"
        }
      }

      // Detect swipe left to close
      if (deltaX < -100 && Math.abs(deltaY) < 50 && touchDuration < 300) {
        const closeBtn = window.querySelector(".window-close")
        if (closeBtn) closeBtn.click()
      }
    },
    { passive: true },
  )

  // Double tap to maximize
  document.addEventListener(
    "touchend",
    (e) => {
      const titleBar = e.target.closest(".window-title-bar")
      if (!titleBar) return

      if (titleBar.dataset.lastTap && Date.now() - titleBar.dataset.lastTap < 300) {
        // Double tap detected
        const window = titleBar.closest(".popup-window")
        if (window) {
          // Toggle maximize
          if (window.classList.contains("maximized")) {
            window.classList.remove("maximized")
            window.style.width = window.dataset.prevWidth || "600px"
            window.style.height = window.dataset.prevHeight || "400px"
            window.style.top = window.dataset.prevTop || "50px"
            window.style.left = window.dataset.prevLeft || "50px"
          } else {
            // Save current dimensions
            window.dataset.prevWidth = window.style.width
            window.dataset.prevHeight = window.style.height
            window.dataset.prevTop = window.style.top
            window.dataset.prevLeft = window.style.left

            // Maximize
            window.classList.add("maximized")
            window.style.width = "100%"
            window.style.height = "calc(100% - 50px)" // Account for taskbar
            window.style.top = "0"
            window.style.left = "0"
          }
        }

        titleBar.dataset.lastTap = null
      } else {
        titleBar.dataset.lastTap = Date.now()
      }
    },
    { passive: true },
  )
}

// Add swipe navigation for galleries
function addGallerySwipeSupport() {
  // Find gallery containers
  const galleries = document.querySelectorAll(".gallery-container, .image-gallery, .project-gallery")

  galleries.forEach((gallery) => {
    let touchStartX = 0
    let touchStartY = 0

    gallery.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      },
      { passive: true },
    )

    gallery.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].clientX
        const touchEndY = e.changedTouches[0].clientY

        const deltaX = touchEndX - touchStartX
        const deltaY = touchEndY - touchStartY

        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            // Swipe right - previous
            const prevBtn = gallery.querySelector(".gallery-prev, .prev-button")
            if (prevBtn) prevBtn.click()
          } else {
            // Swipe left - next
            const nextBtn = gallery.querySelector(".gallery-next, .next-button")
            if (nextBtn) nextBtn.click()
          }
        }
      },
      { passive: true },
    )
  })
}

// Optimize for mobile
function optimizeForMobile() {
  // Adjust window positions for mobile
  document.querySelectorAll(".popup-window").forEach((window) => {
    // Set default position in the center
    window.style.top = "50%"
    window.style.left = "50%"
    window.style.transform = "translate(-50%, -50%)"

    // Make windows take more screen space on mobile
    window.style.width = "90%"
    window.style.height = "70%"

    // Add mobile class for additional styling
    window.classList.add("mobile-window")
  })

  // Optimize desktop layout
  const desktop = document.querySelector(".desktop")
  if (desktop) {
    // Arrange icons in a grid that fits mobile screen
    const icons = desktop.querySelectorAll(".desktop-icon")
    const iconWidth = 80 // Width from mobile styles
    const iconMargin = 15 // Margin from mobile styles
    const iconsPerRow = Math.floor(window.innerWidth / (iconWidth + iconMargin * 2))

    icons.forEach((icon, index) => {
      const row = Math.floor(index / iconsPerRow)
      const col = index % iconsPerRow

      icon.style.position = "absolute"
      icon.style.top = `${row * (iconWidth + iconMargin * 2) + 20}px`
      icon.style.left = `${col * (iconWidth + iconMargin * 2) + (window.innerWidth - iconsPerRow * (iconWidth + iconMargin * 2)) / 2}px`
    })
  }

  // Optimize forms for mobile
  document.querySelectorAll("input, select, textarea").forEach((input) => {
    input.classList.add("mobile-input")
  })

  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement("meta")
    viewportMeta.name = "viewport"
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    document.head.appendChild(viewportMeta)
  }
}

// Handle resize and orientation changes
function handleResize() {
  const isMobile = window.innerWidth < 768

  if (isMobile) {
    if (!document.body.classList.contains("mobile-device")) {
      document.body.classList.add("mobile-device")
      addMobileStyles()
      addTouchInteractions()
      optimizeForMobile()
    } else {
      // Just re-optimize layout
      optimizeForMobile()
    }
  } else {
    // Switch to desktop mode
    document.body.classList.remove("mobile-device")

    // Remove mobile-specific elements
    const mobileElements = document.querySelectorAll(
      ".mobile-menu-button, .mobile-menu, .fullscreen-button, .pull-indicator",
    )
    mobileElements.forEach((el) => el.remove())

    // Reset window positions
    document.querySelectorAll(".popup-window").forEach((window) => {
      window.classList.remove("mobile-window")

      // Only reset if currently using mobile positioning
      if (window.style.transform.includes("translate(-50%, -50%)")) {
        window.style.top = `${50 + Math.floor(Math.random() * 100)}px`
        window.style.left = `${50 + Math.floor(Math.random() * 100)}px`
        window.style.transform = ""
      }
    })

    // Reset desktop icon layout
    const desktop = document.querySelector(".desktop")
    if (desktop) {
      const icons = desktop.querySelectorAll(".desktop-icon")
      icons.forEach((icon) => {
        icon.style.position = ""
        icon.style.top = ""
        icon.style.left = ""
      })
    }
  }
}

// Helper function to get highest z-index
function getHighestZIndex() {
  let highest = 0
  document.querySelectorAll(".popup-window").forEach((window) => {
    const zIndex = Number.parseInt(window.style.zIndex || 0)
    if (zIndex > highest) highest = zIndex
  })
  return highest
}
