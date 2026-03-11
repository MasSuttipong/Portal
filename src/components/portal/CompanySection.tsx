"use client";

import type { Company, CompanySection as CompanySectionType } from "@/types/portal";
import CompanyList from "./CompanyList";

interface CompanySectionProps {
  section: CompanySectionType;
  onCompanyClick: (company: Company) => void;
}

export default function CompanySection({
  section,
  onCompanyClick,
}: CompanySectionProps) {
  return (
    <section className="py-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h2>
      <CompanyList
        companies={section.companies}
        groups={section.groups}
        onCompanyClick={onCompanyClick}
      />
    </section>
  );
}
