"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import styled, { keyframes } from "styled-components"

// Animation keyframes
const scanlineAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
`

const flickerAnimation = keyframes`
  0% {
    opacity: 0.97;
  }
  5% {
    opacity: 0.9;
  }
  10% {
    opacity: 0.97;
  }
  15% {
    opacity: 0.92;
  }
  20% {
    opacity: 0.97;
  }
  50% {
    opacity: 0.96;
  }
  80% {
    opacity: 0.97;
  }
  85% {
    opacity: 0.9;
  }
  90% {
    opacity: 0.97;
  }
  100% {
    opacity: 0.94;
  }
`

const chromaticAberrationAnimation = keyframes`
  0% {
    text-shadow: -1px 0 2px rgba(255,0,0,0.7), 1px 0 2px rgba(0,255,255,0.7);
  }
  50% {
    text-shadow: -1.5px 0 2px rgba(255,0,0,0.7), 1.5px 0 2px rgba(0,255,255,0.7);
  }
  100% {
    text-shadow: -1px 0 2px rgba(255,0,0,0.7), 1px 0 2px rgba(0,255,255,0.7);
  }
`

// Styled components
const CRTContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9990;
`

const Scanlines = styled.div<{ intensity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, ${(props) => props.intensity * 0.3}) 50%
  );
  background-size: 100% 4px;
  animation: ${scanlineAnimation} 6s linear infinite;
  opacity: ${(props) => props.intensity};
  pointer-events: none;
  z-index: 9991;
`

const CRTFlicker = styled.div<{ intensity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: ${flickerAnimation} 0.3s infinite;
  opacity: ${(props) => props.intensity};
  pointer-events: none;
  z-index: 9992;
  mix-blend-mode: overlay;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 40, 80, 0.2) 0%,
    rgba(0, 0, 0, 0.2) 90%
  );
`

const VignetteEffect = styled.div<{ intensity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 65%,
    rgba(0, 0, 0, ${(props) => props.intensity * 0.8}) 100%
  );
  pointer-events: none;
  z-index: 9993;
`

const ChromaticAberration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9994;
  mix-blend-mode: screen;
`

interface CRTEffectProps {
  intensity?: number
  enableScanlines?: boolean
  enableFlicker?: boolean
  enableVignette?: boolean
  enableChromaticAberration?: boolean
}

const EnhancedCRTEffect: React.FC<CRTEffectProps> = ({
  intensity = 0.5,
  enableScanlines = true,
  enableFlicker = true,
  enableVignette = true,
  enableChromaticAberration = true,
}) => {
  const [effectIntensity, setEffectIntensity] = useState(intensity)
  const chromaticRef = useRef<HTMLDivElement>(null)

  // Apply chromatic aberration to text elements
  useEffect(() => {
    if (!enableChromaticAberration) return

    const applyChromatic = () => {
      document.querySelectorAll("h1, h2, h3, .window-header span").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.animation = `${chromaticAberrationAnimation} 3s ease-in-out infinite`
          el.style.position = "relative"
        }
      })
    }

    applyChromatic()

    // Reapply when new elements are added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          applyChromatic()
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.querySelectorAll("h1, h2, h3, .window-header span").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.animation = ""
          el.style.position = ""
        }
      })
    }
  }, [enableChromaticAberration])

  // Add event listener for theme changes
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const theme = e.detail?.theme
      if (theme === "neon") {
        setEffectIntensity(0.7)
      } else if (theme === "retro") {
        setEffectIntensity(0.5)
      } else if (theme === "minimal") {
        setEffectIntensity(0.2)
      }
    }

    window.addEventListener("change-theme", handleThemeChange as EventListener)

    return () => {
      window.removeEventListener("change-theme", handleThemeChange as EventListener)
    }
  }, [])

  // Add keyboard shortcut to toggle effect intensity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+C to cycle through CRT effect intensities
      if (e.altKey && e.key === "c") {
        setEffectIntensity((prev) => {
          const newIntensity = (prev + 0.25) % 1.25
          return newIntensity < 0.1 ? 0.1 : newIntensity
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <CRTContainer>
      {enableScanlines && <Scanlines intensity={effectIntensity} />}
      {enableFlicker && <CRTFlicker intensity={effectIntensity} />}
      {enableVignette && <VignetteEffect intensity={effectIntensity} />}
      {enableChromaticAberration && <ChromaticAberration ref={chromaticRef} />}
    </CRTContainer>
  )
}

export default EnhancedCRTEffect
