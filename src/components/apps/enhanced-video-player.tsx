"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

// Styled components
const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
`

const AspectRatioContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const PosterOverlay = styled(motion.div)<{ $posterSrc: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${(props) => `url(${props.$posterSrc})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
`

const PlayButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.7);
  color: #00f0ff;
  border: 2px solid #00f0ff;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
  
  svg {
    width: 40px;
    height: 40px;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    svg {
      width: 30px;
      height: 30px;
    }
  }
`

const LoadingIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00f0ff;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  z-index: 5;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
`

const CustomControls = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  display: flex;
  align-items: center;
  z-index: 20;
  box-sizing: border-box;
`

const ControlButton = styled(motion.button)`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  margin-right: 15px;
  
  &:hover {
    color: #00f0ff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ProgressContainer = styled.div`
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  margin: 0 15px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
`

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => `${props.$progress}%`};
  background: linear-gradient(to right, #0070ff, #00f0ff);
  border-radius: 5px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.7);
  }
`

const BufferedBar = styled.div<{ $buffered: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${(props) => `${props.$buffered}%`};
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
`

const TimeDisplay = styled.div`
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  margin-left: 15px;
  min-width: 80px;
  text-align: center;
`

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`

const VolumeSlider = styled.input`
  -webkit-appearance: none;
  width: 80px;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  margin-left: 10px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    background: #00f0ff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.7);
  }
  
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #00f0ff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.7);
  }
  
  @media (max-width: 768px) {
    width: 60px;
  }
`

const ScanlineEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.3) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 15;
  opacity: 0.15;
  mix-blend-mode: overlay;
`

// Types
interface EnhancedVideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  onEnded?: () => void
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  src,
  poster = "/video-thumbnail.png",
  title = "Video",
  autoplay = false,
  loop = false,
  muted = false,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showPoster, setShowPoster] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial volume
    const savedVolume = localStorage.getItem("videoPlayerVolume")
    if (savedVolume !== null) {
      const parsedVolume = Number.parseFloat(savedVolume)
      setVolume(parsedVolume)
      video.volume = parsedVolume
    }

    // Set initial muted state
    video.muted = isMuted

    // Set loop
    video.loop = loop

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      updateBufferedAmount()
    }

    const handleProgress = () => {
      updateBufferedAmount()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    // Update buffered amount
    const updateBufferedAmount = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercent)
      }
    }

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Cleanup
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [loop, isMuted, onEnded])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return

    const hideControls = () => {
      setShowControls(false)
    }

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(hideControls, 3000)

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video
        .play()
        .then(() => {
          setShowPoster(false)
        })
        .catch((error) => {
          console.error("Error playing video:", error)
        })
    }
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    setIsMuted(!isMuted)
    video.muted = !isMuted
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    video.volume = newVolume

    // Save to localStorage
    localStorage.setItem("videoPlayerVolume", newVolume.toString())

    // Unmute if volume is changed and was muted
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
      video.muted = false
    }
  }

  // Seek to position
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const seekTime = pos * duration

    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true)
  }

  // Handle poster click
  const handlePosterClick = () => {
    const video = videoRef.current
    if (!video) return

    video
      .play()
      .then(() => {
        setShowPoster(false)
        setIsPlaying(true)
      })
      .catch((error) => {
        console.error("Error playing video:", error)
      })
  }

  return (
    <VideoContainer ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setShowControls(false)}>
      <AspectRatioContainer>
        {isLoading && (
          <LoadingIndicator initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            LOADING...
          </LoadingIndicator>
        )}

        <VideoElement
          ref={videoRef}
          src={src}
          preload="auto"
          playsInline
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          onClick={togglePlay}
        />

        {showPoster && (
          <PosterOverlay
            $posterSrc={poster}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handlePosterClick}
          >
            <PlayButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Play size={40} />
            </PlayButton>
          </PosterOverlay>
        )}

        <ScanlineEffect />

        <CustomControls
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <ControlButton onClick={togglePlay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </ControlButton>

          <ProgressContainer onClick={handleSeek}>
            <BufferedBar $buffered={buffered} />
            <ProgressBar $progress={(currentTime / duration) * 100 || 0} />
          </ProgressContainer>

          <TimeDisplay>
            {formatTime(currentTime)} / {formatTime(duration)}
          </TimeDisplay>

          <VolumeControl>
            <ControlButton onClick={toggleMute} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </ControlButton>
            <VolumeSlider type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} />
          </VolumeControl>

          <ControlButton onClick={toggleFullscreen} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </ControlButton>
        </CustomControls>
      </AspectRatioContainer>
    </VideoContainer>
  )
}

export default EnhancedVideoPlayer
