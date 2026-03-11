"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { ManualData, ManualItem } from "@/types/portal";
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
import { Pencil, Trash2, Plus, Save } from "lucide-react";
import DragDropList from "@/components/admin/DragDropList";

interface ManualFormData {
  title: string;
  url: string;
  isPublished: boolean;
}

const emptyForm: ManualFormData = {
  title: "",
  url: "",
  isPublished: true,
};

export default function ManualPage() {
  const { data, loading, error, save } = useAdminContent<ManualData>("manual");
  const [subHeading, setSubHeading] = useState<string>("");
  const [subHeadingInitialized, setSubHeadingInitialized] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ManualFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize subHeading from loaded data once
  if (data && !subHeadingInitialized) {
    setSubHeading(data.subHeading ?? "");
    setSubHeadingInitialized(true);
  }

  const items = data?.items ?? [];

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: ManualItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      url: item.url,
      isPublished: item.isPublished,
    });
    setDialogOpen(true);
  }

  function handleFormChange<K extends keyof ManualFormData>(
    key: K,
    value: ManualFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDialogSave() {
    if (!form.title.trim()) return;

    const newItems = editingId
      ? items.map((item) =>
          item.id === editingId ? { ...item, ...form } : item
        )
      : [
          ...items,
          {
            id: `m-${Date.now()}`,
            ...form,
          },
        ];

    const newData: ManualData = { subHeading, items: newItems };
    void save(newData);
    setDialogOpen(false);
  }

  function handleTogglePublished(id: string, value: boolean) {
    if (!data) return;
    const newItems = items.map((item) =>
      item.id === id ? { ...item, isPublished: value } : item
    );
    void save({ subHeading, items: newItems });
  }

  function handleDelete(id: string) {
    if (!data) return;
    const newItems = items.filter((item) => item.id !== id);
    void save({ subHeading, items: newItems });
    setDeleteId(null);
  }

  function handleReorder(reordered: ManualItem[]) {
    if (!data) return;
    void save({ subHeading, items: reordered });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save({ subHeading, items });
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">จัดการคู่มือ</h1>
        <div className="flex gap-2">
          <Button onClick={openAddDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            เพิ่มคู่มือ
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="size-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      {/* Sub-heading */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">คำอธิบายส่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="manual-subheading">หัวข้อรอง</Label>
            <Input
              id="manual-subheading"
              value={subHeading}
              onChange={(e) => setSubHeading(e.target.value)}
              placeholder="กรอกหัวข้อรอง (ถ้ามี)"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
          ยังไม่มีคู่มือ กดปุ่ม "เพิ่มคู่มือ" เพื่อเพิ่ม
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>ชื่อคู่มือ</TableHead>
                <TableHead className="w-28 text-center">เผยแพร่</TableHead>
                <TableHead className="w-24 text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <DragDropList
            items={items}
            onReorder={handleReorder}
            renderItem={(item) => (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex-1">
                      <span className="text-sm text-gray-800">{item.title}</span>
                      {item.url && (
                        <span className="block text-xs text-gray-400 truncate mt-0.5">
                          {item.url}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="w-28 text-center">
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={(val) =>
                          handleTogglePublished(item.id, val)
                        }
                      />
                    </TableCell>
                    <TableCell className="w-24 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(item.id)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "แก้ไขคู่มือ" : "เพิ่มคู่มือ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="manual-title">ชื่อคู่มือ</Label>
              <Input
                id="manual-title"
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="กรอกชื่อคู่มือ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-url">URL</Label>
              <Input
                id="manual-url"
                type="url"
                value={form.url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="manual-isPublished">เผยแพร่</Label>
              <Switch
                id="manual-isPublished"
                checked={form.isPublished}
                onCheckedChange={(val) => handleFormChange("isPublished", val)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleDialogSave} disabled={!form.title.trim()}>
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
