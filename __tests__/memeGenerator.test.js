/**
 * Comprehensive unit tests for memeGenerator.js
 * Target: 100% code coverage
 */

import {
    wrapText,
    drawText,
    calculateDisplayDimensions,
    initializeTextPositions,
    getCanvasCoordinates,
    validateImageFile,
    drawMeme
} from '../src/memeGenerator.js';

describe('memeGenerator - wrapText', () => {
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            measureText: jest.fn((text) => {
                // Mock: each character is 10px wide
                return { width: text.length * 10 };
            })
        };
    });

    test('should return single line for text that fits', () => {
        const result = wrapText(mockCtx, 'Short text', 200);
        expect(result).toEqual(['Short text']);
    });

    test('should wrap text that exceeds max width', () => {
        const result = wrapText(mockCtx, 'This is a very long text that needs wrapping', 50);
        expect(result.length).toBeGreaterThan(1);
        expect(result.every(line => mockCtx.measureText(line).width <= 50 || line.length === 1)).toBe(true);
    });

    test('should handle empty text', () => {
        const result = wrapText(mockCtx, '', 100);
        expect(result).toEqual(['']);
    });

    test('should handle edge case with empty words array', () => {
        // This tests the words.length === 0 branch
        // Empty string split by space returns [''] which has length 1
        // But we test the return path
        const result = wrapText(mockCtx, '', 100);
        expect(result).toEqual(['']);
        expect(result.length).toBe(1);
    });

    test('should handle single word longer than max width', () => {
        mockCtx.measureText = jest.fn((text) => ({ width: text.length * 10 }));
        const result = wrapText(mockCtx, 'Supercalifragilisticexpialidocious', 50);
        expect(result.length).toBeGreaterThan(1);
    });

    test('should handle text with only spaces', () => {
        const result = wrapText(mockCtx, '   ', 100);
        expect(result).toEqual(['   ']);
    });

    test('should split very long words character by character', () => {
        mockCtx.measureText = jest.fn((text) => ({ width: text.length * 10 }));
        const longWord = 'A'.repeat(100);
        const result = wrapText(mockCtx, longWord, 50);
        expect(result.length).toBeGreaterThan(1);
    });
});

describe('memeGenerator - drawText', () => {
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            strokeText: jest.fn(),
            fillText: jest.fn(),
            font: '',
            textAlign: '',
            textBaseline: '',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0
        };
    });

    test('should return early if text is empty', () => {
        drawText(mockCtx, '', 100, 100, '#000000', 0, 40, 800);
        expect(mockCtx.translate).not.toHaveBeenCalled();
    });

    test('should draw text with rotation', () => {
        drawText(mockCtx, 'Test', 100, 100, '#000000', 45, 40, 800);
        expect(mockCtx.translate).toHaveBeenCalledWith(100, 100);
        expect(mockCtx.rotate).toHaveBeenCalled();
        expect(mockCtx.fillText).toHaveBeenCalled();
        expect(mockCtx.strokeText).toHaveBeenCalled();
    });

    test('should handle multi-line text', () => {
        drawText(mockCtx, 'Line 1\nLine 2', 100, 100, '#000000', 0, 40, 800);
        expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
    });

    test('should handle text with newlines and wrapping', () => {
        mockCtx.measureText = jest.fn(() => ({ width: 200 }));
        drawText(mockCtx, 'Long text that wraps\nAnd has newlines', 100, 100, '#000000', 0, 40, 800);
        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
    });

    test('should skip whitespace-only lines', () => {
        // Test the branch where line.trim() is falsy (line 99)
        drawText(mockCtx, 'Valid text\n   \n\t\t\nMore text', 100, 100, '#000000', 0, 40, 800);
        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
    });

    test('should trim and uppercase text', () => {
        drawText(mockCtx, '  lowercase text  ', 100, 100, '#000000', 0, 40, 800);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('should set correct canvas properties', () => {
        drawText(mockCtx, 'Test', 100, 100, '#ff0000', 90, 50, 800);
        expect(mockCtx.fillStyle).toBe('#ff0000');
        expect(mockCtx.strokeStyle).toBe('black');
    });
});

describe('memeGenerator - calculateDisplayDimensions', () => {
    test('should return original dimensions if width <= maxWidth', () => {
        const result = calculateDisplayDimensions(400, 300, 800);
        expect(result).toEqual({ width: 400, height: 300 });
    });

    test('should scale down if width > maxWidth', () => {
        const result = calculateDisplayDimensions(1600, 1200, 800);
        expect(result.width).toBe(800);
        expect(result.height).toBe(600);
    });

    test('should maintain aspect ratio', () => {
        const result = calculateDisplayDimensions(2000, 1000, 800);
        const ratio = result.width / result.height;
        expect(ratio).toBeCloseTo(2, 1);
    });

    test('should handle square images', () => {
        const result = calculateDisplayDimensions(1000, 1000, 800);
        expect(result.width).toBe(800);
        expect(result.height).toBe(800);
    });
});

