"use client";

import { Shield, Users, Globe, Receipt } from "lucide-react";
import type {
  Company,
  CompanySection,
  ManualData,
  NewsData,
  TpaCareCheck,
} from "@/types/portal";
import ManualSection from "./ManualSection";
import NewsSection from "./NewsSection";
import ClassicCompanyList from "./ClassicCompanyList";
import { withBasePath } from "@/lib/base-path";

interface ClassicViewProps {
  manual: ManualData;
  news: NewsData;
  tpaCareCheck: TpaCareCheck;
  insuranceCompanies: CompanySection;
  selfInsured: CompanySection;
  internationalInsurance: CompanySection;
  deductible: CompanySection;
  onCompanyClick: (company: Company) => void;
}

export default function ClassicView({
  manual,
  news,
  tpaCareCheck,
  insuranceCompanies,
  selfInsured,
  internationalInsurance,
  deductible,
  onCompanyClick,
}: ClassicViewProps) {
  return (
    <div className="max-w-[1190px] mx-auto px-4">
      {/* Banner — full-width header image */}
      <img
        src={withBasePath("/banner/TPA-Care-Portal-Final_Full.png")}
        alt={tpaCareCheck.heading}
        className="w-full h-auto rounded-lg shadow-sm mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_1fr] gap-6 mt-4">
        {/* Col 1: Manual + News (mobile: last) */}
        <aside className="order-3 md:order-1 space-y-4">
          <ManualSection data={manual} />
          <NewsSection data={news} />
        </aside>

        {/* Col 2: Insurance companies (mobile: first) */}
        <div className="order-1 md:order-2">
          <ClassicCompanyList
            section={insuranceCompanies}
            onCompanyClick={onCompanyClick}
            headerColor="bg-blue-600"
            sectionBg="bg-blue-50 border-blue-200"
            headerIcon={<Shield className="w-3.5 h-3.5 text-blue-600" />}
          />
        </div>

        {/* Col 3: Self-insured + International + Deductible (mobile: second) */}
        <div className="order-2 md:order-3 space-y-0">
          <ClassicCompanyList
            section={selfInsured}
            onCompanyClick={onCompanyClick}
            headerColor="bg-green-600"
            sectionBg="bg-green-50 border-green-200"
            headerIcon={<Users className="w-3.5 h-3.5 text-green-600" />}
          />
          <ClassicCompanyList
            section={internationalInsurance}
            onCompanyClick={onCompanyClick}
            headerColor="bg-teal-600"
            sectionBg="bg-teal-50 border-teal-200"
            headerIcon={<Globe className="w-3.5 h-3.5 text-teal-600" />}
          />
          <ClassicCompanyList
            section={deductible}
            onCompanyClick={onCompanyClick}
            headerColor="bg-orange-600"
            sectionBg="bg-orange-50 border-orange-200"
            headerIcon={<Receipt className="w-3.5 h-3.5 text-orange-600" />}
          />
        </div>
      </div>
    </div>
  );
}
