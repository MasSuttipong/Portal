export interface Company {
  id: string;
  displayName: string;
  code: string | null;
  iclaimId: string | null;
  isClickable: boolean;
  isNew: boolean;
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string | null;
  redirectUrl?: string;
}

export interface CompanyGroup {
  id: string;
  headerName: string;
  headerIconUrl: string | null;
  companies: Company[];
}

export interface CompanySection {
  heading: string;
  companies: Company[];
  groups?: CompanyGroup[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  isNew: boolean;
  isPublished: boolean;
}

export interface NewsData {
  items: NewsItem[];
}

export interface ManualItem {
  id: string;
  title: string;
  url: string;
  isPublished: boolean;
}

export interface ManualData {
  subHeading: string;
  items: ManualItem[];
}

export interface PortalSettings {
  logo: { url: string; alt: string };
  iclaim: {
    baseUrl: string;
    confirmText: string;
    confirmOk: string;
    confirmCancel: string;
    claimTypePrompt: string;
  };
}

export interface TpaCareCheck {
  heading: string;
  description: string;
  imageUrl: string | null;
  redirectCode: string;
  redirectId: string;
}
