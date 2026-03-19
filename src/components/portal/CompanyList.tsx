"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

function isSuspended(c: Company): boolean {
  return !c.isClickable || (!c.redirectUrl && (!c.code || !c.iclaimId));
}

export default function CompanyList({
  companies,
  groups,
  onCompanyClick,
  viewMode = "card",
}: CompanyListProps) {
  const [showSuspended, setShowSuspended] = useState(false);

  const active = companies.filter((c) => !isSuspended(c));
  const suspended = companies.filter((c) => isSuspended(c));

  const suspendedSection = suspended.length > 0 && (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setShowSuspended(!showSuspended)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown className={`size-4 transition-transform ${showSuspended ? "rotate-180" : ""}`} />
        ระงับชั่วคราว ({suspended.length})
      </button>
      {showSuspended && (
        viewMode === "list" ? (
          <div>
            {suspended.map((company) => (
              <CompanyItem key={company.id} company={company} onCompanyClick={onCompanyClick} viewMode="list" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {suspended.map((company) => (
              <CompanyItem key={company.id} company={company} onCompanyClick={onCompanyClick} viewMode="card" />
            ))}
          </div>
        )
      )}
    </div>
  );

  if (viewMode === "list") {
    return (
      <div>
        {active.map((company) => (
          <CompanyItem key={company.id} company={company} onCompanyClick={onCompanyClick} viewMode="list" />
        ))}
        {groups && groups.length > 0 &&
          groups.map((group) => (
            <CompanyGroup key={group.id} group={group} onCompanyClick={onCompanyClick} viewMode="list" />
          ))}
        {suspendedSection}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {active.map((company) => (
          <CompanyItem key={company.id} company={company} onCompanyClick={onCompanyClick} viewMode="card" />
        ))}
        {groups && groups.length > 0 &&
          groups.map((group) => (
            <CompanyGroup key={group.id} group={group} onCompanyClick={onCompanyClick} viewMode="card" />
          ))}
      </div>
      {suspendedSection}
    </div>
  );
}
