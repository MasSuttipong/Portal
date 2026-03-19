export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { readContent } from "@/lib/content";
import { verifyProviderToken, PROVIDER_COOKIE_NAME } from "@/lib/auth";
import type {
  PortalSettings,
  ManualData,
  NewsData,
  TpaCareCheck,
  CompanySection,
  ProviderPermissions,
  Company,
} from "@/types/portal";
import PortalPage from "@/components/portal/PortalPage";

function filterSection(section: CompanySection, allowedIds: string[]): CompanySection {
  return {
    ...section,
    companies: section.companies.filter((c: Company) => allowedIds.includes(c.id)),
    groups: section.groups?.map((g) => ({
      ...g,
      companies: g.companies.filter((c: Company) => allowedIds.includes(c.id)),
    })).filter((g) => g.companies.length > 0),
  };
}

export default async function Page() {
  const settings = readContent<PortalSettings>("settings");
  const manual = readContent<ManualData>("manual");
  const news = readContent<NewsData>("news");
  const tpaCareCheck = readContent<TpaCareCheck>("tpacare-check");
  let insuranceCompanies = readContent<CompanySection>("insurance-companies");
  let selfInsured = readContent<CompanySection>("self-insured");
  let internationalInsurance = readContent<CompanySection>("international-insurance");
  let deductible = readContent<CompanySection>("deductible");

  // Provider filtering
  let providerCode: string | null = null;
  const cookieStore = await cookies();
  const providerToken = cookieStore.get(PROVIDER_COOKIE_NAME)?.value;
  if (providerToken) {
    const result = await verifyProviderToken(providerToken);
    if (result) {
      providerCode = result.providerCode;
      const permissions = readContent<ProviderPermissions>("provider-permissions");
      const provider = permissions.providers.find(
        (p) => p.providerCode === providerCode
      );
      if (provider) {
        const ids = provider.allowedCompanyIds;
        insuranceCompanies = filterSection(insuranceCompanies, ids);
        selfInsured = filterSection(selfInsured, ids);
        internationalInsurance = filterSection(internationalInsurance, ids);
        deductible = filterSection(deductible, ids);
      }
    }
  }

  const activeTheme = settings.theme?.activeTheme ?? "default";

  return (
    <main className="min-h-screen bg-background" data-theme={activeTheme !== "default" ? activeTheme : undefined}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-16 py-4 min-h-screen relative z-10">
        <PortalPage
          settings={settings}
          activeTheme={activeTheme}
          manual={manual}
          news={news}
          tpaCareCheck={tpaCareCheck}
          insuranceCompanies={insuranceCompanies}
          selfInsured={selfInsured}
          internationalInsurance={internationalInsurance}
          deductible={deductible}
          providerCode={providerCode}
        />
      </div>
    </main>
  );
}
