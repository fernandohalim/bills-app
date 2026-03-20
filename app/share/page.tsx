"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LZString from "lz-string";
import { Trip } from "@/lib/types";
import { useTripStore } from "@/store/useTripStore";

function ShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addTrip, trips } = useTripStore();
  
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const data = searchParams.get("d");
    if (!data) {
      setError(true);
      return;
    }

    try {
      // decompress the string back into json
      const decompressed = LZString.decompressFromEncodedURIComponent(data);
      if (!decompressed) throw new Error("failed to decompress");
      
      const parsedTrip: Trip = JSON.parse(decompressed);
      setSharedTrip(parsedTrip);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }, [searchParams]);

  const handleImport = () => {
    if (!sharedTrip) return;
    
    // check if this trip ID already exists in your local storage
    const existingTrip = trips.find(t => t.id === sharedTrip.id);

    if (existingTrip) {
      // if you already have it and yours is NOT read-only, 
      // just go to your version. don't overwrite it with a locked one!
      router.push(`/trip/${existingTrip.id}`);
    } else {
      // if it's truly new to this device, import it as read-only
      addTrip({ ...sharedTrip, isReadOnly: true });
      router.push(`/trip/${sharedTrip.id}`);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-500 mb-4">this link is broken or invalid.</p>
        <button onClick={() => router.push('/')} className="text-sm px-4 py-2 bg-black text-white rounded-lg">go to home</button>
      </div>
    );
  }

  if (!sharedTrip) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-sm text-gray-400 animate-pulse">unpacking trip data...</p></div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col gap-6">
        
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
          ✈️
        </div>

        <div>
          <h1 className="text-xl font-medium tracking-tight mb-2">you've been invited!</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            someone shared the <span className="font-medium text-black">"{sharedTrip.name}"</span> trip with you. it has {sharedTrip.members.length} members and {sharedTrip.expenses.length} expenses.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={handleImport} className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            import & view trip
          </button>
          <button onClick={() => router.push('/')} className="w-full py-3 text-sm text-gray-500 hover:text-black transition-colors">
            cancel
          </button>
        </div>

      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-gray-400">loading...</p></div>}>
      <ShareContent />
    </Suspense>
  );
}