# Meme Generator - Full Stack App

A full-stack meme generator built with Next.js and InstantDB. Create, save, share, and upvote memes!

## Features

- **Meme Creation**: Upload images or use templates, add customizable text overlays
- **User Authentication**: Sign up and sign in to save your memes
- **Save & Load**: Save memes to the database and load them later
- **Gallery**: Browse all public memes or filter by your own
- **Upvoting**: Upvote your favorite memes
- **Sharing**: Make memes public or keep them private
- **Real-time Updates**: See new memes and upvotes in real-time

## Tech Stack

- **Next.js 14** - React framework
- **InstantDB** - Real-time database and backend
- **TypeScript** - Type safety
- **Canvas API** - Image manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- InstantDB account (app ID: `f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize InstantDB schema:
```bash
npx instant-cli login
npx instant-cli init
npx instant-cli push
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (editor)
│   ├── gallery/
│   │   └── page.tsx        # Gallery page
│   ├── meme/
│   │   └── [id]/
│   │       └── page.tsx    # Meme edit page
│   └── globals.css         # Global styles
├── components/
│   ├── AuthModal.tsx       # Authentication modal
│   ├── MemeCard.tsx        # Meme card component
│   ├── MemeEditor.tsx      # Main editor component
│   ├── Navigation.tsx      # Navigation bar
│   └── TemplateLoader.tsx  # Template selector
├── lib/
│   ├── db.ts              # InstantDB client
│   ├── fileStorage.ts     # File upload utilities
│   └── memeUtils.ts       # Meme generation utilities
├── instant.schema.ts       # Database schema
├── instant.perms.ts        # Permissions rules
└── package.json
```

## Database Schema

### Entities

- **users** - User accounts (handled by InstantDB auth)
- **memes** - Meme data with text properties and image references
- **upvotes** - User upvotes on memes
- **templates** - Meme templates stored in database

## Usage

1. **Create a Meme**:
   - Upload an image or select a template
   - Add text to top, center, or bottom
   - Customize color, rotation, and font size
   - Position text by clicking "Position" and clicking on canvas

2. **Save a Meme**:
   - Sign in if not already
   - Click "Save" button
   - Enter a title
   - Choose public or private

3. **Browse Gallery**:
   - View all public memes
   - Filter by "All", "Public", or "My Memes"
   - Upvote memes you like
   - Click a meme to edit it

## Development

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file if needed (InstantDB config is handled via CLI)

## License

MIT
