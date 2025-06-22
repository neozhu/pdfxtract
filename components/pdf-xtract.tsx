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
import { PDFOcrProcessor } from "@/components/pdf-ocr-processor";
import { Model, MODELS } from "@/lib/models";
import { Progress } from "@/components/ui/progress";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface FileProcessingState {
  file: File;
  progress: number;
  converting: boolean;
  images: string[];
  error: string | null;
  pageCount: number;
}

export function PDFXtract() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStates, setFileStates] = useState<Map<string, FileProcessingState>>(new Map());
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [error, setError] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Check if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith('image/') || 
           ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => 
             file.name.toLowerCase().endsWith(ext)
           );
  };

  // Get file key for state management
  const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  // Handle quality change from PDFConversionSettings
  const handleQualityChange = (newQuality: "high" | "medium" | "low") => {
    setQuality(newQuality);
  };

  // Handle model change from PDFConversionSettings
  const handleModelChange = (newModel: Model) => {
    setSelectedModel(newModel);
  };

  // Handle format change from PDFConversionSettings
  const handleFormatChange = (newFormat: "jpg" | "png") => {
    setFormat(newFormat);
  };

  // Update all images when file states change
  const updateAllImages = (states: Map<string, FileProcessingState>, currentFiles: File[]) => {
    const combinedImages: string[] = [];
    currentFiles.forEach(file => {
      const fileKey = getFileKey(file);
      const state = states.get(fileKey);
      if (state?.images) {
        combinedImages.push(...state.images);
      }
    });
    setAllImages(combinedImages);
  };

  // Handle file selection from the PDFFileUploader component
  const handleFileSelect = async (selectedFiles: File[]) => {
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    
    // Initialize state for new files
    const newFileStates = new Map(fileStates);
    const imagesToProcess: File[] = [];
    
    selectedFiles.forEach(file => {
      const fileKey = getFileKey(file);
      if (!newFileStates.has(fileKey)) {
        newFileStates.set(fileKey, {
          file,
          progress: 0,
          converting: false,
          images: [],
          error: null,
          pageCount: 0,
        });
        
        // If it's an image file, add to processing queue
        if (isImageFile(file)) {
          imagesToProcess.push(file);
        }
      }
    });
    
    setFileStates(newFileStates);
    
    // Process image files immediately
    if (imagesToProcess.length > 0) {
      await processAllImageFiles(imagesToProcess, newFileStates, newFiles);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const removedFile = files[index];
    
    if (removedFile) {
      const fileKey = getFileKey(removedFile);
      const newFileStates = new Map(fileStates);
      newFileStates.delete(fileKey);
      setFileStates(newFileStates);
      updateAllImages(newFileStates, newFiles);
    }
    
    setFiles(newFiles);
  };

  // Handle errors
  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  // Process all image files
  const processAllImageFiles = async (imageFiles: File[], currentStates: Map<string, FileProcessingState>, currentFiles: File[]) => {
    const states = new Map(currentStates);
    
    for (const imageFile of imageFiles) {
      const fileKey = getFileKey(imageFile);
      
      try {
        const currentState = states.get(fileKey);
        if (currentState) {
          states.set(fileKey, { ...currentState, progress: 10 });
        }
        
        // Create FormData to upload the image to a temporary location
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Call API to save the image and get the path
        const response = await fetch('/api/process-image', {
          method: 'POST',
          body: formData,
        });
        
        let imagePath: string;
        if (!response.ok) {
          // If the API doesn't exist yet, use the blob URL directly
          imagePath = URL.createObjectURL(imageFile);
        } else {
          const data = await response.json();
          imagePath = data.imagePath || URL.createObjectURL(imageFile);
        }
        
        const finalState = states.get(fileKey);
        if (finalState) {
          states.set(fileKey, {
            ...finalState,
            images: [imagePath],
            pageCount: 1,
            progress: 100,
          });
        }
        
      } catch (error) {
        console.error('Error processing image file:', error);
        const errorState = states.get(fileKey);
        if (errorState) {
          states.set(fileKey, {
            ...errorState,
            error: 'Error processing image file',
            progress: 0,
          });
        }
      }
    }
    
    setFileStates(new Map(states));
    updateAllImages(states, currentFiles);
  };

  // Convert all PDF files to images
  const convertAllPDFsToImages = async () => {
    const pdfFiles = files.filter(file => !isImageFile(file));
    if (pdfFiles.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);
    
    const newFileStates = new Map(fileStates);
    
    // Mark all PDFs as converting
    pdfFiles.forEach(file => {
      const fileKey = getFileKey(file);
      const currentState = newFileStates.get(fileKey);
      if (currentState) {
        newFileStates.set(fileKey, {
          ...currentState,
          converting: true,
          progress: 0,
          images: [],
        });
      }
    });
    setFileStates(new Map(newFileStates));

    try {
      let completedFiles = 0;
      
      // Process each PDF file
      for (const pdfFile of pdfFiles) {
        const fileKey = getFileKey(pdfFile);
        
        try {
          // Create FormData for API call
          const formData = new FormData();
          formData.append("file", pdfFile);
          formData.append("quality", quality);
          formData.append("format", format);

          // Update progress
          newFileStates.set(fileKey, {
            ...newFileStates.get(fileKey)!,
            progress: 10,
          });
          setFileStates(new Map(newFileStates));

          // Call our API to convert PDF to images and get image paths
          const response = await fetch("/api/pdf-to-images", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Error: ${response.status} ${response.statusText}`
            );
          }

          // Update progress
          newFileStates.set(fileKey, {
            ...newFileStates.get(fileKey)!,
            progress: 70,
          });
          setFileStates(new Map(newFileStates));

          // Get image paths and page count
          const data = await response.json();
          if (!data.imagePaths || !Array.isArray(data.imagePaths)) {
            throw new Error("No image paths returned from server.");
          }

          newFileStates.set(fileKey, {
            ...newFileStates.get(fileKey)!,
            images: data.imagePaths,
            pageCount: data.imagePaths.length,
            progress: 100,
            converting: false,
          });
          
        } catch (error) {
          console.error(`Error processing PDF ${pdfFile.name}:`, error);
          newFileStates.set(fileKey, {
            ...newFileStates.get(fileKey)!,
            error: `Error processing ${pdfFile.name}`,
            progress: 0,
            converting: false,
          });
        }
        
        completedFiles++;
        setOverallProgress((completedFiles / pdfFiles.length) * 100);
      }
      
      setFileStates(new Map(newFileStates));
      updateAllImages(newFileStates, files);
      
    } catch (err) {
      console.error("Error processing PDFs:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if there are any PDFs to convert
  const hasPDFFiles = files.some(file => !isImageFile(file));
  const hasUnconvertedPDFs = files.some(file => {
    if (isImageFile(file)) return false;
    const fileKey = getFileKey(file);
    const state = fileStates.get(fileKey);
    return !state?.images || state.images.length === 0;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-300">
            Advanced Document & Image Digitization Suite
          </p>
        </CardTitle>
        <CardDescription>
          <p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-300">
            Transform your scanned documents and images into digital assets with our professional processing engine (supports up to {MAX_FILE_SIZE / (1024 * 1024)}MB). Our system can process multiple PDF files by rendering each page as high-fidelity images, or directly process image files. We leverage state-of-the-art optical character recognition technology to extract structured text content in clean Markdown format.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Area */}
          <PDFFileUploader
            onFileSelect={handleFileSelect}
            onError={handleError}
            files={files}
            onRemoveFile={handleRemoveFile}
          />
          {error && <p className="mt-2 text-red-500">{error}</p>}

          {/* Conversion Settings */}
          {files.length > 0 && (
            <PDFConversionSettings
              onModelChange={handleModelChange}
              onQualityChange={handleQualityChange}
              onFormatChange={handleFormatChange}
              converting={isProcessing}
              onConvert={convertAllPDFsToImages}
              isImageFile={!hasPDFFiles}
              hasConvertibleFiles={hasUnconvertedPDFs}
            />
          )}

          {/* Overall progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing PDF files...</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Image Previews and OCR Processor for all files */}
          {allImages.length > 0 && (
            <div className="flex flex-col space-y-4">
              <div className="space-y-4">
                <PDFImageHeader
                  file={files[0]} // Use first file for header info
                  images={allImages}
                  onError={handleError}
                />
                <PDFImageCarousel images={allImages} />
              </div>

              {/* OCR Processor Component */}
              <PDFOcrProcessor
                model={selectedModel}
                images={allImages}
                file={files[0]} // Use first file for reference
                onError={handleError}
              />
            </div>
          )}

          {/* Show message when files are uploaded but no images available */}
          {files.length > 0 && allImages.length === 0 && !isProcessing && (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {hasPDFFiles 
                  ? "Click 'Convert to Images' to process your PDF files."
                  : "Processing your image files..."
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
