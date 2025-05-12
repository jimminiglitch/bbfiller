"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Rnd } from "react-rnd"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"

// Types for our windows
interface Window {
  id: string
  title: string
  icon: string
  content: string
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

// Styled components for window elements
const WindowContainer = styled(motion.div)<{ isActive: boolean }>`
  background: rgba(20, 20, 30, 0.85);
  border: 2px solid ${(props) => (props.isActive ? "#00f0ff" : "#444")};
  border-radius: 6px;
  box-shadow: ${(props) =>
    props.isActive
      ? "0 0 15px rgba(0, 240, 255, 0.5), inset 0 0 8px rgba(0, 240, 255, 0.2)"
      : "0 5px 15px rgba(0, 0, 0, 0.5)"};
  overflow: hidden;
  backdrop-filter: blur(5px);
  transition: border-color 0.3s, box-shadow 0.3s;
`

const WindowTitleBar = styled.div<{ isActive: boolean }>`
  background: ${(props) =>
    props.isActive ? "linear-gradient(90deg, #00f0ff, #0070ff)" : "linear-gradient(90deg, #333, #444)"};
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
`

const WindowTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
`

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
`

const WindowButton = styled.button`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #333;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
`

const MinimizeButton = styled(WindowButton)`
  background: #ffcc00;
  &:hover {
    background: #ffd700;
  }
`

const CloseButton = styled(WindowButton)`
  background: #ff3b30;
  &:hover {
    background: #ff5146;
  }
`

const WindowContent = styled.div`
  padding: 10px;
  height: calc(100% - 36px);
  overflow: auto;
  color: #fff;
`

const TaskBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(20, 20, 30, 0.9);
  display: flex;
  align-items: center;
  padding: 0 10px;
  z-index: 1000;
  border-top: 2px solid #00f0ff;
  box-shadow: 0 -5px 15px rgba(0, 240, 255, 0.2);
`

const TaskBarButton = styled.button<{ isActive: boolean }>`
  height: 30px;
  padding: 0 10px;
  margin-right: 5px;
  background: ${(props) => (props.isActive ? "linear-gradient(90deg, #00f0ff, #0070ff)" : "rgba(60, 60, 80, 0.5)")};
  border: 1px solid ${(props) => (props.isActive ? "#00f0ff" : "#444")};
  border-radius: 4px;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${(props) => (props.isActive ? "linear-gradient(90deg, #00f0ff, #0070ff)" : "rgba(80, 80, 100, 0.7)")};
    box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
  }
`

const TaskBarIcon = styled.img`
  width: 16px;
  height: 16px;
`

const TaskBarClock = styled.div`
  margin-left: auto;
  color: #00f0ff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
