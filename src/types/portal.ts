export type AlertType = "warning" | "error" | "info" | "success" | "promo" | "urgent";
export type AlertSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AlertBorder = "none" | "glow" | "pulse" | "shimmer" | "bounce" | "shake" | "rainbow" | "blink";

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
  logoUrl?: string | null;
  alertText?: string | null;
  alertType?: AlertType;
  alertSize?: AlertSize;
  alertGlow?: boolean;
  alertBorder?: AlertBorder;
}

export interface CompanyGroup {
  id: string;
  headerName: string;
  headerIconUrl: string | null;
  companies: Company[];
  alertText?: string | null;
  alertType?: AlertType;
  alertSize?: AlertSize;
  alertGlow?: boolean;
  alertBorder?: AlertBorder;
}

export interface CompanySection {
  heading: string;
  companies: Company[];
  groups?: CompanyGroup[];
  alertText?: string | null;
  alertType?: AlertType;
  alertSize?: AlertSize;
  alertGlow?: boolean;
  alertBorder?: AlertBorder;
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

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  type: AlertType;
  size: AlertSize;
  glow?: boolean;
  border: AlertBorder;
  link: string | null;
  dismissible: boolean;
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
  announcement?: AnnouncementConfig;
}

export interface TpaCareCheck {
  heading: string;
  description: string;
  imageUrl: string | null;
  redirectCode: string;
  redirectId: string;
}
