import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

export interface MatchedCertificate {
  /** Original filename inside the ZIP. */
  filename: string;
  /** Email address extracted from the PDF Keywords metadata. */
  email: string;
  /** Raw PDF bytes for attaching to the email. */
  pdfBytes: Uint8Array;
  /** The matching row from the Excel data, or null if no match was found. */
  matchedRow: Record<string, unknown> | null;
}

/**
 * Read a ZIP of signed PDFs, extract the hidden email metadata from each,
 * and match every PDF back to a row in the original Excel data.
 *
 * The matching works by reading the `Keywords` field that was injected
 * during certificate generation (Phase 5). Filenames are completely ignored,
 * so renamed files are matched correctly.
 *
 * @param zipFile     The ZIP file uploaded by the user.
 * @param excelData   The original Excel rows (must still be loaded).
 * @param emailColumn The name of the column containing email addresses.
 * @returns           An array of matched certificates.
 */
export async function matchCertificatesToRecipients(
  file: File,
  excelData: Record<string, unknown>[],
  emailColumn: string,
): Promise<MatchedCertificate[]> {
  const results: MatchedCertificate[] = [];

  const processPdf = async (filename: string, pdfBytes: Uint8Array) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const keywords = pdfDoc.getKeywords()?.trim() ?? "";

    // Phase 6 Multi-page PDF splitting
    if (pdfDoc.getPageCount() > 1) {
      const emails = keywords ? keywords.split(",") : [];
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const newPdfBytes = await newPdf.save();

        const email = emails[i] ? emails[i].trim() : "";
        let matchedRow = null;
        if (email && excelData.length > 0) {
          matchedRow =
            excelData.find(
              (row) =>
                String(row[emailColumn] ?? "")
                  .toLowerCase()
                  .trim() === email.toLowerCase(),
            ) ?? null;
        }

        results.push({
          filename: `certificate_${i + 1}.pdf`,
          email,
          pdfBytes: newPdfBytes,
          matchedRow,
        });
      }
      return;
    }

    let matchedRow = null;

    if (excelData.length > 0) {
      if (keywords) {
        matchedRow =
          excelData.find(
            (row) =>
              String(row[emailColumn] ?? "")
                .toLowerCase()
                .trim() === keywords.toLowerCase(),
          ) ?? null;
      }

      // Fallback: If no keywords metadata, or it didn't match, try to match by filename
      if (!matchedRow) {
        const baseFilename = filename.toLowerCase().replace(".pdf", "");
        matchedRow =
          excelData.find((row) =>
            Object.values(row).some(
              (val) => String(val).toLowerCase().trim() === baseFilename,
            ),
          ) ?? null;
      }
    }

    results.push({
      filename,
      email:
        keywords || (matchedRow ? String(matchedRow[emailColumn] ?? "") : ""),
      pdfBytes,
      matchedRow,
    });
  };

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    await processPdf(file.name, new Uint8Array(arrayBuffer));
  } else {
    const zip = await JSZip.loadAsync(file);
    const pdfEntries = Object.entries(zip.files).filter(
      ([name, entry]) => !entry.dir && name.toLowerCase().endsWith(".pdf"),
    );

    for (const [filename, zipEntry] of pdfEntries) {
      const pdfBytes = await zipEntry.async("uint8array");
      await processPdf(filename, pdfBytes);
    }
  }

  return results;
}

/**
 * Replace `{{variable}}` placeholders in a template string with row data.
 */
export function renderTemplate(
  template: string,
  row?: Record<string, unknown> | null,
): string {
  if (!row) return template;
  return template.replace(/\{\{(\w+(?:\s+\w+)*)\}\}/g, (_, key: string) => {
    return String(row[key] ?? `{{${key}}}`);
  });
}
