---
name: Full Stack Meme Generator with InstantDB
overview: Converted the client-side meme generator into a full-stack Next.js app with InstantDB, adding user authentication, meme saving/loading, gallery view, sharing, upvoting, and template storage.
todos: []
---

# Full Stack Meme Generator with InstantDB - Implementation Complete

## Overview

Successfully transformed the client-side meme generator into a full-stack Next.js application using InstantDB as the backend database. The app supports user authentication, saving/loading memes, a gallery view, sharing (public/private), upvoting, and template storage.

## Architecture

```
Next.js Frontend (React/TypeScript)
    ↓
InstantDB React Client (@instantdb/react)
    ↓
InstantDB Backend (appId: f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc)
    ├── Users (auth)
    ├── Memes (with file storage)
    ├── Upvotes
    └── Templates
```

## Database Schema

### Entities Created in `instant.schema.ts`:

1. **users** (handled by InstantDB auth)

   - id, email, name (optional)

2. **memes**

   - id, userId, title, imageFileId (file storage reference)
   - topText, centerText, bottomText
   - topX, topY, topColor, topRotation, topFontSize
   - centerX, centerY, centerColor, centerRotation, centerFontSize
   - bottomX, bottomY, bottomColor, bottomRotation, bottomFontSize
   - canvasWidth, canvasHeight
   - isPublic (boolean for sharing)
   - createdAt, updatedAt

3. **upvotes**

   - id, userId, memeId
   - createdAt

4. **templates**

   - id, name, imageFileId (file storage reference)
   - isDefault (boolean)

## Implementation Completed

### 1. Next.js Project Setup ✅

- Created Next.js 14 project with TypeScript
- Set up App Router structure (`app/` directory)
- Configured `next.config.js` and `tsconfig.json`
- Updated `package.json` with Next.js and InstantDB dependencies
- Created global styles (`app/globals.css`)

### 2. InstantDB Integration ✅

- Created `lib/db.ts` - InstantDB client initialization with app ID
- Created `instant.schema.ts` - Complete database schema definition
- Created `instant.perms.ts` - Permissions rules for all entities
- Set up file storage utilities (`lib/fileStorage.ts`)

### 3. Authentication System ✅

**Files created:**

- `components/AuthModal.tsx` - Login/signup modal component
- `components/Navigation.tsx` - Navigation bar with auth status

**Features implemented:**

- Sign up with email/password
- Sign in functionality
- Sign out functionality
- User session management via `db.useAuth()`
- Protected save functionality (requires authentication)

### 4. Meme Editor Component ✅

**Files created:**

- `components/MemeEditor.tsx` - Main editor component with canvas functionality
- `lib/memeUtils.ts` - Converted all meme generation utilities to TypeScript

**Features implemented:**

- Canvas-based meme editor
- Image upload functionality
- Template selection
- Text overlays (top, center, bottom) with tabs
- Text customization (color, rotation, position, font size)
- Drag and drop text positioning
- Zoom controls (zoom in/out/fit to screen)
- Real-time canvas rendering
- Download meme as PNG
- Save meme to database with file storage

### 5. Meme Saving/Loading ✅

**Files created:**

- `lib/fileStorage.ts` - File upload/download utilities

**Features implemented:**

- Save meme button (converts canvas to blob, uploads to InstantDB storage)
- Save meme metadata to database
- Load meme from database (restore canvas state)
- Update existing memes
- File storage integration with InstantDB (with base64 fallback)

### 6. Gallery Page ✅

**Files created:**

- `app/gallery/page.tsx` - Gallery page component
- `components/MemeCard.tsx` - Meme card component with upvote functionality

**Features implemented:**

- Grid view of saved memes
- Filter by "All", "Public", or "My Memes"
- Real-time updates via InstantDB queries
- Click meme to edit (navigates to `/meme/[id]`)
- Upvote button on each meme card
- Display upvote counts

### 7. Sharing & Upvoting ✅

**Features implemented:**

- Public/private toggle when saving memes
- Upvote/downvote functionality
- One vote per user per meme (prevents duplicates)
- Real-time upvote count updates
- User-specific upvote state tracking

### 8. Template Storage ✅

**Files created:**

- `components/TemplateLoader.tsx` - Template selector component

**Features implemented:**

- Load templates from database
- Fallback to local templates (`public/assets/`)
- Template selection UI integrated into editor
- Support for database-stored templates

### 9. Navigation & Routing ✅

**Files created:**

- `app/page.tsx` - Home page (editor)
- `app/meme/[id]/page.tsx` - Meme edit page
- `app/layout.tsx` - Root layout with providers
- `app/providers.tsx` - React providers wrapper

