"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { CompanySection, CompanyGroup, Company, AlertBorder } from "@/types/portal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Save, ChevronDown, ChevronRight, Users, Upload, X, Search } from "lucide-react";
import { toast } from "sonner";
import DragDropList from "@/components/admin/DragDropList";

interface CompanyFormData {
  displayName: string;
  nameEn: string;
  nameTh: string;
  code: string;
  iclaimId: string;
  isClickable: boolean;
  isNew: boolean;
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string;
  redirectUrl: string;
  logoUrl: string;
  alertText: string;
  alertType: "warning" | "error" | "info" | "success" | "promo" | "urgent";
  alertSize: "xs" | "sm" | "md" | "lg" | "xl";
  alertBorder: AlertBorder;
}

interface GroupFormData {
  headerName: string;
  headerIconUrl: string;
  alertText: string;
  alertType: "warning" | "error" | "info" | "success" | "promo" | "urgent";
  alertSize: "xs" | "sm" | "md" | "lg" | "xl";
  alertBorder: AlertBorder;
}

const emptyCompanyForm: CompanyFormData = {
  displayName: "",
  nameEn: "",
  nameTh: "",
  code: "",
  iclaimId: "",
  isClickable: true,
  isNew: false,
  claimType: "OPD_IPD",
  remark: "",
  redirectUrl: "",
  logoUrl: "",
  alertText: "",
  alertType: "warning",
  alertSize: "sm",
  alertBorder: "none",
};

const emptyGroupForm: GroupFormData = {
  headerName: "",
  headerIconUrl: "",
  alertText: "",
  alertType: "warning",
  alertSize: "sm",
  alertBorder: "none",
};

