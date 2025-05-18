(function() {
  // DOM utilities
  const DOM = {
    // Cache for DOM elements
    cache: new Map(),
    
    // Get element by ID with caching
    get(id) {
      if (!this.cache.has(id)) {
        const element = document.getElementById(id);
        if (element) {
          this.cache.set(id, element);
        }
        return element;
      }
      return this.cache.get(id);
    },
    
    // Query selector with caching
    query(selector, context = document) {
      const cacheKey = `query:${selector}`;
      if (!this.cache.has(cacheKey)) {
        const element = context.querySelector(selector);
        if (element) {
          this.cache.set(cacheKey, element);
        }
        return element;
      }
      return this.cache.get(cacheKey);
    },
    
    // Query selector all (no caching)
    queryAll(selector, context = document) {
      return context.querySelectorAll(selector);
    },
    
    // Create element with attributes and children
    create(tag, attributes = {}, children = []) {
      const element = document.createElement(tag);
      
      // Set attributes
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.entries(value).forEach(([prop, val]) => {
            element.style[prop] = val;
          });
        } else if (key === 'classList' && Array.isArray(value)) {
          value.forEach(cls => element.classList.add(cls));
        } else if (key === 'dataset' && typeof value === 'object') {
          Object.entries(value).forEach(([prop, val]) => {
            element.dataset[prop] = val;
          });
        } else if (key === 'events' && typeof value === 'object') {
          Object.entries(value).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
          });
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Add children
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          element.appendChild(child);
        }
      });
      
      return element;
    },
    
    // Add event listener with automatic cleanup
    addEvent(element, event, handler, options) {
      element.addEventListener(event, handler, options);
      
      // Return cleanup function
      return () => {
        element.removeEventListener(event, handler, options);
      };
    },
    
    // Clear cache
    clearCache() {
      this.cache.clear();
    }
  };

  // Performance utilities
  const Performance = {
    // Debounce function
    debounce(func, wait = 100) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    
    // Throttle function
    throttle(func, limit = 100) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    
    // Request animation frame with callback
    rafCallback(callback) {
      let ticking = false;
      
      return function(...args) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            callback.apply(this, args);
            ticking = false;
          });
          ticking = true;
        }
      };
    },
    
    // Measure execution time
    measure(name, func) {
      const start = performance.now();
      const result = func();
      const end = performance.now();
      console.log(`${name} took ${end - start}ms`);
      return result;
    }
  };

  // Storage utilities
  const Storage = {
    // Save data to localStorage
    save(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(`Error saving to localStorage: ${error}`);
        return false;
      }
    },
    
    // Load data from localStorage
    load(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error(`Error loading from localStorage: ${error}`);
        return defaultValue;
      }
    },
    
    // Remove data from localStorage
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Error removing from localStorage: ${error}`);
        return false;
      }
    },
    
    // Clear all data from localStorage
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error(`Error clearing localStorage: ${error}`);
        return false;
      }
    }
  };

  // Accessibility utilities
  const Accessibility = {
    // Add ARIA attributes to an element
    setAria(element, attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(`aria-${key}`, value);
      });
    },
    
    // Make an element focusable
    makeFocusable(element, tabIndex = 0) {
      element.setAttribute('tabindex', tabIndex);
    },
    
    // Announce a message to screen readers
    announce(message, politeness = 'polite') {
      let announcer = document.getElementById('a11y-announcer');
      
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'a11y-announcer';
        announcer.setAttribute('aria-live', politeness);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.padding = '0';
        announcer.style.overflow = 'hidden';
        announcer.style.clip = 'rect(0, 0, 0, 0)';
        announcer.style.whiteSpace = 'nowrap';
        announcer.style.border = '0';
        document.body.appendChild(announcer);
      }
      
      // Clear previous message
      announcer.textContent = '';
      
      // Set new message after a small delay
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  };

  // Device detection
  const Device = {
    // Check if device is mobile
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Check if device supports touch
    isTouch() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Check if device is in portrait orientation
    isPortrait() {
      return window.matchMedia('(orientation: portrait)').matches;
    },
    
    // Get device pixel ratio
    getPixelRatio() {
      return window.devicePixelRatio || 1;
    }
  };

  // Export all utilities as a single object
  const Utils = {
    DOM,
    Performance,
    Storage,
    Accessibility,
    Device
  };

  // Make available globally
  window.Utils = Utils;
})();