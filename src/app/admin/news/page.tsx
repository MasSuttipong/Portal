"use client";

import { useState } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { NewsData, NewsItem } from "@/types/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2, Plus, Save } from "lucide-react";
import DragDropList from "@/components/admin/DragDropList";

interface NewsFormData {
  title: string;
  url: string;
  isNew: boolean;
  isPublished: boolean;
}

const emptyForm: NewsFormData = {
  title: "",
  url: "",
  isNew: false,
  isPublished: true,
};

export default function NewsPage() {
  const { data, loading, error, save } = useAdminContent<NewsData>("news");
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const items = data?.items ?? [];

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: NewsItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      url: item.url,
      isNew: item.isNew,
      isPublished: item.isPublished,
    });
    setDialogOpen(true);
  }

  function handleFormChange<K extends keyof NewsFormData>(
    key: K,
    value: NewsFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDialogSave() {
    if (!form.title.trim()) return;

    const newItems = editingId
      ? items.map((item) =>
          item.id === editingId
            ? { ...item, ...form }
            : item
        )
      : [
          ...items,
          {
            id: `n-${Date.now()}`,
            ...form,
          },
        ];

    const newData: NewsData = { ...(data ?? { items: [] }), items: newItems };
    void save(newData);
    setDialogOpen(false);
  }

  function handleToggleField(id: string, field: "isNew" | "isPublished", value: boolean) {
    if (!data) return;
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    void save({ ...data, items: newItems });
  }

  function handleDelete(id: string) {
    if (!data) return;
    const newItems = items.filter((item) => item.id !== id);
    void save({ ...data, items: newItems });
    setDeleteId(null);
  }

  function handleReorder(reordered: NewsItem[]) {
    if (!data) return;
    void save({ ...data, items: reordered });
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    await save(data);
    setSaving(false);
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
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t("news.pageTitle")}</h1>
        <div className="flex gap-2">
          <Button onClick={openAddDialog} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t("news.addNews")}
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="size-4" />
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
          {t("news.noNews")}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>{t("news.title")}</TableHead>
                <TableHead className="w-24 text-center">{t("common.new")}</TableHead>
                <TableHead className="w-28 text-center">{t("common.published")}</TableHead>
                <TableHead className="w-24 text-right">{t("common.manage")}</TableHead>
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
                    <TableCell className="w-[calc(100%-224px)]">
                      <span className="text-sm text-gray-800 line-clamp-1" title={item.title}>
                        {item.title.length > 60
                          ? item.title.slice(0, 60) + "..."
                          : item.title}
                      </span>
                      {item.url && (
                        <span className="block text-xs text-gray-400 truncate mt-0.5">
                          {item.url}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="w-24 text-center">
                      <Switch
                        checked={item.isNew}
                        onCheckedChange={(val) =>
                          handleToggleField(item.id, "isNew", val)
                        }
                      />
                    </TableCell>
                    <TableCell className="w-28 text-center">
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={(val) =>
                          handleToggleField(item.id, "isPublished", val)
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
              {editingId ? t("news.editNews") : t("news.addNews")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="news-title">{t("news.title")}</Label>
              <Textarea
                id="news-title"
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder={t("news.titlePlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-url">URL</Label>
              <Input
                id="news-url"
                type="url"
                value={form.url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="news-isNew">{t("news.newBadge")}</Label>
              <Switch
                id="news-isNew"
                checked={form.isNew}
                onCheckedChange={(val) => handleFormChange("isNew", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="news-isPublished">{t("common.published")}</Label>
              <Switch
                id="news-isPublished"
                checked={form.isPublished}
                onCheckedChange={(val) => handleFormChange("isPublished", val)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleDialogSave} disabled={!form.title.trim()}>
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
