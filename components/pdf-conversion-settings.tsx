"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCookie, setCookie } from "@/lib/cookies";
import { MODELS, type Model } from "@/lib/models";

interface PDFConversionSettingsProps {
  converting: boolean;
  onConvert: () => void;
  onQualityChange?: (value: "high" | "medium" | "low") => void;
  onModelChange?: (model: Model) => void;
  onFormatChange?: (format: "jpg" | "png") => void;
  isImageFile?: boolean;
  hasConvertibleFiles?: boolean;
}

export function PDFConversionSettings({
  converting,
  onConvert,
  onQualityChange,
  onModelChange,
  onFormatChange,
  isImageFile = false,
  hasConvertibleFiles = true,
}: PDFConversionSettingsProps) {
  // Internal state with cookie persistence
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");

  // Load settings from cookies on component mount
  useEffect(() => {
    let currentQuality = quality;
    let currentModel = selectedModel;
    let currentFormat = format;

    // Load quality setting from cookie
    const savedQuality = getCookie("pdf-quality") as "high" | "medium" | "low";
    if (savedQuality && ["high", "medium", "low"].includes(savedQuality)) {
      setQuality(savedQuality);
      currentQuality = savedQuality;
    }

    // Load model setting from cookie
    const savedModelId = getCookie("pdf-model");
    if (savedModelId) {
      const savedModel = MODELS.find(model => model.id === savedModelId);
      if (savedModel) {
        setSelectedModel(savedModel);
        currentModel = savedModel;
      }
    }

    // Load format setting from cookie
    const savedFormat = getCookie("pdf-format") as "jpg" | "png";
    if (savedFormat && ["jpg", "png"].includes(savedFormat)) {
      setFormat(savedFormat);
      currentFormat = savedFormat;
    }

    // Notify parent of the initial/loaded values
    onQualityChange?.(currentQuality);
    onModelChange?.(currentModel);
    onFormatChange?.(currentFormat);
  }, [quality, selectedModel, format, onQualityChange, onModelChange, onFormatChange]);

  // Handle quality change with cookie saving
  const handleQualityChange = (newQuality: "high" | "medium" | "low") => {
    setQuality(newQuality);
    setCookie("pdf-quality", newQuality);
    onQualityChange?.(newQuality);
  };

  // Handle model change with cookie saving
  const handleModelChange = (newModel: Model) => {
    setSelectedModel(newModel);
    setCookie("pdf-model", newModel.id);
    onModelChange?.(newModel);
  };

  // Handle format change with cookie saving
  const handleFormatChange = (newFormat: "jpg" | "png") => {
    setFormat(newFormat);
    setCookie("pdf-format", newFormat);
    onFormatChange?.(newFormat);
  };
  return (
    <div className="space-y-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in motion-safe:duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {!isImageFile && (
          <>
            <div className="w-full motion-safe:animate-in motion-safe:slide-in-from-left-4 motion-safe:fade-in motion-safe:duration-300 motion-safe:delay-100">
              <label className="block text-sm font-medium mb-1">
                Output Quality
              </label>
              <Select value={quality} onValueChange={handleQualityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (1200px width)</SelectItem>
                  <SelectItem value="medium">Medium (1024px width)</SelectItem>
                  <SelectItem value="low">Low (768px width)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:fade-in motion-safe:duration-300 motion-safe:delay-100">
              <label className="block text-sm font-medium mb-1">
                Output Format
              </label>
              <Select value={format} onValueChange={handleFormatChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                  <SelectItem value="png">PNG (Better quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">OCR Model</label>
          <Select
            value={selectedModel.id}
            onValueChange={(value) => {
              const model = MODELS.find((m) => m.id === value);
              if (model) handleModelChange(model);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select OCR model" />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={onConvert} disabled={converting || (isImageFile ? false : !hasConvertibleFiles)} className="w-full">
        {converting ? "Processing..." : 
          isImageFile ? `Prepare Image for OCR` : 
          !hasConvertibleFiles ? "All PDFs Already Converted" :
          `Convert PDF to ${format.toUpperCase()}`}
      </Button>
    </div>
  );
}
