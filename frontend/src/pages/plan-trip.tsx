import TripPlanner from "@/components/TripPlanner";

export default function PlanTripPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Plan Your Trip</h1>
        <TripPlanner />
      </div>
    </div>
  );
}