**Features implemented:**

- Navigation bar with links to Editor and Gallery
- User authentication status display
- Sign in button/modal trigger
- Responsive navigation

### 10. Permissions & Security ✅

**File created:**

- `instant.perms.ts` - Complete permissions rules

**Rules implemented:**

- Users can read all public memes or their own memes
- Users can create memes (requires auth)
- Users can only update/delete their own memes
- Users can create upvotes (requires auth)
- Users can only delete their own upvotes
- Templates are readable by all, editable by authenticated users

## Project Structure

```
memegenerator/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (editor)
│   ├── providers.tsx            # React providers
│   ├── globals.css               # Global styles
│   ├── gallery/
│   │   └── page.tsx             # Gallery page
│   └── meme/
│       └── [id]/
│           └── page.tsx         # Meme edit page
├── components/                   # React components
│   ├── AuthModal.tsx            # Authentication modal
│   ├── MemeCard.tsx             # Meme card with upvote
│   ├── MemeEditor.tsx           # Main editor component
│   ├── Navigation.tsx           # Navigation bar
│   └── TemplateLoader.tsx       # Template selector
├── lib/                          # Utilities
│   ├── db.ts                    # InstantDB client
│   ├── fileStorage.ts           # File upload/download
│   └── memeUtils.ts             # Meme generation utilities
├── public/
│   └── assets/                  # Template images
│       ├── revenge.jpg
│       └── successkid.jpg
├── instant.schema.ts             # Database schema
├── instant.perms.ts              # Permissions rules
├── next.config.js                # Next.js config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── README.md                     # Project documentation
└── SETUP.md                      # Setup instructions
```

## Key Files Created

### Core Files:

- `lib/db.ts` - InstantDB client initialization
- `instant.schema.ts` - Database schema definition
- `instant.perms.ts` - Permissions rules

### Components:

- `components/AuthModal.tsx` - Authentication UI
- `components/Navigation.tsx` - Navigation bar
- `components/MemeEditor.tsx` - Main editor (converted from vanilla JS)
- `components/MemeCard.tsx` - Meme card with upvote
- `components/TemplateLoader.tsx` - Template selector

### Pages:

- `app/page.tsx` - Home/Editor page
- `app/gallery/page.tsx` - Gallery page
- `app/meme/[id]/page.tsx` - Meme edit page

### Utilities:

- `lib/memeUtils.ts` - Meme generation utilities (TypeScript conversion)
- `lib/fileStorage.ts` - File storage helpers

## Data Flow

1. **Saving a Meme:**

   - User creates meme in editor
   - Clicks "Save" → Converts canvas to blob
   - Uploads blob to InstantDB file storage → gets fileId
   - Saves meme metadata with fileId to database via `db.transact()`
   - Shows success message

2. **Loading a Meme:**

   - User browses gallery or navigates to `/meme/[id]`
   - Component queries meme data via `db.useQuery()`
   - Downloads image from file storage using fileId
   - Restores canvas state with image and text properties
   - Updates editor UI

3. **Upvoting:**

   - User clicks upvote button on meme card
   - Component checks existing upvote via `db.useQuery()`
   - Creates/deletes upvote record via `db.transact()`
   - Upvote count updates in real-time via InstantDB reactivity

## Features Summary

✅ User authentication (sign up, sign in, sign out)

✅ Meme creation with canvas editor

✅ Image upload and template selection

✅ Text customization (position, color, rotation, size)

✅ Save memes to database with file storage

✅ Load memes from database

✅ Gallery view with filtering

✅ Public/private sharing

✅ Upvoting system with real-time updates

✅ Template storage (database + local fallback)

✅ Responsive design

✅ TypeScript type safety

✅ Real-time data synchronization

## Setup Instructions

1. Install dependencies: `npm install`
2. Initialize InstantDB: `npx instant-cli login && npx instant-cli init && npx instant-cli push`
3. Copy template images to `public/assets/`
4. Run dev server: `npm run dev`
5. Open http://localhost:3000

## Migration Notes

- ✅ All original meme generation functionality preserved
- ✅ Canvas-based editor maintained
- ✅ Template images copied to `public/assets/`
- ✅ Backward compatible with local templates
- ✅ Original styles converted to CSS modules/global styles
- ✅ All JavaScript converted to TypeScript
- ✅ Vanilla JS converted to React components

## Next Steps (Optional Enhancements)

- Add search functionality to gallery
- Add sorting options (by date, upvotes, etc.)
- Add meme deletion functionality
- Add admin panel for template management
- Add image cropping/resizing
- Add more text effects (shadows, outlines, etc.)
- Add meme sharing via social media
- Add comments on memes
- Add user profiles