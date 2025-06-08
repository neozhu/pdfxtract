"use client";

import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf"];
const ALLOWED_EXTENSIONS = [".pdf"];

interface PDFFileUploaderProps {
  onFileSelect: (file: File) => void;
  onError: (error: string | null) => void;
  file: File | null;
  pageCount: number;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  id: string;
  error?: string;
  isRemoving?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (
    !ALLOWED_FILE_TYPES.includes(file.type) &&
    !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  ) {
    return { isValid: false, error: "Only PDF files are allowed" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size cannot exceed ${formatFileSize(MAX_FILE_SIZE)}` };
  }

  return { isValid: true };
};

export function PDFFileUploader({ onFileSelect, onError, file: selectedFile, pageCount }: PDFFileUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>(selectedFile ? [{
    file: selectedFile,
    progress: 100,
    status: "completed",
    id: "current"
  }] : []);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Handle file drop and selection
  const handleFileChange = useCallback((newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    const uploadedFile = newFiles[0]; // Only take the first file since multiple is false
    const validation = validateFile(uploadedFile);
    
    if (!validation.isValid) {
      // Show error toast for non-PDF files or oversized files
      toast.error(validation.error || "Invalid file", {
        description: "Please select a valid PDF file within the size limit.",
        duration: 4000,
      });
      //onError(validation.error || "Invalid file");
      return;
    }
    
    onFileSelect(uploadedFile);
    onError(null);
    
    setFiles([{
      file: uploadedFile,
      progress: 100, // Since we're not actually uploading, set to 100%
      status: "completed",
      id: Math.random().toString(36).substr(2, 9),
    }]);
  }, [onFileSelect, onError]);
  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setIsDragOver(false);
      
      // Handle accepted files
      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles);
      }
        // Handle rejected files with toast notifications
      fileRejections.forEach((rejection) => {
        const { errors } = rejection;
        
        // Get the first error message to display
        const errorMessage = errors[0]?.message || "Invalid file";
        
        // Show toast notification for rejected files
        toast.error(errorMessage, {
          duration: 4000,
        });
        
        //onError(errorMessage);
      });
    },
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });
  const removeFile = () => {
    // First set removing state to trigger exit animation
    setFiles(prevFiles => 
      prevFiles.map(file => ({ ...file, isRemoving: true }))
    );
    
    // After animation duration, actually remove the file
    setTimeout(() => {
      setFiles([]);
      onFileSelect(null as unknown as File); // Clear the selected file
      onError(null);
    }, 300); // Match the animation duration
  };
  return (
    <div className="w-full space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors duration-200",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center py-3 px-6 text-center">
          <Upload
            className={cn("h-12 w-12 mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
          />
          <div className="space-y-2">
            <p className="text-lg font-medium"> 
              {isDragOver ? "Release to upload your PDF" : "Drag and drop a PDF file here or click to select"}
            </p>
            <p className="text-sm text-muted-foreground">
              Only PDF files are supported. Maximum file size: {Math.floor(MAX_FILE_SIZE / (1024 * 1024))}MB.
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="mt-4" variant="outline">
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(Array.from(e.target.files));
              }
            }}
            className="hidden"
            {...getInputProps()}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
       
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ease-in-out",
                    fileItem.isRemoving 
                      ? "motion-safe:animate-out motion-safe:slide-out-to-right-4 motion-safe:fade-out motion-safe:duration-300" 
                      : "motion-safe:animate-in motion-safe:slide-in-from-top-4 motion-safe:fade-in motion-safe:duration-300"
                  )}
                >
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate">{fileItem.file.name}</p>
                      <Badge
                        variant={
                          fileItem.status === "completed"
                            ? "default"
                            : fileItem.status === "error"
                              ? "destructive"
                              : fileItem.status === "uploading"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {fileItem.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {fileItem.status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {fileItem.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(fileItem.file.size)}</span>
                      {pageCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
                        </>
                      )}
                    </div>
                    
                    {fileItem.error && <div className="text-sm text-destructive mt-1">{fileItem.error}</div>}
                    {fileItem.status === "uploading" && <Progress value={fileItem.progress} className="mt-2 h-1" />}
                  </div>

                  <Button
                    onClick={removeFile}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
