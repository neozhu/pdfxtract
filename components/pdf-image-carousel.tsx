"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
// Import directly from lightGallery instead of React component
import lightGallery from 'lightgallery';

// Lightgallery styles and plugins
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-rotate.css'; // 添加旋转插件样式
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgRotate from 'lightgallery/plugins/rotate'; // 导入旋转插件

export function PDFImageCarousel({ images }: { images: string[] }) {
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  // Use unknown type to avoid any lint warning
  const lightGalleryInstance = useRef<unknown>(null);
  // Initialize lightGallery when component mounts
  useEffect(() => {
    if (galleryContainerRef.current) {
      const galleryOptions = {
        plugins: [lgZoom, lgThumbnail, lgRotate],
        dynamic: true,
        dynamicEl: images.map((src, index) => ({
          src,
          thumb: src,
          subHtml: `<h4>Page ${index + 1}</h4>`
        })),
        // Basic settings
        download: false,
        closable: true, 
        showCloseIcon: true,
        escKey: true,  // Allow ESC key to close
        fullScreen: true, // Allow fullscreen
        counter: true,    // Show counter
        // Display style
        addClass: 'lg-pdf-viewer',
        backdropDuration: 300,
        mode: 'lg-fade' as const,
        // Zoom settings
        zoomFromOrigin: false,
        // Rotate settings
        flipHorizontal: true,
        flipVertical: true,
        rotateLeft: true,
        rotateRight: true,
        // Navigation controls
        controls: true,
        enableDrag: true,
        enableSwipe: true,
        mousewheel: true, // Mouse wheel support
        // Advanced settings
        mobileSettings: {
          controls: true,
          showCloseIcon: true,
          download: false,
          rotate: true
        }
      };
      // Only cast to any here
      lightGalleryInstance.current = lightGallery(galleryContainerRef.current, galleryOptions);
    }
    // Clean up lightGallery when component unmounts
    return () => {
      if (lightGalleryInstance.current && typeof (lightGalleryInstance.current as { destroy?: () => void }).destroy === 'function') {
        (lightGalleryInstance.current as { destroy: () => void }).destroy();
      }
    };
  }, [images]);

  // Function to open lightgallery with a specific slide
  const openLightGallery = (index: number) => {
    if (lightGalleryInstance.current && typeof (lightGalleryInstance.current as { openGallery?: (idx: number) => void }).openGallery === 'function') {
      (lightGalleryInstance.current as { openGallery: (idx: number) => void }).openGallery(index);
    }
  };

  return (
    <>
      {/* Hidden container for lightGallery initialization */}
      <div ref={galleryContainerRef} className="hidden"></div>
      <Carousel
        className="w-full relative"
        opts={{ dragFree: true, loop: false }}
      >
        <CarouselContent className="-ml-1">
          {images.map((imageDataUri, index) => (
            <CarouselItem
              key={index}
              className={`pl-1 md:basis-1/2 lg:basis-1/4`}
              onClick={() => openLightGallery(index)}
            >
              <div className="py-1">
                <Card className="py-1 gap-0 hover:opacity-80 cursor-pointer transition-opacity">
                  <CardContent className="flex aspect-square items-center justify-center p-2 relative">
                    <div
                      className="relative w-full h-full"
                      style={{ backgroundColor: "#f5f5f5" }}
                    >
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
    </>
  );
}
