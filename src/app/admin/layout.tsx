"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PreviewButton from "@/components/admin/PreviewButton";
import { Button } from "@/components/ui/button";
import { withBasePathApi } from "@/lib/base-path";
import { LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch(withBasePathApi("/api/auth/logout"), { method: "POST" });
    } catch {
      // ignore errors
    }
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Hamburger — visible on mobile only */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={sidebarOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="text-base font-semibold text-gray-900">
            BVTPA Portal Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PreviewButton />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-gray-600 hover:text-red-600"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — always visible on md+, drawer on mobile */}
        <div
          className={[
            "fixed md:static inset-y-0 left-0 z-20 mt-14 md:mt-0 transition-transform duration-200 ease-in-out md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="overflow-x-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
