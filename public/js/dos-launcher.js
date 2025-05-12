/**
 * DOS Game Launcher - Text-Based Version
 * Integrates with dos.zone to play classic DOS games
 */
document.addEventListener('DOMContentLoaded', () => {
  // Game data
  const dosGames = [
    {
      id: "doom",
      filename: "DOOM.EXE",
      title: "DOOM",
      year: "1993",
      size: "12,428",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos?anonymous=1",
      description: "First-person shooter with demons from hell"
    },
    {
      id: "wolf3d",
      filename: "WOLF3D.EXE",
      title: "Wolfenstein 3D",
      year: "1992",
      size: "8,764",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fwolf3d.jsdos?anonymous=1",
      description: "Nazi-fighting action FPS"
    },
    {
      id: "heroes3",
      filename: "HEROES3.EXE",
      title: "Heroes of Might and Magic III",
      year: "1999",
      size: "24,532",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fheroes3.jsdos?anonymous=1",
      description: "Fantasy turn-based strategy"
    },
    {
      id: "quake",
      filename: "QUAKE.EXE",
      title: "Quake",
      year: "1996",
      size: "18,452",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fquake.jsdos?anonymous=1",
      description: "3D first-person shooter"
    },
    {
      id: "blood",
      filename: "BLOOD.EXE",
      title: "BLOOD",
      year: "1997",
      size: "14,328",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fblood.jsdos?anonymous=1",
      description: "Horror-themed FPS"
    },
    {
      id: "gta",
      filename: "GTA.EXE",
      title: "Grand Theft Auto",
      year: "1997",
      size: "16,845",
      embedUrl: "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fgta.jsdos?anonymous=1",
      description: "Top-down action game"
    }
  ];

  // Initialize the launcher
  function initDosLauncher() {
    const gamesTable = document.getElementById('games-tbody');
    const searchInput = document.getElementById('game-search');
    const commandInput = document.getElementById('command-input');
    const gameCount = document.getElementById('game-count');
    
    if (!gamesTable) return;
    
    // Render game list
    renderGameList(gamesTable, dosGames);
    
    // Update game count
    if (gameCount) {
      gameCount.textContent = `${dosGames.length} file(s) found`;
    }
    
    // Add search functionality
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const filteredGames = filterGames(dosGames, e.target.value);
        renderGameList(gamesTable, filteredGames);
        
        // Update game count
        if (gameCount) {
          gameCount.textContent = `${filteredGames.length} file(s) found`;
        }
      });
    }
    
    // Add command input functionality
    if (commandInput) {
      commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const command = commandInput.value.trim().toUpperCase();
          processCommand(command);
          commandInput.value = '';
        }
      });
    }
    
    // Add window event listeners
    addWindowEventListeners();
  }
  
  // Render game list
  function renderGameList(container, games) {
    container.innerHTML = '';
    
    games.forEach(game => {
      const row = document.createElement('tr');
      row.dataset.id = game.id;
      
      row.innerHTML = `
        <td class="game-title">${game.filename}</td>
        <td class="game-year">${game.year}</td>
        <td class="game-size">${game.size} KB</td>
        <td class="game-description">${game.description}</td>
      `;
      
      // Double-click to launch game
      row.addEventListener('dblclick', () => {
        launchGame(game);
      });
      
      // Single click to select
      row.addEventListener('click', () => {
        // Remove selected class from all rows
        const allRows = container.querySelectorAll('tr');
        allRows.forEach(r => r.classList.remove('selected'));
        
        // Add selected class to clicked row
        row.classList.add('selected');
        
        // Update command input
        const commandInput = document.getElementById('command-input');
        if (commandInput) {
          commandInput.value = `RUN ${game.filename}`;
        }
      });
      
      container.appendChild(row);
    });
  }
  
  // Filter games based on search
  function filterGames(games, query) {
    if (!query) return games;
    
    const lowerQuery = query.toLowerCase();
    return games.filter(game => {
      return game.filename.toLowerCase().includes(lowerQuery) || 
             game.title.toLowerCase().includes(lowerQuery) ||
             game.year.includes(lowerQuery) ||
             game.description.toLowerCase().includes(lowerQuery);
    });
  }
  
  // Process command
  function processCommand(command) {
    if (command.startsWith('RUN ') || command.startsWith('PLAY ')) {
      const filename = command.split(' ')[1];
      const game = dosGames.find(g => g.filename === filename);
      
      if (game) {
        launchGame(game);
      } else {
        // Show error message
        console.log(`File not found: ${filename}`);
      }
    } else if (command === 'DIR' || command === 'LS') {
      // Just refresh the list
      const gamesTable = document.getElementById('games-tbody');
      if (gamesTable) {
        renderGameList(gamesTable, dosGames);
      }
    } else if (command === 'CLS' || command === 'CLEAR') {
      // Clear search
      const searchInput = document.getElementById('game-search');
      if (searchInput) {
        searchInput.value = '';
        const gamesTable = document.getElementById('games-tbody');
        if (gamesTable) {
          renderGameList(gamesTable, dosGames);
        }
      }
    } else if (command === 'EXIT' || command === 'QUIT') {
      // Close window
      const closeBtn = document.querySelector('#dosgames .close');
      if (closeBtn) {
        closeBtn.click();
      }
    } else if (command === 'HELP') {
      // Show help
      alert(`Available commands:
RUN [FILENAME] - Launch a game
DIR - List all games
CLS - Clear screen
EXIT - Close launcher
HELP - Show this help`);
    }
  }
  
  // Launch a game
  function launchGame(game) {
    const gameWindow = document.getElementById('game-window');
    const gameIframe = document.getElementById('game-iframe');
    const gameTitle = document.getElementById('game-window-title');
    
    if (!gameWindow || !gameIframe || !gameTitle) return;
    
    // Set game title
    gameTitle.textContent = `${game.title} (${game.year})`;
    
    // Set iframe source
    gameIframe.src = game.embedUrl;
    
    // Show game window
    gameWindow.classList.remove('hidden');
    gameWindow.classList.add('active');
    
    // Bring to front
    bringToFront(gameWindow);
  }
  
  // Add window event listeners
  function addWindowEventListeners() {
    // Game window close button
    const gameWindowClose = document.querySelector('#game-window .close');
    if (gameWindowClose) {
      gameWindowClose.addEventListener('click', () => {
        const gameWindow = document.getElementById('game-window');
        const gameIframe = document.getElementById('game-iframe');
        
        if (gameWindow) {
          gameWindow.classList.add('hidden');
          gameWindow.classList.remove('active');
        }
        
        if (gameIframe) {
          gameIframe.src = '';
        }
      });
    }
    
    // Game window maximize button
    const gameWindowMaximize = document.querySelector('#game-window .maximize');
    if (gameWindowMaximize) {
      gameWindowMaximize.addEventListener('click', () => {
        const gameWindow = document.getElementById('game-window');
        if (gameWindow) {
          gameWindow.classList.toggle('maximized');
        }
      });
    }
  }
  
  // Bring window to front (reuse your existing window management code)
  function bringToFront(windowElement) {
    // This should use your existing window management code
    // If you have a function like this already, you can just call it
    
    // Example implementation if you don't have one:
    const windows = document.querySelectorAll('.popup-window');
    let highestZIndex = 0;
    
    windows.forEach(win => {
      const zIndex = parseInt(window.getComputedStyle(win).zIndex, 10);
      if (zIndex > highestZIndex) {
        highestZIndex = zIndex;
      }
      win.classList.remove('active');
    });
    
    windowElement.style.zIndex = highestZIndex + 1;
    windowElement.classList.add('active');
  }
  
  // Initialize when the dosgames window is opened
  const dosGamesIcon = document.getElementById('icon-dosgames');
  if (dosGamesIcon) {
    dosGamesIcon.addEventListener('click', () => {
      setTimeout(initDosLauncher, 100); // Small delay to ensure DOM is ready
    });
  }
  
  // Also initialize when the window is opened from the start menu
  document.addEventListener('windowOpened', (e) => {
    if (e.detail && e.detail.windowId === 'dosgames') {
      setTimeout(initDosLauncher, 100);
    }
  });
  
  // Fallback initialization
  const dosGamesWindow = document.getElementById('dosgames');
  if (dosGamesWindow && !dosGamesWindow.classList.contains('hidden')) {
    initDosLauncher();
  }
});