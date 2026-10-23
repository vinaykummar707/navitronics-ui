import { saveAs } from "file-saver";
import JSZip from "jszip";

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

// The export API rejects large single requests, so routes are posted in small batches.
export const EXPORT_BATCH_SIZE = 10;

/**
 * Posts routes to the export API in batches and merges the returned ZIPs into one.
 */
export async function exportRoutesInBatches<T>(
  routes: T[],
  postBatch: (batch: T[]) => Promise<Blob>,
  batchSize: number = EXPORT_BATCH_SIZE
): Promise<Blob> {
  if (routes.length <= batchSize) return postBatch(routes);

  const merged = new JSZip();
  for (let start = 0, part = 1; start < routes.length; start += batchSize, part++) {
    const batchZip = await JSZip.loadAsync(await postBatch(routes.slice(start, start + batchSize)));
    for (const entry of Object.values(batchZip.files)) {
      if (entry.dir) continue;
      const data = await entry.async("uint8array");
      // Identical names across batches (e.g. a manifest) are kept under a per-batch folder.
      merged.file(merged.file(entry.name) ? `part-${part}/${entry.name}` : entry.name, data);
    }
  }
  return merged.generateAsync({ type: "blob" });
}