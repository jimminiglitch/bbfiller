(() => {
  const log = (...msgs) => console.log('🎬', ...msgs);

  // Helper: detect empty/invalid src
  const isInvalidSrc = src =>
    !src || ['undefined', 'null'].includes(src.trim());

  // Helper: generate a simple SVG poster
  const makePoster = (text, color = '#00ffff') =>
    `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="240"%3E` +
    `%3Crect width="320" height="240" fill="%23000"/%3E` +
    `%3Ctext x="50%25" y="50%25" font-family="monospace" font-size="14" text-anchor="middle" fill="${encodeURIComponent(color)}"%3E` +
    `${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;

  // Add a one-time error handler to an element
  const ensureErrorHandler = (el, onError) => {
    if (!el.dataset.errorHandler) {
      el.addEventListener('error', onError);
      el.dataset.errorHandler = 'true';
    }
  };

  // Core fixer for <video> and <audio>
  const fixMedia = el => {
    try {
      const { tagName, src } = el;
      // 1) Clean up bad src
      if (isInvalidSrc(src)) {
        el.removeAttribute('src');
        if (tagName === 'VIDEO' && !el.querySelector('source')) {
          el.poster ||= makePoster('No Video');
        }
      }

      // 2) Attach error handler
      ensureErrorHandler(el, e => {
        const msg = e.target.error?.message || 'Unknown error';
        log(`${tagName.toLowerCase()} error:`, msg);
        if (tagName === 'VIDEO' && !el.poster) {
          el.poster = makePoster('Error', '#ff0000');
        }
      });

      // 3) Tame autoplay policies
      if (el.hasAttribute('autoplay')) {
        el.muted = true;
        el.playsInline = true;
      }

      // 4) If it’s a video, explicitly call load() after a new src
      if (tagName === 'VIDEO' && el.src && el.autoplay) {
        requestAnimationFrame(() => el.load());
      }
    } catch (err) {
      console.error('Media fix failed for', el, err);
    }
  };

  // Observe any added <video> or <audio>
  const initMutationObserver = () => {
    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (['VIDEO','AUDIO'].includes(node.tagName)) {
            fixMedia(node);
          }
          node.querySelectorAll('video,audio').forEach(fixMedia);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };

  // Wrap your window-open to re-fix media in newly created windows
  const overrideWindowOpen = () => {
    if (typeof window.openWindow !== 'function') return;
    const original = window.openWindow;
    window.openWindow = id => {
      const win = original(id);
      if (win) {
        // small delay to let content render
        setTimeout(() => {
          win.querySelectorAll('video,audio').forEach(fixMedia);
          log(`Checked media in window:`, id);
        }, 100);
      }
      return win;
    };
  };

  // Bootstrap on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    log('Initializing Media Loading Fix…');
    // 1) Fix existing media
    document.querySelectorAll('video,audio').forEach(fixMedia);
    // 2) Watch for future media
    initMutationObserver();
    // 3) Wrap window-open hook
    overrideWindowOpen();
    log('Media Loading Fix initialized');
  });
})();
