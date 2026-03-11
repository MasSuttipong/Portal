"use client";

import type { Company, CompanyGroup as CompanyGroupType } from "@/types/portal";
import CompanyItem from "./CompanyItem";
import CompanyGroup from "./CompanyGroup";

interface CompanyListProps {
  companies: Company[];
  groups?: CompanyGroupType[];
  onCompanyClick: (company: Company) => void;
}

export default function CompanyList({
  companies,
  groups,
  onCompanyClick,
}: CompanyListProps) {
  return (
    <div>
      {/* Standalone companies */}
      {companies.map((company) => (
        <CompanyItem
          key={company.id}
          company={company}
          onCompanyClick={onCompanyClick}
        />
      ))}

      {/* Company groups */}
      {groups && groups.length > 0 && (
        <div className="mt-2">
          {groups.map((group) => (
            <CompanyGroup
              key={group.id}
              group={group}
              onCompanyClick={onCompanyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
