# Setup Guide

## Quick Setup (Automated)

### Option 1: Using npm script (Recommended)
```bash
npm run setup
```

### Option 2: Using platform-specific scripts

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Cross-platform (Node.js):**
```bash
node scripts/setup.js
```

## Manual Setup

If you prefer to run the steps manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up InstantDB
```bash
# Login to InstantDB (opens browser)
npx instant-cli login

# Initialize the project
npx instant-cli init

# Push schema to database
npx instant-cli push
```

### 3. Verify Assets
Ensure template images are in `public/assets/`:
- `public/assets/revenge.jpg`
- `public/assets/successkid.jpg`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## What the Setup Script Does

1. ✅ Installs all npm dependencies (Next.js, React, InstantDB, etc.)
2. ✅ Verifies InstantDB schema files exist
3. ✅ Logs you into InstantDB (opens browser)
4. ✅ Initializes InstantDB project configuration
5. ✅ Pushes database schema to InstantDB
6. ✅ Verifies template images are in place

## Troubleshooting

### Setup Script Fails

**If npm install fails:**
- Ensure Node.js 18+ is installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Try deleting `node_modules` and `package-lock.json`, then run again

**If InstantDB login fails:**
- Ensure you have an InstantDB account
- Check your internet connection
- Try running manually: `npx instant-cli login`

**If schema push fails:**
- Ensure you're logged in: `npx instant-cli login`
- Verify your app ID matches: `f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc`
- Check `instant.schema.ts` and `instant.perms.ts` exist
- Try running manually: `npx instant-cli push`

### Template Images Missing

If template images are not found:
```bash
# Copy from assets folder to public folder
mkdir -p public/assets
cp assets/revenge.jpg public/assets/
cp assets/successkid.jpg public/assets/
```

**Windows:**
```powershell
New-Item -ItemType Directory -Force -Path public\assets
Copy-Item assets\revenge.jpg public\assets\
Copy-Item assets\successkid.jpg public\assets\
```

## First Run After Setup

1. **Sign Up**: Create an account when you first open the app
2. **Create a Meme**: Upload an image or select a template
3. **Add Text**: Customize top, center, and bottom text
4. **Save**: Click "Save" to store your meme in the database
5. **Browse Gallery**: View all public memes and upvote your favorites

## Production Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Deploy to Vercel, Netlify, or your preferred platform

## Notes

- The app uses InstantDB's real-time features, so changes appear instantly across all clients
- File storage uses InstantDB's built-in storage system
- Authentication is handled by InstantDB's auth system
- All data is stored in your InstantDB instance (app ID: `f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc`)