export default function SelfInsuredPage() {
  const { data, loading, error, save } = useAdminContent<CompanySection>(
    "self-insured"
  );
  const [headingValue, setHeadingValue] = useState("");
  const [sectionAlertText, setSectionAlertText] = useState("");
  const [sectionAlertType, setSectionAlertType] = useState<"warning" | "error" | "info" | "success" | "promo" | "urgent">("warning");
  const [sectionAlertSize, setSectionAlertSize] = useState<"xs" | "sm" | "md" | "lg" | "xl">("sm");
  const [sectionAlertBorder, setSectionAlertBorder] = useState<AlertBorder>("none");
  const [headingInitialized, setHeadingInitialized] = useState(false);

  // Company dialog state
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormData>(emptyCompanyForm);

  // Group dialog state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroupFormId, setEditingGroupFormId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormData>(emptyGroupForm);

  // Delete state
  const [deleteCompanyTarget, setDeleteCompanyTarget] = useState<{ groupId: string | null; companyId: string } | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { t } = useLanguage();

  const CLAIM_TYPE_LABELS: Record<string, string> = {
    OPD_IPD: t("company.opdIpd"),
    OPD_ONLY: t("company.opdOnly"),
    IPD_ONLY: t("company.ipdOnly"),
  };

  if (data && !headingInitialized) {
    setHeadingValue(data.heading ?? "");
    setSectionAlertText(data.alertText ?? "");
    setSectionAlertType(data.alertType ?? "warning");
    setSectionAlertSize(data.alertSize ?? "sm");
    setSectionAlertBorder(data.alertBorder ?? (data.alertGlow ? "glow" : "none"));
    setHeadingInitialized(true);
  }

  const groups = data?.groups ?? [];
  const ungroupedCompanies = data?.companies ?? [];

  function sectionFields() {
    return {
      heading: headingValue,
      alertText: sectionAlertText.trim() || null,
      alertType: sectionAlertText.trim() ? sectionAlertType : undefined,
      alertSize: sectionAlertText.trim() ? sectionAlertSize : undefined,
      alertBorder: sectionAlertText.trim() ? sectionAlertBorder : undefined,
    };
  }

  function toggleExpanded(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  // --- Group operations ---

  function openAddGroupDialog() {
    setEditingGroupFormId(null);
    setGroupForm(emptyGroupForm);
    setGroupDialogOpen(true);
  }

  function openEditGroupDialog(group: CompanyGroup) {
    setEditingGroupFormId(group.id);
    setGroupForm({
      headerName: group.headerName,
      headerIconUrl: group.headerIconUrl ?? "",
      alertText: group.alertText ?? "",
      alertType: group.alertType ?? "warning",
      alertSize: group.alertSize ?? "sm",
      alertBorder: group.alertBorder ?? (group.alertGlow ? "glow" : "none"),
    });
    setGroupDialogOpen(true);
  }

  function handleGroupDialogSave() {
    if (!groupForm.headerName.trim() || !data) return;

    const currentGroups = groups;
    let newGroups: CompanyGroup[];

    if (editingGroupFormId) {
      newGroups = currentGroups.map((g) =>
        g.id === editingGroupFormId
          ? {
              ...g,
              headerName: groupForm.headerName,
              headerIconUrl: groupForm.headerIconUrl.trim() || null,
              alertText: groupForm.alertText.trim() || null,
              alertType: groupForm.alertText.trim() ? groupForm.alertType : undefined,
              alertSize: groupForm.alertText.trim() ? groupForm.alertSize : undefined,
              alertBorder: groupForm.alertText.trim() ? groupForm.alertBorder : undefined,
            }
          : g
      );
    } else {
      const newGroup: CompanyGroup = {
        id: `grp-${Date.now()}`,
        headerName: groupForm.headerName,
        headerIconUrl: groupForm.headerIconUrl.trim() || null,
        alertText: groupForm.alertText.trim() || null,
        alertType: groupForm.alertText.trim() ? groupForm.alertType : undefined,
        alertSize: groupForm.alertText.trim() ? groupForm.alertSize : undefined,
        alertBorder: groupForm.alertText.trim() ? groupForm.alertBorder : undefined,
        companies: [],
      };
      newGroups = [...currentGroups, newGroup];
    }

    void save({ ...data, ...sectionFields(), groups: newGroups });
    setGroupDialogOpen(false);
  }

  function handleDeleteGroup(groupId: string) {
    if (!data) return;
    const newGroups = groups.filter((g) => g.id !== groupId);
    void save({ ...data, ...sectionFields(), groups: newGroups });
    setDeleteGroupId(null);
  }

  function handleReorderGroups(reordered: CompanyGroup[]) {
    if (!data) return;
    void save({ ...data, ...sectionFields(), groups: reordered });
  }

  // --- Company operations ---

  function openAddCompanyDialog(groupId: string) {
    setEditingCompanyId(null);
    setEditingGroupId(groupId);
    setCompanyForm(emptyCompanyForm);
    setCompanyDialogOpen(true);
  }

  function openEditCompanyDialog(groupId: string, company: Company) {
    setEditingCompanyId(company.id);
    setEditingGroupId(groupId);
    setCompanyForm({
      displayName: company.displayName,
      nameEn: company.nameEn ?? "",
      nameTh: company.nameTh ?? "",
      code: company.code ?? "",
      iclaimId: company.iclaimId ?? "",
      isClickable: company.isClickable,
      isNew: company.isNew,
      claimType: company.claimType,
      remark: company.remark ?? "",
      redirectUrl: company.redirectUrl ?? "",
      logoUrl: company.logoUrl ?? "",
      alertText: company.alertText ?? "",
      alertType: company.alertType ?? "warning",
      alertSize: company.alertSize ?? "sm",
      alertBorder: company.alertBorder ?? (company.alertGlow ? "glow" : "none"),
    });
    setCompanyDialogOpen(true);
  }

  function buildCompanyFromForm(id: string): Company {
    return {
      id,
      displayName: companyForm.displayName,
      nameEn: companyForm.nameEn.trim() || null,
      nameTh: companyForm.nameTh.trim() || null,
      code: companyForm.code.trim() || null,
      iclaimId: companyForm.iclaimId.trim() || null,
      isClickable: companyForm.isClickable,
      isNew: companyForm.isNew,
      claimType: companyForm.claimType,
      remark: companyForm.remark.trim() || null,
      redirectUrl: companyForm.redirectUrl.trim() || undefined,
      logoUrl: companyForm.logoUrl.trim() || null,
      alertText: companyForm.alertText.trim() || null,
      alertType: companyForm.alertText.trim() ? companyForm.alertType : undefined,
      alertSize: companyForm.alertText.trim() ? companyForm.alertSize : undefined,
      alertBorder: companyForm.alertText.trim() ? companyForm.alertBorder : undefined,
    };
  }

  function openAddUngroupedCompany() {
    setEditingCompanyId(null);
    setEditingGroupId(null);
    setCompanyForm(emptyCompanyForm);
    setCompanyDialogOpen(true);
  }

  function handleCompanyDialogSave() {
    if (!companyForm.displayName.trim() || !data) return;

    if (editingGroupId === null) {
      // Ungrouped company
      const newCompanies = editingCompanyId
        ? ungroupedCompanies.map((c) =>
            c.id === editingCompanyId ? buildCompanyFromForm(editingCompanyId) : c
          )
        : [...ungroupedCompanies, buildCompanyFromForm(`co-${Date.now()}`)];

      void save({ ...data, ...sectionFields(), groups, companies: newCompanies });
    } else {
      // Grouped company
      const newGroups = groups.map((g) => {
        if (g.id !== editingGroupId) return g;

        const newCompanies = editingCompanyId
          ? g.companies.map((c) =>
              c.id === editingCompanyId ? buildCompanyFromForm(editingCompanyId) : c
            )
          : [...g.companies, buildCompanyFromForm(`co-${Date.now()}`)];

        return { ...g, companies: newCompanies };
      });

      void save({ ...data, ...sectionFields(), groups: newGroups });
    }

    setCompanyDialogOpen(false);
  }

  function handleDeleteCompany(groupId: string | null, companyId: string) {
    if (!data) return;

    if (groupId === null) {
      const newCompanies = ungroupedCompanies.filter((c) => c.id !== companyId);
      void save({ ...data, ...sectionFields(), groups, companies: newCompanies });
    } else {
      const newGroups = groups.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, companies: g.companies.filter((c) => c.id !== companyId) };
      });
      void save({ ...data, ...sectionFields(), groups: newGroups });
    }

    setDeleteCompanyTarget(null);
  }

  function handleReorderCompanies(groupId: string, reordered: Company[]) {
    if (!data) return;
    const newGroups = groups.map((g) =>
      g.id === groupId ? { ...g, companies: reordered } : g
    );
    void save({ ...data, ...sectionFields(), groups: newGroups });
  }

  function handleReorderUngroupedCompanies(reordered: Company[]) {
    if (!data) return;
    void save({ ...data, ...sectionFields(), groups, companies: reordered });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save({ ...data, ...sectionFields(), groups, companies: ungroupedCompanies });
    setSaving(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setCompanyForm((prev) => ({ ...prev, logoUrl: url }));
    } catch {
      alert(t("company.uploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("selfInsured.pageTitle")}</h1>
        <div className="flex gap-2">
          <Button onClick={openAddUngroupedCompany} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t("company.addCompany")}
          </Button>
          <Button onClick={openAddGroupDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t("selfInsured.addGroup")}
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="size-4" />
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("company.sectionName")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="si-heading">{t("company.sectionHeading")}</Label>
            <Input
              id="si-heading"
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mt-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="si-alert">{t("company.sectionAlert")}</Label>
              <Input
                id="si-alert"
                value={sectionAlertText}
                onChange={(e) => setSectionAlertText(e.target.value)}
                placeholder={t("company.sectionAlertPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-alert-type">{t("common.type")}</Label>
              <select
                id="si-alert-type"
                value={sectionAlertType}
                onChange={(e) => setSectionAlertType(e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent")}
                title={t("common.type")}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="warning">{t("alertOptions.warning")}</option>
                <option value="error">{t("alertOptions.error")}</option>
                <option value="info">{t("alertOptions.info")}</option>
                <option value="success">{t("alertOptions.success")}</option>
                <option value="promo">{t("alertOptions.promo")}</option>
                <option value="urgent">{t("alertOptions.urgent")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-alert-size">{t("common.size")}</Label>
              <select
                id="si-alert-size"
                value={sectionAlertSize}
                onChange={(e) => setSectionAlertSize(e.target.value as "xs" | "sm" | "md" | "lg" | "xl")}
                title={t("common.size")}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="xs">XS</option>
                <option value="sm">S</option>
                <option value="md">M</option>
                <option value="lg">L</option>
                <option value="xl">XL</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-alert-border">{t("common.border")}</Label>
              <select
                id="si-alert-border"
                value={sectionAlertBorder}
                onChange={(e) => setSectionAlertBorder(e.target.value as AlertBorder)}
                title={t("common.border")}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="none">{t("alertOptions.none")}</option>
                <option value="glow">{t("alertOptions.glow")}</option>
                <option value="pulse">{t("alertOptions.pulse")}</option>
                <option value="shimmer">{t("alertOptions.shimmer")}</option>
                <option value="bounce">{t("alertOptions.bounce")}</option>
                <option value="shake">{t("alertOptions.shake")}</option>
                <option value="rainbow">{t("alertOptions.rainbow")}</option>
                <option value="blink">{t("alertOptions.blink")}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standalone Companies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">{t("selfInsured.standaloneCompanies")} ({ungroupedCompanies.length})</CardTitle>
          <Button onClick={openAddUngroupedCompany} variant="ghost" size="sm" className="gap-1.5 text-xs h-7">
            <Plus className="size-3.5" />
            {t("company.addCompany")}
          </Button>
        </CardHeader>
        <CardContent>
          {ungroupedCompanies.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              {t("selfInsured.noStandaloneCompanies")}
            </div>
          ) : (
            <>
              {ungroupedCompanies.length > 5 && (
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input type="text" value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} placeholder={t("company.searchPlaceholder")} className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>{t("company.companyName")}</TableHead>
                    <TableHead className="w-28">{t("common.type")}</TableHead>
                    <TableHead className="w-24 text-center">{t("common.clickable")}</TableHead>
                    <TableHead className="w-20 text-center">{t("common.new")}</TableHead>
                    <TableHead className="w-24 text-right">{t("common.manage")}</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              <DragDropList
                items={ungroupedCompanies.filter((c) => !tableFilter || c.displayName.toLowerCase().includes(tableFilter.toLowerCase()) || (c.nameEn && c.nameEn.toLowerCase().includes(tableFilter.toLowerCase())) || (c.nameTh && c.nameTh.toLowerCase().includes(tableFilter.toLowerCase())))}
                onReorder={handleReorderUngroupedCompanies}
                renderItem={(company) => (
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex-1">
                          <span className="text-sm text-gray-800">
                            {company.displayName}
                          </span>
                          {(company.nameEn || company.nameTh) && (
                            <span className="block text-xs text-gray-400">
                              {[company.nameEn, company.nameTh].filter(Boolean).join(" / ")}
                            </span>
                          )}
                          {company.remark && (
                            <span className="block text-xs text-red-500 mt-0.5">
                              {company.remark}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="w-28">
                          <Badge variant="outline" className="text-xs">
                            {CLAIM_TYPE_LABELS[company.claimType] ?? company.claimType}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24 text-center">
                          <Switch
                            checked={company.isClickable}
                            onCheckedChange={(val) => {
                              if (!data) return;
                              const newCompanies = ungroupedCompanies.map((c) =>
                                c.id === company.id ? { ...c, isClickable: val } : c
                              );
                              void save({ ...data, ...sectionFields(), groups, companies: newCompanies });
                              toast(val ? t("company.clickableEnabled") : t("company.clickableDisabled"), {
                                action: { label: t("company.undoToggle"), onClick: () => {
                                  const revertCompanies = ungroupedCompanies.map((c) =>
                                    c.id === company.id ? { ...c, isClickable: !val } : c
                                  );
                                  void save({ ...data, ...sectionFields(), groups, companies: revertCompanies });
                                } },
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="w-20 text-center">
                          <Switch
                            checked={company.isNew}
                            onCheckedChange={(val) => {
                              if (!data) return;
                              const newCompanies = ungroupedCompanies.map((c) =>
                                c.id === company.id ? { ...c, isNew: val } : c
                              );
                              void save({ ...data, ...sectionFields(), groups, companies: newCompanies });
                              toast(val ? t("company.newBadgeEnabled") : t("company.newBadgeDisabled"), {
                                action: { label: t("company.undoToggle"), onClick: () => {
                                  const revertCompanies = ungroupedCompanies.map((c) =>
                                    c.id === company.id ? { ...c, isNew: !val } : c
                                  );
                                  void save({ ...data, ...sectionFields(), groups, companies: revertCompanies });
                                } },
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="w-24 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => {
                                setEditingCompanyId(company.id);
                                setEditingGroupId(null);
                                setCompanyForm({
                                  displayName: company.displayName,
                                  nameEn: company.nameEn ?? "",
                                  nameTh: company.nameTh ?? "",
                                  code: company.code ?? "",
                                  iclaimId: company.iclaimId ?? "",
                                  isClickable: company.isClickable,
                                  isNew: company.isNew,
                                  claimType: company.claimType,
                                  remark: company.remark ?? "",
                                  redirectUrl: company.redirectUrl ?? "",
                                  logoUrl: company.logoUrl ?? "",
                                  alertText: company.alertText ?? "",
                                  alertType: company.alertType ?? "warning",
                                  alertSize: company.alertSize ?? "sm",
                                  alertBorder: company.alertBorder ?? (company.alertGlow ? "glow" : "none"),
                                });
                                setCompanyDialogOpen(true);
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setDeleteCompanyTarget({
                                  groupId: null,
                                  companyId: company.id,
                                })
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
          {t("selfInsured.noGroups")}
        </div>
      ) : (
        <div className="space-y-3">
          <DragDropList
            items={groups}
            onReorder={handleReorderGroups}
            renderItem={(group) => (
              <div className="bg-white border rounded-lg overflow-hidden">
                {/* Group Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                  <button
                    type="button"
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => toggleExpanded(group.id)}
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="size-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="size-4 text-gray-400" />
                    )}
                    <Users className="size-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-800">
                      {group.headerName}
                    </span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {group.companies.length} {t("selfInsured.companiesCount")}
                    </Badge>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs h-7"
                      onClick={() => openAddCompanyDialog(group.id)}
                    >
                      <Plus className="size-3.5" />
                      {t("company.addCompany")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openEditGroupDialog(group)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteGroupId(group.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Companies */}
                {expandedGroups.has(group.id) && (
                  <div className="p-2">
                    {group.companies.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        {t("selfInsured.noCompaniesInGroup")}
                      </div>
                    ) : (
                      <>
                        {group.companies.length > 5 && (
                          <div className="p-3 border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                              <input type="text" value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} placeholder={t("company.searchPlaceholder")} className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring" />
                            </div>
                          </div>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>{t("company.companyName")}</TableHead>
                              <TableHead className="w-28">{t("common.type")}</TableHead>
                              <TableHead className="w-24 text-center">{t("common.clickable")}</TableHead>
                              <TableHead className="w-20 text-center">{t("common.new")}</TableHead>
                              <TableHead className="w-24 text-right">{t("common.manage")}</TableHead>
                            </TableRow>
                          </TableHeader>
                        </Table>
                        <DragDropList
                          items={group.companies.filter((c) => !tableFilter || c.displayName.toLowerCase().includes(tableFilter.toLowerCase()) || (c.nameEn && c.nameEn.toLowerCase().includes(tableFilter.toLowerCase())) || (c.nameTh && c.nameTh.toLowerCase().includes(tableFilter.toLowerCase())))}
                          onReorder={(reordered) =>
                            handleReorderCompanies(group.id, reordered)
                          }
                          renderItem={(company) => (
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="flex-1">
                                    <span className="text-sm text-gray-800">
                                      {company.displayName}
                                    </span>
                                    {(company.nameEn || company.nameTh) && (
                                      <span className="block text-xs text-gray-400">
                                        {[company.nameEn, company.nameTh].filter(Boolean).join(" / ")}
                                      </span>
                                    )}
                                    {company.remark && (
                                      <span className="block text-xs text-red-500 mt-0.5">
                                        {company.remark}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="w-28">
                                    <Badge variant="outline" className="text-xs">
                                      {CLAIM_TYPE_LABELS[company.claimType] ?? company.claimType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="w-24 text-center">
                                    <Switch
                                      checked={company.isClickable}
                                      onCheckedChange={(val) => {
                                        if (!data) return;
                                        const newGroups = groups.map((g) => {
                                          if (g.id !== group.id) return g;
                                          return {
                                            ...g,
                                            companies: g.companies.map((c) =>
                                              c.id === company.id
                                                ? { ...c, isClickable: val }
                                                : c
                                            ),
                                          };
                                        });
                                        void save({ ...data, ...sectionFields(), groups: newGroups });
                                        toast(val ? t("company.clickableEnabled") : t("company.clickableDisabled"), {
                                          action: { label: t("company.undoToggle"), onClick: () => {
                                            const revertGroups = groups.map((g) => {
                                              if (g.id !== group.id) return g;
                                              return { ...g, companies: g.companies.map((c) => c.id === company.id ? { ...c, isClickable: !val } : c) };
                                            });
                                            void save({ ...data, ...sectionFields(), groups: revertGroups });
                                          } },
                                        });
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="w-20 text-center">
                                    <Switch
                                      checked={company.isNew}
                                      onCheckedChange={(val) => {
                                        if (!data) return;
                                        const newGroups = groups.map((g) => {
                                          if (g.id !== group.id) return g;
                                          return {
                                            ...g,
                                            companies: g.companies.map((c) =>
                                              c.id === company.id
                                                ? { ...c, isNew: val }
                                                : c
                                            ),
                                          };
                                        });
                                        void save({ ...data, ...sectionFields(), groups: newGroups });
                                        toast(val ? t("company.newBadgeEnabled") : t("company.newBadgeDisabled"), {
                                          action: { label: t("company.undoToggle"), onClick: () => {
                                            const revertGroups = groups.map((g) => {
                                              if (g.id !== group.id) return g;
                                              return { ...g, companies: g.companies.map((c) => c.id === company.id ? { ...c, isNew: !val } : c) };
                                            });
                                            void save({ ...data, ...sectionFields(), groups: revertGroups });
                                          } },
                                        });
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="w-24 text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() =>
                                          openEditCompanyDialog(group.id, company)
                                        }
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() =>
                                          setDeleteCompanyTarget({
                                            groupId: group.id,
                                            companyId: company.id,
                                          })
                                        }
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          )}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* Add/Edit Group Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroupFormId ? t("selfInsured.editGroup") : t("selfInsured.addGroup")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="grp-name">{t("selfInsured.groupName")}</Label>
              <Input
                id="grp-name"
                value={groupForm.headerName}
                onChange={(e) =>
                  setGroupForm((prev) => ({ ...prev, headerName: e.target.value }))
                }
                placeholder={t("selfInsured.groupNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grp-icon">{t("selfInsured.groupIconUrl")}</Label>
              <Input
                id="grp-icon"
                value={groupForm.headerIconUrl}
                onChange={(e) =>
                  setGroupForm((prev) => ({ ...prev, headerIconUrl: e.target.value }))
                }
                placeholder="/images/logo-group.png"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="grp-alert">{t("selfInsured.groupAlert")}</Label>
                <Input
                  id="grp-alert"
                  value={groupForm.alertText}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertText: e.target.value }))
                  }
                  placeholder={t("company.sectionAlertPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grp-alert-type">{t("common.type")}</Label>
                <select
                  id="grp-alert-type"
                  value={groupForm.alertType}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertType: e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent" }))
                  }
                  title={t("common.type")}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="warning">{t("alertOptions.warning")}</option>
                  <option value="error">{t("alertOptions.error")}</option>
                  <option value="info">{t("alertOptions.info")}</option>
                  <option value="success">{t("alertOptions.success")}</option>
                  <option value="promo">{t("alertOptions.promo")}</option>
                  <option value="urgent">{t("alertOptions.urgent")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grp-alert-size">{t("common.size")}</Label>
                <select
                  id="grp-alert-size"
                  value={groupForm.alertSize}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertSize: e.target.value as "xs" | "sm" | "md" | "lg" | "xl" }))
                  }
                  title={t("common.size")}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="xs">XS</option>
                  <option value="sm">S</option>
                  <option value="md">M</option>
                  <option value="lg">L</option>
                  <option value="xl">XL</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grp-alert-border">{t("common.border")}</Label>
                <select
                  id="grp-alert-border"
                  value={groupForm.alertBorder}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertBorder: e.target.value as AlertBorder }))
                  }
                  title={t("common.border")}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="none">{t("alertOptions.none")}</option>
                  <option value="glow">{t("alertOptions.glow")}</option>
                  <option value="pulse">{t("alertOptions.pulse")}</option>
                  <option value="shimmer">{t("alertOptions.shimmer")}</option>
                  <option value="bounce">{t("alertOptions.bounce")}</option>
                  <option value="shake">{t("alertOptions.shake")}</option>
                  <option value="rainbow">{t("alertOptions.rainbow")}</option>
                  <option value="blink">{t("alertOptions.blink")}</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleGroupDialogSave}
              disabled={!groupForm.headerName.trim()}
            >
              {editingGroupFormId ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCompanyId ? t("company.editCompany") : t("company.addCompany")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="co-name">{t("company.companyName")}</Label>
              <Input
                id="co-name"
                value={companyForm.displayName}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder={t("company.companyNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-name-en">{t("company.nameEn")}</Label>
              <Input
                id="co-name-en"
                value={companyForm.nameEn}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    nameEn: e.target.value,
                  }))
                }
                placeholder={t("company.nameEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-name-th">{t("company.nameTh")}</Label>
              <Input
                id="co-name-th"
                value={companyForm.nameTh}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    nameTh: e.target.value,
                  }))
                }
                placeholder={t("company.nameThPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="co-code">{t("company.companyCode")}</Label>
                <Input
                  id="co-code"
                  value={companyForm.code}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder={t("company.codePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-iclaimid">iClaim ID</Label>
                <Input
                  id="co-iclaimid"
                  value={companyForm.iclaimId}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      iclaimId: e.target.value,
                    }))
                  }
                  placeholder={t("company.iclaimIdPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-claimtype">{t("company.claimType")}</Label>
              <select
                id="co-claimtype"
                value={companyForm.claimType}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    claimType: e.target.value as "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY",
                  }))
                }
                title={t("company.claimType")}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="OPD_IPD">{t("company.opdIpd")}</option>
                <option value="OPD_ONLY">{t("company.opdOnly")}</option>
                <option value="IPD_ONLY">{t("company.ipdOnly")}</option>
              </select>
            </div>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <ChevronDown className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              {t("company.advancedOptions")}
            </button>
            {showAdvanced && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="co-redirect">{t("company.redirectUrl")}</Label>
                  <Input
                    id="co-redirect"
                    value={companyForm.redirectUrl}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        redirectUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("company.companyLogo")}</Label>
                  {companyForm.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={companyForm.logoUrl} alt="logo" className="w-12 h-12 object-contain rounded border" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 gap-1"
                        onClick={() => setCompanyForm((prev) => ({ ...prev, logoUrl: "" }))}
                      >
                        <X className="size-3.5" />
                        {t("company.removeLogo")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="size-3.5" />
                        {uploading ? t("company.uploading") : t("company.uploadLogo")}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-remark">{t("company.remark")}</Label>
                  <Input
                    id="co-remark"
                    value={companyForm.remark}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, remark: e.target.value }))
                    }
                    placeholder={t("company.remarkPlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="co-alert">{t("company.alertText")}</Label>
                    <Input
                      id="co-alert"
                      value={companyForm.alertText}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({ ...prev, alertText: e.target.value }))
                      }
                      placeholder={t("company.alertPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-alert-type">{t("common.type")}</Label>
                    <select
                      id="co-alert-type"
                      value={companyForm.alertType}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({ ...prev, alertType: e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent" }))
                      }
                      title={t("common.type")}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="warning">{t("alertOptions.warning")}</option>
                      <option value="error">{t("alertOptions.error")}</option>
                      <option value="info">{t("alertOptions.info")}</option>
                      <option value="success">{t("alertOptions.success")}</option>
                      <option value="promo">{t("alertOptions.promo")}</option>
                      <option value="urgent">{t("alertOptions.urgent")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-alert-size">{t("common.size")}</Label>
                    <select
                      id="co-alert-size"
                      value={companyForm.alertSize}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({ ...prev, alertSize: e.target.value as "xs" | "sm" | "md" | "lg" | "xl" }))
                      }
                      title={t("common.size")}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="xs">XS</option>
                      <option value="sm">S</option>
                      <option value="md">M</option>
                      <option value="lg">L</option>
                      <option value="xl">XL</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-alert-border">{t("common.border")}</Label>
                    <select
                      id="co-alert-border"
                      value={companyForm.alertBorder}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({ ...prev, alertBorder: e.target.value as AlertBorder }))
                      }
                      title={t("common.border")}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="none">{t("alertOptions.none")}</option>
                      <option value="glow">{t("alertOptions.glow")}</option>
                      <option value="pulse">{t("alertOptions.pulse")}</option>
                      <option value="shimmer">{t("alertOptions.shimmer")}</option>
                      <option value="bounce">{t("alertOptions.bounce")}</option>
                      <option value="shake">{t("alertOptions.shake")}</option>
                      <option value="rainbow">{t("alertOptions.rainbow")}</option>
                      <option value="blink">{t("alertOptions.blink")}</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="co-clickable">{t("company.isClickable")}</Label>
                  <Switch
                    id="co-clickable"
                    checked={companyForm.isClickable}
                    onCheckedChange={(val) =>
                      setCompanyForm((prev) => ({ ...prev, isClickable: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="co-isnew">{t("company.showNewBadge")}</Label>
                  <Switch
                    id="co-isnew"
                    checked={companyForm.isNew}
                    onCheckedChange={(val) =>
                      setCompanyForm((prev) => ({ ...prev, isNew: val }))
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCompanyDialogSave}
              disabled={!companyForm.displayName.trim()}
            >
              {editingCompanyId ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog
        open={deleteGroupId !== null}
        onOpenChange={(open) => { if (!open) setDeleteGroupId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("selfInsured.confirmDeleteGroup")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("selfInsured.deleteGroupDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteGroupId && handleDeleteGroup(deleteGroupId)}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Confirmation */}
      <AlertDialog
        open={deleteCompanyTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteCompanyTarget(null); }}
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
              onClick={() =>
                deleteCompanyTarget &&
                handleDeleteCompany(
                  deleteCompanyTarget.groupId,
                  deleteCompanyTarget.companyId
                )
              }
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
