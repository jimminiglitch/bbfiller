/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/consolidated.js":
/*!*****************************!*\
  !*** ./src/consolidated.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("// consolidated.js - Complete solution\r\ndocument.getElementById(\"icon-file-explorer\").addEventListener(\"click\", () => {\r\n  __webpack_require__.e(/*! import() */ \"src_file-explorer_js\").then(__webpack_require__.t.bind(__webpack_require__, /*! ./file-explorer.js */ \"./src/file-explorer.js\", 23));\r\n});\r\n\r\n// ===== UTILITY FUNCTIONS =====\r\nfunction debounce(func, wait) {\r\n  let timeout;\r\n  return function() {\r\n    const args = arguments;\r\n    clearTimeout(timeout);\r\n    timeout = setTimeout(() => func.apply(this, args), wait);\r\n  };\r\n}\r\n\r\n// Audio elements - IMPORTANT: Define this ONCE at the global scope\r\n// This prevents multiple instances from being created\r\nif (!window.toadHoverAudio) {\r\n  window.toadHoverAudio = new Audio('https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/hover.mp3?v=1746577634973');\r\n  window.toadHoverAudio.volume = 0.5;\r\n  \r\n  // Add debug to track when this plays\r\n  window.toadHoverAudio.addEventListener('play', () => {\r\n    console.log('🔊 Toad hover sound playing!');\r\n    console.trace('Sound triggered from:');\r\n  });\r\n}\r\n\r\n// ===== INITIALIZATION =====\r\ndocument.addEventListener(\"DOMContentLoaded\", () => {\r\n  // Initialize all windows once\r\n  initWindowControls();\r\n\r\n  // Start boot sequence is handled by boot-sequence.js\r\n  // We'll just initialize our components after a delay\r\n  setTimeout(() => {\r\n    initDesktopIcons();\r\n    initStarfield();\r\n    initGlitchEffects();\r\n    initStartMenu();\r\n    initIframeHandling();\r\n  }, 1000); // Wait for boot sequence to complete\r\n});\r\n\r\n// ===== WINDOW MANAGEMENT =====\r\nfunction initWindowControls() {\r\n  const windows = document.querySelectorAll(\".popup-window\");\r\n\r\n  windows.forEach((win) => {\r\n    const id = win.id;\r\n    const header = win.querySelector(\".window-header\");\r\n    if (!header) return; // Skip if no header found\r\n    \r\n    const btnMin = header.querySelector(\".minimize\");\r\n    const btnMax = header.querySelector(\".maximize\");\r\n    const btnCls = header.querySelector(\".close\");\r\n\r\n    if (btnMin) btnMin.addEventListener(\"click\", () => minimizeWindow(id));\r\n    if (btnMax) btnMax.addEventListener(\"click\", e => {\r\n      const winEl = e.currentTarget.closest(\".popup-window\");\r\n      toggleMaximize(winEl);\r\n    });\r\n    if (btnCls) btnCls.addEventListener(\"click\", () => closeWindow(id));\r\n\r\n    // Dragging logic\r\n    let isDragging = false,\r\n      offsetX = 0,\r\n      offsetY = 0;\r\n    header.addEventListener(\"mousedown\", (e) => {\r\n      if (e.target.tagName === \"BUTTON\") return; // Don't drag if clicking buttons\r\n      isDragging = true;\r\n      offsetX = e.clientX - win.offsetLeft;\r\n      offsetY = e.clientY - win.offsetTop;\r\n      win.style.zIndex = getNextZIndex();\r\n\r\n      // Add active class to show it's being dragged\r\n      win.classList.add(\"dragging\");\r\n    });\r\n\r\n    // Use passive event listeners for better performance\r\n    document.addEventListener(\r\n      \"mousemove\",\r\n      (e) => {\r\n        if (isDragging) {\r\n          // Don't drag if maximized\r\n          if (win.classList.contains(\"maximized\")) return;\r\n\r\n          win.style.left = `${e.clientX - offsetX}px`;\r\n          win.style.top = `${e.clientY - offsetY}px`;\r\n        }\r\n      },\r\n      { passive: true }\r\n    );\r\n\r\n    document.addEventListener(\r\n      \"mouseup\",\r\n      () => {\r\n        isDragging = false;\r\n        win.classList.remove(\"dragging\");\r\n      },\r\n      { passive: true }\r\n    );\r\n\r\n    // Double-click to maximize\r\n    header.addEventListener(\"dblclick\", (e) => {\r\n      if (e.target.tagName !== \"BUTTON\") {\r\n        toggleMaximizeWindow(id);\r\n      }\r\n    });\r\n\r\n    // Resizing logic\r\n    const directions = [\"top\", \"right\", \"bottom\", \"left\", \"top-left\", \"top-right\", \"bottom-left\", \"bottom-right\"];\r\n\r\n    directions.forEach((dir) => {\r\n      const resizer = document.createElement(\"div\");\r\n      resizer.classList.add(\"resizer\", `resizer-${dir}`);\r\n      win.appendChild(resizer);\r\n\r\n      let isResizing = false;\r\n\r\n      resizer.addEventListener(\"mousedown\", (e) => {\r\n        if (win.classList.contains(\"maximized\")) return;\r\n\r\n        e.preventDefault();\r\n        e.stopPropagation();\r\n        isResizing = true;\r\n        win.classList.add(\"resizing\");\r\n        win.style.zIndex = getNextZIndex(); // Ensure window is on top when resizing\r\n        const startX = e.clientX;\r\n        const startY = e.clientY;\r\n        const startWidth = Number.parseInt(getComputedStyle(win).width, 10);\r\n        const startHeight = Number.parseInt(getComputedStyle(win).height, 10);\r\n        const startTop = win.offsetTop;\r\n        const startLeft = win.offsetLeft;\r\n\r\n        function doDrag(e) {\r\n          if (!isResizing) return;\r\n          let newWidth = startWidth;\r\n          let newHeight = startHeight;\r\n          let newTop = startTop;\r\n          let newLeft = startLeft;\r\n\r\n          if (dir.includes(\"right\")) {\r\n            newWidth = Math.max(300, startWidth + e.clientX - startX);\r\n          }\r\n          if (dir.includes(\"bottom\")) {\r\n            newHeight = Math.max(200, startHeight + e.clientY - startY);\r\n          }\r\n          if (dir.includes(\"left\")) {\r\n            const dx = e.clientX - startX;\r\n            newWidth = Math.max(300, startWidth - dx);\r\n            newLeft = startLeft + dx;\r\n          }\r\n          if (dir.includes(\"top\")) {\r\n            const dy = e.clientY - startY;\r\n            newHeight = Math.max(200, startHeight - dy);\r\n            newTop = startTop + dy;\r\n          }\r\n\r\n          win.style.width = `${newWidth}px`;\r\n          win.style.height = `${newHeight}px`;\r\n          win.style.top = `${newTop}px`;\r\n          win.style.left = `${newLeft}px`;\r\n        }\r\n\r\n        function stopDrag() {\r\n          isResizing = false;\r\n          win.classList.remove(\"resizing\");\r\n          window.removeEventListener(\"mousemove\", doDrag);\r\n          window.removeEventListener(\"mouseup\", stopDrag);\r\n        }\r\n\r\n        window.addEventListener(\"mousemove\", doDrag, { passive: true });\r\n        window.addEventListener(\"mouseup\", stopDrag, { passive: true });\r\n      });\r\n    });\r\n  });\r\n}\r\n\r\n// ===== WINDOW OPERATIONS =====\r\nlet currentZIndex = 10;\r\nconst windowStates = {};\r\n\r\nfunction getNextZIndex() {\r\n  return ++currentZIndex;\r\n}\r\n\r\n// FIXED: This is the key function that was causing the issue\r\nfunction openWindow(id) {\r\n  const win = document.getElementById(id);\r\n  if (!win) return;\r\n\r\n  // 1) Hide start menu & deactivate other windows\r\n  const startMenu = document.getElementById(\"start-menu\");\r\n  if (startMenu) startMenu.style.display = \"none\";\r\n  document.querySelectorAll(\".popup-window\").forEach((w) => w.classList.remove(\"active\"));\r\n\r\n  // 2) Lazy-load <iframe data-src>\r\n  win.querySelectorAll(\"iframe[data-src]\").forEach((iframe) => {\r\n    if (!iframe.src) {\r\n      iframe.src = iframe.dataset.src;\r\n    }\r\n  });\r\n\r\n  // 3) Lazy-load <video data-src>\r\n  win.querySelectorAll(\"video[data-src]\").forEach((v) => {\r\n    if (!v.src) {\r\n      v.src = v.dataset.src;\r\n      v.load();\r\n      if (!isMobile()) {\r\n        v.play().catch(() => {});\r\n      }\r\n    }\r\n  });\r\n\r\n  // 4) Show & focus\r\n  win.classList.remove(\"hidden\");\r\n  win.classList.add(\"active\");\r\n  win.style.display = \"flex\";\r\n  win.style.zIndex = getNextZIndex();\r\n  win.classList.add(\"window-opening\");\r\n  setTimeout(() => {\r\n    win.classList.remove(\"window-opening\");\r\n  }, 500);\r\n\r\n  // 5) Special window handling - FIXED: Only play sound for toader window\r\n  if (id === \"toader\" && window.toadHoverAudio) {\r\n    console.log(\"Opening toader window, playing sound\");\r\n    window.toadHoverAudio.currentTime = 0;\r\n    window.toadHoverAudio.play().catch((e) => console.log(\"Audio error:\", e));\r\n  }\r\n\r\n  function openWindow(id) {\r\n  const win = document.getElementById(id);\r\n  win.style.display = 'block';       // or removeClass('minimized') etc.\r\n\r\n  // — reload every video inside that window —\r\n  win.querySelectorAll('video').forEach(video => {\r\n    video.load();                    // re‐initializes the media\r\n    // video.play();                 // if you also want it to autoplay\r\n  });\r\n\r\n  // — reload every iframe (YouTube/Vimeo) inside that window —\r\n  win.querySelectorAll('iframe').forEach(iframe => {\r\n    const src = iframe.getAttribute('data-src') || iframe.src;\r\n    iframe.src = '';                 // clear it out\r\n    iframe.src = src;                // re‐assign to force a reload\r\n  });\r\n}\r\n\r\n  // Special handling for snake game\r\n  if (id === \"snake\") {\r\n    const snakeIframe = document.getElementById(\"snake-iframe\");\r\n    if (snakeIframe) {\r\n      // Force reload the iframe to restart the game properly\r\n      const currentSrc = snakeIframe.src;\r\n      snakeIframe.src = '';\r\n      setTimeout(() => {\r\n        snakeIframe.src = currentSrc;\r\n      }, 100);\r\n    }\r\n  }\r\n\r\n  // 6) Restore previous bounds or clamp to viewport\r\n  const isMobileView = isMobile();\r\n  if (isMobileView) {\r\n    Object.assign(win.style, {\r\n      top: \"0\",\r\n      left: \"0\",\r\n      width: \"100vw\",\r\n      height: \"calc(100vh - 36px)\",\r\n      transform: \"none\",\r\n    });\r\n  } else {\r\n    const stored = windowStates[id];\r\n    if (stored) Object.assign(win.style, stored);\r\n\r\n    const rect = win.getBoundingClientRect();\r\n    const margin = 20;\r\n    const vw = window.innerWidth;\r\n    const vh = window.innerHeight;\r\n    let newW = rect.width,\r\n        newH = rect.height,\r\n        newLeft = rect.left,\r\n        newTop = rect.top;\r\n\r\n    if (rect.width > vw - margin * 2) newW = vw - margin * 2;\r\n    if (rect.height > vh - margin * 2) newH = vh - margin * 2;\r\n    if (rect.left < margin) newLeft = margin;\r\n    if (rect.top < margin) newTop = margin;\r\n    if (rect.right > vw - margin) newLeft = vw - margin - newW;\r\n    if (rect.bottom > vh - margin) newTop = vh - margin - newH;\r\n\r\n    Object.assign(win.style, {\r\n      width:  `${newW}px`,\r\n      height: `${newH}px`,\r\n      left:   `${newLeft}px`,\r\n      top:    `${newTop}px`,\r\n    });\r\n  }\r\n}\r\n\r\n// Helper function to detect mobile devices\r\nfunction isMobile() {\r\n  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);\r\n}\r\n\r\nfunction createTaskbarIcon(id) {\r\n  if (document.getElementById(`taskbar-icon-${id}`)) return;\r\n\r\n  const win = document.getElementById(id);\r\n  if (!win) return; // Skip if window doesn't exist\r\n\r\n  const titleEl = win.querySelector(\".window-header span\");\r\n  const title = titleEl ? titleEl.textContent.replace(\".EXE\", \"\") : id.toUpperCase();\r\n\r\n  const btn = document.createElement(\"button\");\r\n  btn.id = `taskbar-icon-${id}`;\r\n  btn.className = \"taskbar-icon\";\r\n\r\n  const iconText = document.createElement(\"span\");\r\n  iconText.textContent = title;\r\n  btn.appendChild(iconText);\r\n\r\n  btn.addEventListener(\"click\", () => {\r\n    openWindow(id);\r\n    btn.remove();\r\n  });\r\n\r\n  const taskbarIcons = document.getElementById(\"taskbar-icons\");\r\n  if (taskbarIcons) taskbarIcons.appendChild(btn);\r\n}\r\n\r\nfunction minimizeWindow(id) {\r\n  const win = document.getElementById(id);\r\n  if (!win) return;\r\n\r\n  // Add minimizing animation\r\n  win.classList.add(\"window-minimizing\");\r\n\r\n  setTimeout(() => {\r\n    win.classList.remove(\"window-minimizing\");\r\n    win.classList.add(\"hidden\");\r\n    win.style.display = \"none\";\r\n\r\n    // Create taskbar icon\r\n    createTaskbarIcon(id);\r\n\r\n    // Special handling for snake game - pause but don't unload\r\n    if (id === \"snake\") {\r\n      const snakeIframe = document.getElementById(\"snake-iframe\");\r\n      if (snakeIframe) {\r\n        try {\r\n          // Try to send a pause message to the iframe\r\n          snakeIframe.contentWindow.postMessage('pause', '*');\r\n        } catch (e) {\r\n          console.error(\"Could not pause snake game:\", e);\r\n        }\r\n      }\r\n    }\r\n\r\n    // Stop toad hover SFX if it's the toader window\r\n    if (id === \"toader\" && window.toadHoverAudio) {\r\n      window.toadHoverAudio.pause();\r\n      window.toadHoverAudio.currentTime = 0;\r\n    }\r\n  }, 300);\r\n}\r\n\r\nfunction closeWindow(id) {\r\n  const win = document.getElementById(id);\r\n  if (win) {\r\n    // Add closing animation\r\n    win.classList.add(\"window-closing\");\r\n\r\n    setTimeout(() => {\r\n      // Pause/reset any video inside\r\n      const vid = win.querySelector(\"video\");\r\n      if (vid) {\r\n        vid.pause();\r\n        vid.currentTime = 0;\r\n      }\r\n      \r\n  // — STOP MUSIC PLAYER —\r\n  if (id === \"music\") {\r\n    const iframe = win.querySelector(\"iframe\");\r\n    if (iframe && iframe.contentWindow) {\r\n      const audio = iframe.contentWindow.document.getElementById(\"music-player\");\r\n      if (audio) {\r\n        audio.pause();\r\n        audio.currentTime = 0;\r\n      }\r\n    }\r\n  }\r\n\r\n\r\n    // Special handling for snake game\r\nif (id === \"snake\") {\r\n  const snakeIframe = document.getElementById(\"snake-iframe\");\r\n  if (snakeIframe) {\r\n    const currentSrc = snakeIframe.src;\r\n    snakeIframe.src = '';\r\n    setTimeout(() => {\r\n      snakeIframe.src = currentSrc;\r\n    }, 50); // delay ensures proper unload before reload\r\n  }\r\n}\r\n\r\n      // Hide window\r\n      win.classList.remove(\"window-closing\");\r\n      win.classList.add(\"hidden\");\r\n      win.style.display = \"none\";\r\n\r\n      // Stop toad hover SFX if it's the toader window\r\n      if (id === \"toader\" && window.toadHoverAudio) {\r\n        window.toadHoverAudio.pause();\r\n        window.toadHoverAudio.currentTime = 0;\r\n      }\r\n    }, 300);\r\n  }\r\n\r\n  // Remove taskbar icon\r\n  const icon = document.getElementById(`taskbar-icon-${id}`);\r\n  if (icon) icon.remove();\r\n}\r\n\r\nfunction toggleMaximize(win) {\r\n  if (win.classList.contains('maximized')) {\r\n    // restore\r\n    win.classList.remove('maximized');\r\n    win.style.top    = win.dataset.prevTop;\r\n    win.style.left   = win.dataset.prevLeft;\r\n    win.style.width  = win.dataset.prevWidth;\r\n    win.style.height = win.dataset.prevHeight;\r\n  } else {\r\n    // stash current geometry\r\n    win.dataset.prevTop    = win.style.top;\r\n    win.dataset.prevLeft   = win.style.left;\r\n    win.dataset.prevWidth  = win.style.width;\r\n    win.dataset.prevHeight = win.style.height;\r\n    // maximize\r\n    win.style.top    = '0';\r\n    win.style.left   = '0';\r\n    win.style.width  = '100vw';\r\n    win.style.height = '100vh';\r\n    win.classList.add('maximized');\r\n  }\r\n}\r\n\r\n\r\nfunction toggleMaximizeWindow(id) {\r\n  const win = document.getElementById(id);\r\n  if (!win) return;\r\n\r\n  const isMax = !win.classList.contains(\"maximized\");\r\n\r\n  if (isMax) {\r\n    // save old bounds\r\n    windowStates[id] = {\r\n      parent: win.parentNode,\r\n      next: win.nextSibling,\r\n      position: win.style.position,\r\n      top: win.style.top,\r\n      left: win.style.left,\r\n      right: win.style.right,\r\n      bottom: win.style.bottom,\r\n      width: win.style.width,\r\n      height: win.style.height,\r\n      transform: win.style.transform,\r\n    };\r\n\r\n    win.classList.add(\"window-maximizing\");\r\n    setTimeout(() => {\r\n      document.body.appendChild(win);\r\n      win.classList.add(\"maximized\");\r\n      win.classList.remove(\"window-maximizing\");\r\n      Object.assign(win.style, {\r\n        position: \"fixed\",\r\n        top: \"0\",\r\n        left: \"0\",\r\n        right: \"0\",\r\n        bottom: \"36px\",\r\n        width: \"auto\",\r\n        height: \"auto\",\r\n        transform: \"none\",\r\n        zIndex: getNextZIndex(),\r\n      });\r\n    }, 300);\r\n  } else {\r\n    win.classList.add(\"window-restoring\");\r\n    win.classList.remove(\"maximized\");\r\n    setTimeout(() => {\r\n      const prev = windowStates[id] || {};\r\n      Object.assign(win.style, {\r\n        position: prev.position || \"absolute\",\r\n        top: prev.top || \"\",\r\n        left: prev.left || \"\",\r\n        right: prev.right || \"\",\r\n        bottom: prev.bottom || \"\",\r\n        width: prev.width || \"\",\r\n        height: prev.height || \"\",\r\n        transform: prev.transform || \"\",\r\n        zIndex: getNextZIndex(),\r\n      });\r\n      if (prev.parent) prev.parent.insertBefore(win, prev.next);\r\n      win.classList.remove(\"window-restoring\");\r\n    }, 300);\r\n  }\r\n}\r\n\r\n// ===== CLOCK & START MENU =====\r\nfunction updateClock() {\r\n  const clk = document.getElementById(\"clock\");\r\n  if (clk) {\r\n    const now = new Date();\r\n    const hours = now.getHours().toString().padStart(2, \"0\");\r\n    const minutes = now.getMinutes().toString().padStart(2, \"0\");\r\n    const seconds = now.getSeconds().toString().padStart(2, \"0\");\r\n    clk.textContent = `${hours}:${minutes}:${seconds}`;\r\n    clk.classList.add(\"clock-pulse\");\r\n    setTimeout(() => {\r\n      clk.classList.remove(\"clock-pulse\");\r\n    }, 500);\r\n  }\r\n}\r\nsetInterval(updateClock, 1000);\r\nupdateClock();\r\n\r\nfunction initStartMenu() {\r\n  const startButton = document.getElementById(\"start-button\");\r\n  if (startButton) {\r\n    startButton.addEventListener(\"click\", () => {\r\n      const m = document.getElementById(\"start-menu\");\r\n      if (!m) return;\r\n      \r\n      const isVisible = m.style.display === \"flex\";\r\n      if (isVisible) {\r\n        m.classList.add(\"menu-hiding\");\r\n        setTimeout(() => {\r\n          m.style.display = \"none\";\r\n          m.classList.remove(\"menu-hiding\");\r\n        }, 300);\r\n      } else {\r\n        m.style.display = \"flex\";\r\n        m.classList.add(\"menu-showing\");\r\n        setTimeout(() => {\r\n          m.classList.remove(\"menu-showing\");\r\n        }, 300);\r\n      }\r\n    });\r\n  }\r\n}\r\n\r\n// ===== DESKTOP ICONS =====\r\nfunction initDesktopIcons() {\r\n  document.querySelectorAll(\".desktop-icon\").forEach((icon) => {\r\n    // IMPORTANT: Remove any existing event listeners to prevent s\r\n    const newIcon = icon.cloneNode(true);\r\n    if (icon.parentNode) {\r\n      icon.parentNode.replaceChild(newIcon, icon);\r\n    }\r\n    icon = newIcon;\r\n\r\n    // open on double-click\r\n    icon.addEventListener(\"dblclick\", () => {\r\n      if (icon.dataset.window) {\r\n        openWindow(icon.dataset.window);\r\n      }\r\n    });\r\n\r\n    // hover effect - FIXED: No sound on hover\r\n    icon.addEventListener(\"mouseenter\", () => {\r\n      icon.classList.add(\"icon-hover\");\r\n    });\r\n    \r\n    icon.addEventListener(\"mouseleave\", () => {\r\n      icon.classList.remove(\"icon-hover\");\r\n    });\r\n\r\n    // drag-group start\r\n    icon.addEventListener(\"mousedown\", (e) => {\r\n      e.preventDefault();\r\n      const parentRect = icon.parentElement.getBoundingClientRect();\r\n      const clickRect = icon.getBoundingClientRect();\r\n      let group;\r\n      if (icon.classList.contains(\"selected\")) {\r\n        group = Array.from(document.querySelectorAll(\".desktop-icon.selected\"));\r\n      } else {\r\n        document.querySelectorAll(\".desktop-icon.selected\").forEach((ic) => ic.classList.remove(\"selected\"));\r\n        icon.classList.add(\"selected\");\r\n        group = [icon];\r\n      }\r\n      const shiftX = e.clientX - clickRect.left;\r\n      const shiftY = e.clientY - clickRect.top;\r\n      const groupData = group.map((ic) => {\r\n        const r = ic.getBoundingClientRect();\r\n        const startLeft = r.left - parentRect.left;\r\n        const startTop = r.top - parentRect.top;\r\n        ic.style.left = `${startLeft}px`;\r\n        ic.style.top = `${startTop}px`;\r\n        ic.style.zIndex = getNextZIndex();\r\n        return { icon: ic, startLeft, startTop };\r\n      });\r\n      function onMouseMove(e) {\r\n        const dx = e.clientX - shiftX - parentRect.left - groupData[0].startLeft;\r\n        const dy = e.clientY - shiftY - parentRect.top - groupData[0].startTop;\r\n        groupData.forEach(({ icon, startLeft, startTop }) => {\r\n          icon.style.left = `${startLeft + dx}px`;\r\n          icon.style.top = `${startTop + dy}px`;\r\n        });\r\n      }\r\n      document.addEventListener(\"mousemove\", onMouseMove, { passive: true });\r\n      document.addEventListener(\r\n        \"mouseup\",\r\n        () => {\r\n          document.removeEventListener(\"mousemove\", onMouseMove);\r\n        },\r\n        { once: true, passive: true }\r\n      );\r\n    });\r\n    icon.ondragstart = () => false;\r\n  });\r\n}\r\n\r\n// ===== MULTI-SELECT =====\r\nlet selStartX, selStartY, selDiv;\r\nfunction onSelectStart(e) {\r\n  if (e.target.closest(\".desktop-icon, .popup-window, #start-bar, #start-menu\")) return;\r\n  selStartX = e.clientX;\r\n  selStartY = e.clientY;\r\n  selDiv = document.createElement(\"div\");\r\n  selDiv.id = \"selection-rect\";\r\n  selDiv.style.left = `${selStartX}px`;\r\n  selDiv.style.top = `${selStartY}px`;\r\n  selDiv.style.width = \"0px\";\r\n  selDiv.style.height = \"0px\";\r\n  document.body.appendChild(selDiv);\r\n  document.addEventListener(\"mousemove\", onSelectMove, { passive: true });\r\n  document.addEventListener(\"mouseup\", onSelectEnd, { once: true, passive: true });\r\n  e.preventDefault();\r\n}\r\n\r\nfunction onSelectMove(e) {\r\n  if (!selDiv) return;\r\n  const x = Math.min(e.clientX, selStartX),\r\n    y = Math.min(e.clientY, selStartY),\r\n    w = Math.abs(e.clientX - selStartX),\r\n    h = Math.abs(e.clientY - selStartY);\r\n  selDiv.style.left = `${x}px`;\r\n  selDiv.style.top = `${y}px`;\r\n  selDiv.style.width = `${w}px`;\r\n  selDiv.style.height = `${h}px`;\r\n  const box = selDiv.getBoundingClientRect();\r\n  document.querySelectorAll(\".desktop-icon\").forEach((icon) => {\r\n    const r = icon.getBoundingClientRect();\r\n    const inside = r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom;\r\n    icon.classList.toggle(\"selected\", inside);\r\n  });\r\n}\r\n\r\nfunction onSelectEnd() {\r\n  if (selDiv) selDiv.remove();\r\n  selDiv = null;\r\n}\r\n\r\n\r\n// ===== STARFIELD BACKGROUND =====\r\nfunction initStarfield() {\r\n  const canvas = document.getElementById(\"background-canvas\");\r\n  if (!canvas) return;\r\n\r\n  const ctx = canvas.getContext(\"2d\");\r\n  if (!ctx) return;\r\n\r\n  let stars = [];\r\n  const STAR_COUNT = 500;\r\n  function initStars() {\r\n    stars = Array.from({ length: STAR_COUNT }, () => ({\r\n      x: Math.random() * canvas.width,\r\n      y: Math.random() * canvas.height,\r\n      z: Math.random() * canvas.width,\r\n      o: Math.random()\r\n    }));\r\n  }\r\n\r\n  function drawStars() {\r\n    // full‐opacity background to create motion-blur effect\r\n    ctx.fillStyle = 'rgba(0,0,0,1)';\r\n    ctx.fillRect(0, 0, canvas.width, canvas.height);\r\n\r\n    for (let s of stars) {\r\n      // twinkle\r\n      s.o += (Math.random() - 0.5) * 0.02;\r\n      s.o = Math.max(0.1, Math.min(1, s.o));\r\n\r\n      // move forward\r\n      s.z -= 2;\r\n      if (s.z <= 0) {\r\n        s.z = canvas.width;\r\n        s.x = Math.random() * canvas.width;\r\n        s.y = Math.random() * canvas.height;\r\n        s.o = Math.random();\r\n      }\r\n\r\n      const k  = 128.0 / s.z;\r\n      const px = (s.x - canvas.width / 2) * k + canvas.width  / 2;\r\n      const py = (s.y - canvas.height / 2) * k + canvas.height / 2;\r\n      const sz = Math.max(0.5, (1 - s.z / canvas.width) * 2);  // half as big\r\n\r\n      ctx.globalAlpha = s.o;\r\n      ctx.fillStyle   = '#fff';\r\n      ctx.beginPath();\r\n      ctx.arc(px, py, sz, 0, Math.PI * 2);\r\n      ctx.fill();\r\n    }\r\n\r\n    ctx.globalAlpha = 1;\r\n  }\r\n\r\n  // on resize, recalc canvas + reinit stars\r\n  window.addEventListener('resize', debounce(() => {\r\n    canvas.width  = window.innerWidth;\r\n    canvas.height = window.innerHeight;\r\n    initStars();\r\n  }, 250));\r\n\r\n  // initial sizing & stars\r\n  canvas.width  = window.innerWidth;\r\n  canvas.height = window.innerHeight;\r\n  initStars();\r\n\r\n  // loop\r\n  function animate() {\r\n    drawStars();\r\n    requestAnimationFrame(animate);\r\n  }\r\n  requestAnimationFrame(animate);\r\n}\r\n\r\n// ===== GLITCH EFFECTS =====\r\nfunction initGlitchEffects() {\r\n  setInterval(() => {\r\n    document.querySelectorAll(\".glitch-me\").forEach((el) => {\r\n      if (Math.random() > 0.95) {\r\n        el.classList.add(\"glitching\");\r\n        setTimeout(() => el.classList.remove(\"glitching\"), 200 + Math.random() * 400);\r\n      }\r\n    });\r\n  }, 2000);\r\n\r\n  setInterval(() => {\r\n    if (Math.random() > 0.98) {\r\n      const glitch = document.createElement(\"div\");\r\n      glitch.className = \"screen-glitch\";\r\n      document.body.appendChild(glitch);\r\n      setTimeout(() => glitch.remove(), 150 + Math.random() * 250);\r\n    }\r\n  }, 10000);\r\n}\r\n\r\n// ===== IFRAME HANDLING =====\r\nfunction initIframeHandling() {\r\n  console.log(\"🖼️ Initializing iframe handling with display-only reload logic\");\r\n  \r\n  document.querySelectorAll('iframe').forEach(iframe => {\r\n    const originalSrc = iframe.src;\r\n    const parent = iframe.closest('.popup-window');\r\n    if (!parent) return;\r\n\r\n    // Track if the window was previously hidden\r\n    let wasHidden = parent.style.display === 'none';\r\n    \r\n    const observer = new MutationObserver(mutations => {\r\n      mutations.forEach(m => {\r\n        if (m.attributeName === 'style') {\r\n          const isHiddenNow = parent.style.display === 'none';\r\n          \r\n          // Only reload if window was hidden and is now visible\r\n          if (wasHidden && !isHiddenNow && iframe.src !== originalSrc) {\r\n            console.log(`🔄 Window became visible, restoring iframe src: ${iframe.id || 'unnamed'}`);\r\n            iframe.src = originalSrc;\r\n          }\r\n          \r\n          // Update hidden state for next time\r\n          wasHidden = isHiddenNow;\r\n        }\r\n      });\r\n    });\r\n\r\n    observer.observe(parent, { attributes: true, attributeFilter: ['style'] });\r\n    console.log(`🔍 Observer attached to iframe: ${iframe.id || 'unnamed'}`);\r\n  });\r\n}\r\n\r\n// ===== INITIALIZATION =====\r\n// Add event listener for window selection\r\nwindow.addEventListener(\"mousedown\", onSelectStart);\r\n\r\n// Override the openWindow function in the global scope\r\n// This ensures our version is used by the start menu links\r\nwindow.openWindow = openWindow;\n\n//# sourceURL=webpack://bbfiller/./src/consolidated.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "bbfiller:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"consolidated": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkbbfiller"] = self["webpackChunkbbfiller"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/consolidated.js");
/******/ 	
/******/ })()
;