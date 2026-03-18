"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage, type TranslationKey } from "@/lib/i18n/LanguageContext";
import { Newspaper, BookOpen, Shield, Building2, Globe, Receipt, Settings, type LucideIcon } from "lucide-react";

interface NavItem {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { labelKey: "nav.news", href: "/admin/news", icon: Newspaper },
  { labelKey: "nav.manual", href: "/admin/manual", icon: BookOpen },
  { labelKey: "nav.insurance", href: "/admin/insurance", icon: Shield },
  { labelKey: "nav.selfInsured", href: "/admin/self-insured", icon: Building2 },
  { labelKey: "nav.international", href: "/admin/international", icon: Globe },
  { labelKey: "nav.deductible", href: "/admin/deductible", icon: Receipt },
  { labelKey: "nav.settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full min-h-screen md:min-h-0">
      <div className="px-4 py-5 border-b border-gray-200">
        <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          BVTPA Admin
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 rounded text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
