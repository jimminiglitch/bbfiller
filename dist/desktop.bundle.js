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

/***/ "./src/desktop.js":
/*!************************!*\
  !*** ./src/desktop.js ***!
  \************************/
/***/ (() => {

eval("\r\ndocument.addEventListener(\"DOMContentLoaded\", () => {\r\n  console.log(\"🚀 Vaporwave cursor initializing...\");\r\n\r\n  const cursor = document.createElement('div');\r\n  cursor.className = 'custom-cursor';\r\n  const dot = document.createElement('div');\r\n  dot.className = 'cursor-dot';\r\n  cursor.appendChild(dot);\r\n  document.body.appendChild(cursor);\r\n\r\n  document.addEventListener('mousemove', e => {\r\n    cursor.style.left = `${e.clientX}px`;\r\n    cursor.style.top = `${e.clientY}px`;\r\n    cursor.style.transform = 'translate(-50%, -50%)';\r\n  });\r\n\r\n  document.addEventListener('click', () => {\r\n    dot.classList.add('cursor-click');\r\n    setTimeout(() => dot.classList.remove('cursor-click'), 300);\r\n  });\r\n\r\n  console.log(\"✨ Vaporwave cursor ready!\");\r\n});\r\n\n\n//# sourceURL=webpack://bbfiller/./src/desktop.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/desktop.js"]();
/******/ 	
/******/ })()
;