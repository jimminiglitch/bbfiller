// Declare variables
let animationEffects = document.getElementById('animationEffects'); // Or however you are getting this element
let animationType = 'none'; // Default value, can be changed by user input
let matrixRainDrops = [];
let previewArea = document.getElementById('previewArea'); // Or however you are getting this element
let animationSpeed = 1; // Default value, can be changed by user input
let animationFrameId = null;
let coloredAsciiArt = [];
let charSet = 'standard';
let charSets = {
  standard: " .,:;i1tfLCG08",
  complex: "@%#*+=-:. ",
  blocks: " ░▒▓█",
  numbers: "0123456789",
  binary: "01",
  hex: "0123456789ABCDEF"
};
let rainbowMode = false;
let imageLoaded = false;
let outputCanvas = document.getElementById('outputCanvas');
let hiddenCanvas = document.createElement('canvas');
let videoElement = null;
let videoSource = null;
let videoPlaying = false;
let videoLooping = true;
let videoFrameRate = 30;
let videoPlaybackControls = document.getElementById('videoPlaybackControls');
let playIcon = document.getElementById('playIcon');
let pauseIcon = document.getElementById('pauseIcon');
let videoProgressBar = document.getElementById('videoProgressBar');
let videoProgress = document.getElementById('videoProgress');
let videoTime = document.getElementById('videoTime');
let webcamActive = false;
let webcamStream = null;
let webcamButton = document.getElementById('webcamButton');

// Animation effects
function updateAnimationEffects() {
  // Clear existing animation effects
  animationEffects.innerHTML = '';
  
  // Remove all effect classes
  animationEffects.classList.remove('glitch-effect', 'shake-effect', 'pulse-effect');
  
  // Apply the selected animation effect
  switch (animationType) {
    case 'matrix':
      createMatrixRainEffect();
      break;
    case 'glitch':
      animationEffects.classList.add('glitch-effect', 'active');
      break;
    case 'pulse':
      animationEffects.classList.add('pulse-effect', 'active');
      break;
    case 'shake':
      animationEffects.classList.add('shake-effect', 'active');
      break;
    case 'scan':
      createScanLineEffect();
      break;
    case 'none':
    default:
      // No effect
      break;
  }
}

function createMatrixRainEffect() {
  // Clear existing drops
  matrixRainDrops = [];
  animationEffects.innerHTML = '';
  
  // Create matrix rain drops
  const numDrops = 50;
  const containerWidth = previewArea.clientWidth;
  const containerHeight = previewArea.clientHeight;
  
  for (let i = 0; i < numDrops; i++) {
    const drop = document.createElement('div');
    drop.className = 'matrix-rain';
    drop.textContent = getRandomMatrixChar();
    drop.style.left = `${Math.random() * containerWidth}px`;
    drop.style.top = `${Math.random() * containerHeight}px`;
    drop.style.animationDuration = `${(Math.random() * 2 + 1) / animationSpeed}s`;
    drop.style.opacity = `${Math.random() * 0.5 + 0.3}`;
    animationEffects.appendChild(drop);
    
    matrixRainDrops.push(drop);
  }
  
  // Start animation loop to continuously update characters
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  const updateMatrixChars = () => {
    matrixRainDrops.forEach(drop => {
      if (Math.random() > 0.9) {
        drop.textContent = getRandomMatrixChar();
      }
    });
    
    animationFrameId = requestAnimationFrame(updateMatrixChars);
  };
  
  updateMatrixChars();
}

function getRandomMatrixChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

function createScanLineEffect() {
  const scanLine = document.createElement('div');
  scanLine.style.position = 'absolute';
  scanLine.style.left = '0';
  scanLine.style.width = '100%';
  scanLine.style.height = '2px';
  scanLine.style.background = 'rgba(137, 255, 241, 0.5)';
  scanLine.style.boxShadow = '0 0 10px rgba(137, 255, 241, 0.7)';
  scanLine.style.zIndex = '5';
  scanLine.style.pointerEvents = 'none';
  
  animationEffects.appendChild(scanLine);
  
  // Start animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  let position = 0;
  const speed = 2 * animationSpeed;
  const height = previewArea.clientHeight;
  
  const updateScanLine = () => {
    position = (position + speed) % (height * 2);
    const y = position < height ? position : height * 2 - position;
    scanLine.style.top = `${y}px`;
    
    animationFrameId = requestAnimationFrame(updateScanLine);
  };
  
  updateScanLine();
}

function startAsciiAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  let frame = 0;
  const animateAscii = () => {
    frame++;
    
    // Modify ASCII characters slightly each frame
    if (coloredAsciiArt.length > 0) {
      const ctx = outputCanvas.getContext('2d');
      if (ctx) {
        // Redraw with slight modifications
        coloredAsciiArt.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            if (Math.random() > 0.99) {
              // Randomly change some characters
              const chars = charSets[charSet];
              const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
              coloredAsciiArt[rowIndex][colIndex].char = randomChar;
            }
            
            if (rainbowMode) {
              // Animate colors in rainbow mode
              const hue = (colIndex / row.length + rowIndex / coloredAsciiArt.length + frame * 0.01) * 360 % 360;
              coloredAsciiArt[rowIndex][colIndex].color = `hsl(${hue}, 100%, 70%)`;
            }
          });
        });
        
        renderToCanvas();
      }
    }
    
    animationFrameId = requestAnimationFrame(animateAscii);
  };
  
  animateAscii();
}

function stopAsciiAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Restore original ASCII art
  if (imageLoaded) {
    convertToAscii();
  }
}

