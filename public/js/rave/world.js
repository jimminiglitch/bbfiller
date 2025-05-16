// 3D Rave City - World System

const RaveCity = window.RaveCity || {}

// World System
RaveCity.World = {
  // Scene objects
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  clock: null,
  raycaster: null,

  // World objects
  particles: null,
  floorMesh: null,
  skyMesh: null,
  buildings: [],
  skyObjects: [],
  lasers: [],
  smokeMachines: [],
  zones: [],

  // Post-processing
  bloomPass: null,
  glitchPass: null,
  rgbShiftPass: null,

  // Procedural generation
  lastGenerationPosition: null,
  generationRadius: 500,
  generationDistance: 300,

  // Initialize world
  init: function (elements) {
    try {
      console.log("Initializing 3D world...")

      this.elements = elements

      // Create scene
      this.createScene()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      console.log("3D world initialized successfully")
      return this
    } catch (error) {
      console.error("Failed to initialize 3D world:", error)
      RaveCity.UI.showError(`Failed to initialize 3D world: ${error.message}`)
      return null
    }
  },

  // Create scene
  createScene: function () {
    // Create scene
    this.scene = new THREE.Scene()

    // Add fog for depth
    const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]
    this.scene.fog = new THREE.FogExp2(theme.fogColor, 0.008)

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
      const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]

      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer)

      // Add render pass
      const renderPass = new THREE.RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      // Add bloom pass if enabled
      if (RaveCity.Config.bloomEnabled) {
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
      console.error("Failed to set up post-processing:", error)
      RaveCity.UI.showError(`Failed to set up post-processing: ${error.message}`)
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]

      // Create floor (dance floor)
      this.createDanceFloor(theme)

      // Create sky dome
      this.createSkyDome(theme)

      // Create particle system
      this.createParticles(theme)

      // Create buildings
      this.createBuildings(theme)

      // Create lasers
      this.createLasers(theme)

      // Create smoke machines
      if (RaveCity.Config.showSmoke) {
        this.createSmokeMachines(theme)
      }

      // Create zones (different party areas)
      this.createZones(theme)

      // Set up infinite world generation
      this.setupInfiniteWorld()

      // Initialize dancers
      RaveCity.Dancers.init(this.scene)
    } catch (error) {
      console.error("Failed to create scene objects:", error)
      RaveCity.UI.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Set up infinite world generation
  setupInfiniteWorld: function () {
    // Create a much larger floor that extends "infinitely"
    this.updateDanceFloor(2000) // Extremely large floor

    // Set up procedural generation based on player position
    this.lastGenerationPosition = new THREE.Vector3()
    this.generationRadius = 500
    this.generationDistance = 300
  },

  // Update dance floor size
  updateDanceFloor: function (size) {
    // Remove old floor
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
    }

    const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]

    // Create a much larger grid floor
    const floorSize = size
    const floorSegments = 200

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
    const skyGeometry = new THREE.SphereGeometry(5000, 64, 64)
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
    if (!RaveCity.Config.showSkyObjects) return

    for (let i = 0; i < RaveCity.Config.skyObjectCount; i++) {
      // Random position in the sky
      const radius = 100 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = 50 + Math.random() * 300 // Higher up in the sky
      const z = radius * Math.sin(phi) * Math.sin(theta)

      this.createSkyObject(x, y, z, theme)
    }
  },

  // Create a single sky object
  createSkyObject: function (x, y, z, theme) {
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

    return object
  },

  // Create particles
  createParticles: function (theme) {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = RaveCity.Config.density * 200 // More particles

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
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    })

    this.particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  },

  // Create buildings
  createBuildings: function (theme) {
    if (!RaveCity.Config.showBuildings) return

    for (let i = 0; i < RaveCity.Config.buildingCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      this.createBuilding(x, z, theme)
    }
  },

  // Create a single building
  createBuilding: function (x, z, theme) {
    // Random building properties
    const width = 5 + Math.random() * 15
    const height = 20 + Math.random() * 80
    const depth = 5 + Math.random() * 15

    // Random color
    const color1 = new THREE.Color(theme.buildingColor1)
    const color2 = new THREE.Color(theme.buildingColor2)
    const mixRatio = Math.random()
    const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create building geometry
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: buildingColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(x, height / 2 - 2, z)

    this.scene.add(building)
    this.buildings.push(building)

    return building
  },

  // Create lasers
  createLasers: function (theme) {
    if (!RaveCity.Config.showLasers) return

    for (let i = 0; i < RaveCity.Config.laserCount; i++) {
      // Random start and end points
      const startX = (Math.random() - 0.5) * 400
      const startY = 5 + Math.random() * 50
      const startZ = (Math.random() - 0.5) * 400

      const endX = (Math.random() - 0.5) * 400
      const endY = 5 + Math.random() * 50
      const endZ = (Math.random() - 0.5) * 400

      // Random color
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      const mixRatio = Math.random()
      const laserColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      // Create laser geometry using BufferGeometry
      const laserGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([startX, startY, startZ, endX, endY, endZ])
      laserGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

      const laserMaterial = new THREE.LineBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.6,
      })

      const laser = new THREE.Line(laserGeometry, laserMaterial)
      this.scene.add(laser)
      this.lasers.push(laser)

      // Add animation data
      laser.userData = {
        color1: color1,
        color2: color2,
        mixRatio: Math.random(),
        colorChangeSpeed: 0.01 + Math.random() * 0.05,
      }
    }
  },

  // Create smoke machines
  createSmokeMachines: function (theme) {
    for (let i = 0; i < RaveCity.Config.smokeCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const y = 0
      const z = (Math.random() - 0.5) * 400

      // Create smoke particle system using BufferGeometry
      const particleCount = 50
      const smokeGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const velocities = []

      for (let j = 0; j < particleCount; j++) {
        positions[j * 3] = x
        positions[j * 3 + 1] = y
        positions[j * 3 + 2] = z

        // Store velocity separately since BufferGeometry doesn't support custom attributes like Geometry did
        velocities.push(new THREE.Vector3(0, 0.5 + Math.random(), 0))
      }

      smokeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const smokeMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5 + Math.random() * 10,
        transparent: true,
        opacity: 0.3,
      })

      const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
      smoke.userData = { velocities: velocities } // Store velocities in userData
      this.scene.add(smoke)
      this.smokeMachines.push(smoke)
    }
  },

  // Create zones
  createZones: function (theme) {
    // Create different party zones
    const zoneCount = 4
    for (let i = 0; i < zoneCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      // Create zone geometry
      const zoneGeometry = new THREE.CircleGeometry(50 + Math.random() * 100, 32)
      const zoneMaterial = new THREE.MeshBasicMaterial({
        color: theme.gridColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      })

      const zone = new THREE.Mesh(zoneGeometry, zoneMaterial)
      zone.rotation.x = -Math.PI / 2
      zone.position.set(x, -1.9, z)
      this.scene.add(zone)
      this.zones.push(zone)
    }
  },

  // Check if we need to generate more content based on player position
  checkProceduralGeneration: function () {
    if (!this.lastGenerationPosition) return

    const distanceMoved = this.camera.position.distanceTo(this.lastGenerationPosition)

    // If player has moved far enough, generate new content
    if (distanceMoved > this.generationDistance) {
      this.generateWorldContent()
      this.lastGenerationPosition.copy(this.camera.position)
    }
  },

  // Generate new world content around the player
  generateWorldContent: function () {
    const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]
    const playerPos = this.camera.position.clone()

    // Generate new buildings
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.5 + Math.random() * this.generationRadius * 0.5

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createBuilding(x, z, theme)
    }

    // Generate new dancers
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.3 + Math.random() * this.generationRadius * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      RaveCity.Dancers.createDancerAt(x, 0, z, true)
    }

    // Generate new regular people
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.3 + Math.random() * this.generationRadius * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      RaveCity.Dancers.createDancerAt(x, 0, z, false)
    }

    // Generate new sky objects
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.7 + Math.random() * this.generationRadius * 0.3
      const height = 50 + Math.random() * 300

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createSkyObject(x, height, z, theme)
    }
  },

  // Update world objects
  update: function (time, deltaTime, audioData) {
    // Update particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        // Slightly move particles up and down
        positions[i + 1] += Math.sin(time + i) * 0.01
      }

      this.particles.geometry.attributes.position.needsUpdate = true
    }

    // Update sky objects
    this.skyObjects.forEach((object) => {
      // Rotate objects
      if (object.userData && object.userData.rotationSpeed) {
        object.rotation.x += object.userData.rotationSpeed.x
        object.rotation.y += object.userData.rotationSpeed.y
        object.rotation.z += object.userData.rotationSpeed.z
      }

      // Float objects up and down
      if (object.userData && object.userData.floatSpeed) {
        object.position.y =
          object.userData.originalY + Math.sin(time * object.userData.floatSpeed + object.userData.floatOffset) * 10
      }
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      // Change laser color over time
      laser.userData.mixRatio += laser.userData.colorChangeSpeed
      if (laser.userData.mixRatio > 1) {
        laser.userData.mixRatio = 0
        laser.userData.colorChangeSpeed = 0.01 + Math.random() * 0.05
      }

      const laserColor = new THREE.Color().lerpColors(
        laser.userData.color1,
        laser.userData.color2,
        laser.userData.mixRatio,
      )
      laser.material.color.set(laserColor)
    })

    // Update smoke machines
    this.smokeMachines.forEach((smoke) => {
      if (smoke.userData && smoke.userData.velocities) {
        const positions = smoke.geometry.attributes.position.array
        const velocities = smoke.userData.velocities

        for (let i = 0; i < velocities.length; i++) {
          const idx = i * 3
          positions[idx + 1] += velocities[i].y * deltaTime * 10

          // Reset particle if it goes too high
          if (positions[idx + 1] > 100) {
            positions[idx + 1] = 0
          }
        }

        smoke.geometry.attributes.position.needsUpdate = true
      }
    })

    // Update sky dome position to follow camera
    if (this.skyMesh) {
      this.skyMesh.position.copy(this.camera.position)
    }

    // Update dancers
    RaveCity.Dancers.update(time, deltaTime, audioData)

    // Check for procedural generation
    this.checkProceduralGeneration()

    // Update post-processing effects based on audio
    if (audioData && RaveCity.Config.audioReactive) {
      const bassImpact = audioData.bassFrequency * RaveCity.Config.bassImpact

      // Adjust bloom intensity based on bass
      if (this.bloomPass) {
        this.bloomPass.strength =
          RaveCity.Config.visualThemes[RaveCity.Config.visualTheme].bloomStrength + bassImpact * 0.5
      }

      // Adjust glitch intensity based on audio
      this.glitchPass.enabled = bassImpact > 0.2
      this.glitchPass.goWild = bassImpact > 0.5

      // Adjust RGB shift amount based on audio
      this.rgbShiftPass.uniforms.amount.value = 0.0015 + bassImpact * 0.001
    }
  },

  // Handle window resize
  onWindowResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight)
    }
  },

  // Render the scene
  render: function () {
    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  },

  // Update theme
  updateTheme: function () {
    const theme = RaveCity.Config.visualThemes[RaveCity.Config.visualTheme]

    // Update fog color
    this.scene.fog.color.set(theme.fogColor)

    // Update floor color
    if (this.floorMesh) {
      this.floorMesh.material.color.set(theme.gridColor)
    }

    // Update sky color
    if (this.skyMesh) {
      this.skyMesh.material.color.set(theme.skyColor)
    }

    // Update particles color
    if (this.particles) {
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      const colors = this.particles.geometry.attributes.color.array

      for (let i = 0; i < colors.length; i += 3) {
        const mixRatio = Math.random()
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

        colors[i] = mixedColor.r
        colors[i + 1] = mixedColor.g
        colors[i + 2] = mixedColor.b
      }

      this.particles.geometry.attributes.color.needsUpdate = true
    }

    // Update buildings color
    this.buildings.forEach((building) => {
      const color1 = new THREE.Color(theme.buildingColor1)
      const color2 = new THREE.Color(theme.buildingColor2)
      const mixRatio = Math.random()
      const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)
      building.material.color.set(buildingColor)
    })

    // Update lasers color
    this.lasers.forEach((laser) => {
      laser.userData.color1.set(theme.particleColor1)
      laser.userData.color2.set(theme.particleColor2)
    })

    // Update bloom pass
    if (this.bloomPass) {
      this.bloomPass.strength = theme.bloomStrength
      this.bloomPass.radius = theme.bloomRadius
      this.bloomPass.threshold = theme.bloomThreshold
    }
  },
}

 = theme.bloomRadius
this.bloomPass.threshold = theme.bloomThreshold
}
  }
}
