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

/***/ "./src/window-size-fix.js":
/*!********************************!*\
  !*** ./src/window-size-fix.js ***!
  \********************************/
/***/ (() => {

eval("// Window Size Fix - Apply this to make windows open larger by default\r\n\r\ndocument.addEventListener(\"DOMContentLoaded\", function() {\r\n  console.log(\"🪟 Applying window size fix...\");\r\n  \r\n  // Default window dimensions - larger square format\r\n  const DEFAULT_WINDOW_WIDTH = \"640px\";  // Wider\r\n  const DEFAULT_WINDOW_HEIGHT = \"580px\"; // Taller\r\n  \r\n  // Function to set default window size\r\n  function setDefaultWindowSize() {\r\n    // Get all popup windows\r\n    const windows = document.querySelectorAll(\".popup-window\");\r\n    \r\n    windows.forEach(function(win) {\r\n      // Set default size if not already set\r\n      if (!win.style.width || win.style.width === \"auto\") {\r\n        win.style.width = DEFAULT_WINDOW_WIDTH;\r\n      }\r\n      \r\n      if (!win.style.height || win.style.height === \"auto\") {\r\n        win.style.height = DEFAULT_WINDOW_HEIGHT;\r\n      }\r\n      \r\n      console.log(`🪟 Set default size for window: ${win.id}`);\r\n    });\r\n  }\r\n  \r\n  // Run immediately to set sizes for existing windows\r\n  setDefaultWindowSize();\r\n  \r\n  // Override the openWindow function to ensure new windows use the correct size\r\n  if (typeof window.openWindow === 'function') {\r\n    const originalOpenWindow = window.openWindow;\r\n    \r\n    window.openWindow = function(id) {\r\n      // Call the original function\r\n      const windowElement = originalOpenWindow(id);\r\n      \r\n      // Apply our size settings\r\n      if (windowElement) {\r\n        windowElement.style.width = DEFAULT_WINDOW_WIDTH;\r\n        windowElement.style.height = DEFAULT_WINDOW_HEIGHT;\r\n        \r\n        // Center the window on screen\r\n        centerWindow(windowElement);\r\n        \r\n        console.log(`🪟 Opened window with larger size: ${id}`);\r\n      }\r\n      \r\n      return windowElement;\r\n    };\r\n    \r\n    console.log(\"🪟 Enhanced openWindow function with larger default size\");\r\n  }\r\n  \r\n  // Function to center a window on screen\r\n  function centerWindow(windowElement) {\r\n    const windowWidth = parseInt(windowElement.style.width);\r\n    const windowHeight = parseInt(windowElement.style.height);\r\n    \r\n    const screenWidth = window.innerWidth;\r\n    const screenHeight = window.innerHeight;\r\n    \r\n    const left = Math.max(0, (screenWidth - windowWidth) / 2);\r\n    const top = Math.max(0, (screenHeight - windowHeight) / 2);\r\n    \r\n    windowElement.style.left = `${left}px`;\r\n    windowElement.style.top = `${top}px`;\r\n  }\r\n  \r\n  // Apply to any windows that might be opened later\r\n  const observer = new MutationObserver(function(mutations) {\r\n    mutations.forEach(function(mutation) {\r\n      if (mutation.addedNodes.length) {\r\n        mutation.addedNodes.forEach(function(node) {\r\n          if (node.classList && node.classList.contains(\"popup-window\")) {\r\n            // Set size for newly added windows\r\n            node.style.width = DEFAULT_WINDOW_WIDTH;\r\n            node.style.height = DEFAULT_WINDOW_HEIGHT;\r\n            centerWindow(node);\r\n          }\r\n        });\r\n      }\r\n    });\r\n  });\r\n  \r\n  // Start observing the document body for added nodes\r\n  observer.observe(document.body, { childList: true, subtree: true });\r\n  \r\n  console.log(\"🪟 Window size fix applied\");\r\n});\n\n//# sourceURL=webpack://bbfiller/./src/window-size-fix.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/window-size-fix.js"]();
/******/ 	
/******/ })()
;