// Video processing
function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please upload an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      loadImage(e.target.result);
    }
  };
  reader.onerror = () => {
    showError('Failed to read file');
  };
  reader.readAsDataURL(file);
}

function handleVideoUpload(file) {
  if (!file.type.startsWith('video/')) {
    showError('Please upload a video file');
    return;
  }
  
  const url = URL.createObjectURL(file);
  setupVideoProcessing(url);
}

function setupVideoProcessing(videoUrl) {
  // Stop any existing video
  stopVideoProcessing();
  
  // Create video element
  const video = document.createElement('video');
  video.src = videoUrl;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.loop = videoLooping;
  
  // Create video container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-container';
  videoContainer.id = 'videoContainer';
  
  // Add video to container
  videoContainer.appendChild(video);
  
  // Add to preview area
  previewArea.appendChild(videoContainer);
  
  // Set up video events
  video.addEventListener('loadedmetadata', () => {
    videoElement = video;
    videoSource = videoUrl;
    
    // Show video controls
    videoPlaybackControls.style.display = 'block';
    
    // Update video time display
    updateVideoTimeDisplay();
    
    // Start video processing
    startVideoProcessing();
  });
  
  video.addEventListener('error', () => {
    showError('Failed to load video');
    stopVideoProcessing();
  });
  
  // Load the video
  video.load();
}

function startVideoProcessing() {
  if (!videoElement) return;
  
  // Play the video
  videoElement.play()
    .then(() => {
      videoPlaying = true;
      updatePlayPauseButton();
      
      // Start processing frames
      processVideoFrames();
    })
    .catch(error => {
      console.error('Error playing video:', error);
      showError('Failed to play video. Check autoplay permissions.');
    });
}

function stopVideoProcessing() {
  if (videoElement) {
    videoElement.pause();
    videoElement.src = '';
    videoElement = null;
  }
  
  const videoContainer = document.getElementById('videoContainer');
  if (videoContainer) {
    videoContainer.remove();
  }
  
  videoPlaying = false;
  videoSource = null;
  videoPlaybackControls.style.display = 'none';
  updatePlayPauseButton();
  
  // Cancel any pending animation frames
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function processVideoFrames() {
  if (!videoElement || !videoPlaying) return;
  
  // Process current frame
  const canvas = hiddenCanvas;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Set canvas dimensions to match the video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Apply filters
    applyImageFilters();
    
    // Convert to ASCII
    convertToAscii();
    
    // Update video progress
    updateVideoProgress();
  }
  
  // Schedule next frame
  setTimeout(() => {
    if (videoPlaying) {
      animationFrameId = requestAnimationFrame(processVideoFrames);
    }
  }, 1000 / videoFrameRate);
}

