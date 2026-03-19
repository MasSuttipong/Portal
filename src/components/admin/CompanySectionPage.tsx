"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CompanySection, Company, AlertBorder } from "@/types/portal";
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
import { Pencil, Trash2, Plus, Save, Upload, X, Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import DragDropList from "@/components/admin/DragDropList";
import { withBasePath, withBasePathApi } from "@/lib/base-path";

interface CompanySectionPageProps {
  filename: string;
  pageTitle: string;
}

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

const emptyForm: CompanyFormData = {
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

export default function CompanySectionPage({
  filename,
  pageTitle,
}: CompanySectionPageProps) {
  const { t } = useLanguage();
  const { data, loading, error, save } = useAdminContent<CompanySection>(filename);
  const [headingValue, setHeadingValue] = useState("");
  const [sectionAlertText, setSectionAlertText] = useState("");
  const [sectionAlertType, setSectionAlertType] = useState<CompanyFormData["alertType"]>("warning");
  const [sectionAlertSize, setSectionAlertSize] = useState<"xs" | "sm" | "md" | "lg" | "xl">("sm");
  const [sectionAlertBorder, setSectionAlertBorder] = useState<AlertBorder>("none");
  const [headingInitialized, setHeadingInitialized] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const companies = data?.companies ?? [];
  const filteredCompanies = tableFilter
    ? companies.filter((c) =>
        c.displayName.toLowerCase().includes(tableFilter.toLowerCase()) ||
        c.nameEn?.toLowerCase().includes(tableFilter.toLowerCase()) ||
        c.nameTh?.toLowerCase().includes(tableFilter.toLowerCase())
      )
    : companies;

  function sectionFields() {
    return {
      heading: headingValue,
      alertText: sectionAlertText.trim() || null,
      alertType: sectionAlertText.trim() ? sectionAlertType : undefined,
      alertSize: sectionAlertText.trim() ? sectionAlertSize : undefined,
      alertBorder: sectionAlertText.trim() ? sectionAlertBorder : undefined,
    };
  }

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(company: Company) {
    setEditingId(company.id);
    setForm({
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
    setDialogOpen(true);
  }

  function handleFormChange<K extends keyof CompanyFormData>(
    key: K,
    value: CompanyFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildCompanyFromForm(id: string): Company {
    return {
      id,
      displayName: form.displayName,
      nameEn: form.nameEn.trim() || null,
      nameTh: form.nameTh.trim() || null,
      code: form.code.trim() || null,
      iclaimId: form.iclaimId.trim() || null,
      isClickable: form.isClickable,
      isNew: form.isNew,
      claimType: form.claimType,
      remark: form.remark.trim() || null,
      redirectUrl: form.redirectUrl.trim() || undefined,
      logoUrl: form.logoUrl.trim() || null,
      alertText: form.alertText.trim() || null,
      alertType: form.alertText.trim() ? form.alertType : undefined,
      alertSize: form.alertText.trim() ? form.alertSize : undefined,
      alertBorder: form.alertText.trim() ? form.alertBorder : undefined,
    };
  }

  function handleDialogSave() {
    if (!form.displayName.trim()) return;

    const newCompanies = editingId
      ? companies.map((c) =>
          c.id === editingId ? buildCompanyFromForm(editingId) : c
        )
      : [...companies, buildCompanyFromForm(`co-${Date.now()}`)];

    const newData: CompanySection = {
      ...(data ?? { heading: headingValue, companies: [] }),
      ...sectionFields(),
      companies: newCompanies,
    };
    void save(newData);
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    if (!data) return;
    const newCompanies = companies.filter((c) => c.id !== id);
    void save({ ...data, ...sectionFields(), companies: newCompanies });
    setDeleteId(null);
  }

  function handleReorder(reordered: Company[]) {
    if (!data) return;
    void save({ ...data, ...sectionFields(), companies: reordered });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save({ ...data, ...sectionFields(), companies });
    setSaving(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(withBasePathApi("/api/admin/upload"), { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      handleFormChange("logoUrl", url);
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
        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
        <div className="flex gap-2">
          <Button onClick={openAddDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t("company.addCompany")}
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
            <Label htmlFor={`${filename}-heading`}>{t("company.sectionHeading")}</Label>
            <Input
              id={`${filename}-heading`}
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mt-3">
            <div className="space-y-2">
              <Label htmlFor={`${filename}-alert`}>{t("company.sectionAlert")}</Label>
              <Input
                id={`${filename}-alert`}
                value={sectionAlertText}
                onChange={(e) => setSectionAlertText(e.target.value)}
                placeholder={t("company.sectionAlertPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${filename}-alert-type`}>{t("common.type")}</Label>
              <select
                id={`${filename}-alert-type`}
                value={sectionAlertType}
                onChange={(e) => setSectionAlertType(e.target.value as CompanyFormData["alertType"])}
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
              <Label htmlFor={`${filename}-alert-size`}>{t("common.size")}</Label>
              <select
                id={`${filename}-alert-size`}
                value={sectionAlertSize}
                onChange={(e) => setSectionAlertSize(e.target.value as CompanyFormData["alertSize"])}
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
              <Label htmlFor={`${filename}-alert-border`}>{t("common.border")}</Label>
              <select
                id={`${filename}-alert-border`}
                value={sectionAlertBorder}
                onChange={(e) => setSectionAlertBorder(e.target.value as CompanyFormData["alertBorder"])}
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

      {companies.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
          {t("company.noCompanies")}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          {companies.length > 5 && (
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder={t("company.searchPlaceholder")}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-12">{t("company.logo")}</TableHead>
                <TableHead>{t("company.companyName")}</TableHead>
                <TableHead className="w-28">{t("common.type")}</TableHead>
                <TableHead className="w-24 text-center">{t("common.clickable")}</TableHead>
                <TableHead className="w-20 text-center">{t("common.new")}</TableHead>
                <TableHead className="w-24 text-right">{t("common.manage")}</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <DragDropList
            items={tableFilter ? filteredCompanies : companies}
            onReorder={handleReorder}
            renderItem={(company) => (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="w-12">
                      {company.logoUrl ? (
                        <img src={withBasePath(company.logoUrl)} alt="" className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">—</div>
                      )}
                    </TableCell>
                    <TableCell className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
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
                          const updated = companies.map((c) =>
                            c.id === company.id ? { ...c, isClickable: val } : c
                          );
                          void save({ ...data, ...sectionFields(), companies: updated });
                          toast(val ? t("company.clickableEnabled") : t("company.clickableDisabled"), {
                            action: {
                              label: t("company.undoToggle"),
                              onClick: () => {
                                const reverted = companies.map((c) =>
                                  c.id === company.id ? { ...c, isClickable: !val } : c
                                );
                                void save({ ...data, ...sectionFields(), companies: reverted });
                              },
                            },
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="w-20 text-center">
                      <Switch
                        checked={company.isNew}
                        onCheckedChange={(val) => {
                          if (!data) return;
                          const updated = companies.map((c) =>
                            c.id === company.id ? { ...c, isNew: val } : c
                          );
                          void save({ ...data, ...sectionFields(), companies: updated });
                          toast(val ? t("company.newBadgeEnabled") : t("company.newBadgeDisabled"), {
                            action: {
                              label: t("company.undoToggle"),
                              onClick: () => {
                                const reverted = companies.map((c) =>
                                  c.id === company.id ? { ...c, isNew: !val } : c
                                );
                                void save({ ...data, ...sectionFields(), companies: reverted });
                              },
                            },
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
                          onClick={() => openEditDialog(company)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(company.id)}
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
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("company.editCompany") : t("company.addCompany")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="co-name">{t("company.companyName")}</Label>
              <Input
                id="co-name"
                value={form.displayName}
                onChange={(e) => handleFormChange("displayName", e.target.value)}
                placeholder={t("company.companyNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-name-en">{t("company.nameEn")}</Label>
              <Input
                id="co-name-en"
                value={form.nameEn}
                onChange={(e) => handleFormChange("nameEn", e.target.value)}
                placeholder={t("company.nameEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-name-th">{t("company.nameTh")}</Label>
              <Input id="co-name-th" value={form.nameTh} onChange={(e) => handleFormChange("nameTh", e.target.value)} placeholder={t("company.nameThPlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="co-code">{t("company.companyCode")}</Label>
                <Input
                  id="co-code"
                  value={form.code}
                  onChange={(e) => handleFormChange("code", e.target.value)}
                  placeholder={t("company.codePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-iclaimid">iClaim ID</Label>
                <Input
                  id="co-iclaimid"
                  value={form.iclaimId}
                  onChange={(e) => handleFormChange("iclaimId", e.target.value)}
                  placeholder={t("company.iclaimIdPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-claimtype">{t("company.claimType")}</Label>
              <select
                id="co-claimtype"
                value={form.claimType}
                onChange={(e) =>
                  handleFormChange(
                    "claimType",
                    e.target.value as "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY"
                  )
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="OPD_IPD">{t("company.opdIpd")}</option>
                <option value="OPD_ONLY">{t("company.opdOnly")}</option>
                <option value="IPD_ONLY">{t("company.ipdOnly")}</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ChevronDown className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              {t("company.advancedOptions")}
            </button>
            {showAdvanced && (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="co-redirect">{t("company.redirectUrl")}</Label>
                  <Input
                    id="co-redirect"
                    value={form.redirectUrl}
                    onChange={(e) => handleFormChange("redirectUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("company.companyLogo")}</Label>
                  {form.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={withBasePath(form.logoUrl)} alt="logo" className="w-12 h-12 object-contain rounded border" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 gap-1"
                        onClick={() => handleFormChange("logoUrl", "")}
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
                    value={form.remark}
                    onChange={(e) => handleFormChange("remark", e.target.value)}
                    placeholder={t("company.remarkPlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="co-alert">{t("company.alertText")}</Label>
                    <Input
                      id="co-alert"
                      value={form.alertText}
                      onChange={(e) => handleFormChange("alertText", e.target.value)}
                      placeholder={t("company.alertPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-alert-type">{t("common.type")}</Label>
                    <select
                      id="co-alert-type"
                      value={form.alertType}
                      onChange={(e) => handleFormChange("alertType", e.target.value as CompanyFormData["alertType"])}
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
                      value={form.alertSize}
                      onChange={(e) => handleFormChange("alertSize", e.target.value as CompanyFormData["alertSize"])}
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
                      value={form.alertBorder}
                      onChange={(e) => handleFormChange("alertBorder", e.target.value as CompanyFormData["alertBorder"])}
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
                    checked={form.isClickable}
                    onCheckedChange={(val) => handleFormChange("isClickable", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="co-isnew">{t("company.showNewBadge")}</Label>
                  <Switch
                    id="co-isnew"
                    checked={form.isNew}
                    onCheckedChange={(val) => handleFormChange("isNew", val)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleDialogSave}
              disabled={!form.displayName.trim()}
            >
              {editingId ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
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
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
