"use client";

import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PDFFileUploader } from "@/components/pdf-file-uploader";
import { PDFConversionSettings } from "@/components/pdf-conversion-settings";
import { PDFImageHeader } from "@/components/pdf-image-header";
import { PDFImageCarousel } from "@/components/pdf-image-carousel";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function PDFXtract() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection from the PDFFileUploader component
  const handleFileSelect = (selectedFile: File) => {
    // Reset state
    setFile(null);
    setPageCount(0);
    setProgress(0);
    setImages([]);
    setError(null);

    setFile(selectedFile);
  };

  // Handle errors from the PDFFileUploader component
  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  // Convert PDF to images directly using the API
  const convertToImages = async () => {
    if (!file) return;

    setConverting(true);
    setProgress(0);
    setImages([]);

    try {
      // Create FormData for API call
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", quality);

      setProgress(10);

      try {
        // Call our API to convert PDF to JPG images and get image paths
        const response = await fetch("/api/pdf-to-jpg", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Error: ${response.status} ${response.statusText}`
          );
        }

        setProgress(70);

        // 获取图片路径数组和页数
        const data = await response.json();
        if (!data.imagePaths || !Array.isArray(data.imagePaths)) {
          throw new Error("No image paths returned from server.");
        }

        setImages(data.imagePaths);
        setPageCount(data.imagePaths.length); // 这里用实际转换后的图片数
        setProgress(100);
      } catch (apiError) {
        console.error("Error calling PDF to JPG conversion API:", apiError);
        setError("Error during JPG conversion on the server. Please try again.");
        setProgress(0);
      }
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("Error processing PDF. The file might be corrupted.");
      setProgress(0);
    } finally {
      setConverting(false);
    }
  };



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PDF to JPG Converter</CardTitle>
        <CardDescription>
          Upload a PDF file to convert and extract pages as JPG images (max{" "}
          {MAX_FILE_SIZE / (1024 * 1024)}MB).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Area */}
          <PDFFileUploader
            onFileSelect={handleFileSelect}
            onError={handleError}
            file={file}
            pageCount={pageCount}
          />
          {error && <p className="mt-2 text-red-500">{error}</p>}          {/* Conversion Settings */}
          {file && (
            <PDFConversionSettings
              quality={quality}
              onQualityChange={setQuality}
              converting={converting}
              onConvert={convertToImages}
              progress={progress}
            />
          )}
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="space-y-4">
              <PDFImageHeader
                file={file}
                images={images}
                onError={handleError}
              />
              <PDFImageCarousel images={images} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
