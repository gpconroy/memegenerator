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
    fontSize = parseInt(e.target.value);
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
        const maxWidth = 800;
        if (canvas.width > maxWidth) {
            const ratio = maxWidth / canvas.width;
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (canvas.height * ratio) + 'px';
        } else {
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
        }
        
        // Initialize default positions
        textProperties.top.x = canvas.width / 2;
        textProperties.top.y = 20;
        textProperties.center.x = canvas.width / 2;
        textProperties.center.y = canvas.height / 2;
        textProperties.bottom.x = canvas.width / 2;
        textProperties.bottom.y = canvas.height - fontSize - 20;
        
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
    if (file) {
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
    const rotation = parseInt(e.target.value);
    textProperties.top.rotation = rotation;
    topRotationValue.textContent = rotation;
    drawMeme();
});
centerRotationInput.addEventListener('input', (e) => {
    const rotation = parseInt(e.target.value);
    textProperties.center.rotation = rotation;
    centerRotationValue.textContent = rotation;
    drawMeme();
});
bottomRotationInput.addEventListener('input', (e) => {
    const rotation = parseInt(e.target.value);
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
    if (!selectedText || !image) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    textProperties[selectedText].x = x;
    textProperties[selectedText].y = y;
    
    drawMeme();
});

// Handle canvas drag for positioning
canvas.addEventListener('mousedown', (e) => {
    if (!selectedText || !image) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    dragOffset.x = x - textProperties[selectedText].x;
    dragOffset.y = y - textProperties[selectedText].y;
    isDragging = true;
    canvas.classList.remove('crosshair');
    canvas.classList.add('move');
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectedText || !image) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    textProperties[selectedText].x = x - dragOffset.x;
    textProperties[selectedText].y = y - dragOffset.y;
    
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

// Wrap text to fit within canvas width
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    
    if (words.length === 0) return [text];
    
    let currentLine = words[0] || '';
    
    // Handle case where first word is too long
    let metrics = ctx.measureText(currentLine);
    if (metrics.width > maxWidth && currentLine.length > 1) {
        // Split long word by characters if needed
        let charLine = '';
        for (let char of currentLine) {
            const testCharLine = charLine + char;
            const charMetrics = ctx.measureText(testCharLine);
            if (charMetrics.width > maxWidth && charLine) {
                lines.push(charLine);
                charLine = char;
            } else {
                charLine = testCharLine;
            }
        }
        currentLine = charLine;
    }
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
            // Check if the word itself is too long
            metrics = ctx.measureText(word);
            if (metrics.width > maxWidth && word.length > 1) {
                // Split long word
                let charLine = '';
                for (let char of word) {
                    const testCharLine = charLine + char;
                    const charMetrics = ctx.measureText(testCharLine);
                    if (charMetrics.width > maxWidth && charLine) {
                        lines.push(charLine);
                        charLine = char;
                    } else {
                        charLine = testCharLine;
                    }
                }
                currentLine = charLine;
            }
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines.length > 0 ? lines : [text];
}

// Draw text with rotation and multi-line support
function drawText(ctx, text, x, y, color, rotation) {
    if (!text) return;
    
    // Set font for measurement (before transformations)
    ctx.save();
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    
    // Split text by newlines first, then wrap each line
    const manualLines = text.split('\n');
    const allLines = [];
    const maxWidth = canvas.width * 0.85; // Use 85% of canvas width for wrapping
    
    manualLines.forEach(line => {
        if (line.trim()) {
            const wrappedLines = wrapText(ctx, line.trim().toUpperCase(), maxWidth);
            allLines.push(...wrappedLines);
        }
    });
    
    ctx.restore();
    
    // Now apply transformations and draw
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, fontSize / 20);
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    
    const lineHeight = fontSize * 1.2; // Line spacing
    const totalHeight = (allLines.length - 1) * lineHeight;
    const startY = -totalHeight / 2;
    
    allLines.forEach((line, index) => {
        const yPos = startY + (index * lineHeight);
        ctx.strokeText(line, 0, yPos);
        ctx.fillText(line, 0, yPos);
    });
    
    ctx.restore();
}

// Draw meme on canvas
function drawMeme() {
    if (!image) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw top text
    const topText = topTextInput.value;
    if (topText) {
        drawText(ctx, topText, textProperties.top.x, textProperties.top.y, 
                 textProperties.top.color, textProperties.top.rotation);
    }
    
    // Draw center text
    const centerText = centerTextInput.value;
    if (centerText) {
        drawText(ctx, centerText, textProperties.center.x, textProperties.center.y, 
                 textProperties.center.color, textProperties.center.rotation);
    }
    
    // Draw bottom text
    const bottomText = bottomTextInput.value;
    if (bottomText) {
        drawText(ctx, bottomText, textProperties.bottom.x, textProperties.bottom.y, 
                 textProperties.bottom.color, textProperties.bottom.rotation);
    }
}

// Handle download
downloadBtn.addEventListener('click', () => {
    if (!image) return;
    
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
                 textProperties.top.color, textProperties.top.rotation);
    }
    
    const centerText = centerTextInput.value;
    if (centerText) {
        drawText(downloadCtx, centerText, textProperties.center.x, textProperties.center.y, 
                 textProperties.center.color, textProperties.center.rotation);
    }
    
    const bottomText = bottomTextInput.value;
    if (bottomText) {
        drawText(downloadCtx, bottomText, textProperties.bottom.x, textProperties.bottom.y, 
                 textProperties.bottom.color, textProperties.bottom.rotation);
    }
    
    // Convert to image and download
    const dataURL = downloadCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataURL;
    link.click();
});
