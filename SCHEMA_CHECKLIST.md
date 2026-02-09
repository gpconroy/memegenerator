# Schema Configuration Checklist

Use this checklist when configuring your schema in the InstantDB dashboard.

## Quick Access
- Dashboard URL: https://instantdb.com/dash
- App ID: `f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc`
- Your Email: gary_conroy@hotmail.com

## Entity 1: `memes` (27 fields)

### Basic Info
- [ ] `userId` - string
- [ ] `title` - string
- [ ] `imageFileId` - string
- [ ] `isPublic` - boolean
- [ ] `createdAt` - number
- [ ] `updatedAt` - number

### Top Text (6 fields)
- [ ] `topText` - string
- [ ] `topX` - number
- [ ] `topY` - number
- [ ] `topColor` - string
- [ ] `topRotation` - number
- [ ] `topFontSize` - number

### Center Text (6 fields)
- [ ] `centerText` - string
- [ ] `centerX` - number
- [ ] `centerY` - number
- [ ] `centerColor` - string
- [ ] `centerRotation` - number
- [ ] `centerFontSize` - number

### Bottom Text (6 fields)
- [ ] `bottomText` - string
- [ ] `bottomX` - number
- [ ] `bottomY` - number
- [ ] `bottomColor` - string
- [ ] `bottomRotation` - number
- [ ] `bottomFontSize` - number

### Canvas (2 fields)
- [ ] `canvasWidth` - number
- [ ] `canvasHeight` - number

## Entity 2: `upvotes` (3 fields)

- [ ] `userId` - string
- [ ] `memeId` - string
- [ ] `createdAt` - number

## Entity 3: `templates` (3 fields)

- [ ] `name` - string
- [ ] `imageFileId` - string
- [ ] `isDefault` - boolean

## Entity 4: `users` (usually auto-created)

- [ ] `email` - string (if needed)
- [ ] `name` - string, optional (if needed)

## Permissions Checklist

### memes permissions
- [ ] Read: authenticated users can read public memes or their own
- [ ] Create: authenticated users can create
- [ ] Update: only owners can update
- [ ] Delete: only owners can delete

### upvotes permissions
- [ ] Read: authenticated users can read
- [ ] Create: authenticated users can create
- [ ] Delete: only owners can delete

### templates permissions
- [ ] Read: everyone (public)
- [ ] Create: authenticated users can create
- [ ] Update: authenticated users can update
- [ ] Delete: authenticated users can delete

## Final Steps

- [ ] All entities created
- [ ] All fields added with correct types
- [ ] Permissions configured
- [ ] Schema saved/deployed
- [ ] Tested by creating a meme in the app

## Testing After Configuration

1. Run: `npm run dev`
2. Open: http://localhost:3000
3. Sign up/login
4. Create a meme
5. Check dashboard to verify data was saved
