"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">&#x26A0;</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("errors.errorTitle")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || t("errors.errorDefault")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t("common.retry")}
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
