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

/***/ "./src/media-loading.js":
/*!******************************!*\
  !*** ./src/media-loading.js ***!
  \******************************/
/***/ (() => {

eval("(() => {\r\n  const log = (...msgs) => console.log('🎬', ...msgs);\r\n\r\n  // Helper: detect empty/invalid src\r\n  const isInvalidSrc = src =>\r\n    !src || ['undefined', 'null'].includes(src.trim());\r\n\r\n  // Helper: generate a simple SVG poster\r\n  const makePoster = (text, color = '#00ffff') =>\r\n    `data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"240\"%3E` +\r\n    `%3Crect width=\"320\" height=\"240\" fill=\"%23000\"/%3E` +\r\n    `%3Ctext x=\"50%25\" y=\"50%25\" font-family=\"monospace\" font-size=\"14\" text-anchor=\"middle\" fill=\"${encodeURIComponent(color)}\"%3E` +\r\n    `${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;\r\n\r\n  // Add a one-time error handler to an element\r\n  const ensureErrorHandler = (el, onError) => {\r\n    if (!el.dataset.errorHandler) {\r\n      el.addEventListener('error', onError);\r\n      el.dataset.errorHandler = 'true';\r\n    }\r\n  };\r\n\r\n  // Core fixer for <video> and <audio>\r\n  const fixMedia = el => {\r\n    try {\r\n      const { tagName, src } = el;\r\n      // 1) Clean up bad src\r\n      if (isInvalidSrc(src)) {\r\n        el.removeAttribute('src');\r\n        if (tagName === 'VIDEO' && !el.querySelector('source')) {\r\n          el.poster ||= makePoster('No Video');\r\n        }\r\n      }\r\n\r\n      // 2) Attach error handler\r\n      ensureErrorHandler(el, e => {\r\n        const msg = e.target.error?.message || 'Unknown error';\r\n        log(`${tagName.toLowerCase()} error:`, msg);\r\n        if (tagName === 'VIDEO' && !el.poster) {\r\n          el.poster = makePoster('Error', '#ff0000');\r\n        }\r\n      });\r\n\r\n      // 3) Tame autoplay policies\r\n      if (el.hasAttribute('autoplay')) {\r\n        el.muted = true;\r\n        el.playsInline = true;\r\n      }\r\n\r\n      // 4) If it’s a video, explicitly call load() after a new src\r\n      if (tagName === 'VIDEO' && el.src && el.autoplay) {\r\n        requestAnimationFrame(() => el.load());\r\n      }\r\n    } catch (err) {\r\n      console.error('Media fix failed for', el, err);\r\n    }\r\n  };\r\n\r\n  // Observe any added <video> or <audio>\r\n  const initMutationObserver = () => {\r\n    const mo = new MutationObserver(muts => {\r\n      muts.forEach(m => {\r\n        m.addedNodes.forEach(node => {\r\n          if (!(node instanceof Element)) return;\r\n          if (['VIDEO','AUDIO'].includes(node.tagName)) {\r\n            fixMedia(node);\r\n          }\r\n          node.querySelectorAll('video,audio').forEach(fixMedia);\r\n        });\r\n      });\r\n    });\r\n    mo.observe(document.body, { childList: true, subtree: true });\r\n  };\r\n\r\n  // Wrap your window-open to re-fix media in newly created windows\r\n  const overrideWindowOpen = () => {\r\n    if (typeof window.openWindow !== 'function') return;\r\n    const original = window.openWindow;\r\n    window.openWindow = id => {\r\n      const win = original(id);\r\n      if (win) {\r\n        // small delay to let content render\r\n        setTimeout(() => {\r\n          win.querySelectorAll('video,audio').forEach(fixMedia);\r\n          log(`Checked media in window:`, id);\r\n        }, 100);\r\n      }\r\n      return win;\r\n    };\r\n  };\r\n\r\n  // Bootstrap on DOM ready\r\n  document.addEventListener('DOMContentLoaded', () => {\r\n    log('Initializing Media Loading Fix…');\r\n    // 1) Fix existing media\r\n    document.querySelectorAll('video,audio').forEach(fixMedia);\r\n    // 2) Watch for future media\r\n    initMutationObserver();\r\n    // 3) Wrap window-open hook\r\n    overrideWindowOpen();\r\n    log('Media Loading Fix initialized');\r\n  });\r\n})();\r\n\n\n//# sourceURL=webpack://bbfiller/./src/media-loading.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/media-loading.js"]();
/******/ 	
/******/ })()
;