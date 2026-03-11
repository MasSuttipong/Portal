"use client";

import type { Company, CompanyGroup as CompanyGroupType } from "@/types/portal";
import CompanyItem from "./CompanyItem";

interface CompanyGroupProps {
  group: CompanyGroupType;
  onCompanyClick: (company: Company) => void;
}

export default function CompanyGroup({
  group,
  onCompanyClick,
}: CompanyGroupProps) {
  return (
    <div className="py-2">
      {/* Group header */}
      <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
        {group.headerIconUrl && (
          <img
            src={group.headerIconUrl}
            alt=""
            className="w-5 h-5 object-contain"
          />
        )}
        <span>{group.headerName}</span>
      </div>

      {/* Child companies with indent */}
      <div className="ml-5 border-l-2 border-gray-200 pl-3">
        {group.companies.map((company) => (
          <CompanyItem
            key={company.id}
            company={company}
            onCompanyClick={onCompanyClick}
          />
        ))}
      </div>
    </div>
  );
}
