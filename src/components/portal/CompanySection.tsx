"use client";

import type { Company, CompanySection as CompanySectionType } from "@/types/portal";
import type { ViewMode } from "./CompanyItem";
import CompanyList from "./CompanyList";

interface CompanySectionProps {
  section: CompanySectionType;
  onCompanyClick: (company: Company) => void;
  viewMode?: ViewMode;
}

export default function CompanySection({
  section,
  onCompanyClick,
  viewMode = "card",
}: CompanySectionProps) {
  return (
    <CompanyList
      companies={section.companies}
      groups={section.groups}
      onCompanyClick={onCompanyClick}
      viewMode={viewMode}
    />
  );
}