`

export const WindowManager: React.FC = () => {
  const [windows, setWindows] = useState<Window[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [highestZIndex, setHighestZIndex] = useState(100)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Initialize windows from DOM
  useEffect(() => {
    const windowElements = document.querySelectorAll(".popup-window")
    const initialWindows: Window[] = Array.from(windowElements).map((el, index) => {
      const id = el.id
      const titleEl = el.querySelector(".window-title")
      const title = titleEl ? titleEl.textContent || id : id
      const iconEl = el.querySelector(".window-icon") as HTMLImageElement
      const icon = iconEl ? iconEl.src : ""

      return {
        id,
        title,
        icon,
        content: id, // This will be used to load content
        isOpen: false,
        isMinimized: false,
        zIndex: 100 + index,
        position: { x: 50 + index * 20, y: 50 + index * 20 },
        size: { width: 600, height: 400 },
      }
    })

    setWindows(initialWindows)

    // Set up event listeners for desktop icons
    document.querySelectorAll(".desktop-icon").forEach((icon) => {
      icon.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = (icon as HTMLElement).dataset.target
        if (targetId) {
          openWindow(targetId)
        }
      })
    })

    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  // Function to open a window
  const openWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            isOpen: true,
            isMinimized: false,
            zIndex: highestZIndex + 1,
          }
        }
        return window
      }),
    )

    setActiveWindowId(id)
    setHighestZIndex((prev) => prev + 1)

    // Play open sound
    const audio = new Audio("/audio/window-open.mp3")
    audio.play()
  }

  // Function to close a window
  const closeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            isOpen: false,
          }
        }
        return window
      }),
    )

    // Set active window to the highest z-index window that's still open
    const remainingWindows = windows.filter((w) => w.isOpen && w.id !== id)
    if (remainingWindows.length > 0) {
      const highestWindow = remainingWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current))
      setActiveWindowId(highestWindow.id)
    } else {
      setActiveWindowId(null)
    }

    // Play close sound
    const audio = new Audio("/audio/window-close.mp3")
    audio.play()
  }

  // Function to minimize a window
  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            isMinimized: true,
          }
        }
        return window
      }),
    )

    // Set active window to the highest z-index window that's still open and not minimized
    const visibleWindows = windows.filter((w) => w.isOpen && !w.isMinimized && w.id !== id)
    if (visibleWindows.length > 0) {
      const highestWindow = visibleWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current))
      setActiveWindowId(highestWindow.id)
    } else {
      setActiveWindowId(null)
    }

    // Play minimize sound
    const audio = new Audio("/audio/window-minimize.mp3")
    audio.play()
  }

  // Function to restore a minimized window
  const restoreWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            isMinimized: false,
            zIndex: highestZIndex + 1,
          }
        }
        return window
      }),
    )

    setActiveWindowId(id)
    setHighestZIndex((prev) => prev + 1)

    // Play restore sound
    const audio = new Audio("/audio/window-restore.mp3")
    audio.play()
  }

  // Function to bring a window to front
  const bringToFront = (id: string) => {
    if (id === activeWindowId) return

    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return {
            ...window,
            zIndex: highestZIndex + 1,
          }
        }
        return window
      }),
    )

    setActiveWindowId(id)
    setHighestZIndex((prev) => prev + 1)
  }

  // Format time for the taskbar clock
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Render windows */}
      {windows.map((window) => (
        <AnimatePresence key={window.id}>
          {window.isOpen && !window.isMinimized && (
            <Rnd
              default={{
                x: window.position.x,
                y: window.position.y,
                width: window.size.width,
                height: window.size.height,
              }}
              style={{ zIndex: window.zIndex }}
              bounds="parent"
              onMouseDown={() => bringToFront(window.id)}
              onDragStop={(e, d) => {
                setWindows((prev) =>
                  prev.map((w) => {
                    if (w.id === window.id) {
                      return { ...w, position: { x: d.x, y: d.y } }
                    }
                    return w
                  }),
                )
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                setWindows((prev) =>
                  prev.map((w) => {
                    if (w.id === window.id) {
                      return {
                        ...w,
                        size: {
                          width: Number.parseInt(ref.style.width),
                          height: Number.parseInt(ref.style.height),
                        },
                        position,
                      }
                    }
                    return w
                  }),
                )
              }}
            >
              <WindowContainer
                isActive={window.id === activeWindowId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <WindowTitleBar isActive={window.id === activeWindowId}>
                  <WindowTitle>
                    {window.icon && <img src={window.icon || "/placeholder.svg"} alt="" width="16" height="16" />}
                    {window.title}
                  </WindowTitle>
                  <WindowControls>
                    <MinimizeButton onClick={() => minimizeWindow(window.id)}>_</MinimizeButton>
                    <CloseButton onClick={() => closeWindow(window.id)}>×</CloseButton>
                  </WindowControls>
                </WindowTitleBar>
                <WindowContent>
                  {/* Load content from the original window */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: document.getElementById(window.content)?.innerHTML || "",
                    }}
                  />
                </WindowContent>
              </WindowContainer>
            </Rnd>
          )}
        </AnimatePresence>
      ))}

      {/* Taskbar */}
      <TaskBar>
        {windows
          .filter((window) => window.isOpen)
          .map((window) => (
            <TaskBarButton
              key={window.id}
              isActive={window.id === activeWindowId && !window.isMinimized}
              onClick={() => (window.isMinimized ? restoreWindow(window.id) : minimizeWindow(window.id))}
            >
              {window.icon && <TaskBarIcon src={window.icon} alt="" />}
              {window.title.length > 15 ? `${window.title.substring(0, 15)}...` : window.title}
            </TaskBarButton>
          ))}
        <TaskBarClock>{formatTime(currentTime)}</TaskBarClock>
      </TaskBar>
    </>
  )
}
