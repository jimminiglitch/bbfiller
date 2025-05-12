// ULTRA TRIPPY BOOT SEQUENCE - Psychedelic Cyberpunk Edition 2.0
document.addEventListener("DOMContentLoaded", function() {
  console.log("🌀 Initiating enhanced psychedelic boot sequence");
  
  // ——— CORE ELEMENTS ———
  const bootScreen = document.getElementById("bootScreen");
  const bootLog = document.getElementById("boot-log");
  const progressBar = document.getElementById("progress-bar");
  const container = document.querySelector(".container");
  
  // Hide desktop initially
  container.style.display = "none";
  
  // ——— CONFIGURATION ———
  const CONFIG = {
    typing: {
      charDelay: 8,       // Typing speed (ms per character)
      lineDelay: 150,     // Delay between lines (ms)
      bootCompleteDelay: 800 // Final delay before transition (ms)
    },
    effects: {
      minDelay: 80,       // Min delay between effects (ms)
      maxDelay: 300,      // Max delay between effects (ms)
      glitchProbability: 0.15, // Chance of glitch during typing
      effectDuration: {   // Duration of various effects (ms)
        rgbSplit: 150,
        glitchBlocks: 200,
        waveDistortion: 500
      }
    },
    particles: {
      count: 120,         // Increased particle count
      speedMultiplier: 1.2 // Faster particle movement
    },
    audio: {
      mainVolume: 0.3,    // Main glitch sound volume
      ambientVolume: 0.12, // Slightly increased ambient volume
      effectsVolume: 0.25 // Random effect sounds volume
    }
  };
  
  // ——— ENHANCED AUDIO SYSTEM ———
  const AudioSystem = {
    // Main glitch sound
    glitchSfx: new Audio('https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/boot.mp3?v=1746845093718'),
    
    // Additional sound effects
    glitchSounds: [
      { audio: new Audio('https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/retro-blip-2-236668.mp3?v=1746891741011'), volume: CONFIG.audio.effectsVolume * 0.8 },
      { audio: new Audio('https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/big-robot-footstep-330678.mp3?v=1746884720082'), volume: CONFIG.audio.effectsVolume * 0.6 },
      { audio: new Audio('https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/typing-42562.mp3?v=1746884408348'), volume: CONFIG.audio.effectsVolume }
    ],
    
    // Low frequency drone for ambience
    droneSfx: new Audio('https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/psychtoad.mp3?v=1746846223194'),
    
    init() {
      // Set up main glitch sound
      this.glitchSfx.volume = CONFIG.audio.mainVolume;
      
      // Set up ambient drone
      this.droneSfx.volume = CONFIG.audio.ambientVolume;
      this.droneSfx.loop = true;
      
      // Start ambient drone
      this.playSound(this.droneSfx);
    },
    
    // Play a random glitch sound
    playRandomGlitch() {
      if (Math.random() < 0.4) { // Increased probability
        const soundIndex = Math.floor(Math.random() * this.glitchSounds.length);
        const sound = this.glitchSounds[soundIndex];
        
        try {
          sound.audio.currentTime = 0;
          this.playSound(sound.audio);
        } catch (e) {
          console.log("Audio error:", e);
        }
      }
    },
    
    // Safely play a sound with error handling
    playSound(audio) {
      try {
        audio.play().catch(e => console.log("Audio play prevented by browser"));
      } catch (e) {
        console.log("Audio error:", e);
      }
    },
    
    // Fade out ambient sound
    fadeOutAmbient() {
      if (!this.droneSfx) return;
      
      const fadeInterval = setInterval(() => {
        if (this.droneSfx.volume > 0.01) {
          this.droneSfx.volume -= 0.01;
        } else {
          this.droneSfx.pause();
          clearInterval(fadeInterval);
        }
      }, 100);
    }
  };
  
  // ——— PARTICLE SYSTEM ———
  const ParticleSystem = {
    particles: [],
    canvas: null,
    ctx: null,
    
    init() {
      // Create canvas for particle effects
      this.canvas = document.createElement("canvas");
      this.canvas.classList.add("particle-canvas");
      this.canvas.style.position = "absolute";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "9998";
      bootScreen.appendChild(this.canvas);
      
      // Get context and resize
      this.ctx = this.canvas.getContext("2d");
      this.resizeCanvas();
      
      // Add resize listener
      window.addEventListener("resize", () => this.resizeCanvas());
      
      // Create initial particles
      this.createParticles(CONFIG.particles.count);
      
      // Start animation
      this.animate();
    },
    
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    
    // Create particles
    createParticles(count) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 3 * CONFIG.particles.speedMultiplier,
          speedY: (Math.random() - 0.5) * 3 * CONFIG.particles.speedMultiplier,
          color: `hsl(${Math.random() * 60 + 160}, 100%, ${50 + Math.random() * 20}%)`, // Brighter colors
          alpha: Math.random() * 0.7 + 0.3,
          // Add pulse effect to some particles
          pulse: Math.random() > 0.7,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseAmount: 0,
          // Add trail effect to some particles
          trail: Math.random() > 0.8,
          trailLength: Math.floor(Math.random() * 3) + 2
        });
      }
    },
    
    // Animate particles
    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around edges
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;
        
        // Update pulse if applicable
        if (p.pulse) {
          p.pulseAmount += p.pulseSpeed;
          if (p.pulseAmount > 1 || p.pulseAmount < 0) {
            p.pulseSpeed *= -1;
          }
        }
        
        // Calculate current size with pulse
        const currentSize = p.pulse ? 
          p.size * (1 + Math.sin(p.pulseAmount * Math.PI) * 0.5) : 
          p.size;
        
        // Draw trail if applicable
        if (p.trail) {
          for (let t = 1; t <= p.trailLength; t++) {
            const trailAlpha = p.alpha * (1 - t / (p.trailLength + 1));
            const trailSize = currentSize * (1 - t / (p.trailLength + 2));
            
            this.ctx.globalAlpha = trailAlpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(
              p.x - p.speedX * t * 1.5, 
              p.y - p.speedY * t * 1.5, 
              trailSize, 
              0, 
              Math.PI * 2
            );
            this.ctx.fill();
          }
        }
        
        // Draw particle
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      requestAnimationFrame(() => this.animate());
    }
  };
  
  // ——— VISUAL EFFECTS SYSTEM ———
  const VisualEffects = {
    // Screen jitter effect
    jitterScreen() {
      // More extreme jitter
      const x = (Math.random() - 0.5) * 12;  // ±6px
      const y = (Math.random() - 0.5) * 12;
      
      // Apply to boot log for chaotic effect
      bootLog.style.transform = `translate(${x * 0.7}px, ${y * 0.7}px)`;
      
      // Random color shift
      if (Math.random() < 0.3) {
        const hueShift = Math.floor(Math.random() * 40) - 20;
        bootLog.style.filter = `hue-rotate(${hueShift}deg)`;
        setTimeout(() => bootLog.style.filter = '', 120);
      }
      
      // Random scale jitter
      if (Math.random() < 0.2) {
        const scale = 1 + (Math.random() * 0.1 - 0.05);
        bootLog.style.transform += ` scale(${scale})`;
      }
      
      // Reset after short delay
      setTimeout(() => {
        bootLog.style.transform = '';
      }, 100);
    },
    
    // RGB split effect
    rgbSplitEffect() {
      bootLog.classList.add('extreme-rgb-split');
      setTimeout(() => bootLog.classList.remove('extreme-rgb-split'), CONFIG.effects.effectDuration.rgbSplit);
    },
    
    // Glitch blocks effect
    glitchBlocksEffect() {
      bootLog.classList.add('glitch-blocks');
      setTimeout(() => bootLog.classList.remove('glitch-blocks'), CONFIG.effects.effectDuration.glitchBlocks);
    },
    
    // Wave distortion effect
    waveDistortionEffect() {
      bootLog.classList.add('wave-distortion');
      setTimeout(() => bootLog.classList.remove('wave-distortion'), CONFIG.effects.effectDuration.waveDistortion);
    },
    
    // Apply a random visual effect
    applyRandomEffect() {
      const effectRoll = Math.random();
      
      if (effectRoll < 0.3) {
        this.rgbSplitEffect();
      } else if (effectRoll < 0.6) {
        this.glitchBlocksEffect();
      } else if (effectRoll < 0.8) {
        this.waveDistortionEffect();
      } else {
        // Combine multiple effects for extra trippy moments
        this.rgbSplitEffect();
        setTimeout(() => this.glitchBlocksEffect(), 100);
      }
      
      // Always jitter for tactile feedback
      this.jitterScreen();
    },
    
    // Enhanced progress bar with more visual effects
    updateProgressBar(percentage) {
      progressBar.style.width = percentage + "%";
      
      // Enhanced glow effect as progress increases
      const glowIntensity = Math.min(15, percentage / 7);
      const glowColor = `rgba(0, ${200 + Math.sin(percentage/10) * 55}, ${255 - Math.cos(percentage/15) * 55}, 0.8)`;
      progressBar.style.boxShadow = `0 0 ${glowIntensity}px ${glowColor}`;
      
      // Occasionally add color shift to progress bar
      if (Math.random() < 0.1) {
        const hue = 180 + Math.sin(percentage/10) * 30; // Cycle around cyan
        progressBar.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        setTimeout(() => {
          progressBar.style.backgroundColor = "#00ffff";
        }, 300);
      }
      
      // Add glitch to progress bar occasionally
      if (Math.random() < 0.05) {
        progressBar.classList.add("progress-glitch");
        setTimeout(() => {
          progressBar.classList.remove("progress-glitch");
        }, 200);
      }
    }
  };
  
  // ——— PROFILE IMAGE SYSTEM ———
  const ProfileSystem = {
    profileContainer: null,
    profileImage: null,
    glowEffect: null,
    
    init() {
      // Create container
      this.profileContainer = document.createElement("div");
      this.profileContainer.style.textAlign = "center";
      this.profileContainer.style.marginBottom = "20px";
      this.profileContainer.style.position = "relative";
      
      // Create profile image
      this.profileImage = document.createElement("img");
      this.profileImage.src = "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/Benny.png?v=1746392528967";
      this.profileImage.style.width = "150px";
      this.profileImage.style.height = "150px";
      this.profileImage.style.borderRadius = "50%";
      this.profileImage.style.border = "3px solid #00ffff";
      this.profileImage.style.boxShadow = "0 0 15px rgba(0, 255, 255, 0.7)";
      this.profileImage.style.opacity = "0";
      this.profileImage.style.transition = "opacity 1s ease";
      this.profileImage.style.zIndex = "2";
      this.profileImage.classList.add("profile-image");
      
      // Add glow effect container behind the image
      this.glowEffect = document.createElement("div");
      this.glowEffect.classList.add("image-glow-effect");
      this.glowEffect.style.position = "absolute";
      this.glowEffect.style.top = "0";
      this.glowEffect.style.left = "50%";
      this.glowEffect.style.transform = "translateX(-50%)";
      this.glowEffect.style.width = "150px";
      this.glowEffect.style.height = "150px";
      this.glowEffect.style.borderRadius = "50%";
      this.glowEffect.style.zIndex = "1";
      
      // Add image and glow to container
      this.profileContainer.appendChild(this.glowEffect);
      this.profileContainer.appendChild(this.profileImage);
      
      // Add image to boot screen BEFORE the boot log
      bootLog.parentNode.insertBefore(this.profileContainer, bootLog);
      
      // Show profile image after a short delay with glitch effect
      setTimeout(() => {
        this.profileImage.style.opacity = "1";
        
        // Start pulsing glow effect
        this.glowEffect.classList.add('pulsing-glow');
        
        // Add periodic glitch to the image
        this.startGlitchInterval();
      }, 800);
    },
    
    startGlitchInterval() {
      setInterval(() => {
        if (Math.random() < 0.3 && bootScreen.style.display !== "none") {
          this.profileImage.classList.add('glitch-img');
          setTimeout(() => this.profileImage.classList.remove('glitch-img'), 200);
        }
      }, 2000);
    }
  };
  
  // ——— BOOT SEQUENCE SYSTEM ———
  const BootSequence = {
    // Trippy boot messages
    bootMessages: [
      "Initializing neural interface...",
      "Bypassing reality filters...",
      "Injecting perception modifiers...",
      "Recalibrating sensory inputs...",
      "Dissolving cognitive boundaries...",
      "Fragmenting linear time constructs...",
      "Synthesizing quantum consciousness...",
      "Activating psychedelic protocols...",
      "Transcending dimensional limits...",
      "REALITY OVERRIDE COMPLETE"
    ],
    
    currentLine: 0,
    currentChar: 0,
    bootInterval: null,
    
    start() {
      this.bootInterval = setInterval(() => this.typeBootMessage(), CONFIG.typing.charDelay);
      VisualEffects.updateProgressBar(0);
    },
    
    typeBootMessage() {
      if (this.currentLine < this.bootMessages.length) {
        const message = this.bootMessages[this.currentLine];
        
        if (this.currentChar < message.length) {
          // Type one more character
          bootLog.innerHTML += message.charAt(this.currentChar);
          
          // Apply random effects with higher probability for more intensity
          if (Math.random() < CONFIG.effects.glitchProbability) {
            VisualEffects.applyRandomEffect();
            AudioSystem.playRandomGlitch();
          }
          
          // Advance char index and progress bar
          this.currentChar++;
          VisualEffects.updateProgressBar(
            (this.currentLine / this.bootMessages.length) * 70 +
            (this.currentChar / message.length) * (30 / this.bootMessages.length)
          );
        } else {
          bootLog.innerHTML += "<br>";
          this.currentLine++;
          this.currentChar = 0;
          clearInterval(this.bootInterval);
          
          // Special handling for the last message
          if (this.currentLine === this.bootMessages.length - 1) {
            this.handleFinalMessage();
          } else if (this.currentLine < this.bootMessages.length) {
            // Apply effect between lines
            VisualEffects.applyRandomEffect();
            AudioSystem.playRandomGlitch();
            
            setTimeout(() => {
              this.bootInterval = setInterval(() => this.typeBootMessage(), CONFIG.typing.charDelay);
            }, CONFIG.typing.lineDelay);
          }
        }
      }
    },
    
    handleFinalMessage() {
      // Major glitch effect before final message
      setTimeout(() => {
        VisualEffects.applyRandomEffect();
        AudioSystem.playRandomGlitch();
        
        setTimeout(() => {
          // Final message with intense styling
          bootLog.innerHTML += `<span class="final-message">${this.bootMessages[this.currentLine]}</span>`;
          
          // Trigger multiple effects in sequence
          VisualEffects.rgbSplitEffect();
          setTimeout(() => VisualEffects.glitchBlocksEffect(), 200);
          setTimeout(() => VisualEffects.waveDistortionEffect(), 400);
          
          // Shake the screen violently
          VisualEffects.jitterScreen();
          setTimeout(() => VisualEffects.jitterScreen(), 100);
          setTimeout(() => VisualEffects.jitterScreen(), 200);
          
          // Play multiple glitch sounds
          AudioSystem.playSound(AudioSystem.glitchSfx);
          setTimeout(() => AudioSystem.playRandomGlitch(), 100);
          setTimeout(() => AudioSystem.playRandomGlitch(), 300);
          
          // Complete the boot sequence
          VisualEffects.updateProgressBar(100);
          setTimeout(() => this.completeBootSequence(), CONFIG.typing.bootCompleteDelay);
        }, 300);
      }, CONFIG.typing.lineDelay * 2);
    },
    
    // Final boot sequence with enhanced transition effects
    completeBootSequence() {
      // Create a flash effect
      const flashOverlay = document.createElement("div");
      flashOverlay.style.position = "fixed";
      flashOverlay.style.top = "0";
      flashOverlay.style.left = "0";
      flashOverlay.style.width = "100%";
      flashOverlay.style.height = "100%";
      flashOverlay.style.backgroundColor = "#00ffff";
      flashOverlay.style.opacity = "0";
      flashOverlay.style.zIndex = "10000";
      flashOverlay.style.transition = "opacity 0.1s ease";
      document.body.appendChild(flashOverlay);
      
      // Flash effect
      flashOverlay.style.opacity = "0.7";
      setTimeout(() => {
        flashOverlay.style.opacity = "0";
        
        // Major glitch effect
        VisualEffects.applyRandomEffect();
        VisualEffects.applyRandomEffect();
        
        // Fade out boot screen with glitch transition
        bootScreen.classList.add("glitch-transition-out");
        bootScreen.style.transition = "opacity 0.5s ease";
        bootScreen.style.opacity = "0";
        
        // Play transition sounds
        AudioSystem.playSound(AudioSystem.glitchSfx);
        setTimeout(() => AudioSystem.playRandomGlitch(), 100);
        
        setTimeout(() => {
          bootScreen.style.display = "none";
          container.style.display = "block";
          
          // Fade out ambient sound
          AudioSystem.fadeOutAmbient();
          
          // Remove flash overlay
          document.body.removeChild(flashOverlay);
          
          // Initialize desktop components
          let initDesktop = window.initDesktop || function(){ console.log("initDesktop function not defined.")};
          if (typeof initDesktop === 'function') {
            initDesktop();
          }
        }, 500);
      }, 150);
      
      console.log("🌀 Psychedelic boot sequence complete");
    }
  };
  
  // ——— INITIALIZE ALL SYSTEMS ———
  function init() {
    // Initialize audio system
    AudioSystem.init();
    
    // Initialize particle system
    ParticleSystem.init();
    
    // Initialize profile system
    ProfileSystem.init();
    
    // Start boot sequence
    BootSequence.start();
  }
  
  // Start everything
  init();
});

// Log that the script has been loaded
console.log("Psychedelic Boot Sequence script loaded and ready");