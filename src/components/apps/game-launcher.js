"use client"

import { useState, useEffect } from "react"
import { X, Maximize2, Minimize2, Play } from "lucide-react"

interface Game {
  id: string
  title: string
  year: string
  imageUrl: string
  embedUrl: string
  description: string
}

export default function DosGameLauncher() {
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGames, setFilteredGames] = useState<Game[]>([])

  // Sample DOS games from dos.zone
  const dosGames: Game[] = [
    {
      id: "doom",
      title: "DOOM",
      year: "1993",
      imageUrl: "/games/doom.png",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos?anonymous=1",
      description:
        "The groundbreaking first-person shooter that defined a genre. Fight demons from hell as a space marine.",
    },
    {
      id: "doom2",
      title: "DOOM II",
      year: "1994",
      imageUrl: "/games/doom2.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom2.jsdos?anonymous=1",
      description: "The sequel to the iconic DOOM, featuring new weapons, enemies, and levels.",
    },
    {
      id: "wolf3d",
      title: "Wolfenstein 3D",
      year: "1992",
      imageUrl: "/games/wolf3d.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fwolf3d.jsdos?anonymous=1",
      description: "The Nazi-fighting action game that pioneered the first-person shooter genre.",
    },
    {
      id: "heroes3",
      title: "Heroes of Might and Magic III",
      year: "1999",
      imageUrl: "/games/heroes3.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fheroes3.jsdos?anonymous=1",
      description: "The beloved turn-based strategy game set in a fantasy world.",
    },
    {
      id: "quake",
      title: "Quake",
      year: "1996",
      imageUrl: "/games/quake.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fquake.jsdos?anonymous=1",
      description: "The revolutionary 3D first-person shooter with gothic and Lovecraftian themes.",
    },
    {
      id: "blood",
      title: "BLOOD",
      year: "1997",
      imageUrl: "/games/blood.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fblood.jsdos?anonymous=1",
      description: "A horror-themed first-person shooter with a dark sense of humor.",
    },
    {
      id: "gta",
      title: "Grand Theft Auto",
      year: "1997",
      imageUrl: "/games/gta.png",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fgta.jsdos?anonymous=1",
      description: "The original top-down action game that started the infamous GTA series.",
    },
    {
      id: "pinball",
      title: "Microsoft 3D Pinball: Space Cadet",
      year: "1995",
      imageUrl: "/games/pinball.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fpinball.jsdos?anonymous=1",
      description: "The classic pinball game that came with Windows.",
    },
    {
      id: "heroes2",
      title: "Heroes of Might and Magic II",
      year: "1996",
      imageUrl: "/games/heroes2.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fheroes2.jsdos?anonymous=1",
      description: "The fantasy turn-based strategy game with improved graphics and gameplay.",
    },
    {
      id: "halflife",
      title: "Half-Life: Deathmatch",
      year: "1998",
      imageUrl: "/games/halflife.png",
      embedUrl:
        "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fhalflife.jsdos?anonymous=1",
      description: "The multiplayer component of the revolutionary first-person shooter Half-Life.",
    },
  ]

  useEffect(() => {
    setFilteredGames(
      searchQuery
        ? dosGames.filter(
            (game) => game.title.toLowerCase().includes(searchQuery.toLowerCase()) || game.year.includes(searchQuery),
          )
        : dosGames,
    )
  }, [searchQuery])

  const launchGame = (game: Game) => {
    setActiveGame(game)
  }

  const closeGame = () => {
    setActiveGame(null)
    setIsMaximized(false)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  return (
    <div className="dos-game-launcher">
      {/* Game Window */}
      {activeGame && (
        <div className={`popup-window game-window active ${isMaximized ? "maximized" : ""}`}>
          <div className="window-header">
            <span>
              {activeGame.title} ({activeGame.year})
            </span>
            <div>
              <button className="minimize" onClick={toggleMaximize}>
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button className="close" onClick={closeGame}>
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="window-content">
            <iframe src={activeGame.embedUrl} title={activeGame.title} allowFullScreen className="game-iframe"></iframe>
          </div>
        </div>
      )}

      {/* Game Launcher Interface */}
      <div className="popup-window active" id="dos-games">
        <div className="window-header">
          <span>DOS Game Launcher v1.0</span>
          <div>
            <button className="close">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="window-content">
          <div className="game-launcher-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="game-search"
              />
            </div>

            <div className="games-grid">
              {filteredGames.map((game) => (
                <div key={game.id} className="game-card" onClick={() => launchGame(game)}>
                  <div className="game-image-container">
                    <img
                      src={game.imageUrl || "/placeholder.svg"}
                      alt={game.title}
                      className="game-image"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          `/placeholder.svg?height=150&width=200&query=retro game ${game.title}`
                      }}
                    />
                    <div className="game-play-overlay">
                      <Play size={32} />
                    </div>
                  </div>
                  <div className="game-info">
                    <h3>{game.title}</h3>
                    <span className="game-year">{game.year}</span>
                    <p className="game-description">{game.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
