export const dynamic = "force-dynamic";

import { readContent } from "@/lib/content";
import type {
  PortalSettings,
  ManualData,
  NewsData,
  TpaCareCheck,
  CompanySection,
} from "@/types/portal";
import PortalPage from "@/components/portal/PortalPage";

export default function Page() {
  const settings = readContent<PortalSettings>("settings");
  const manual = readContent<ManualData>("manual");
  const news = readContent<NewsData>("news");
  const tpaCareCheck = readContent<TpaCareCheck>("tpacare-check");
  const insuranceCompanies = readContent<CompanySection>("insurance-companies");
  const selfInsured = readContent<CompanySection>("self-insured");
  const internationalInsurance = readContent<CompanySection>(
    "international-insurance"
  );
  const deductible = readContent<CompanySection>("deductible");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[900px] bg-white px-6 py-4 shadow-sm min-h-screen">
        <PortalPage
          settings={settings}
          manual={manual}
          news={news}
          tpaCareCheck={tpaCareCheck}
          insuranceCompanies={insuranceCompanies}
          selfInsured={selfInsured}
          internationalInsurance={internationalInsurance}
          deductible={deductible}
        />
      </div>
    </main>
  );
}
