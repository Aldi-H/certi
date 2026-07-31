"use client";

import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface CanvasWorkspaceProps {
  templateImage: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
}

export default function CanvasWorkspace({
  templateImage,
  onCanvasReady,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

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
