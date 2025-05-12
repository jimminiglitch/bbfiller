/**
 * Mobile & Responsive Enhancements
 * Improves the experience on mobile devices
 */
document.addEventListener("DOMContentLoaded", function() {
  console.log("📱 Initializing Mobile Enhancements...");
  
  // Configuration
  const config = {
    // Breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024
    },
    
    // Touch settings
    touch: {
      tapThreshold: 10, // px
      doubleTapDelay: 300, // ms
      longPressDelay: 500, // ms
      dragThreshold: 5 // px
    }
  };
  
  // State
  const state = {
    isMobile: false,
    isTablet: false,
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    lastTapTime: 0,
    isDragging: false,
    longPressTimer: null,
    currentLayout: 'desktop'
  };
  
  // Initialize mobile enhancements
  function initMobileEnhancements() {
    // Check device type
    checkDeviceType();
    
    // Add viewport meta tag if missing
    addViewportMeta();
    
    // Add touch event handlers
    addTouchHandlers();
    
    // Add resize handler
    window.addEventListener("resize", handleResize);
    
    // Initial layout adjustment
    adjustLayout();
    
    console.log(`📱 Mobile Enhancements initialized (${state.currentLayout} mode)`);
  }
  
  // Check device type
  function checkDeviceType() {
    const width = window.innerWidth;
    state.isMobile = width <= config.breakpoints.mobile;
    state.isTablet = width > config.breakpoints.mobile && width <= config.breakpoints.tablet;
    
    // Set layout mode
    if (state.isMobile) {
      state.currentLayout = 'mobile';
    } else if (state.isTablet) {
      state.currentLayout = 'tablet';
    } else {
      state.currentLayout = 'desktop';
    }
    
    // Add class to body
    document.body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop');
    document.body.classList.add(`layout-${state.currentLayout}`);
  }
  
  // Add viewport meta tag if missing
  function addViewportMeta() {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
      console.log("📱 Added viewport meta tag");
    }
  }
  
  // Add touch event handlers
  function addTouchHandlers() {
    // Desktop icons
    document.querySelectorAll(".desktop-icon").forEach(icon => {
      icon.addEventListener("touchstart", handleTouchStart);
      icon.addEventListener("touchmove", handleTouchMove);
      icon.addEventListener("touchend", handleTouchEnd);
    });
    
    // Windows
    document.querySelectorAll(".popup-window").forEach(win => {
      // Window headers for dragging
      const header = win.querySelector(".window-header");
      if (header) {
        header.addEventListener("touchstart", handleWindowTouchStart);
        header.addEventListener("touchmove", handleWindowTouchMove);
        header.addEventListener("touchend", handleWindowTouchEnd);
      }
      
      // Window content for scrolling
      const content = win.querySelector(".window-content");
      if (content) {
        content.addEventListener("touchstart", (e) => {
          // Allow default behavior for scrolling
          e.stopPropagation();
        });
      }
    });
    
    // Taskbar
    const taskbar = document.getElementById("start-bar");
    if (taskbar) {
      taskbar.addEventListener("touchstart", (e) => {
        // Prevent default to avoid triggering clicks on desktop
        e.stopPropagation();
      });
    }
  }
  
  // Handle touch start on desktop icons
  function handleTouchStart(e) {
    // Store touch start position and time
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
    state.touchStartTime = Date.now();
    state.isDragging = false;
    
    // Set up long press timer
    state.longPressTimer = setTimeout(() => {
      // Trigger long press
      handleLongPress(e);
    }, config.touch.longPressDelay);
  }
  
  // Handle touch move on desktop icons
  function handleTouchMove(e) {
    // Check if dragging
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = Math.abs(touchX - state.touchStartX);
    const deltaY = Math.abs(touchY - state.touchStartY);
    
    // If moved beyond threshold, cancel long press and mark as dragging
    if (deltaX > config.touch.dragThreshold || deltaY > config.touch.dragThreshold) {
      clearTimeout(state.longPressTimer);
      state.isDragging = true;
    }
  }
  
  // Handle touch end on desktop icons
  function handleTouchEnd(e) {
    // Clear long press timer
    clearTimeout(state.longPressTimer);
    
    // If not dragging, handle as tap
    if (!state.isDragging) {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - state.touchStartTime;
      
      // Check for double tap
      if (touchEndTime - state.lastTapTime < config.touch.doubleTapDelay) {
        // Handle double tap
        handleDoubleTap(e);
        state.lastTapTime = 0; // Reset to prevent triple tap
      } else {
        // Handle single tap
        handleTap(e);
        state.lastTapTime = touchEndTime;
      }
    }
    
    // Reset state
    state.isDragging = false;
  }
  
  // Handle tap on desktop icons
  function handleTap(e) {
    const icon = e.currentTarget;
    
    // Get window ID
    const windowId = icon.getAttribute("data-window") || icon.id.replace("icon-", "");
    
    // Open window
    if (typeof openWindow === 'function') {
      openWindow(windowId);
    }
  }
  
  // Handle double tap on desktop icons
  function handleDoubleTap(e) {
    // Same as single tap for now
    handleTap(e);
  }
  
  // Handle long press on desktop icons
  function handleLongPress(e) {
    // Show context menu if available
    const icon = e.currentTarget;
    
    // Create simple context menu if not exists
    let contextMenu = document.getElementById("mobile-context-menu");
    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.id = "mobile-context-menu";
      contextMenu.style.position = "fixed";
      contextMenu.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
      contextMenu.style.border = "1px solid #00ffff";
      contextMenu.style.borderRadius = "5px";
      contextMenu.style.padding = "10px";
      contextMenu.style.zIndex = "10000";
      document.body.appendChild(contextMenu);
      
      // Close on tap outside
      document.addEventListener("touchstart", (e) => {
        if (contextMenu.style.display === "block" && !contextMenu.contains(e.target)) {
          contextMenu.style.display = "none";
        }
      });
    }
    
    // Get window ID
    const windowId = icon.getAttribute("data-window") || icon.id.replace("icon-", "");
    
    // Clear existing menu items
    contextMenu.innerHTML = "";
    
    // Add menu items
    addContextMenuItem(contextMenu, "Open", () => {
      if (typeof openWindow === 'function') {
        openWindow(windowId);
      }
      contextMenu.style.display = "none";
    });
    
    // Position menu near the icon
    const rect = icon.getBoundingClientRect();
    contextMenu.style.left = `${rect.left}px`;
    contextMenu.style.top = `${rect.bottom + 10}px`;
    
    // Show menu
    contextMenu.style.display = "block";
  }
  
  // Add context menu item
  function addContextMenuItem(menu, text, action) {
    const item = document.createElement("div");
    item.textContent = text;
    item.style.padding = "10px";
    item.style.color = "#00ffff";
    item.style.fontFamily = "'VT323', monospace";
    item.style.fontSize = "16px";
    item.style.cursor = "pointer";
    
    // Add hover effect
    item.addEventListener("mouseover", () => {
      item.style.backgroundColor = "rgba(0, 255, 255, 0.2)";
    });
    
    item.addEventListener("mouseout", () => {
      item.style.backgroundColor = "transparent";
    });
    
    // Add click handler
    item.addEventListener("click", action);
    
    // Add to menu
    menu.appendChild(item);
    
    return item;
  }
  
  // Handle touch start on window headers
  function handleWindowTouchStart(e) {
    // Store touch start position and time
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
    state.touchStartTime = Date.now();
    state.isDragging = false;
    
    // Get window
    const header = e.currentTarget;
    const win = header.closest(".popup-window");
    
    // Focus window
    if (win && typeof focusWindow === 'function') {
      focusWindow(win.id);
    }
    
    // Set up long press timer
    state.longPressTimer = setTimeout(() => {
      // Trigger long press
      handleWindowLongPress(e);
    }, config.touch.longPressDelay);
  }
  
  // Handle touch move on window headers
  function handleWindowTouchMove(e) {
    // Check if dragging
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = Math.abs(touchX - state.touchStartX);
    const deltaY = Math.abs(touchY - state.touchStartY);
    
    // If moved beyond threshold, cancel long press and mark as dragging
    if (deltaX > config.touch.dragThreshold || deltaY > config.touch.dragThreshold) {
      clearTimeout(state.longPressTimer);
      state.isDragging = true;
      
      // Get window
      const header = e.currentTarget;
      const win = header.closest(".popup-window");
      
      // Move window
      if (win) {
        // Calculate new position
        const dx = touchX - state.touchStartX;
        const dy = touchY - state.touchStartY;
        
        const left = parseInt(win.style.left || 0) + dx;
        const top = parseInt(win.style.top || 0) + dy;
        
        // Apply new position
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
        
        // Update touch start position
        state.touchStartX = touchX;
        state.touchStartY = touchY;
      }
    }
  }
  
  // Handle touch end on window headers
  function handleWindowTouchEnd(e) {
    // Clear long press timer
    clearTimeout(state.longPressTimer);
    
    // If not dragging, handle as tap
    if (!state.isDragging) {
      const touchEndTime = Date.now();
      
      // Check for double tap
      if (touchEndTime - state.lastTapTime < config.touch.doubleTapDelay) {
        // Handle double tap
        handleWindowDoubleTap(e);
        state.lastTapTime = 0; // Reset to prevent triple tap
      } else {
        // Handle single tap
        handleWindowTap(e);
        state.lastTapTime = touchEndTime;
      }
    }
    
    // Reset state
    state.isDragging = false;
  }
  
  // Handle tap on window headers
  function handleWindowTap(e) {
    // Just focus the window
    const header = e.currentTarget;
    const win = header.closest(".popup-window");
    
    if (win && typeof focusWindow === 'function') {
      focusWindow(win.id);
    }
  }
  
  // Handle double tap on window headers
  function handleWindowDoubleTap(e) {
    // Toggle maximize
    const header = e.currentTarget;
    const win = header.closest(".popup-window");
    
    if (win && typeof toggleMaximize === 'function') {
      toggleMaximize(win.id);
    }
  }
  
  // Handle long press on window headers
  function handleWindowLongPress(e) {
    // Show window context menu
    const header = e.currentTarget;
    const win = header.closest(".popup-window");
    
    if (!win) return;
    
    // Create window context menu if not exists
    let contextMenu = document.getElementById("window-context-menu");
    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.id = "window-context-menu";
      contextMenu.style.position = "fixed";
      contextMenu.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
      contextMenu.style.border = "1px solid #00ffff";
      contextMenu.style.borderRadius = "5px";
      contextMenu.style.padding = "10px";
      contextMenu.style.zIndex = "10000";
      document.body.appendChild(contextMenu);
      
      // Close on tap outside
      document.addEventListener("touchstart", (e) => {
        if (contextMenu.style.display === "block" && !contextMenu.contains(e.target)) {
          contextMenu.style.display = "none";
        }
      });
    }
    
    // Clear existing menu items
    contextMenu.innerHTML = "";
    
    // Add menu items
    addContextMenuItem(contextMenu, "Minimize", () => {
      if (typeof minimizeWindow === 'function') {
        minimizeWindow(win.id);
      }
      contextMenu.style.display = "none";
    });
    
    addContextMenuItem(contextMenu, "Maximize", () => {
      if (typeof toggleMaximize === 'function') {
        toggleMaximize(win.id);
      }
      contextMenu.style.display = "none";
    });
    
    addContextMenuItem(contextMenu, "Close", () => {
      if (typeof closeWindow === 'function') {
        closeWindow(win.id);
      }
      contextMenu.style.display = "none";
    });
    
    // Position menu near the header
    const rect = header.getBoundingClientRect();
    contextMenu.style.left = `${rect.left}px`;
    contextMenu.style.top = `${rect.bottom + 10}px`;
    
    // Show menu
    contextMenu.style.display = "block";
  }
  
  // Handle resize
  function handleResize() {
    // Check device type
    checkDeviceType();
    
    // Adjust layout
    adjustLayout();
  }
  
  // Adjust layout based on device type
  function adjustLayout() {
    if (state.isMobile) {
      // Mobile layout adjustments
      adjustMobileLayout();
    } else if (state.isTablet) {
      // Tablet layout adjustments
      adjustTabletLayout();
    } else {
      // Desktop layout adjustments
      adjustDesktopLayout();
    }
  }
  
  // Adjust layout for mobile
  function adjustMobileLayout() {
    // Make windows full screen when opened
    if (typeof window.openWindow === 'function') {
      const originalOpenWindow = window.openWindow;
      
      window.openWindow = function(id) {
        const win = originalOpenWindow(id);
        
        if (win) {
          // Make window full screen
          win.style.width = "100%";
          win.style.height = "calc(100% - 40px)"; // Leave space for taskbar
          win.style.left = "0";
          win.style.top = "0";
          
          // Add mobile class
          win.classList.add("mobile-window");
        }
        
        return win;
      };
    }
    
    // Adjust existing windows
    document.querySelectorAll(".popup-window").forEach(win => {
      // Make window full screen
      win.style.width = "100%";
      win.style.height = "calc(100% - 40px)"; // Leave space for taskbar
      win.style.left = "0";
      win.style.top = "0";
      
      // Add mobile class
      win.classList.add("mobile-window");
    });
    
    // Adjust desktop icons for mobile
    document.querySelectorAll(".desktop-icon").forEach(icon => {
      // Make icons larger and more touch-friendly
      icon.style.width = "80px";
      icon.style.height = "80px";
      icon.style.margin = "10px";
    });
    
    // Adjust taskbar for mobile
    const taskbar = document.getElementById("start-bar");
    if (taskbar) {
      taskbar.style.height = "50px"; // Taller for touch
    }
  }
  
  // Adjust layout for tablet
  function adjustTabletLayout() {
    // Make windows larger but not full screen
    if (typeof window.openWindow === 'function') {
      const originalOpenWindow = window.openWindow;
      
      window.openWindow = function(id) {
        const win = originalOpenWindow(id);
        
        if (win) {
          // Make window larger
          win.style.width = "80%";
          win.style.height = "80%";
          
          // Center window
          win.style.left = "10%";
          win.style.top = "10%";
          
          // Add tablet class
          win.classList.add("tablet-window");
        }
        
        return win;
      };
    }
    
    // Adjust existing windows
    document.querySelectorAll(".popup-window").forEach(win => {
      // Make window larger
      win.style.width = "80%";
      win.style.height = "80%";
      
      // Center window
      win.style.left = "10%";
      win.style.top = "10%";
      
      // Add tablet class
      win.classList.add("tablet-window");
    });
    
    // Adjust desktop icons for tablet
    document.querySelectorAll(".desktop-icon").forEach(icon => {
      // Make icons slightly larger
      icon.style.width = "70px";
      icon.style.height = "70px";
      icon.style.margin = "8px";
    });
  }
  
  // Adjust layout for desktop
  function adjustDesktopLayout() {
    // Restore windows to their original size and position
    document.querySelectorAll(".popup-window").forEach(win => {
      // Remove mobile/tablet classes
      win.classList.remove("mobile-window", "tablet-window");
    });
    
    // Restore desktop icons
    document.querySelectorAll(".desktop-icon").forEach(icon => {
      // Reset to default size
      icon.style.width = "";
      icon.style.height = "";
      icon.style.margin = "";
    });
    
    // Restore taskbar
    const taskbar = document.getElementById("start-bar");
    if (taskbar) {
      taskbar.style.height = "";
    }
  }
  
  // Initialize after a short delay
  setTimeout(initMobileEnhancements, 1000);
});