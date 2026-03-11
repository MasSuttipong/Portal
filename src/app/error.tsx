"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || "ไม่สามารถโหลดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
