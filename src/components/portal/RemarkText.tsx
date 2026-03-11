"use client";

interface RemarkTextProps {
  remark: string;
}

export default function RemarkText({ remark }: RemarkTextProps) {
  return (
    <span className="text-red-500 text-sm ml-2 leading-relaxed">{remark}</span>
  );
}
