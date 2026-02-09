# InstantDB Dashboard Schema Configuration Guide

This guide will walk you through configuring your schema in the InstantDB dashboard.

## Step 1: Access the Dashboard

1. Go to https://instantdb.com/dash
2. Log in with your account (gary_conroy@hotmail.com)
3. Select your app: **meme-generator** (or create a new app if needed)
4. Your app ID is: `f546c3c3-9f4f-46ea-9834-3daa9ee0fbdc`

## Step 2: Navigate to Schema Configuration

In the InstantDB dashboard:
1. Click on **"Schema"** or **"Data Model"** in the left sidebar
2. You should see an interface to define entities and their fields

## Step 3: Create Entities

Create the following entities with their fields:

### Entity 1: `memes`

**Fields:**
- `userId` - Type: **string** (required)
- `title` - Type: **string** (required)
- `imageFileId` - Type: **string** (required)
- `topText` - Type: **string** (required)
- `topX` - Type: **number** (required)
- `topY` - Type: **number** (required)
- `topColor` - Type: **string** (required)
- `topRotation` - Type: **number** (required)
- `topFontSize` - Type: **number** (required)
- `centerText` - Type: **string** (required)
- `centerX` - Type: **number** (required)
- `centerY` - Type: **number** (required)
- `centerColor` - Type: **string** (required)
- `centerRotation` - Type: **number** (required)
- `centerFontSize` - Type: **number** (required)
- `bottomText` - Type: **string** (required)
- `bottomX` - Type: **number** (required)
- `bottomY` - Type: **number** (required)
- `bottomColor` - Type: **string** (required)
- `bottomRotation` - Type: **number** (required)
- `bottomFontSize` - Type: **number** (required)
- `canvasWidth` - Type: **number** (required)
- `canvasHeight` - Type: **number** (required)
- `isPublic` - Type: **boolean** (required)
- `createdAt` - Type: **number** (required)
- `updatedAt` - Type: **number** (required)

### Entity 2: `upvotes`

**Fields:**
- `userId` - Type: **string** (required)
- `memeId` - Type: **string** (required)
- `createdAt` - Type: **number** (required)

### Entity 3: `templates`

**Fields:**
- `name` - Type: **string** (required)
- `imageFileId` - Type: **string** (required)
- `isDefault` - Type: **boolean** (required)

### Entity 4: `users`

**Note:** The `users` entity is typically handled automatically by InstantDB's auth system. You may not need to create this manually, but if you do:

**Fields:**
- `email` - Type: **string** (required)
- `name` - Type: **string** (optional)

## Step 4: Configure Permissions

Navigate to **"Permissions"** or **"Rules"** in the dashboard and set up the following:

### Permissions for `memes`:

- **Read**: Allow if user is authenticated AND (meme is public OR user is the owner)
  - Rule: `auth.id !== null && (data.isPublic === true || data.userId === auth.id)`
  
- **Create**: Allow if user is authenticated
  - Rule: `auth.id !== null`
  
- **Update**: Allow if user is authenticated AND user is the owner
  - Rule: `auth.id !== null && data.userId === auth.id`
  
- **Delete**: Allow if user is authenticated AND user is the owner
  - Rule: `auth.id !== null && data.userId === auth.id`

### Permissions for `upvotes`:

- **Read**: Allow if user is authenticated
  - Rule: `auth.id !== null`
  
- **Create**: Allow if user is authenticated
  - Rule: `auth.id !== null`
  
- **Delete**: Allow if user is authenticated AND user is the owner
  - Rule: `auth.id !== null && data.userId === auth.id`

### Permissions for `templates`:

- **Read**: Allow all (public)
  - Rule: `true`
  
- **Create**: Allow if user is authenticated
  - Rule: `auth.id !== null`
  
- **Update**: Allow if user is authenticated
  - Rule: `auth.id !== null`
  
- **Delete**: Allow if user is authenticated
  - Rule: `auth.id !== null`

## Step 5: Save and Deploy

1. Click **"Save"** or **"Deploy"** to apply your schema changes
2. Wait for the deployment to complete (usually takes a few seconds)

## Step 6: Verify Configuration

After saving, you should see:
- ✅ All 4 entities created (memes, upvotes, templates, users)
- ✅ All fields configured with correct types
- ✅ Permissions rules applied

## Alternative: Use InstantDB CLI (If Dashboard Doesn't Work)

If the dashboard interface is unclear, you can try using the CLI with a different approach:

```bash
# Make sure you're logged in
npx instant-cli login

# Try to push schema (may require manual app selection)
npx instant-cli push
```

When prompted, select your app or create a new one.

## Troubleshooting

### Can't find Schema section?
- Look for "Data Model", "Entities", or "Database Schema" in the sidebar
- Some dashboards use different terminology

### Fields not saving?
- Make sure all required fields are marked as required
- Check that field types match exactly (string, number, boolean)

### Permissions not working?
- Ensure you're using the correct syntax for your InstantDB version
- Check the dashboard's permission rule examples

### Need to update schema later?
- You can modify entities and fields in the dashboard
- Changes are usually applied immediately

## Next Steps After Configuration

Once your schema is configured:

1. **Test the app:**
   ```bash
   npm run dev
   ```

2. **Open the app:**
   - Navigate to http://localhost:3000

3. **Create a test meme:**
   - Sign up for an account
   - Upload an image or select a template
   - Add some text
   - Click "Save"
   - Check the InstantDB dashboard to see if the meme was created

4. **Verify data:**
   - Go back to the InstantDB dashboard
   - Navigate to "Data" or "Records"
   - You should see your meme record in the `memes` entity

## Quick Reference: Field Summary

**memes entity:** 27 fields total
- User/Sharing: userId, title, imageFileId, isPublic, createdAt, updatedAt
- Top text: topText, topX, topY, topColor, topRotation, topFontSize
- Center text: centerText, centerX, centerY, centerColor, centerRotation, centerFontSize
- Bottom text: bottomText, bottomX, bottomY, bottomColor, bottomRotation, bottomFontSize
- Canvas: canvasWidth, canvasHeight

**upvotes entity:** 3 fields
- userId, memeId, createdAt

**templates entity:** 3 fields
- name, imageFileId, isDefault

If you encounter any issues during setup, check the InstantDB documentation or their support channels.
