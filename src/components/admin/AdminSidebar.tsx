"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "ข่าวสาร", href: "/admin/news" },
  { label: "คู่มือ", href: "/admin/manual" },
  { label: "บริษัทประกัน", href: "/admin/insurance" },
  { label: "สวัสดิการพนักงาน", href: "/admin/self-insured" },
  { label: "ประกันต่างประเทศ", href: "/admin/international" },
  { label: "Deductible", href: "/admin/deductible" },
  { label: "ตั้งค่า", href: "/admin/settings" },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

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
                    "block px-4 py-2 rounded text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
