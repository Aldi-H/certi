"use client";

import React, { useState, useMemo } from "react";
import * as fabric from "fabric";
import {
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Helvetica",
  "Garamond",
  "Palatino",
  "Impact",
];

interface ToolbarProps {
  canvas: fabric.Canvas | null;
  selectedObjectId: string | null;
  onDelete: () => void;
}

export default function Toolbar({
  canvas,
  selectedObjectId,
  onDelete,
}: ToolbarProps) {
  const toolbarState = useMemo(() => {
    if (!canvas || !selectedObjectId) {
      return {
        fontSize: 40,
        fontFamily: "Arial",
        fillColor: "#000000",
        textAlign: "center",
        isBold: false,
        isItalic: false,
        isUnderline: false,
      };
    }
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof fabric.IText)) {
      return {
        fontSize: 40,
        fontFamily: "Arial",
        fillColor: "#000000",
        textAlign: "center",
        isBold: false,
        isItalic: false,
        isUnderline: false,
      };
    }
    return {
      fontSize: active.fontSize ?? 40,
      fontFamily: active.fontFamily ?? "Arial",
      fillColor: (active.fill as string) ?? "#000000",
      textAlign: active.textAlign ?? "center",
      isBold: active.fontWeight === "bold",
      isItalic: active.fontStyle === "italic",
      isUnderline: active.underline ?? false,
    };
  }, [canvas, selectedObjectId]);

  const [localFontSize, setLocalFontSize] = useState(toolbarState.fontSize);
  const [localColor, setLocalColor] = useState(toolbarState.fillColor);

  const getActiveText = (): fabric.IText | null => {
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) return active;
    return null;
  };

  const handleFontSizeChange = (value: number[]) => {
    const text = getActiveText();
    if (!text) return;
    const size = value[0];
    setLocalFontSize(size);
    text.set("fontSize", size);
    canvas?.renderAll();
  };

  const handleFontSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    if (isNaN(size) || size < 1) return;
    const text = getActiveText();
    if (!text) return;
    setLocalFontSize(size);
    text.set("fontSize", size);
    canvas?.renderAll();
  };

  const handleFontFamilyChange = (value: string) => {
    const text = getActiveText();
    if (!text) return;
    text.set("fontFamily", value);
    canvas?.renderAll();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = getActiveText();
    if (!text) return;
    setLocalColor(e.target.value);
    text.set("fill", e.target.value);
    canvas?.renderAll();
  };

  const handleAlignChange = (align: string) => {
    const text = getActiveText();
    if (!text) return;
    text.set("textAlign", align);
    canvas?.renderAll();
  };

  const toggleBold = () => {
    const text = getActiveText();
    if (!text) return;
    const next = !toolbarState.isBold;
    text.set("fontWeight", next ? "bold" : "normal");
    canvas?.renderAll();
  };

  const toggleItalic = () => {
    const text = getActiveText();
    if (!text) return;
    const next = !toolbarState.isItalic;
    text.set("fontStyle", next ? "italic" : "normal");
    canvas?.renderAll();
  };

  const toggleUnderline = () => {
    const text = getActiveText();
    if (!text) return;
    const next = !toolbarState.isUnderline;
    text.set("underline", next);
    canvas?.renderAll();
  };

  if (!selectedObjectId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Text Styling</CardTitle>
          <CardDescription>
            Select a variable on the canvas to edit its style.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          Edit Variable
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="font-mono text-xs text-blue-600">
          {`{{${selectedObjectId}}}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-xs">Font Family</Label>
          <Select
            value={toolbarState.fontFamily}
            onValueChange={handleFontFamilyChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem
                  key={font}
                  value={font}
                  style={{ fontFamily: font }}
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-xs">Font Size</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[localFontSize]}
              onValueChange={handleFontSizeChange}
              min={8}
              max={200}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={localFontSize}
              onChange={handleFontSizeInput}
              className="w-16 text-center text-xs"
              min={1}
              max={500}
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-xs">Text Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={localColor}
                onChange={handleColorChange}
                className="h-9 w-9 cursor-pointer rounded-md border border-neutral-200 p-0.5"
              />
            </div>
            <Input
              type="text"
              value={localColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                  setLocalColor(val);
                  if (val.length === 7) {
                    const text = getActiveText();
                    if (text) {
                      text.set("fill", val);
                      canvas?.renderAll();
                    }
                  }
                }
              }}
              className="flex-1 font-mono text-xs uppercase"
              maxLength={7}
            />
          </div>
        </div>

        <Separator />

        {/* Text Style Toggles */}
        <div className="space-y-2">
          <Label className="text-xs">Style</Label>
          <div className="flex gap-1">
            <Button
              variant={toolbarState.isBold ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={toggleBold}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={toolbarState.isItalic ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={toggleItalic}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={toolbarState.isUnderline ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={toggleUnderline}
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label className="text-xs">Alignment</Label>
          <div className="flex gap-1">
            <Button
              variant={
                toolbarState.textAlign === "left" ? "default" : "outline"
              }
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignChange("left")}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={
                toolbarState.textAlign === "center" ? "default" : "outline"
              }
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignChange("center")}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={
                toolbarState.textAlign === "right" ? "default" : "outline"
              }
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignChange("right")}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
