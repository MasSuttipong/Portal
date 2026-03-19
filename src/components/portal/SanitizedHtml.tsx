"use client";

import type { JSX } from "react";
import { sanitizeDisplayHtml } from "@/lib/html-sanitizer";

interface SanitizedHtmlProps {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  html: string;
}

export default function SanitizedHtml({
  as = "span",
  className,
  html,
}: SanitizedHtmlProps) {
  const Tag = as;
  const sanitizedHtml = sanitizeDisplayHtml(html);

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
