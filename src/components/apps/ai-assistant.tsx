"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { motion } from "framer-motion"
import { MessageSquare, X, Minimize2 } from "lucide-react"

const AssistantContainer = styled(motion.div)<{ isExpanded: boolean }>`
  position: fixed;
  bottom: ${(props) => (props.isExpanded ? "60px" : "20px")};
  right: 20px;
  width: ${(props) => (props.isExpanded ? "300px" : "60px")};
  height: ${(props) => (props.isExpanded ? "400px" : "60px")};
  background: rgba(20, 20, 30, 0.85);
  border: 2px solid #00f0ff;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
  overflow: hidden;
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`

const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: linear-gradient(90deg, #00f0ff, #0070ff);
`

const AssistantTitle = styled.div`
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const AssistantControls = styled.div`
  display: flex;
  gap: 8px;
`

const AssistantButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

const AssistantContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto;
`

const AssistantAvatar = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: url('/img/assistant-avatar.png') no-repeat center center;
  background-size: cover;
  border-radius: 8px;
  margin: ${(props) => (props.theme.isExpanded ? "0" : "auto")};
`

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
`

const Message = styled(motion.div)<{ isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  background: ${(props) => (props.isUser ? "linear-gradient(135deg, #0070ff, #00f0ff)" : "rgba(60, 60, 80, 0.7)")};
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    ${(props) => (props.isUser ? "right: -5px;" : "left: -5px;")}
    width: 10px;
    height: 10px;
    background: ${(props) => (props.isUser ? "linear-gradient(135deg, #0070ff, #00f0ff)" : "rgba(60, 60, 80, 0.7)")};
    transform: translateY(50%) rotate(45deg);
  }
`

const GlitchText = styled.span`
  position: relative;
  display: inline-block;
  
  &::before, &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  
  &::before {
    color: #ff00ff;
    z-index: -1;
    animation: glitch-anim-1 2s infinite linear alternate-reverse;
  }
  
  &::after {
    color: #00ffff;
    z-index: -2;
    animation: glitch-anim-2 3s infinite linear alternate-reverse;
  }
  
  @keyframes glitch-anim-1 {
    0%, 100% { transform: translate(0); }
    20% { transform: translate(-1px, 1px); }
    40% { transform: translate(-1px, -1px); }
    60% { transform: translate(1px, 1px); }
  }
  
  @keyframes glitch-anim-2 {
    0%, 100% { transform: translate(0); }
    20% { transform: translate(1px, -1px); }
    40% { transform: translate(1px, 1px); }
    60% { transform: translate(-1px, -1px); }
  }
`

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const Input = styled.input`
  flex-grow: 1;
  background: rgba(40, 40, 60, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #00f0ff;
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
  }
`

const SendButton = styled.button`
  background: linear-gradient(135deg, #0070ff, #00f0ff);
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

interface Message {
  id: number
  text: string
  isUser: boolean
}

const initialMessages = [
  { id: 1, text: "Hello! I'm your digital assistant. How can I help you navigate this portfolio?", isUser: false },
]

const tips = [
  "Try clicking and dragging windows to move them around.",
  "You can resize windows by dragging their corners.",
  "Check out the Snake game in the Games folder!",
  "Try the 'matrix' command in the terminal for a surprise.",
  "Click the taskbar buttons to minimize or restore windows.",
  "The music player has some hidden tracks. Can you find them?",
  "Right-click on the desktop for additional options.",
  "Press F11 for fullscreen mode.",
  "Try the 'theme' command in the terminal to change the visual style.",
  "There are several easter eggs hidden throughout. Keep exploring!",
]

const AIAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [nextId, setNextId] = useState(2)
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingText, setCurrentTypingText] = useState("")
  const [fullMessageText, setFullMessageText] = useState("")
  const [tipInterval, setTipIntervalState] = useState<NodeJS.Timeout | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  // Start tip interval when expanded
  useEffect(() => {
    if (isExpanded) {
      const interval = setInterval(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)]
        addAssistantMessage(`Tip: ${randomTip}`)
      }, 60000) // Show a tip every minute

      setTipIntervalState(interval)
    } else if (tipInterval) {
      clearInterval(tipInterval)
    }

    return () => {
      if (tipInterval) {
        clearInterval(tipInterval)
      }
    }
  }, [isExpanded])

  // Handle typing animation
  useEffect(() => {
    if (isTyping && currentTypingText.length < fullMessageText.length) {
      const timer = setTimeout(() => {
        setCurrentTypingText(fullMessageText.substring(0, currentTypingText.length + 1))
      }, 30)

      return () => clearTimeout(timer)
    } else if (isTyping && currentTypingText.length === fullMessageText.length) {
      setIsTyping(false)
      setMessages((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], text: fullMessageText }])
    }
  }, [isTyping, currentTypingText, fullMessageText])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage()
    }
  }

  const sendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { id: nextId, text: input, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setNextId((prev) => prev + 1)

    // Clear input
    setInput("")

    // Generate response
    setTimeout(() => {
      const response = generateResponse(input)
      addAssistantMessage(response)
    }, 500)
  }

  const addAssistantMessage = (text: string) => {
    // Add empty message that will be filled by typing animation
    const assistantMessage = { id: nextId, text: "", isUser: false }
    setMessages((prev) => [...prev, assistantMessage])
    setNextId((prev) => prev + 1)

    // Start typing animation
    setFullMessageText(text)
    setCurrentTypingText("")
    setIsTyping(true)
  }

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return "Hello there! How can I assist you with the portfolio today?"
    } else if (input.includes("help") || input.includes("guide")) {
      return "Here's how to navigate: Click on desktop icons to open windows. Use the taskbar to manage open windows. Try the terminal for special commands!"
    } else if (input.includes("about") || input.includes("portfolio")) {
      return "This portfolio showcases creative work through an interactive desktop environment. It features projects, games, music, and more!"
    } else if (input.includes("contact") || input.includes("email")) {
      return "You can find contact information in the Contact window on the desktop. It includes email, social media links, and a contact form."
    } else if (input.includes("project") || input.includes("work")) {
      return "Check out the Projects folder on the desktop to see featured work. Each project has details, screenshots, and links."
    } else if (input.includes("game") || input.includes("snake") || input.includes("play")) {
      return "There are several games available! Try the Snake game or check out the DOS games folder for some retro classics."
    } else if (input.includes("music") || input.includes("audio") || input.includes("sound")) {
      return "The Music Player can be found on the desktop. It features original tracks and playlists. Give it a listen!"
    } else if (input.includes("terminal") || input.includes("command")) {
      return "The Terminal has several hidden commands. Try 'help' to see available commands, or experiment with 'matrix', 'hack', or 'theme'."
    } else if (input.includes("easter egg") || input.includes("secret")) {
      return "I might know about some secrets... Try typing 'unlock easter-egg' in the Terminal, or look for hidden interactions throughout the desktop."
    } else if (input.includes("thank")) {
      return "You're welcome! Feel free to ask if you need anything else."
    } else {
      return "I'm not sure I understand. Try asking about the portfolio, projects, games, or how to navigate the interface."
    }
  }

  return (
    <AssistantContainer
      isExpanded={isExpanded}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isExpanded ? (
        <>
          <AssistantHeader>
            <AssistantTitle>
              <MessageSquare size={16} />
              Digital Assistant
            </AssistantTitle>
            <AssistantControls>
              <AssistantButton onClick={toggleExpand}>
                <Minimize2 size={16} />
              </AssistantButton>
              <AssistantButton onClick={() => setIsExpanded(false)}>
                <X size={16} />
              </AssistantButton>
            </AssistantControls>
          </AssistantHeader>
          <AssistantContent>
            <MessageContainer>
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  isUser={message.isUser}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isTyping && index === messages.length - 1 ? (
                    <GlitchText data-text={currentTypingText}>{currentTypingText}</GlitchText>
                  ) : (
                    message.text
                  )}
                </Message>
              ))}
              <div ref={messagesEndRef} />
            </MessageContainer>
          </AssistantContent>
          <InputContainer>
            <Input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <SendButton onClick={sendMessage}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </SendButton>
          </InputContainer>
        </>
      ) : (
        <AssistantButton style={{ width: "100%", height: "100%" }} onClick={toggleExpand}>
          <AssistantAvatar
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          />
        </AssistantButton>
      )}
    </AssistantContainer>
  )
}

export default AIAssistant
