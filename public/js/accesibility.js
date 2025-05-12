/**
 * ♿ Enhanced Accessibility Module
 * Comprehensive accessibility improvements for desktop-like web interfaces
 * - Improved keyboard navigation and focus management
 * - ARIA attributes and screen reader announcements
 * - Focus trapping for modal dialogs
 * - High contrast mode support
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("♿ Initializing Enhanced Accessibility Module...");

  // ── Configuration ──────────────────────────────────────────────────────────────
  const config = {
    roles: {
      window: "dialog",
      desktop: "application",
      taskbar: "toolbar",
      startMenu: "menu",
      startButton: "button",
      desktopIcon: "button",
      windowContent: "region"
    },
    shortcuts: [
      { keys: ["Escape"], ctrl: false, alt: false, shift: false, action: closeActiveWindow, description: "Close active window" },
      { keys: ["Tab"], ctrl: false, alt: true, shift: false, action: () => switchWindow(1), description: "Switch to next window" },
      { keys: ["Tab"], ctrl: false, alt: true, shift: true, action: () => switchWindow(-1), description: "Switch to previous window" },
      { keys: ["m"], ctrl: false, alt: true, shift: false, action: minimizeActiveWindow, description: "Minimize active window" },
      { keys: ["m"], ctrl: false, alt: true, shift: true, action: toggleMaximizeActiveWindow, description: "Maximize/restore active window" },
      { keys: ["F1"], ctrl: false, alt: false, shift: false, action: showKeyboardShortcutsHelp, description: "Show keyboard shortcuts help" },
      { keys: ["h"], ctrl: false, alt: true, shift: false, action: toggleHighContrastMode, description: "Toggle high contrast mode" }
    ],
    selectors: {
      desktop: ".container",
      taskbar: "#start-bar",
      startButton: "#start-button",
      startMenu: "#start-menu",
      desktopIcons: ".desktop-icon",
      windows: ".popup-window",
      activeWindow: ".window-active",
      windowTitle: ".window-title",
      windowContent: ".window-content",
      windowHeader: ".window-header",
      closeButton: ".close-btn"
    },
    announcements: {
      delay: 50, // ms delay before announcing to ensure DOM updates complete
      windowOpened: (title) => `${title} window opened`,
      windowClosed: (title) => `${title} window closed`,
      windowMinimized: (title) => `${title} window minimized`,
      windowMaximized: (title) => `${title} window maximized`,
      windowRestored: (title) => `${title} window restored`,
      startMenuOpened: "Start menu opened",
      startMenuClosed: "Start menu closed"
    }
  };

  // ── State Management ────────────────────────────────────────────────────────────
  const state = {
    lastFocusedElement: null,
    isHighContrastMode: false,
    activeModalId: null,
    shortcutsHelpVisible: false
  };

  // Mock functions for window management (replace with actual implementations)
  function minimizeWindow(windowId) {
    console.log(`Minimize window: ${windowId}`);
  }

  function toggleMaximize(windowId) {
    console.log(`Toggle maximize window: ${windowId}`);
  }

  function focusWindow(windowId) {
    console.log(`Focus window: ${windowId}`);
  }

  // ── Initialization ───────────────────────────────────────────────────────────
  function initialize() {
    try {
      addSkipLinks();
      setupScreenReaderAnnouncer();
      applyAriaAttributes();
      enableKeyboardShortcuts();
      makeWindowsAccessible();
      setupFocusManagement();
      setupEventListeners();
      createKeyboardShortcutsHelp();
      console.log("♿ Enhanced Accessibility Module initialized successfully");
    } catch (error) {
      console.error("♿ Error initializing accessibility enhancements:", error);
    }
  }

  // Delay initialization to ensure DOM is fully loaded
  setTimeout(initialize, 500);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  function setAttr(el, attrs = {}) {
    if (!el) return;
    Object.entries(attrs).forEach(([k, v]) => v != null && el.setAttribute(k, v));
  }

  function onKeyMatch(e, { keys, ctrl, alt, shift }) {
    return keys.includes(e.key) &&
      !!e.ctrlKey === ctrl &&
      !!e.altKey === alt &&
      !!e.shiftKey === shift;
  }

  function getWindowTitle(win) {
    if (!win) return "Window";
    const titleEl = $(config.selectors.windowTitle, win);
    return titleEl?.textContent?.trim() || win.id || "Window";
  }

  function getFocusableElements(container) {
    if (!container) return [];
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      container
    ).filter(el => {
      // Check if element is visible and not hidden by CSS
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
  }

  // ── Screen Reader Announcer ────────────────────────────────────────────────────
  function setupScreenReaderAnnouncer() {
    const announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    Object.assign(announcer.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0"
    });
    document.body.appendChild(announcer);
  }

  function announce(message, priority = "polite") {
    const announcer = $("#sr-announcer");
    if (!announcer) return;
    
    // Set the appropriate aria-live value
    announcer.setAttribute("aria-live", priority);
    
    // Clear the announcer first, then add the new message after a short delay
    announcer.textContent = "";
    
    setTimeout(() => {
      announcer.textContent = message;
    }, config.announcements.delay);
  }

  // ── Skip Links ────────────────────────────────────────────────────────────────
  function addSkipLinks() {
    const skipLinks = [
      { target: "#desktop-icons", text: "Skip to desktop icons" },
      { target: config.selectors.taskbar, text: "Skip to taskbar" }
    ];

    const skipLinksContainer = document.createElement("div");
    skipLinksContainer.className = "skip-links";
    Object.assign(skipLinksContainer.style, {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "10000"
    });

    skipLinks.forEach(({ target, text }) => {
      const link = document.createElement("a");
      link.href = target;
      link.textContent = text;
      link.className = "skip-link";
      Object.assign(link.style, {
        position: "absolute",
        top: "-40px",
        left: "0",
        padding: "8px",
        background: "#000",
        color: "#0ff",
        zIndex: "10000",
        transition: "top 0.2s ease",
        textDecoration: "none",
        fontWeight: "bold",
        border: "2px solid #0ff"
      });
      link.addEventListener("focus", () => link.style.top = "0");
      link.addEventListener("blur", () => link.style.top = "-40px");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetEl = $(target);
        if (targetEl) {
          targetEl.focus();
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      });
      skipLinksContainer.appendChild(link);
    });

    document.body.prepend(skipLinksContainer);
  }

  // ── ARIA Setup ────────────────────────────────────────────────────────────────
  function applyAriaAttributes() {
    // Desktop container
    const desktop = $(config.selectors.desktop);
    desktop && setAttr(desktop, {
      role: config.roles.desktop,
      "aria-label": "Desktop",
      tabindex: "-1"
    });

    // Taskbar
    const taskbar = $(config.selectors.taskbar);
    taskbar && setAttr(taskbar, {
      role: config.roles.taskbar,
      "aria-label": "Taskbar",
      tabindex: "0"
    });

    // Start button + menu
    setupStartMenu();

    // Desktop icons
    setupDesktopIcons();
  }

  function setupStartMenu() {
    const startButton = $(config.selectors.startButton);
    const startMenu = $(config.selectors.startMenu);

    if (startButton) {
      setAttr(startButton, {
        role: config.roles.startButton,
        "aria-label": "Start Menu",
        "aria-haspopup": "true",
        "aria-expanded": "false",
        tabindex: "0"
      });

      startButton.addEventListener("click", () => {
        const expanded = startMenu?.style.display === "block";
        startButton.setAttribute("aria-expanded", String(expanded));
        
        if (expanded) {
          announce(config.announcements.startMenuOpened);
          
          // Make menu items focusable and focus the first one
          const menuItems = startMenu ? $$(config.selectors.startMenu + " a, " + config.selectors.startMenu + " button") : [];
          menuItems.forEach(item => {
            setAttr(item, { role: "menuitem", tabindex: "0" });
          });
          
          if (menuItems.length > 0) {
            menuItems[0].focus();
          }
        } else {
          announce(config.announcements.startMenuClosed);
        }
      });
    }

    if (startMenu) {
      setAttr(startMenu, {
        role: config.roles.startMenu,
        "aria-label": "Start Menu"
      });

      // Add keyboard navigation for start menu
      startMenu.addEventListener("keydown", (e) => {
        const menuItems = $$(config.selectors.startMenu + " a, " + config.selectors.startMenu + " button");
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (currentIndex < menuItems.length - 1) {
              menuItems[currentIndex + 1].focus();
            } else {
              menuItems[0].focus();
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (currentIndex > 0) {
              menuItems[currentIndex - 1].focus();
            } else {
              menuItems[menuItems.length - 1].focus();
            }
            break;
          case "Escape":
            e.preventDefault();
            startButton.click(); // Close the menu
            startButton.focus(); // Return focus to start button
            break;
        }
      });
    }
  }

  function setupDesktopIcons() {
    $$(config.selectors.desktopIcons).forEach(icon => {
      const label = icon.querySelector("span")?.textContent || icon.id.replace(/^icon-/, "");
      setAttr(icon, {
        role: config.roles.desktopIcon,
        tabindex: "0",
        "aria-label": `Open ${label}`
      });

      // Add keyboard support
      icon.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          icon.click();
        }
      });
    });
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────────
  function enableKeyboardShortcuts() {
    document.addEventListener("keydown", e => {
      // Skip if user is typing in an input field
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
      }

      for (const sc of config.shortcuts) {
        if (onKeyMatch(e, sc)) {
          e.preventDefault();
          sc.action();
          break;
        }
      }
    });
  }

  // Shortcut Actions
  function closeActiveWindow() {
    const win = $(config.selectors.activeWindow);
    if (!win) return;
    
    const title = getWindowTitle(win);
    const closeBtn = $(config.selectors.closeButton, win);
    
    if (closeBtn) {
      closeBtn.click();
      announce(config.announcements.windowClosed(title));
    }
  }

  function minimizeActiveWindow() {
    const win = $(config.selectors.activeWindow);
    if (!win) return;
    
    const title = getWindowTitle(win);
    
    if (typeof minimizeWindow === "function") {
      minimizeWindow(win.id);
      announce(config.announcements.windowMinimized(title));
    }
  }

  function toggleMaximizeActiveWindow() {
    const win = $(config.selectors.activeWindow);
    if (!win) return;
    
    const title = getWindowTitle(win);
    const isMaximized = win.classList.contains("maximized");
    
    if (typeof toggleMaximize === "function") {
      toggleMaximize(win.id);
      
      // Announce the new state after a short delay to ensure the DOM has updated
      setTimeout(() => {
        const newIsMaximized = win.classList.contains("maximized");
        if (newIsMaximized && !isMaximized) {
          announce(config.announcements.windowMaximized(title));
        } else if (!newIsMaximized && isMaximized) {
          announce(config.announcements.windowRestored(title));
        }
      }, 100);
    }
  }

  function switchWindow(direction) {
    const wins = $$(config.selectors.windows).filter(w => w.style.display !== "none");
    if (!wins.length) return;

    const active = $(config.selectors.activeWindow);
    let idx = active ? wins.indexOf(active) : -1;
    idx = (idx + direction + wins.length) % wins.length;
    const target = wins[idx];
    
    if (typeof focusWindow === "function") {
      focusWindow(target.id);
      announce(getWindowTitle(target) + " window activated");
    }
  }

  function toggleHighContrastMode() {
    state.isHighContrastMode = !state.isHighContrastMode;
    
    if (state.isHighContrastMode) {
      document.body.classList.add("high-contrast-mode");
      announce("High contrast mode enabled");
    } else {
      document.body.classList.remove("high-contrast-mode");
      announce("High contrast mode disabled");
    }
    
    // Add high contrast styles if they don't exist
    if (state.isHighContrastMode && !$("#high-contrast-styles")) {
      const style = document.createElement("style");
      style.id = "high-contrast-styles";
      style.textContent = `
        .high-contrast-mode {
          filter: invert(100%);
        }
        .high-contrast-mode img,
        .high-contrast-mode video {
          filter: invert(100%);
        }
        .high-contrast-mode * {
          background-color: white !important;
          color: black !important;
          border-color: black !important;
        }
        .high-contrast-mode .window-active {
          outline: 3px solid yellow !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ── Window Accessibility ────────────────────────────────────────────────────
  function makeWindowsAccessible() {
    $$(config.selectors.windows).forEach(win => {
      const titleEl = $(config.selectors.windowTitle, win);
      const titleText = getWindowTitle(win);
      
      // Set window role and label
      if (titleEl) {
        titleEl.id ||= `title-${win.id || Math.random().toString(36).substring(2, 9)}`;
        setAttr(win, {
          role: config.roles.window,
          "aria-labelledby": titleEl.id,
          tabindex: "-1"
        });
      } else {
        setAttr(win, {
          role: config.roles.window,
          "aria-label": titleText,
          tabindex: "-1"
        });
      }

      // Set content region
      const content = $(config.selectors.windowContent, win);
      content && setAttr(content, {
        role: config.roles.windowContent,
        "aria-label": `${titleText} content`
      });

      // Set close button
      const closeBtn = $(config.selectors.closeButton, win);
      closeBtn && setAttr(closeBtn, {
        "aria-label": `Close ${titleText}`,
        tabindex: "0"
      });

      // Set window header
      const header = $(config.selectors.windowHeader, win);
      if (header) {
        setAttr(header, {
          role: "heading",
          tabindex: "0",
          "aria-level": "1",
          "aria-label": `${titleText} - double-click to maximize`
        });
      }

      // Add keyboard support for window controls
      setupWindowKeyboardControls(win);
    });

    // Watch for new windows being added to the DOM
    setupWindowObserver();
  }

  function setupWindowKeyboardControls(win) {
    if (!win) return;
    
    // Add keyboard support for window header (maximize on Enter)
    const header = $(config.selectors.windowHeader, win);
    if (header) {
      header.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (typeof toggleMaximize === "function") {
            toggleMaximize(win.id);
          }
        }
      });
    }

    // Make sure all interactive elements are keyboard accessible
    const interactiveElements = $$('button, a, [role="button"]', win);
    interactiveElements.forEach(el => {
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
      }
    });
  }

  // ── Focus Management ────────────────────────────────────────────────────────
  function setupFocusManagement() {
    // Track the last focused element before a modal opens
    document.addEventListener("focusin", e => {
      if (!state.activeModalId) {
        state.lastFocusedElement = e.target;
      }
    });

    // Set up focus trapping for windows
    $$(config.selectors.windows).forEach(win => {
      setupFocusTrap(win);
    });
  }

  function setupFocusTrap(container) {
    if (!container) return;
    
    container.addEventListener("keydown", e => {
      // Only trap focus if this window is active and modal
      if (!container.classList.contains("window-active") || 
          !container.classList.contains("modal")) {
        return;
      }
      
      if (e.key === "Tab") {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  function setupEventListeners() {
    // Listen for window open events
    document.addEventListener("windowOpened", e => {
      const winId = e.detail?.windowId;
      if (!winId) return;
      
      const win = $(`#${winId}`);
      if (!win) return;
      
      // Make window accessible
      makeWindowsAccessible();
      
      // Set up focus trap
      setupFocusTrap(win);
      
      // Focus the window
      win.focus();
      
      // Announce window opened
      const title = getWindowTitle(win);
      announce(config.announcements.windowOpened(title));
      
      // If modal, store active modal ID and last focused element
      if (win.classList.contains("modal")) {
        state.activeModalId = winId;
      }
    });

    // Listen for window close events
    document.addEventListener("windowClosed", e => {
      const winId = e.detail?.windowId;
      if (!winId) return;
      
      // If this was the active modal, restore focus
      if (state.activeModalId === winId) {
        state.activeModalId = null;
        if (state.lastFocusedElement) {
          state.lastFocusedElement.focus();
        }
      }
    });
  }

  // ── Window Observer ────────────────────────────────────────────────────────
  function setupWindowObserver() {
    // Watch for new windows being added to the DOM
    const observer = new MutationObserver(mutations => {
      let newWindowAdded = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.matches(config.selectors.windows)) {
              newWindowAdded = true;
              makeWindowsAccessible();
              setupFocusTrap(node);
            }
          });
        }
      });
      
      if (newWindowAdded) {
        console.log("♿ New window detected, accessibility attributes applied");
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Keyboard Shortcuts Help ────────────────────────────────────────────────
  function createKeyboardShortcutsHelp() {
    const helpWindow = document.createElement("div");
    helpWindow.id = "keyboard-shortcuts-help";
    helpWindow.className = "popup-window";
    helpWindow.style.display = "none";
    helpWindow.style.zIndex = "10000";
    helpWindow.style.width = "400px";
    helpWindow.style.height = "auto";
    helpWindow.style.maxHeight = "80vh";
    helpWindow.style.overflow = "auto";
    
    helpWindow.innerHTML = `
      <div class="window-header">
        <div class="window-title">Keyboard Shortcuts</div>
        <div class="window-controls">
          <button class="close-btn" aria-label="Close keyboard shortcuts help">×</button>
        </div>
      </div>
      <div class="window-content">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Shortcut</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${config.shortcuts.map(sc => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ccc;">
                  ${sc.ctrl ? 'Ctrl+' : ''}${sc.alt ? 'Alt+' : ''}${sc.shift ? 'Shift+' : ''}${sc.keys[0]}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #ccc;">${sc.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    document.body.appendChild(helpWindow);
    
    // Add close button functionality
    const closeBtn = helpWindow.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        helpWindow.style.display = "none";
        state.shortcutsHelpVisible = false;
        if (state.lastFocusedElement) {
          state.lastFocusedElement.focus();
        }
      });
    }
    
    // Make the help window accessible
    setAttr(helpWindow, {
      role: config.roles.window,
      "aria-label": "Keyboard Shortcuts Help",
      tabindex: "-1"
    });
    
    setupFocusTrap(helpWindow);
  }

  function showKeyboardShortcutsHelp() {
    const helpWindow = $("#keyboard-shortcuts-help");
    if (!helpWindow) return;
    
    state.lastFocusedElement = document.activeElement;
    helpWindow.style.display = "block";
    state.shortcutsHelpVisible = true;
    
    // Position the window in the center
    helpWindow.style.left = "50%";
    helpWindow.style.top = "50%";
    helpWindow.style.transform = "translate(-50%, -50%)";
    
    // Focus the window
    helpWindow.focus();
    
    // Announce
    announce("Keyboard shortcuts help opened");
  }
});

// Add high contrast mode styles
const highContrastStyles = document.createElement("style");
highContrastStyles.textContent = `
  .high-contrast-mode {
    filter: invert(100%);
  }
  .high-contrast-mode img,
  .high-contrast-mode video {
    filter: invert(100%);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
document.head.appendChild(highContrastStyles);

console.log("Accessibility Enhancements script loaded");style.backgroundColor = "#000";
    skipLink.style.color = "#00ffff";
    skipLink.style.zIndex = "10000";
    skipLink.style.transition = "top 0.2s ease";
    
    // Show on focus
    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "0";
    });
    
    // Hide on blur
    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-40px";
    });
    
    // Add to document
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  // Make windows accessible
  function makeWindowsAccessible() {
    const windows = document.querySelectorAll(".popup-window");
    
    windows.forEach(win => {
      // Add dialog role
      win.setAttribute("role", config.roles.window);
      
      // Get window title
      const titleElement = win.querySelector(".window-title");
      const title = titleElement ? titleElement.textContent : win.id;
      
      // Set aria-labelledby if title element exists
      if (titleElement) {
        titleElement.id = titleElement.id || `title-${win.id}`;
        win.setAttribute("aria-labelledby", titleElement.id);
      } else {
        // Otherwise set aria-label
        win.setAttribute("aria-label", title);
      }
      
      // Make window content accessible
      const content = win.querySelector(".window-content");
      if (content) {
        content.setAttribute("role", "region");
        content.setAttribute("aria-label", `${title} content`);
      }
      
      // Make close button accessible
      const closeBtn = win.querySelector(".close-btn");
      if (closeBtn) {
        closeBtn.setAttribute("aria-label", `Close ${title}`);
      }
      
      // Add keyboard support for window header (for dragging)
      const header = win.querySelector(".window-header");
      if (header) {
        header.setAttribute("role", "heading");
        header.setAttribute("aria-level", "1");
        header.setAttribute("tabindex", "0");
        header.setAttribute("aria-label", `${title} - Double click to maximize`);
      }
    });
  }
  
  // Initialize after a short delay
  setTimeout(initAccessibility, 1000);
});