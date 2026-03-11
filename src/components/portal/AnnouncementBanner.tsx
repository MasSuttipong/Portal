"use client";

import { useState } from "react";
import { TriangleAlert, AlertCircle, Info, CircleCheck, PartyPopper, Siren, X } from "lucide-react";
import type { AnnouncementConfig, AlertType, AlertSize, AlertBorder } from "@/types/portal";

interface AnnouncementBannerProps {
  announcement?: AnnouncementConfig;
}

const typeConfig: Record<AlertType, { icon: typeof TriangleAlert; bg: string; text: string; border: string }> = {
  warning: { icon: TriangleAlert, bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-400" },
  error: { icon: AlertCircle, bg: "bg-red-50", text: "text-red-800", border: "border-red-400" },
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-400" },
  success: { icon: CircleCheck, bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-400" },
  promo: { icon: PartyPopper, bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-400" },
  urgent: { icon: Siren, bg: "bg-red-100", text: "text-red-900", border: "border-red-500" },
};

const sizeConfig: Record<AlertSize, { text: string; py: string; px: string; icon: string; gap: string }> = {
  xs: { text: "text-xs", py: "py-1.5", px: "px-3", icon: "size-3.5", gap: "gap-1.5" },
  sm: { text: "text-sm", py: "py-2", px: "px-4", icon: "size-4", gap: "gap-2" },
  md: { text: "text-base", py: "py-3", px: "px-5", icon: "size-5", gap: "gap-2.5" },
  lg: { text: "text-lg font-bold", py: "py-4", px: "px-6", icon: "size-6", gap: "gap-3" },
  xl: { text: "text-xl font-bold", py: "py-5", px: "px-7", icon: "size-7", gap: "gap-3" },
};

const borderClass: Record<AlertBorder, string> = {
  none: "",
  glow: "animate-alert-glow",
  pulse: "animate-alert-pulse",
  shimmer: "animate-alert-shimmer",
  bounce: "animate-alert-bounce",
  shake: "animate-alert-shake",
  rainbow: "animate-alert-rainbow",
  blink: "animate-alert-blink",
};

export default function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || !announcement.text?.trim() || dismissed) {
    return null;
  }

  const { type = "info", size = "md", glow, border = "none", link, dismissible = true } = announcement;
  const t = typeConfig[type];
  const s = sizeConfig[size];
  const Icon = t.icon;
  const effect = border !== "none" ? border : (glow ? "glow" : "none");

  const content = (
    <>
      <Icon className={`${s.icon} shrink-0`} />
      <span className="flex-1">{announcement.text}</span>
    </>
  );

  return (
    <div
      role="alert"
      className={`relative flex items-center ${s.gap} ${s.py} ${s.px} ${s.text} rounded-lg border-2 ${t.bg} ${t.text} ${t.border} mb-3 ${borderClass[effect]}`}
    >
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center ${s.gap} flex-1 underline underline-offset-2 hover:opacity-80 transition-opacity`}
        >
          {content}
        </a>
      ) : (
        <div className={`flex items-center ${s.gap} flex-1`}>
          {content}
        </div>
      )}
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          title="ปิด"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
