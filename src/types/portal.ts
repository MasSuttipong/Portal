export type AlertType = "warning" | "error" | "info" | "success" | "promo" | "urgent";
export type AlertSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AlertBorder = "none" | "glow" | "pulse" | "shimmer" | "bounce" | "shake" | "rainbow" | "blink";

export interface Company {
  id: string;
  displayName: string;
  nameEn?: string | null;
  nameTh?: string | null;
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

export type PortalTheme = "default" | "christmas" | "newyear" | "songkran" | "valentine" | "chinese-newyear" | "halloween" | "mothers-day" | "fathers-day" | "spring" | "summer" | "autumn" | "winter" | "party" | "pride";

export interface ThemeConfig {
  activeTheme: PortalTheme;
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
  theme?: ThemeConfig;
}

export interface ProviderPermission {
  providerCode: string;
  name: string;
  apiKey: string;
  allowedCompanyIds: string[];
}

export interface ProviderPermissions {
  providers: ProviderPermission[];
}

export interface TpaCareCheck {
  heading: string;
  description: string;
  imageUrl: string | null;
  redirectCode: string;
  redirectId: string;
}
