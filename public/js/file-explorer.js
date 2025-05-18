// File Explorer System
// A retro-styled file explorer simulation for F1LL3R'S R4D W385173

// File Explorer Namespace
// File Explorer System - Simplified version
;(() => {
  // Wait for DOM to be fully loaded
  window.addEventListener("load", () => {
    // Check if we should initialize the file explorer
    if (document.getElementById("file-explorer")) {
      initFileExplorer()
    }
  })

  // File system structure
  var fileSystem = {
    "C:": {
      type: "drive",
      children: {
        Documents: {
          type: "folder",
          children: {
            "README.txt": {
              type: "file",
              content:
                "Welcome to F1LL3R's R4D W385173!\n\nThis is a cyberpunk-themed desktop simulation with various interactive elements.",
              icon: "file",
            },
            "Projects.txt": {
              type: "file",
              content: "Current Projects:\n- Experimental Documentary\n- Narrative Design\n- Game Worlds & Story Maps",
              icon: "file",
            },
          },
        },
        Media: {
          type: "folder",
          children: {
            Images: {
              type: "folder",
              children: {
                "profile.png": {
                  type: "file",
                  content: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/Benny.png?v=1746392528967",
                  icon: "image",
                },
              },
            },
            Videos: {
              type: "folder",
              children: {},
            },
            Music: {
              type: "folder",
              children: {},
            },
          },
        },
        Games: {
          type: "folder",
          children: {
            "Spaceworm.txt": {
              type: "file",
              content: "Spaceworm is a trippy version of the classic Snake game with psychedelic visuals and effects.",
              icon: "file",
            },
          },
        },
      },
    },
  }

  // Current path and selected items
  var currentPath = ["C:"]
  var selectedItems = []

  // Initialize the file explorer
  function initFileExplorer() {
    // Add file explorer CSS
    var link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "css/file-explorer.css"
    document.head.appendChild(link)

    // Get the file explorer element
    var explorerElement = document.querySelector("#file-explorer .window-content")

    if (!explorerElement) {
      console.error("File explorer window content element not found")
      return
    }

    // Create the file explorer UI
    explorerElement.innerHTML = `
      <div class="file-explorer-toolbar">
        <button id="back-button">◀ Back</button>
        <button id="up-button">▲ Up</button>
        <button id="new-folder-button">New Folder</button>
        <button id="new-file-button">New File</button>
        <input type="text" class="file-explorer-path" id="path-input" readonly>
      </div>
      <div class="file-explorer-container">
        <div class="file-explorer-sidebar">
          <div class="file-explorer-sidebar-item" data-path="C:">
            <div class="file-explorer-sidebar-item-icon">💾</div>
            <div>C: Drive</div>
          </div>
          <div class="file-explorer-sidebar-item" data-path="C:/Documents">
            <div class="file-explorer-sidebar-item-icon">📁</div>
            <div>Documents</div>
          </div>
          <div class="file-explorer-sidebar-item" data-path="C:/Media">
            <div class="file-explorer-sidebar-item-icon">📁</div>
            <div>Media</div>
          </div>
          <div class="file-explorer-sidebar-item" data-path="C:/Games">
            <div class="file-explorer-sidebar-item-icon">📁</div>
            <div>Games</div>
          </div>
        </div>
        <div class="file-explorer-main">
          <div class="file-explorer-items" id="items-container"></div>
        </div>
      </div>
      <div class="file-explorer-status">0 items</div>
    `

    // Add event listeners
    document.getElementById("back-button").addEventListener("click", () => {
      alert("Back functionality not implemented yet")
    })

    document.getElementById("up-button").addEventListener("click", () => {
      if (currentPath.length > 1) {
        currentPath.pop()
        navigateTo(currentPath)
      }
    })

    document.getElementById("new-folder-button").addEventListener("click", createNewFolder)
    document.getElementById("new-file-button").addEventListener("click", createNewFile)

    // Add event listeners for sidebar items
    var sidebarItems = document.querySelectorAll(".file-explorer-sidebar-item")
    sidebarItems.forEach((item) => {
      item.addEventListener("click", function () {
        var path = this.getAttribute("data-path").split("/")
        navigateTo(path)
      })
    })

    // Load the initial path
    navigateTo(currentPath)

    // Load from localStorage if available
    loadFileSystem()
  }

  // Navigate to a path
  function navigateTo(path) {
    currentPath = path

    // Update path input
    var pathInput = document.getElementById("path-input")
    pathInput.value = path.join("/")

    // Get current folder
    var currentFolder = getItemAtPath(path)

    // If not a folder, navigate to parent
    if (!currentFolder || (currentFolder.type !== "folder" && currentFolder.type !== "drive")) {
      currentPath.pop()
      currentFolder = getItemAtPath(currentPath)
    }

    // Clear selection
    selectedItems = []

    // Update items container
    var itemsContainer = document.getElementById("items-container")
    itemsContainer.innerHTML = ""

    // Add items
    if (currentFolder && (currentFolder.type === "folder" || currentFolder.type === "drive")) {
      var children = currentFolder.children

      // Sort items (folders first, then files)
      var sortedItems = Object.keys(children).sort((a, b) => {
        var itemA = children[a]
        var itemB = children[b]

        if (itemA.type === "folder" && itemB.type !== "folder") {
          return -1
        } else if (itemA.type !== "folder" && itemB.type === "folder") {
          return 1
        } else {
          return a.localeCompare(b)
        }
      })

      // Add items to container
      sortedItems.forEach((itemName) => {
        var item = children[itemName]

        var iconClass = "file-icon"
        var iconSymbol = "📄"

        if (item.type === "folder") {
          iconClass = "folder-icon"
          iconSymbol = "📁"
        } else if (item.icon === "image") {
          iconClass = "image-icon"
          iconSymbol = "🖼️"
        } else if (item.icon === "audio") {
          iconClass = "audio-icon"
          iconSymbol = "🎵"
        } else if (item.icon === "video") {
          iconClass = "video-icon"
          iconSymbol = "🎬"
        }

        var itemElement = document.createElement("div")
        itemElement.className = "file-explorer-item"
        itemElement.setAttribute("data-name", itemName)
        itemElement.setAttribute("data-type", item.type)
        itemElement.innerHTML = `
          <div class="file-explorer-item-icon ${iconClass}">${iconSymbol}</div>
          <div class="file-explorer-item-name">${itemName}</div>
        `

        // Add event listeners
        itemElement.addEventListener("click", function (e) {
          // If Ctrl key is pressed, toggle selection
          if (e.ctrlKey) {
            toggleItemSelection(this)
          } else {
            // Otherwise, clear selection and select this item
            clearSelection()
            selectItem(this)
          }
        })

        itemElement.addEventListener("dblclick", () => {
          openItem(itemName)
        })

        itemsContainer.appendChild(itemElement)
      })
    }

    // Update status
    updateStatus()

    // Highlight active sidebar item
    var sidebarItems = document.querySelectorAll(".file-explorer-sidebar-item")
    sidebarItems.forEach((item) => {
      var itemPath = item.getAttribute("data-path")
      if (itemPath === currentPath.join("/")) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })

    // Save file system
    saveFileSystem()
  }

  // Open an item
  function openItem(itemName) {
    var newPath = currentPath.slice()
    newPath.push(itemName)
    var item = getItemAtPath(newPath)

    if (item) {
      if (item.type === "folder" || item.type === "drive") {
        // Navigate to folder
        navigateTo(newPath)
      } else {
        // Open file
        openFile(item, itemName)
      }
    }
  }

  // Open a file
  function openFile(file, fileName) {
    // Check file extension
    var extension = fileName.split(".").pop().toLowerCase()

    if (extension === "txt") {
      // Open text file in a dialog
      showTextFileDialog(fileName, file.content)
    } else if (file.icon === "image") {
      // Open image file
      showImageDialog(fileName, file.content)
    } else {
      // Default file handling
      alert("Opening file: " + fileName)
    }
  }

  // Show text file dialog
  function showTextFileDialog(fileName, content) {
    var dialog = document.createElement("div")
    dialog.className = "dialog-overlay"
    dialog.innerHTML = `
      <div class="dialog">
        <div class="dialog-title">${fileName}</div>
        <div class="dialog-content">
          <textarea class="dialog-input" style="height: 200px; resize: none;" readonly>${content}</textarea>
        </div>
        <div class="dialog-buttons">
          <button class="dialog-button" id="close-dialog">Close</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    // Add event listener for close button
    document.getElementById("close-dialog").addEventListener("click", () => {
      document.body.removeChild(dialog)
    })
  }

  // Show image dialog
  function showImageDialog(fileName, url) {
    var dialog = document.createElement("div")
    dialog.className = "dialog-overlay"
    dialog.innerHTML = `
      <div class="dialog" style="width: auto; max-width: 80vw;">
        <div class="dialog-title">${fileName}</div>
        <div class="dialog-content" style="text-align: center;">
          <img src="${url}" style="max-width: 100%; max-height: 60vh;" alt="${fileName}">
        </div>
        <div class="dialog-buttons">
          <button class="dialog-button" id="close-dialog">Close</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    // Add event listener for close button
    document.getElementById("close-dialog").addEventListener("click", () => {
      document.body.removeChild(dialog)
    })
  }

  // Create a new folder
  function createNewFolder() {
    var dialog = document.createElement("div")
    dialog.className = "dialog-overlay"
    dialog.innerHTML = `
      <div class="dialog">
        <div class="dialog-title">Create New Folder</div>
        <div class="dialog-content">
          <input type="text" class="dialog-input" id="folder-name-input" placeholder="Folder Name">
        </div>
        <div class="dialog-buttons">
          <button class="dialog-button" id="cancel-dialog">Cancel</button>
          <button class="dialog-button" id="create-folder">Create</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    // Focus input
    var input = document.getElementById("folder-name-input")
    input.focus()

    // Add event listeners
    document.getElementById("cancel-dialog").addEventListener("click", () => {
      document.body.removeChild(dialog)
    })

    document.getElementById("create-folder").addEventListener("click", () => {
      var folderName = input.value.trim()

      if (folderName) {
        // Create folder
        createFolder(folderName)
        document.body.removeChild(dialog)
      } else {
        alert("Please enter a folder name")
      }
    })

    // Add event listener for Enter key
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("create-folder").click()
      }
    })
  }

  // Create a new file
  function createNewFile() {
    var dialog = document.createElement("div")
    dialog.className = "dialog-overlay"
    dialog.innerHTML = `
      <div class="dialog">
        <div class="dialog-title">Create New File</div>
        <div class="dialog-content">
          <input type="text" class="dialog-input" id="file-name-input" placeholder="File Name">
          <textarea class="dialog-input" id="file-content-input" placeholder="File Content" style="height: 150px; resize: none;"></textarea>
        </div>
        <div class="dialog-buttons">
          <button class="dialog-button" id="cancel-dialog">Cancel</button>
          <button class="dialog-button" id="create-file">Create</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    // Focus input
    var input = document.getElementById("file-name-input")
    input.focus()

    // Add event listeners
    document.getElementById("cancel-dialog").addEventListener("click", () => {
      document.body.removeChild(dialog)
    })

    document.getElementById("create-file").addEventListener("click", () => {
      var fileName = input.value.trim()
      var fileContent = document.getElementById("file-content-input").value

      if (fileName) {
        // Create file
        createFile(fileName, fileContent)
        document.body.removeChild(dialog)
      } else {
        alert("Please enter a file name")
      }
    })

    // Add event listener for Enter key
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("file-content-input").focus()
      }
    })
  }

  // Create a folder
  function createFolder(folderName) {
    // Get current folder
    var currentFolder = getItemAtPath(currentPath)

    // Check if folder already exists
    if (currentFolder.children[folderName]) {
      alert('A folder or file with the name "' + folderName + '" already exists')
      return
    }

    // Create folder
    currentFolder.children[folderName] = {
      type: "folder",
      children: {},
    }

    // Refresh explorer
    navigateTo(currentPath)
  }

  // Create a file
  function createFile(fileName, fileContent) {
    // Get current folder
    var currentFolder = getItemAtPath(currentPath)

    // Check if file already exists
    if (currentFolder.children[fileName]) {
      alert('A folder or file with the name "' + fileName + '" already exists')
      return
    }

    // Determine file icon based on extension
    var fileIcon = "file"
    var extension = fileName.split(".").pop().toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) {
      fileIcon = "image"
    } else if (["mp3", "wav", "ogg"].includes(extension)) {
      fileIcon = "audio"
    } else if (["mp4", "webm", "avi", "mov"].includes(extension)) {
      fileIcon = "video"
    }

    // Create file
    currentFolder.children[fileName] = {
      type: "file",
      content: fileContent,
      icon: fileIcon,
    }

    // Refresh explorer
    navigateTo(currentPath)
  }

  // Select an item
  function selectItem(itemElement) {
    itemElement.classList.add("selected")
    selectedItems.push(itemElement.getAttribute("data-name"))
    updateStatus()
  }

  // Toggle item selection
  function toggleItemSelection(itemElement) {
    var itemName = itemElement.getAttribute("data-name")

    if (itemElement.classList.contains("selected")) {
      // Deselect
      itemElement.classList.remove("selected")
      selectedItems = selectedItems.filter((name) => name !== itemName)
    } else {
      // Select
      itemElement.classList.add("selected")
      selectedItems.push(itemName)
    }

    updateStatus()
  }

  // Clear selection
  function clearSelection() {
    var selectedElements = document.querySelectorAll(".file-explorer-item.selected")
    selectedElements.forEach((element) => {
      element.classList.remove("selected")
    })

    selectedItems = []
    updateStatus()
  }

  // Update status bar
  function updateStatus() {
    var statusBar = document.querySelector(".file-explorer-status")
    var itemCount = document.querySelectorAll(".file-explorer-item").length
    var selectedCount = selectedItems.length

    if (selectedCount === 0) {
      statusBar.textContent = itemCount + " item" + (itemCount !== 1 ? "s" : "")
    } else {
      statusBar.textContent = selectedCount + " of " + itemCount + " item" + (itemCount !== 1 ? "s" : "") + " selected"
    }
  }

  // Get item at path
  function getItemAtPath(path) {
    var current = fileSystem

    for (var i = 0; i < path.length; i++) {
      var segment = path[i]

      if (current[segment]) {
        current = current[segment]
      } else if (current.children && current.children[segment]) {
        current = current.children[segment]
      } else {
        return null
      }
    }

    return current
  }

  // Save file system to localStorage
  function saveFileSystem() {
    try {
      localStorage.setItem("fileSystem", JSON.stringify(fileSystem))
    } catch (e) {
      console.error("Error saving file system:", e)
    }
  }

  // Load file system from localStorage
  function loadFileSystem() {
    try {
      var savedFileSystem = localStorage.getItem("fileSystem")

      if (savedFileSystem) {
        fileSystem = JSON.parse(savedFileSystem)
      }
    } catch (e) {
      console.error("Error loading file system:", e)
    }
  }
})()
