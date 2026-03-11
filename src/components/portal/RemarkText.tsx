"use client";

interface RemarkTextProps {
  remark: string;
}

export default function RemarkText({ remark }: RemarkTextProps) {
  return (
    <span className="text-destructive text-xs font-medium ml-2 leading-relaxed">{remark}</span>
  );
}
