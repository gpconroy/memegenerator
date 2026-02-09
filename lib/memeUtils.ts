/**
 * Meme Generator Core Utilities
 * Converted from vanilla JS to TypeScript
 */

export interface TextProperties {
  x: number;
  y: number;
  color: string;
  rotation: number;
  fontSize: number;
}

export interface MemeData {
  topText: string;
  centerText: string;
  bottomText: string;
  top: TextProperties;
  center: TextProperties;
  bottom: TextProperties;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Wrap text to fit within canvas width
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];

  let currentLine = words[0] || "";

  // Handle case where first word is too long
  let metrics = ctx.measureText(currentLine);
  if (metrics.width > maxWidth && currentLine.length > 1) {
    // Split long word by characters if needed
    let charLine = "";
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
    const testLine = currentLine + " " + word;
    metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      // Check if the word itself is too long
      metrics = ctx.measureText(word);
      if (metrics.width > maxWidth && word.length > 1) {
        // Split long word
        let charLine = "";
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
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  rotation: number,
  fontSize: number,
  canvasWidth: number
): void {
  if (!text) {
    return;
  }

  // Set font for measurement (before transformations)
  ctx.save();
  ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = "center";

  // Split text by newlines first, then wrap each line
  const manualLines = text.split("\n");
  const allLines: string[] = [];
  const maxWidth = canvasWidth * 0.85; // Use 85% of canvas width for wrapping

  manualLines.forEach((line) => {
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
  ctx.strokeStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(2, fontSize / 20);
  ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;

  const lineHeight = fontSize * 1.2; // Line spacing
  const totalHeight = (allLines.length - 1) * lineHeight;
  const startY = -totalHeight / 2;

  allLines.forEach((line, index) => {
    const yPos = startY + index * lineHeight;
    ctx.strokeText(line, 0, yPos);
    ctx.fillText(line, 0, yPos);
  });

  ctx.restore();
}

/**
 * Calculate canvas display dimensions maintaining aspect ratio
 */
export function calculateDisplayDimensions(
  width: number,
  height: number,
  maxWidth: number
): { width: number; height: number } {
  if (width > maxWidth) {
    const ratio = maxWidth / width;
    return {
      width: maxWidth,
      height: height * ratio,
    };
  }
  return {
    width,
    height,
  };
}

/**
 * Initialize default text positions
 */
export function initializeTextPositions(
  textProperties: {
    top: TextProperties;
    center: TextProperties;
    bottom: TextProperties;
  },
  canvasWidth: number,
  canvasHeight: number,
  fontSize: number
): void {
  textProperties.top.x = canvasWidth / 2;
  textProperties.top.y = 20;
  textProperties.center.x = canvasWidth / 2;
  textProperties.center.y = canvasHeight / 2;
  textProperties.bottom.x = canvasWidth / 2;
  textProperties.bottom.y = canvasHeight - fontSize - 20;
}

/**
 * Calculate canvas coordinates from mouse event
 */
export function getCanvasCoordinates(
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): boolean {
  if (!file) {
    return false;
  }
  if (!file.type.startsWith("image/")) {
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
 * Convert canvas to blob for file upload
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      "image/png"
    );
  });
}
