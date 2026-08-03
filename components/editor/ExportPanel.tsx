"use client";

import React, { useState, useCallback } from "react";
import * as fabric from "fabric";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Package,
} from "lucide-react";

import { generateCertificates, type GenerationProgress } from "@/lib/generator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ExportPanelProps {
  canvas: fabric.Canvas | null;
  excelData: Record<string, unknown>[];
  columns: string[];
}

type GenerationState = "idle" | "generating" | "done" | "error";

export default function ExportPanel({
  canvas,
  excelData,
  columns,
}: ExportPanelProps) {
  const [state, setState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    status: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const hasVariablesOnCanvas = useCallback((): boolean => {
    if (!canvas) return false;
    return canvas
      .getObjects()
      .some(
        (obj) =>
          obj instanceof fabric.IText &&
          (obj as fabric.FabricObject & { customId?: string }).customId,
      );
  }, [canvas]);

  const handleGenerate = async () => {
    if (!canvas || excelData.length === 0) return;

    setState("generating");
    setErrorMessage("");
    setProgress({ current: 0, total: excelData.length, status: "Starting…" });

    try {
      await generateCertificates(canvas, excelData, (p) => {
        setProgress(p);
      });
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  };

  const handleReset = () => {
    setState("idle");
    setProgress({ current: 0, total: 0, status: "" });
    setErrorMessage("");
  };

  const percentage =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const canGenerate = canvas && excelData.length > 0 && hasVariablesOnCanvas();

  return (
    <>
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Certificates</CardTitle>
          <CardDescription>
            Export each row as a styled PDF, bundled into a single ZIP download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <FileText size={14} className="text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Rows
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {excelData.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <Package size={14} className="text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Variables
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {columns.length}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Idle State */}
          {state === "idle" && (
            <>
              {!canGenerate && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Place at least one variable on the canvas in the Design tab
                    before generating.
                  </span>
                </div>
              )}
              <Button
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                <Download size={16} />
                Generate {excelData.length} Certificate
                {excelData.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}

          {/* Generating State */}
          {state === "generating" && (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Loader2 size={12} className="animate-spin" />
                    {progress.status}
                  </span>
                  <span className="font-medium tabular-nums">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-center text-xs text-neutral-500 tabular-nums">
                  {progress.current} / {progress.total}
                </p>
              </div>
            </div>
          )}

          {/* Done State */}
          {state === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/30">
                <CheckCircle2
                  size={16}
                  className="flex-shrink-0 text-green-600 dark:text-green-400"
                />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {excelData.length} certificate
                    {excelData.length !== 1 ? "s" : ""} generated!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Your ZIP file has been downloaded.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleGenerate}
              >
                <Download size={16} />
                Generate Again
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          )}

          {/* Error State */}
          {state === "error" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/30">
                <AlertCircle
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400"
                />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Generation failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleGenerate}>
                <Download size={16} />
                Retry
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
