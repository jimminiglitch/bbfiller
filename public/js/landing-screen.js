document.addEventListener("DOMContentLoaded", () => {
  // Check if we've already seen the landing screen in this session
  const hasSeenLanding = sessionStorage.getItem("hasSeenLanding")

  // If we've already seen it, skip to the main content
  if (hasSeenLanding) {
    document.getElementById("landing-screen").style.display = "none"
    document.getElementById("main-content").style.display = "block"
    return
  }

  // Set up the landing screen
  const landingScreen = document.getElementById("landing-screen")
  const mainContent = document.getElementById("main-content")

  // Add random glitch effect
  setInterval(() => {
    if (Math.random() > 0.9) {
      landingScreen.classList.add("glitching")

      // Try to play a glitch sound
      try {
        const soundIndex = Math.floor(Math.random() * 3) + 1
        const audio = new Audio(`/sounds/glitch${soundIndex}.mp3`)
        audio.volume = 0.2
        audio.play().catch((e) => {
          console.log("Audio play prevented by browser")
        })
      } catch (e) {
        console.log("Audio error:", e)
      }

      setTimeout(() => {
        landingScreen.classList.remove("glitching")
      }, 150)
    }
  }, 2000)

  // Handle click to enter
  landingScreen.addEventListener("click", () => {
    // Apply final glitch effect
    landingScreen.classList.add("glitching")

    // Try to play boot sound
    try {
      const bootSound = new Audio("/sounds/boot.mp3")
      bootSound.volume = 0.3
      bootSound.play().catch((e) => {
        console.log("Audio play prevented by browser")
      })
    } catch (e) {
      console.log("Audio error:", e)
    }

    // Animate out
    landingScreen.classList.add("fade-out")

    // Mark that we've seen the landing screen
    sessionStorage.setItem("hasSeenLanding", "true")

    // After animation, show main content
    setTimeout(() => {
      landingScreen.style.display = "none"
      document.getElementById("main-content").style.display = "block"
      loadMainContent()
    }, 1000)
  })

  function loadMainContent() {
    // Load the main index.html content
    fetch("/public/boot.html")
      .then((response) => response.text())
      .then((html) => {
        mainContent.innerHTML = html
        mainContent.style.display = "block"

        // Execute scripts in the loaded content
        const scripts = mainContent.querySelectorAll("script")
        scripts.forEach((script) => {
          const newScript = document.createElement("script")
          if (script.src) {
            newScript.src = script.src
          } else {
            newScript.textContent = script.textContent
          }
          document.body.appendChild(newScript)
        })
      })
      .catch((error) => {
        console.error("Error loading main content:", error)
        // Fallback - redirect to index.html
        window.location.href = "index.html"
      })
  }
})

// Add this class for the glitch effect
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    .landing-screen.glitching {
      animation: screen-glitch 0.15s steps(2) forwards;
    }
    
    .landing-screen.fade-out {
      animation: fade-out 1s forwards;
    }
    
    @keyframes screen-glitch {
      0% {
        transform: translate(0);
        filter: hue-rotate(0deg);
      }
      20% {
        transform: translate(-5px, 5px);
        filter: hue-rotate(90deg);
      }
      40% {
        transform: translate(-5px, -5px);
        filter: hue-rotate(180deg);
      }
      60% {
        transform: translate(5px, 5px);
        filter: hue-rotate(270deg);
      }
      80% {
        transform: translate(5px, -5px);
        filter: hue-rotate(360deg);
      }
      100% {
        transform: translate(0);
        filter: hue-rotate(0deg);
      }
    }
    
    @keyframes fade-out {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  </style>
`,
)
