# Meme Generator

A simple, client-side meme generator built with HTML, CSS, and JavaScript. Upload an image, add customizable text overlays with positioning, color, and rotation controls, and download your meme!

## Features

- **Upload Custom Images**: Choose any image from your device
- **Multiple Text Overlays**: Add top, center, and bottom text to your meme
- **Customizable Text**:
  - Drag and drop positioning
  - Color picker for each text element
  - Rotation control (0-360°)
  - Adjustable font size (20-80px)
- **Real-time Preview**: See your meme update as you make changes
- **Download**: Save your meme as a PNG image

## How to Use

1. Open `index.html` in a web browser (or use a local server)
2. Click "Choose Image" to upload an image
3. For each text element (Top, Center, Bottom):
   - Enter your text
   - Choose a color using the color picker
   - Adjust rotation with the slider (0-360°)
   - Click "Click to Position" button, then click or drag on the canvas to position the text
4. Adjust the font size using the slider
5. Click "Download Meme" to save your creation

## Running Locally

### Option 1: Direct File Opening
Simply double-click `index.html` to open it in your default browser.

### Option 2: Local Server (Recommended)
For best results, use a local web server:

```bash
# Using Python 3
cd path/to/memegenerator
python -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

## Technologies Used

- HTML5 Canvas API for image manipulation
- FileReader API for reading uploaded images
- Vanilla JavaScript (no dependencies)

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- FileReader API
- ES6 JavaScript features

## File Structure

```
memegenerator/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Core functionality
└── README.md       # This file
```

## License

This project is open source and available for educational purposes.
