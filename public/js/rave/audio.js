// 3D Rave City - Audio System

const RaveCity = window.RaveCity || {}

// Audio System
RaveCity.Audio = {
  // Audio state
  audioContext: null,
  audioSource: null,
  audioAnalyser: null,
  audioData: null,
  frequencyData: null,
  audioElement: null,
  isPlaying: false,
  audioLoaded: false,
  trackQueue: [],

  // DOM elements
  elements: {},

  // Initialize audio system
  init: function (elements) {
    try {
      console.log("Initializing audio system...")

      this.elements = elements

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create analyser
      this.audioAnalyser = this.audioContext.createAnalyser()
      this.audioAnalyser.fftSize = 2048

      // Load audio track
      this.loadAudioTrack(RaveCity.Config.audioTrack)

      // Set initial volume
      this.setVolume(RaveCity.Config.volume)

      console.log("Audio system initialized successfully")
      return this
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      RaveCity.UI.showError(`Failed to initialize audio: ${error.message}`)
      return null
    }
  },

  // Load audio track
  loadAudioTrack: function (trackName) {
    if (!RaveCity.Config.audioTracks[trackName]) {
      console.error(`Audio track "${trackName}" not found.`)
      RaveCity.UI.showError(`Audio track "${trackName}" not found.`)
      return
    }

    const track = RaveCity.Config.audioTracks[trackName]
    this.elements.trackInfo.textContent = `Loading: ${track.title}`
    this.elements.audioStatus.textContent = "Loading audio..."
    this.elements.audioStatus.style.display = "block"

    fetch(track.url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => this.audioContext.decodeAudioData(buffer))
      .then((audioBuffer) => {
        if (this.audioSource) {
          this.audioSource.stop()
          this.audioSource.disconnect(this.audioAnalyser)
        }

        this.audioSource = this.audioContext.createBufferSource()
        this.audioSource.buffer = audioBuffer
        this.audioSource.loop = true
        this.audioSource.connect(this.audioAnalyser)
        this.audioAnalyser.connect(this.audioContext.destination)

        this.audioSource.onended = () => {
          console.log("Track ended, playing next track")
          this.playNextTrack()
        }

        this.audioElement = track
        this.audioLoaded = true
        this.elements.trackInfo.textContent = `Now Playing: ${track.title}`
        this.elements.audioStatus.textContent = "Audio loaded, ready to play"
        this.elements.trackInfo.style.display = "block"

        if (this.isPlaying) {
          this.audioSource.start(0)
          this.elements.audioStatus.textContent = "Playing"
        } else {
          this.elements.audioStatus.style.display = "none"
        }
      })
      .catch((error) => {
        console.error("Failed to load audio track:", error)
        RaveCity.UI.showError(`Failed to load audio track: ${error.message}`)
        this.elements.audioStatus.textContent = "Error loading audio"
      })
  },

  // Play audio
  playAudio: function () {
    if (!this.audioLoaded) {
      console.warn("Audio not loaded yet.")
      this.elements.audioStatus.textContent = "Audio not loaded yet"
      this.elements.audioStatus.style.display = "block"
      return
    }

    if (this.isPlaying) {
      console.log("Audio is already playing.")
      return
    }

    this.audioContext.resume().then(() => {
      this.audioSource.start(0)
      this.isPlaying = true
      this.elements.audioStatus.textContent = "Playing"
      this.elements.audioStatus.style.display = "block"
      this.elements.audioVisualizer.style.display = "block"
      this.elements.audioButton.classList.add("active")

      // Hide status after a few seconds
      setTimeout(() => {
        this.elements.audioStatus.style.display = "none"
      }, 2000)
    })
  },

  // Pause audio
  pauseAudio: function () {
    if (!this.isPlaying) {
      console.log("Audio is already paused.")
      return
    }

    this.audioSource.stop()
    this.isPlaying = false
    this.elements.audioStatus.textContent = "Paused"
    this.elements.audioStatus.style.display = "block"
    this.elements.audioButton.classList.remove("active")

    // Re-create audio source to allow playing again
    this.loadAudioTrack(RaveCity.Config.audioTrack)

    // Hide visualizer
    this.elements.audioVisualizer.style.display = "none"
  },

  // Toggle audio
  toggleAudio: function () {
    if (this.isPlaying) {
      this.pauseAudio()
    } else {
      this.playAudio()
    }
  },

  // Set volume
  setVolume: function (volume) {
    if (!this.audioSource) return

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = volume
    this.audioSource.disconnect(this.audioContext.destination)
    this.audioSource.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
  },

  // Play next track
  playNextTrack: function () {
    if (RaveCity.Config.randomizeTracks) {
      const trackNames = Object.keys(RaveCity.Config.audioTracks)
      let nextTrack = trackNames[Math.floor(Math.random() * trackNames.length)]

      // Ensure we don't play the same track twice in a row
      if (nextTrack === RaveCity.Config.audioTrack && trackNames.length > 1) {
        const newTrackIndex = (trackNames.indexOf(nextTrack) + 1) % trackNames.length
        nextTrack = trackNames[newTrackIndex]
      }

      RaveCity.Config.audioTrack = nextTrack
      this.loadAudioTrack(nextTrack)
      if (this.isPlaying) {
        this.playAudio()
      }
    } else {
      // Play tracks in order
      const trackNames = Object.keys(RaveCity.Config.audioTracks)
      const currentTrackIndex = trackNames.indexOf(RaveCity.Config.audioTrack)
      const nextTrackIndex = (currentTrackIndex + 1) % trackNames.length
      RaveCity.Config.audioTrack = trackNames[nextTrackIndex]
      this.loadAudioTrack(trackNames[nextTrackIndex])
      if (this.isPlaying) {
        this.playAudio()
      }
    }
  },

  // Update audio visualizer
  updateVisualizer: function () {
    if (!this.audioAnalyser || !this.isPlaying) return

    // Get frequency data
    this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount)
    this.audioAnalyser.getByteFrequencyData(this.frequencyData)

    // Normalize frequency data
    const normalizedData = Array.from(this.frequencyData).map((value) => value / 256)

    // Clear visualizer
    const visualizerCtx = this.elements.audioVisualizer.getContext("2d")
    visualizerCtx.clearRect(0, 0, this.elements.audioVisualizer.width, this.elements.audioVisualizer.height)

    // Draw frequency bars
    const barWidth = this.elements.audioVisualizer.width / normalizedData.length
    let x = 0

    normalizedData.forEach((value, index) => {
      // Only draw a subset of the bars for better visualization
      if (index % 4 === 0) {
        const barHeight = value * this.elements.audioVisualizer.height

        // Create gradient for bars
        const gradient = visualizerCtx.createLinearGradient(
          0,
          this.elements.audioVisualizer.height - barHeight,
          0,
          this.elements.audioVisualizer.height,
        )
        gradient.addColorStop(0, "#ff00ff")
        gradient.addColorStop(0.5, "#00ffff")
        gradient.addColorStop(1, "#ffff00")

        visualizerCtx.fillStyle = gradient
        visualizerCtx.fillRect(x, this.elements.audioVisualizer.height - barHeight, barWidth * 3, barHeight)

        x += barWidth * 4
      }
    })

    // Adjust trippy level based on audio
    const averageFrequency = normalizedData.reduce((a, b) => a + b, 0) / normalizedData.length
    RaveCity.Config.trippyLevel = 0.5 + averageFrequency * 1.5

    // Return bass frequency for visual effects
    return {
      bassFrequency: normalizedData[1],
      averageFrequency: averageFrequency,
    }
  },
}
