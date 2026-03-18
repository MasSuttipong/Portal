"use client";

import CompanySectionPage from "@/components/admin/CompanySectionPage";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DeductiblePage() {
  const { t } = useLanguage();
  return (
    <CompanySectionPage
      filename="deductible"
      pageTitle={t("deductible.pageTitle")}
    />
  );
}
