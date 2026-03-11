"use client";

import type { Company, CompanySection } from "@/types/portal";
import type { ReactNode } from "react";
import ClassicCompanyItem from "./ClassicCompanyItem";
import AlertBadge from "./AlertBadge";

interface ClassicCompanyListProps {
  section: CompanySection;
  onCompanyClick: (company: Company) => void;
  headerColor?: string;
  sectionBg?: string;
  headerIcon?: ReactNode;
}

export default function ClassicCompanyList({ section, onCompanyClick, headerColor, sectionBg, headerIcon }: ClassicCompanyListProps) {
  return (
    <div className={`mb-6 rounded-md border p-3 ${sectionBg ?? "bg-gray-50 border-gray-200"}`}>
      <h2 className={`text-sm font-bold text-white px-2 py-1.5 mb-2 rounded-sm flex items-center gap-2 ${headerColor ?? "bg-gray-700"}`}>
        {headerIcon && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 shrink-0">
            {headerIcon}
          </span>
        )}
        {section.heading}
        {section.alertText && <AlertBadge text={section.alertText} type={section.alertType} size={section.alertSize} glow={section.alertGlow} border={section.alertBorder} />}
      </h2>

      {section.companies.length > 0 && (
        <ul className="list-disc list-inside space-y-0">
          {section.companies.map((co) => (
            <ClassicCompanyItem key={co.id} company={co} onCompanyClick={onCompanyClick} />
          ))}
        </ul>
      )}

      {section.groups?.map((group) => (
        <div key={group.id} className="mt-3">
          <h3 className="text-sm font-bold text-gray-700 mb-1">
            {group.headerName}
            {group.alertText && <AlertBadge text={group.alertText} type={group.alertType} size={group.alertSize} glow={group.alertGlow} border={group.alertBorder} />}
          </h3>
          <ul className="list-disc list-inside pl-4 space-y-0">
            {group.companies.map((co) => (
              <ClassicCompanyItem key={co.id} company={co} onCompanyClick={onCompanyClick} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
