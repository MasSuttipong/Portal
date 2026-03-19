"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ProviderPermission, ProviderPermissions, CompanySection } from "@/types/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProviderFormData {
  providerCode: string;
  name: string;
  apiKey: string;
  allowedCompanyIds: string[];
}

const EMPTY_FORM: ProviderFormData = {
  providerCode: "",
  name: "",
  apiKey: "",
  allowedCompanyIds: [],
};

interface CompanyEntry {
  id: string;
  displayName: string;
}

interface CompanyGroup {
  label: string;
  sectionKey: "sectionInsurance" | "sectionSelfInsured" | "sectionInternational" | "sectionDeductible";
  companies: CompanyEntry[];
}

const SECTION_ENDPOINTS: {
  filename: string;
  sectionKey: CompanyGroup["sectionKey"];
}[] = [
  { filename: "insurance-companies", sectionKey: "sectionInsurance" },
  { filename: "self-insured", sectionKey: "sectionSelfInsured" },
  { filename: "international-insurance", sectionKey: "sectionInternational" },
  { filename: "deductible", sectionKey: "sectionDeductible" },
];

// ---------------------------------------------------------------------------
// Helper: flatten a CompanySection into CompanyEntry[]
// ---------------------------------------------------------------------------

function flattenSection(section: CompanySection): CompanyEntry[] {
  const entries: CompanyEntry[] = [];

  for (const company of section.companies ?? []) {
    entries.push({ id: company.id, displayName: company.displayName });
  }

  for (const group of section.groups ?? []) {
    for (const company of group.companies ?? []) {
      entries.push({ id: company.id, displayName: company.displayName });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Sub-component: collapsible section checklist
// ---------------------------------------------------------------------------

interface SectionChecklistProps {
  group: CompanyGroup;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

function SectionChecklist({
  group,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: SectionChecklistProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  const ids = group.companies.map((c) => c.id);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = ids.some((id) => selected.has(id));
  const selectedCount = ids.filter((id) => selected.has(id)).length;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-gray-500 shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-800">{group.label}</span>
          {someSelected && (
            <Badge variant="secondary" className="text-xs h-5">
              {selectedCount}
            </Badge>
          )}
        </div>

        {/* Select / Deselect All — stop propagation so it doesn't collapse the section */}
        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            disabled={ids.length === 0 || allSelected}
            onClick={() => onSelectAll(ids)}
          >
            {t("providers.selectAll")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            disabled={ids.length === 0 || !someSelected}
            onClick={() => onDeselectAll(ids)}
          >
            {t("providers.deselectAll")}
          </Button>
        </div>
      </button>

      {/* Company list */}
      {expanded && (
        <div className="divide-y divide-gray-100">
          {group.companies.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 italic">
              {t("providers.noCompaniesInSection")}
            </p>
          ) : (
            group.companies.map((company) => (
              <label
                key={company.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  checked={selected.has(company.id)}
                  onChange={() => onToggle(company.id)}
                />
                <span className="text-sm text-gray-700 select-none">
                  {company.displayName}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ProvidersPage() {
  const { data, loading, error, save } = useAdminContent<ProviderPermissions>("provider-permissions");
  const { t } = useLanguage();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<ProviderFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteCode, setDeleteCode] = useState<string | null>(null);

  // Company sections for the checklist
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const providers = data?.providers ?? [];

  // ---------------------------------------------------------------------------
  // Fetch all company sections when the dialog opens
  // ---------------------------------------------------------------------------

  const fetchCompanySections = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const results = await Promise.all(
        SECTION_ENDPOINTS.map(async ({ filename, sectionKey }) => {
          const res = await fetch(`/api/admin/content/${filename}`);
          if (!res.ok) return { sectionKey, companies: [] as CompanyEntry[] };
          const section = (await res.json()) as CompanySection;
          return { sectionKey, companies: flattenSection(section) };
        })
      );

      setCompanyGroups(
        results.map(({ sectionKey, companies }) => ({
          label: t(`providers.${sectionKey}`),
          sectionKey,
          companies,
        }))
      );
    } catch {
      // Non-fatal — groups remain empty
    } finally {
      setLoadingCompanies(false);
    }
  }, [t]);

  useEffect(() => {
    if (dialogOpen) {
      void fetchCompanySections();
    }
  }, [dialogOpen, fetchCompanySections]);

  // ---------------------------------------------------------------------------
  // Dialog helpers
  // ---------------------------------------------------------------------------

  function openAddDialog() {
    setEditingCode(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(provider: ProviderPermission) {
    setEditingCode(provider.providerCode);
    setForm({
      providerCode: provider.providerCode,
      name: provider.name,
      apiKey: provider.apiKey ?? "",
      allowedCompanyIds: [...provider.allowedCompanyIds],
    });
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
  }

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  function handleToggleCompany(id: string) {
    setForm((prev) => {
      const set = new Set(prev.allowedCompanyIds);
      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }
      return { ...prev, allowedCompanyIds: Array.from(set) };
    });
  }

  function handleSelectAll(ids: string[]) {
    setForm((prev) => {
      const set = new Set(prev.allowedCompanyIds);
      for (const id of ids) set.add(id);
      return { ...prev, allowedCompanyIds: Array.from(set) };
    });
  }

  function handleDeselectAll(ids: string[]) {
    setForm((prev) => {
      const set = new Set(prev.allowedCompanyIds);
      for (const id of ids) set.delete(id);
      return { ...prev, allowedCompanyIds: Array.from(set) };
    });
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  async function handleDialogSave() {
    if (!form.providerCode.trim() || !form.name.trim() || !form.apiKey.trim()) return;
    if (!data) return;

    setSaving(true);

    const updatedProvider: ProviderPermission = {
      providerCode: form.providerCode.trim().toUpperCase(),
      name: form.name.trim(),
      apiKey: form.apiKey.trim(),
      allowedCompanyIds: form.allowedCompanyIds,
    };

    let newProviders: ProviderPermission[];

    if (editingCode !== null) {
      // Replace existing entry (providerCode may have changed)
      newProviders = providers.map((p) =>
        p.providerCode === editingCode ? updatedProvider : p
      );
    } else {
      // Guard against duplicate code on add
      if (providers.some((p) => p.providerCode === updatedProvider.providerCode)) {
        setSaving(false);
        return;
      }
      newProviders = [...providers, updatedProvider];
    }

    const ok = await save({ ...data, providers: newProviders });
    setSaving(false);
    if (ok) setDialogOpen(false);
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async function handleDelete(providerCode: string) {
    if (!data) return;
    const newProviders = providers.filter((p) => p.providerCode !== providerCode);
    await save({ ...data, providers: newProviders });
    setDeleteCode(null);
  }

  // ---------------------------------------------------------------------------
  // Derived state for the checklist
  // ---------------------------------------------------------------------------

  const selectedSet = new Set(form.allowedCompanyIds);

  const isDuplicateCode =
    editingCode === null &&
    form.providerCode.trim().length > 0 &&
    providers.some(
      (p) => p.providerCode === form.providerCode.trim().toUpperCase()
    );

  const isFormValid =
    form.providerCode.trim().length > 0 &&
    form.name.trim().length > 0 &&
    !isDuplicateCode;

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 text-sm">
        {t("common.errorPrefix")} {error}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("providers.pageTitle")}</h1>
        <Button onClick={openAddDialog} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          {t("providers.addProvider")}
        </Button>
      </div>

      {/* Provider Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="size-4 text-blue-600" />
            {t("providers.pageTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {providers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {t("providers.noProviders")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">{t("providers.providerCode")}</TableHead>
                    <TableHead>{t("providers.providerName")}</TableHead>
                    <TableHead className="w-44 text-center">
                      {t("providers.allowedCompanies")}
                    </TableHead>
                    <TableHead className="w-24 text-right">{t("common.manage")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.providerCode}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">
                          {provider.providerCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-800">{provider.name}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="tabular-nums">
                          {provider.allowedCompanyIds.length}{" "}
                          {t("providers.companiesCount")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEditDialog(provider)}
                            aria-label={t("providers.editProvider")}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteCode(provider.providerCode)}
                            aria-label={t("common.delete")}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingCode !== null ? t("providers.editProvider") : t("providers.addProvider")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
            {/* Provider Code */}
            <div className="space-y-2">
              <Label htmlFor="provider-code">{t("providers.providerCode")}</Label>
              <Input
                id="provider-code"
                value={form.providerCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    providerCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder={t("providers.codePlaceholder")}
                disabled={editingCode !== null}
                className={isDuplicateCode ? "border-red-400 focus-visible:ring-red-400" : ""}
                maxLength={20}
              />
              {isDuplicateCode && (
                <p className="text-xs text-red-500">
                  Provider code already exists.
                </p>
              )}
            </div>

            {/* Provider Name */}
            <div className="space-y-2">
              <Label htmlFor="provider-name">{t("providers.providerName")}</Label>
              <Input
                id="provider-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("providers.namePlaceholder")}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="provider-apikey">{t("providers.apiKey")}</Label>
              <Input
                id="provider-apikey"
                value={form.apiKey}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder={t("providers.apiKeyPlaceholder")}
                className="font-mono text-sm"
              />
            </div>

            {/* Company Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("providers.allowedCompanies")}</Label>
                {form.allowedCompanyIds.length > 0 && (
                  <Badge variant="secondary" className="tabular-nums text-xs">
                    {form.allowedCompanyIds.length} {t("providers.companiesCount")}
                  </Badge>
                )}
              </div>

              {loadingCompanies ? (
                <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                  {t("providers.loadingCompanies")}
                </div>
              ) : (
                <div className="space-y-2">
                  {companyGroups.map((group) => (
                    <SectionChecklist
                      key={group.sectionKey}
                      group={group}
                      selected={selectedSet}
                      onToggle={handleToggleCompany}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 shrink-0">
            <Button variant="outline" onClick={handleCloseDialog}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => void handleDialogSave()}
              disabled={!isFormValid || saving || loadingCompanies}
            >
              {saving
                ? t("common.saving")
                : editingCode !== null
                ? t("common.save")
                : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteCode !== null}
        onOpenChange={(open) => { if (!open) setDeleteCode(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.cannotUndo")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteCode && void handleDelete(deleteCode)}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
