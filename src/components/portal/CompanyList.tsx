"use client";

import type { Company, CompanyGroup as CompanyGroupType } from "@/types/portal";
import type { ViewMode } from "./CompanyItem";
import CompanyItem from "./CompanyItem";
import CompanyGroup from "./CompanyGroup";

interface CompanyListProps {
  companies: Company[];
  groups?: CompanyGroupType[];
  onCompanyClick: (company: Company) => void;
  viewMode?: ViewMode;
}

export default function CompanyList({
  companies,
  groups,
  onCompanyClick,
  viewMode = "card",
}: CompanyListProps) {
  if (viewMode === "list") {
    return (
      <div>
        {companies.map((company) => (
          <CompanyItem
            key={company.id}
            company={company}
            onCompanyClick={onCompanyClick}
            viewMode="list"
          />
        ))}
        {groups && groups.length > 0 &&
          groups.map((group) => (
            <CompanyGroup
              key={group.id}
              group={group}
              onCompanyClick={onCompanyClick}
              viewMode="list"
            />
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {companies.map((company) => (
        <CompanyItem
          key={company.id}
          company={company}
          onCompanyClick={onCompanyClick}
          viewMode="card"
        />
      ))}
      {groups && groups.length > 0 &&
        groups.map((group) => (
          <CompanyGroup
            key={group.id}
            group={group}
            onCompanyClick={onCompanyClick}
            viewMode="card"
          />
        ))}
    </div>
  );
}
