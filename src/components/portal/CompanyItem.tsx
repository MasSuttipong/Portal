"use client";

import type { Company } from "@/types/portal";
import NewBadge from "./NewBadge";
import RemarkText from "./RemarkText";

interface CompanyItemProps {
  company: Company;
  onCompanyClick: (company: Company) => void;
}

export default function CompanyItem({
  company,
  onCompanyClick,
}: CompanyItemProps) {
  const { displayName, isClickable, isNew, remark, redirectUrl, claimType, code, iclaimId } = company;

  const badge = isNew ? <NewBadge /> : null;
  const remarkEl = remark ? <RemarkText remark={remark} /> : null;
  const opdOnlyLabel =
    claimType === "OPD_ONLY" ? (
      <span className="text-gray-500 text-sm ml-1">[OPD Only]</span>
    ) : null;

  // Case 1: Has a custom redirectUrl — direct external link, no modal
  if (redirectUrl) {
    return (
      <div className="py-1">
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {displayName}
        </a>
        {opdOnlyLabel}
        {badge}
        {remarkEl}
      </div>
    );
  }

  // Case 2: Clickable with iClaim credentials — triggers modal
  if (isClickable && code && iclaimId) {
    return (
      <div className="py-1">
        <button
          type="button"
          onClick={() => onCompanyClick(company)}
          className="text-blue-600 hover:underline cursor-pointer text-left"
        >
          {displayName}
        </button>
        {opdOnlyLabel}
        {badge}
        {remarkEl}
      </div>
    );
  }

  // Case 3: Not clickable (suspended or no iClaim data)
  return (
    <div className="py-1">
      <span className="text-gray-600">{displayName}</span>
      {opdOnlyLabel}
      {badge}
      {remarkEl}
    </div>
  );
}
