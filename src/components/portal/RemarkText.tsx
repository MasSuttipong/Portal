"use client";

import SanitizedHtml from "./SanitizedHtml";

interface RemarkTextProps {
  remark: string;
}

export default function RemarkText({ remark }: RemarkTextProps) {
  return (
    <SanitizedHtml
      as="span"
      className="text-destructive text-xs font-medium ml-2 leading-relaxed"
      html={remark}
    />
  );
}
