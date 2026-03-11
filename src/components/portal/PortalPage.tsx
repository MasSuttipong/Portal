"use client";

import { useState } from "react";
import type {
  Company,
  CompanySection,
  ManualData,
  NewsData,
  PortalSettings,
  TpaCareCheck,
} from "@/types/portal";

import LogoHeader from "./LogoHeader";
import ManualSection from "./ManualSection";
import NewsSection from "./NewsSection";
import CompanySectionComponent from "./CompanySection";
import TpaCareCheckCard from "./TpaCareCheckCard";
import IClaimModal from "./IClaimModal";

interface PortalPageProps {
  settings: PortalSettings;
  manual: ManualData;
  news: NewsData;
  tpaCareCheck: TpaCareCheck;
  insuranceCompanies: CompanySection;
  selfInsured: CompanySection;
  internationalInsurance: CompanySection;
  deductible: CompanySection;
}

export default function PortalPage({
  settings,
  manual,
  news,
  tpaCareCheck,
  insuranceCompanies,
  selfInsured,
  internationalInsurance,
  deductible,
}: PortalPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  function handleCompanyClick(company: Company) {
    setSelectedCompany(company);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedCompany(null);
  }

  return (
    <>
      {/* Logo */}
      <LogoHeader settings={settings} />

      {/* TPA Care Check Card */}
      <TpaCareCheckCard data={tpaCareCheck} settings={settings.iclaim} />

      {/* Insurance Companies */}
      <CompanySectionComponent
        section={insuranceCompanies}
        onCompanyClick={handleCompanyClick}
      />

      {/* Self-Insured */}
      <CompanySectionComponent
        section={selfInsured}
        onCompanyClick={handleCompanyClick}
      />

      {/* International Insurance */}
      <CompanySectionComponent
        section={internationalInsurance}
        onCompanyClick={handleCompanyClick}
      />

      {/* Deductible */}
      <CompanySectionComponent
        section={deductible}
        onCompanyClick={handleCompanyClick}
      />

      {/* Manual */}
      <ManualSection data={manual} />

      {/* News */}
      <NewsSection data={news} />

      {/* iClaim Modal */}
      <IClaimModal
        open={modalOpen}
        onClose={handleModalClose}
        company={selectedCompany}
        settings={settings.iclaim}
      />
    </>
  );
}
