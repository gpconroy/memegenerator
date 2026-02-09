/**
 * Meme Generator Core Logic
 * Testable functions for meme generation
 */

/**
 * Wrap text to fit within canvas width
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string[]} Array of wrapped lines
 */
export function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];

    // words.length will always be >= 1 since split(' ') returns at least ['']
    let currentLine = words[0] || '';

    // Handle case where first word is too long
    let metrics = ctx.measureText(currentLine);
    if (metrics.width > maxWidth && currentLine.length > 1) {
        // Split long word by characters if needed
        let charLine = '';
        for (const char of currentLine) {
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
                for (const char of word) {
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

/**
 * Draw text with rotation and multi-line support
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Text color (hex format)
 * @param {number} rotation - Rotation angle in degrees
 * @param {number} fontSize - Font size in pixels
 * @param {number} canvasWidth - Canvas width for text wrapping
 */
export function drawText(ctx, text, x, y, color, rotation, fontSize, canvasWidth) {
    if (!text) {
        return;
    }

    // Set font for measurement (before transformations)
    ctx.save();
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';

    // Split text by newlines first, then wrap each line
    const manualLines = text.split('\n');
    const allLines = [];
    const maxWidth = canvasWidth * 0.85; // Use 85% of canvas width for wrapping

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

/**
 * Calculate canvas display dimensions maintaining aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxWidth - Maximum display width
 * @returns {{width: number, height: number}} Display dimensions
 */
export function calculateDisplayDimensions(width, height, maxWidth) {
    if (width > maxWidth) {
        const ratio = maxWidth / width;
        return {
            width: maxWidth,
            height: height * ratio
        };
    }
    return {
        width,
        height
    };
}

/**
 * Initialize default text positions
 * @param {Object} textProperties - Text properties object
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} fontSize - Font size
 */
export function initializeTextPositions(textProperties, canvasWidth, canvasHeight, fontSize) {
    textProperties.top.x = canvasWidth / 2;
    textProperties.top.y = 20;
    textProperties.center.x = canvasWidth / 2;
    textProperties.center.y = canvasHeight / 2;
    textProperties.bottom.x = canvasWidth / 2;
    textProperties.bottom.y = canvasHeight - fontSize - 20;
}

/**
 * Calculate canvas coordinates from mouse event
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {{x: number, y: number}} Canvas coordinates
 */
export function getCanvasCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

/**
 * Validate image file
 * @param {File} file - File object
 * @returns {boolean} True if valid image file
 */
export function validateImageFile(file) {
    if (!file) {
        return false;
    }
    if (!file.type.startsWith('image/')) {
        return false;
    }
    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return false;
    }
    return true;
}

/**
 * Draw meme on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Image to draw
 * @param {Object} textInputs - Text input elements
 * @param {Object} textProperties - Text properties
 * @param {number} fontSize - Font size
 */
export function drawMeme(ctx, image, textInputs, textProperties, fontSize) {
    if (!image) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw top text
    const topText = textInputs.top?.value || '';
    if (topText) {
        drawText(ctx, topText, textProperties.top.x, textProperties.top.y,
            textProperties.top.color, textProperties.top.rotation, fontSize, ctx.canvas.width);
    }

    // Draw center text
    const centerText = textInputs.center?.value || '';
    if (centerText) {
        drawText(ctx, centerText, textProperties.center.x, textProperties.center.y,
            textProperties.center.color, textProperties.center.rotation, fontSize, ctx.canvas.width);
    }

    // Draw bottom text
    const bottomText = textInputs.bottom?.value || '';
    if (bottomText) {
        drawText(ctx, bottomText, textProperties.bottom.x, textProperties.bottom.y,
            textProperties.bottom.color, textProperties.bottom.rotation, fontSize, ctx.canvas.width);
    }
}
