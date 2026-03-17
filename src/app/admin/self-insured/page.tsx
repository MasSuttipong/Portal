"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { CompanySection, CompanyGroup, Company, AlertBorder } from "@/types/portal";
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
import { Pencil, Trash2, Plus, Save, ChevronDown, ChevronRight, Users, Upload, X } from "lucide-react";
import DragDropList from "@/components/admin/DragDropList";
import { withBasePath, withBasePathApi } from "@/lib/base-path";

interface CompanyFormData {
  displayName: string;
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

const CLAIM_TYPE_LABELS: Record<string, string> = {
  OPD_IPD: "OPD + IPD",
  OPD_ONLY: "OPD เท่านั้น",
  IPD_ONLY: "IPD เท่านั้น",
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
      const res = await fetch(withBasePathApi("/api/admin/upload"), { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setCompanyForm((prev) => ({ ...prev, logoUrl: url }));
    } catch {
      alert("อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        กำลังโหลด...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 text-sm">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">จัดการสวัสดิการพนักงาน</h1>
        <div className="flex gap-2">
          <Button onClick={openAddUngroupedCompany} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            เพิ่มบริษัท
          </Button>
          <Button onClick={openAddGroupDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            เพิ่มกลุ่ม
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="size-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ชื่อส่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="si-heading">หัวข้อส่วน</Label>
            <Input
              id="si-heading"
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mt-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="si-alert">ข้อความแจ้งเตือนส่วน (ถ้ามี)</Label>
              <Input
                id="si-alert"
                value={sectionAlertText}
                onChange={(e) => setSectionAlertText(e.target.value)}
                placeholder="เช่น OPD ให้สำรองจ่าย"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-alert-type">ประเภท</Label>
              <select
                id="si-alert-type"
                value={sectionAlertType}
                onChange={(e) => setSectionAlertType(e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent")}
                title="ประเภทแจ้งเตือน"
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="warning">⚠️ เตือน</option>
                <option value="error">❌ สำคัญ</option>
                <option value="info">ℹ️ แจ้งข้อมูล</option>
                <option value="success">✅ สำเร็จ</option>
                <option value="promo">🎉 โปรโมชั่น</option>
                <option value="urgent">🚨 ด่วน</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-alert-size">ขนาด</Label>
              <select
                id="si-alert-size"
                value={sectionAlertSize}
                onChange={(e) => setSectionAlertSize(e.target.value as "xs" | "sm" | "md" | "lg" | "xl")}
                title="ขนาดแจ้งเตือน"
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
              <Label htmlFor="si-alert-border">ขอบ</Label>
              <select
                id="si-alert-border"
                value={sectionAlertBorder}
                onChange={(e) => setSectionAlertBorder(e.target.value as AlertBorder)}
                title="เอฟเฟกต์ขอบ"
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="none">ไม่มี</option>
                <option value="glow">เรืองแสง</option>
                <option value="pulse">กระพริบ</option>
                <option value="shimmer">วิ่ง</option>
                <option value="bounce">เด้ง</option>
                <option value="shake">สั่น</option>
                <option value="rainbow">สายรุ้ง</option>
                <option value="blink">กระพริบจ้า</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standalone Companies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">บริษัทเดี่ยว ({ungroupedCompanies.length})</CardTitle>
          <Button onClick={openAddUngroupedCompany} variant="ghost" size="sm" className="gap-1.5 text-xs h-7">
            <Plus className="size-3.5" />
            เพิ่มบริษัท
          </Button>
        </CardHeader>
        <CardContent>
          {ungroupedCompanies.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              ยังไม่มีบริษัทเดี่ยว กดปุ่ม &quot;เพิ่มบริษัท&quot; เพื่อเพิ่ม
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ชื่อบริษัท</TableHead>
                    <TableHead className="w-28">ประเภท</TableHead>
                    <TableHead className="w-24 text-center">คลิกได้</TableHead>
                    <TableHead className="w-20 text-center">ใหม่</TableHead>
                    <TableHead className="w-24 text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              <DragDropList
                items={ungroupedCompanies}
                onReorder={handleReorderUngroupedCompanies}
                renderItem={(company) => (
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex-1">
                          <span className="text-sm text-gray-800">
                            {company.displayName}
                          </span>
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
          ยังไม่มีกลุ่มบริษัท กดปุ่ม "เพิ่มกลุ่ม" เพื่อเพิ่ม
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
                      {group.companies.length} บริษัท
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
                      เพิ่มบริษัท
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
                        ยังไม่มีบริษัทในกลุ่มนี้
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>ชื่อบริษัท</TableHead>
                              <TableHead className="w-28">ประเภท</TableHead>
                              <TableHead className="w-24 text-center">คลิกได้</TableHead>
                              <TableHead className="w-20 text-center">ใหม่</TableHead>
                              <TableHead className="w-24 text-right">จัดการ</TableHead>
                            </TableRow>
                          </TableHeader>
                        </Table>
                        <DragDropList
                          items={group.companies}
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
              {editingGroupFormId ? "แก้ไขกลุ่ม" : "เพิ่มกลุ่ม"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="grp-name">ชื่อกลุ่ม</Label>
              <Input
                id="grp-name"
                value={groupForm.headerName}
                onChange={(e) =>
                  setGroupForm((prev) => ({ ...prev, headerName: e.target.value }))
                }
                placeholder="เช่น คาราบาวกรุ๊ป"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grp-icon">URL ไอคอน (ถ้ามี)</Label>
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
                <Label htmlFor="grp-alert">ข้อความแจ้งเตือนกลุ่ม (ถ้ามี)</Label>
                <Input
                  id="grp-alert"
                  value={groupForm.alertText}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertText: e.target.value }))
                  }
                  placeholder="เช่น OPD ให้สำรองจ่าย"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grp-alert-type">ประเภท</Label>
                <select
                  id="grp-alert-type"
                  value={groupForm.alertType}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertType: e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent" }))
                  }
                  title="ประเภทแจ้งเตือน"
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="warning">⚠️ เตือน</option>
                  <option value="error">❌ สำคัญ</option>
                  <option value="info">ℹ️ แจ้งข้อมูล</option>
                  <option value="success">✅ สำเร็จ</option>
                  <option value="promo">🎉 โปรโมชั่น</option>
                  <option value="urgent">🚨 ด่วน</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grp-alert-size">ขนาด</Label>
                <select
                  id="grp-alert-size"
                  value={groupForm.alertSize}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertSize: e.target.value as "xs" | "sm" | "md" | "lg" | "xl" }))
                  }
                  title="ขนาดแจ้งเตือน"
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
                <Label htmlFor="grp-alert-border">ขอบ</Label>
                <select
                  id="grp-alert-border"
                  value={groupForm.alertBorder}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, alertBorder: e.target.value as AlertBorder }))
                  }
                  title="เอฟเฟกต์ขอบ"
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="none">ไม่มี</option>
                  <option value="glow">เรืองแสง</option>
                  <option value="pulse">กระพริบ</option>
                  <option value="shimmer">วิ่ง</option>
                  <option value="bounce">เด้ง</option>
                  <option value="shake">สั่น</option>
                  <option value="rainbow">สายรุ้ง</option>
                  <option value="blink">กระพริบจ้า</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleGroupDialogSave}
              disabled={!groupForm.headerName.trim()}
            >
              {editingGroupFormId ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCompanyId ? "แก้ไขบริษัท" : "เพิ่มบริษัท"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="co-name">ชื่อบริษัท</Label>
              <Input
                id="co-name"
                value={companyForm.displayName}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="กรอกชื่อบริษัท"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="co-code">รหัสบริษัท (code)</Label>
                <Input
                  id="co-code"
                  value={companyForm.code}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="เช่น AIA"
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
                  placeholder="เช่น 123"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-claimtype">ประเภทการเบิก</Label>
              <select
                id="co-claimtype"
                value={companyForm.claimType}
                onChange={(e) =>
                  setCompanyForm((prev) => ({
                    ...prev,
                    claimType: e.target.value as "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY",
                  }))
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="OPD_IPD">OPD + IPD</option>
                <option value="OPD_ONLY">OPD เท่านั้น</option>
                <option value="IPD_ONLY">IPD เท่านั้น</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-redirect">Redirect URL (ถ้ามี)</Label>
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
              <Label>โลโก้บริษัท</Label>
              {companyForm.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={withBasePath(companyForm.logoUrl)} alt="logo" className="w-12 h-12 object-contain rounded border" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 gap-1"
                    onClick={() => setCompanyForm((prev) => ({ ...prev, logoUrl: "" }))}
                  >
                    <X className="size-3.5" />
                    ลบโลโก้
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="size-3.5" />
                    {uploading ? "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
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
              <Label htmlFor="co-remark">หมายเหตุ</Label>
              <Input
                id="co-remark"
                value={companyForm.remark}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, remark: e.target.value }))
                }
                placeholder="ข้อความหมายเหตุ"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="co-alert">ข้อความแจ้งเตือน (ถ้ามี)</Label>
                <Input
                  id="co-alert"
                  value={companyForm.alertText}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, alertText: e.target.value }))
                  }
                  placeholder="เช่น OPD ให้สำรองจ่าย"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-alert-type">ประเภท</Label>
                <select
                  id="co-alert-type"
                  value={companyForm.alertType}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, alertType: e.target.value as "warning" | "error" | "info" | "success" | "promo" | "urgent" }))
                  }
                  title="ประเภทแจ้งเตือน"
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="warning">⚠️ เตือน</option>
                  <option value="error">❌ สำคัญ</option>
                  <option value="info">ℹ️ แจ้งข้อมูล</option>
                  <option value="success">✅ สำเร็จ</option>
                  <option value="promo">🎉 โปรโมชั่น</option>
                  <option value="urgent">🚨 ด่วน</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-alert-size">ขนาด</Label>
                <select
                  id="co-alert-size"
                  value={companyForm.alertSize}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, alertSize: e.target.value as "xs" | "sm" | "md" | "lg" | "xl" }))
                  }
                  title="ขนาดแจ้งเตือน"
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
                <Label htmlFor="co-alert-border">ขอบ</Label>
                <select
                  id="co-alert-border"
                  value={companyForm.alertBorder}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, alertBorder: e.target.value as AlertBorder }))
                  }
                  title="เอฟเฟกต์ขอบ"
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="none">ไม่มี</option>
                  <option value="glow">เรืองแสง</option>
                  <option value="pulse">กระพริบ</option>
                  <option value="shimmer">วิ่ง</option>
                  <option value="bounce">เด้ง</option>
                  <option value="shake">สั่น</option>
                  <option value="rainbow">สายรุ้ง</option>
                  <option value="blink">กระพริบจ้า</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="co-clickable">คลิกได้ (ไม่ระงับ)</Label>
              <Switch
                id="co-clickable"
                checked={companyForm.isClickable}
                onCheckedChange={(val) =>
                  setCompanyForm((prev) => ({ ...prev, isClickable: val }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="co-isnew">แสดงป้าย "ใหม่"</Label>
              <Switch
                id="co-isnew"
                checked={companyForm.isNew}
                onCheckedChange={(val) =>
                  setCompanyForm((prev) => ({ ...prev, isNew: val }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleCompanyDialogSave}
              disabled={!companyForm.displayName.trim()}
            >
              {editingCompanyId ? "บันทึก" : "เพิ่ม"}
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
            <AlertDialogTitle>ยืนยันการลบกลุ่ม?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบกลุ่มจะลบบริษัททั้งหมดในกลุ่มด้วย และไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteGroupId && handleDeleteGroup(deleteGroupId)}
            >
              ลบ
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
            <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบนี้ไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
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
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
