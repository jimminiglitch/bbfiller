// 3D Rave City - UI System

const RaveCity = window.RaveCity || {}

// UI System
RaveCity.UI = {
  // DOM Elements
  elements: {},
  
  // Movement state
  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    speed: 0.15,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    pointerLocked: false,
  },
  
  // FPS counter
  frameCount: 0,
  lastFpsUpdate: 0,
  fps: 0,
  
  // Initialize UI
  init: function() {
    try {
      console.log("Initializing UI...");
      
      // Get DOM elements
      this.getElements();
      
      // Initialize controls
      this.initControls();
      
      // Initialize settings panel
      this.initSettings();
      
      // Initialize track selector
      this.populateTrackSelector();
      
      console.log("UI initialized successfully");
      return this;
    } catch (error) {
      console.error("Failed to initialize UI:", error);
      this.showError(`Failed to initialize UI: ${error.message}`);
      return null;
    }
  },
  
  // Get DOM elements
  getElements: function() {
    this.elements = {
      loadingScreen: document.getElementById("loading-screen"),
      loadingText: document.getElementById("loading-text"),
      progressFill: document.getElementById("progress-fill"),
      progressPercent: document.getElementById("progress-percent"),
      sceneCanvas: document.getElementById("scene-canvas"),
      audioVisualizer: document.getElementById("audio-visualizer"),
      trackInfo: document.getElementById("track-info"),
      audioStatus: document.getElementById("audio-status"),
      errorMessage: document.getElementById("error-message"),
      controlsInfo: document.getElementById("controls-info"),
      themeIndicator: document.getElementById("theme-indicator"),
      themeButton: document.getElementById("theme-button"),
      trackButton: document.getElementById("track-button"),
      trackSelector: document.getElementById("track-selector"),
      audioButton: document.getElementById("audio-button"),
      fullscreenButton: document.getElementById("fullscreen-button"),
      helpButton: document.getElementById("help-button"),
      settingsButton: document.getElementById("settings-button"),
      settingsPanel: document.getElementById("settings-panel"),
      settingsApply: document.getElementById("settings-apply"),
      settingsClose: document.getElementById("settings-close"),
      performanceIndicator: document.getElementById("performance-indicator"),
    };
  },
  
  // Initialize controls
  initControls: function() {
    // Pointer lock
    document.body.addEventListener("click", () => {
      RaveCity.World.controls.lock();
    });
    
    document.addEventListener("pointerlockchange", () => {
      this.movement.pointerLocked = document.pointerLockElement === document.body;
      this.elements.controlsInfo.style.display = this.movement.pointerLocked ? "none" : "block";
    });
    
    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyW":
          this.movement.forward = true;
          break;
        case "KeyS":
          this.movement.backward = true;
          break;
        case "KeyA":
          this.movement.left = true;
          break;
        case "KeyD":
          this.movement.right = true;
          break;
        case "Space":
          this.movement.up = true;
          break;
        case "ShiftLeft":
          this.movement.down = true;
          break;
        case "Escape":
          RaveCity.World.controls.unlock();
          break;
        case "KeyF":
          this.toggleFullscreen();
          break;
        case "KeyM":
          RaveCity.Audio.toggleAudio();
          break;
        case "KeyT":
          this.changeTheme();
          break;
        case "KeyN":
          RaveCity.Audio.playNextTrack();
          break;
        case "KeyP":
          this.toggleSettings();
          break;
        case "KeyH":
          this.toggleControlsInfo();
          break;
      }
    });
    
    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyW":
          this.movement.forward = false;
          break;
        case "KeyS":
          this.movement.backward = false;
          break;
        case "KeyA":
          this.movement.left = false;
          break;
        case "KeyD":
          this.movement.right = false;
          break;
        case "Space":
          this.movement.up = false;
          break;
        case "ShiftLeft":
          this.movement.down = false;
          break;
      }
    });
    
    // Button controls
    this.elements.fullscreenButton.addEventListener("click", () => this.toggleFullscreen());
    this.elements.themeButton.addEventListener("click", () => this.changeTheme());
    this.elements.trackButton.addEventListener("click", () => this.toggleTrackSelector());
    this.elements.audioButton.addEventListener("click", () => RaveCity.Audio.toggleAudio());
    this.elements.helpButton.addEventListener("click", () => this.toggleControlsInfo());
    this.elements.settingsButton.addEventListener("click", () => this.toggleSettings());
    this.elements.settingsApply.addEventListener("click", () => this.applySettings());
    this.elements.settingsClose.addEventListener("click", () => this.toggleSettings());
    
    // Update theme indicator
    this.updateThemeIndicator();
  },
  
  // Initialize settings panel
  initSettings: () => {
    // Set initial values
    document.getElementById("quality-setting").value = RaveCity.Config.quality;
    document.getElementById("density-setting").value = RaveCity.Config.density;
    document.getElementById("fps-setting").checked = RaveCity.Config.showFps;
    document.getElementById("auto-optimize-setting").checked = RaveCity.Config.autoOptimize;
    document.getElementById("bloom-setting").value = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme].bloomStrength;
    document.getElementById("glitch-setting").value = RaveCity.Config.glitchIntensity;
    document.getElementById("color-shift-setting").value = RaveCity.Config.colorShiftSpeed;
    document.getElementById("volume-setting").value = RaveCity.Config.volume;
    document.getElementById("bass-setting").value = RaveCity.Config.bassImpact;
    document.getElementById("random-tracks-setting").checked = RaveCity.Config.randomizeTracks;
    document.getElementById("movement-speed-setting").value = RaveCity.Config.movementSpeed;
    document.getElementById("flying-setting").checked = RaveCity.Config.flyingEnabled;
    document.getElementById("sensitivity-setting").value = RaveCity.Config.mouseSensitivity;
    document.getElementById("dancer-count-setting").value = RaveCity.Config.dancerCount;
    document.getElementById("dancer-detail-setting").value = RaveCity.Config.dancerDetail;
  },
  
  // Populate track selector
  populateTrackSelector: function() {
    const trackNames = Object.keys(RaveCity.Config.audioTracks);
    
    // Clear existing options
    while (this.elements.trackSelector.children.length > 1) {
      this.elements.trackSelector.removeChild(this.elements.trackSelector.lastChild);
    }
    
    trackNames.forEach((trackName) => {
      const track = RaveCity.Config.audioTracks[trackName];
      const trackOption = document.createElement("div");
      trackOption.className = "track-option";
      trackOption.textContent = track.title;
      trackOption.dataset.track = trackName;
      
      if (trackName === RaveCity.Config.audioTrack) {
        trackOption.classList.add("active");
      }
      
      trackOption.addEventListener("click", () => {
        RaveCity.Config.audioTrack = trackName;
        RaveCity.Audio.loadAudioTrack(trackName);
        this.toggleTrackSelector();
        
        // Update active state
        document.querySelectorAll(".track-option").forEach((option) => {
          option.classList.remove("active");
        });
        trackOption.classList.add("active");
      });
      
      this.elements.trackSelector.appendChild(trackOption);
    });
  },
  
  // Toggle fullscreen
  toggleFullscreen: function() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.elements.fullscreenButton.classList.remove("active");
    } else {
      document.body.requestFullscreen();
      this.elements.fullscreenButton.classList.add("active");
    }
  },
  
  // Change theme
  changeTheme: function() {
    const themeNames = Object.keys(RaveCity.Config.visualThemes);
    const currentThemeIndex = themeNames.indexOf(RaveCity.Config.visualTheme);
    const nextThemeIndex = (currentThemeIndex + 1) % themeNames.length;
    RaveCity.Config.visualTheme = themeNames[nextThemeIndex];
    
    // Update theme
    RaveCity.World.updateTheme();
    
    // Update theme indicator
    this.updateThemeIndicator();
  },
  
  // Update theme indicator
  updateThemeIndicator: function() {
    this.elements.themeIndicator.textContent = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme].name;
    this.elements.themeIndicator.classList.add("fade-in");
    this.elements.themeIndicator.style.opacity = 1;
    
    setTimeout(() => {
      this.elements.themeIndicator.classList.remove("fade-in");
      this.elements.themeIndicator.classList.add("fade-out");
      setTimeout(() => {
        this.elements.themeIndicator.classList.remove("fade-out");
        this.elements.themeIndicator.style.opacity = 0;
      }, 500);
    }, 3000);
  },
  
  // Toggle track selector
  toggleTrackSelector: function() {
    const isVisible = this.elements.trackSelector.style.display === "block";
    this.elements.trackSelector.style.display = isVisible ? "none" : "block";
    this.elements.trackButton.classList.toggle("active", !isVisible);
  },
  
  // Toggle controls info
  toggleControlsInfo: function() {
    const isVisible = this.elements.controlsInfo.style.display === "block";
    this.elements.controlsInfo.style.display = isVisible ? "none" : "block";
    this.elements.helpButton.classList.toggle("active", !isVisible);
  },
  
  // Toggle settings
  toggleSettings: function() {
    const isVisible = this.elements.settingsPanel.style.display === "block";
    this.elements.settingsPanel.style.display = isVisible ? "none" : "block";
    this.elements.settingsButton.classList.toggle("active", !isVisible);
  },
  
  // Apply settings
  applySettings: () => {
    // Get settings values
    const quality = document.getElementById("quality-setting").value;
    const density = Number.parseInt(document.getElementById("density-setting").value);
    const showFps = document.getElementById("fps-setting").checked;
    const autoOptimize = document.getElementById("auto-optimize-setting").checked;
    const bloomIntensity = Number.parseFloat(document.getElementById("bloom-setting").value);
    const glitchIntensity = Number.parseFloat(document.getElementById("glitch-setting").value);
    const colorShiftSpeed = Number.parseFloat(document.getElementById("color-shift-setting").value);
    const volume = Number.parseFloat(document.getElementById("volume-setting").value);
    const bassImpact = Number.parseFloat(document.getElementById("bass-setting").value);
    const randomizeTracks = document.getElementById("random-tracks-setting").checked;
    const movementSpeed = Number.parseFloat(document.getElementById("movement-speed-setting").value);
    const flyingEnabled = document.getElementById("flying-setting").checked;
    const sensitivity = Number.parseFloat(document.getElementById("sensitivity-setting").value);
    const dancerCount = Number.parseInt(document.getElementById("dancer-count-setting").value);
    const dancerDetail = document.getElementById("dancer-detail-setting").value;
    
    // Apply quality preset first
    RaveCity.Config.applyQualityPreset(quality);
    
    // Apply individual settings that override the preset
    RaveCity.Config.density = density;
    RaveCity.Config.showFps = showFps;
    RaveCity.Config.autoOptimize = autoOptimize;
    RaveCity.Config.volume = volume;
    RaveCity.Config.bassImpact = bassImpact;
    RaveCity.Config.randomizeTracks = randomizeTracks;
    RaveCity.Config.movementSpeed = movementSpeed;
    RaveCity.Config.flyingEnabled = flyingEnabled;
    RaveCity.Config.mouseSensitivity = sensitivity;
    RaveCity.Config.dancerCount = dancerCount;
    RaveCity.Config.dancerDetail = dancerDetail;
    RaveCity.Config.glitchIntensity = glitchIntensity;
    RaveCity.Config.colorShiftSpeed = colorShiftSpeed;
    
    // Apply audio settings
    RaveCity.Audio.setVolume(volume);
    
    // Apply visual effects settings
    if (RaveCity.World.bloomPass) {
      RaveCity.World.bloomPass.strength = bloomIntensity;
    }
    
    // Update dancers
    RaveCity.Dancers.init(RaveCity.World.scene);
