"use client";

import CompanySectionPage from "@/components/admin/CompanySectionPage";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function InternationalPage() {
  const { t } = useLanguage();
  return (
    <CompanySectionPage
      filename="international-insurance"
      pageTitle={t("international.pageTitle")}
    />
  );
}
