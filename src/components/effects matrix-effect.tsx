"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import styled from "styled-components"

const CanvasContainer = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  pointer-events: none;
`

const MatrixEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    // Matrix characters
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789"
    const charArray = chars.split("")

    // Column setup
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Drops - one per column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor((Math.random() * -canvas.height) / fontSize)
    }

    // Drawing function
    const draw = () => {
      if (!activeRef.current) return
      if (!ctx) return

      // Semi-transparent black background to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set text color and font
      ctx.fillStyle = "#0f0"
      ctx.font = `${fontSize}px monospace`

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)]

        // x coordinate of the drop
        const x = i * fontSize

        // y coordinate of the drop
        const y = drops[i] * fontSize

        // Draw the character
        ctx.fillText(char, x, y)

        // Randomly reset some drops to the top
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Move drop down
        drops[i]++
      }
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      draw()
      animationId = requestAnimationFrame(animate)
    }

    // Event listener for triggering the effect
    const handleTriggerEffect = () => {
      if (!activeRef.current) {
        activeRef.current = true
        canvas.style.opacity = "1"
        animate()

        // Auto-disable after 10 seconds
        setTimeout(() => {
          fadeOut()
        }, 10000)
      }
    }

    // Fade out function
    const fadeOut = () => {
      let opacity = 1
      const fadeInterval = setInterval(() => {
        if (opacity <= 0) {
          clearInterval(fadeInterval)
          activeRef.current = false
          cancelAnimationFrame(animationId)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        } else {
          opacity -= 0.05
          canvas.style.opacity = opacity.toString()
        }
      }, 50)
    }

    // Set initial state
    canvas.style.opacity = "0"

    // Add event listener
    window.addEventListener("trigger-matrix-effect", handleTriggerEffect)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("trigger-matrix-effect", handleTriggerEffect)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <CanvasContainer ref={canvasRef} />
}

export default MatrixEffect
