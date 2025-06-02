"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Helper function to get status text based on progress
const getProgressStatus = (progress: number): string => {
  if (progress === 0) return "Starting...";
  if (progress < 30) return "Processing PDF file...";
  if (progress < 70) return "Converting to JPG on server...";
  if (progress < 100) return "Finalizing...";
  return "Completed";
};

interface PDFConversionSettingsProps {
  quality: "high" | "medium" | "low";
  onQualityChange: (value: "high" | "medium" | "low") => void;
  converting: boolean;
  progress: number;
  onConvert: () => void;
}

export function PDFConversionSettings({
  quality,
  onQualityChange,
  converting,
  progress,
  onConvert
}: PDFConversionSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Output Quality
          </label>
          <Select
            value={quality}
            onValueChange={onQualityChange}
          >
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
      </div>
      <Button
        onClick={onConvert}
        disabled={converting}
        className="w-full"
      >
        {converting ? "Converting..." : "Convert PDF to JPG"}
      </Button>
      {/* Progress Bar */}
      {(converting || progress > 0) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{getProgressStatus(progress)}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
