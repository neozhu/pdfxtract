"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";

interface OCRResult {
  pageNumber: number | null;
  markdown: string;
  error: boolean;
}

interface PDFOcrProcessorProps {
  images: string[];
  file: File | null;
  onError: (error: string | null) => void;
}

export function PDFOcrProcessor({ images, file, onError }: PDFOcrProcessorProps) {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);

  // Process a single image using fetch instead of useChat
  const processCurrentImage = useCallback(async (index: number) => {
    try {
      const imageUrl = images[index];
      
      // Add user message to the messages array
      const userMessage = { id: Date.now().toString(), role: 'user', content: imageUrl };
      setMessages(prev => [...prev, userMessage]);
      
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
      
      const result = await response.json();
      
      // Add the AI response to messages
      const aiMessage = { id: Date.now().toString() + '-ai', role: 'assistant', content: result.content };
      setMessages(prev => [...prev, aiMessage]);
      
      // Add the result to our collection
      setOcrResults(prev => [
        ...prev,
        {
          pageNumber: index + 1,
          markdown: result.content,
          error: false
        }
      ]);
      
      // Update the combined markdown content
      setMarkdownContent(prev => prev + (prev ? '\n\n---\n\n' : '') + result.content);
      
      // Process the next image
      const nextIndex = index + 1;
      if (nextIndex < images.length) {
        setCurrentImageIndex(nextIndex);
        processCurrentImage(nextIndex);
      } else {
        setIsOcrProcessing(false);
      }
    } catch (error: any) {
      console.error("Error processing image:", error);
      
      // Add an error entry
      setOcrResults(prev => [
        ...prev,
        {
          pageNumber: index + 1,
          markdown: `Error processing image: ${error.message}`,
          error: true
        }
      ]);
      
      // Add error message to messages
      const errorMessage = { 
        id: Date.now().toString() + '-error', 
        role: 'error', 
        content: `Error processing image: ${error.message}` 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Process the next image despite the error
      const nextIndex = index + 1;
      if (nextIndex < images.length) {
        setCurrentImageIndex(nextIndex);
        processCurrentImage(nextIndex);
      } else {
        setIsOcrProcessing(false);
      }
      
      onError(`Error processing image ${index + 1}: ${error.message}`);
    }
  }, [images, onError]);

  // Start OCR processing for all images
  const performOcr = async () => {
    if (images.length === 0) return;

    setIsOcrProcessing(true);
    setMarkdownContent("");
    setOcrResults([]);
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
      {/* OCR Button */}      <div className="flex justify-between items-center mt-6">
        <Button
          onClick={performOcr}
          disabled={isOcrProcessing}
          className="w-full"
        >
          {isOcrProcessing
            ? `Processing OCR... (${currentImageIndex + 1}/${images.length})`
            : "Extract Text with OCR (Gemini AI)"}
        </Button>
      </div>       {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : message.role === 'error' ? 'Error: ' : 'AI: '}
          <div>{message.content}</div>
        </div>
      ))}
    </div>
  );
}
