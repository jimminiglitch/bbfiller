"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createGlobalStyle, keyframes } from "styled-components"

const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  20% { transform: translate(-2px, 2px) rotate(-1deg); }
  40% { transform: translate(-2px, -2px) rotate(1deg); }
  60% { transform: translate(2px, 2px) rotate(0deg); }
  80% { transform: translate(2px, -2px) rotate(1deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`

const glitchAnim1 = keyframes`
  0% { clip-path: inset(40% 0 61% 0); }
  20% { clip-path: inset(92% 0 1% 0); }
  40% { clip-path: inset(43% 0 1% 0); }
  60% { clip-path: inset(25% 0 58% 0); }
  80% { clip-path: inset(54% 0 7% 0); }
  100% { clip-path: inset(58% 0 43% 0); }
`

const glitchAnim2 = keyframes`
  0% { clip-path: inset(24% 0 29% 0); }
  20% { clip-path: inset(54% 0 56% 0); }
  40% { clip-path: inset(51% 0 8% 0); }
  60% { clip-path: inset(82% 0 0% 0); }
  80% { clip-path: inset(97% 0 11% 0); }
  100% { clip-path: inset(40% 0 53% 0); }
`

const GlitchStyles = createGlobalStyle<{ active: boolean }>`
  body {
    position: relative;
    overflow-x: hidden;
  }
  
  body::before,
  body::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/img/desktop-bg.jpg') no-repeat center center;
    background-size: cover;
    z-index: 9997;
    opacity: ${(props) => (props.active ? 0.8 : 0)};
    pointer-events: none;
    mix-blend-mode: hard-light;
    transition: opacity 0.3s;
  }
  
  body::before {
    left: 2px;
    background-color: rgba(255, 0, 255, 0.2);
    animation: ${(props) => (props.active ? `${glitchAnim1} 0.2s infinite linear alternate-reverse` : "none")};
  }
  
  body::after {
    left: -2px;
    background-color: rgba(0, 255, 255, 0.2);
    animation: ${(props) => (props.active ? `${glitchAnim2} 0.3s infinite linear alternate-reverse` : "none")};
  }
  
  .window-container {
    animation: ${(props) => (props.active ? `${shake} 0.1s infinite` : "none")};
  }
`

const GlitchEffect: React.FC = () => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const handleTriggerEffect = () => {
      setActive(true)

      // Auto-disable after 3 seconds
      setTimeout(() => {
        setActive(false)
      }, 3000)
    }

    window.addEventListener("trigger-glitch-effect", handleTriggerEffect)

    return () => {
      window.removeEventListener("trigger-glitch-effect", handleTriggerEffect)
    }
  }, [])

  return <GlitchStyles active={active} />
}

export default GlitchEffect
