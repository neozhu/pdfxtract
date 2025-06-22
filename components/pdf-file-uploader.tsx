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
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

interface PDFFileUploaderProps {
  onFileSelect: (files: File[]) => void;
  onError: (error: string | null) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
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
    return { isValid: false, error: "Only PDF and image files are allowed" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size cannot exceed ${formatFileSize(MAX_FILE_SIZE)}` };
  }

  return { isValid: true };
};

export function PDFFileUploader({ onFileSelect, onError, files: selectedFiles, onRemoveFile }: PDFFileUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>(
    selectedFiles.map((file, index) => ({
      file,
      progress: 100,
      status: "completed" as const,
      id: `file-${index}-${file.name}`
    }))
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop and selection
  const handleFileChange = useCallback((newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    // Validate all files
    const validFiles: File[] = [];
    for (const file of newFiles) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid file", {
          description: `File "${file.name}" is invalid.`,
          duration: 4000,
        });
      } else {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length === 0) return;
    
    onFileSelect(validFiles);
    onError(null);
    
    const newFileItems = validFiles.map((file, index) => ({
      file,
      progress: 100,
      status: "completed" as const,
      id: `${Date.now()}-${index}-${file.name}`,
    }));
    
    setFiles(prevFiles => [...prevFiles, ...newFileItems]);
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
      });
    },
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true, // Enable multiple file selection
  });

  const removeFile = (index: number) => {
    // First set removing state to trigger exit animation
    setFiles(prevFiles => 
      prevFiles.map((file, i) => 
        i === index ? { ...file, isRemoving: true } : file
      )
    );
    
    // After animation duration, actually remove the file
    setTimeout(() => {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
      onRemoveFile(index);
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
              {isDragOver ? "Release to upload your files" : "Drag and drop PDF or image files here or click to select"}
            </p>
            <p className="text-sm text-muted-foreground">
              PDF and image files (JPG, PNG, GIF, BMP, WebP) are supported. Maximum file size: {Math.floor(MAX_FILE_SIZE / (1024 * 1024))}MB.
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="mt-4" variant="outline">
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
            multiple
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
          {files.map((fileItem, index) => (
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
                          : "secondary"
                    }
                  >
                    {fileItem.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {fileItem.status === "error" && <AlertCircle className="w-3 h-3 mr-1" />}
                    {fileItem.status === "completed" ? "Ready" : 
                     fileItem.status === "error" ? "Error" : "Processing"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                  </span>
                  {fileItem.file.type.startsWith('image/') && (
                    <Badge variant="outline" className="text-xs">
                      Image
                    </Badge>
                  )}
                  {fileItem.file.type === 'application/pdf' && (
                    <Badge variant="outline" className="text-xs">
                      PDF
                    </Badge>
                  )}
                </div>

                {fileItem.status === "uploading" && (
                  <Progress value={fileItem.progress} className="mt-2 h-1" />
                )}

                {fileItem.error && (
                  <p className="text-xs text-destructive mt-1">{fileItem.error}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
