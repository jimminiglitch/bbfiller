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

/***/ "./src/lazy-loader.js":
/*!****************************!*\
  !*** ./src/lazy-loader.js ***!
  \****************************/
/***/ (() => {

eval("// Lazy loading for videos & iframes\r\ndocument.addEventListener('DOMContentLoaded', () => {\r\n  const supportsIO = 'IntersectionObserver' in window;\r\n  const ioOptions = { rootMargin: '50px 0px', threshold: 0.1 };\r\n\r\n  // loader knows how to handle video vs iframe\r\n  const loadMedia = el => {\r\n    const src = el.dataset.src;\r\n    if (!src) return;\r\n    console.log(`Loading ${el.tagName.toLowerCase()}: ${src}`);\r\n    el.src = src;\r\n    if (el.tagName === 'VIDEO') el.load();\r\n  };\r\n\r\n  // collect both videos and iframes in one go\r\n  const lazyEls = [\r\n    ...document.querySelectorAll('video[data-src]'),\r\n    ...document.querySelectorAll('iframe[data-src]')\r\n  ];\r\n\r\n  if (supportsIO) {\r\n    const observer = new IntersectionObserver((entries, obs) => {\r\n      entries.forEach(({ isIntersecting, target }) => {\r\n        if (isIntersecting) {\r\n          loadMedia(target);\r\n          obs.unobserve(target);\r\n        }\r\n      });\r\n    }, ioOptions);\r\n    lazyEls.forEach(el => observer.observe(el));\r\n  } else {\r\n    // fallback: load everything immediately\r\n    lazyEls.forEach(loadMedia);\r\n  }\r\n\r\n  // also load media when a window is opened\r\n  document.querySelectorAll('[data-window]').forEach(icon => {\r\n    icon.addEventListener('click', () => {\r\n      const win = document.getElementById(icon.dataset.window);\r\n      if (!win) return;\r\n      win.querySelectorAll('video[data-src],iframe[data-src]').forEach(el => {\r\n        if (!el.src) {\r\n          setTimeout(() => loadMedia(el), 500);\r\n        }\r\n      });\r\n    });\r\n  });\r\n});\r\n\n\n//# sourceURL=webpack://bbfiller/./src/lazy-loader.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/lazy-loader.js"]();
/******/ 	
/******/ })()
;