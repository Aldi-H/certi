import { saveAs } from "file-saver";
import JSZip from "jszip";

/**
 * Create a ZIP from a map of filename → content and trigger a download.
 */
export async function downloadAsZip(
  files: Record<string, Blob | string>,
  zipFilename: string = "archive.zip",
) {
  const zip = new JSZip();

  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipFilename);
}

/**
 * Save a single file/blob to the user's filesystem.
 */
export function downloadFile(
  content: Blob | string,
  filename: string,
  mimeType?: string,
) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: mimeType ?? "text/plain" });
  saveAs(blob, filename);
}

export { saveAs, JSZip };
