"use client";

import { Monitor, ScrollText } from "lucide-react";

interface ViewModeToggleProps {
  isClassic: boolean;
  onToggle: () => void;
}

export default function ViewModeToggle({ isClassic, onToggle }: ViewModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm"
    >
      {isClassic ? (
        <>
          <Monitor className="size-3.5" />
          <span>มุมมองใหม่</span>
        </>
      ) : (
        <>
          <ScrollText className="size-3.5" />
          <span>มุมมองคลาสสิก</span>
        </>
      )}
    </button>
  );
}
