import { TriangleAlert, AlertCircle, Info, CircleCheck, PartyPopper, Siren } from "lucide-react";
import type { AlertType, AlertSize, AlertBorder } from "@/types/portal";

interface AlertBadgeProps {
  text: string;
  type?: AlertType;
  size?: AlertSize;
  glow?: boolean;
  border?: AlertBorder;
}

const typeConfig: Record<AlertType, { icon: typeof TriangleAlert; bg: string; text: string; border: string }> = {
  warning: { icon: TriangleAlert, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  error: { icon: AlertCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  success: { icon: CircleCheck, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  promo: { icon: PartyPopper, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" },
  urgent: { icon: Siren, bg: "bg-red-100", text: "text-red-800", border: "border-red-500" },
};

const sizeConfig: Record<AlertSize, { text: string; px: string; py: string; icon: string }> = {
  xs: { text: "text-[9px]", px: "px-1", py: "py-0", icon: "w-2.5 h-2.5" },
  sm: { text: "text-[10px]", px: "px-1.5", py: "py-0.5", icon: "w-3 h-3" },
  md: { text: "text-xs", px: "px-2", py: "py-0.5", icon: "w-3.5 h-3.5" },
  lg: { text: "text-sm", px: "px-2.5", py: "py-1", icon: "w-4 h-4" },
  xl: { text: "text-base", px: "px-3", py: "py-1.5", icon: "w-5 h-5" },
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

export default function AlertBadge({ text, type = "warning", size = "sm", glow, border = "none" }: AlertBadgeProps) {
  const { icon: Icon, bg, text: textColor, border: borderColor } = typeConfig[type];
  const s = sizeConfig[size];
  // backward compat: old glow boolean → border effect
  const effect = border !== "none" ? border : (glow ? "glow" : "none");

  return (
    <span className={`inline-flex items-center gap-1 ${s.px} ${s.py} rounded ${s.text} font-semibold border ${bg} ${textColor} ${borderColor} align-middle ml-1 ${borderClass[effect]}`}>
      <Icon className={`${s.icon} shrink-0`} />
      {text}
    </span>
  );
}
