"use client";

import { useState, useRef, useEffect } from "react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const DAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

// helper to format dates strictly locally without shifting to utc
const formatLocalISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00`;
};

export default function CustomDatePicker({
  value,
  onChange,
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );

  // custom 12hr state
  const [time12, setTime12] = useState(() => {
    let h = currentDate.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return {
      h: String(h).padStart(2, "0"),
      m: String(currentDate.getMinutes()).padStart(2, "0"),
      ampm,
    };
  });

  // sync time if it changes from outside (like an ai scan)
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        let hours = d.getHours();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        setTime12({
          h: String(hours).padStart(2, "0"),
          m: String(d.getMinutes()).padStart(2, "0"),
          ampm,
        });
      }
    }
  }, [value]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  ).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    let hours12 = parseInt(time12.h) || 12;
    if (hours12 === 12) hours12 = 0;
    if (time12.ampm === "PM") hours12 += 12;

    newDate.setHours(hours12, parseInt(time12.m) || 0, 0, 0);
    // output perfectly formatted local time
    onChange(formatLocalISO(newDate));
  };

  const handleTimeChange = (field: "h" | "m" | "ampm", val: string) => {
    if (field !== "ampm") val = val.replace(/\D/g, ""); // strip letters
    const newTime = { ...time12, [field]: val };
    setTime12(newTime);

    let hours12 = parseInt(newTime.h) || 12;
    let mins = parseInt(newTime.m) || 0;
    if (hours12 > 12) hours12 = 12;
    if (mins > 59) mins = 59;

    let hours24 = hours12;
    if (hours24 === 12) hours24 = 0;
    if (newTime.ampm === "PM") hours24 += 12;

    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hours24, mins, 0, 0);
    onChange(formatLocalISO(newDate));
  };

  // cleanup weird inputs when clicking away
  const handleBlur = (field: "h" | "m") => {
    let val = parseInt(time12[field]) || (field === "h" ? 12 : 0);
    if (field === "h" && val > 12) val = 12;
    if (field === "h" && val === 0) val = 12;
    if (field === "m" && val > 59) val = 59;
    setTime12((prev) => ({ ...prev, [field]: String(val).padStart(2, "0") }));
  };

  const formattedDisplay = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return (
      d.getFullYear() === viewDate.getFullYear() &&
      d.getMonth() === viewDate.getMonth() &&
      d.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewDate.getFullYear() &&
      today.getMonth() === viewDate.getMonth() &&
      today.getDate() === day
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-13 flex items-center justify-between bg-white border-2 border-stone-100 shadow-sm rounded-2xl px-4 py-3.5 text-sm font-bold text-stone-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all active:scale-[0.98]"
      >
        <span>{formattedDisplay}</span>
        <svg
          className="w-5 h-5 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border-2 border-stone-100 rounded-3xl shadow-xl z-50 w-76 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="font-black text-stone-800 text-sm tracking-wide">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-black uppercase text-stone-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center
                    ${
                      selected
                        ? "bg-emerald-500 text-white shadow-md scale-105"
                        : today
                          ? "text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* strictly custom 12-hour am/pm picker */}
          <div className="pt-4 border-t-2 border-stone-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 bg-stone-50 border-2 border-stone-100 rounded-xl flex items-center px-2 py-1.5 overflow-hidden hover:border-emerald-200 transition-colors focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
              <svg
                className="w-4 h-4 text-stone-400 shrink-0 mx-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <div className="flex items-center gap-0.5">
                <input
                  type="text"
                  maxLength={2}
                  value={time12.h}
                  onChange={(e) => handleTimeChange("h", e.target.value)}
                  onBlur={() => handleBlur("h")}
                  className="w-6 text-center bg-transparent text-sm font-black text-stone-700 focus:outline-none placeholder:text-stone-300"
                />
                <span className="text-stone-400 font-black pb-0.5">:</span>
                <input
                  type="text"
                  maxLength={2}
                  value={time12.m}
                  onChange={(e) => handleTimeChange("m", e.target.value)}
                  onBlur={() => handleBlur("m")}
                  className="w-6 text-center bg-transparent text-sm font-black text-stone-700 focus:outline-none placeholder:text-stone-300"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  handleTimeChange("ampm", time12.ampm === "AM" ? "PM" : "AM")
                }
                className="ml-auto px-2 py-1 bg-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
              >
                {time12.ampm}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 px-5 py-2.5 bg-stone-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-md"
            >
              done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
