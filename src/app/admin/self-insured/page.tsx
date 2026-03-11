"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { CompanySection, CompanyGroup, Company } from "@/types/portal";
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
import { Pencil, Trash2, Plus, Save, ChevronDown, ChevronRight, Users } from "lucide-react";
import DragDropList from "@/components/admin/DragDropList";

interface CompanyFormData {
  displayName: string;
  code: string;
  iclaimId: string;
  isClickable: boolean;
  isNew: boolean;
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string;
  redirectUrl: string;
}

interface GroupFormData {
  headerName: string;
  headerIconUrl: string;
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
};

const emptyGroupForm: GroupFormData = {
  headerName: "",
  headerIconUrl: "",
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
  const [deleteCompanyTarget, setDeleteCompanyTarget] = useState<{ groupId: string; companyId: string } | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);

  if (data && !headingInitialized) {
    setHeadingValue(data.heading ?? "");
    setHeadingInitialized(true);
  }

  const groups = data?.groups ?? [];
  const ungroupedCompanies = data?.companies ?? [];

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
            }
          : g
      );
    } else {
      const newGroup: CompanyGroup = {
        id: `grp-${Date.now()}`,
        headerName: groupForm.headerName,
        headerIconUrl: groupForm.headerIconUrl.trim() || null,
        companies: [],
      };
      newGroups = [...currentGroups, newGroup];
    }

    void save({ ...data, heading: headingValue, groups: newGroups });
    setGroupDialogOpen(false);
  }

  function handleDeleteGroup(groupId: string) {
    if (!data) return;
    const newGroups = groups.filter((g) => g.id !== groupId);
    void save({ ...data, heading: headingValue, groups: newGroups });
    setDeleteGroupId(null);
  }

  function handleReorderGroups(reordered: CompanyGroup[]) {
    if (!data) return;
    void save({ ...data, heading: headingValue, groups: reordered });
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
    };
  }

  function handleCompanyDialogSave() {
    if (!companyForm.displayName.trim() || !data || !editingGroupId) return;

    const newGroups = groups.map((g) => {
      if (g.id !== editingGroupId) return g;

      const newCompanies = editingCompanyId
        ? g.companies.map((c) =>
            c.id === editingCompanyId ? buildCompanyFromForm(editingCompanyId) : c
          )
        : [...g.companies, buildCompanyFromForm(`co-${Date.now()}`)];

      return { ...g, companies: newCompanies };
    });

    void save({ ...data, heading: headingValue, groups: newGroups });
    setCompanyDialogOpen(false);
  }

  function handleDeleteCompany(groupId: string, companyId: string) {
    if (!data) return;
    const newGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      return { ...g, companies: g.companies.filter((c) => c.id !== companyId) };
    });
    void save({ ...data, heading: headingValue, groups: newGroups });
    setDeleteCompanyTarget(null);
  }

  function handleReorderCompanies(groupId: string, reordered: Company[]) {
    if (!data) return;
    const newGroups = groups.map((g) =>
      g.id === groupId ? { ...g, companies: reordered } : g
    );
    void save({ ...data, heading: headingValue, groups: newGroups });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save({ ...data, heading: headingValue, groups, companies: ungroupedCompanies });
    setSaving(false);
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
                                        void save({ ...data, heading: headingValue, groups: newGroups });
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
