"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Styled components
const GalleryContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`

const GalleryHeader = styled.div`
  padding: 15px;
  text-align: center;
  color: #00f0ff;
  font-family: 'Press Start 2P', monospace;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
  border-bottom: 2px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
`

const GalleryTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

const GalleryWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`

const GallerySlider = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
`

const GalleryItem = styled(motion.div)`
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  
  &:hover {
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
  }
`

const GalleryImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`

const Caption = styled.div`
  margin-top: 15px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.7);
  color: #00f0ff;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  border-radius: 4px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  text-align: center;
  max-width: 80%;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 8px 12px;
  }
`

const NavButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #00f0ff;
  border: 2px solid rgba(0, 240, 255, 0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: #00f0ff;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.7);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`

const PrevButton = styled(NavButton)`
  left: 20px;
`

const NextButton = styled(NavButton)`
  right: 20px;
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 8px;
`

const PaginationDot = styled.button<{ isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => (props.isActive ? "#00f0ff" : "rgba(0, 240, 255, 0.3)")};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${(props) => (props.isActive ? "#00f0ff" : "rgba(0, 240, 255, 0.5)")};
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
  }
`

const FullscreenButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #00f0ff;
  border: 2px solid rgba(0, 240, 255, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: #00f0ff;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.7);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`

// Types
interface GalleryImage {
  src: string
  alt: string
  caption: string
}

interface EnhancedGalleryProps {
  title: string
  images: GalleryImage[]
}

const EnhancedGallery: React.FC<EnhancedGalleryProps> = ({ title, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage()
      } else if (e.key === "ArrowRight") {
        nextImage()
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentIndex, isFullscreen])

  // Navigate to previous image
  const prevImage = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Navigate to next image
  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Go to specific image
  const goToImage = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      exitFullscreen()
    }
  }

  // Exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = e.touches[0].clientX
    const diff = touchStart - touchEnd

    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left
        nextImage()
      } else {
        // Swipe right
        prevImage()
      }
      setTouchStart(0)
    }
  }

  // Animation variants
  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  }

  return (
    <GalleryContainer ref={containerRef}>
      <GalleryHeader>
        <GalleryTitle>{title}</GalleryTitle>
      </GalleryHeader>

      <GalleryWrapper onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={() => setTouchStart(0)}>
        <AnimatePresence initial={false} custom={direction}>
          <GallerySlider
            key={currentIndex}
            custom={direction}
            variants={sliderVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <GalleryItem>
              <ImageContainer>
                <GalleryImage
                  src={images[currentIndex].src || "/placeholder.svg"}
                  alt={images[currentIndex].alt}
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </ImageContainer>
              <Caption>{images[currentIndex].caption}</Caption>
            </GalleryItem>
          </GallerySlider>
        </AnimatePresence>

        <PrevButton
          onClick={prevImage}
          disabled={currentIndex === 0}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </PrevButton>

        <NextButton
          onClick={nextImage}
          disabled={currentIndex === images.length - 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} />
        </NextButton>

        <FullscreenButton onClick={toggleFullscreen} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isFullscreen ? (
              <>
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </>
            ) : (
              <>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </>
            )}
          </svg>
        </FullscreenButton>
      </GalleryWrapper>

      <Pagination>
        {images.map((_, index) => (
          <PaginationDot key={index} isActive={index === currentIndex} onClick={() => goToImage(index)} />
        ))}
      </Pagination>
    </GalleryContainer>
  )
}

export default EnhancedGallery