function toggleVideoPlayback() {
  if (!videoElement) return;
  
  if (videoPlaying) {
    videoElement.pause();
    videoPlaying = false;
  } else {
    videoElement.play();
    videoPlaying = true;
    processVideoFrames();
  }
  
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
  if (videoPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function updateVideoProgress() {
  if (!videoElement) return;
  
  const progress = videoElement.currentTime / videoElement.duration;
  videoProgressBar.style.width = `${progress * 100}%`;
  
  updateVideoTimeDisplay();
}

function updateVideoTimeDisplay() {
  if (!videoElement) return;
  
  const currentTime = formatTime(videoElement.currentTime);
  const duration = formatTime(videoElement.duration);
  videoTime.textContent = `${currentTime}/${duration}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function seekVideo(e) {
  if (!videoElement) return;
  
  const rect = videoProgress.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  
  videoElement.currentTime = pos * videoElement.duration;
  updateVideoProgress();
}

// Webcam functions
function toggleWebcam() {
  if (webcamActive) {
    stopWebcam();
  } else {
    startWebcam();
  }
}

function startWebcam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        webcamStream = stream;
        webcamActive = true;
        
        // Create webcam container
        const webcamContainer = document.createElement('div');
        webcamContainer.className = 'webcam-container';
        webcamContainer.id = 'webcamContainer';
        
        // Create video element
        videoElement = document.createElement('video');
        videoElement.className = 'webcam-video';
        videoElement.autoplay = true;
        videoElement.srcObject = stream;
        webcamContainer.appendChild(videoElement);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'webcam-overlay';
        webcamContainer.appendChild(overlay);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'webcam-controls';
        
        const captureButton = document.createElement('button');
        captureButton.className = 'button button-capture';
        captureButton.innerHTML = `
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Capture</span>
        `;
        captureButton.addEventListener('click', captureWebcam);
        controls.appendChild(captureButton);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'button';
        closeButton.innerHTML = `
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Close</span>
        `;
        closeButton.addEventListener('click', stopWebcam);
        controls.appendChild(closeButton);
        
        webcamContainer.appendChild(controls);
        
        // Add to preview area
        previewArea.appendChild(webcamContainer);
        
        // Update button state
        webcamButton.classList.add('active');
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
        showError('Could not access webcam. Please check permissions.');
        webcamActive = false;
      });
  } else {
    showError('Your browser does not support webcam access');
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
  
  const webcamContainer = document.getElementById('webcamContainer');
  if (webcamContainer) {
    webcamContainer.remove();
  }
  
  webcamActive = false;
  webcamButton.classList.remove('active');
}

function captureWebcam() {
  if (!videoElement || !webcamActive) return;
  
  // Create a temporary canvas to capture the frame
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return;
  
  // Draw the current video frame
  ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // Convert to image and process
  try {
    const imageDataUrl = tempCanvas.toDataURL('image/png');
    loadImage(imageDataUrl);
    stopWebcam();
  } catch (error) {
    console.error('Error capturing webcam:', error);
    showError('Failed to capture image from webcam');
  }
}

// Load the next script file
loadScript('ascii-part5.js');

// Declare variables
let imageLoaded = false;
let currentImage = null;
let loading = false;

// Declare missing variables
let loadingMessage = document.getElementById('loading-message'); // Assuming an element with this ID exists
let outputCanvas = document.getElementById('output-canvas'); // Assuming an element with this ID exists
let error = null;
let errorText = document.getElementById('error-text'); // Assuming an element with this ID exists
let errorDisplay = document.getElementById('error-display'); // Assuming an element with this ID exists

// Declare undeclared variables
let copyButton = document.getElementById('copy-button'); // Assuming an element with this ID exists
let downloadTextButton = document.getElementById('download-text-button'); // Assuming an element with this ID exists
let downloadImageButton = document.getElementById('download-image-button'); // Assuming an element with this ID exists
let toast = document.getElementById('toast'); // Assuming an element with this ID exists
let tabs = document.querySelectorAll('.tab-button'); // Assuming elements with this class exist

// Image loading and processing
function loadDefaultImage() {
  showLoading();
  hideError();
  
  // Default image URL
  const defaultImageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CleanShot%202025-04-21%20at%2007.18.50%402x-dZYTCjkP7AhQCvCtNcNHt4amOQSwtX.png';
  loadImage(defaultImageUrl);
}

function loadImage(src) {
  showLoading();
  hideError();
  imageLoaded = false;
  
  // Stop any video playback
  stopVideoProcessing();
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    if (img.width === 0 || img.height === 0) {
      showError('Invalid image dimensions');
      hideLoading();
      return;
    }
    
    currentImage = img;
    imageLoaded = true;
    hideLoading();
    
    // Initialize filter previews if this is the first image
    updateFilterPreviews();
    
    // Apply filters and convert to ASCII
    applyImageFilters();
    convertToAscii();
    enableButtons();
    
    // Update share link
    updateShareLink();
  };
  
  img.onerror = () => {
    showError('Failed to load image');
    hideLoading();
  };
  
  img.src = src;
}

// UI state functions
function showLoading() {
  loading = true;
  loadingMessage.style.display = 'block';
  outputCanvas.style.display = 'none';
}

function hideLoading() {
  loading = false;
  loadingMessage.style.display = 'none';
  outputCanvas.style.display = 'block';
}

function showError(message) {
  error = message;
  errorText.textContent = message;
  errorDisplay.style.display = 'block';
  outputCanvas.style.display = 'none';
}

function hideError() {
  error = null;
  errorDisplay.style.display = 'none';
}

function enableButtons() {
  copyButton.disabled = false;
  downloadTextButton.disabled = false;
  downloadImageButton.disabled = false;
}

function disableButtons() {
  copyButton.disabled = true;
  downloadTextButton.disabled = true;
  downloadImageButton.disabled = true;
}

function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Tab functions
function setActiveTab(tabId) {
  // Update tab buttons
  tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update tab content
  tabContents.forEach(content => {
    if (content.id === `${tabId}-tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Accordion functions
function toggleAccordion() {
  advancedFiltersAccordion.classList.toggle('active');
}

// Filter functions
function initFilterPreviews() {
  // We'll update these when an image is loaded
  document.querySelectorAll('.filter-option img').forEach(img => {
    img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 1 1%22%3E%3C%2Fsvg%3E';
  });
}

function updateFilterPreviews() {
  if (!currentImage) return;
  
  // Create a small version of the image for previews
  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  const previewSize = 60;
  
  // Calculate aspect ratio
  const aspectRatio = currentImage.width / currentImage.height;
  let previewWidth, previewHeight;
  
  if (aspectRatio > 1) {
    previewWidth = previewSize;
    previewHeight = previewSize / aspectRatio;
  } else {
    previewHeight = previewSize;
    previewWidth = previewSize * aspectRatio;
  }
  
  previewCanvas.width = previewWidth;
  previewCanvas.height = previewHeight;
  
  // Draw the image
  previewCtx.drawImage(currentImage, 0, 0, previewWidth, previewHeight);
  
  // Create filter previews
  Object.keys(imageFilterPresets).forEach(filterName => {
    const filterImg = document.getElementById(`filter${filterName.charAt(0).toUpperCase() + filterName.slice(1)}`);
    if (!filterImg) return;
    
    const filterCanvas = document.createElement('canvas');
    filterCanvas.width = previewWidth;
    filterCanvas.height = previewHeight;
    const filterCtx = filterCanvas.getContext('2d');
    
    // Apply filter
    filterCtx.drawImage(previewCanvas, 0, 0);
    const imageData = filterCtx.getImageData(0, 0, previewWidth, previewHeight);
    const filterSettings = imageFilterPresets[filterName];
    
    applyFiltersToImageData(imageData, filterSettings, 1.0);
    
    filterCtx.putImageData(imageData, 0, 0);
    filterImg.src = filterCanvas.toDataURL();
  });
}

function setImageFilter(filter) {
  currentFilter = filter;
  
  // Update filter sliders
  const filterSettings = imageFilterPresets[filter];
  if (filterSettings) {
    brightnessSlider.value = filterSettings.brightness;
    brightnessValue.textContent = filterSettings.brightness.toFixed(1);
    
    contrastSlider.value = filterSettings.contrast;
    contrastValue.textContent = filterSettings.contrast.toFixed(1);
    
    saturationSlider.value = filterSettings.saturation;
    saturationValue.textContent = filterSettings.saturation.toFixed(1);
    
    blurSlider.value = filterSettings.blur;
    blurValue.textContent = filterSettings.blur.toFixed(1);
    
    // Update image filters object
    imageFilters = { ...filterSettings };
  }
  
  if (imageLoaded) {
    applyImageFilters();
    convertToAscii();
  }
}

function applyImageFilters() {
  if (!currentImage) return;
  
  const canvas = hiddenCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions to match the image
  canvas.width = currentImage.width;
  canvas.height = currentImage.height;
  
  // Draw the original image
  ctx.drawImage(currentImage, 0, 0);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Apply filters
  applyFiltersToImageData(imageData, imageFilters, filterIntensity);
  
  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);
}

function applyFiltersToImageData(imageData, filters, intensity) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Convert to HSL for easier manipulation
    const hsl = rgbToHsl(r, g, b);
    let h = hsl[0];
    let s = hsl[1];
    let l = hsl[2];
    
    // Apply brightness
    l *= filters.brightness * intensity + (1 - intensity);
    
    // Apply contrast
    if (filters.contrast !== 1) {
      const contrastFactor = (filters.contrast - 1) * intensity + 1;
      l = (l - 0.5) * contrastFactor + 0.5;
    }
    
    // Apply saturation
    if (filters.saturation !== 1) {
      const saturationFactor = (filters.saturation - 1) * intensity + 1;
      s *= saturationFactor;
    }
    
    // Convert back to RGB
    const rgb = hslToRgb(h, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l)));
    
    // Apply blur in a separate pass if needed
    
    // Update pixel data
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
  }
  
  // Apply blur if needed (simplified version)
  if (filters.blur > 0) {
    // This is a very simple blur implementation
    // A real implementation would use a proper convolution kernel
    const blurAmount = filters.blur * intensity;
    if (blurAmount > 0) {
      const tempData = new Uint8ClampedArray(data);
      const width = imageData.width;
      const height = imageData.height;
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const pixelIndex = (y * width + x) * 4;
          
          // Simple 3x3 box blur
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const neighborIndex = ((y + dy) * width + (x + dx)) * 4 + c;
                sum += tempData[neighborIndex];
              }
            }
            data[pixelIndex + c] = Math.round(sum / 9);
          }
        }
      }
    }
  }
}

