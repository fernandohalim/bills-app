"use client";

import { useAlertStore } from "@/store/useAlertStore";

export default function PlayfulAlert() {
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    close,
    confirm,
  } = useAlertStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* blurred backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={type === "alert" ? close : undefined}
      />

      {/* bouncy modal card */}
      <div className="bg-[#fdfbf7] rounded-[2.5rem] p-6 sm:p-8 w-full max-w-sm shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col items-center text-center border-4 border-white mt-8">
        {/* floating emoji badge */}
        <div className="absolute -top-10 w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl border-4 border-[#fdfbf7] shadow-sm transform hover:scale-110 transition-transform duration-300">
          {type === "confirm" && title.includes("nuke")
            ? "🧨"
            : type === "confirm"
              ? "🤔"
              : title.includes("✨")
                ? "✨"
                : "🛑"}
        </div>

        <h3 className="text-2xl font-black text-stone-800 mb-3 mt-8">
          {title}
        </h3>
        <p className="text-sm font-bold text-stone-500 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          {type === "confirm" && (
            <button
              onClick={close}
              className="flex-1 py-4 bg-white border-2 border-stone-200 text-stone-500 rounded-2xl text-sm font-black hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={confirm}
            className={`flex-1 py-4 rounded-2xl text-sm font-black text-white transition-all shadow-xl active:scale-95 ${
              type === "confirm"
                ? title.includes("nuke") || title.includes("delete")
                  ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                  : "bg-stone-900 hover:bg-emerald-500 shadow-stone-900/20 hover:shadow-emerald-500/30"
                : "bg-stone-900 hover:bg-emerald-500 shadow-stone-900/20 hover:shadow-emerald-500/30"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
