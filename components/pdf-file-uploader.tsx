"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface PDFFileUploaderProps {
  onFileSelect: (file: File) => void;
  onError: (error: string | null) => void;
  file: File | null;
  pageCount: number;
}

export function PDFFileUploader({ onFileSelect, onError, file, pageCount }: PDFFileUploaderProps) {
  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    // Check if file is a PDF
    if (uploadedFile.type !== "application/pdf") {
      onError("Only PDF files are allowed.");
      return;
    }

    // Check file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      onError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }
    
    onFileSelect(uploadedFile);
    onError(null);
  }, [onFileSelect, onError]);

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
  });

  return (
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
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
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
      </div>
    </div>
  );
}
