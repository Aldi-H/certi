"use client";

import React, { useState } from "react";
import { Upload, Settings, Download } from "lucide-react";

export default function CertificateEditor() {
  const [activeTab, setActiveTab] = useState<"upload" | "design" | "export">(
    "upload",
  );

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
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition-colors hover:bg-neutral-100">
                <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                <h3 className="text-sm font-semibold">
                  Upload Template (Image)
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  PNG, JPG up to 5MB
                </p>
              </div>

              <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition-colors hover:bg-neutral-100">
                <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                <h3 className="text-sm font-semibold">Upload Excel Data</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  .xlsx or .csv files
                </p>
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
      <main className="relative flex flex-1 items-center justify-center overflow-auto bg-neutral-100">
        {/* We will place the Canvas here in Phase 3 */}
        <div className="text-center">
          <div className="flex h-[600px] w-[800px] items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 shadow-lg">
            Canvas Workspace Area
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            Upload a template to see it here
          </p>
        </div>
      </main>
    </div>
  );
}
