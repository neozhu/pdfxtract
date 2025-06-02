"use client";

import React from "react";
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

interface PDFImageCarouselProps {
  images: string[];
}

export function PDFImageCarousel({ images }: PDFImageCarouselProps) {
  return (
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
          >
            <div className="py-1">
              <Card className="py-1 gap-0">
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
  );
}
