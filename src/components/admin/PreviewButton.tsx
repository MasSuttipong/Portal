"use client";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import { ExternalLink } from "lucide-react";

export default function PreviewButton() {
  function handleClick() {
    window.open(withBasePath("/"), "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="gap-1.5">
      <ExternalLink className="size-4" />
      ดูตัวอย่าง
    </Button>
  );
}
