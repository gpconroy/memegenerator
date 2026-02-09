import { schema } from "@instantdb/react";

let appSchema;
try {
  appSchema = schema({
  users: {
    email: { type: "string" },
    name: { type: "string", optional: true },
  },
  memes: {
    userId: { type: "string" },
    title: { type: "string" },
    imageFileId: { type: "string" },
    // Top text
    topText: { type: "string" },
    topX: { type: "number" },
    topY: { type: "number" },
    topColor: { type: "string" },
    topRotation: { type: "number" },
    topFontSize: { type: "number" },
    // Center text
    centerText: { type: "string" },
    centerX: { type: "number" },
    centerY: { type: "number" },
    centerColor: { type: "string" },
    centerRotation: { type: "number" },
    centerFontSize: { type: "number" },
    // Bottom text
    bottomText: { type: "string" },
    bottomX: { type: "number" },
    bottomY: { type: "number" },
    bottomColor: { type: "string" },
    bottomRotation: { type: "number" },
    bottomFontSize: { type: "number" },
    // Canvas
    canvasWidth: { type: "number" },
    canvasHeight: { type: "number" },
    // Sharing
    isPublic: { type: "boolean" },
    createdAt: { type: "number" },
    updatedAt: { type: "number" },
  },
  upvotes: {
    userId: { type: "string" },
    memeId: { type: "string" },
    createdAt: { type: "number" },
  },
  templates: {
    name: { type: "string" },
    imageFileId: { type: "string" },
    isDefault: { type: "boolean" },
  },
});
} catch (error) {
  throw error;
}

export default appSchema;
