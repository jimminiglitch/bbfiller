/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Accessibility: () => (/* binding */ Accessibility),\n/* harmony export */   DOM: () => (/* binding */ DOM),\n/* harmony export */   Device: () => (/* binding */ Device),\n/* harmony export */   Performance: () => (/* binding */ Performance),\n/* harmony export */   Storage: () => (/* binding */ Storage),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/**\r\n * Utility Functions Module\r\n * Centralized utilities for the application\r\n */\r\n\r\n// DOM utilities\r\nconst DOM = {\r\n  // Cache for DOM elements\r\n  cache: new Map(),\r\n  \r\n  // Get element by ID with caching\r\n  get(id) {\r\n    if (!this.cache.has(id)) {\r\n      const element = document.getElementById(id);\r\n      if (element) {\r\n        this.cache.set(id, element);\r\n      }\r\n      return element;\r\n    }\r\n    return this.cache.get(id);\r\n  },\r\n  \r\n  // Query selector with caching\r\n  query(selector, context = document) {\r\n    const cacheKey = `query:${selector}`;\r\n    if (!this.cache.has(cacheKey)) {\r\n      const element = context.querySelector(selector);\r\n      if (element) {\r\n        this.cache.set(cacheKey, element);\r\n      }\r\n      return element;\r\n    }\r\n    return this.cache.get(cacheKey);\r\n  },\r\n  \r\n  // Query selector all (no caching)\r\n  queryAll(selector, context = document) {\r\n    return context.querySelectorAll(selector);\r\n  },\r\n  \r\n  // Create element with attributes and children\r\n  create(tag, attributes = {}, children = []) {\r\n    const element = document.createElement(tag);\r\n    \r\n    // Set attributes\r\n    Object.entries(attributes).forEach(([key, value]) => {\r\n      if (key === 'style' && typeof value === 'object') {\r\n        Object.entries(value).forEach(([prop, val]) => {\r\n          element.style[prop] = val;\r\n        });\r\n      } else if (key === 'classList' && Array.isArray(value)) {\r\n        value.forEach(cls => element.classList.add(cls));\r\n      } else if (key === 'dataset' && typeof value === 'object') {\r\n        Object.entries(value).forEach(([prop, val]) => {\r\n          element.dataset[prop] = val;\r\n        });\r\n      } else if (key === 'events' && typeof value === 'object') {\r\n        Object.entries(value).forEach(([event, handler]) => {\r\n          element.addEventListener(event, handler);\r\n        });\r\n      } else {\r\n        element.setAttribute(key, value);\r\n      }\r\n    });\r\n    \r\n    // Add children\r\n    children.forEach(child => {\r\n      if (typeof child === 'string') {\r\n        element.appendChild(document.createTextNode(child));\r\n      } else if (child instanceof Node) {\r\n        element.appendChild(child);\r\n      }\r\n    });\r\n    \r\n    return element;\r\n  },\r\n  \r\n  // Add event listener with automatic cleanup\r\n  addEvent(element, event, handler, options) {\r\n    element.addEventListener(event, handler, options);\r\n    \r\n    // Return cleanup function\r\n    return () => {\r\n      element.removeEventListener(event, handler, options);\r\n    };\r\n  },\r\n  \r\n  // Clear cache\r\n  clearCache() {\r\n    this.cache.clear();\r\n  }\r\n};\r\n\r\n// Performance utilities\r\nconst Performance = {\r\n  // Debounce function\r\n  debounce(func, wait = 100) {\r\n    let timeout;\r\n    return function(...args) {\r\n      clearTimeout(timeout);\r\n      timeout = setTimeout(() => func.apply(this, args), wait);\r\n    };\r\n  },\r\n  \r\n  // Throttle function\r\n  throttle(func, limit = 100) {\r\n    let inThrottle;\r\n    return function(...args) {\r\n      if (!inThrottle) {\r\n        func.apply(this, args);\r\n        inThrottle = true;\r\n        setTimeout(() => inThrottle = false, limit);\r\n      }\r\n    };\r\n  },\r\n  \r\n  // Request animation frame with callback\r\n  rafCallback(callback) {\r\n    let ticking = false;\r\n    \r\n    return function(...args) {\r\n      if (!ticking) {\r\n        window.requestAnimationFrame(() => {\r\n          callback.apply(this, args);\r\n          ticking = false;\r\n        });\r\n        ticking = true;\r\n      }\r\n    };\r\n  },\r\n  \r\n  // Measure execution time\r\n  measure(name, func) {\r\n    const start = performance.now();\r\n    const result = func();\r\n    const end = performance.now();\r\n    console.log(`${name} took ${end - start}ms`);\r\n    return result;\r\n  }\r\n};\r\n\r\n// Storage utilities\r\nconst Storage = {\r\n  // Save data to localStorage\r\n  save(key, data) {\r\n    try {\r\n      localStorage.setItem(key, JSON.stringify(data));\r\n      return true;\r\n    } catch (error) {\r\n      console.error(`Error saving to localStorage: ${error}`);\r\n      return false;\r\n    }\r\n  },\r\n  \r\n  // Load data from localStorage\r\n  load(key, defaultValue = null) {\r\n    try {\r\n      const data = localStorage.getItem(key);\r\n      return data ? JSON.parse(data) : defaultValue;\r\n    } catch (error) {\r\n      console.error(`Error loading from localStorage: ${error}`);\r\n      return defaultValue;\r\n    }\r\n  },\r\n  \r\n  // Remove data from localStorage\r\n  remove(key) {\r\n    try {\r\n      localStorage.removeItem(key);\r\n      return true;\r\n    } catch (error) {\r\n      console.error(`Error removing from localStorage: ${error}`);\r\n      return false;\r\n    }\r\n  },\r\n  \r\n  // Clear all data from localStorage\r\n  clear() {\r\n    try {\r\n      localStorage.clear();\r\n      return true;\r\n    } catch (error) {\r\n      console.error(`Error clearing localStorage: ${error}`);\r\n      return false;\r\n    }\r\n  }\r\n};\r\n\r\n// Accessibility utilities\r\nconst Accessibility = {\r\n  // Add ARIA attributes to an element\r\n  setAria(element, attributes) {\r\n    Object.entries(attributes).forEach(([key, value]) => {\r\n      element.setAttribute(`aria-${key}`, value);\r\n    });\r\n  },\r\n  \r\n  // Make an element focusable\r\n  makeFocusable(element, tabIndex = 0) {\r\n    element.setAttribute('tabindex', tabIndex);\r\n  },\r\n  \r\n  // Announce a message to screen readers\r\n  announce(message, politeness = 'polite') {\r\n    let announcer = document.getElementById('a11y-announcer');\r\n    \r\n    if (!announcer) {\r\n      announcer = document.createElement('div');\r\n      announcer.id = 'a11y-announcer';\r\n      announcer.setAttribute('aria-live', politeness);\r\n      announcer.setAttribute('aria-atomic', 'true');\r\n      announcer.style.position = 'absolute';\r\n      announcer.style.width = '1px';\r\n      announcer.style.height = '1px';\r\n      announcer.style.padding = '0';\r\n      announcer.style.overflow = 'hidden';\r\n      announcer.style.clip = 'rect(0, 0, 0, 0)';\r\n      announcer.style.whiteSpace = 'nowrap';\r\n      announcer.style.border = '0';\r\n      document.body.appendChild(announcer);\r\n    }\r\n    \r\n    // Clear previous message\r\n    announcer.textContent = '';\r\n    \r\n    // Set new message after a small delay\r\n    setTimeout(() => {\r\n      announcer.textContent = message;\r\n    }, 50);\r\n  }\r\n};\r\n\r\n// Device detection\r\nconst Device = {\r\n  // Check if device is mobile\r\n  isMobile() {\r\n    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);\r\n  },\r\n  \r\n  // Check if device supports touch\r\n  isTouch() {\r\n    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;\r\n  },\r\n  \r\n  // Check if device is in portrait orientation\r\n  isPortrait() {\r\n    return window.matchMedia('(orientation: portrait)').matches;\r\n  },\r\n  \r\n  // Get device pixel ratio\r\n  getPixelRatio() {\r\n    return window.devicePixelRatio || 1;\r\n  }\r\n};\r\n\r\n// Export all utilities as a single object\r\nconst Utils = {\r\n  DOM,\r\n  Performance,\r\n  Storage,\r\n  Accessibility,\r\n  Device\r\n};\r\n\r\n// Make available globally\r\nwindow.Utils = Utils;\r\n\r\n// Export default\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Utils);\n\n//# sourceURL=webpack://bbfiller/./src/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/utils.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;