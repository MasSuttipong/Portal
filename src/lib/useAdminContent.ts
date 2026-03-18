"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UseAdminContentResult<T> {
  data: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (newData: T) => Promise<boolean>;
}

export function useAdminContent<T>(filename: string): UseAdminContentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/content/${filename}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json as T);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("messages.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, router]);

  const save = useCallback(
    async (newData: T): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/content/${filename}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        if (res.status === 401) {
          router.push("/admin/login");
          return false;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        setData(newData);
        toast.success(t("messages.saveSuccess"));
        return true;
      } catch {
        toast.error(t("messages.saveError"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [filename, router, t]
  );

  return { data, loading, saving, error, save };
}