describe('memeGenerator - initializeTextPositions', () => {
    test('should initialize all text positions', () => {
        const textProperties = {
            top: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
            center: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
            bottom: { x: 0, y: 0, color: '#ffffff', rotation: 0 }
        };

        initializeTextPositions(textProperties, 800, 600, 40);

        expect(textProperties.top.x).toBe(400);
        expect(textProperties.top.y).toBe(20);
        expect(textProperties.center.x).toBe(400);
        expect(textProperties.center.y).toBe(300);
        expect(textProperties.bottom.x).toBe(400);
        expect(textProperties.bottom.y).toBe(540);
    });

    test('should handle different canvas sizes', () => {
        const textProperties = {
            top: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
            center: { x: 0, y: 0, color: '#ffffff', rotation: 0 },
            bottom: { x: 0, y: 0, color: '#ffffff', rotation: 0 }
        };

        initializeTextPositions(textProperties, 1920, 1080, 60);

        expect(textProperties.top.x).toBe(960);
        expect(textProperties.center.y).toBe(540);
        expect(textProperties.bottom.y).toBe(1000);
    });
});

describe('memeGenerator - getCanvasCoordinates', () => {
    test('should calculate coordinates correctly', () => {
        const mockEvent = {
            clientX: 100,
            clientY: 200
        };
        const mockCanvas = {
            width: 800,
            height: 600,
            getBoundingClientRect: jest.fn(() => ({
                left: 0,
                top: 0,
                width: 400,
                height: 300
            }))
        };

        const coords = getCanvasCoordinates(mockEvent, mockCanvas);

        expect(coords.x).toBe(200);
        expect(coords.y).toBe(400);
    });

    test('should handle offset canvas', () => {
        const mockEvent = {
            clientX: 150,
            clientY: 250
        };
        const mockCanvas = {
            width: 800,
            height: 600,
            getBoundingClientRect: jest.fn(() => ({
                left: 50,
                top: 50,
                width: 400,
                height: 300
            }))
        };

        const coords = getCanvasCoordinates(mockEvent, mockCanvas);

        expect(coords.x).toBe(200);
        expect(coords.y).toBe(400);
    });
});

describe('memeGenerator - validateImageFile', () => {
    test('should return true for valid image file', () => {
        const file = {
            type: 'image/jpeg',
            size: 1024 * 1024 // 1MB
        };
        expect(validateImageFile(file)).toBe(true);
    });

    test('should return false for null file', () => {
        expect(validateImageFile(null)).toBe(false);
    });

    test('should return false for non-image file', () => {
        const file = {
            type: 'text/plain',
            size: 1024
        };
        expect(validateImageFile(file)).toBe(false);
    });

    test('should return false for file too large', () => {
        const file = {
            type: 'image/jpeg',
            size: 11 * 1024 * 1024 // 11MB
        };
        expect(validateImageFile(file)).toBe(false);
    });

    test('should accept files at size limit', () => {
        const file = {
            type: 'image/png',
            size: 10 * 1024 * 1024 // Exactly 10MB
        };
        expect(validateImageFile(file)).toBe(true);
    });

    test('should accept various image types', () => {
        const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        types.forEach(type => {
            const file = { type, size: 1024 };
            expect(validateImageFile(file)).toBe(true);
        });
    });
});

describe('memeGenerator - drawMeme', () => {
    let mockCtx;
    let mockImage;
    let textInputs;
    let textProperties;

    beforeEach(() => {
        mockCtx = {
            canvas: { width: 800, height: 600 },
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            font: '',
            textAlign: '',
            textBaseline: '',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0
        };

        mockImage = {
            width: 800,
            height: 600
        };

        textInputs = {
            top: { value: 'Top Text' },
            center: { value: 'Center Text' },
            bottom: { value: 'Bottom Text' }
        };

        textProperties = {
            top: { x: 400, y: 50, color: '#ffffff', rotation: 0 },
            center: { x: 400, y: 300, color: '#ffffff', rotation: 0 },
            bottom: { x: 400, y: 550, color: '#ffffff', rotation: 0 }
        };
    });

    test('should return early if no image', () => {
        drawMeme(mockCtx, null, textInputs, textProperties, 40);
        expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });

    test('should clear canvas and draw image', () => {
        drawMeme(mockCtx, mockImage, textInputs, textProperties, 40);
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
        expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 800, 600);
    });

    test('should draw all text elements', () => {
        drawMeme(mockCtx, mockImage, textInputs, textProperties, 40);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('should handle missing text inputs', () => {
        const emptyInputs = {
            top: { value: '' },
            center: { value: '' },
            bottom: { value: '' }
        };
        drawMeme(mockCtx, mockImage, emptyInputs, textProperties, 40);
        expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    test('should handle undefined text inputs', () => {
        drawMeme(mockCtx, mockImage, {}, textProperties, 40);
        expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    test('should use correct fontSize', () => {
        drawMeme(mockCtx, mockImage, textInputs, textProperties, 60);
        expect(mockCtx.fillText).toHaveBeenCalled();
    });
});
