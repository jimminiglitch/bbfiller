// Tripscape - 3D Psychedelic Experience
// A first-person immersive rave experience

// Main Tripscape object
const Tripscape = {
  // Configuration and state
  config: {
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
    showDancers: true,
    dancerCount: 100,
    regularPeopleCount: 50,
    showBuildings: true,
    buildingCount: 200,
    showSkyObjects: true,
    skyObjectCount: 100,
    showLasers: true,
    laserCount: 50,
    showSmoke: true,
    smokeCount: 8,
    isMobile: false,
    showAmbientSound: true,
    showFps: false,
    quality: "medium",
    mouseSensitivity: 1.0,
  },

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
  },

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

  // Animation state
  animationFrameId: null,
  time: 0,
  lastTime: 0,
  fps: 0,
  frameCount: 0,
  lastFpsUpdate: 0,

  // Audio state
  audioContext: null,
  audioSource: null,
  audioAnalyser: null,
  audioData: null,
  frequencyData: null,
  audioElement: null,
  isPlaying: false,
  audioLoaded: false,
  ambientSound: null,
  trackQueue: [],

  // Three.js variables
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  clock: null,
  raycaster: null,
  particles: null,
  floorMesh: null,
  skyMesh: null,
  bloomPass: null,
  glitchPass: null,
  rgbShiftPass: null,
  characters: [],
  buildings: [],
  skyObjects: [],
  lasers: [],
  smokeMachines: [],
  zones: [],

  // Initialize the application
  init: function () {
    try {
      // Get DOM elements
      this.getElements()

      // Check if device is mobile
      this.checkMobile()

      // Initialize loading screen
      this.initLoadingScreen()

      // Load dependencies
      this.loadDependencies()
        .then(() => {
          // Initialize scene
          this.initScene()

          // Initialize audio
          this.initAudio()

          // Initialize controls
          this.initControls()

          // Start animation loop
          this.animate()
        })
        .catch((error) => {
          this.showError(`Failed to load dependencies: ${error.message}`)
        })
    } catch (error) {
      this.showError(`Initialization error: ${error.message}`)
    }
  },

  // Get DOM elements
  getElements: function () {
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
    }

    // Canvas contexts
    this.visualizerCtx = this.elements.audioVisualizer.getContext("2d")
  },

  // Check if device is mobile
  checkMobile: function () {
    this.config.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (this.config.isMobile) {
      // Reduce quality for mobile
      this.config.quality = "low"
      this.applyQualitySettings("low")
    }
  },

  // Apply quality settings
  applyQualitySettings: function (quality) {
    switch (quality) {
      case "low":
        this.config.density = 20
        this.config.dancerCount = 30
        this.config.regularPeopleCount = 15
        this.config.skyObjectCount = 30
        this.config.buildingCount = 50
        this.config.laserCount = 15
        this.config.showSmoke = false
        this.config.bloomEnabled = false
        break
      case "medium":
        this.config.density = 40
        this.config.dancerCount = 60
        this.config.regularPeopleCount = 30
        this.config.skyObjectCount = 60
        this.config.buildingCount = 100
        this.config.laserCount = 30
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
      case "high":
        this.config.density = 60
        this.config.dancerCount = 100
        this.config.regularPeopleCount = 50
        this.config.skyObjectCount = 100
        this.config.buildingCount = 150
        this.config.laserCount = 50
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
      case "ultra":
        this.config.density = 100
        this.config.dancerCount = 150
        this.config.regularPeopleCount = 75
        this.config.skyObjectCount = 150
        this.config.buildingCount = 200
        this.config.laserCount = 80
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
    }
  },

  // Initialize loading screen
  initLoadingScreen: function () {
    // Glitch text effect
    setInterval(() => {
      if (Math.random() > 0.6) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?"
        let glitched = ""
        const originalText = "INITIALIZING NEURAL INTERFACE"

        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() > 0.7) {
            glitched += characters.charAt(Math.floor(Math.random() * characters.length))
          } else {
            glitched += originalText[i]
          }
        }

        this.elements.loadingText.textContent = glitched
      } else {
        this.elements.loadingText.textContent = "INITIALIZING NEURAL INTERFACE"
      }
    }, 80)
  },

  // Load dependencies
  loadDependencies: function () {
    return new Promise((resolve, reject) => {
      // Simulate loading progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          resolve()
        }
        this.elements.progressFill.style.width = `${progress}%`
        this.elements.progressPercent.textContent = `${Math.round(progress)}%`
      }, 150)
    })
  },

  // Show error message
  showError: function (message) {
    console.error(message)
    this.elements.errorMessage.textContent = message
    this.elements.errorMessage.style.display = "block"
  },

  // Initialize Three.js scene
  initScene: function () {
    try {
      // Create scene
      this.scene = new THREE.Scene()

      // Add fog for depth
      const theme = this.visualThemes[this.config.visualTheme]
      this.scene.fog = new THREE.FogExp2(theme.fogColor, 0.008) // Reduced fog density for more visibility

      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      this.camera.position.set(0, 5, 20)

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.elements.sceneCanvas,
        antialias: true,
        alpha: true,
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Create clock for animation
      this.clock = new THREE.Clock()

      // Create raycaster for collision detection
      this.raycaster = new THREE.Raycaster()

      // Create pointer lock controls for first-person movement
      this.controls = new THREE.PointerLockControls(this.camera, document.body)

      // Add crosshair
      this.createCrosshair()

      // Set up post-processing
      this.setupPostProcessing()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      // Hide loading screen
      setTimeout(() => {
        this.elements.loadingScreen.style.opacity = "0"
        setTimeout(() => {
          this.elements.loadingScreen.style.display = "none"
        }, 500)
      }, 1000)
    } catch (error) {
      this.showError(`Failed to initialize 3D scene: ${error.message}`)
    }
  },

  // Create crosshair
  createCrosshair: () => {
    const crosshair = document.createElement("div")
    crosshair.className = "crosshair"
    document.body.appendChild(crosshair)
  },

  // Set up post-processing
  setupPostProcessing: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme]

      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer)

      // Add render pass
      const renderPass = new THREE.RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      // Add bloom pass if enabled
      if (this.config.bloomEnabled) {
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          theme.bloomStrength,
          theme.bloomRadius,
          theme.bloomThreshold,
        )
        this.composer.addPass(this.bloomPass)
      }

      // Add RGB shift pass
      this.rgbShiftPass = new THREE.ShaderPass(THREE.RGBShiftShader)
      this.rgbShiftPass.uniforms.amount.value = 0.0015
      this.rgbShiftPass.uniforms.angle.value = 0
      this.composer.addPass(this.rgbShiftPass)

      // Add glitch pass
      this.glitchPass = new THREE.GlitchPass()
      this.glitchPass.goWild = false
      this.glitchPass.enabled = true
      this.composer.addPass(this.glitchPass)
    } catch (error) {
      this.showError(`Failed to set up post-processing: ${error.message}`)
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme]

      // Create floor (dance floor)
      this.createDanceFloor(theme)

      // Create sky dome
      this.createSkyDome(theme)

      // Create particle system
      this.createParticles(theme)

      // Create characters
      this.createCharacters(theme)

      // Create buildings
      this.createBuildings(theme)

      // Create lasers
      this.createLasers(theme)

      // Create smoke machines
      if (this.config.showSmoke) {
        this.createSmokeMachines(theme)
      }

      // Create zones (different party areas)
      this.createZones(theme)
    } catch (error) {
      this.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Create dance floor
  createDanceFloor: function (theme) {
    // Create a grid floor for the dance floor
    const floorSize = 500 // Much larger floor
    const floorSegments = 100

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Create sky dome
  createSkyDome: function (theme) {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(1000, 64, 64)
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    })

    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(this.skyMesh)

    // Add stars to the sky dome
    const starCount = 3000
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // Create stars in a full sphere around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 900 + Math.random() * 100

      starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.cos(phi)
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(stars)
    this.skyObjects.push(stars)

    // Add floating objects in the sky
    this.createSkyObjects(theme)
  },

  // Create sky objects
  createSkyObjects: function (theme) {
    if (!this.config.showSkyObjects) return

    for (let i = 0; i < this.config.skyObjectCount; i++) {
      // Random position in the sky
      const radius = 100 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = 50 + Math.random() * 300 // Higher up in the sky
      const z = radius * Math.sin(phi) * Math.sin(theta)

      // Random color
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      const mixRatio = Math.random()
      const objectColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      // Create a random geometric shape
      let object
      const shapeType = Math.floor(Math.random() * 5)

      const material = new THREE.MeshBasicMaterial({
        color: objectColor,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      })

      switch (shapeType) {
        case 0: // Cube
          const cubeGeometry = new THREE.BoxGeometry(
            10 + Math.random() * 20,
            10 + Math.random() * 20,
            10 + Math.random() * 20,
          )
          object = new THREE.Mesh(cubeGeometry, material)
          break
        case 1: // Sphere
          const sphereGeometry = new THREE.SphereGeometry(5 + Math.random() * 15, 8, 8)
          object = new THREE.Mesh(sphereGeometry, material)
          break
        case 2: // Torus
          const torusGeometry = new THREE.TorusGeometry(10 + Math.random() * 10, 3 + Math.random() * 5, 8, 16)
          object = new THREE.Mesh(torusGeometry, material)
          break
        case 3: // Tetrahedron
          const tetraGeometry = new THREE.TetrahedronGeometry(10 + Math.random() * 15)
          object = new THREE.Mesh(tetraGeometry, material)
          break
        case 4: // Octahedron
          const octaGeometry = new THREE.OctahedronGeometry(10 + Math.random() * 15)
          object = new THREE.Mesh(octaGeometry, material)
          break
      }

      // Position
      object.position.set(x, y, z)

      // Add animation data
      object.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: 0.2 + Math.random() * 0.8,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: y,
      }

      this.scene.add(object)
      this.skyObjects.push(object)
    }
  },

  // Create particles
  createParticles: function (theme) {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = this.config.density * 200 // More particles

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)

    for (let i = 0; i < particleCount; i++) {
      // Position - spread out over a much larger area
      const x = (Math.random() - 0.5) * 500
      const y = Math.random() * 200
      const z = (Math.random() - 0.5) * 500

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Color
      const mixRatio = Math.random()
      const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    this.particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  },

  // Create characters
  createCharacters: function (theme) {
    // Create dancers
    for (let i = 0; i < this.config.dancerCount; i++) {
      const dancer = this.createCharacter(theme, true)

      // Random position on the dance floor - spread out over a larger area
      dancer.position.x = (Math.random() - 0.5) * 400
      dancer.position.z = (Math.random() - 0.5) * 400
      dancer.position.y = -2 // On the floor

      // Random rotation
      dancer.rotation.y = Math.random() * Math.PI * 2

      this.scene.add(dancer)
      this.characters.push(dancer)
    }

    // Create regular people (non-dancers)
    for (let i = 0; i < this.config.regularPeopleCount; i++) {
      const person = this.createCharacter(theme, false)

      // Random position on the dance floor
      person.position.x = (Math.random() - 0.5) * 400
      person.position.z = (Math.random() - 0.5) * 400
      person.position.y = -2 // On the floor

      // Random rotation
      person.rotation.y = Math.random() * Math.PI * 2

      this.scene.add(person)
      this.characters.push(person)
    }
  },

  // Create a single character
  createCharacter: (theme, isDancer) => {
    // Create a group for the character
    const character = new THREE.Group()

    // Random color for this character
    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)
    const mixRatio = Math.random()
    const characterColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Material for the character - wireframe for vector outline look
    const material = new THREE.MeshBasicMaterial({
      color: characterColor,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 8, 8)
    const head = new THREE.Mesh(headGeometry, material)
    head.position.y = 4.5
    character.add(head)

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8)
    const body = new THREE.Mesh(bodyGeometry, material)
    body.position.y = 2.5
    character.add(body)

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 6)

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, material)
    leftArm.position.set(-0.8, 3, 0)
    leftArm.rotation.z = Math.PI / 4
    character.add(leftArm)

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, material)
    rightArm.position.set(0.8, 3, 0)
    rightArm.rotation.z = -Math.PI / 4
    character.add(rightArm)

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2.5, 6)

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, material)
    leftLeg.position.set(-0.5, 0.5, 0)
    character.add(leftLeg)

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, material)
    rightLeg.position.set(0.5, 0.5, 0)
    character.add(rightLeg)

    // Add a subtle glow effect
    const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: characterColor,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.y = 2
    character.add(glow)

    // Add animation data
    character.userData = {
      animPhase: Math.random() * Math.PI * 2,
      animSpeed: 0.5 + Math.random() * 1.5,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      danceIntensity: isDancer ? 0.7 + Math.random() * 0.6 : 0.2 + Math.random() * 0.3,
      isDancer: isDancer,
    }

    return character
  },

  // Create buildings
  createBuildings: function (theme) {
    // Create city grid - much larger and more spread out
    const gridSize = 10
    const spacing = 40

    for (let i = 0; i < this.config.buildingCount; i++) {
      // Random position in a grid pattern
      const x = (Math.floor(Math.random() * (gridSize * 2 + 1)) - gridSize) * spacing
      const z = (Math.floor(Math.random() * (gridSize * 2 + 1)) - gridSize) * spacing

      // Skip center area (dance floor)
      if (Math.abs(x) < spacing * 2 && Math.abs(z) < spacing * 2) continue

      // Random building height
      const height = 10 + Math.random() * 100

      // Create building
      const building = this.createBuilding(height, theme)

      // Position
      building.position.x = x
      building.position.z = z
      building.position.y = height / 2 - 2 // Half height (origin at center) and floor offset

      this.scene.add(building)
      this.buildings.push(building)
    }
  },

  // Create a single building
  createBuilding: (height, theme) => {
    // Create a group for the building
    const building = new THREE.Group()

    // Random color for this building
    const color1 = new THREE.Color(theme.buildingColor1)
    const color2 = new THREE.Color(theme.buildingColor2)
    const mixRatio = Math.random()
    const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Building base geometry
    const width = 5 + Math.random() * 15
    const depth = 5 + Math.random() * 15
    const geometry = new THREE.BoxGeometry(width, height, depth)

    // Wireframe material for vector outline look
    const material = new THREE.MeshBasicMaterial({
      color: buildingColor,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    })

    const mesh = new THREE.Mesh(geometry, material)
    building.add(mesh)

    // Add animation data
    building.userData = {
      pulseSpeed: Math.random() * 2 + 1,
      originalColor: buildingColor.clone(),
    }

    return building
  },

  // Create lasers
  createLasers: function (theme) {
    if (!this.config.showLasers) return

    // Create laser beams
    for (let i = 0; i < this.config.laserCount; i++) {
      const laser = this.createLaser(theme)
      this.scene.add(laser)
      this.lasers.push(laser)
    }
  },

  // Create a single laser
  createLaser: (theme) => {
    // Create a group for the laser
    const laser = new THREE.Group()

    // Random color
    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)
    const mixRatio = Math.random()
    const laserColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create laser beam
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 200, 8)
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: laserColor,
      transparent: true,
      opacity: 0.7,
    })

    const beam = new THREE.Mesh(beamGeometry, beamMaterial)
    beam.position.y = 100
    beam.rotation.x = Math.PI / 2
    laser.add(beam)

    // Random position around the dance floor
    const angle = Math.random() * Math.PI * 2
    const radius = 30 + Math.random() * 150

    laser.position.x = Math.cos(angle) * radius
    laser.position.z = Math.sin(angle) * radius
    laser.position.y = -2 + Math.random() * 20 // Some lasers higher up

    // Random rotation
    laser.rotation.y = Math.random() * Math.PI * 2

    // Add animation data
    laser.userData = {
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      pulseSpeed: Math.random() * 2 + 1,
    }

    return laser
  },

  // Create smoke machines
  createSmokeMachines: function (theme) {
    for (let i = 0; i < this.config.smokeCount; i++) {
      // Create smoke machine
      const smokeMachine = new THREE.Group()

      // Base
      const baseGeometry = new THREE.BoxGeometry(2, 1, 2)
      const baseMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: true,
      })
      const base = new THREE.Mesh(baseGeometry, baseMaterial)
      smokeMachine.add(base)

      // Smoke particles
      const smokeCount = 100
      const smokeGeometry = new THREE.BufferGeometry()
      const smokePositions = new Float32Array(smokeCount * 3)
      const smokeSizes = new Float32Array(smokeCount)

      for (let j = 0; j < smokeCount; j++) {
        smokePositions[j * 3] = (Math.random() - 0.5) * 2
        smokePositions[j * 3 + 1] = Math.random() * 5
        smokePositions[j * 3 + 2] = (Math.random() - 0.5) * 2
        smokeSizes[j] = Math.random() * 2 + 1
      }

      smokeGeometry.setAttribute("position", new THREE.BufferAttribute(smokePositions, 3))
      smokeGeometry.setAttribute("size", new THREE.BufferAttribute(smokeSizes, 1))

      const smokeMaterial = new THREE.PointsMaterial({
        color: 0xcccccc,
        size: 1,
        transparent: true,
        opacity: 0.5,
      })

      const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
      smoke.position.y = 0.5
      smokeMachine.add(smoke)

      // Position
      const angle = Math.random() * Math.PI * 2
      const radius = 20 + Math.random() * 60

      smokeMachine.position.x = Math.cos(angle) * radius
      smokeMachine.position.z = Math.sin(angle) * radius
      smokeMachine.position.y = -2

      // Add animation data
      smokeMachine.userData = {
        smokeSpeed: 0.5 + Math.random() * 1.5,
        smokeIntensity: 0.7 + Math.random() * 0.3,
      }

      this.scene.add(smokeMachine)
      this.smokeMachines.push(smokeMachine)
    }
  },

  // Create zones (different party areas)
  createZones: function (theme) {
    // Create different zones with unique characteristics
    const zoneCount = 5
    const zoneRadius = 150

    for (let i = 0; i < zoneCount; i++) {
      // Create zone
      const zone = new THREE.Group()

      // Zone position - spread out in a circle around the center
      const angle = (i / zoneCount) * Math.PI * 2
      const x = Math.cos(angle) * zoneRadius
      const z = Math.sin(angle) * zoneRadius

      zone.position.set(x, -2, z)

      // Zone floor - different color for each zone
      const floorGeometry = new THREE.CircleGeometry(30, 32)
      const floorMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / zoneCount, 0.8, 0.5),
        transparent: true,
        opacity: 0.3,
      })

      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.position.y = 0.1 // Slightly above the main floor
      zone.add(floor)

      // Zone center piece - unique for each zone
      let centerPiece

      switch (i % 5) {
        case 0: // DJ booth
          centerPiece = this.createDJBooth(theme)
          break
        case 1: // Bar
          centerPiece = this.createBar(theme)
          break
        case 2: // Light tower
          centerPiece = this.createLightTower(theme)
          break
        case 3: // Dance platform
          centerPiece = this.createDancePlatform(theme)
          break
        case 4: // Chill area
          centerPiece = this.createChillArea(theme)
          break
      }

      zone.add(centerPiece)

      // Add zone to scene
      this.scene.add(zone)
      this.zones.push(zone)
    }
  },

  // Create DJ booth
  createDJBooth: function (theme) {
    const booth = new THREE.Group()

    // Booth base
    const baseGeometry = new THREE.BoxGeometry(10, 3, 5)
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor1,
      wireframe: true,
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 1.5
    booth.add(base)

    // DJ figure
    const dj = this.createCharacter(theme, false)
    dj.position.set(0, 3, 0)
    dj.scale.set(0.8, 0.8, 0.8)
    booth.add(dj)

    // DJ equipment
    const equipGeometry = new THREE.BoxGeometry(8, 1, 3)
    const equipMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor2,
      wireframe: true,
    })
    const equipment = new THREE.Mesh(equipGeometry, equipMaterial)
    equipment.position.set(0, 3.5, -1)
    booth.add(equipment)

    return booth
  },

  // Create bar
  createBar: function (theme) {
    const bar = new THREE.Group()

    // Bar counter
    const counterGeometry = new THREE.BoxGeometry(12, 2, 3)
    const counterMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor2,
      wireframe: true,
    })
    const counter = new THREE.Mesh(counterGeometry, counterMaterial)
    counter.position.y = 1
    bar.add(counter)

    // Bartender
    const bartender = this.createCharacter(theme, false)
    bartender.position.set(0, 0, -2)
    bartender.scale.set(0.8, 0.8, 0.8)
    bar.add(bartender)

    // Bottles
    for (let i = 0; i < 5; i++) {
      const bottleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8)
      const bottleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
        wireframe: true,
      })
      const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial)
      bottle.position.set(-4 + i * 2, 2.5, -1)
      bar.add(bottle)
    }

    return bar
  },

  // Create light tower
  createLightTower: (theme) => {
    const tower = new THREE.Group()

    // Tower base
    const baseGeometry = new THREE.CylinderGeometry(2, 3, 15, 8)
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor1,
      wireframe: true,
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 7.5
    tower.add(base)

    // Light beams
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2

      const beamGeometry = new THREE.CylinderGeometry(0.1, 0.5, 20, 8)
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / 8, 0.8, 0.5),
        transparent: true,
        opacity: 0.7,
      })

      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      beam.position.set(Math.cos(angle) * 2, 15, Math.sin(angle) * 2)
      beam.rotation.x = Math.PI / 4
      beam.rotation.y = angle

      // Add animation data
      beam.userData = {
        rotationSpeed: 0.01 + Math.random() * 0.02,
        pulseSpeed: 0.5 + Math.random() * 1.5,
      }

      tower.add(beam)
    }

    return tower
  },

  // Create dance platform
  createDancePlatform: function (theme) {
    const platform = new THREE.Group()

    // Platform base
    const baseGeometry = new THREE.CylinderGeometry(10, 10, 1, 16)
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.5
    platform.add(base)

    // Platform dancers
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const radius = 5

      const dancer = this.createCharacter(theme, true)
      dancer.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius)
      dancer.userData.danceIntensity = 1.2 // More intense dancing

      platform.add(dancer)
    }

    return platform
  },

  // Create chill area
  createChillArea: function (theme) {
    const chillArea = new THREE.Group()

    // Floor
    const floorGeometry = new THREE.CircleGeometry(10, 32)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor2,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0.1
    chillArea.add(floor)

    // Seating
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 6

      const seatGeometry = new THREE.BoxGeometry(3, 1, 1)
      const seatMaterial = new THREE.MeshBasicMaterial({
        color: theme.buildingColor1,
        wireframe: true,
      })
      const seat = new THREE.Mesh(seatGeometry, seatMaterial)
      seat.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius)
      seat.rotation.y = angle + Math.PI / 2

      chillArea.add(seat)

      // Add some sitting characters
      if (i % 2 === 0) {
        const person = this.createCharacter(theme, false)
        person.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius)
        person.rotation.y = angle + Math.PI / 2
        person.scale.set(0.8, 0.8, 0.8)

        chillArea.add(person)
      }
    }

    // Center table
    const tableGeometry = new THREE.CylinderGeometry(2, 2, 1, 16)
    const tableMaterial = new THREE.MeshBasicMaterial({
      color: theme.buildingColor2,
      wireframe: true,
    })
    const table = new THREE.Mesh(tableGeometry, tableMaterial)
    table.position.y = 0.5

    chillArea.add(table)

    return chillArea
  },

  // Initialize controls
  initControls: function () {
    // Set up pointer lock controls
    document.addEventListener("click", () => {
      if (!this.movement.pointerLocked) {
        this.controls.lock()
      }
    })

    this.controls.addEventListener("lock", () => {
      this.movement.pointerLocked = true
      this.elements.controlsInfo.style.display = "none"
    })

    this.controls.addEventListener("unlock", () => {
      this.movement.pointerLocked = false
      this.elements.controlsInfo.style.display = "block"
    })

    // Keyboard event handlers
    document.addEventListener("keydown", (e) => this.handleKeyDown(e))
    document.addEventListener("keyup", (e) => this.handleKeyUp(e))

    // Window resize handler
    window.addEventListener("resize", () => this.onWindowResize())

    // Button event handlers
    this.elements.fullscreenButton.addEventListener("click", () => this.toggleFullscreen())
    this.elements.themeButton.addEventListener("click", () => this.cycleTheme())
    this.elements.trackButton.addEventListener("click", () => this.toggleTrackSelector())
    this.elements.audioButton.addEventListener("click", () => this.toggleAudio())
    this.elements.helpButton.addEventListener("click", () => this.toggleHelp())
    this.elements.settingsButton.addEventListener("click", () => this.toggleSettings())
    this.elements.settingsApply.addEventListener("click", () => this.applySettings())
    this.elements.settingsClose.addEventListener("click", () => this.toggleSettings())

    // Create track selector options
    this.createTrackSelector()

    // Initialize track queue
    this.initTrackQueue()
  },

  // Handle key down
  handleKeyDown: function (e) {
    // Movement keys
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.movement.forward = true
        break
      case "KeyS":
      case "ArrowDown":
        this.movement.backward = true
        break
      case "KeyA":
      case "ArrowLeft":
        this.movement.left = true
        break
      case "KeyD":
      case "ArrowRight":
        this.movement.right = true
        break
      case "Space":
        if (this.config.flyingEnabled) {
          this.movement.up = true
        } else {
          this.toggleAudio() // Toggle audio if flying is disabled
        }
        break
      case "ShiftLeft":
      case "ShiftRight":
        if (this.config.flyingEnabled) {
          this.movement.down = true
        }
        break
    }

    // Other controls
    switch (e.code) {
      case "KeyF":
        this.toggleFullscreen()
        break
      case "KeyM":
        this.toggleAudio()
        break
      case "KeyT":
        this.cycleTheme()
        break
      case "KeyN":
        this.nextTrack()
        break
      case "KeyP":
        this.toggleSettings()
        break
      case "KeyH":
        this.toggleHelp()
        break
    }
  },

  // Handle key up
  handleKeyUp: function (e) {
    // Movement keys
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.movement.forward = false
        break
      case "KeyS":
      case "ArrowDown":
        this.movement.backward = false
        break
      case "KeyA":
      case "ArrowLeft":
        this.movement.left = false
        break
      case "KeyD":
      case "ArrowRight":
        this.movement.right = false
        break
      case "Space":
        this.movement.up = false
        break
      case "ShiftLeft":
      case "ShiftRight":
        this.movement.down = false
        break
    }
  },

  // Toggle help display
  toggleHelp: function () {
    this.elements.controlsInfo.style.display = this.elements.controlsInfo.style.display === "none" ? "block" : "none"
  },

  // Toggle fullscreen
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  },

  // Toggle settings panel
  toggleSettings: function () {
    const display = this.elements.settingsPanel.style.display
    this.elements.settingsPanel.style.display = display === "none" ? "block" : "none"

    // Update settings controls with current values
    if (display === "none") {
      document.getElementById("quality-setting").value = this.config.quality
      document.getElementById("density-setting").value = this.config.density
      document.getElementById("fps-setting").checked = this.config.showFps
      document.getElementById("bloom-setting").value = this.visualThemes[this.config.visualTheme].bloomStrength
      document.getElementById("glitch-setting").value = this.config.glitchIntensity
      document.getElementById("color-shift-setting").value = this.config.colorShiftSpeed
      document.getElementById("volume-setting").value = this.config.volume
      document.getElementById("bass-setting").value = this.config.bassImpact
      document.getElementById("ambient-setting").checked = this.config.showAmbientSound
      document.getElementById("random-tracks-setting").checked = this.config.randomizeTracks
      document.getElementById("movement-speed-setting").value = this.config.movementSpeed
      document.getElementById("flying-setting").checked = this.config.flyingEnabled
      document.getElementById("sensitivity-setting").value = this.config.mouseSensitivity
    }
  },

  // Apply settings
  applySettings: function () {
    // Get values from settings controls
    const quality = document.getElementById("quality-setting").value
    const density = Number.parseInt(document.getElementById("density-setting").value)
    const showFps = document.getElementById("fps-setting").checked
    const bloomStrength = Number.parseFloat(document.getElementById("bloom-setting").value)
    const glitchIntensity = Number.parseFloat(document.getElementById("glitch-setting").value)
    const colorShiftSpeed = Number.parseFloat(document.getElementById("color-shift-setting").value)
    const volume = Number.parseFloat(document.getElementById("volume-setting").value)
    const bassImpact = Number.parseFloat(document.getElementById("bass-setting").value)
    const showAmbientSound = document.getElementById("ambient-setting").checked
    const randomizeTracks = document.getElementById("random-tracks-setting").checked
    const movementSpeed = Number.parseFloat(document.getElementById("movement-speed-setting").value)
    const flyingEnabled = document.getElementById("flying-setting").checked
    const mouseSensitivity = Number.parseFloat(document.getElementById("sensitivity-setting").value)

    // Apply quality settings
    this.config.quality = quality
    this.applyQualitySettings(quality)

    // Apply other settings
    this.config.density = density
    this.config.showFps = showFps
    this.config.glitchIntensity = glitchIntensity
    this.config.colorShiftSpeed = colorShiftSpeed
    this.config.volume = volume
    this.config.bassImpact = bassImpact
    this.config.showAmbientSound = showAmbientSound
    this.config.randomizeTracks = randomizeTracks
    this.config.movementSpeed = movementSpeed
    this.config.flyingEnabled = flyingEnabled
    this.config.mouseSensitivity = mouseSensitivity

    // Update movement speed
    this.movement.speed = 0.15 * movementSpeed

    // Update bloom strength
    if (this.bloomPass) {
      this.bloomPass.strength = bloomStrength
      this.visualThemes[this.config.visualTheme].bloomStrength = bloomStrength
    }

    // Update audio volume
    if (this.audioElement) {
      this.audioElement.volume = volume
    }

    // Update ambient sound
    if (this.ambientSound) {
      if (showAmbientSound) {
        if (this.isPlaying && !this.ambientSound.paused) {
          this.ambientSound.play()
        }
      } else {
        this.ambientSound.pause()
      }
    }

    // Show/hide FPS counter
    this.elements.performanceIndicator.style.display = showFps ? "block" : "none"

    // Hide settings panel
    this.elements.settingsPanel.style.display = "none"

    // Recreate scene objects if density changed significantly
    if (Math.abs(this.config.density - density) > 10) {
      this.recreateSceneObjects()
    }

    // Reinitialize track queue if randomization setting changed
    if (this.config.randomizeTracks !== randomizeTracks) {
      this.initTrackQueue()
    }
  },

  // Recreate scene objects
  recreateSceneObjects: function () {
    // Remove existing objects
    if (this.particles) {
      this.scene.remove(this.particles)
    }

    this.characters.forEach((character) => {
      this.scene.remove(character)
    })
    this.characters = []

    // Create new objects
    const theme = this.visualThemes[this.config.visualTheme]
    this.createParticles(theme)
    this.createCharacters(theme)
  },

  // Handle window resize
  onWindowResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight)
    }
  },

  // Update movement
  updateMovement: function (delta) {
    if (!this.movement.pointerLocked) return

    // Get camera direction vectors
    this.movement.direction.z = Number(this.movement.forward) - Number(this.movement.backward)
    this.movement.direction.x = Number(this.movement.right) - Number(this.movement.left)
    this.movement.direction.y = Number(this.movement.up) - Number(this.movement.down)
    this.movement.direction.normalize()

    // Apply movement speed
    const speed = this.movement.speed * delta * 1000

    // Forward/backward
    if (this.movement.forward || this.movement.backward) {
      this.movement.velocity.z = this.movement.direction.z * speed
    } else {
      this.movement.velocity.z = 0
    }

    // Left/right
    if (this.movement.left || this.movement.right) {
      this.movement.velocity.x = this.movement.direction.x * speed
    } else {
      this.movement.velocity.x = 0
    }

    // Up/down (flying)
    if (this.config.flyingEnabled && (this.movement.up || this.movement.down)) {
      this.movement.velocity.y = this.movement.direction.y * speed
    } else {
      this.movement.velocity.y = 0
    }

    // Apply movement
    this.controls.moveRight(this.movement.velocity.x)
    this.controls.moveForward(this.movement.velocity.z)

    // Apply vertical movement (flying)
    if (this.config.flyingEnabled) {
      this.camera.position.y += this.movement.velocity.y
    }
  },

  // Animation loop
  animate: function () {
    try {
      this.animationFrameId = requestAnimationFrame(() => this.animate())

      const now = performance.now()
      const delta = this.clock.getDelta()
      this.time += delta

      // Update FPS counter
      this.frameCount++
      if (now - this.lastFpsUpdate > 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate))
        this.lastFpsUpdate = now
        this.frameCount = 0

        if (this.config.showFps) {
          this.elements.performanceIndicator.textContent = `FPS: ${this.fps}`
        }
      }

      // Update movement
      this.updateMovement(delta)

      // Get audio reactivity factor if enabled
      let audioFactor = 1
      let bassValue = 0

      if (this.config.audioReactive && this.isPlaying && this.frequencyData) {
        // Get bass frequencies (typically the first few bins)
        bassValue = 0
        for (let i = 0; i < 10; i++) {
          bassValue += this.frequencyData[i]
        }
        bassValue = bassValue / 10 / 255 // Normalize

        // Apply bass impact multiplier
        audioFactor = 1 + bassValue * this.config.bassImpact
      }

      // Update particle system
      if (this.particles) {
        // Audio reactivity
        if (audioFactor > 1) {
          const positions = this.particles.geometry.attributes.position.array
          for (let i = 0; i < positions.length; i += 3) {
            const originalX = positions[i]
            const originalY = positions[i + 1]
            const originalZ = positions[i + 2]

            const distance = Math.sqrt(originalX * originalX + originalY * originalY + originalZ * originalZ)
            const pulseFactor = 1 + 0.2 * bassValue * Math.sin(this.time * 2 + distance)

            positions[i] = originalX * pulseFactor
            positions[i + 1] = originalY * pulseFactor
            positions[i + 2] = originalZ * pulseFactor
          }

          this.particles.geometry.attributes.position.needsUpdate = true
        }
      }

      // Update floor
      if (this.floorMesh) {
        // Warp floor based on audio
        if (audioFactor > 1) {
          const positions = this.floorMesh.geometry.attributes.position.array
          const count = positions.length / 3

          for (let i = 0; i < count; i++) {
            const x = positions[i * 3]
            const z = positions[i * 3 + 2]

            const distance = Math.sqrt(x * x + z * z)
            const y = Math.sin(distance * 0.05 + this.time * 2) * bassValue * 2

            positions[i * 3 + 1] = y
          }

          this.floorMesh.geometry.attributes.position.needsUpdate = true
        }
      }

      // Update characters
      this.characters.forEach((character) => {
        // Rotate character
        character.rotation.y += character.userData.rotSpeed

        // Animate character parts based on time and audio
        const phase = this.time * character.userData.animSpeed + character.userData.animPhase
        const intensity = character.userData.danceIntensity * (1 + (audioFactor - 1) * 2)

        // Get character parts
        const head = character.children[0]
        const body = character.children[1]
        const leftArm = character.children[2]
        const rightArm = character.children[3]
        const leftLeg = character.children[4]
        const rightLeg = character.children[5]
        const glow = character.children[6]

        // Animate head bobbing
        head.position.y = 4.5 + Math.sin(phase) * 0.2 * intensity

        // Animate arms
        leftArm.rotation.z = Math.PI / 4 + Math.sin(phase) * 0.5 * intensity
        rightArm.rotation.z = -Math.PI / 4 + Math.sin(phase + Math.PI) * 0.5 * intensity

        // Animate legs
        leftLeg.rotation.x = Math.sin(phase) * 0.3 * intensity
        rightLeg.rotation.x = Math.sin(phase + Math.PI) * 0.3 * intensity

        // Animate glow - reduced intensity
        glow.scale.setScalar(1 + bassValue * 0.3)
        glow.material.opacity = 0.1 + bassValue * 0.1
      })

      // Update buildings
      this.buildings.forEach((building) => {
        // Pulse building color based on audio
        const mesh = building.children[0]

        const pulsePhase = this.time * building.userData.pulseSpeed
        const pulseIntensity = 1 + (audioFactor - 1) * 0.5

        const originalColor = building.userData.originalColor
        const pulseColor = new THREE.Color(originalColor).lerp(
          new THREE.Color(0xffffff),
          0.2 * Math.sin(pulsePhase) * pulseIntensity,
        )

        mesh.material.color.copy(pulseColor)
      })

      // Update lasers
      if (this.config.showLasers) {
        this.lasers.forEach((laser) => {
          // Rotate laser
          laser.rotation.y += laser.userData.rotationSpeed

          // Pulse laser opacity based on audio
          const beam = laser.children[0]
          const pulsePhase = this.time * laser.userData.pulseSpeed
          const pulseIntensity = 1 + (audioFactor - 1) * 2

          beam.material.opacity = 0.5 + 0.5 * Math.sin(pulsePhase) * pulseIntensity
        })
      }

      // Update smoke machines
      if (this.config.showSmoke) {
        this.smokeMachines.forEach((smokeMachine) => {
          const smoke = smokeMachine.children[1]
          const positions = smoke.geometry.attributes.position.array

          for (let i = 0; i < positions.length / 3; i++) {
            // Move smoke particles upward
            positions[i * 3 + 1] += smokeMachine.userData.smokeSpeed * delta

            // Reset particles that go too high
            if (positions[i * 3 + 1] > 5) {
              positions[i * 3] = (Math.random() - 0.5) * 2
              positions[i * 3 + 1] = 0
              positions[i * 3 + 2] = (Math.random() - 0.5) * 2
            }
          }

          smoke.geometry.attributes.position.needsUpdate = true
        })
      }

      // Update sky objects
      this.skyObjects.forEach((object) => {
        if (object.userData && object.userData.rotationSpeed) {
          // Rotate object
          object.rotation.x += object.userData.rotationSpeed.x
          object.rotation.y += object.userData.rotationSpeed.y
          object.rotation.z += object.userData.rotationSpeed.z

          // Float up and down
          if (object.userData.originalY) {
            object.position.y =
              object.userData.originalY +
              Math.sin(this.time * object.userData.floatSpeed + object.userData.floatOffset) * 5
          }
        }
      })

      // Update post-processing effects
      if (this.rgbShiftPass) {
        this.rgbShiftPass.uniforms.angle.value = this.time * 0.5 * this.config.colorShiftSpeed
        this.rgbShiftPass.uniforms.amount.value = 0.001 + 0.004 * this.config.trippyLevel + (audioFactor - 1) * 0.01
      }

      if (this.glitchPass) {
        // Occasional glitches based on intensity - reduced frequency
        if (Math.random() < 0.002 * this.config.glitchIntensity) {
          this.glitchPass.goWild = true
          setTimeout(
            () => {
              this.glitchPass.goWild = false
            },
            50 + Math.random() * 100,
          ) // Shorter glitch duration
        }
      }

      if (this.bloomPass) {
        const theme = this.visualThemes[this.config.visualTheme]
        this.bloomPass.strength = theme.bloomStrength * (1 + (audioFactor - 1) * 0.5)
      }

      // Render scene with post-processing
      if (this.composer) {
        this.composer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
    } catch (error) {
      console.error("Animation error:", error)
      cancelAnimationFrame(this.animationFrameId)
      this.showError(`Animation error: ${error.message}. Try refreshing the page.`)
    }
  },

  // Initialize audio
  initAudio: function () {
    try {
      // Create audio element
      this.audioElement = new Audio()
      this.audioElement.crossOrigin = "anonymous"
      this.audioElement.src = this.audioTracks[this.config.audioTrack].url

      // Show audio status
      this.elements.audioStatus.textContent = "Loading audio..."
      this.elements.audioStatus.style.display = "block"

      // Audio loaded event
      this.audioElement.addEventListener("canplaythrough", () => {
        this.audioLoaded = true
        this.elements.audioStatus.textContent = "Audio ready! Click play button to start."
        setTimeout(() => {
          this.elements.audioStatus.style.display = "none"
        }, 3000)
      })

      // Audio ended event - play next track
      this.audioElement.addEventListener("ended", () => {
        this.nextTrack()
      })

      // Audio error event
      this.audioElement.addEventListener("error", (e) => {
        console.error("Audio error:", e)
        this.elements.audioStatus.textContent = "Audio failed to load. Try another track."
        this.elements.audioStatus.style.color = "#ff0000"
      })

      // Preload audio
      this.audioElement.load()

      // Initialize ambient crowd sound
      if (this.config.showAmbientSound) {
        this.ambientSound = new Audio()
        this.ambientSound.src =
          "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/crowd-talking-loop.mp3?v=1747328000000"
        this.ambientSound.loop = true
        this.ambientSound.volume = 0.2
      }
    } catch (error) {
      this.showError(`Failed to initialize audio: ${error.message}`)
    }
  },

  // Initialize track queue
  initTrackQueue: function () {
    // Create a queue of all tracks
    this.trackQueue = Object.keys(this.audioTracks)

    // Shuffle the queue if randomization is enabled
    if (this.config.randomizeTracks) {
      this.shuffleTrackQueue()
    }

    // Move current track to the beginning
    const currentIndex = this.trackQueue.indexOf(this.config.audioTrack)
    if (currentIndex > 0) {
      this.trackQueue.splice(currentIndex, 1)
      this.trackQueue.unshift(this.config.audioTrack)
    }
  },

  // Shuffle track queue
  shuffleTrackQueue: function () {
    for (let i = this.trackQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.trackQueue[i], this.trackQueue[j]] = [this.trackQueue[j], this.trackQueue[i]]
    }
  },

  // Next track
  nextTrack: function () {
    // Move current track to the end of the queue
    this.trackQueue.push(this.trackQueue.shift())

    // Get next track
    const nextTrack = this.trackQueue[0]

    // Change to next track
    this.changeTrack(nextTrack)
  },

  // Create track selector
  createTrackSelector: function () {
    // Clear existing options
    this.elements.trackSelector.innerHTML = "<h3>SELECT TRACK</h3>"

    // Add options for each track
    Object.keys(this.audioTracks).forEach((trackId) => {
      const track = this.audioTracks[trackId]
      const option = document.createElement("div")
      option.className = "track-option"
      option.textContent = track.title
      option.dataset.trackId = trackId

      if (trackId === this.config.audioTrack) {
        option.classList.add("active")
      }

      option.addEventListener("click", () => {
        this.changeTrack(trackId)
        this.elements.trackSelector.style.display = "none"
      })

      this.elements.trackSelector.appendChild(option)
    })
  },

  // Toggle track selector
  toggleTrackSelector: function () {
    if (this.elements.trackSelector.style.display === "block") {
      this.elements.trackSelector.style.display = "none"
    } else {
      this.elements.trackSelector.style.display = "block"
    }
  },

  // Change track
  changeTrack: function (trackId) {
    // Update active track
    this.config.audioTrack = trackId

    // Update track info
    this.elements.trackInfo.textContent = `Now Playing: ${this.audioTracks[trackId].title}`

    // If currently playing, restart with new track
    const wasPlaying = this.isPlaying

    if (this.isPlaying) {
      this.audioElement.pause()
      this.isPlaying = false
    }

    // Load new track
    this.audioElement.src = this.audioTracks[trackId].url
    this.audioElement.load()

    // Show loading status
    this.elements.audioStatus.textContent = "Loading new track..."
    this.elements.audioStatus.style.display = "block"

    // When loaded, play if it was playing before
    this.audioElement.addEventListener("canplaythrough", () => {
      this.elements.audioStatus.textContent = "Track loaded!"
      setTimeout(() => {
        this.elements.audioStatus.style.display = "none"
      }, 2000)

      if (wasPlaying) {
        this.toggleAudio()
      }
    })

    // Update track selector
    this.createTrackSelector()

    // Update track queue
    const currentIndex = this.trackQueue.indexOf(trackId)
    if (currentIndex > 0) {
      this.trackQueue.splice(currentIndex, 1)
      this.trackQueue.unshift(trackId)
    }
  },

  // Toggle audio
  toggleAudio: function () {
    if (!this.audioLoaded) {
      this.elements.audioStatus.textContent = "Audio still loading... Please wait."
      this.elements.audioStatus.style.display = "block"
      setTimeout(() => {
        this.elements.audioStatus.style.display = "none"
      }, 3000)
      return
    }

    if (this.isPlaying) {
      this.audioElement.pause()
      this.elements.audioButton.classList.remove("active")
      this.elements.audioButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
      this.elements.audioVisualizer.style.display = "none"
      this.elements.trackInfo.style.display = "none"
      this.elements.audioStatus.style.display = "none"

      // Stop ambient sound
      if (this.ambientSound) {
        this.ambientSound.pause()
      }
    } else {
      // Set up audio context if not already done
      if (!this.audioContext) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          this.audioContext = new AudioContext()

          // Create analyzer
          this.audioAnalyser = this.audioContext.createAnalyser()
          this.audioAnalyser.fftSize = 256

          // Connect audio element to the audio context
          this.audioSource = this.audioContext.createMediaElementSource(this.audioElement)
          this.audioSource.connect(this.audioAnalyser)
          this.audioAnalyser.connect(this.audioContext.destination)

          // Create data arrays
          this.audioData = new Float32Array(this.audioAnalyser.frequencyBinCount)
          this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount)

          // Start audio data update loop
          this.updateAudioData()
        } catch (e) {
          console.error("Web Audio API error:", e)
          this.elements.audioStatus.textContent = "Audio API error. Try a different browser."
          this.elements.audioStatus.style.color = "#ff0000"
          this.elements.audioStatus.style.display = "block"
          return
        }
      }

      // Resume audio context if suspended
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume()
      }

      // Set volume
      this.audioElement.volume = this.config.volume

      // Play audio
      this.audioElement
        .play()
        .then(() => {
          this.elements.audioButton.classList.add("active")
          this.elements.audioButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
          this.elements.audioVisualizer.style.display = "block"

          // Display track info
          this.elements.trackInfo.textContent = `Now Playing: ${this.audioTracks[this.config.audioTrack].title}`
          this.elements.trackInfo.style.display = "block"

          this.elements.audioStatus.textContent = "Audio playing"
          this.elements.audioStatus.style.color = "#00ffff"
          this.elements.audioStatus.style.display = "block"
          setTimeout(() => {
            this.elements.audioStatus.style.display = "none"
          }, 2000)

          // Start ambient sound
          if (this.ambientSound && this.config.showAmbientSound) {
            this.ambientSound.play()
          }
        })
        .catch((e) => {
          console.error("Audio play error:", e)
          this.elements.audioStatus.textContent = "Couldn't play audio. Try clicking again."
          this.elements.audioStatus.style.color = "#ff0000"
          this.elements.audioStatus.style.display = "block"
        })
    }

    this.isPlaying = !this.isPlaying
  },

  // Update audio data
  updateAudioData: function () {
    if (!this.audioAnalyser) return

    // Get time domain data
    this.audioAnalyser.getFloatTimeDomainData(this.audioData)

    // Get frequency data
    this.audioAnalyser.getByteFrequencyData(this.frequencyData)

    // Update visualizer
    this.drawAudioVisualizer()

    requestAnimationFrame(() => this.updateAudioData())
  },

  // Draw audio visualizer
  drawAudioVisualizer: function () {
    if (!this.visualizerCtx || !this.frequencyData) return

    // Clear canvas
    this.visualizerCtx.clearRect(0, 0, this.elements.audioVisualizer.width, this.elements.audioVisualizer.height)

    // Set up visualization style
    const barWidth = 3
    const barGap = 1
    const barCount = Math.min(64, this.frequencyData.length)
    const centerY = this.elements.audioVisualizer.height / 2

    // Draw frequency bars
    for (let i = 0; i < barCount; i++) {
      const amplitude = this.frequencyData[i] / 255 // Normalize to 0-1
      const barHeight = Math.max(2, (amplitude * this.elements.audioVisualizer.height) / 2)

      // Create gradient for each bar
      const gradient = this.visualizerCtx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)

      gradient.addColorStop(0, "rgba(255, 0, 255, 0.8)")
      gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.8)")
      gradient.addColorStop(1, "rgba(255, 0, 255, 0.8)")

      this.visualizerCtx.fillStyle = gradient

      // Draw mirrored bars
      this.visualizerCtx.fillRect(i * (barWidth + barGap), centerY - barHeight, barWidth, barHeight)
      this.visualizerCtx.fillRect(i * (barWidth + barGap), centerY, barWidth, barHeight)
    }

    // Draw center line
    this.visualizerCtx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    this.visualizerCtx.beginPath()
    this.visualizerCtx.moveTo(0, centerY)
    this.visualizerCtx.lineTo(this.elements.audioVisualizer.width, centerY)
    this.visualizerCtx.stroke()
  },

  // Cycle through visual themes
  cycleTheme: function () {
    const themes = Object.keys(this.visualThemes)
    const currentIndex = themes.indexOf(this.config.visualTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.config.visualTheme = themes[nextIndex]

    // Show theme indicator
    this.elements.themeIndicator.textContent = this.visualThemes[this.config.visualTheme].name
    this.elements.themeIndicator.style.opacity = "1"
    this.elements.themeIndicator.classList.add("fade-in")

    // Hide theme indicator after a delay
    setTimeout(() => {
      this.elements.themeIndicator.classList.remove("fade-in")
      this.elements.themeIndicator.classList.add("fade-out")
      setTimeout(() => {
        this.elements.themeIndicator.style.opacity = "0"
        this.elements.themeIndicator.classList.remove("fade-out")
      }, 500)
    }, 2000)

    // Update scene
    this.updateVisualTheme()
  },

  // Update visual theme
  updateVisualTheme: function () {
    const theme = this.visualThemes[this.config.visualTheme]

    // Update fog
    if (this.scene && this.scene.fog) {
      this.scene.fog.color.set(theme.fogColor)
    }

    // Update sky
    if (this.skyMesh) {
      this.skyMesh.material.color.set(theme.skyColor)
    }

    // Update floor
    if (this.floorMesh) {
      this.floorMesh.material.color.set(theme.gridColor)
    }

    // Update particles
    if (this.particles) {
      const colors = this.particles.geometry.attributes.color.array
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)

      for (let i = 0; i < colors.length / 3; i++) {
        const mixRatio = Math.random()
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

        colors[i * 3] = mixedColor.r
        colors[i * 3 + 1] = mixedColor.g
        colors[i * 3 + 2] = mixedColor.b
      }

      this.particles.geometry.attributes.color.needsUpdate = true
    }

    // Update bloom settings
    if (this.bloomPass) {
      this.bloomPass.strength = theme.bloomStrength
      this.bloomPass.radius = theme.bloomRadius
      this.bloomPass.threshold = theme.bloomThreshold
    }
  },
}

// Start Tripscape when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => Tripscape.init())
