"use client";

import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface FabricObjectWithId extends fabric.FabricObject {
  customId?: string;
}

interface CanvasWorkspaceProps {
  templateImage: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  isPreviewMode?: boolean;
  previewRowData?: Record<string, unknown> | null;
}

export default function CanvasWorkspace({
  templateImage,
  onCanvasReady,
  isPreviewMode = false,
  previewRowData = null,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // Initialize canvas + load background image
  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;
    let isDisposed = false;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const imgElement = new Image();
    imgElement.src = templateImage;
    imgElement.onload = () => {
      if (isDisposed) return;

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const imgW = imgElement.width;
      const imgH = imgElement.height;

      const availW = wrapper.clientWidth - 64;
      const availH = wrapper.clientHeight - 64;

      const scale = Math.min(availW / imgW, availH / imgH, 1);

      const canvasW = Math.round(imgW * scale);
      const canvasH = Math.round(imgH * scale);

      canvas.setDimensions({ width: canvasW, height: canvasH });

      const fabricImage = new fabric.FabricImage(imgElement);
      fabricImage.set({
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = fabricImage;
      canvas.renderAll();

      onCanvasReady(canvas);
    };

    return () => {
      isDisposed = true;
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [templateImage, onCanvasReady]);

  // Handle preview mode toggle and row data changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects() as (fabric.IText &
      FabricObjectWithId)[];

    if (isPreviewMode && previewRowData) {
      // Deselect everything first
      canvas.discardActiveObject();

      objects.forEach((obj) => {
        if (!(obj instanceof fabric.IText) || !obj.customId) return;

        const columnName = obj.customId;
        const realValue = String(previewRowData[columnName] ?? "");

        // Store the original placeholder text if not already stored
        if (!("_originalText" in obj)) {
          (obj as unknown as Record<string, unknown>)._originalText = obj.text;
        }

        // Replace with real data
        obj.set("text", realValue);

        // Lock the object in preview mode
        obj.set({
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });
      });

      // Disable selection on canvas level
      canvas.selection = false;
    } else {
      // Restore original placeholder text and unlock objects
      objects.forEach((obj) => {
        if (!(obj instanceof fabric.IText) || !obj.customId) return;

        // Restore original text
        if ("_originalText" in obj) {
          obj.set(
            "text",
            (obj as unknown as Record<string, unknown>)._originalText as string,
          );
          delete (obj as unknown as Record<string, unknown>)._originalText;
        }

        // Unlock the object
        obj.set({
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
        });
      });

      // Re-enable selection
      canvas.selection = true;
    }

    canvas.renderAll();
  }, [isPreviewMode, previewRowData]);

  return (
    <div
      ref={wrapperRef}
      className="flex h-full w-full items-center justify-center"
    >
      <div className="overflow-hidden rounded-md border border-neutral-200 shadow-xl dark:border-neutral-800">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
