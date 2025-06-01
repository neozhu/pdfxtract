"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Maximum file size in bytes (20MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

 

// Helper function to get status text based on progress
const getProgressStatus = (progress: number): string => {
  if (progress === 0) return "Starting...";
  if (progress < 30) return "Processing PDF file...";
  if (progress < 70) return "Converting to JPG on server...";
  if (progress < 100) return "Finalizing...";
  return "Completed";
};

export function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];

    // Reset state
    setFile(null);
    setPageCount(0);
    setProgress(0);
    setImages([]);
    setZipBlob(null);
    setError(null);

    if (!uploadedFile) return;

    // Check if file is a PDF
    if (uploadedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    // Check file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }    setFile(uploadedFile);
    
    

  }, []);

  // Dropzone configuration
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  }); // Convert PDF to images directly using the API
  const convertToImages = async () => {
    if (!file) return;

    setConverting(true);
    setProgress(0);
    setImages([]);
    setZipBlob(null);

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
  };  // Download ZIP file from local blob
  const handleDownload = () => {
    if (!zipBlob || !file) return;
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}-jpg-images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object after download
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };
  
  // Download ZIP file from server (creates ZIP file from images in public/pdf-outputs folder)
  const [downloadingZip, setDownloadingZip] = useState(false);
  
  const handleServerZipDownload = async () => {
    if (!file) return;
    
    try {
      setDownloadingZip(true);
      
      // Get directory name from the first image URL
      // Images are stored in /pdf-outputs/{dirName}/page.X.jpg format
      if (images.length > 0) {
        const imageUrl = images[0];
        // Extract directory name from URL path
        const match = imageUrl.match(/\/pdf-outputs\/([^/]+)\//);
        
        if (match && match[1]) {
          const dirName = match[1];
          
          // Call API to create ZIP file
          const response = await fetch('/api/create-zip', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dirName }),
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          
          // Get the blob from the response
          const blob = await response.blob();
          
          // Create a download link and trigger it
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${dirName}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the URL object after download
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
          setError('Could not determine directory name for ZIP download');
        }
      }
    } catch (err) {
      console.error('Error downloading ZIP:', err);
      setError('Failed to download ZIP file');
    } finally {
      setDownloadingZip(false);
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
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              transition-colors
              ${isDragActive ? "bg-primary/5 border-primary" : "border-gray-300 hover:border-primary/50"}
              ${isDragReject ? "border-red-500 bg-red-50" : ""}
              ${isDragAccept ? "border-green-500 bg-green-50" : ""}
            `}
          >
            <input {...getInputProps()} />            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-12 w-12 text-gray-400" />

              {isDragActive ? (
                <p className="text-primary">Drop your PDF here...</p>
              ) : (
                <div>
                  <p className="text-sm">Drag and drop your PDF file here, or click to select</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Only PDF files (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                  </p>
                </div>
              )}

              {file && (
                <div className="text-sm text-green-600 font-medium">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                  {pageCount > 0 && <span>, {pageCount} {pageCount === 1 ? "page" : "pages"}</span>}
                </div>
              )}

              {error && <p className="mt-2 text-red-500">{error}</p>}
            </div>
          </div>

          {/* Conversion Settings */}
          {file && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">
                    Output Quality
                  </label>
                  <Select
                    value={quality}
                    onValueChange={(value: "high" | "medium" | "low") =>
                      setQuality(value)
                    }
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
                onClick={convertToImages}
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
          )}
           {/* Image Previews */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Converted JPG Images</h4>
                <Button 
                  onClick={handleServerZipDownload}
                  disabled={downloadingZip}
                  size="sm"
                  variant="outline"
                >
                  {downloadingZip ? "Creating ZIP..." : "⬇️ Download ZIP"}
                </Button>
              </div>
                <Carousel className="w-full relative" opts={{ dragFree: true, loop: false }}>
                <CarouselContent className="-ml-1">
                  {images.map((imageDataUri, index) => (
                    <CarouselItem 
                      key={index} 
                      className={`pl-1 ${
                        // On mobile: 1 item per view, on desktop: 4 items per view
                        "md:basis-1/2 lg:basis-1/4"
                      }`}
                    >
                      <div className="py-1">
                        <Card className="py-1 gap-0">                          <CardContent className="flex aspect-square items-center justify-center p-2 relative">
                            <div className="relative w-full h-full" style={{ backgroundColor: '#f5f5f5' }}>
                              <Image
                                src={imageDataUri}
                                alt={`Page ${index + 1}`}
                                className="object-contain"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                priority={index < 4}
                                unoptimized // Required for data URLs
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="p-2 text-center">
                            <p className="w-full text-xs text-muted-foreground">
                              Page {index + 1}
                            </p>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              
              {zipBlob && (
                <Button 
                  onClick={handleDownload} 
                  className="w-full"
                  variant="default"
                >
                  ⬇️ Download Converted JPG Images ({(zipBlob.size / 1024 / 1024).toFixed(2)} MB)
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
