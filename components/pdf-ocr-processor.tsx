"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex'
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import './markdown-styles.css';


interface PDFOcrProcessorProps {
  images: string[];
  file: File | null;
  onError: (error: string | null) => void;
}

export function PDFOcrProcessor({ images, file, onError }: PDFOcrProcessorProps) {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const MAX_PAGES = 3; // Maximum number of pages to process


  // Process a single image using fetch instead of useChat
  const processCurrentImage = useCallback(async (index: number) => {
    try {
      const imageUrl = images[index];
      // Call the API using fetch
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: imageUrl }]
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const { content } = await response.json();

      // Update the combined markdown content
      setMarkdownContent(prev => prev + (prev ? '\n\n' : '') + content);      // Process the next image (limited to MAX_PAGES)
      const nextIndex = index + 1;
      if (nextIndex < images.length && nextIndex < MAX_PAGES) {
        setCurrentImageIndex(nextIndex);
        processCurrentImage(nextIndex);      } else {
        setIsOcrProcessing(false);
      }
    } catch (error: Error | unknown) {
      console.error("Error processing image:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError(`Error processing image ${index + 1}: ${errorMessage}`);
    }
  }, [images, onError]);

  // Start OCR processing for all images
  const performOcr = async () => {
    if (images.length === 0) return;

    setIsOcrProcessing(true);
    setMarkdownContent("");
    setCurrentImageIndex(0);
    onError(null);

    // Start with the first image
    processCurrentImage(0);
  };

  // Function to download markdown content
  const downloadMarkdown = () => {
    if (!markdownContent) return;

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (file?.name || "document").replace(/\.pdf$/i, "") + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col space-y-4">
      {/* Info Alert */}      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          To optimize token usage, only the first {MAX_PAGES} pages will be processed. 
          This helps reduce API costs and speeds up processing.
        </AlertDescription>
      </Alert>
      
      {/* OCR Button */}
      <div className="flex justify-between items-center ">
        <Button
          onClick={performOcr}
          disabled={isOcrProcessing}
          className="w-full"
        >
          {isOcrProcessing
            ? `Processing OCR... (${currentImageIndex + 1}/${Math.min(images.length, MAX_PAGES)})`
            : "Extract Text with OCR (Gemini AI)"}
        </Button>
      </div>      {/* Markdown Content Display */}
      {markdownContent && (
        <div className="flex flex-col space-y-2">
          <div className="markdown-content">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeKatex]}>{markdownContent}</Markdown>
          </div>

          <Button 
            onClick={downloadMarkdown} 
            className="mt-4" 
            disabled={isOcrProcessing}
          >
            {isOcrProcessing ? "Waiting..." : "Download Markdown"}
          </Button>
        </div>
      )}
      {/* Error Messages */}
    </div>
  );
}
