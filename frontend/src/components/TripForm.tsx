import { TripResult } from "@/types/trip";
import { useState, ChangeEvent, FormEvent } from "react";

type TripFormData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_used_hours: string;
};

type Props = {
  setResult: (data: TripResult | null) => void;
  setError: (error: string) => void;
};

export default function TripForm({ setResult, setError }: Props) {
  const [formData, setFormData] = useState<TripFormData>({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_used_hours: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/plan-trip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cycle_used_hours: parseFloat(formData.cycle_used_hours),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
        🚛 Plan Your Trip
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            "current_location",
            "pickup_location",
            "dropoff_location",
            "cycle_used_hours",
          ].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type={field === "cycle_used_hours" ? "number" : "text"}
                name={field}
                value={formData[field as keyof TripFormData]}
                onChange={handleChange}
                className="block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`
              flex items-center justify-center
              px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-md
              shadow-md transition duration-200
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
            `}
          >
            ✨ Plan Trip
            {loading && (
              <div className="animate-spin ml-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
