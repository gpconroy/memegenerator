// Import core functions
import {
    wrapText,
    drawText,
    calculateDisplayDimensions,
    initializeTextPositions,
    getCanvasCoordinates,
    validateImageFile,
    drawMeme
} from './src/memeGenerator.js';

// Get DOM elements
const imageUpload = document.getElementById('imageUpload');
const topTextInput = document.getElementById('topText');
const centerTextInput = document.getElementById('centerText');
const bottomTextInput = document.getElementById('bottomText');
const topColorInput = document.getElementById('topColor');
const centerColorInput = document.getElementById('centerColor');
const bottomColorInput = document.getElementById('bottomColor');
const topRotationInput = document.getElementById('topRotation');
const centerRotationInput = document.getElementById('centerRotation');
const bottomRotationInput = document.getElementById('bottomRotation');
const topRotationValue = document.getElementById('topRotationValue');
const centerRotationValue = document.getElementById('centerRotationValue');
const bottomRotationValue = document.getElementById('bottomRotationValue');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const selectTextBtns = document.querySelectorAll('.select-text-btn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomValue = document.getElementById('zoomValue');
const fitToScreenBtn = document.getElementById('fitToScreenBtn');

let image = null;
let fontSize = 40;
let selectedText = null;
let isDragging = false;
const dragOffset = { x: 0, y: 0 };

// Zoom state
let zoomLevel = 100; // Percentage
let baseDisplayWidth = 0;
let baseDisplayHeight = 0;
const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;

// Text properties for each text element
const textProperties = {
    top: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
    center: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
    bottom: { x: 0, y: 0, color: '#ffffff', rotation: 0 }
};

// Update font size display
fontSizeInput.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = fontSize;
    redrawMeme();
});

// Function to update canvas display size based on zoom
function updateCanvasZoom() {
    if (!image || baseDisplayWidth === 0 || baseDisplayHeight === 0) {
        return;
    }
    
    const zoomFactor = zoomLevel / 100;
    canvas.style.width = (baseDisplayWidth * zoomFactor) + 'px';
    canvas.style.height = (baseDisplayHeight * zoomFactor) + 'px';
    zoomValue.textContent = zoomLevel + '%';
}

// Function to load image from file or URL
function loadImage(imageSource) {
    image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Maintain aspect ratio for display
        const displayDims = calculateDisplayDimensions(image.width, image.height, 800);
        baseDisplayWidth = displayDims.width;
        baseDisplayHeight = displayDims.height;
        
        // Reset zoom to 100%
        zoomLevel = 100;
        updateCanvasZoom();

        // Initialize default positions
        initializeTextPositions(textProperties, canvas.width, canvas.height, fontSize);

        redrawMeme();
        canvas.classList.add('show');
        downloadBtn.disabled = false;
    };
    image.onerror = () => {
        alert('Error loading image. Please try again.');
    };
    image.src = imageSource;
}

// Handle image upload
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (validateImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (event) => {
            loadImage(event.target.result);
            // Remove active state from templates
            document.querySelectorAll('.template-mini-item').forEach(item => {
                item.classList.remove('active');
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a valid image file (max 10MB).');
    }
});

// Handle template selection
document.querySelectorAll('.template-mini-item').forEach(item => {
    item.addEventListener('click', () => {
        const templatePath = item.dataset.template;
        loadImage(templatePath);

        // Update active state
        document.querySelectorAll('.template-mini-item').forEach(t => {
            t.classList.remove('active');
        });
        item.classList.add('active');

        // Clear file input
        imageUpload.value = '';
    });
});

// Handle text tabs switching
const textTabs = document.querySelectorAll('.text-tab');
const textPanels = document.querySelectorAll('.text-panel');

textTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update tab states
        textTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update panel states
        textPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.dataset.text === tabName) {
                panel.classList.add('active');
            }
        });
    });
});

// Handle text input changes
topTextInput.addEventListener('input', redrawMeme);
centerTextInput.addEventListener('input', redrawMeme);
bottomTextInput.addEventListener('input', redrawMeme);

// Handle color changes
topColorInput.addEventListener('input', (e) => {
    textProperties.top.color = e.target.value;
    redrawMeme();
});
centerColorInput.addEventListener('input', (e) => {
    textProperties.center.color = e.target.value;
    redrawMeme();
});
bottomColorInput.addEventListener('input', (e) => {
    textProperties.bottom.color = e.target.value;
    redrawMeme();
});

