/**
 * enhanced-video-system.js
 * Handles direct video files, Vimeo embeds, and YouTube embeds with a consistent interface,
 * CORS-friendly version with improved error handling, proper cleanup, and reset on reopen
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Enhanced video system initializing...");

  // ───────────────────────────────────────────────────────────────────────────────
  // Video configuration: add your window IDs here. For YouTube entries, poster
  // thumbnails come from YouTube's image API.
  // ───────────────────────────────────────────────────────────────────────────────
  const videoConfig = {
    "Joyful": {
      type: "direct",
      src: "https://cdn.glitch.me/25331b85-e206-4347-93a8-666983818ff8/A Joyful and Meaningful Life.mp4?v=1746824993856",
      poster: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/VaporTV.png?v=1746411817932",
      title: "A Joyful and Meaningful Life",
      description: "Phantom of the Oprah pt. 3",
    },
    "Papaz": {
      type: "direct",
      src: "https://cdn.glitch.me/25331b85-e206-4347-93a8-666983818ff8/papaz.mp4?v=1746823684714",
      poster: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/VaporTV.png?v=1746411817932",
      title: "Papaz",
      description: "S.E.P. Challenge Video 2",
    },
    "Abstract": {
      type: "direct",
      src: "https://cdn.glitch.me/25331b85-e206-4347-93a8-666983818ff8/abstract.mp4?v=1746822321138",
      poster: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/VaporTV.png?v=1746411817932",
      title: "Abstract",
      description: "S.E.P. Challenge Video 6",
    },
    "weight": {
      type: "vimeo",
      id: "1082536082",
      poster: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/VaporTV.png?v=1746411817932",
      title: "The Weight of Care",
      description: "An experimental documentary on the emotional weight of private care medicine in the USA.",
    },
    // ───────────────────────────────────────────────────────────────────────────
    // YouTube entries: use your popup-window IDs to match these keys.
    // Posters are YouTube thumbnails.
    // ───────────────────────────────────────────────────────────────────────────
    "birdbrian": {
      type: "youtube",
      id: "6l2BltEBLt0",        // ← real YouTube ID for Birding with Brian
      poster: "https://img.youtube.com/vi/6l2BltEBLt0/hqdefault.jpg",
      title: "Birding with Brian",
      description: "A documentary film about Birding with Brian."
    },
    "clydecup": {
      type: "youtube",
      id: "16N_xqMwHDg",       // ← real YouTube ID for The Illustrious Clyde Cup
      poster: "https://img.youtube.com/vi/16N_xqMwHDg/hqdefault.jpg",
      title: "The Illustrious Clyde Cup",
      description: ""
    }
  };

  // Store references to active players for cleanup
  const activeVideoPlayers = new Map();

  // ───────────────────────────────────────────────────────────────────────────────
  // resetVideoWindow: remove old iframes/loading spinners & restore poster overlay
  // ───────────────────────────────────────────────────────────────────────────────
  function resetVideoWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    const container = win.querySelector(".video-container");
    if (!container) return;

    // remove any old loading indicators
    container.querySelectorAll(".loading-indicator").forEach(el => el.remove());
    // remove any leftover iframes
    container.querySelectorAll("iframe").forEach(el => el.remove());
    // restore the poster-overlay
    const poster = container.querySelector(".poster-overlay");
    if (poster) poster.style.display = "flex";
    // forget the old player reference
    activeVideoPlayers.delete(windowId);
  }

  // ───────────────────────────────────────────────────────────────────────────────
  // Locate & set up each video window based on its config
  // ───────────────────────────────────────────────────────────────────────────────
  const videoWindows = document.querySelectorAll(
    '[id="Joyful"], [id="Papaz"], [id="Abstract"], [id="weight"], [id="birdbrian"], [id="clydecup"]'
  );
  console.log(`🔍 Found ${videoWindows.length} video windows`);

  videoWindows.forEach(win => {
    const windowId = win.id;
    const config   = videoConfig[windowId];
    if (!config) {
      console.error(`❌ No configuration for video window: ${windowId}`);
      return;
    }

    console.log(`🎬 Setting up video window: ${windowId}`);
    const windowContent = win.querySelector(".window-content");
    if (!windowContent) {
      console.error(`❌ .window-content not found for: ${windowId}`);
      return;
    }

    // Clear any existing content
    windowContent.innerHTML = "";

    // Container
    const container = document.createElement("div");
    container.className = "video-container";
    Object.assign(container.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      backgroundColor: "black",
      border: "2px solid #00ffff",
      borderRadius: "8px"
    });

    // Poster overlay
    const posterOverlay = document.createElement("div");
    posterOverlay.className = "poster-overlay";
    Object.assign(posterOverlay.style, {
      position: "absolute",
      inset: "0",
      backgroundImage: `url('${config.poster}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: "2"
    });

    // Play button
    const playButton = document.createElement("div");
    playButton.className = "play-button";
    Object.assign(playButton.style, {
      fontFamily: "'Press Start 2P', monospace",
      background: "rgba(0,0,0,0.7)",
      color: "#00ffff",
      padding: "0.5rem 1rem",
      border: "2px solid #00ffff",
      boxShadow: "0 0 10px rgba(0,255,255,0.5)"
    });
    playButton.textContent = "▶ PLAY";

    posterOverlay.appendChild(playButton);
    container.appendChild(posterOverlay);

    // Info
    const infoContainer = document.createElement("div");
    infoContainer.className = "video-info";
    Object.assign(infoContainer.style, { padding: "10px", textAlign: "center" });
    const titleEl = document.createElement("h3");
    titleEl.textContent = config.title;
    titleEl.style.color = "#00ffff";
    titleEl.style.margin = "0 0 5px 0";
    const descEl = document.createElement("p");
    descEl.textContent = config.description;
    descEl.style.color = "#ccffff";
    descEl.style.margin = "0";
    infoContainer.append(titleEl, descEl);

    // Click to play
    posterOverlay.addEventListener("click", () => {
      console.log(`▶ PLAY clicked for: ${windowId}`);
      // Loading indicator
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "loading-indicator";
      loadingIndicator.textContent = "LOADING…";
      Object.assign(loadingIndicator.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#00ffff",
        zIndex: "1",
        fontFamily: "'Press Start 2P', monospace",
        textShadow: "0 0 5px #00ffff"
      });
      container.appendChild(loadingIndicator);

      let iframe = document.createElement("iframe");
      Object.assign(iframe.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "none"
      });
      iframe.allowFullscreen = true;

      if (config.type === "direct") {
        // direct video via local player
        let url = "/pages/video-player.html?";
        url += `type=direct&src=${encodeURIComponent(config.src)}`;
        url += `&poster=${encodeURIComponent(config.poster)}`;
        url += `&title=${encodeURIComponent(config.title)}`;
        url += `&description=${encodeURIComponent(config.description)}`;
        url += `&autoplay=true`;
        iframe.src = url;
      }
      else if (config.type === "vimeo") {
        iframe.src = `https://player.vimeo.com/video/${config.id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;
        iframe.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media";
      }
      else if (config.type === "youtube") {
        iframe.src = `https://www.youtube.com/embed/${config.id}?autoplay=1&rel=0&modestbranding=1`;
        iframe.allow = "autoplay; fullscreen";
      }

      iframe.onerror = () => {
        console.error(`❌ Failed to load iframe for: ${windowId}`);
        loadingIndicator.textContent = "ERROR LOADING VIDEO";
        loadingIndicator.style.color = "red";
      };
      iframe.onload = () => {
        posterOverlay.style.display = "none";
        loadingIndicator.style.display = "none";
      };

      container.appendChild(iframe);
      activeVideoPlayers.set(windowId, { type: "iframe", element: iframe });
    });

    // Append everything
    windowContent.append(container, infoContainer);

    // Cleanup on close
    const closeButton = win.querySelector(".close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        console.log(`🔄 Cleaning up video for: ${windowId}`);
        const playerInfo = activeVideoPlayers.get(windowId);
        if (playerInfo && playerInfo.element) {
          playerInfo.element.src = "";
          setTimeout(() => playerInfo.element.remove(), 100);
        }
        win.querySelectorAll("iframe, video").forEach(el => {
          try { el.pause?.(); } catch {}
          el.remove();
        });
        const poster = win.querySelector(".poster-overlay");
        if (poster) poster.style.display = "flex";
        activeVideoPlayers.delete(windowId);
      });
    }
  });

  // Global cleanup on unload
  window.addEventListener("beforeunload", () => {
    console.log("🧹 Global cleanup of all videos");
    activeVideoPlayers.forEach(info => info.element.src = "");
    document.querySelectorAll("iframe, video").forEach(el => {
      try { el.pause?.(); } catch {}
      el.remove();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────────
  // Override openWindow so it resets each media window before showing it
  // ───────────────────────────────────────────────────────────────────────────────
  const __origOpen = window.openWindow || function(id){};
  window.openWindow = function(id) {
    resetVideoWindow(id);
    __origOpen(id);
  };

  console.log("🎬 Video system initialization complete");
});


