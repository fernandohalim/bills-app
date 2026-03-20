"use client";

import { useState } from "react";
import Link from "next/link";
import { useTripStore } from "@/store/useTripStore";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { trips, addTrip, deleteTrip, updateTrip } = useTripStore();

  // state for creating a new trip
  const [isAdding, setIsAdding] = useState(false);
  const [newTripName, setNewTripName] = useState("");

  // state for editing an existing trip
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    addTrip({
      id: uuidv4(),
      name: newTripName.trim(),
      date: new Date().toISOString(),
      currency: "IDR",
      members: [],
      expenses: [],
    });
    setNewTripName("");
    setIsAdding(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`delete the trip "${name}"? this cannot be undone.`)) {
      deleteTrip(id);
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateTrip(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 gap-8 bg-gray-50">
      
      {/* header */}
      <div className="text-center mt-12">
        <h1 className="text-2xl font-medium tracking-tight">bills app</h1>
        <p className="mt-2 text-sm text-gray-500">manage your shared expenses offline.</p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        
        {/* add trip button / form */}
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm hover:border-black hover:text-black transition-colors"
          >
            + create new trip
          </button>
        ) : (
          <form onSubmit={handleCreateTrip} className="flex gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <input 
              type="text" 
              autoFocus
              value={newTripName} 
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="e.g. bali weekend..." 
              className="flex-1 border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-black bg-transparent"
            />
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 text-xs text-gray-500 hover:text-black">
              cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium">
              save
            </button>
          </form>
        )}

        {/* trip list */}
        {trips.length === 0 && !isAdding ? (
          <p className="text-center text-sm text-gray-400 mt-8">no trips yet. create one to begin.</p>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
                
                {editingId === trip.id ? (
                  // edit mode
                  <div className="flex gap-2 items-center mb-3">
                    <input 
                      type="text" 
                      autoFocus
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border-b border-gray-200 py-1 text-sm font-medium focus:outline-none focus:border-black bg-transparent"
                    />
                    <button onClick={() => handleSaveEdit(trip.id)} className="text-xs px-3 py-1.5 bg-black text-white rounded-md">save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs px-2 text-gray-500">cancel</button>
                  </div>
                ) : (
                  // view mode
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{trip.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{trip.members.length} members • {trip.expenses.length} expenses</p>
                    </div>
                    <Link href={`/trip/${trip.id}`} className="text-xs bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      open →
                    </Link>
                  </div>
                )}

                {/* card actions */}
                {editingId !== trip.id && (
                  <div className="flex gap-4 border-t border-gray-50 pt-3 mt-1">
                    {!trip.isReadOnly && (
                      <button onClick={() => handleStartEdit(trip.id, trip.name)} className="text-xs text-gray-500 hover:text-black transition-colors">
                        edit name
                      </button>
                    )}
                    <button onClick={() => handleDelete(trip.id, trip.name)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      delete trip
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}