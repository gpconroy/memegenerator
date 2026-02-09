/**
 * Meme Generator Application
 * DOM initialization and event handlers
 */

import {
    wrapText,
    drawText,
    calculateCanvasScale,
    screenToCanvasCoords,
    initializeTextPositions,
    calculateDisplayDimensions,
    isValidImageFile,
    validateRotation,
    validateFontSize
} from './memeGenerator.js';

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

let image = null;
let fontSize = 40;
let selectedText = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Text properties for each text element
const textProperties = {
    top: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
    center: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
    bottom: { x: 0, y: 0, color: '#ffffff', rotation: 0 }
};

// Update font size display
fontSizeInput.addEventListener('input', (e) => {
    fontSize = validateFontSize(e.target.value);
    fontSizeValue.textContent = fontSize;
    drawMeme();
});

// Function to load image from file or URL
function loadImage(imageSource) {
    image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Maintain aspect ratio for display
        const displayDims = calculateDisplayDimensions(image.width, image.height);
        canvas.style.width = displayDims.width + 'px';
        canvas.style.height = displayDims.height + 'px';

        // Initialize default positions
        initializeTextPositions(textProperties, canvas.width, canvas.height, fontSize);

        drawMeme();
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
    if (file && isValidImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (event) => {
            loadImage(event.target.result);
            // Remove active state from templates
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
        };
        reader.readAsDataURL(file);
    }
});

// Handle template selection
document.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', () => {
        const templatePath = item.dataset.template;
        loadImage(templatePath);

        // Update active state
        document.querySelectorAll('.template-item').forEach(t => {
            t.classList.remove('active');
        });
        item.classList.add('active');

        // Clear file input
        imageUpload.value = '';
    });
});

// Handle text input changes
topTextInput.addEventListener('input', drawMeme);
centerTextInput.addEventListener('input', drawMeme);
bottomTextInput.addEventListener('input', drawMeme);

// Handle color changes
topColorInput.addEventListener('input', (e) => {
    textProperties.top.color = e.target.value;
    drawMeme();
});
centerColorInput.addEventListener('input', (e) => {
    textProperties.center.color = e.target.value;
    drawMeme();
});
bottomColorInput.addEventListener('input', (e) => {
    textProperties.bottom.color = e.target.value;
    drawMeme();
});

// Handle rotation changes
topRotationInput.addEventListener('input', (e) => {
    const rotation = validateRotation(e.target.value);
    textProperties.top.rotation = rotation;
    topRotationValue.textContent = rotation;
    drawMeme();
});
centerRotationInput.addEventListener('input', (e) => {
    const rotation = validateRotation(e.target.value);
    textProperties.center.rotation = rotation;
    centerRotationValue.textContent = rotation;
    drawMeme();
});
bottomRotationInput.addEventListener('input', (e) => {
    const rotation = validateRotation(e.target.value);
    textProperties.bottom.rotation = rotation;
    bottomRotationValue.textContent = rotation;
    drawMeme();
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

    const rect = canvas.getBoundingClientRect();
    const coords = screenToCanvasCoords(e, canvas, rect);

    textProperties[selectedText].x = coords.x;
    textProperties[selectedText].y = coords.y;

    drawMeme();
});

// Handle canvas drag for positioning
canvas.addEventListener('mousedown', (e) => {
    if (!selectedText || !image) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const coords = screenToCanvasCoords(e, canvas, rect);

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

    const rect = canvas.getBoundingClientRect();
    const coords = screenToCanvasCoords(e, canvas, rect);

    textProperties[selectedText].x = coords.x - dragOffset.x;
    textProperties[selectedText].y = coords.y - dragOffset.y;

    drawMeme();
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

// Draw meme on canvas
function drawMeme() {
    if (!image) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw top text
    const topText = topTextInput.value;
    if (topText) {
        drawText(ctx, topText, textProperties.top.x, textProperties.top.y,
            textProperties.top.color, textProperties.top.rotation, fontSize, canvas.width);
    }

    // Draw center text
    const centerText = centerTextInput.value;
    if (centerText) {
        drawText(ctx, centerText, textProperties.center.x, textProperties.center.y,
            textProperties.center.color, textProperties.center.rotation, fontSize, canvas.width);
    }

    // Draw bottom text
    const bottomText = bottomTextInput.value;
    if (bottomText) {
        drawText(ctx, bottomText, textProperties.bottom.x, textProperties.bottom.y,
            textProperties.bottom.color, textProperties.bottom.rotation, fontSize, canvas.width);
    }
}

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
    const topText = topTextInput.value;
    if (topText) {
        drawText(downloadCtx, topText, textProperties.top.x, textProperties.top.y,
            textProperties.top.color, textProperties.top.rotation, fontSize, canvas.width);
    }

    const centerText = centerTextInput.value;
    if (centerText) {
        drawText(downloadCtx, centerText, textProperties.center.x, textProperties.center.y,
            textProperties.center.color, textProperties.center.rotation, fontSize, canvas.width);
    }

    const bottomText = bottomTextInput.value;
    if (bottomText) {
        drawText(downloadCtx, bottomText, textProperties.bottom.x, textProperties.bottom.y,
            textProperties.bottom.color, textProperties.bottom.rotation, fontSize, canvas.width);
    }

    // Convert to image and download
    const dataURL = downloadCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataURL;
    link.click();
});
