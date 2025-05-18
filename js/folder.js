document.addEventListener("DOMContentLoaded", () => {
  const folderWindow = document.querySelector(".folder-window");
  const folderName = folderWindow.dataset.folderName || "Folder";
  folderWindow.querySelector(".window-header").textContent = "📁 " + folderName;

  const folderContent = document.getElementById("folder-content");

  function makeDraggable(icon) {
    icon.setAttribute("draggable", "true");
    icon.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", icon.id);
    });
  }

  function enableDropZone(container) {
    container.addEventListener("dragover", (e) => e.preventDefault());
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const icon = document.getElementById(id);
      if (icon && container !== icon.parentElement) {
        container.appendChild(icon);
      }
    });
  }

  enableDropZone(folderContent);
});
