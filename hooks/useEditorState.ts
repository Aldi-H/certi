import { useState, useCallback } from "react";
import { parseWorkbook } from "@/lib/excel";

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

  // Handle image upload
  const handleTemplateUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setTemplateImage(url);
    } else {
      alert("Please upload a valid image file (PNG/JPG).");
    }
  }, []);

  // Handle Excel upload
  const handleExcelUpload = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const data = parseWorkbook(buffer);

      if (data && data.length > 0) {
        setExcelData(data);
        // Extract headers from the first row
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