// Color conversion utilities
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ASCII conversion
function convertToAscii() {
  try {
    if (!hiddenCanvas) {
      throw new Error('Canvas not available');
    }
    
    const canvas = hiddenCanvas;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Get image data
    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      throw new Error('Failed to get image data. This might be a CORS issue.');
    }
    
    const data = imageData.data;
    
    // Choose character set
    const chars = charSets[charSet];
    
    // Calculate dimensions based on resolution
    const width = Math.floor(canvas.width * resolution);
    const height = Math.floor(canvas.height * resolution);
    
    // Calculate aspect ratio correction for monospace font
    const fontAspect = 0.5; // Width/height ratio of monospace font characters
    const widthStep = Math.ceil(canvas.width / width);
    const heightStep = Math.ceil(canvas.height / height / fontAspect);
    
    let result = '';
    const coloredResult = [];
    
    // Process the image
    for (let y = 0; y < canvas.height; y += heightStep) {
      const coloredRow = [];
      
      for (let x = 0; x < canvas.width; x += widthStep) {
        const pos = (y * canvas.width + x) * 4;
        
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        
        // Calculate brightness based on grayscale setting
        let brightness;
        if (grayscale) {
          // Standard grayscale calculation
          brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        } else {
          // Color-aware brightness (perceived luminance)
          brightness = Math.sqrt(
            0.299 * (r / 255) * (r / 255) + 
            0.587 * (g / 255) * (g / 255) + 
            0.114 * (b / 255) * (b / 255)
          );
        }
        
        // Invert if needed
        if (inverted) brightness = 1 - brightness;
        
        // Map brightness to character
        const charIndex = Math.floor(brightness * (chars.length - 1));
        const char = chars[charIndex];
        
        result += char;
        
        // For colored mode, store the character and its color
        if (!grayscale) {
          // Adjust color brightness based on the character density
          const brightnessFactor = (charIndex / (chars.length - 1)) * 1.5 + 0.5;
          const color = adjustColorBrightness(r, g, b, brightnessFactor);
          coloredRow.push({ char, color });
        } else {
          // For grayscale mode with rainbow effect
          let color;
          if (rainbowMode) {
            // Generate rainbow color based on position
            const hue = (x / canvas.width + y / canvas.height) * 360;
            color = `hsl(${hue}, 100%, ${50 + brightness * 30}%)`;
          } else {
            // Use theme colors for grayscale mode
            const theme = colorThemes[currentTheme];
            color = getGradientColor(theme.primary, theme.secondary, brightness);
          }
          coloredRow.push({ char, color });
        }
      }
      
      result += '\n';
      coloredResult.push(coloredRow);
    }
    
    asciiArt = result;
    coloredAsciiArt = coloredResult;
    hideError();
    renderToCanvas();
  } catch (err) {
    console.error('Error converting to ASCII:', err);
    showError(err instanceof Error ? err.message : 'Unknown error occurred');
    asciiArt = '';
    coloredAsciiArt = [];
    disableButtons();
  }
}

