"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { withBasePathApi } from "@/lib/base-path";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UseAdminContentResult<T> {
  data: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (newData: T) => Promise<boolean>;
}

type ApiErrorPayload = {
  error?: string;
  issues?: string[];
};

async function readApiError(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as ApiErrorPayload;
    const issues = payload.issues?.filter(Boolean) ?? [];

    if (issues.length > 0) {
      return `${payload.error ?? "Request failed"}: ${issues.join(" | ")}`;
    }

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parse failures and fall back to HTTP status.
  }

  return `HTTP ${res.status}`;
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
        const res = await fetch(withBasePathApi(`/api/admin/content/${filename}`));
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          throw new Error(await readApiError(res));
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
        const res = await fetch(withBasePathApi(`/api/admin/content/${filename}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        if (res.status === 401) {
          router.push("/admin/login");
          return false;
        }

        if (!res.ok) {
          throw new Error(await readApiError(res));
        }

        setData(newData);
        toast.success(t("messages.saveSuccess"));
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("messages.saveError"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [filename, router, t]
  );

  return { data, loading, saving, error, save };
}
