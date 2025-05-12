"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { motion, AnimatePresence } from "framer-motion"

// Styled components
const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const GameHeader = styled.div`
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 2px solid #00f0ff;
  z-index: 10;
`

const GameTitle = styled.h1`
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const GameStats = styled.div`
  display: flex;
  gap: 15px;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #fff;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 10px;
  }
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  
  span {
    color: #00f0ff;
    margin-left: 5px;
  }
`

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const GameCanvas = styled.canvas`
  background-color: #000;
  border: 2px solid #00f0ff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
`

const Overlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
`

const OverlayContent = styled.div`
  background: rgba(0, 20, 40, 0.9);
  padding: 30px;
  border-radius: 10px;
  border: 2px solid #00f0ff;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
  text-align: center;
  max-width: 80%;
`

const OverlayTitle = styled.h2`
  font-family: 'Press Start 2P', monospace;
  font-size: 1.5rem;
  color: #00f0ff;
  margin-top: 0;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

const OverlayText = styled.p`
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const Button = styled(motion.button)`
  background: linear-gradient(to right, #0070ff, #00f0ff);
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px 16px;
  }
`

const ScoreInput = styled.input`
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00f0ff;
  border-radius: 5px;
  padding: 10px;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #fff;
  margin-top: 10px;
  width: 100%;
  text-align: center;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
  }
`

const HighScoresList = styled.ol`
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  color: #fff;
  text-align: left;
  margin-top: 20px;
  padding-left: 20px;
  
  li {
    margin-bottom: 5px;
    
    span {
      color: #00f0ff;
      margin-left: 10px;
    }
  }
`

const MobileControls = styled.div`
  display: none;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

const ControlButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #00f0ff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  font-size: 1.5rem;
  margin: 5px;
  cursor: pointer;
`

const ControlRow = styled.div`
  display: flex;
  gap: 10px;
`

const MuteButton = styled(motion.button)`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #00f0ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 15;
`

// Types
interface HighScore {
  name: string
  score: number
}

// Game constants
const GRID_SIZE = 20
const INITIAL_SPEED = 150
const MAX_SPEED = 50
const SPEED_INCREMENT = 5
const FOOD_TYPES = [
  { color: "#ff0000", points: 1 }, // Red - regular food
  { color: "#00ff00", points: 3 }, // Green - bonus food
  { color: "#ffff00", points: 5 }, // Yellow - rare food
]

const EnhancedSnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "paused" | "gameover">("start")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [playerName, setPlayerName] = useState("")
  const [highScores, setHighScores] = useState<HighScore[]>([])
  const [isMuted, setIsMuted] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snakeRef = useRef<{ x: number; y: number }[]>([])
  const foodRef = useRef<{ x: number; y: number; type: number } | null>(null)
  const directionRef = useRef<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT")
  const speedRef = useRef(INITIAL_SPEED)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize game
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("/audio/snake-music.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.5

    // Load high scores from localStorage
    const savedHighScores = localStorage.getItem("snakeHighScores")
    if (savedHighScores) {
      setHighScores(JSON.parse(savedHighScores))
    }

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("snakeHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore, 10))
    }

    // Load player name from localStorage
    const savedPlayerName = localStorage.getItem("snakePlayerName")
    if (savedPlayerName) {
      setPlayerName(savedPlayerName)
    }

    // Initialize canvas
    initCanvas()

    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
      }
      window.removeEventListener("keydown", handleKeyDown)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  // Initialize canvas
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const containerWidth = canvas.parentElement?.clientWidth || 400
    const containerHeight = canvas.parentElement?.clientHeight || 400
    const size = Math.min(containerWidth, containerHeight) - 40

    canvas.width = size
    canvas.height = size

    // Draw start screen
    drawStartScreen(ctx, canvas.width, canvas.height)
  }

  // Draw start screen
  const drawStartScreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    // Draw title
    ctx.fillStyle = "#00f0ff"
    ctx.font = "30px 'Press Start 2P'"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("SPACEWORM", width / 2, height / 3)

    // Draw subtitle
    ctx.fillStyle = "#fff"
    ctx.font = "16px 'VT323'"
    ctx.fillText("Press PLAY to start", width / 2, height / 2)

    // Draw snake animation
    const time = Date.now() / 1000
    const x = width / 2 + Math.sin(time) * 50
    const y = (height * 2) / 3 + Math.cos(time) * 20

    ctx.fillStyle = "#00f0ff"
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#0070ff"
    ctx.beginPath()
    ctx.arc(x - 25, y, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#0040ff"
    ctx.beginPath()
    ctx.arc(x - 50, y, 10, 0, Math.PI * 2)
    ctx.fill()
  }

  // Start game
  const startGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Reset game state
    setScore(0)
    setLevel(1)
    speedRef.current = INITIAL_SPEED
    directionRef.current = "RIGHT"

    // Initialize snake
    const cellSize = canvas.width / GRID_SIZE
    snakeRef.current = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ]

    // Create first food
    createFood()

    // Start game loop
    setGameState("playing")
    gameLoop()

    // Play music
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
      })
    }
  }

  // Game loop
  const gameLoop = () => {
    if (gameState !== "playing") return

    moveSnake()
    checkCollision()
    drawGame()

    gameLoopRef.current = setTimeout(gameLoop, speedRef.current)
  }

  // Move snake
  const moveSnake = () => {
    const head = { ...snakeRef.current[0] }

    // Move head based on direction
    switch (directionRef.current) {
      case "UP":
        head.y -= 1
        break
      case "DOWN":
        head.y += 1
        break
      case "LEFT":
        head.x -= 1
        break
      case "RIGHT":
        head.x += 1
        break
    }

    // Wrap around edges
    if (head.x < 0) head.x = GRID_SIZE - 1
    if (head.x >= GRID_SIZE) head.x = 0
    if (head.y < 0) head.y = GRID_SIZE - 1
    if (head.y >= GRID_SIZE) head.y = 0

    // Add new head
    snakeRef.current.unshift(head)

    // Check if snake eats food
    if (foodRef.current && head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Increase score
      const foodPoints = FOOD_TYPES[foodRef.current.type].points
      setScore((prevScore) => {
        const newScore = prevScore + foodPoints

        // Check for level up
        if (Math.floor(newScore / 10) > Math.floor(prevScore / 10)) {
          setLevel((prevLevel) => prevLevel + 1)
          speedRef.current = Math.max(MAX_SPEED, INITIAL_SPEED - level * SPEED_INCREMENT)
        }

        return newScore
      })

      // Create new food
      createFood()

      // Play eat sound
      playSound("eat")
    } else {
      // Remove tail if no food eaten
      snakeRef.current.pop()
    }
  }

  // Check collision
  const checkCollision = () => {
    const head = snakeRef.current[0]

    // Check collision with self
    for (let i = 1; i < snakeRef.current.length; i++) {
      if (head.x === snakeRef.current[i].x && head.y === snakeRef.current[i].y) {
        gameOver()
        return
      }
    }
  }

  // Game over
  const gameOver = () => {
    setGameState("gameover")

    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current)
    }

    // Update high score
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("snakeHighScore", score.toString())
    }

    // Play game over sound
    playSound("gameover")

    // Stop music
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // Create food
  const createFood = () => {
    // Generate random position
    let x, y
    do {
      x = Math.floor(Math.random() * GRID_SIZE)
      y = Math.floor(Math.random() * GRID_SIZE)
    } while (snakeRef.current.some((segment) => segment.x === x && segment.y === y))

    // Determine food type based on probability
    let type
    const rand = Math.random()
    if (rand < 0.7) {
      type = 0 // 70% chance for regular food
    } else if (rand < 0.9) {
      type = 1 // 20% chance for bonus food
    } else {
      type = 2 // 10% chance for rare food
    }

    foodRef.current = { x, y, type }
  }

  // Draw game
  const drawGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cellSize = canvas.width / GRID_SIZE

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid (subtle)
    ctx.strokeStyle = "rgba(0, 240, 255, 0.1)"
    ctx.lineWidth = 0.5
    for (let i = 0; i < GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }

    // Draw food
    if (foodRef.current) {
      const { x, y, type } = foodRef.current
      const foodColor = FOOD_TYPES[type].color

      // Draw food with glow effect
      ctx.shadowColor = foodColor
      ctx.shadowBlur = 10
      ctx.fillStyle = foodColor
      ctx.beginPath()
      ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      // Gradient color from head to tail
      const ratio = index / snakeRef.current.length
      const r = Math.floor(0 * (1 - ratio) + 0 * ratio)
      const g = Math.floor(240 * (1 - ratio) + 70 * ratio)
      const b = Math.floor(255 * (1 - ratio) + 255 * ratio)

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

      // Head is slightly larger
      if (index === 0) {
        ctx.shadowColor = "#00f0ff"
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(segment.x * cellSize + cellSize / 2, segment.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw eyes
        ctx.fillStyle = "#fff"

        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2
        switch (directionRef.current) {
          case "UP":
            eyeX1 = segment.x * cellSize + cellSize / 3
            eyeY1 = segment.y * cellSize + cellSize / 3
            eyeX2 = segment.x * cellSize + (cellSize * 2) / 3
            eyeY2 = segment.y * cellSize + cellSize / 3
            break
          case "DOWN":
            eyeX1 = segment.x * cellSize + cellSize / 3
            eyeY1 = segment.y * cellSize + (cellSize * 2) / 3
            eyeX2 = segment.x * cellSize + (cellSize * 2) / 3
            eyeY2 = segment.y * cellSize + (cellSize * 2) / 3
            break
          case "LEFT":
            eyeX1 = segment.x * cellSize + cellSize / 3
            eyeY1 = segment.y * cellSize + cellSize / 3
            eyeX2 = segment.x * cellSize + cellSize / 3
            eyeY2 = segment.y * cellSize + (cellSize * 2) / 3
            break
          case "RIGHT":
            eyeX1 = segment.x * cellSize + (cellSize * 2) / 3
            eyeY1 = segment.y * cellSize + cellSize / 3
            eyeX2 = segment.x * cellSize + (cellSize * 2) / 3
            eyeY2 = segment.y * cellSize + (cellSize * 2) / 3
            break
        }

        ctx.beginPath()
        ctx.arc(eyeX1, eyeY1, cellSize / 10, 0, Math.PI * 2)
        ctx.arc(eyeX2, eyeY2, cellSize / 10, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Draw body segments
        ctx.beginPath()
        ctx.arc(
          segment.x * cellSize + cellSize / 2,
          segment.y * cellSize + cellSize / 2,
          cellSize / 2 - 2,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
    })
  }

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState === "playing") {
      switch (e.key) {
        case "ArrowUp":
          if (directionRef.current !== "DOWN") {
            directionRef.current = "UP"
          }
          break
        case "ArrowDown":
          if (directionRef.current !== "UP") {
            directionRef.current = "DOWN"
          }
          break
        case "ArrowLeft":
          if (directionRef.current !== "RIGHT") {
            directionRef.current = "LEFT"
          }
          break
        case "ArrowRight":
          if (directionRef.current !== "LEFT") {
            directionRef.current = "RIGHT"
          }
          break
        case "p":
        case "P":
          pauseGame()
          break
      }
    } else if (gameState === "paused") {
      if (e.key === "p" || e.key === "P") {
        resumeGame()
      }
    } else if (gameState === "start" || gameState === "gameover") {
      if (e.key === "Enter") {
        startGame()
      }
    }
  }

  // Handle mobile controls
  const handleMobileControl = (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    if (gameState === "playing") {
      switch (direction) {
        case "UP":
          if (directionRef.current !== "DOWN") {
            directionRef.current = "UP"
          }
          break
        case "DOWN":
          if (directionRef.current !== "UP") {
            directionRef.current = "DOWN"
          }
          break
        case "LEFT":
          if (directionRef.current !== "RIGHT") {
            directionRef.current = "LEFT"
          }
          break
        case "RIGHT":
          if (directionRef.current !== "LEFT") {
            directionRef.current = "RIGHT"
          }
          break
      }
    }
  }

  // Pause game
  const pauseGame = () => {
    if (gameState === "playing") {
      setGameState("paused")
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
      }

      // Pause music
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }

  // Resume game
  const resumeGame = () => {
    if (gameState === "paused") {
      setGameState("playing")
      gameLoop()

      // Resume music
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
        })
      }
    }
  }

  // Submit high score
  const submitHighScore = () => {
    if (!playerName.trim()) return

    // Save player name
    localStorage.setItem("snakePlayerName", playerName)

    // Add to high scores
    const newHighScore: HighScore = {
      name: playerName,
      score: score,
    }

    const updatedHighScores = [...highScores, newHighScore].sort((a, b) => b.score - a.score).slice(0, 10)

    setHighScores(updatedHighScores)
    localStorage.setItem("snakeHighScores", JSON.stringify(updatedHighScores))
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)

    if (audioRef.current) {
      if (isMuted) {
        if (gameState === "playing") {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error)
          })
        }
      } else {
        audioRef.current.pause()
      }
    }
  }

  // Play sound effect
  const playSound = (type: "eat" | "gameover") => {
    if (isMuted) return

    const sound = new Audio(`/audio/snake-${type}.mp3`)
    sound.volume = 0.5
    sound.play().catch((error) => {
      console.error(`Error playing ${type} sound:`, error)
    })
  }

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      initCanvas()
      if (gameState === "playing") {
        drawGame()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [gameState])

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>SPACEWORM</GameTitle>
        <GameStats>
          <StatItem>
            Score: <span>{score}</span>
          </StatItem>
          <StatItem>
            Level: <span>{level}</span>
          </StatItem>
          <StatItem>
            Best: <span>{highScore}</span>
          </StatItem>
        </GameStats>
      </GameHeader>

      <CanvasContainer>
        <GameCanvas ref={canvasRef} />

        <MuteButton onClick={toggleMute} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          {isMuted ? "🔇" : "🔊"}
        </MuteButton>

        <MobileControls>
          <ControlButton
            onClick={() => handleMobileControl("UP")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </ControlButton>
          <ControlRow>
            <ControlButton
              onClick={() => handleMobileControl("LEFT")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ←
            </ControlButton>
            <ControlButton
              onClick={() => handleMobileControl("RIGHT")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              →
            </ControlButton>
          </ControlRow>
          <ControlButton
            onClick={() => handleMobileControl("DOWN")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↓
          </ControlButton>
        </MobileControls>

        <AnimatePresence>
          {gameState === "start" && (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OverlayContent>
                <OverlayTitle>SPACEWORM</OverlayTitle>
                <OverlayText>Navigate the cosmic void, consume energy orbs, and grow your space worm!</OverlayText>
                <Button onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  PLAY
                </Button>
              </OverlayContent>
            </Overlay>
          )}

          {gameState === "paused" && (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OverlayContent>
                <OverlayTitle>PAUSED</OverlayTitle>
                <Button onClick={resumeGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  RESUME
                </Button>
              </OverlayContent>
            </Overlay>
          )}

          {gameState === "gameover" && (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OverlayContent>
                <OverlayTitle>GAME OVER</OverlayTitle>
                <OverlayText>Your score: {score}</OverlayText>

                {score > 0 && (
                  <div>
                    <ScoreInput
                      type="text"
                      placeholder="Enter your name"
                      maxLength={7}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <Button
                      onClick={submitHighScore}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ marginTop: "10px" }}
                    >
                      SUBMIT SCORE
                    </Button>
                  </div>
                )}

                {highScores.length > 0 && (
                  <HighScoresList>
                    {highScores.map((entry, index) => (
                      <li key={index}>
                        {entry.name} <span>{entry.score}</span>
                      </li>
                    ))}
                  </HighScoresList>
                )}

                <Button onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  PLAY AGAIN
                </Button>
              </OverlayContent>
            </Overlay>
          )}
        </AnimatePresence>
      </CanvasContainer>
    </GameContainer>
  )
}

export default EnhancedSnakeGame
