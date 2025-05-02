"use client";
import dynamic from "next/dynamic";
import { LogSheet } from "@/types/trip";

const Carousel = dynamic(() => import("./Carousel"), { ssr: false });
const DailyLogCanvas = dynamic(() => import("./DailyLogCanvas"), {
  ssr: false,
});

type Props = { logSheets: LogSheet[] };
export default function DailyLogCarousel({ logSheets }: Props) {
  if (!logSheets?.length) return null;

  return (
    <Carousel>
      {logSheets.map((sheet, i) => (
        <div
          key={i}
          className="
            snap-center                /* lock each slide center */
            flex-shrink-0 
            w-full                     /* fill the viewport width */
            bg-white p-4 rounded-2xl shadow-lg
            flex flex-col items-center
          "
        >
          <h3 className="text-lg font-semibold mb-4">Day {i + 1}</h3>
          <DailyLogCanvas logSheet={sheet} />
        </div>
      ))}
    </Carousel>
  );
}
