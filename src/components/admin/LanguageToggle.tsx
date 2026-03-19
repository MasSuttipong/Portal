"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-md border border-gray-300 text-xs font-medium overflow-hidden">
      <button
        onClick={() => setLanguage("th")}
        className={`px-2 py-1 transition-colors ${
          language === "th"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        TH
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 transition-colors ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        EN
      </button>
    </div>
  );
}
