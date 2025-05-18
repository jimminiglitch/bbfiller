// 3D Rave City - Configuration

const RaveCity = window.RaveCity || {}

// Configuration
RaveCity.Config = {
  // Core settings
  density: 60,
  movementSpeed: 2.0,
  flyingEnabled: true,
  visualTheme: "rave",
  audioReactive: true,
  volume: 0.7,
  bassImpact: 1.5,
  audioTrack: "melodic-techno",
  randomizeTracks: true,
  trippyLevel: 1.0,
  glitchIntensity: 0.15,
  colorShiftSpeed: 1.0,
  bloomEnabled: true,

  // Performance settings
  showFps: false,
  quality: "medium",
  autoOptimize: true,
  mouseSensitivity: 1.0,

  // Dancer settings
  dancerCount: 100,
  regularPeopleCount: 50,
  dancerDetail: "medium",

  // World settings
  showBuildings: true,
  buildingCount: 200,
  showSkyObjects: true,
  skyObjectCount: 100,
  showLasers: true,
  laserCount: 50,
  showSmoke: true,
  smokeCount: 8,

  // System detection
  isMobile: false,

  // Visual themes
  visualThemes: {
    rave: {
      name: "RAVE MADNESS",
      fogColor: 0x000022,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0xffff00,
      buildingColor1: 0xff00ff,
      buildingColor2: 0x00ffff,
      skyColor: 0x000033,
      bloomStrength: 1.2,
      bloomRadius: 0.7,
      bloomThreshold: 0.1,
    },
    hyperspace: {
      name: "HYPERSPACE",
      fogColor: 0x000033,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0xffff00,
      buildingColor1: 0x8800ff,
      buildingColor2: 0x0088ff,
      skyColor: 0x000066,
      bloomStrength: 1.0,
      bloomRadius: 0.6,
      bloomThreshold: 0.2,
    },
    vaporwave: {
      name: "VAPORWAVE",
      fogColor: 0x551a8b,
      particleColor1: 0xff71ce,
      particleColor2: 0x01cdfe,
      gridColor: 0x05ffa1,
      buildingColor1: 0xff71ce,
      buildingColor2: 0x05ffa1,
      skyColor: 0x2d1b4e,
      bloomStrength: 0.8,
      bloomRadius: 0.4,
      bloomThreshold: 0.3,
    },
    cyberpunk: {
      name: "CYBERPUNK",
      fogColor: 0x0a001a,
      particleColor1: 0xff3c6f,
      particleColor2: 0x00f9ff,
      gridColor: 0xffff00,
      buildingColor1: 0xff3c6f,
      buildingColor2: 0x00f9ff,
      skyColor: 0x0a001a,
      bloomStrength: 1.5,
      bloomRadius: 0.5,
      bloomThreshold: 0.1,
    },
    neon: {
      name: "NEON DREAMS",
      fogColor: 0x000000,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0x00ff00,
      buildingColor1: 0xff00ff,
      buildingColor2: 0x00ffff,
      skyColor: 0x000000,
      bloomStrength: 1.8,
      bloomRadius: 0.8,
      bloomThreshold: 0.1,
    },
  },

  // Audio tracks
  audioTracks: {
    "melodic-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/melodic-techno-03-extended-version-moogify-9867.mp3?v=1747323781216",
      title: "Melodic Techno",
    },
    "berlin-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/berlin-techno-106820.mp3?v=1747327926985",
      title: "Berlin Techno",
    },
    "dopetronic-echoes": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/dopetronic-echoes-from-nowhere-original-mix-gift-track-321994.mp3?v=1747327850182",
      title: "Dopetronic - Echoes From Nowhere",
    },
    "unknown-planet": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/unknown-planet-driving-techno-music-312478.mp3?v=1747327934012",
      title: "Unknown Planet - Driving Techno",
    },
    "techno-pulse": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/techno-pulse-127292.mp3?v=1747327934012",
      title: "Techno Pulse",
    },
  },

  // Quality presets
  qualityPresets: {
    low: {
      density: 20,
      dancerCount: 30,
      regularPeopleCount: 15,
      skyObjectCount: 30,
      buildingCount: 50,
      laserCount: 15,
      showSmoke: false,
      bloomEnabled: false,
      dancerDetail: "low",
    },
    medium: {
      density: 40,
      dancerCount: 60,
      regularPeopleCount: 30,
      skyObjectCount: 60,
      buildingCount: 100,
      laserCount: 30,
      showSmoke: true,
      bloomEnabled: true,
      dancerDetail: "medium",
    },
    high: {
      density: 60,
      dancerCount: 100,
      regularPeopleCount: 50,
      skyObjectCount: 100,
      buildingCount: 150,
      laserCount: 50,
      showSmoke: true,
      bloomEnabled: true,
      dancerDetail: "medium",
    },
    ultra: {
      density: 100,
      dancerCount: 150,
      regularPeopleCount: 75,
      skyObjectCount: 150,
      buildingCount: 200,
      laserCount: 80,
      showSmoke: true,
      bloomEnabled: true,
      dancerDetail: "high",
    },
  },

  // Apply quality preset
  applyQualityPreset: function (quality) {
    const preset = this.qualityPresets[quality]
    if (!preset) return

    Object.keys(preset).forEach((key) => {
      this[key] = preset[key]
    })

    this.quality = quality
  },

  // Check if device is mobile
  checkMobile: function () {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (this.isMobile) {
      // Reduce quality for mobile
      this.applyQualityPreset("low")
    }
  },

  // Initialize
  init: function () {
    this.checkMobile()

    // Apply initial quality preset
    this.applyQualityPreset(this.quality)

    return this
  },
}

// Initialize config
RaveCity.Config = RaveCity.Config.init()
