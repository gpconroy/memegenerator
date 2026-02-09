// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Mock canvas for Jest environment
HTMLCanvasElement.prototype.getContext = jest.fn(function(contextType) {
    if (contextType === '2d') {
        return {
            canvas: this,
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            fillStyle: '',
            strokeStyle: '',
            font: '',
            textAlign: '',
            textBaseline: '',
            lineWidth: 0,
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            toDataURL: jest.fn(() => 'data:image/png;base64,mock')
        };
    }
    return null;
});

// Mock FileReader
global.FileReader = jest.fn(function() {
    this.readAsDataURL = jest.fn();
    this.result = null;
    this.onload = null;
    this.onerror = null;
});

// Mock Image
global.Image = jest.fn(function() {
    this.src = '';
    this.width = 800;
    this.height = 600;
    this.onload = null;
    this.onerror = null;
    this.crossOrigin = '';
});

// Mock window.URL.createObjectURL
global.URL = {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn()
};