// Helper function to adjust color brightness
function adjustColorBrightness(r, g, b, factor) {
  // Ensure the colors are visible against black background
  const minBrightness = 40; // Minimum brightness to ensure visibility
  r = Math.max(Math.min(Math.round(r * factor), 255), minBrightness);
  g = Math.max(Math.min(Math.round(g * factor), 255), minBrightness);
  b = Math.max(Math.min(Math.round(b * factor), 255), minBrightness);
  return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to get gradient color
function getGradientColor(color1, color2, ratio) {
  // Convert hex to RGB
  const parseColor = (hexStr) => {
    if (hexStr.startsWith('#')) {
      const r = parseInt(hexStr.slice(1, 3), 16);
      const g = parseInt(hexStr.slice(3, 5), 16);
      const b = parseInt(hexStr.slice(5, 7), 16);
      return [r, g, b];
    }
    return [255, 255, 255]; // Default to white
  };
  
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  
  const r = Math.round(c1[0] * (1 - ratio) + c2[0] * ratio);
  const g = Math.round(c1[1] * (1 - ratio) + c2[1] * ratio);
  const b = Math.round(c1[2] * (1 - ratio) + c2[2] * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Render ASCII art to canvas
function renderToCanvas() {
  if (!outputCanvas || !asciiArt || coloredAsciiArt.length === 0) return;
  
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return;
  
  // Clear the canvas
  ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  
  // Set font properties to match the DOM rendering
  const fontSize = 8; // Base font size in pixels
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';
  
  // Calculate dimensions
  const lineHeight = fontSize;
  const charWidth = fontSize * 0.6; // Approximate width of monospace character
  
  // Resize canvas to fit the ASCII art
  const lines = asciiArt.split('\n');
  const maxLineLength = Math.max(...lines.map(line => line.length));
  outputCanvas.width = maxLineLength * charWidth;
  outputCanvas.height = lines.length * lineHeight;
  
  // Re-apply font after canvas resize
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';
  
  // Add a background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  
  // Render the ASCII art
  coloredAsciiArt.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      ctx.fillStyle = col.color;
      
      // Add glow effect
      ctx.shadowColor = col.color;
      ctx.shadowBlur = 2;
      
      ctx.fillText(col.char, colIndex * charWidth, rowIndex * lineHeight);
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });
  });
}

// Button actions
function copyAsciiArt() {
  if (!asciiArt) {
    showError('No ASCII art to copy');
    return;
  }
  
  // Create a temporary textarea element to copy the text
  const el = document.createElement('textarea');
  el.value = asciiArt;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  
  showToast('ASCII art copied to clipboard!');
}

