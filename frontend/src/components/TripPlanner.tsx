import { useState } from "react";
import dynamic from "next/dynamic";
import TripForm from "./TripForm";
import { TripResult } from "@/types/trip";
import DailyLogCarousel from "./DailyLogCarousel";

const MapView = dynamic(() => import("./MapView"), { ssr: false });



export default function TripPlanner() {
  const [result, setResult] = useState<TripResult | null>(null);
  const [error, setError] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-lg mx-auto space-y-8">
        <div className="">
          <TripForm setResult={setResult} setError={setError} />
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6">
            <div className="w-full bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">Map Overview</h2>
              <MapView rests={result.rests} routes={result.routes} />
            </div>

            <div className="w-full bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">
                Daily Log Sheet
              </h2>
              <div className="flex justify-center p-2">
                <DailyLogCarousel logSheets={result.log_sheets || []} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
