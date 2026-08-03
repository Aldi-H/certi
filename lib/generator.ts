import * as fabric from "fabric";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface FabricObjectWithId extends fabric.FabricObject {
  customId?: string;
}

export interface GenerationProgress {
  current: number;
  total: number;
  status: string;
}

/**
 * Convert a base64 data URL to a Uint8Array for embedding in PDFs.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sanitize a string for use as a filename.
 */
function sanitizeFilename(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9_\-\s.]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

/**
 * Generate certificate PDFs for every row of Excel data and download as a ZIP.
 *
 * For each row, every Textbox/IText on the canvas with a `customId` is
 * temporarily replaced with the real data, the canvas is captured at 2×
 * resolution as a PNG, and the image is embedded in a single-page PDF.
 * After all rows are processed, original placeholder text is restored.
 */
export async function generateCertificates(
  canvas: fabric.Canvas,
  excelData: Record<string, unknown>[],
  onProgress: (progress: GenerationProgress) => void,
): Promise<void> {
  const total = excelData.length;
  if (total === 0) throw new Error("No data rows to generate.");

  const zip = new JSZip();

  // Collect text objects that map to Excel columns
  const textObjects = canvas
    .getObjects()
    .filter(
      (obj) =>
        obj instanceof fabric.IText && (obj as FabricObjectWithId).customId,
    ) as (fabric.IText & FabricObjectWithId)[];

  if (textObjects.length === 0) {
    throw new Error(
      "No variables placed on the canvas. Add at least one variable from the Design tab.",
    );
  }

  // Snapshot original placeholder text so we can restore later
  const originalTexts = new Map<string, string>();
  textObjects.forEach((obj) => {
    if (obj.customId) {
      originalTexts.set(obj.customId, obj.text ?? "");
    }
  });

  // Deselect all objects to avoid selection controls appearing in export
  canvas.discardActiveObject();
  canvas.renderAll();

  // Track filenames to avoid collisions
  const usedNames = new Set<string>();

  try {
    for (let i = 0; i < total; i++) {
      const row = excelData[i];

      onProgress({
        current: i + 1,
        total,
        status: `Generating certificate ${i + 1} of ${total}…`,
      });

      // Replace placeholder text with real data for this row
      textObjects.forEach((obj) => {
        if (!obj.customId) return;
        const value = String(row[obj.customId] ?? "");
        obj.set("text", value);
      });
      canvas.renderAll();

      // Capture canvas as high-resolution PNG
      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: 2,
      });
      const pngBytes = dataUrlToUint8Array(dataUrl);

      // Build a single-page PDF matching the image dimensions
      const pdfDoc = await PDFDocument.create();
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });

      const pdfBytes = await pdfDoc.save();

      // Build a unique filename from the first column value
      const firstCol = Object.keys(row)[0];
      const baseName =
        sanitizeFilename(String(row[firstCol] ?? "")) || `Certificate_${i + 1}`;

      // Handle duplicates
      let finalName = baseName;
      let counter = 2;
      while (usedNames.has(finalName.toLowerCase())) {
        finalName = `${baseName}_${counter}`;
        counter++;
      }
      usedNames.add(finalName.toLowerCase());

      zip.file(`${finalName}.pdf`, pdfBytes);

      // Yield to the event loop so the progress UI can update
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    onProgress({
      current: total,
      total,
      status: "Creating ZIP file…",
    });

    // Generate and download the ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "certificates.zip");

    onProgress({
      current: total,
      total,
      status: "Download started!",
    });
  } finally {
    // Always restore original placeholder text
    textObjects.forEach((obj) => {
      if (!obj.customId) return;
      const original = originalTexts.get(obj.customId);
      if (original !== undefined) {
        obj.set("text", original);
      }
    });
    canvas.renderAll();
  }
}
