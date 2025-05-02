"use client";
import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

type Props = { children: React.ReactNode };

export default function Carousel({ children }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);

  // update slide count & current index whenever Embla is ready
  useEffect(() => {
    if (!emblaApi) return;
    setSlidesCount(emblaApi.scrollSnapList().length);

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 md:gap-6 snap-x snap-mandatory">
          {children}
        </div>
      </div>

      {/* Prev */}
      <button
        aria-label="Previous"
        onClick={() => emblaApi?.scrollPrev()}
        className="
          absolute top-1/2 left-2 transform -translate-y-1/2
          bg-white p-2 rounded-full shadow
          opacity-100
        "
      >
        ‹
      </button>

      {/* Next */}
      <button
        aria-label="Next"
        onClick={() => emblaApi?.scrollNext()}
        className="
          absolute top-1/2 right-2 transform -translate-y-1/2
          bg-white p-2 rounded-full shadow
          opacity-100
        "
      >
        ›
      </button>

      {/* Counter */}
      <div className="flex justify-center mt-2 text-sm text-gray-600">
        {selectedIndex + 1} / {slidesCount}
      </div>
    </div>
  );
}
