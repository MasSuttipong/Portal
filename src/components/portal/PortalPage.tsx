"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, LayoutGrid, List } from "lucide-react";
import type {
  Company,
  CompanySection,
  ManualData,
  NewsData,
  PortalSettings,
  TpaCareCheck,
} from "@/types/portal";
import type { ViewMode } from "./CompanyItem";

import ManualSection from "./ManualSection";
import NewsSection from "./NewsSection";
import CompanySectionComponent from "./CompanySection";
import TpaCareCheckCard from "./TpaCareCheckCard";
import IClaimModal from "./IClaimModal";
import CompanyItem from "./CompanyItem";
import ViewModeToggle from "./ViewModeToggle";
import ClassicView from "./ClassicView";
import AnnouncementBanner from "./AnnouncementBanner";
import { withBasePath } from "@/lib/base-path";

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

interface TabData {
  key: string;
  label: string;
  count: number;
  section: CompanySection;
}

interface SearchResult {
  company: Company;
  sectionLabel: string;
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
  const [activeTab, setActiveTab] = useState("insurance");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [isClassic, setIsClassic] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("portal-view-mode");
    if (saved === "classic") setIsClassic(true);
    setMounted(true);
  }, []);

  function handleToggleClassic() {
    setIsClassic((prev) => {
      const next = !prev;
      localStorage.setItem("portal-view-mode", next ? "classic" : "modern");
      return next;
    });
  }

  function handleCompanyClick(company: Company) {
    setSelectedCompany(company);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedCompany(null);
  }

  const tabs: TabData[] = useMemo(() => {
    function countCompanies(section: CompanySection): number {
      const groupCount = section.groups?.reduce((sum, g) => sum + g.companies.length, 0) ?? 0;
      return section.companies.length + groupCount;
    }
    return [
      { key: "insurance", label: insuranceCompanies.heading, count: countCompanies(insuranceCompanies), section: insuranceCompanies },
      { key: "self-insured", label: selfInsured.heading, count: countCompanies(selfInsured), section: selfInsured },
      { key: "international", label: internationalInsurance.heading, count: countCompanies(internationalInsurance), section: internationalInsurance },
      { key: "deductible", label: deductible.heading, count: countCompanies(deductible), section: deductible },
    ];
  }, [insuranceCompanies, selfInsured, internationalInsurance, deductible]);

  const activeSection = tabs.find((t) => t.key === activeTab)?.section ?? tabs[0].section;

  const searchResults: SearchResult[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];
    for (const tab of tabs) {
      const label = tab.label;
      for (const co of tab.section.companies) {
        if (co.displayName.toLowerCase().includes(q)) {
          results.push({ company: co, sectionLabel: label });
        }
      }
      if (tab.section.groups) {
        for (const group of tab.section.groups) {
          for (const co of group.companies) {
            if (co.displayName.toLowerCase().includes(q)) {
              results.push({ company: co, sectionLabel: label });
            }
          }
        }
      }
    }
    return results;
  }, [searchQuery, tabs]);

  const isSearching = searchQuery.trim().length > 0;

  if (!mounted) return null;

  return (
    <>
      {/* Announcement Banner — top, both views */}
      <AnnouncementBanner announcement={settings.announcement} />

      {/* View mode toggle — top-right */}
      <div className="flex justify-end mb-2">
        <ViewModeToggle isClassic={isClassic} onToggle={handleToggleClassic} />
      </div>

      {isClassic ? (
        <ClassicView
          manual={manual}
          news={news}
          tpaCareCheck={tpaCareCheck}
          insuranceCompanies={insuranceCompanies}
          selfInsured={selfInsured}
          internationalInsurance={internationalInsurance}
          deductible={deductible}
          onCompanyClick={handleCompanyClick}
        />
      ) : (
        <>
          {/* Banner — full width */}
          <div className="animate-fade-in-up stagger-1">
            <img
              src={withBasePath("/banner/TPA-Care-Portal-Final_Full.png")}
              alt={tpaCareCheck.heading}
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>

          {/* Search bar + view toggle */}
          <div className="animate-fade-in-up stagger-3 mt-6 mb-4 flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาบริษัทประกัน..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-card text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-2.5 transition-colors ${
                  viewMode === "card"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                title="มุมมองรายการ"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Search results */}
          {isSearching ? (
            <div className="animate-fade-in-up">
              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  ไม่พบผลลัพธ์สำหรับ &quot;{searchQuery}&quot;
                </div>
              ) : viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {searchResults.map((r) => (
                    <CompanyItem
                      key={r.company.id}
                      company={r.company}
                      onCompanyClick={handleCompanyClick}
                      sectionLabel={r.sectionLabel}
                      viewMode="card"
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {searchResults.map((r) => (
                    <CompanyItem
                      key={r.company.id}
                      company={r.company}
                      onCompanyClick={handleCompanyClick}
                      sectionLabel={r.sectionLabel}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="animate-fade-in-up stagger-3 mb-4">
                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`portal-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 ${
                        activeTab === tab.key
                          ? "portal-tab-active bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        ({tab.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main content + sidebar */}
              <div className="animate-fade-in-up stagger-4 flex gap-6">
                <main className="flex-1 min-w-0">
                  <CompanySectionComponent
                    section={activeSection}
                    onCompanyClick={handleCompanyClick}
                    viewMode={viewMode}
                  />
                </main>
                <aside className="w-64 shrink-0 hidden lg:block space-y-4">
                  <ManualSection data={manual} />
                  <NewsSection data={news} />
                </aside>
              </div>

              {/* Mobile manual + news */}
              <div className="lg:hidden mt-6 space-y-4 animate-fade-in-up stagger-5">
                <ManualSection data={manual} />
                <NewsSection data={news} />
              </div>
            </>
          )}
        </>
      )}

      <IClaimModal
        open={modalOpen}
        onClose={handleModalClose}
        company={selectedCompany}
        settings={settings.iclaim}
      />
    </>
  );
}
