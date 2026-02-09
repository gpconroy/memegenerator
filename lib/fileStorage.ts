import { db } from "./db";

/**
 * Upload a file to InstantDB storage
 * Note: Using base64 encoding as InstantDB storage API may require different setup
 */
export async function uploadFile(file: File): Promise<string> {
  // For now, use base64 encoding as InstantDB file storage API may need additional setup
  // TODO: Implement proper InstantDB file storage when API is available
  return await fileToBase64(file);
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
