import { useState, useCallback } from "react";
import { parseWorkbook } from "@/lib/excel";
import { renderPdfPageToDataUrl } from "@/lib/pdf";

export type CertificateVariable = {
  id: string;
  columnName: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
};

export function useEditorState() {
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [variables, setVariables] = useState<CertificateVariable[]>([]);

  const handleTemplateUpload = useCallback(async (file: File) => {
    try {
      if (file.type === "application/pdf") {
        const dataUrl = await renderPdfPageToDataUrl(file);
        setTemplateImage(dataUrl);
      } else if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setTemplateImage(url);
      } else {
        alert("Please upload a valid file (PNG, JPG, or PDF).");
      }
    } catch (error) {
      console.error("Error processing template:", error);
      alert("Failed to process the template file. Please try again.");
    }
  }, []);

  // Handle Excel upload
  const handleExcelUpload = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const data = parseWorkbook(buffer);

      if (data && data.length > 0) {
        setExcelData(data);
        const headers = Object.keys(data[0]);
        setColumns(headers);
      } else {
        alert("The uploaded Excel file appears to be empty.");
      }
    } catch (error) {
      console.error("Error parsing Excel:", error);
      alert(
        "Failed to parse the Excel file. Please ensure it is a valid .xlsx or .csv format.",
      );
    }
  }, []);

  // Clear data
  const resetState = useCallback(() => {
    if (templateImage) {
      URL.revokeObjectURL(templateImage);
    }
    setTemplateImage(null);
    setExcelData([]);
    setColumns([]);
    setVariables([]);
  }, [templateImage]);

  return {
    templateImage,
    excelData,
    columns,
    variables,
    setVariables,
    handleTemplateUpload,
    handleExcelUpload,
    resetState,
  };
}
