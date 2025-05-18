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

/***/ "./src/folder.js":
/*!***********************!*\
  !*** ./src/folder.js ***!
  \***********************/
/***/ (() => {

eval("document.addEventListener(\"DOMContentLoaded\", () => {\r\n  const folderWindow = document.querySelector(\".folder-window\");\r\n  const folderName = folderWindow.dataset.folderName || \"Folder\";\r\n  folderWindow.querySelector(\".window-header\").textContent = \"📁 \" + folderName;\r\n\r\n  const folderContent = document.getElementById(\"folder-content\");\r\n\r\n  function makeDraggable(icon) {\r\n    icon.setAttribute(\"draggable\", \"true\");\r\n    icon.addEventListener(\"dragstart\", (e) => {\r\n      e.dataTransfer.setData(\"text/plain\", icon.id);\r\n    });\r\n  }\r\n\r\n  function enableDropZone(container) {\r\n    container.addEventListener(\"dragover\", (e) => e.preventDefault());\r\n    container.addEventListener(\"drop\", (e) => {\r\n      e.preventDefault();\r\n      const id = e.dataTransfer.getData(\"text/plain\");\r\n      const icon = document.getElementById(id);\r\n      if (icon && container !== icon.parentElement) {\r\n        container.appendChild(icon);\r\n      }\r\n    });\r\n  }\r\n\r\n  enableDropZone(folderContent);\r\n});\r\n\n\n//# sourceURL=webpack://bbfiller/./src/folder.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/folder.js"]();
/******/ 	
/******/ })()
;