function downloadAsciiArt() {
  if (!asciiArt) {
    showError('No ASCII art to download');
    return;
  }
  
  const element = document.createElement('a');
  const file = new Blob([asciiArt], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'ascii-art.txt';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function downloadAsImage() {
  if (!outputCanvas) {
    showError('No ASCII art to download');
    return;
  }
  
  // Create a new canvas with padding and background
  const padding = 20;
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = outputCanvas.width + padding * 2;
  exportCanvas.height = outputCanvas.height + padding * 2;
  
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return;
  
  // Draw background
  const theme = colorThemes[currentTheme];
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(137, 255, 241, 0.1)';
  ctx.lineWidth = 0.5;
  
  const gridSize = 10;
  for (let x = 0; x <= exportCanvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, exportCanvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= exportCanvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(exportCanvas.width, y);
    ctx.stroke();
  }
  
  // Draw the ASCII art canvas
  ctx.drawImage(outputCanvas, padding, padding);
  
  // Add a subtle border glow
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 10;
  ctx.strokeRect(padding - 5, padding - 5, outputCanvas.width + 10, outputCanvas.height + 10);
  
  // Add a small watermark
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('ASCII Studio', exportCanvas.width - 80, exportCanvas.height - 10);
  
  // Convert to image and download
  const dataUrl = exportCanvas.toDataURL('image/png');
  const element = document.createElement('a');
  element.href = dataUrl;
  element.download = 'ascii-art.png';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Load the next script file
loadScript('ascii-part4.js');
// Declare variables
let animationEffects = document.getElementById('animationEffects'); // Or however you are getting this element
let animationType = 'none'; // Default value, can be changed by user input
let matrixRainDrops = [];
let previewArea = document.getElementById('previewArea'); // Or however you are getting this element
let animationSpeed = 1; // Default value, can be changed by user input
let animationFrameId = null;
let coloredAsciiArt = [];
let charSet = 'standard';
let charSets = {
  standard: " .,:;i1tfLCG08",
  complex: "@%#*+=-:. ",
  blocks: " ░▒▓█",
  numbers: "0123456789",
  binary: "01",
  hex: "0123456789ABCDEF"
};
let rainbowMode = false;
let imageLoaded = false;
let outputCanvas = document.getElementById('outputCanvas');
let hiddenCanvas = document.createElement('canvas');
let videoElement = null;
let videoSource = null;
let videoPlaying = false;
let videoLooping = true;
let videoFrameRate = 30;
let videoPlaybackControls = document.getElementById('videoPlaybackControls');
let playIcon = document.getElementById('playIcon');
let pauseIcon = document.getElementById('pauseIcon');
let videoProgressBar = document.getElementById('videoProgressBar');
let videoProgress = document.getElementById('videoProgress');
let videoTime = document.getElementById('videoTime');
let webcamActive = false;
let webcamStream = null;
let webcamButton = document.getElementById('webcamButton');

// Declare functions (assuming they are defined in ascii-part5.js or elsewhere)
let renderToCanvas;
let convertToAscii;
let showError;
let loadImage;
let applyImageFilters;

// Animation effects
function updateAnimationEffects() {
  // Clear existing animation effects
  animationEffects.innerHTML = '';
  
  // Remove all effect classes
  animationEffects.classList.remove('glitch-effect', 'shake-effect', 'pulse-effect');
  
  // Apply the selected animation effect
  switch (animationType) {
    case 'matrix':
      createMatrixRainEffect();
      break;
    case 'glitch':
      animationEffects.classList.add('glitch-effect', 'active');
      break;
    case 'pulse':
      animationEffects.classList.add('pulse-effect', 'active');
      break;
    case 'shake':
      animationEffects.classList.add('shake-effect', 'active');
      break;
    case 'scan':
      createScanLineEffect();
      break;
    case 'none':
    default:
      // No effect
      break;
  }
}

function createMatrixRainEffect() {
  // Clear existing drops
  matrixRainDrops = [];
  animationEffects.innerHTML = '';
  
  // Create matrix rain drops
  const numDrops = 50;
  const containerWidth = previewArea.clientWidth;
  const containerHeight = previewArea.clientHeight;
  
  for (let i = 0; i < numDrops; i++) {
    const drop = document.createElement('div');
    drop.className = 'matrix-rain';
    drop.textContent = getRandomMatrixChar();
    drop.style.left = `${Math.random() * containerWidth}px`;
    drop.style.top = `${Math.random() * containerHeight}px`;
    drop.style.animationDuration = `${(Math.random() * 2 + 1) / animationSpeed}s`;
    drop.style.opacity = `${Math.random() * 0.5 + 0.3}`;
    animationEffects.appendChild(drop);
    
    matrixRainDrops.push(drop);
  }
  
  // Start animation loop to continuously update characters
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  const updateMatrixChars = () => {
    matrixRainDrops.forEach(drop => {
      if (Math.random() > 0.9) {
        drop.textContent = getRandomMatrixChar();
      }
    });
    
    animationFrameId = requestAnimationFrame(updateMatrixChars);
  };
  
  updateMatrixChars();
}

function getRandomMatrixChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

function createScanLineEffect() {
  const scanLine = document.createElement('div');
  scanLine.style.position = 'absolute';
  scanLine.style.left = '0';
  scanLine.style.width = '100%';
  scanLine.style.height = '2px';
  scanLine.style.background = 'rgba(137, 255, 241, 0.5)';
  scanLine.style.boxShadow = '0 0 10px rgba(137, 255, 241, 0.7)';
  scanLine.style.zIndex = '5';
  scanLine.style.pointerEvents = 'none';
  
  animationEffects.appendChild(scanLine);
  
  // Start animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  let position = 0;
  const speed = 2 * animationSpeed;
  const height = previewArea.clientHeight;
  
  const updateScanLine = () => {
    position = (position + speed) % (height * 2);
    const y = position < height ? position : height * 2 - position;
    scanLine.style.top = `${y}px`;
    
    animationFrameId = requestAnimationFrame(updateScanLine);
  };
  
  updateScanLine();
}

function startAsciiAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  let frame = 0;
  const animateAscii = () => {
    frame++;
    
    // Modify ASCII characters slightly each frame
    if (coloredAsciiArt.length > 0) {
      const ctx = outputCanvas.getContext('2d');
      if (ctx) {
        // Redraw with slight modifications
        coloredAsciiArt.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            if (Math.random() > 0.99) {
              // Randomly change some characters
              const chars = charSets[charSet];
              const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
              coloredAsciiArt[rowIndex][colIndex].char = randomChar;
            }
            
            if (rainbowMode) {
              // Animate colors in rainbow mode
              const hue = (colIndex / row.length + rowIndex / coloredAsciiArt.length + frame * 0.01) * 360 % 360;
              coloredAsciiArt[rowIndex][colIndex].color = `hsl(${hue}, 100%, 70%)`;
            }
          });
        });
        
        renderToCanvas();
      }
    }
    
    animationFrameId = requestAnimationFrame(animateAscii);
  };
  
  animateAscii();
}

function stopAsciiAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Restore original ASCII art
  if (imageLoaded) {
    convertToAscii();
  }
}

// Video processing
function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please upload an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      loadImage(e.target.result);
    }
  };
  reader.onerror = () => {
    showError('Failed to read file');
  };
  reader.readAsDataURL(file);
}

function handleVideoUpload(file) {
  if (!file.type.startsWith('video/')) {
    showError('Please upload a video file');
    return;
  }
  
  const url = URL.createObjectURL(file);
  setupVideoProcessing(url);
}

function setupVideoProcessing(videoUrl) {
  // Stop any existing video
  stopVideoProcessing();
  
  // Create video element
  const video = document.createElement('video');
  video.src = videoUrl;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.loop = videoLooping;
  
  // Create video container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-container';
  videoContainer.id = 'videoContainer';
  
  // Add video to container
  videoContainer.appendChild(video);
  
  // Add to preview area
  previewArea.appendChild(videoContainer);
  
  // Set up video events
  video.addEventListener('loadedmetadata', () => {
    videoElement = video;
    videoSource = videoUrl;
    
    // Show video controls
    videoPlaybackControls.style.display = 'block';
    
    // Update video time display
    updateVideoTimeDisplay();
    
    // Start video processing
    startVideoProcessing();
  });
  
  video.addEventListener('error', () => {
    showError('Failed to load video');
    stopVideoProcessing();
  });
  
  // Load the video
  video.load();
}

function startVideoProcessing() {
  if (!videoElement) return;
  
  // Play the video
  videoElement.play()
    .then(() => {
      videoPlaying = true;
      updatePlayPauseButton();
      
      // Start processing frames
      processVideoFrames();
    })
    .catch(error => {
      console.error('Error playing video:', error);
      showError('Failed to play video. Check autoplay permissions.');
    });
}

