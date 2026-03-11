"use client";

import type { Company, CompanyGroup as CompanyGroupType } from "@/types/portal";
import type { ViewMode } from "./CompanyItem";
import CompanyItem from "./CompanyItem";
import AlertBadge from "./AlertBadge";

interface CompanyGroupProps {
  group: CompanyGroupType;
  onCompanyClick: (company: Company) => void;
  viewMode?: ViewMode;
}

export default function CompanyGroup({
  group,
  onCompanyClick,
  viewMode = "card",
}: CompanyGroupProps) {
  if (viewMode === "list") {
    return (
      <div className="py-2">
        <div className="flex items-center gap-2 font-bold text-primary mb-1 font-heading">
          {group.headerIconUrl && (
            <img src={group.headerIconUrl} alt="" className="w-5 h-5 object-contain" />
          )}
          <span>{group.headerName}</span>
          {group.alertText && <AlertBadge text={group.alertText} type={group.alertType} size={group.alertSize} glow={group.alertGlow} border={group.alertBorder} />}
        </div>
        <div className="ml-5 border-l-2 border-portal-gold/40 pl-3">
          {group.companies.map((company) => (
            <CompanyItem
              key={company.id}
              company={company}
              onCompanyClick={onCompanyClick}
              viewMode="list"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Group header — spans full grid width */}
      <div className="col-span-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/70 font-bold text-primary font-heading">
        {group.headerIconUrl && (
          <img src={group.headerIconUrl} alt="" className="w-5 h-5 object-contain" />
        )}
        <span>{group.headerName}</span>
        {group.alertText && <AlertBadge text={group.alertText} type={group.alertType} size={group.alertSize} glow={group.alertGlow} border={group.alertBorder} />}
      </div>

      {/* Child companies as cards in the grid */}
      {group.companies.map((company) => (
        <CompanyItem
          key={company.id}
          company={company}
          onCompanyClick={onCompanyClick}
          viewMode="card"
        />
      ))}
    </>
  );
}
