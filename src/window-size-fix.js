(function() {
document.addEventListener("DOMContentLoaded", function() {
  console.log("🪟 Applying window size fix...");
  
  // Default window dimensions - larger square format
  const DEFAULT_WINDOW_WIDTH = "640px";  // Wider
  const DEFAULT_WINDOW_HEIGHT = "580px"; // Taller
  
  // Function to set default window size
  function setDefaultWindowSize() {
    // Get all popup windows
    const windows = document.querySelectorAll(".popup-window");
    
    windows.forEach(function(win) {
      // Set default size if not already set
      if (!win.style.width || win.style.width === "auto") {
        win.style.width = DEFAULT_WINDOW_WIDTH;
      }
      
      if (!win.style.height || win.style.height === "auto") {
        win.style.height = DEFAULT_WINDOW_HEIGHT;
      }
      
      console.log(`🪟 Set default size for window: ${win.id}`);
    });
  }
  
  // Run immediately to set sizes for existing windows
  setDefaultWindowSize();
  
  // Override the openWindow function to ensure new windows use the correct size
  if (typeof window.openWindow === 'function') {
    const originalOpenWindow = window.openWindow;
    
    window.openWindow = function(id) {
      // Call the original function
      const windowElement = originalOpenWindow(id);
      
      // Apply our size settings
      if (windowElement) {
        windowElement.style.width = DEFAULT_WINDOW_WIDTH;
        windowElement.style.height = DEFAULT_WINDOW_HEIGHT;
        
        // Center the window on screen
        centerWindow(windowElement);
        
        console.log(`🪟 Opened window with larger size: ${id}`);
      }
      
      return windowElement;
    };
    
    console.log("🪟 Enhanced openWindow function with larger default size");
  }
  
  // Function to center a window on screen
  function centerWindow(windowElement) {
    const windowWidth = parseInt(windowElement.style.width);
    const windowHeight = parseInt(windowElement.style.height);
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const left = Math.max(0, (screenWidth - windowWidth) / 2);
    const top = Math.max(0, (screenHeight - windowHeight) / 2);
    
    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
  }
  
  // Apply to any windows that might be opened later
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.classList && node.classList.contains("popup-window")) {
            // Set size for newly added windows
            node.style.width = DEFAULT_WINDOW_WIDTH;
            node.style.height = DEFAULT_WINDOW_HEIGHT;
            centerWindow(node);
          }
        });
      }
    });
  });
  
  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log("🪟 Window size fix applied");
});

})();