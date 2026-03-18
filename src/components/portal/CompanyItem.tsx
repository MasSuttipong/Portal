"use client";

import type { Company } from "@/types/portal";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NewBadge from "./NewBadge";
import AlertBadge from "./AlertBadge";
import RemarkText from "./RemarkText";

function safeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch { /* invalid URL */ }
  return undefined;
}

export type ViewMode = "card" | "list";

interface CompanyItemProps {
  company: Company;
  onCompanyClick: (company: Company) => void;
  sectionLabel?: string;
  viewMode?: ViewMode;
}

const CLAIM_BADGE: Record<string, string> = {
  OPD_ONLY: "OPD",
  IPD_ONLY: "IPD",
};

export default function CompanyItem({
  company,
  onCompanyClick,
  sectionLabel,
  viewMode = "card",
}: CompanyItemProps) {
  const { displayName, isClickable, isNew, remark, redirectUrl: rawRedirectUrl, claimType, code, iclaimId, logoUrl } = company;
  const redirectUrl = safeUrl(rawRedirectUrl);

  const suspended = !isClickable || (!redirectUrl && (!code || !iclaimId));

  // --- LIST MODE ---
  if (viewMode === "list") {
    return (
      <ListItem
        company={company}
        suspended={suspended}
        onCompanyClick={onCompanyClick}
        sectionLabel={sectionLabel}
      />
    );
  }

  // --- CARD MODE ---
  const logo = logoUrl ? (
    <img src={logoUrl} alt="" className="w-12 h-12 object-contain rounded shrink-0" />
  ) : (
    <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center shrink-0">
      <Building2 className="size-5 text-muted-foreground" />
    </div>
  );

  const badges = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isNew && <NewBadge />}
      {company.alertText && <AlertBadge text={company.alertText} type={company.alertType} size={company.alertSize} glow={company.alertGlow} border={company.alertBorder} />}
      {CLAIM_BADGE[claimType] && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-4">
          {CLAIM_BADGE[claimType]}
        </Badge>
      )}
      {sectionLabel && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-4">
          {sectionLabel}
        </Badge>
      )}
    </div>
  );

  const cardBase = "company-card flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-200";

  if (suspended && !redirectUrl) {
    return (
      <div className={`${cardBase} opacity-60 grayscale`}>
        {logo}
        <div className="min-w-0 flex-1">
          <span className="text-base text-portal-suspended block truncate">{displayName}</span>
          {badges}
          {remark && <RemarkText remark={remark} />}
        </div>
      </div>
    );
  }

  if (redirectUrl) {
    return (
      <a
        href={redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardBase} company-card-clickable cursor-pointer border-l-3 border-l-portal-gold/60 hover:border-l-portal-gold hover:shadow-md`}
      >
        {logo}
        <div className="min-w-0 flex-1">
          <span className="text-base font-medium text-portal-link block truncate">{displayName}</span>
          {badges}
          {remark && <RemarkText remark={remark} />}
        </div>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onCompanyClick(company)}
      className={`${cardBase} company-card-clickable cursor-pointer border-l-3 border-l-portal-gold/60 hover:border-l-portal-gold hover:shadow-md w-full text-left`}
    >
      {logo}
      <div className="min-w-0 flex-1">
        <span className="text-base font-medium text-portal-link block truncate">{displayName}</span>
        {badges}
        {remark && <RemarkText remark={remark} />}
      </div>
    </button>
  );
}

// ---- List row sub-component ----

function ListItem({
  company,
  suspended,
  onCompanyClick,
  sectionLabel,
}: {
  company: Company;
  suspended: boolean;
  onCompanyClick: (company: Company) => void;
  sectionLabel?: string;
}) {
  const { displayName, isClickable, isNew, remark, redirectUrl: rawRedirectUrl2, claimType, code, iclaimId, logoUrl } = company;
  const redirectUrl = safeUrl(rawRedirectUrl2);

  const logo = logoUrl ? (
    <img src={logoUrl} alt="" className="w-6 h-6 object-contain rounded shrink-0" />
  ) : (
    <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0">
      <Building2 className="size-3.5 text-muted-foreground" />
    </div>
  );

  const inlineBadges = (
    <>
      {isNew && <NewBadge />}
      {company.alertText && <AlertBadge text={company.alertText} type={company.alertType} size={company.alertSize} glow={company.alertGlow} border={company.alertBorder} />}
      {CLAIM_BADGE[claimType] && (
        <Badge variant="outline" className="text-[10px] px-1 py-0 leading-4 ml-1">
          {CLAIM_BADGE[claimType]}
        </Badge>
      )}
      {sectionLabel && (
        <Badge variant="secondary" className="text-[10px] px-1 py-0 leading-4 ml-1">
          {sectionLabel}
        </Badge>
      )}
    </>
  );

  const rowBase = "flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md transition-colors";

  if (suspended && !redirectUrl) {
    return (
      <div className={`${rowBase} opacity-60`}>
        {logo}
        <span className="text-base text-portal-suspended truncate">{displayName}</span>
        {inlineBadges}
        {remark && <RemarkText remark={remark} />}
      </div>
    );
  }

  if (redirectUrl) {
    return (
      <div className={`${rowBase} hover:bg-secondary/50`}>
        {logo}
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-portal-link hover:text-portal-link-hover font-medium transition-colors truncate"
        >
          {displayName}
        </a>
        {inlineBadges}
        {remark && <RemarkText remark={remark} />}
      </div>
    );
  }

  return (
    <div className={`${rowBase} hover:bg-secondary/50`}>
      {logo}
      <button
        type="button"
        onClick={() => onCompanyClick(company)}
        className="text-sm text-portal-link hover:text-portal-link-hover font-medium cursor-pointer text-left transition-colors truncate"
      >
        {displayName}
      </button>
      {inlineBadges}
      {remark && <RemarkText remark={remark} />}
    </div>
  );
}
