"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2Icon, StopCircle } from "lucide-react";
import rehypePrismPlus from "rehype-prism-plus";
import "./markdown-styles.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism.css";
import { useCompletion } from "@ai-sdk/react";
import { Model } from "@/lib/models";

interface PDFOcrProcessorProps {
  images: string[];
  file: File | null;
  onError: (error: string | null) => void;
  model?: Model;
}

export function PDFOcrProcessor({
  images,
  file,
  onError,
  model,
}: PDFOcrProcessorProps) {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const MAX_PAGES = 3; // Maximum number of pages to process
  const processingRef = useRef(false);

  // Use useCompletion to handle streaming responses
  const { complete, stop } = useCompletion({
    api: "/api/chat",
    body: { model: model?.id, provider: model?.provider }, // Pass model ID to the API
    onFinish: (prompt, completeResponse) => {
      // Reset processing flag since current processing is done
      processingRef.current = false;

      setMarkdownContent((prevContent) =>
        prevContent ? prevContent + "\n\n" + completeResponse : completeResponse
      );

      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // Process next image if available
        if (nextIndex < images.length && nextIndex < MAX_PAGES) {
          // Use setTimeout to avoid immediate recursive calls
          setTimeout(() => {
            processNextImage(nextIndex);
          }, 100);
          return nextIndex;
        } else {
          // All pages processed
          setIsOcrProcessing(false);
          return prevIndex;
        }
      });
    },
    onError: (error) => {
      console.error("Error processing image:", error);
      const errorMsg = `Error processing image ${currentImageIndex + 1}: ${error.message
        }`;
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setIsOcrProcessing(false);
      processingRef.current = false;
    },
  });

  const processNextImage = useCallback(
    async (index: number) => {
      // Prevent duplicate calls
      if (processingRef.current) {
        console.log("Already processing, skipping:", index);
        return;
      }

      if (index >= images.length || index >= MAX_PAGES) {
        setIsOcrProcessing(false);
        processingRef.current = false;
        return;
      }

      processingRef.current = true;
      const imageUrl = images[index];
      console.log("Processing next image:", index);
      await complete(imageUrl);
      console.log("Done:", index);
    },
    [images, complete, MAX_PAGES]
  );

  // Start OCR processing for all images
  const performOcr = useCallback(async () => {
    if (images.length === 0) return;

    // Reset all states
    setIsOcrProcessing(true);
    setMarkdownContent("");
    setCurrentImageIndex(0);
    setErrorMessage(null);
    onError(null);
    processingRef.current = false;

    // Start processing first image
    processNextImage(0);
  }, [
    images,
    onError,
    processNextImage,
  ]);

  // Stop OCR processing
  const stopOcrProcessing = useCallback(() => {
    stop();
    setIsOcrProcessing(false);
    processingRef.current = false;
    setErrorMessage(null);
    onError(null);
  }, [stop, onError]);

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
          To optimize token usage, only the first {MAX_PAGES} pages will be
          processed. This helps reduce API costs and speeds up processing.
        </AlertDescription>
      </Alert>

      {/* OCR Button - Modern integrated design */}
      <div className="space-y-3">
        <Button
          onClick={isOcrProcessing ? stopOcrProcessing : performOcr}
          variant={isOcrProcessing ? "destructive" : "default"}
          className="w-full transition-all duration-200"
          size="lg"
        >
          {isOcrProcessing ? (
            <>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Processing
            </>
          ) : (
            "Run OCR Extraction"
          )}
        </Button>

        {/* Processing progress card */}
        {isOcrProcessing && (
          <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Processing page {currentImageIndex + 1} of {Math.min(images.length, MAX_PAGES)}
              </div>
              <span className="text-sm font-medium">
                {Math.round((currentImageIndex / Math.min(images.length, MAX_PAGES)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((currentImageIndex / Math.min(images.length, MAX_PAGES)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Markdown Content Display - 显示流式内容 */}
      {markdownContent && (
        <div className="flex flex-col space-y-2">
          <div className="markdown-content">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeKatex,
                [
                  rehypePrismPlus,
                  { showLineNumbers: true, ignoreMissing: true },
                ],
              ]}
            >
              {markdownContent}
            </Markdown>
          </div>




        </div>
      )}

      {/* Content loading skeleton */}
      {isOcrProcessing && (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      )}

      {!isOcrProcessing && markdownContent && (
        <Button
          onClick={downloadMarkdown}
          className="mt-4"
        >
          Download Markdown
        </Button>
      )}
      {/* Error Messages */}
      {errorMessage && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
