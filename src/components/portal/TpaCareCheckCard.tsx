"use client";

import type { TpaCareCheck, PortalSettings } from "@/types/portal";
import { withBasePath } from "@/lib/base-path";
import { buildIClaimUrl } from "@/lib/iclaim";

interface TpaCareCheckCardProps {
  data: TpaCareCheck;
  settings: PortalSettings["iclaim"];
}

export default function TpaCareCheckCard({
  data,
  settings,
}: TpaCareCheckCardProps) {
  function handleClick() {
    // Only redirect if we have valid redirect credentials
    if (data.redirectCode && data.redirectId && data.redirectId !== "0") {
      const url = buildIClaimUrl(
        settings.baseUrl,
        data.redirectCode,
        data.redirectId,
        "OPD"
      );
      window.location.href = url;
    }
  }

  const isClickable =
    Boolean(data.redirectCode) &&
    Boolean(data.redirectId) &&
    data.redirectId !== "0";

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={[
        "my-6 rounded-xl bg-gradient-to-br from-portal-cta to-primary text-white p-8 text-center shadow-lg shadow-primary/20 transition-all duration-300",
        isClickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
          : "opacity-90",
      ].join(" ")}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      {data.imageUrl && (
        <img
          src={withBasePath(data.imageUrl)}
          alt=""
          className="mx-auto mb-4 h-16 w-auto object-contain"
        />
      )}
      <h2 className="text-xl font-bold leading-relaxed font-heading">{data.heading}</h2>
      {data.description && (
        <p className="mt-2 text-blue-100 leading-relaxed">{data.description}</p>
      )}
    </div>
  );
}
