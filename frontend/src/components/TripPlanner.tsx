import { useState } from "react";
import dynamic from "next/dynamic";
import TripForm from "./TripForm";

const MapView = dynamic(() => import("./MapView"), { ssr: false });
const DailyLogCanvas = dynamic(() => import("./DailyLogCanvas"), { ssr: false });

export default function TripPlanner() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <TripForm setResult={setResult} setError={setError} />

      {result && (
        <>
          <div className="mt-4">
            <MapView rests={result.rests} routes={result.routes} />
          </div>

          <div className="mt-4">
            <DailyLogCanvas logSheet={result.log_sheets?.[0]} />
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-2 text-red-600 bg-red-100 rounded">{error}</div>
      )}
    </div>
  );
}
