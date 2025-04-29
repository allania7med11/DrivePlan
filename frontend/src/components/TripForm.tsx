import { useState, ChangeEvent, FormEvent } from 'react';

type TripFormData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_used_hours: string;
};

export default function TripForm() {
  const [formData, setFormData] = useState<TripFormData>({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_used_hours: '',
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

      const response = await fetch(`${backendUrl}/api/plan-trip/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cycle_used_hours: parseFloat(formData.cycle_used_hours),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Something went wrong');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {['current_location', 'pickup_location', 'dropoff_location', 'cycle_used_hours'].map((field) => (
          <div key={field}>
            <label className="block font-semibold capitalize">{field.replace(/_/g, ' ')}</label>
            <input
              type={field === 'cycle_used_hours' ? 'number' : 'text'}
              name={field}
              value={formData[field as keyof TripFormData]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Plan Trip
        </button>
      </form>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && (
        <div className="mt-4 p-2 text-red-600 bg-red-100 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
