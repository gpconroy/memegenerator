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
├── .git/           # Git version control (hidden directory)
├── .gitignore      # Git ignore rules
├── assets/         # Image assets
│   ├── revenge.jpg
│   └── successkid.jpg
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Core functionality
└── README.md       # This file
```

## Version Control (Git)

This project uses Git for version control. The repository is initialized and ready to use.

### Git Status
- ✅ Repository initialized
- ✅ All files tracked
- ✅ Initial commit completed

### Common Git Commands

```bash
# Check status of your files
git status

# Stage files for commit
git add <filename>
git add .                    # Stage all changes

# Commit your changes
git commit -m "Description of changes"

# View commit history
git log

# See what changed
git diff

# Create a new branch
git branch <branch-name>

# Switch branches
git checkout <branch-name>
```

### Git Configuration

If you need to set your Git identity for this project:

```bash
# For this repository only
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Or globally for all repositories
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Development Best Practices

This project follows industry-standard software development best practices. See `.cursor/rules/` for detailed guidelines.

### Code Quality
- ✅ Clean, readable, and maintainable code
- ✅ Consistent naming conventions (camelCase for variables/functions)
- ✅ Small, focused functions (single responsibility)
- ✅ Meaningful variable and function names
- ✅ Proper error handling
- ✅ Self-documenting code with comments for complex logic

### Security
- ✅ Input validation and sanitization
- ✅ File upload security (type and size validation)
- ✅ XSS protection (escaping user input)
- ✅ No sensitive data in code or commits
- ✅ Secure handling of user-generated content

### Performance
- ✅ Efficient DOM operations (cached queries)
- ✅ Optimized canvas operations
- ✅ Debounced/throttled frequent events
- ✅ Memory leak prevention
- ✅ Optimized image handling

### Accessibility
- ✅ Keyboard navigation support
- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Sufficient color contrast
- ✅ Screen reader compatibility
- ✅ Focus management

### Testing
- ✅ Manual testing across browsers
- ✅ Edge case handling
- ✅ Error scenario testing
- ✅ Responsive design testing
- ✅ Accessibility testing

### Documentation
- ✅ Clear README with setup instructions
- ✅ Inline code comments for complex logic
- ✅ Git commit messages follow conventions
- ✅ Code is self-documenting

### Version Control
- ✅ Regular commits with descriptive messages
- ✅ Proper use of branches for features
- ✅ `.gitignore` configured appropriately
- ✅ Clean commit history

## Audit System

This project includes a comprehensive audit system for code quality, security, performance, and test coverage.

### Quick Start

```bash
# Install dependencies
npm install

# Run all audits
npm run audit:all

# Generate stakeholder reports
npm run audit:report
```

### Audit Components

- **Code Quality**: ESLint-based code quality checks
- **Security**: Dependency and code security scanning
- **Performance**: Performance benchmarking and metrics
- **Test Coverage**: 100% code coverage target with Jest
- **E2E Tests**: Complete user workflow testing with Playwright

### Audit Workflow

1. **Development**: Use Composer 1 for code development
2. **Automated Audits**: Run `npm run audit:all` to execute all checks
3. **Independent Review**: Use Opus 4.6 Fast to review audit results
4. **Report Generation**: Generate HTML reports for stakeholders
5. **Approval**: All audits must pass before deployment

See `AUDIT_SYSTEM.md` and `AUDIT_WORKFLOW.md` for detailed documentation.

### Audit Results

All audit results are saved in `audit-results/` with timestamps:
- JSON reports (technical)
- HTML reports (non-technical stakeholders)
- Full audit summaries
- Opus 4.6 Fast review results

## Contributing Guidelines

When contributing to this project:

1. **Follow Code Style**: Adhere to the code quality guidelines in `.cursor/rules/code-quality.mdc`
2. **Test Thoroughly**: Test all changes in multiple browsers and scenarios
3. **Run Audits**: Ensure all audits pass before submitting
4. **Commit Often**: Make small, focused commits with clear messages
5. **Document Changes**: Update README if adding features or changing behavior
6. **Security First**: Never commit sensitive data, validate all inputs
7. **Accessibility**: Ensure changes maintain or improve accessibility
8. **100% Coverage**: Maintain 100% test coverage

## License

This project is open source and available for educational purposes.
