"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { CompanySection, Company } from "@/types/portal";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Save, Upload, X } from "lucide-react";
import DragDropList from "@/components/admin/DragDropList";

// shadcn Select might not be installed — use native select as fallback

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
}

const emptyForm: CompanyFormData = {
  displayName: "",
  code: "",
  iclaimId: "",
  isClickable: true,
  isNew: false,
  claimType: "OPD_IPD",
  remark: "",
  redirectUrl: "",
  logoUrl: "",
};

const CLAIM_TYPE_LABELS: Record<string, string> = {
  OPD_IPD: "OPD + IPD",
  OPD_ONLY: "OPD เท่านั้น",
  IPD_ONLY: "IPD เท่านั้น",
};

export default function InsurancePage() {
  const { data, loading, error, save } = useAdminContent<CompanySection>(
    "insurance-companies"
  );
  const [headingValue, setHeadingValue] = useState("");
  const [headingInitialized, setHeadingInitialized] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (data && !headingInitialized) {
    setHeadingValue(data.heading ?? "");
    setHeadingInitialized(true);
  }

  const companies = data?.companies ?? [];

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(company: Company) {
    setEditingId(company.id);
    setForm({
      displayName: company.displayName,
      code: company.code ?? "",
      iclaimId: company.iclaimId ?? "",
      isClickable: company.isClickable,
      isNew: company.isNew,
      claimType: company.claimType,
      remark: company.remark ?? "",
      redirectUrl: company.redirectUrl ?? "",
      logoUrl: company.logoUrl ?? "",
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
      code: form.code.trim() || null,
      iclaimId: form.iclaimId.trim() || null,
      isClickable: form.isClickable,
      isNew: form.isNew,
      claimType: form.claimType,
      remark: form.remark.trim() || null,
      redirectUrl: form.redirectUrl.trim() || undefined,
      logoUrl: form.logoUrl.trim() || null,
    };
  }

  function handleDialogSave() {
    if (!form.displayName.trim()) return;

    const newCompanies = editingId
      ? companies.map((c) =>
          c.id === editingId ? buildCompanyFromForm(editingId) : c
        )
      : [...companies, buildCompanyFromForm(`ins-${Date.now()}`)];

    const newData: CompanySection = {
      ...(data ?? { heading: headingValue, companies: [] }),
      heading: headingValue,
      companies: newCompanies,
    };
    void save(newData);
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    if (!data) return;
    const newCompanies = companies.filter((c) => c.id !== id);
    void save({ ...data, heading: headingValue, companies: newCompanies });
    setDeleteId(null);
  }

  function handleReorder(reordered: Company[]) {
    if (!data) return;
    void save({ ...data, heading: headingValue, companies: reordered });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save({ ...data, heading: headingValue, companies });
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
      setForm((prev) => ({ ...prev, logoUrl: url }));
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
        <h1 className="text-xl font-bold text-gray-900">จัดการบริษัทประกัน</h1>
        <div className="flex gap-2">
          <Button onClick={openAddDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            เพิ่มบริษัท
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
            <Label htmlFor="ins-heading">หัวข้อส่วน</Label>
            <Input
              id="ins-heading"
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {companies.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
          ยังไม่มีบริษัท กดปุ่ม "เพิ่มบริษัท" เพื่อเพิ่ม
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
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
            items={companies}
            onReorder={handleReorder}
            renderItem={(company) => (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex-1">
                      <span className="text-sm font-medium text-gray-800">
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
                          const updated = companies.map((c) =>
                            c.id === company.id ? { ...c, isClickable: val } : c
                          );
                          void save({ ...data, heading: headingValue, companies: updated });
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
                          void save({ ...data, heading: headingValue, companies: updated });
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
              {editingId ? "แก้ไขบริษัทประกัน" : "เพิ่มบริษัทประกัน"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="co-name">ชื่อบริษัท</Label>
              <Input
                id="co-name"
                value={form.displayName}
                onChange={(e) => handleFormChange("displayName", e.target.value)}
                placeholder="กรอกชื่อบริษัทประกัน"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="co-code">รหัสบริษัท (code)</Label>
                <Input
                  id="co-code"
                  value={form.code}
                  onChange={(e) => handleFormChange("code", e.target.value)}
                  placeholder="เช่น AIA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-iclaimid">iClaim ID</Label>
                <Input
                  id="co-iclaimid"
                  value={form.iclaimId}
                  onChange={(e) => handleFormChange("iclaimId", e.target.value)}
                  placeholder="เช่น 123"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-claimtype">ประเภทการเบิก</Label>
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
                <option value="OPD_IPD">OPD + IPD</option>
                <option value="OPD_ONLY">OPD เท่านั้น</option>
                <option value="IPD_ONLY">IPD เท่านั้น</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-redirect">Redirect URL (ถ้ามี)</Label>
              <Input
                id="co-redirect"
                value={form.redirectUrl}
                onChange={(e) => handleFormChange("redirectUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>โลโก้บริษัท</Label>
              {form.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={form.logoUrl} alt="logo" className="w-12 h-12 object-contain rounded border" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 gap-1"
                    onClick={() => handleFormChange("logoUrl", "")}
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
              <Label htmlFor="co-remark">หมายเหตุ (แสดงเมื่อระงับ)</Label>
              <Input
                id="co-remark"
                value={form.remark}
                onChange={(e) => handleFormChange("remark", e.target.value)}
                placeholder="ข้อความหมายเหตุ"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="co-clickable">คลิกได้ (ไม่ระงับ)</Label>
              <Switch
                id="co-clickable"
                checked={form.isClickable}
                onCheckedChange={(val) => handleFormChange("isClickable", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="co-isnew">แสดงป้าย "ใหม่"</Label>
              <Switch
                id="co-isnew"
                checked={form.isNew}
                onCheckedChange={(val) => handleFormChange("isNew", val)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleDialogSave}
              disabled={!form.displayName.trim()}
            >
              {editingId ? "บันทึก" : "เพิ่ม"}
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
            <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบนี้ไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
