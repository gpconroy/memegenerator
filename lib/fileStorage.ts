import { db } from "./db";

/**
 * Upload a file to InstantDB storage.
 * Uses InstantDB's Storage API when available, falls back to compressed base64.
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    // Try using InstantDB's built-in storage API
    const result = await db.storage.upload(file.name, file);
    if (result?.data?.url) {
      return result.data.url;
    }
    // Some versions return the path directly
    if (typeof result === "string") {
      return result;
    }
  } catch {
    // Storage API not available or failed - fall back to compressed base64
  }

  // Fallback: compress the image to JPEG at reduced quality to stay within
  // InstantDB's transaction size limits (~4MB max for a single attribute).
  return await fileToCompressedBase64(file, 0.6, 1200);
}

/**
 * Get file URL from InstantDB storage
 * If fileId is base64, return it directly
 */
export function getFileUrl(fileId: string): string {
  // If fileId is base64 data URL, return it directly
  if (fileId.startsWith("data:")) {
    return fileId;
  }
  // For now, assume fileId is a base64 string or URL
  // TODO: Implement proper InstantDB file URL retrieval when API is available
  return fileId.startsWith("http") ? fileId : `data:image/png;base64,${fileId}`;
}

/**
 * Delete a file from InstantDB storage
 * Note: Not implemented yet as InstantDB storage API needs setup
 */
export async function deleteFile(fileId: string): Promise<void> {
  // TODO: Implement file deletion when InstantDB storage API is available
  console.log("File deletion not yet implemented");
}

/**
 * Convert file to base64 (fallback)
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress and convert file to base64.
 * Re-encodes the image as JPEG at the given quality, scaling down if needed,
 * so the resulting data-URL string stays small enough for InstantDB transactions.
 */
async function fileToCompressedBase64(
  file: File,
  quality: number = 0.6,
  maxDimension: number = 1200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;

        // Scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(file);
  });
}
