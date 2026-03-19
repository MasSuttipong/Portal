"use client";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PreviewButton() {
  const { t } = useLanguage();

  function handleClick() {
    window.open(withBasePath("/"), "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="gap-1.5">
      <ExternalLink className="size-4" />
      {t("common.preview")}
    </Button>
  );
}
