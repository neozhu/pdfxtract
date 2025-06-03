"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex'
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2Icon } from "lucide-react";
import rehypePrismPlus from "rehype-prism-plus";
import './markdown-styles.css';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css'
import { useCompletion } from '@ai-sdk/react';


interface PDFOcrProcessorProps {
  images: string[];
  file: File | null;
  onError: (error: string | null) => void;
}

export function PDFOcrProcessor({ images, file, onError }: PDFOcrProcessorProps) {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const MAX_PAGES = 3; // Maximum number of pages to process
  // Use useCompletion to handle streaming responses
  const { complete } = useCompletion({
    api: '/api/chat',
    onFinish: (prompt, completeResponse) => {
      setMarkdownContent((prevContent) => prevContent + completeResponse);
      // Only set the current index to the next one, actual processing is handled by useEffect
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= images.length || nextIndex >= MAX_PAGES) {
          // All pages processed
         setIsOcrProcessing(false);
        }
        return nextIndex < images.length && nextIndex < MAX_PAGES ? nextIndex : prevIndex;
      });
    },
    onError: (error) => {
      console.error("Error processing image:", error);
      const errorMsg = `Error processing image ${currentImageIndex + 1}: ${error.message}`;
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setIsOcrProcessing(false);
    }
  });

  const processNextImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    await complete(imageUrl);
  }, [images, complete]);

  // Listen for currentImageIndex changes to process the next page
  useEffect(() => {
    if (isOcrProcessing && currentImageIndex > 0) {
      // Only process during OCR and not at the initial index
      console.log(`Effect triggered: Processing image at index ${currentImageIndex}`);
      processNextImage(currentImageIndex);
    }
  }, [currentImageIndex, isOcrProcessing]);

  // Start OCR processing for all images
  const performOcr = useCallback(async () => {
    if (images.length === 0) return;
    console.log("Starting OCR processing for images:", images);
    setIsOcrProcessing(true);
    setMarkdownContent("");
    setCurrentImageIndex(0);
    setErrorMessage(null);
    onError(null);
    processNextImage(0);
  }, [images, onError, processNextImage, setIsOcrProcessing, setMarkdownContent, setCurrentImageIndex, setErrorMessage]);



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
            ? <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Processing... ({currentImageIndex + 1}/{Math.min(images.length, MAX_PAGES)})
            </>
            : "Extract Text with OCR"}
        </Button>
      </div>

      {/* Markdown Content Display - 显示流式内容 */}
      {markdownContent && (
        <div className="flex flex-col space-y-2">
          <div className="markdown-content">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeKatex, [rehypePrismPlus, { showLineNumbers: true, ignoreMissing: true }]]}>{markdownContent}</Markdown>
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
      {errorMessage && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
