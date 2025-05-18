(function() {

// Lazy loading for videos & iframes
document.addEventListener('DOMContentLoaded', () => {
  const supportsIO = 'IntersectionObserver' in window;
  const ioOptions = { rootMargin: '50px 0px', threshold: 0.1 };

  // loader knows how to handle video vs iframe
  const loadMedia = el => {
    const src = el.dataset.src;
    if (!src) return;
    console.log(`Loading ${el.tagName.toLowerCase()}: ${src}`);
    el.src = src;
    if (el.tagName === 'VIDEO') el.load();
  };

  // collect both videos and iframes in one go
  const lazyEls = [
    ...document.querySelectorAll('video[data-src]'),
    ...document.querySelectorAll('iframe[data-src]')
  ];

  if (supportsIO) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          loadMedia(target);
          obs.unobserve(target);
        }
      });
    }, ioOptions);
    lazyEls.forEach(el => observer.observe(el));
  } else {
    // fallback: load everything immediately
    lazyEls.forEach(loadMedia);
  }

  // also load media when a window is opened
  document.querySelectorAll('[data-window]').forEach(icon => {
    icon.addEventListener('click', () => {
      const win = document.getElementById(icon.dataset.window);
      if (!win) return;
      win.querySelectorAll('video[data-src],iframe[data-src]').forEach(el => {
        if (!el.src) {
          setTimeout(() => loadMedia(el), 500);
        }
      });
    });
  });
});

})();