// Add DOS Games icon to desktop
function addDosGamesIcon() {
  const desktopIcons = document.getElementById('desktop-icons');
  
  const iconDiv = document.createElement('div');
  iconDiv.className = 'desktop-icon';
  iconDiv.id = 'icon-dos-games';
  
  iconDiv.innerHTML = `
    <img src="/assets/images/icons/dos-games.png" alt="DOS Games">
    <span>DOS Games</span>
  `;
  
  iconDiv.addEventListener('click', () => {
    // Open DOS Games page or launch the DOS Games app
    if (window.dosGameLauncher) {
      window.dosGameLauncher.init('game-container');
    } else {
      window.location.href = '/pages/games.html';
    }
  });
  
  desktopIcons.appendChild(iconDiv);
}

// Call this function when initializing the desktop
document.addEventListener('DOMContentLoaded', () => {
  // Your existing initialization code
  
  // Add DOS Games icon
  addDosGamesIcon();
});