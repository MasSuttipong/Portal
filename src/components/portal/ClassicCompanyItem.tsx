"use client";

import type { Company } from "@/types/portal";
import { withBasePath } from "@/lib/base-path";
import { normalizeAllowedUrl } from "@/lib/url-policy";
import NewBadge from "./NewBadge";
import AlertBadge from "./AlertBadge";
import RemarkText from "./RemarkText";

interface ClassicCompanyItemProps {
  company: Company;
  onCompanyClick: (company: Company) => void;
}

const CLAIM_LABEL: Record<string, string> = {
  OPD_ONLY: "[OPD Only]",
  IPD_ONLY: "[IPD Only]",
};

export default function ClassicCompanyItem({ company, onCompanyClick }: ClassicCompanyItemProps) {
  const { displayName, isClickable, isNew, remark, redirectUrl: rawRedirectUrl, claimType, code, iclaimId } = company;
  const redirectUrl = rawRedirectUrl
    ? normalizeAllowedUrl(rawRedirectUrl, { allowRootRelative: true }) ?? undefined
    : undefined;
  const suspended = !isClickable || (!redirectUrl && (!code || !iclaimId));

  const claimLabel = CLAIM_LABEL[claimType];

  if (suspended && !redirectUrl) {
    return (
      <li className="py-0.5 leading-relaxed">
        <span className="text-sm text-gray-500">{displayName}</span>
        {claimLabel && <span className="text-xs text-gray-400 ml-1">{claimLabel}</span>}
        {isNew && <NewBadge />}
        {company.alertText && <AlertBadge text={company.alertText} type={company.alertType} size={company.alertSize} glow={company.alertGlow} border={company.alertBorder} />}
        {remark && <RemarkText remark={remark} />}
      </li>
    );
  }

  if (redirectUrl) {
    return (
      <li className="py-0.5 leading-relaxed">
        <a
          href={withBasePath(redirectUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
        >
          {displayName}
        </a>
        {claimLabel && <span className="text-xs text-gray-500 ml-1">{claimLabel}</span>}
        {isNew && <NewBadge />}
        {company.alertText && <AlertBadge text={company.alertText} type={company.alertType} size={company.alertSize} glow={company.alertGlow} border={company.alertBorder} />}
        {remark && <RemarkText remark={remark} />}
      </li>
    );
  }

  return (
    <li className="py-0.5 leading-relaxed">
      <button
        type="button"
        onClick={() => onCompanyClick(company)}
        className="text-sm text-blue-700 hover:text-blue-900 hover:underline cursor-pointer text-left"
      >
        {displayName}
      </button>
      {claimLabel && <span className="text-xs text-gray-500 ml-1">{claimLabel}</span>}
      {isNew && <NewBadge />}
      {company.alertText && <AlertBadge text={company.alertText} type={company.alertType} size={company.alertSize} glow={company.alertGlow} border={company.alertBorder} />}
      {remark && <RemarkText remark={remark} />}
    </li>
  );
}
