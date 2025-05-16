// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎵 Initializing...")

  // Simulate loading screen
  const loadingScreen = document.getElementById("loading-screen")
  const loadingProgressBar = document.getElementById("loading-progress-bar")
  const loadingMessage = document.getElementById("loading-message")

  // Loading messages
  const loadingMessages = [
    "Initializing audio system...",
    "Loading visualizers...",
    "Calibrating audio analyzers...",
    "Preparing sound spectrum...",
    "Connecting to audio interface...",
    "Ready to launch...",
  ]

  // Simulate loading progress
  let loadingProgress = 0
  const loadingInterval = setInterval(() => {
    loadingProgress += Math.random() * 15
    if (loadingProgress > 100) {
      loadingProgress = 100
      clearInterval(loadingInterval)

      // Hide loading screen after a short delay
      setTimeout(() => {
        loadingScreen.style.opacity = "0"
        setTimeout(() => {
          loadingScreen.style.display = "none"
        }, 500)
      }, 500)
    }

    // Update progress bar
    loadingProgressBar.style.width = loadingProgress + "%"

    // Update loading message
    const messageIndex = Math.min(
      Math.floor((loadingProgress / 100) * loadingMessages.length),
      loadingMessages.length - 1,
    )
    loadingMessage.textContent = loadingMessages[messageIndex]
  }, 400)

  // Prevent screen from sleeping
  let wakeLock = null

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen")
        console.log("Wake Lock is active")

        // Re-request wake lock if page becomes visible again
        document.addEventListener("visibilitychange", handleVisibilityChange)
      } else {
        console.log("Wake Lock API not supported")
      }
    } catch (err) {
      console.error(`Error requesting wake lock: ${err.name}, ${err.message}`)
    }
  }

  async function handleVisibilityChange() {
    if (document.visibilityState === "visible" && wakeLock === null) {
      await requestWakeLock()
    }
  }

  // Request wake lock when user interacts with the page
  document.addEventListener("click", () => {
    if (!wakeLock) {
      requestWakeLock()
    }
  })

  // Define tracks with artist information
  const tracks = [
    {
      title: "Paper Doll (LIVE)",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/Paper%20Doll%20(LIVE).mp3?v=1746751595622",
    },
    {
      title: "Hard Thing",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Hard%20Thing.mp3?v=1746889492826",
    },
    {
      title: "Monsters",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Monsters%20in%20the%20CiA.mp3?v=1746889496155",
    },
    {
      title: "F*ck",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Fuck.mp3?v=1746889506198",
    },
    {
      title: "Manameisdrnk",
      artist: "Dead Beast",
      src: "https://cdn.glitch.me/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/mynameisdrunk.wav?v=1746751634863",
    },
    {
      title: "L1k32D13",
      artist: "Dread Wingz",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dread%20Wingz%20-%20Like2Die.mp3?v=1746889500203",
    },
    {
      title: "M@k1n B@k1n",
      artist: "Dread Wingz",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dread%20Wingz%20-%20Makin%20Bacon.mp3?v=1746889503112",
    },
  ]

  // DOM refs
  const audio = document.getElementById("music-player")
  const visCtx = document.getElementById("visualizer").getContext("2d")
  const bgCtx = document.getElementById("visualizer-bg").getContext("2d")
  const vis3dContainer = document.getElementById("visualizer-3d")
  const playlist = document.getElementById("playlist")
  const nowTxt = document.getElementById("now-playing")
  const artistTxt = document.getElementById("track-artist")
  const curT = document.getElementById("current-time")
  const totT = document.getElementById("total-time")
  const progBar = document.getElementById("progress-bar")
  const progCon = document.getElementById("progress-container")
  const prevBtn = document.getElementById("prevTrack")
  const nxtBtn = document.getElementById("nextTrack")
  const playBtn = document.getElementById("togglePlay")
  const modeBtns = document.querySelectorAll(".mode-button")
  const volumeSlider = document.getElementById("volume-slider")
  const muteBtn = document.getElementById("toggleMute")
  const togglePlaylistBtn = document.getElementById("togglePlaylist")
  const playlistSection = document.getElementById("playlist-section")
  const trackCount = document.getElementById("track-count")
  const toggleEqBtn = document.getElementById("toggle-equalizer")
  const eqSliders = document.getElementById("equalizer-sliders")
  const eqSliderInputs = document.querySelectorAll(".eq-slider")
  const presetButtons = document.querySelectorAll(".preset-button")

  // State variables
  let idx = 0
  let isPlaying = false
  let mode = "radial"
  let particles = []
  let lastTime = 0
  let is3DActive = false
  let audioCtx = null
  let analyser = null
  let srcNode = null
  let dataArr = null
  let timeData = null
  let audioInitialized = false
  let previousVolume = 0.7
  let isMuted = false
  let equalizerNodes = []
  let isEqActive = false

  // Safe audio context creation
  function createAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        console.error("🎵 Web Audio API not supported in this browser")
        return false
      }

      audioCtx = new AudioContext()
      console.log("🎵 Audio context created successfully")
      return true
    } catch (e) {
      console.error("🎵 Error creating audio context:", e)
      return false
    }
  }

  // Initialize Web Audio API with Equalizer
  function initAudio() {
    if (audioInitialized) return true

    try {
      if (!audioCtx && !createAudioContext()) {
        return false
      }

      // Create audio nodes
      srcNode = audioCtx.createMediaElementSource(audio)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048 // Higher for more detailed visualization

      // Create equalizer bands
      const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000]
      equalizerNodes = frequencies.map((frequency) => {
        const filter = audioCtx.createBiquadFilter()
        filter.type = "peaking"
        filter.frequency.value = frequency
        filter.gain.value = 0
        filter.Q.value = 1
        return filter
      })

      // Connect nodes in series: source -> eq filters -> analyser -> destination
      let prevNode = srcNode
      equalizerNodes.forEach((node) => {
        prevNode.connect(node)
        prevNode = node
      })

      prevNode.connect(analyser)
      analyser.connect(audioCtx.destination)

      // Create data arrays
      dataArr = new Uint8Array(analyser.frequencyBinCount)
      timeData = new Uint8Array(analyser.frequencyBinCount)

      audioInitialized = true
      console.log("🎵 Audio system initialized successfully with equalizer")
      return true
    } catch (e) {
      console.error("🎵 Error initializing audio system:", e)
      return false
    }
  }

  // Resize canvas to match container
  function resizeCanvas() {
    try {
      const container = document.getElementById("visualizer-container")
      const canvas = document.getElementById("visualizer")
      const bgCanvas = document.getElementById("visualizer-bg")

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      bgCanvas.width = container.clientWidth
      bgCanvas.height = container.clientHeight

      // If 3D is initialized, update it too
      if (three && three.initialized && three.renderer) {
        three.renderer.setSize(container.clientWidth, container.clientHeight)
        three.camera.aspect = container.clientWidth / container.clientHeight
        three.camera.updateProjectionMatrix()
      }
    } catch (e) {
      console.error("🎵 Error resizing canvas:", e)
    }
  }

  // Call resize on load and window resize
  window.addEventListener("resize", resizeCanvas)
  resizeCanvas()

  // Build playlist
  function buildPlaylist() {
    try {
      // Clear existing playlist
      playlist.innerHTML = ""

      // Add tracks
      tracks.forEach((t, i) => {
        const li = document.createElement("li")
        li.innerHTML = `
          <div class="track-number">${i + 1}</div>
          <div class="track-details">
            <div class="track-title">${t.title}</div>
            <div class="track-artist-name">${t.artist}</div>
          </div>
        `
        li.onclick = () => loadTrack(i)
        playlist.append(li)
      })

      // Update track count
      trackCount.textContent = `${tracks.length} tracks`

      console.log("🎵 Playlist built with", tracks.length, "tracks")
    } catch (e) {
      console.error("🎵 Error building playlist:", e)
    }
  }

  buildPlaylist()

  // Load & play track
  function loadTrack(i) {
    try {
      idx = i
      audio.src = tracks[i].src
      nowTxt.textContent = tracks[i].title
      artistTxt.textContent = tracks[i].artist
      highlight()

      if (isPlaying) {
        playAudio()
      }
    } catch (e) {
      console.error("🎵 Error loading track:", e)
    }
  }

  // Highlight playlist & play button
  function highlight() {
    try {
      playlist.querySelectorAll("li").forEach((li, i) => li.classList.toggle("playing", i === idx))
      playBtn.textContent = isPlaying ? "⏸ PAUSE" : "▶ PLAY"
      playBtn.classList.toggle("playing", isPlaying)

      // Update track info icon
      const trackInfoIcon = document.querySelector(".track-info-icon")
      if (trackInfoIcon) {
        trackInfoIcon.textContent = isPlaying ? "▶" : "❚❚"
        trackInfoIcon.classList.toggle("animate-pulse", isPlaying)
      }
    } catch (e) {
      console.error("🎵 Error highlighting:", e)
    }
  }

  // Play audio with error handling
  function playAudio() {
    try {
      // Initialize audio if needed
      if (!audioInitialized && !initAudio()) {
        console.error("🎵 Failed to initialize audio")
        return
      }

      // Resume audio context if suspended
      if (audioCtx.state !== "running") {
        audioCtx.resume().catch((e) => console.error("🎵 Error resuming audio context:", e))
      }

      // Play audio
      audio
        .play()
        .then(() => {
          isPlaying = true
          highlight()
          console.log("🎵 Audio playback started")

          // Request wake lock when playback starts
          requestWakeLock()
        })
        .catch((e) => {
          console.error("🎵 Error playing audio:", e)
          isPlaying = false
          highlight()
        })
    } catch (e) {
      console.error("🎵 Error in playAudio:", e)
    }
  }

  // Handle play button click
  function togglePlay() {
    try {
      if (audio.paused) {
        playAudio()
      } else {
        audio.pause()
        isPlaying = false
        highlight()
      }
    } catch (e) {
      console.error("🎵 Error toggling play:", e)
    }
  }

  // Time/progress updates
  audio.ontimeupdate = () => {
    try {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100
        progBar.style.width = `${pct}%`
        curT.textContent = fmt(audio.currentTime)
        totT.textContent = fmt(audio.duration)
      }
    } catch (e) {
      console.error("🎵 Error updating time:", e)
    }
  }

  // Handle track end
  audio.onended = () => {
    try {
      idx = (idx + 1) % tracks.length
      loadTrack(idx)
    } catch (e) {
      console.error("🎵 Error handling track end:", e)
    }
  }

  // Set up controls
  playBtn.onclick = togglePlay
  prevBtn.onclick = () => {
    try {
      idx = (idx - 1 + tracks.length) % tracks.length
      loadTrack(idx)
    } catch (e) {
      console.error("🎵 Error on prev track:", e)
    }
  }
  nxtBtn.onclick = () => {
    try {
      idx = (idx + 1) % tracks.length
      loadTrack(idx)
    } catch (e) {
      console.error("🎵 Error on next track:", e)
    }
  }
  progCon.onclick = (e) => {
    try {
      const rect = progCon.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      if (audio.duration) audio.currentTime = pct * audio.duration
    } catch (e) {
      console.error("🎵 Error seeking:", e)
    }
  }

  // Set up visualizer mode buttons
  modeBtns.forEach((b) => {
    b.onclick = () => {
      try {
        mode = b.dataset.mode
        modeBtns.forEach((x) => x.classList.toggle("active", x === b))

        // Toggle 3D mode
        is3DActive = mode === "3d"
        document.getElementById("visualizer").style.display = is3DActive ? "none" : "block"
        document.getElementById("visualizer-bg").style.display = is3DActive ? "none" : "block"
        document.getElementById("visualizer-3d").style.display = is3DActive ? "block" : "none"

        // Initialize 3D if needed
        if (is3DActive && three && !three.initialized) {
          init3D()
        }

        // Reset particles when switching to particle mode
        if (mode === "particles") {
          initParticles()
        }
      } catch (e) {
        console.error("🎵 Error changing visualizer mode:", e)
      }
    }
  })

  // Volume control
  volumeSlider.addEventListener("input", () => {
    try {
      const volume = Number.parseFloat(volumeSlider.value)
      audio.volume = volume

      // Update mute button
      updateMuteButton(volume)

      // Store volume for unmute
      if (volume > 0) {
        previousVolume = volume
        isMuted = false
      } else {
        isMuted = true
      }
    } catch (e) {
      console.error("🎵 Error adjusting volume:", e)
    }
  })

  // Mute button
  muteBtn.addEventListener("click", () => {
    try {
      if (isMuted) {
        // Unmute
        audio.volume = previousVolume
        volumeSlider.value = previousVolume
        isMuted = false
      } else {
        // Mute
        previousVolume = audio.volume
        audio.volume = 0
        volumeSlider.value = 0
        isMuted = true
      }

      updateMuteButton(audio.volume)
    } catch (e) {
      console.error("🎵 Error toggling mute:", e)
    }
  })

  // Update mute button icon
  function updateMuteButton(volume) {
    if (volume === 0) {
      muteBtn.textContent = "🔇"
    } else if (volume < 0.3) {
      muteBtn.textContent = "🔈"
    } else if (volume < 0.7) {
      muteBtn.textContent = "🔉"
    } else {
      muteBtn.textContent = "🔊"
    }
  }

  // Toggle playlist on mobile
  togglePlaylistBtn.addEventListener("click", () => {
    playlistSection.classList.toggle("active")
  })

  // Toggle equalizer
  toggleEqBtn.addEventListener("click", () => {
    isEqActive = !isEqActive
    eqSliders.classList.toggle("active", isEqActive)
    toggleEqBtn.textContent = isEqActive ? "HIDE" : "SHOW"
  })

  // Equalizer sliders
  eqSliderInputs.forEach((slider, index) => {
    slider.addEventListener("input", () => {
      try {
        if (equalizerNodes[index]) {
          const gain = Number.parseFloat(slider.value)
          equalizerNodes[index].gain.value = gain
        }
      } catch (e) {
        console.error("🎵 Error adjusting equalizer:", e)
      }
    })
  })

  // Equalizer presets
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      try {
        const preset = button.dataset.preset

        // Define preset values for each frequency band
        let presetValues = []

        switch (preset) {
          case "flat":
            presetValues = [0, 0, 0, 0, 0, 0, 0, 0]
            break
          case "bass":
            presetValues = [8, 6, 4, 2, 0, 0, 0, 0]
            break
          case "treble":
            presetValues = [0, 0, 0, 0, 2, 4, 6, 8]
            break
          case "vocal":
            presetValues = [-2, -2, 0, 4, 6, 4, 0, -2]
            break
          default:
            presetValues = [0, 0, 0, 0, 0, 0, 0, 0]
        }

        // Apply preset values to sliders and equalizer nodes
        eqSliderInputs.forEach((slider, index) => {
          slider.value = presetValues[index]
          if (equalizerNodes[index]) {
            equalizerNodes[index].gain.value = presetValues[index]
          }
        })
      } catch (e) {
        console.error("🎵 Error applying equalizer preset:", e)
      }
    })
  })

  // Format mm:ss
  function fmt(s) {
    try {
      const m = Math.floor(s / 60)
      const sec = Math.floor(s % 60)
        .toString()
        .padStart(2, "0")
      return `${m}:${sec}`
    } catch (e) {
      console.error("🎵 Error formatting time:", e)
      return "0:00"
    }
  }

  // Initialize particles for particle visualizer
  function initParticles() {
    try {
      particles = []
      const count = 100
      const w = visCtx.canvas.width
      const h = visCtx.canvas.height

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 5 + 2,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          hue: Math.random() * 360,
          amplitude: 0,
        })
      }
    } catch (e) {
      console.error("🎵 Error initializing particles:", e)
    }
  }

  // Update and draw particles
  function updateParticles(bassLevel) {
    try {
      if (!particles.length) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height

      particles.forEach((p) => {
        // Update position based on audio
        p.x += p.speedX * (1 + bassLevel * 2)
        p.y += p.speedY * (1 + bassLevel * 2)

        // Wrap around edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Update size and color based on audio
        p.amplitude = bassLevel
        p.hue = (p.hue + bassLevel * 5) % 360

        // Draw particle
        visCtx.beginPath()
        visCtx.arc(p.x, p.y, p.size * (1 + p.amplitude), 0, Math.PI * 2)
        visCtx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${0.7 + p.amplitude * 0.3})`
        visCtx.fill()

        // Draw connecting lines to nearby particles
        particles.forEach((p2) => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 50 + bassLevel * 100) {
            visCtx.beginPath()
            visCtx.moveTo(p.x, p.y)
            visCtx.lineTo(p2.x, p2.y)
            visCtx.strokeStyle = `hsla(${p.hue}, 100%, 50%, ${0.1 + bassLevel * 0.2})`
            visCtx.lineWidth = 0.5 + bassLevel
            visCtx.stroke()
          }
        })
      })
    } catch (e) {
      console.error("🎵 Error updating particles:", e)
    }
  }

  // Draw kaleidoscope effect
  function drawKaleidoscope() {
    try {
      if (!audioInitialized) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height
      const cx = w / 2
      const cy = h / 2

      // Get audio data
      analyser.getByteFrequencyData(dataArr)

      // Clear canvas with fade effect
      visCtx.fillStyle = "rgba(0, 0, 0, 0.1)"
      visCtx.fillRect(0, 0, w, h)

      // Number of segments in the kaleidoscope
      const segments = 12
      const angleStep = (Math.PI * 2) / segments

      // Save the current canvas state
      visCtx.save()
      visCtx.translate(cx, cy)

      // Draw each segment
      for (let i = 0; i < segments; i++) {
        visCtx.rotate(angleStep)

        // Draw lines radiating from center
        for (let j = 0; j < dataArr.length; j += 4) {
          const value = dataArr[j] / 255
          if (value < 0.1) continue

          const length = value * (w / 3)
          const thickness = value * 3
          const hue = (j + Date.now() * 0.05) % 360

          visCtx.beginPath()
          visCtx.moveTo(0, 0)
          visCtx.lineTo(length, j / 2)
          visCtx.strokeStyle = `hsla(${hue}, 100%, 50%, ${value})`
          visCtx.lineWidth = thickness
          visCtx.stroke()

          // Draw mirrored line
          visCtx.beginPath()
          visCtx.moveTo(0, 0)
          visCtx.lineTo(length, -j / 2)
          visCtx.stroke()
        }
      }

      // Restore canvas state
      visCtx.restore()
    } catch (e) {
      console.error("🎵 Error drawing kaleidoscope:", e)
    }
  }

  // Draw spiral visualizer
  function drawSpiral() {
    try {
      if (!audioInitialized) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height
      const cx = w / 2
      const cy = h / 2

      // Get audio data
      analyser.getByteFrequencyData(dataArr)

      // Clear canvas
      visCtx.clearRect(0, 0, w, h)

      // Calculate average frequency for overall intensity
      let sum = 0
      for (let i = 0; i < dataArr.length; i++) {
        sum += dataArr[i]
      }
      const avg = sum / dataArr.length / 255

      // Draw spiral
      const maxRadius = Math.min(w, h) / 2
      const spiralCount = 3
      const spiralOffset = Date.now() * 0.001

      for (let s = 0; s < spiralCount; s++) {
        const spiralPhase = (s / spiralCount) * Math.PI * 2

        visCtx.beginPath()

        for (let i = 0; i < dataArr.length; i++) {
          const value = dataArr[i] / 255
          const angle = (i / dataArr.length) * Math.PI * 10 + spiralOffset + spiralPhase
          const radius = (i / dataArr.length) * maxRadius * (0.5 + avg * 0.5)

          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius

          if (i === 0) {
            visCtx.moveTo(x, y)
          } else {
            visCtx.lineTo(x, y)
          }

          // Draw glow points at peaks
          if (value > 0.7) {
            const glowSize = value * 20
            const hue = (angle * 30 + Date.now() * 0.05) % 360

            visCtx.save()
            visCtx.beginPath()
            visCtx.arc(x, y, glowSize, 0, Math.PI * 2)
            const gradient = visCtx.createRadialGradient(x, y, 0, x, y, glowSize)
            gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`)
            gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)
            visCtx.fillStyle = gradient
            visCtx.fill()
            visCtx.restore()
          }
        }

        // Style and stroke the spiral
        const hue = (Date.now() * 0.05 + s * 120) % 360
        visCtx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.7)`
        visCtx.lineWidth = 2 + avg * 3
        visCtx.stroke()
      }
    } catch (e) {
      console.error("🎵 Error drawing spiral:", e)
    }
  }

  // 3D Visualization setup
  const three = {
    initialized: false,
    scene: null,
    camera: null,
    renderer: null,
    objects: [],
    analyser: null,
  }

  function init3D() {
    try {
      if (!window.THREE) {
        console.error("🎵 THREE.js not loaded")
        return
      }

      const container = document.getElementById("visualizer-3d")
      const width = container.clientWidth
      const height = container.clientHeight

      // Create scene
      three.scene = new THREE.Scene()

      // Create camera
      three.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      three.camera.position.z = 20

      // Create renderer
      three.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      three.renderer.setSize(width, height)
      three.renderer.setClearColor(0x000000, 0)

      // Clear container and add renderer
      container.innerHTML = ""
      container.appendChild(three.renderer.domElement)

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      three.scene.add(ambientLight)

      const pointLight = new THREE.PointLight(0x00ffff, 1, 100)
      pointLight.position.set(10, 10, 10)
      three.scene.add(pointLight)

      // Create objects
      createObjects()

      three.initialized = true
      console.log("🎵 3D visualization initialized")
    } catch (e) {
      console.error("🎵 Error initializing 3D:", e)
    }
  }

  function createObjects() {
    try {
      // Clear existing objects
      if (three.objects.length > 0) {
        three.objects.forEach((obj) => three.scene.remove(obj))
        three.objects = []
      }

      // Create a group for all objects
      const group = new THREE.Group()
      three.scene.add(group)
      three.objects.push(group)

      // Number of frequency bands to visualize
      const bands = 64

      // Create cubes for each frequency band
      for (let i = 0; i < bands; i++) {
        // Create cube
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(`hsl(${(i / bands) * 360}, 100%, 50%)`),
          transparent: true,
          opacity: 0.8,
          specular: 0xffffff,
          shininess: 100,
        })

        const cube = new THREE.Mesh(geometry, material)

        // Position in a circle
        const angle = (i / bands) * Math.PI * 2
        const radius = 10
        cube.position.x = Math.cos(angle) * radius
        cube.position.y = Math.sin(angle) * radius

        group.add(cube)
      }

      // Create center sphere
      const sphereGeometry = new THREE.SphereGeometry(3, 32, 32)
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        specular: 0xffffff,
        shininess: 100,
        wireframe: true,
      })

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      group.add(sphere)

      // Create particles
      const particleCount = 1000
      const particleGeometry = new THREE.BufferGeometry()
      const particlePositions = new Float32Array(particleCount * 3)
      const particleColors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        // Random position in a sphere
        const radius = 15 + Math.random() * 5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI

        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        particlePositions[i3 + 2] = radius * Math.cos(phi)

        // Random color
        const hue = (i / particleCount) * 360
        const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`)
        particleColors[i3] = color.r
        particleColors[i3 + 1] = color.g
        particleColors[i3 + 2] = color.b
      }

      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3))

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      })

      const particles = new THREE.Points(particleGeometry, particleMaterial)
      group.add(particles)
    } catch (e) {
      console.error("🎵 Error creating 3D objects:", e)
    }
  }

  function update3D() {
    try {
      if (!three.initialized || !audioInitialized) return

      // Get audio data
      analyser.getByteFrequencyData(dataArr)

      // Calculate average levels for different frequency ranges
      let bassSum = 0,
        midSum = 0,
        highSum = 0
      const bassRange = 10,
        midRange = 100,
        highRange = 300

      for (let i = 0; i < bassRange; i++) {
        bassSum += dataArr[i]
      }
      for (let i = bassRange; i < midRange; i++) {
        midSum += dataArr[i]
      }
      for (let i = midRange; i < highRange; i++) {
        highSum += dataArr[i]
      }

      const bassLevel = bassSum / (bassRange * 255)
      const midLevel = midSum / ((midRange - bassRange) * 255)
      const highLevel = highSum / ((highRange - midRange) * 255)

      // Rotate the entire group
      const group = three.objects[0]
      group.rotation.y += 0.005
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.2

      // Update cubes based on frequency data
      const cubes = group.children.filter((child) => child.geometry && child.geometry.type === "BoxGeometry")
      const bands = Math.min(cubes.length, dataArr.length)

      for (let i = 0; i < bands; i++) {
        const cube = cubes[i]
        const value = dataArr[i] / 255

        // Scale based on frequency amplitude
        cube.scale.y = 1 + value * 5

        // Move in and out based on frequency
        const angle = (i / bands) * Math.PI * 2
        const radius = 10 + value * 5
        cube.position.x = Math.cos(angle) * radius
        cube.position.y = Math.sin(angle) * radius

        // Rotate based on frequency
        cube.rotation.x += value * 0.1
        cube.rotation.y += value * 0.1

        // Update color based on frequency
        const hue = ((i / bands) * 360 + Date.now() * 0.05) % 360
        cube.material.color.setHSL(hue / 360, 1, 0.5)
        cube.material.opacity = 0.5 + value * 0.5
      }

      // Update center sphere
      const sphere = group.children.find((child) => child.geometry && child.geometry.type === "SphereGeometry")
      if (sphere) {
        // Pulse with bass
        sphere.scale.set(1 + bassLevel * 2, 1 + bassLevel * 2, 1 + bassLevel * 2)

        // Change color with time
        const hue = (Date.now() * 0.02) % 360
        sphere.material.color.setHSL(hue / 360, 1, 0.5)

        // Rotate
        sphere.rotation.y += 0.01
        sphere.rotation.x += 0.005
      }

      // Update particles
      const particles = group.children.find((child) => child instanceof THREE.Points)
      if (particles) {
        // Rotate particles
        particles.rotation.y -= 0.002

        // Update particle positions based on audio
        const positions = particles.geometry.attributes.position.array
        const colors = particles.geometry.attributes.color.array

        for (let i = 0; i < positions.length / 3; i++) {
          const i3 = i * 3

          // Get current position
          const x = positions[i3]
          const y = positions[i3 + 1]
          const z = positions[i3 + 2]

          // Calculate distance from center
          const distance = Math.sqrt(x * x + y * y + z * z)

          // Normalize to get direction
          const nx = x / distance
          const ny = y / distance
          const nz = z / distance

          // Determine which frequency range to use based on position
          let level = bassLevel
          if (Math.abs(ny) > 0.8) level = midLevel
          if (Math.abs(nz) > 0.8) level = highLevel

          // Move particles in and out based on audio
          const newDistance = 15 + Math.sin(Date.now() * 0.001 + i * 0.1) * 5 * level

          // Update position
          positions[i3] = nx * newDistance
          positions[i3 + 1] = ny * newDistance
          positions[i3 + 2] = nz * newDistance

          // Update color
          const hue = ((i / (positions.length / 3)) * 360 + Date.now() * 0.02) % 360
          const color = new THREE.Color().setHSL(hue / 360, 1, 0.5)
          colors[i3] = color.r
          colors[i3 + 1] = color.g
          colors[i3 + 2] = color.b
        }

        particles.geometry.attributes.position.needsUpdate = true
        particles.geometry.attributes.color.needsUpdate = true
      }

      // Render the scene
      three.renderer.render(three.scene, three.camera)
    } catch (e) {
      console.error("🎵 Error updating 3D:", e)
    }
  }

  // Draw placeholder visualization when audio isn't playing
  function drawPlaceholder() {
    try {
      const w = visCtx.canvas.width
      const h = visCtx.canvas.height
      const cx = w / 2
      const cy = h / 2

      // Clear canvas
      visCtx.clearRect(0, 0, w, h)

      // Draw pulsing circle
      const time = Date.now() * 0.001
      const radius = (Math.min(w, h) / 4) * (0.8 + Math.sin(time) * 0.2)

      visCtx.beginPath()
      visCtx.arc(cx, cy, radius, 0, Math.PI * 2)
      visCtx.strokeStyle = `hsl(${(time * 30) % 360}, 100%, 50%)`
      visCtx.lineWidth = 2
      visCtx.stroke()

      // Draw text
      visCtx.font = '16px "Press Start 2P", monospace'
      visCtx.textAlign = "center"
      visCtx.textBaseline = "middle"
      visCtx.fillStyle = "#0ff"
      visCtx.fillText("Press Play", cx, cy)
    } catch (e) {
      console.error("🎵 Error drawing placeholder:", e)
    }
  }

  // Draw dynamic background effect
  function drawBackgroundEffect(bassLevel) {
    try {
      const w = bgCtx.canvas.width
      const h = bgCtx.canvas.height

      // Clear with fade effect
      bgCtx.fillStyle = "rgba(0, 0, 0, 0.2)"
      bgCtx.fillRect(0, 0, w, h)

      // Draw pulsing circles based on bass
      const cx = w / 2
      const cy = h / 2
      const maxRadius = Math.sqrt(cx * cx + cy * cy)
      const pulseCount = 3

      for (let i = 0; i < pulseCount; i++) {
        const phase = (Date.now() * 0.001 + i / pulseCount) % 1
        const radius = phase * maxRadius
        const alpha = 0.5 - phase * 0.5

        bgCtx.beginPath()
        bgCtx.arc(cx, cy, radius, 0, Math.PI * 2)
        bgCtx.lineWidth = 2 + (bassLevel || 0) * 10

        // Cycle through colors
        const hue = (Date.now() * 0.05 + i * 120) % 360
        bgCtx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`
        bgCtx.stroke()
      }
    } catch (e) {
      console.error("🎵 Error drawing background effect:", e)
    }
  }

  // Enhanced bar visualizer
  function drawEnhancedBars() {
    try {
      if (!audioInitialized) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height

      // Get audio data
      analyser.getByteFrequencyData(dataArr)

      const barCount = dataArr.length / 2 // Use half the data for better visibility
      const barWidth = w / barCount

      // Draw mirrored bars
      for (let i = 0; i < barCount; i++) {
        const value = dataArr[i] / 255
        const barHeight = value * h * 0.8

        // Left side
        const x1 = w / 2 - i * barWidth - barWidth
        // Right side (mirrored)
        const x2 = w / 2 + i * barWidth

        // Calculate color based on frequency and time
        const hue = ((i / barCount) * 360 + Date.now() * 0.05) % 360

        // Draw left bar with glow
        visCtx.beginPath()
        visCtx.rect(x1, h - barHeight, barWidth * 0.8, barHeight)
        const gradient1 = visCtx.createLinearGradient(x1, h - barHeight, x1, h)
        gradient1.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`)
        gradient1.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.7)`)
        visCtx.fillStyle = gradient1
        visCtx.fill()

        // Add glow effect
        if (value > 0.5) {
          visCtx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`
          visCtx.shadowBlur = 15 * value
          visCtx.fill()
          visCtx.shadowBlur = 0
        }

        // Draw right bar with glow
        visCtx.beginPath()
        visCtx.rect(x2, h - barHeight, barWidth * 0.8, barHeight)
        const gradient2 = visCtx.createLinearGradient(x2, h - barHeight, x2, h)
        gradient2.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`)
        gradient2.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.7)`)
        visCtx.fillStyle = gradient2
        visCtx.fill()

        // Add glow effect
        if (value > 0.5) {
          visCtx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`
          visCtx.shadowBlur = 15 * value
          visCtx.fill()
          visCtx.shadowBlur = 0
        }
      }
    } catch (e) {
      console.error("🎵 Error drawing bars:", e)
    }
  }

  // Enhanced wave visualizer
  function drawEnhancedWave() {
    try {
      if (!audioInitialized) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height

      // Get audio data
      analyser.getByteFrequencyData(dataArr)
      analyser.getByteTimeDomainData(timeData)

      // Draw time domain data (waveform)
      visCtx.beginPath()
      visCtx.lineWidth = 3

      // Calculate average frequency for color intensity
      let sum = 0
      for (let i = 0; i < dataArr.length; i++) {
        sum += dataArr[i]
      }
      const avgFreq = sum / dataArr.length / 255

      // Create gradient for the line
      const gradient = visCtx.createLinearGradient(0, 0, w, 0)
      gradient.addColorStop(0, `hsla(${(Date.now() * 0.05) % 360}, 100%, 50%, 0.8)`)
      gradient.addColorStop(0.5, `hsla(${(Date.now() * 0.05 + 120) % 360}, 100%, 50%, 0.8)`)
      gradient.addColorStop(1, `hsla(${(Date.now() * 0.05 + 240) % 360}, 100%, 50%, 0.8)`)

      visCtx.strokeStyle = gradient

      // Draw main waveform
      for (let i = 0; i < timeData.length; i++) {
        const x = (i / timeData.length) * w
        // Normalize and scale the waveform
        const y = (timeData[i] / 128.0 - 1) * h * 0.4 + h * 0.5

        if (i === 0) {
          visCtx.moveTo(x, y)
        } else {
          visCtx.lineTo(x, y)
        }
      }

      // Add glow effect based on audio intensity
      visCtx.shadowColor = `hsla(${(Date.now() * 0.05) % 360}, 100%, 50%, 0.8)`
      visCtx.shadowBlur = 10 + avgFreq * 20
      visCtx.stroke()
      visCtx.shadowBlur = 0

      // Draw mirrored waveform with different color
      visCtx.beginPath()
      for (let i = 0; i < timeData.length; i++) {
        const x = (i / timeData.length) * w
        // Mirrored and scaled
        const normalizedValue = timeData[i] / 128.0 - 1
        const y = -normalizedValue * h * 0.4 + h * 0.5

        if (i === 0) {
          visCtx.moveTo(x, y)
        } else {
          visCtx.lineTo(x, y)
        }
      }

      // Different gradient for mirrored waveform
      const gradient2 = visCtx.createLinearGradient(0, 0, w, 0)
      gradient2.addColorStop(0, `hsla(${(Date.now() * 0.05 + 180) % 360}, 100%, 50%, 0.6)`)
      gradient2.addColorStop(0.5, `hsla(${(Date.now() * 0.05 + 300) % 360}, 100%, 50%, 0.6)`)
      gradient2.addColorStop(1, `hsla(${(Date.now() * 0.05 + 60) % 360}, 100%, 50%, 0.6)`)

      visCtx.strokeStyle = gradient2
      visCtx.shadowColor = `hsla(${(Date.now() * 0.05 + 180) % 360}, 100%, 50%, 0.6)`
      visCtx.shadowBlur = 5 + avgFreq * 15
      visCtx.stroke()
      visCtx.shadowBlur = 0
    } catch (e) {
      console.error("🎵 Error drawing wave:", e)
    }
  }

  // Enhanced radial visualizer
  function drawEnhancedRadial() {
    try {
      if (!audioInitialized) return

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height
      const cx = w / 2
      const cy = h / 2

      // Get audio data
      analyser.getByteFrequencyData(dataArr)

      // Calculate base radius and rotation
      const baseRadius = Math.min(w, h) / 4
      const rotation = Date.now() * 0.001

      // Calculate average frequency for effects
      let sum = 0
      for (let i = 0; i < dataArr.length; i++) {
        sum += dataArr[i]
      }
      const avgFreq = sum / dataArr.length / 255

      // Draw multiple layers of radial visualization
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = (layer * Math.PI) / 4
        const layerRadius = baseRadius * (0.7 + layer * 0.3)
        const layerOpacity = 1 - layer * 0.2

        // Draw frequency bins in a circle
        for (let i = 0; i < dataArr.length; i += 2) {
          const angle = (i / dataArr.length) * Math.PI * 2 + rotation + layerOffset
          const value = dataArr[i] / 255
          const amp = value * layerRadius

          // Calculate positions
          const innerX = cx + Math.cos(angle) * layerRadius
          const innerY = cy + Math.sin(angle) * layerRadius
          const outerX = cx + Math.cos(angle) * (layerRadius + amp)
          const outerY = cy + Math.sin(angle) * (layerRadius + amp)

          // Calculate color
          const hue = ((angle * 180) / Math.PI + Date.now() * 0.05) % 360

          // Draw line from inner to outer point
          visCtx.beginPath()
          visCtx.moveTo(innerX, innerY)
          visCtx.lineTo(outerX, outerY)
          visCtx.lineWidth = 2 + value * 3
          visCtx.strokeStyle = `hsla(${hue}, 100%, 50%, ${layerOpacity})`

          // Add glow effect based on amplitude
          if (value > 0.5) {
            visCtx.shadowColor = `hsla(${hue}, 100%, 50%, ${layerOpacity})`
            visCtx.shadowBlur = 10 * value
            visCtx.stroke()
            visCtx.shadowBlur = 0
          } else {
            visCtx.stroke()
          }

          // Draw point at the end
          visCtx.beginPath()
          visCtx.arc(outerX, outerY, 2 + value * 5, 0, Math.PI * 2)
          visCtx.fillStyle = `hsla(${hue}, 100%, 70%, ${layerOpacity})`
          visCtx.fill()
        }
      }

      // Draw connecting lines between points for high amplitudes
      visCtx.beginPath()
      let firstPoint = null

      for (let i = 0; i < dataArr.length; i += 4) {
        const angle = (i / dataArr.length) * Math.PI * 2 + rotation
        const value = dataArr[i] / 255

        if (value > 0.5) {
          const radius = baseRadius + value * baseRadius
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius

          if (!firstPoint) {
            firstPoint = { x, y }
            visCtx.moveTo(x, y)
          } else {
            visCtx.lineTo(x, y)
          }
        }
      }

      // Close the path if we have points
      if (firstPoint) {
        visCtx.lineTo(firstPoint.x, firstPoint.y)

        // Create gradient for the connecting lines
        const gradient = visCtx.createLinearGradient(cx - baseRadius, cy - baseRadius, cx + baseRadius, cy + baseRadius)
        gradient.addColorStop(0, `hsla(${(Date.now() * 0.02) % 360}, 100%, 50%, 0.3)`)
        gradient.addColorStop(0.5, `hsla(${(Date.now() * 0.02 + 120) % 360}, 100%, 50%, 0.3)`)
        gradient.addColorStop(1, `hsla(${(Date.now() * 0.02 + 240) % 360}, 100%, 50%, 0.3)`)

        visCtx.strokeStyle = gradient
        visCtx.lineWidth = 2
        visCtx.stroke()

        // Fill with semi-transparent gradient
        visCtx.fillStyle = `rgba(0, 0, 0, 0.2)`
        visCtx.fill()
      }

      // Draw pulsing center circle
      visCtx.beginPath()
      const pulseSize = baseRadius * 0.2 * (0.8 + avgFreq * 0.5)
      visCtx.arc(cx, cy, pulseSize, 0, Math.PI * 2)

      // Create radial gradient for center
      const centerGradient = visCtx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize)
      const centerHue = (Date.now() * 0.05) % 360
      centerGradient.addColorStop(0, `hsla(${centerHue}, 100%, 70%, 0.8)`)
      centerGradient.addColorStop(0.7, `hsla(${centerHue}, 100%, 50%, 0.5)`)
      centerGradient.addColorStop(1, `hsla(${centerHue}, 100%, 50%, 0)`)

      visCtx.fillStyle = centerGradient
      visCtx.fill()
    } catch (e) {
      console.error("🎵 Error drawing radial:", e)
    }
  }

  // Main visualization loop
  function draw(timestamp) {
    try {
      requestAnimationFrame(draw)

      // Calculate delta time for smooth animations
      const deltaTime = timestamp - lastTime
      lastTime = timestamp

      // If audio context isn't initialized yet, just draw a placeholder
      if (!audioInitialized) {
        drawPlaceholder()
        drawBackgroundEffect(0)
        return
      }

      // Get audio data
      analyser.getByteFrequencyData(dataArr)
      analyser.getByteTimeDomainData(timeData)

      // Calculate levels for different frequency ranges
      let bassSum = 0,
        midSum = 0,
        highSum = 0
      const bassRange = 10,
        midRange = 100,
        highRange = 300

      for (let i = 0; i < bassRange; i++) {
        bassSum += dataArr[i]
      }
      for (let i = bassRange; i < midRange; i++) {
        midSum += dataArr[i]
      }
      for (let i = midRange; i < highRange; i++) {
        highSum += dataArr[i]
      }

      const bassLevel = bassSum / (bassRange * 255)
      const midLevel = midSum / ((midRange - bassRange) * 255)
      const highLevel = highSum / ((highRange - midRange) * 255)

      // If 3D mode is active, update 3D visualization and skip 2D
      if (is3DActive) {
        update3D()
        return
      }

      const w = visCtx.canvas.width
      const h = visCtx.canvas.height

      // Clear canvas
      visCtx.clearRect(0, 0, w, h)

      // Draw background effects
      drawBackgroundEffect(bassLevel)

      // Draw selected visualization mode
      if (mode === "bars") {
        drawEnhancedBars()
      } else if (mode === "wave") {
        drawEnhancedWave()
      } else if (mode === "radial") {
        drawEnhancedRadial()
      } else if (mode === "spiral") {
        drawSpiral()
      } else if (mode === "particles") {
        if (particles.length === 0) initParticles()
        updateParticles(bassLevel)
      } else if (mode === "kaleidoscope") {
        drawKaleidoscope()
      }
    } catch (e) {
      console.error("🎵 Error in draw loop:", e)
    }
  }

  // Start the visualization
  draw()

  // Initial load
  loadTrack(0)

  console.log("🎵 SonicWave Music Player initialization complete")
})
