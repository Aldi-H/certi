"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Settings,
  Download,
  FileImage,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { useEditorState } from "@/hooks/useEditorState";

export default function CertificateEditor() {
  const [activeTab, setActiveTab] = useState<"upload" | "design" | "export">(
    "upload",
  );

  const {
    templateImage,
    excelData,
    columns,
    handleTemplateUpload,
    handleExcelUpload,
  } = useEditorState();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleTemplateUpload(e.target.files[0]);
    }
  };

  const onExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleExcelUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 text-neutral-900">
      {/* Sidebar / Controls */}
      <aside className="z-10 flex w-80 flex-col border-r border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-6">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Certificate Gen
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Automate your certificates
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "upload"
                ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-600"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
            }`}
          >
            <Upload size={16} />
            Data
          </button>
          <button
            onClick={() => setActiveTab("design")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "design"
                ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-600"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
            }`}
          >
            <Settings size={16} />
            Design
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "export"
                ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-600"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
            }`}
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Sidebar Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "upload" && (
            <div className="space-y-6">
              {/* Template Image Upload */}
              <div
                onClick={() => imageInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                  templateImage
                    ? "border-green-400 bg-green-50"
                    : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                }`}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  ref={imageInputRef}
                  onChange={onImageChange}
                />

                {templateImage ? (
                  <>
                    <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
                    <h3 className="text-sm font-semibold text-green-700">
                      Template Uploaded
                    </h3>
                    <p className="mt-1 text-xs text-green-600">
                      Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <FileImage className="mb-2 h-8 w-8 text-neutral-400" />
                    <h3 className="text-sm font-semibold">Upload Template</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      PNG, JPG format
                    </p>
                  </>
                )}
              </div>

              {/* Excel Data Upload */}
              <div
                onClick={() => excelInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                  excelData.length > 0
                    ? "border-green-400 bg-green-50"
                    : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx, .csv"
                  className="hidden"
                  ref={excelInputRef}
                  onChange={onExcelChange}
                />

                {excelData.length > 0 ? (
                  <>
                    <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
                    <h3 className="text-sm font-semibold text-green-700">
                      {excelData.length} Rows Loaded
                    </h3>
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {columns.slice(0, 3).map((col) => (
                        <span
                          key={col}
                          className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-800"
                        >
                          {col}
                        </span>
                      ))}
                      {columns.length > 3 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-800">
                          +{columns.length - 3}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mb-2 h-8 w-8 text-neutral-400" />
                    <h3 className="text-sm font-semibold">Upload Excel Data</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      .xlsx or .csv files
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Upload your files first to start designing.
              </p>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Finish your design to generate certificates.
              </p>
              <button className="w-full cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white opacity-50 shadow-sm transition-colors hover:bg-blue-700">
                Generate ZIP
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace (Canvas Area) */}
      <main className="relative flex flex-1 items-center justify-center overflow-auto bg-neutral-100 p-8">
        {templateImage ? (
          <div className="relative border border-neutral-200 shadow-xl">
            {/* Displaying raw image for now, Phase 3 will replace this with Fabric.js Canvas */}
            <img
              src={templateImage}
              alt="Template Preview"
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="flex h-[600px] w-[800px] items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 shadow-lg">
              <span className="flex flex-col items-center">
                <FileImage className="mb-4 h-12 w-12 text-neutral-300" />
                No Template Uploaded
              </span>
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              Upload a template from the Data tab to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
