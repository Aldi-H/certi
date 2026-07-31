"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  Upload,
  Settings,
  Download,
  FileImage,
  FileSpreadsheet,
  CheckCircle2,
  Type,
  Trash2,
} from "lucide-react";
import { useEditorState } from "@/hooks/useEditorState";
import * as fabric from "fabric";
import CanvasWorkspace from "./CanvasWorkspace";

type ActiveTab = "upload" | "design" | "export";

interface FabricObjectWithId extends fabric.FabricObject {
  customId?: string;
}

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

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

  const handleCanvasReady = useCallback((canvas: fabric.Canvas) => {
    setFabricCanvas(canvas);

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] as FabricObjectWithId | undefined;
      if (obj?.customId) setSelectedObjectId(obj.customId);
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0] as FabricObjectWithId | undefined;
      if (obj?.customId) setSelectedObjectId(obj.customId);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObjectId(null);
    });
  }, []);

  const addVariableToCanvas = (columnName: string) => {
    if (!fabricCanvas) return;

    const existing = fabricCanvas
      .getObjects()
      .find((obj) => (obj as FabricObjectWithId).customId === columnName);
    if (existing) {
      alert(`Variable {{${columnName}}} is already on the canvas.`);
      return;
    }

    const text = new fabric.IText(`{{${columnName}}}`, {
      left: fabricCanvas.width ? fabricCanvas.width / 2 - 50 : 100,
      top: fabricCanvas.height ? fabricCanvas.height / 2 : 100,
      fontFamily: "Arial",
      fontSize: 40,
      fill: "#000000",
      textAlign: "center",
      cursorColor: "#000000",
    });

    (text as FabricObjectWithId).customId = columnName;

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const deleteSelectedObject = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Sidebar / Controls */}
      <aside className="z-10 flex w-[350px] flex-shrink-0 flex-col border-r border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Certificate Gen</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Automate your certificates
          </p>
        </div>

        <Separator />

        <Tabs
          value={activeTab}
          onValueChange={(val: string) => setActiveTab(val as ActiveTab)}
          className="flex h-full min-h-0 w-full flex-1 flex-col"
        >
          <div className="flex-shrink-0 px-6 py-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-1.5">
                <Upload size={14} /> Data
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="flex items-center gap-1.5"
                disabled={!templateImage || excelData.length === 0}
              >
                <Settings size={14} /> Design
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="flex items-center gap-1.5"
                disabled={!templateImage || excelData.length === 0}
              >
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

              {templateImage && excelData.length > 0 && (
                <Button
                  className="w-full"
                  onClick={() => setActiveTab("design")}
                >
                  Continue to Design
                </Button>
              )}
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add Variables</CardTitle>
                  <CardDescription>
                    Click a column to add it to the canvas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {columns.map((col) => (
                    <Button
                      key={col}
                      variant="outline"
                      className="w-full justify-start font-mono text-xs"
                      onClick={() => addVariableToCanvas(col)}
                    >
                      <Type className="mr-2 h-3 w-3" />
                      {`{{${col}}}`}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {selectedObjectId && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      Edit Variable
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={deleteSelectedObject}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription className="font-mono text-xs text-blue-600">{`{{${selectedObjectId}}}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-xs text-neutral-500">
                      Styling tools (font size, color) will be added in Phase 4.
                    </p>
                    <p className="text-xs text-neutral-500">
                      For now, drag to position and use bounding box to scale.
                    </p>
                  </CardContent>
                </Card>
              )}
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
                    Generate ZIP (Phase 5)
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
          <CanvasWorkspace
            templateImage={templateImage}
            onCanvasReady={handleCanvasReady}
          />
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