// Handle rotation changes
topRotationInput.addEventListener('input', (e) => {
    const rotation = parseInt(e.target.value);
    textProperties.top.rotation = rotation;
    topRotationValue.textContent = rotation + '°';
    redrawMeme();
});
centerRotationInput.addEventListener('input', (e) => {
    const rotation = parseInt(e.target.value);
    textProperties.center.rotation = rotation;
    centerRotationValue.textContent = rotation + '°';
    redrawMeme();
});
bottomRotationInput.addEventListener('input', (e) => {
    const rotation = parseInt(e.target.value);
    textProperties.bottom.rotation = rotation;
    bottomRotationValue.textContent = rotation + '°';
    redrawMeme();
});

// Handle text selection buttons
selectTextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const textType = e.target.dataset.text;
        selectedText = textType;

        // Update button states
        selectTextBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        canvas.classList.remove('move');
        canvas.classList.add('crosshair');
    });
});

// Handle canvas click for positioning
canvas.addEventListener('click', (e) => {
    if (!selectedText || !image) {
        return;
    }

    const coords = getCanvasCoordinates(e, canvas);
    textProperties[selectedText].x = coords.x;
    textProperties[selectedText].y = coords.y;

    redrawMeme();
});

// Handle canvas drag for positioning
canvas.addEventListener('mousedown', (e) => {
    if (!selectedText || !image) {
        return;
    }

    const coords = getCanvasCoordinates(e, canvas);
    dragOffset.x = coords.x - textProperties[selectedText].x;
    dragOffset.y = coords.y - textProperties[selectedText].y;
    isDragging = true;
    canvas.classList.remove('crosshair');
    canvas.classList.add('move');
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectedText || !image) {
        return;
    }

    const coords = getCanvasCoordinates(e, canvas);
    textProperties[selectedText].x = coords.x - dragOffset.x;
    textProperties[selectedText].y = coords.y - dragOffset.y;

    redrawMeme();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    if (selectedText) {
        canvas.classList.remove('move');
        canvas.classList.add('crosshair');
    }
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    if (selectedText) {
        canvas.classList.remove('move');
        canvas.classList.add('crosshair');
    }
});

// Wrapper function for drawMeme that uses current state
function redrawMeme() {
    const textInputs = {
        top: topTextInput,
        center: centerTextInput,
        bottom: bottomTextInput
    };
    drawMeme(ctx, image, textInputs, textProperties, fontSize);
}

// Zoom functionality
zoomInBtn.addEventListener('click', () => {
    if (zoomLevel < MAX_ZOOM) {
        zoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
        updateCanvasZoom();
    }
});

zoomOutBtn.addEventListener('click', () => {
    if (zoomLevel > MIN_ZOOM) {
        zoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
        updateCanvasZoom();
    }
});

fitToScreenBtn.addEventListener('click', () => {
    if (!image) return;
    
    // Calculate fit-to-screen dimensions
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const maxWidth = canvasWrapper.clientWidth - 40; // Account for padding
    const maxHeight = canvasWrapper.clientHeight - 40;
    
    const displayDims = calculateDisplayDimensions(image.width, image.height, maxWidth);
    
    // Calculate zoom level needed to fit
    const widthZoom = (displayDims.width / baseDisplayWidth) * 100;
    const heightZoom = (displayDims.height / baseDisplayHeight) * 100;
    
    // Use the smaller zoom to ensure it fits
    zoomLevel = Math.min(widthZoom, heightZoom);
    
    // Round to nearest 5%
    zoomLevel = Math.round(zoomLevel / 5) * 5;
    
    updateCanvasZoom();
});

// Handle download
downloadBtn.addEventListener('click', () => {
    if (!image) {
        return;
    }

    // Create a temporary canvas with original dimensions for download
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;
    const downloadCtx = downloadCanvas.getContext('2d');

    // Draw image
    downloadCtx.drawImage(image, 0, 0, downloadCanvas.width, downloadCanvas.height);

    // Draw all text with properties
    const textInputs = {
        top: topTextInput,
        center: centerTextInput,
        bottom: bottomTextInput
    };
    drawMeme(downloadCtx, image, textInputs, textProperties, fontSize);

    // Convert to image and download
    const dataURL = downloadCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataURL;
    link.click();
});
