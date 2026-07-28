import * as XLSX from "xlsx";

export type WorkbookData = Record<string, unknown>[];

/**
 * Parse an Excel/CSV file buffer into an array of row objects.
 */
export function parseWorkbook(buffer: ArrayBuffer): WorkbookData {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
}

/**
 * Create and download an Excel file from row data.
 */
export function exportToExcel(
  data: WorkbookData,
  filename: string = "export.xlsx",
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}

export { XLSX };
