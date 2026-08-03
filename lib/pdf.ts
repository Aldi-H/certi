import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/**
 * Render the first page of a PDF file to a high-quality PNG data URL.
 *
 * The PDF is read in-memory using pdfjs-dist — the original file on the
 * user's computer is never modified or overwritten.
 *
 * @param file  The PDF File selected by the user.
 * @param scale Render scale multiplier (default 3 for high-quality output).
 * @returns     A `data:image/png;base64,...` string that can be used as an image source.
 */
export async function renderPdfPageToDataUrl(
  file: File,
  scale: number = 3,
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get 2D canvas context for PDF rendering.");
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const dataUrl = canvas.toDataURL("image/png");

  page.cleanup();
  await pdf.cleanup();

  return dataUrl;
}

export { pdfjsLib };