function stopVideoProcessing() {
  if (videoElement) {
    videoElement.pause();
    videoElement.src = '';
    videoElement = null;
  }
  
  const videoContainer = document.getElementById('videoContainer');
  if (videoContainer) {
    videoContainer.remove();
  }
  
  videoPlaying = false;
  videoSource = null;
  videoPlaybackControls.style.display = 'none';
  updatePlayPauseButton();
  
  // Cancel any pending animation frames
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function processVideoFrames() {
  if (!videoElement || !videoPlaying) return;
  
  // Process current frame
  const canvas = hiddenCanvas;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Set canvas dimensions to match the video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Apply filters
    applyImageFilters();
    
    // Convert to ASCII
    convertToAscii();
    
    // Update video progress
    updateVideoProgress();
  }
  
  // Schedule next frame
  setTimeout(() => {
    if (videoPlaying) {
      animationFrameId = requestAnimationFrame(processVideoFrames);
    }
  }, 1000 / videoFrameRate);
}

function toggleVideoPlayback() {
  if (!videoElement) return;
  
  if (videoPlaying) {
    videoElement.pause();
    videoPlaying = false;
  } else {
    videoElement.play();
    videoPlaying = true;
    processVideoFrames();
  }
  
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
  if (videoPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function updateVideoProgress() {
  if (!videoElement) return;
  
  const progress = videoElement.currentTime / videoElement.duration;
  videoProgressBar.style.width = `${progress * 100}%`;
  
  updateVideoTimeDisplay();
}

function updateVideoTimeDisplay() {
  if (!videoElement) return;
  
  const currentTime = formatTime(videoElement.currentTime);
  const duration = formatTime(videoElement.duration);
  videoTime.textContent = `${currentTime}/${duration}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function seekVideo(e) {
  if (!videoElement) return;
  
  const rect = videoProgress.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  
  videoElement.currentTime = pos * videoElement.duration;
  updateVideoProgress();
}

// Webcam functions
function toggleWebcam() {
  if (webcamActive) {
    stopWebcam();
  } else {
    startWebcam();
  }
}

function startWebcam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        webcamStream = stream;
        webcamActive = true;
        
        // Create webcam container
        const webcamContainer = document.createElement('div');
        webcamContainer.className = 'webcam-container';
        webcamContainer.id = 'webcamContainer';
        
        // Create video element
        videoElement = document.createElement('video');
        videoElement.className = 'webcam-video';
        videoElement.autoplay = true;
        videoElement.srcObject = stream;
        webcamContainer.appendChild(videoElement);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'webcam-overlay';
        webcamContainer.appendChild(overlay);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'webcam-controls';
        
        const captureButton = document.createElement('button');
        captureButton.className = 'button button-capture';
        captureButton.innerHTML = `
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Capture</span>
        `;
        captureButton.addEventListener('click', captureWebcam);
        controls.appendChild(captureButton);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'button';
        closeButton.innerHTML = `
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Close</span>
        `;
        closeButton.addEventListener('click', stopWebcam);
        controls.appendChild(closeButton);
        
        webcamContainer.appendChild(controls);
        
        // Add to preview area
        previewArea.appendChild(webcamContainer);
        
        // Update button state
        webcamButton.classList.add('active');
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
        showError('Could not access webcam. Please check permissions.');
        webcamActive = false;
      });
  } else {
    showError('Your browser does not support webcam access');
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
  
  const webcamContainer = document.getElementById('webcamContainer');
  if (webcamContainer) {
    webcamContainer.remove();
  }
  
  webcamActive = false;
  webcamButton.classList.remove('active');
}

function captureWebcam() {
  if (!videoElement || !webcamActive) return;
  
  // Create a temporary canvas to capture the frame
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = videoElement.videoWidth;
  tempCanvas.height = videoElement.videoHeight;
  
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return;
  
  // Draw the current video frame
  ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // Convert to image and process
  try {
    const imageDataUrl = tempCanvas.toDataURL('image/png');
    loadImage(imageDataUrl);
    stopWebcam();
  } catch (error) {
    console.error('Error capturing webcam:', error);
    showError('Failed to capture image from webcam');
  }
}

// Load the next script file
loadScript('ascii-part5.js');
// Theme functions
function setColorTheme(theme) {
  if (!colorThemes[theme]) return;
  
  currentTheme = theme;
  const themeColors = colorThemes[theme];
  
  // Update custom color pickers
  primaryColorPicker.value = themeColors.primary;
  secondaryColorPicker.value = themeColors.secondary;
  bgColorPicker.value = customColors.background; // Keep current background
  
  // Update custom colors object
  customColors.primary = themeColors.primary;
  customColors.secondary = themeColors.secondary;
  
  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', customColors.primary);
  document.documentElement.style.setProperty('--secondary-color', customColors.secondary);
  document.documentElement.style.setProperty('--highlight-color', customColors.primary);
  document.documentElement.style.setProperty('--border-color', `rgba(${hexToRgb(customColors.secondary)}, 0.5)`);
  
  // Update background gradient
  const styleSheet = document.styleSheets[0];
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i];
    if (rule.selectorText === 'body::before') {
      rule.style.background = themeColors.background;
      break;
    }
  }
  
  // Re-render ASCII art with new colors if available
  if (imageLoaded && !loading) {
    convertToAscii();
  }
}

function applyCustomColors() {
  // Get values from color pickers
  customColors.primary = primaryColorPicker.value;
  customColors.secondary = secondaryColorPicker.value;
  customColors.background = bgColorPicker.value;
  
  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', customColors.primary);
  document.documentElement.style.setProperty('--secondary-color', customColors.secondary);
  document.documentElement.style.setProperty('--highlight-color', customColors.primary);
  document.documentElement.style.setProperty('--border-color', `rgba(${hexToRgb(customColors.secondary)}, 0.5)`);
  document.documentElement.style.setProperty('--bg-color', customColors.background);
  
  // Create custom background gradient
  const bgGradient = `linear-gradient(45deg, ${customColors.background} 0%, ${adjustColorBrightness(hexToRgb(customColors.background).split(', ')[0], hexToRgb(customColors.background).split(', ')[1], hexToRgb(customColors.background).split(', ')[2], 1.5)} 50%, ${customColors.background} 100%)`;
  document.documentElement.style.setProperty('--bg-gradient', bgGradient);
  
  // Update before pseudo-element
  const styleSheet = document.styleSheets[0];
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i];
    if (rule.selectorText === 'body::before') {
      rule.style.background = bgGradient;
      break;
    }
  }
  
  // Re-render ASCII art with new colors if available
  if (imageLoaded && !loading) {
    convertToAscii();
  }
  
  showToast('Custom colors applied');
}

function saveCustomTheme() {
  // Create a new theme option
  const customThemeName = 'custom' + Math.floor(Math.random() * 1000);
  
  // Add to color themes object
  colorThemes[customThemeName] = {
    primary: customColors.primary,
    secondary: customColors.secondary,
    background: `linear-gradient(45deg, ${customColors.background} 0%, ${adjustColorBrightness(hexToRgb(customColors.background).split(', ')[0], hexToRgb(customColors.background).split(', ')[1], hexToRgb(customColors.background).split(', ')[2], 1.5)} 50%, ${customColors.background} 100%)`
  };
  
  // Create a new theme option element
  const themeContainer = document.querySelector('.color-theme-container');
  const newThemeOption = document.createElement('div');
  newThemeOption.className = 'color-theme-option';
  newThemeOption.setAttribute('data-theme', customThemeName);
  newThemeOption.title = 'Custom Theme';
  newThemeOption.style.background = `linear-gradient(45deg, ${customColors.primary}, ${customColors.secondary})`;
  
  // Add event listener
  newThemeOption.addEventListener('click', () => {
    setColorTheme(customThemeName);
    
    // Update active state
    colorThemeOptions.forEach(opt => opt.classList.remove('active'));
    newThemeOption.classList.add('active');
  });
  
  // Add to container
  themeContainer.appendChild(newThemeOption);
  
  showToast('Custom theme saved');
}

// Social sharing functions
function shareToTwitter() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  const text = 'Check out this ASCII art I created!';
  const url = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(twitterUrl, '_blank');
}

function shareToFacebook() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  const url = window.location.href;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  
  window.open(facebookUrl, '_blank');
}

function shareToReddit() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  const title = 'ASCII Art Creation';
  const url = window.location.href;
  const redditUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  
  window.open(redditUrl, '_blank');
}

function shareToPinterest() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  // For Pinterest, we need an image URL
  // We'll use the canvas to create a data URL
  const imageUrl = outputCanvas.toDataURL('image/png');
  const description = 'ASCII Art Creation';
  const url = window.location.href;
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;
  
  window.open(pinterestUrl, '_blank');
}

function shareViaEmail() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  const subject = 'Check out this ASCII art';
  const body = `I created this ASCII art using the ASCII Studio tool.

Check it out at: ${window.location.href}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.location.href = mailtoUrl;
}

function updateShareLink() {
  if (!imageLoaded) {
    shareLinkInput.value = 'Generate ASCII art to create a shareable link';
    return;
  }
  
  // Create a simple share link with current settings
  const params = new URLSearchParams();
  params.set('resolution', resolution);
  params.set('charSet', charSet);
  params.set('inverted', inverted);
  params.set('grayscale', grayscale);
  params.set('theme', currentTheme);
  
  const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  shareLinkInput.value = shareUrl;
}

function copyShareLink() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  shareLinkInput.select();
  document.execCommand('copy');
  
  showToast('Share link copied to clipboard');
}

function generateQRCode() {
  if (!imageLoaded) {
    showToast('Generate ASCII art first');
    return;
  }
  
  // Simple QR code generation using an external service
  const shareUrl = shareLinkInput.value;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  
  // Open QR code in new window
  window.open(qrCodeUrl, '_blank');
}

// Handle file upload
function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please upload an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      loadImage(e.target.result);
    }
  };
  reader.onerror = () => {
    showError('Failed to read file');
  };
  reader.readAsDataURL(file);
}

// Check for URL parameters on load
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('resolution')) {
    resolution = parseFloat(params.get('resolution'));
    resolutionSlider.value = resolution;
    resolutionValue.textContent = resolution.toFixed(2);
  }
  
  if (params.has('charSet')) {
    charSet = params.get('charSet');
    charSetSelect.value = charSet;
  }
  
  if (params.has('inverted')) {
    inverted = params.get('inverted') === 'true';
    invertedCheckbox.checked = inverted;
  }
  
  if (params.has('grayscale')) {
    grayscale = params.get('grayscale') === 'true';
    grayscaleCheckbox.checked = grayscale;
  }
  
  if (params.has('theme')) {
    const theme = params.get('theme');
    if (colorThemes[theme]) {
      setColorTheme(theme);
      
      // Update active state
      colorThemeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
  }
  
  if (params.has('image')) {
    const imageUrl = params.get('image');
    loadImage(imageUrl);
  }
}

// Initialize the application
window.addEventListener('load', () => {
  checkUrlParams();
});