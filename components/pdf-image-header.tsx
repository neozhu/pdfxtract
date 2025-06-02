"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface PDFImageHeaderProps {
  file: File | null;
  images: string[];
  onError: (error: string | null) => void;
}

export function PDFImageHeader({
  file,
  images,
  onError
}: PDFImageHeaderProps) {
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Download ZIP file from server (creates ZIP file from images in public/pdf-outputs folder)
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
          const response = await fetch("/api/create-zip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
          const link = document.createElement("a");
          link.href = url;
          link.download = `${dirName}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the URL object after download
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
          onError("Could not determine directory name for ZIP download");
        }
      }
    } catch (err) {
      console.error("Error downloading ZIP:", err);
      onError("Failed to download ZIP file");
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
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
  );
}
