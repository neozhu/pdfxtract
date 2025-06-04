"use client";

import React, { useRef, useEffect, useState } from "react";
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
import { LightGallery as LGInstance } from 'lightgallery/lightgallery';

// Lightgallery styles and plugins
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-rotate.css'; // 添加旋转插件样式
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgRotate from 'lightgallery/plugins/rotate'; // 导入旋转插件

// 定义 TypeScript 接口以避免类型错误
interface ZoomSettings {
  scale?: number;
  enableZoomAfter?: number;
  actualSize?: boolean;
}

interface RotateSettings {
  rotateLeft?: boolean;
  rotateRight?: boolean;
}

interface ToolbarSettings {
  showToolbar?: boolean;
  buttons?: string[];
}

interface PDFImageCarouselProps {
  images: string[];
}

export function PDFImageCarousel({ images }: PDFImageCarouselProps) {
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const lightGalleryInstance = useRef<any>(null);
  // Initialize lightGallery when component mounts
  useEffect(() => {
    if (galleryContainerRef.current) {      // 使用 as any 来避免类型错误
      const galleryOptions = {
        plugins: [lgZoom, lgThumbnail, lgRotate],
        dynamic: true,
        dynamicEl: images.map((src, index) => ({
          src,
          thumb: src,
          subHtml: `<h4>Page ${index + 1}</h4>`
        })),
        
        // 基本设置
        download: false,
        closable: true, 
        showCloseIcon: true,
        escKey: true,  // 允许 ESC 键关闭
        fullScreen: true, // 允许全屏
        counter: true,    // 显示计数器
        
        // 显示样式
        addClass: 'lg-pdf-viewer',
        backdropDuration: 300,
        mode: 'lg-fade',
        
        // 缩放设置
        zoomFromOrigin: false,
        
        // 旋转相关
        flipHorizontal: true,
        flipVertical: true,
        rotateLeft: true,
        rotateRight: true,
        
        // 控制导航
        controls: true,
        enableDrag: true,
        enableSwipe: true,
        mousewheel: true, // 鼠标滚轮支持
        
        // 高级设置
        mobileSettings: {
          controls: true,
          showCloseIcon: true,
          download: false,
          rotate: true
        }
      };

      // 将选项强制转换为 any 类型以避免 TypeScript 错误
      lightGalleryInstance.current = lightGallery(galleryContainerRef.current, galleryOptions as any);
    }
    
    // Clean up lightGallery when component unmounts
    return () => {
      if (lightGalleryInstance.current) {
        lightGalleryInstance.current.destroy();
      }
    };
  }, [images]);

  // Function to open lightgallery with a specific slide
  const openLightGallery = (index: number) => {
    if (lightGalleryInstance.current) {
      // Set starting index and open gallery
      lightGalleryInstance.current.openGallery(index);
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
              className={`pl-1 ${
                // On mobile: 1 item per view, on desktop: 4 items per view
                "md:basis-1/2 lg:basis-1/4"
              }`}
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
