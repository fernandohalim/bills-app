"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/store/useTripStore";
import { useAlertStore } from "@/store/useAlertStore";
import ProfileMenu from "@/components/profile-menu";
import CreateTripModal from "@/components/create-trip-modal";
import AboutModal from "@/components/about-modal";

type SortType = "newest" | "oldest" | "a_z" | "z_a";

export default function Home() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const { user, trips, fetchTrips, isLoading } = useTripStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"ongoing" | "finished">("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const sortOptions = [
    { value: "newest", label: "newest first", icon: "✨" },
    { value: "oldest", label: "oldest first", icon: "⏳" },
    { value: "a_z", label: "name (a to z)", icon: "🔤" },
    { value: "z_a", label: "name (z to a)", icon: "🔠" },
  ];

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const processedTrips = trips
    .filter((t) =>
      viewMode === "finished"
        ? t.status === "finished"
        : t.status !== "finished",
    )
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((t) => (showOnlyMine ? t.owner_id === user?.id : true))
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

  const displayedTrips = processedTrips.slice(0, visibleCount);
  const hasMoreTrips = visibleCount < processedTrips.length;

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-[#fdfbf7] pb-32 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="w-full max-w-md relative">
        {/* cozy header */}
        <div className="flex justify-between items-start mb-8 pt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black tracking-tight text-emerald-800 drop-shadow-sm">
                nest.
              </h1>
              <button
                onClick={() =>
                  showAlert(
                    "welcome to nest! 🌿 use this to track group expenses for trips, house bills, or even just a shared dinner. we do the math so you can stay friends.",
                    "what is nest? 🐣",
                  )
                }
                className="w-5 h-5 mt-1 rounded-full text-stone-300 hover:text-stone-500 hover:bg-stone-100 flex items-center justify-center transition-all focus:outline-none"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-stone-500 font-bold tracking-wide">
              split expenses, keep the peace 🌱
            </p>
          </div>
          <ProfileMenu />
        </div>

        {/* trips list with animated toggle, search, and sort */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-stone-100 p-1.5 rounded-3xl flex gap-1 relative overflow-hidden mb-6">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[49%] bg-white rounded-2xl shadow-sm transition-all duration-300 ease-out ${viewMode === "ongoing" ? "left-[1%]" : "left-[50%]"}`}
            ></div>
            <button
              onClick={() => {
                setViewMode("ongoing");
                setVisibleCount(5);
              }}
              className={`flex-1 py-3 text-sm z-10 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${viewMode === "ongoing" ? "font-black text-stone-800" : "font-bold text-stone-500 hover:text-stone-700"}`}
            >
              ongoing
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  showAlert(
                    "trips with active spending that haven't been fully paid back yet.",
                    "ongoing trips 🏃‍♂️",
                  );
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-200 hover:text-stone-500 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </button>
            <button
              onClick={() => {
                setViewMode("finished");
                setVisibleCount(5);
              }}
              className={`flex-1 py-3 text-sm z-10 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${viewMode === "finished" ? "font-black text-stone-800" : "font-bold text-stone-500 hover:text-stone-700"}`}
            >
              settled up 🤝
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  showAlert(
                    "trips where everyone has paid their debts and the trip is closed.",
                    "settled trips 🤝",
                  );
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-stone-300 hover:bg-stone-200 hover:text-stone-500 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </button>
          </div>

          {!isLoading && trips.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="search trips..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(5);
                  }}
                  className="w-full pl-12 pr-4 py-4 text-sm font-bold border-2 border-stone-100 shadow-sm rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-stone-700 placeholder:text-stone-300"
                />
                <svg
                  className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowOnlyMine(!showOnlyMine);
                    setVisibleCount(5);
                  }}
                  className={`flex items-center justify-center gap-2 w-full h-full min-h-13 rounded-2xl text-[11px] sm:text-[13px] font-black transition-all border-2 active:scale-95 shadow-sm ${showOnlyMine ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-stone-500 border-stone-100 hover:border-stone-200 hover:text-stone-700"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${showOnlyMine ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-stone-200"}`}
                  ></div>
                  created by me
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      showAlert(
                        "only show trips where you are the owner.",
                        "created by me 👑",
                      );
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${showOnlyMine ? "text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600" : "text-stone-300 hover:bg-stone-100 hover:text-stone-500"}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </button>

                <div className="relative w-full h-full">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center justify-center gap-2 w-full h-full min-h-13 rounded-2xl text-[11px] sm:text-[13px] font-black transition-all border-2 active:scale-95 shadow-sm bg-white ${isSortOpen ? "border-emerald-400 text-stone-800 ring-4 ring-emerald-100" : "border-stone-100 text-stone-500 hover:border-stone-200 hover:text-stone-700"}`}
                  >
                    <span className="opacity-80 text-sm">
                      {sortOptions.find((o) => o.value === sortBy)?.icon}
                    </span>
                    <span>
                      {sortOptions.find((o) => o.value === sortBy)?.label}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${isSortOpen ? "rotate-180 text-emerald-500" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsSortOpen(false)}
                      ></div>
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border-2 border-stone-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as SortType);
                              setIsSortOpen(false);
                              setVisibleCount(5);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-3.5 text-left text-[11px] sm:text-[13px] font-black transition-colors ${sortBy === option.value ? "bg-emerald-50 text-emerald-700" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`}
                          >
                            <span className="text-base">{option.icon}</span>
                            <span className="flex-1">{option.label}</span>
                            {sortBy === option.value && (
                              <span className="text-emerald-500 text-lg leading-none">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading && trips.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xl animate-pulse">🐣</span>
              </div>
              <p className="text-sm text-stone-500 font-bold tracking-wide">
                warming up the nest...
              </p>
            </div>
          ) : processedTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-4xl shadow-sm border-2 border-dashed border-stone-200 relative">
              <div className="text-5xl mb-4 inline-block">🕊️</div>
              <h3 className="text-lg font-extrabold text-stone-800 mb-1">
                {searchQuery ? "no trips found" : "clean slate!"}
              </h3>
              <p className="text-sm font-bold text-stone-400">
                {searchQuery
                  ? "try a different name."
                  : viewMode === "ongoing"
                    ? "where are we heading next?"
                    : "no settled trips yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => router.push(`/trip/${trip.id}`)}
                  className="w-full bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-stone-100 hover:shadow-md hover:border-emerald-200 transition-all text-left flex justify-between items-center group active:scale-[0.98]"
                >
                  <div className="flex flex-col gap-2 pr-4 min-w-0">
                    <h3 className="font-extrabold text-stone-800 text-lg sm:text-xl truncate group-hover:text-emerald-700 transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="bg-stone-50 border border-stone-100 text-stone-500 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          {trip.owner_id === user?.id ? "you" : trip.owner_name}{" "}
                          👑
                        </span>
                        {trip.members && trip.members.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="shrink-0">
                              {trip.members.length}{" "}
                              {trip.members.length === 1 ? "member" : "members"}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-stone-400/80">
                        created at{" "}
                        {new Date(trip.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shadow-sm border border-stone-100 group-hover:border-emerald-200 group-hover:-rotate-45">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
              {hasMoreTrips && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="w-full mt-4 py-4 bg-stone-100 text-stone-500 font-black rounded-3xl hover:bg-stone-200 active:scale-95 transition-all text-sm border-2 border-stone-200/50 hover:border-stone-300 border-dashed"
                >
                  load more trips ⬇️
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 mb-8 text-center animate-in fade-in duration-1000 delay-300 pb-16">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-emerald-500 transition-colors active:scale-95 flex items-center justify-center gap-1.5 mx-auto bg-white/50 px-4 py-2 rounded-full border border-stone-100"
          >
            about?
          </button>
        </div>

        {!isCreating && (
          <div className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 z-40 animate-in slide-in-from-bottom-8 duration-500">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-3 pl-6 pr-2 py-2 bg-stone-900 text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:bg-emerald-600 active:scale-95 transition-all duration-300 group"
            >
              <span className="text-xs font-black tracking-widest uppercase">
                new trip
              </span>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-inner">
                <svg
                  className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}

        <CreateTripModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
        />
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </div>
    </main>
  );
}
