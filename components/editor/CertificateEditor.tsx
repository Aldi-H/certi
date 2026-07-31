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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CertificateEditor() {
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
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Sidebar / Controls */}
      <aside className="z-10 flex w-[350px] flex-col border-r border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Certificate Gen</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Automate your certificates
          </p>
        </div>

        <Separator />

        <Tabs
          defaultValue="upload"
          className="flex h-full w-full flex-1 flex-col"
        >
          <div className="px-6 py-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-1.5">
                <Upload size={14} /> Data
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-1.5">
                <Settings size={14} /> Design
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-1.5">
                <Download size={14} /> Export
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="upload" className="mt-0 space-y-6">
              {/* Template Image Upload Card */}
              <Card
                className={`cursor-pointer border-2 border-dashed transition-colors ${templateImage ? "border-green-400 bg-green-50/50 dark:bg-green-950/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"}`}
                onClick={() => imageInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
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
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Template Uploaded
                      </h3>
                      <p className="mt-1 text-xs text-green-600 dark:text-green-500">
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
                </CardContent>
              </Card>

              {/* Excel Data Upload Card */}
              <Card
                className={`cursor-pointer border-2 border-dashed transition-colors ${excelData.length > 0 ? "border-green-400 bg-green-50/50 dark:bg-green-950/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"}`}
                onClick={() => excelInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
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
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {excelData.length} Rows Loaded
                      </h3>
                      <div className="mt-3 flex flex-wrap justify-center gap-1">
                        {columns.slice(0, 3).map((col) => (
                          <Badge
                            key={col}
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300"
                          >
                            {col}
                          </Badge>
                        ))}
                        {columns.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300"
                          >
                            +{columns.length - 3}
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mb-2 h-8 w-8 text-neutral-400" />
                      <h3 className="text-sm font-semibold">
                        Upload Excel Data
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        .xlsx or .csv files
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Design Workspace</CardTitle>
                  <CardDescription>
                    Upload your files first to start designing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Generate Certificates
                  </CardTitle>
                  <CardDescription>
                    Finish your design to generate certificates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full">
                    Generate ZIP
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </aside>

      {/* Main Workspace (Canvas Area) */}
      <main className="relative flex flex-1 items-center justify-center overflow-auto bg-neutral-100/50 p-8 dark:bg-neutral-950">
        {templateImage ? (
          <div className="relative border border-neutral-200 shadow-xl dark:border-neutral-800">
            {/* Displaying raw image for now, Phase 3 will replace this with Fabric.js Canvas */}
            <img
              src={templateImage}
              alt="Template Preview"
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="text-center">
            <Card className="flex h-[600px] w-[800px] items-center justify-center border-2 border-dashed bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center p-0 text-neutral-400">
                <FileImage className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                <p className="font-medium">No Template Uploaded</p>
              </CardContent>
            </Card>
            <p className="mt-4 text-sm text-neutral-500">
              Upload a template from the Data tab to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
