import { saveAs } from "file-saver";

/**
 * Saves the export ZIP blob as a direct file download.
 */
export async function writeZipToDirectoryOrFallback(
  blob: Blob,
  fallbackZipName: string
): Promise<{ success: boolean; savedAsFolder: boolean }> {
  saveAs(blob, fallbackZipName);
  return { success: true, savedAsFolder: false };
}

