import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Checks if the browser supports the File System Access API for directory selection.
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

/**
 * Prompts the user to pick a target directory (e.g. root of a USB drive).
 * Must be called synchronously during a user gesture (button click).
 *
 * Returns:
 * - { handle, cancelled: false } if directory chosen.
 * - { handle: null, cancelled: true } if user cancelled dialog.
 * - { handle: null, cancelled: false } if not supported or failed.
 */
export async function pickTargetDirectory(): Promise<{
  handle: any | null;
  cancelled: boolean;
}> {
  if (!isFileSystemAccessSupported()) {
    return { handle: null, cancelled: false };
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      id: "navitronix_usb_export",
      mode: "readwrite",
    });
    return { handle, cancelled: false };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { handle: null, cancelled: true };
    }
    console.warn("Failed to open directory picker, will fallback to ZIP:", err);
    return { handle: null, cancelled: false };
  }
}

/**
 * Writes the contents of a ZIP blob into the target directory under `targetFolderName`.
 * If directoryHandle is null, it falls back to downloading the .zip file directly.
 */
export async function writeZipToDirectoryOrFallback(
  blob: Blob,
  dirHandle: any | null,
  fallbackZipName: string,
  targetFolderName = "Navitronix_Routes"
): Promise<{ success: boolean; savedAsFolder: boolean }> {
  if (dirHandle) {
    try {
      // 1. Create or get target folder (e.g. Navitronix_Routes)
      const targetFolderHandle = await dirHandle.getDirectoryHandle(
        targetFolderName,
        { create: true }
      );

      // 2. Unpack ZIP in memory
      const zip = await JSZip.loadAsync(blob);

      // 3. Write each file & folder into target directory
      const fileEntries = Object.entries(zip.files);
      for (const [relativePath, fileEntry] of fileEntries) {
        if (fileEntry.dir) continue; // Folder created dynamically when writing file

        const pathSegments = relativePath.split("/").filter(Boolean);
        if (pathSegments.length === 0) continue;

        let currentDir = targetFolderHandle;
        for (let i = 0; i < pathSegments.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(pathSegments[i], {
            create: true,
          });
        }

        const fileName = pathSegments[pathSegments.length - 1];
        const fileHandle = await currentDir.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        const fileData = await fileEntry.async("uint8array");
        await writable.write(fileData);
        await writable.close();
      }

      return { success: true, savedAsFolder: true };
    } catch (err) {
      console.warn("Failed writing files to folder, falling back to ZIP:", err);
      saveAs(blob, fallbackZipName);
      return { success: true, savedAsFolder: false };
    }
  }

  // Fallback: save as ZIP file
  saveAs(blob, fallbackZipName);
  return { success: true, savedAsFolder: false };
}
