"use client";
import useEmblaCarousel from "embla-carousel-react";

type Props = { children: React.ReactNode };
export default function Carousel({ children }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: false,
  });

  return (
    <div className="relative group">
      {/* Viewport: exactly one card wide */}
      <div
        ref={emblaRef}
        className="overflow-hidden mx-auto w-72 sm:w-80 md:w-96"
      >
        <div className="flex gap-6 snap-x snap-mandatory">
          {children}
        </div>
      </div>

      {/* Prev */}
      <button
        aria-label="Previous"
        className="
          absolute -left-6 top-1/2 z-20 p-2 bg-white rounded-full shadow
          opacity-0 group-hover:opacity-100 transition-opacity
        "
        onClick={() => emblaApi?.scrollPrev()}
      >
        ‹
      </button>

      {/* Next */}
      <button
        aria-label="Next"
        className="
          absolute -right-6 top-1/2 z-20 p-2 bg-white rounded-full shadow
          opacity-0 group-hover:opacity-100 transition-opacity
        "
        onClick={() => emblaApi?.scrollNext()}
      >
        ›
      </button>
    </div>
  );
}
