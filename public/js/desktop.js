
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Vaporwave cursor initializing...");

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  cursor.appendChild(dot);
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.style.transform = 'translate(-50%, -50%)';
  });

  document.addEventListener('click', () => {
    dot.classList.add('cursor-click');
    setTimeout(() => dot.classList.remove('cursor-click'), 300);
  });

  console.log("✨ Vaporwave cursor ready!");
});
