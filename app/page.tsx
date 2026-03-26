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
    <main className="flex min-h-screen flex-col items-center p-6 bg-[#fdfbf7] pb-24">
      <div className="w-full max-w-md relative">
        {/* cozy header */}
        <div className="flex justify-between items-start mb-8 pt-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-800 mb-1">
              nest.
            </h1>
            <p className="text-sm text-stone-500 font-medium">
              split expenses, keep the peace 🌱
            </p>
          </div>
          <ProfileMenu />
        </div>

        {/* trips list with tabs, search, and sort */}
        <div>
          <div className="flex gap-6 mb-6 border-b border-stone-200">
            <button
              onClick={() => setViewMode("ongoing")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                viewMode === "ongoing"
                  ? "text-emerald-700"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              ongoing
              {viewMode === "ongoing" && (
                <span className="absolute -bottom-px left-0 w-full h-0.75 bg-emerald-600 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setViewMode("finished")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                viewMode === "finished"
                  ? "text-emerald-700"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              settled up 🤝
              {viewMode === "finished" && (
                <span className="absolute -bottom-px left-0 w-full h-0.75 bg-emerald-600 rounded-t-full"></span>
              )}
            </button>
          </div>

          {/* soft search and sort ui */}
          {!isLoading && trips.length > 0 && (
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="find a trip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border-none shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-white text-stone-700 placeholder:text-stone-400"
                />
                <svg
                  className="w-4 h-4 text-stone-400 absolute left-4 top-3.5"
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
                className="text-sm border-none shadow-sm bg-white rounded-2xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 shrink-0 text-stone-600 font-medium"
              >
                <option value="newest">newest</option>
                <option value="oldest">oldest</option>
                <option value="a_z">a - z</option>
                <option value="z_a">z - a</option>
              </select>
            </div>
          )}

          {isLoading && trips.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-stone-500 font-medium">
                syncing your nest...
              </p>
            </div>
          ) : processedTrips.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
              <div className="text-4xl mb-4">🕊️</div>
              <p className="text-sm text-stone-500 font-medium">
                {searchQuery
                  ? "hmm, couldn't find that trip."
                  : viewMode === "ongoing"
                    ? "clean slate! where are we heading?"
                    : "no settled trips yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => router.push(`/trip/${trip.id}`)}
                  className="w-full bg-white p-5 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md hover:border-emerald-100 transition-all text-left flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1.5 pr-4 min-w-0">
                    <h3 className="font-semibold text-stone-800 text-lg truncate">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
                      <span>
                        {new Date(trip.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* floating action button (thumb friendly) */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgb(5,150,105,0.3)] flex items-center justify-center text-3xl pb-1 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all z-50"
          >
            +
          </button>
        )}

        {/* bottom sheet style form overlay */}
        {isCreating && (
          <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <form
              onSubmit={handleCreateTrip}
              className="bg-white w-full max-w-md p-6 rounded-4xl shadow-2xl flex flex-col gap-5 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-stone-800">
                  start a tab
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="e.g. weekend in bali 🌴"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-2xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800 placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newTripName.trim()}
                className="w-full bg-emerald-600 text-white rounded-2xl py-4 text-base font-semibold hover:bg-emerald-700 transition-colors disabled:bg-stone-300 disabled:text-stone-500 flex justify-center items-center mt-2"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "let's go 🚀"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
