import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';

export default function BookingsDebug() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings-debug'],
    queryFn: () => bookingsApi.getAll(1, 20),
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (error) return (
    <div className="p-8">
      <h1 className="text-red-500 text-xl">Error:</h1>
      <pre className="bg-gray-100 p-4 rounded mt-2">
        {JSON.stringify(error, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bookings Debug</h1>
      <p>Data loaded: {data?.data?.length || 0} bookings</p>
      <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}