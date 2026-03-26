"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/useTripStore";
import { v4 as uuidv4 } from "uuid";
import ProfileMenu from "@/components/profile-menu";

export default function Home() {
  const router = useRouter();

  const { trips, addTrip, fetchTrips, isLoading } = useTripStore();

  const [newTripName, setNewTripName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW state for tabs, search, and sort
  const [viewMode, setViewMode] = useState<"ongoing" | "finished">("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a_z" | "z_a">(
    "newest",
  );

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    setIsSubmitting(true);

    const newTripId = uuidv4();
    const newTrip = {
      id: newTripId,
      name: newTripName.trim(),
      date: new Date().toISOString().split("T")[0],
      currency: "IDR",
      members: [],
      expenses: [],
      createdAt: new Date().toISOString(),
      status: "ongoing",
    };

    await addTrip(newTrip);
    setNewTripName("");
    setIsCreating(false);

    router.push(`/trip/${newTripId}`);
  };

  // NEW super-powered filter and sort logic
  const processedTrips = trips
    .filter((t) =>
      viewMode === "finished"
        ? t.status === "finished"
        : t.status !== "finished",
    )
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sortBy === "a_z") return a.name.localeCompare(b.name);
      if (sortBy === "z_a") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        {/* header */}
        <div className="flex justify-between items-start mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
              bills app
            </h1>
            <p className="text-sm text-gray-500">
              split expenses with friends, instantly.
            </p>
          </div>
          <ProfileMenu />
        </div>

        {/* create new trip button/form */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full bg-black text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-medium shadow-sm hover:bg-gray-800 transition-colors mb-8"
          >
            <span className="text-lg">+</span> start a new trip
          </button>
        ) : (
          <form
            onSubmit={handleCreateTrip}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium">name your trip</h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-black text-xl leading-none"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="e.g. bali 2026, friday dinner..."
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:bg-gray-400 flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "create & invite friends"
              )}
            </button>
          </form>
        )}

        {/* trips list with tabs, search, and sort */}
        <div>
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => setViewMode("ongoing")}
              className={`pb-2 text-sm font-medium transition-colors ${
                viewMode === "ongoing"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ongoing
            </button>
            <button
              onClick={() => setViewMode("finished")}
              className={`pb-2 text-sm font-medium transition-colors ${
                viewMode === "finished"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              finished
            </button>
          </div>

          {/* NEW search and sort UI */}
          {!isLoading && trips.length > 0 && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "newest" | "oldest" | "a_z" | "z_a",
                  )
                }
                className="text-sm border border-gray-200 bg-white rounded-xl px-2 py-2 focus:outline-none focus:border-black shrink-0 outline-none"
              >
                <option value="newest">newest</option>
                <option value="oldest">oldest</option>
                <option value="a_z">a - z</option>
                <option value="z_a">z - a</option>
              </select>
            </div>
          )}

          {isLoading && trips.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500">syncing with cloud...</p>
            </div>
          ) : processedTrips.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? "no trips found matching your search."
                  : viewMode === "ongoing"
                    ? "no active trips yet. tap above to start!"
                    : "no finished trips yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => router.push(`/trip/${trip.id}`)}
                  className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1 pr-4 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {new Date(trip.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                    →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
