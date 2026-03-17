"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import type { PortalSettings, AlertType, AlertSize, AlertBorder } from "@/types/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import AnnouncementBanner from "@/components/portal/AnnouncementBanner";
import { withBasePath, withBasePathApi } from "@/lib/base-path";

export default function SettingsPage() {
  const { data, loading, error, save } = useAdminContent<PortalSettings>("settings");

  const [logoUrl, setLogoUrl] = useState("");
  const [logoAlt, setLogoAlt] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmOk, setConfirmOk] = useState("");
  const [confirmCancel, setConfirmCancel] = useState("");
  const [claimTypePrompt, setClaimTypePrompt] = useState("");
  const [annEnabled, setAnnEnabled] = useState(false);
  const [annText, setAnnText] = useState("");
  const [annType, setAnnType] = useState<AlertType>("info");
  const [annSize, setAnnSize] = useState<AlertSize>("md");
  const [annBorder, setAnnBorder] = useState<AlertBorder>("none");
  const [annLink, setAnnLink] = useState("");
  const [annDismissible, setAnnDismissible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data && !initialized) {
      setLogoUrl(data.logo?.url ?? "");
      setLogoAlt(data.logo?.alt ?? "");
      setBaseUrl(data.iclaim?.baseUrl ?? "");
      setConfirmText(data.iclaim?.confirmText ?? "");
      setConfirmOk(data.iclaim?.confirmOk ?? "");
      setConfirmCancel(data.iclaim?.confirmCancel ?? "");
      setClaimTypePrompt(data.iclaim?.claimTypePrompt ?? "");
      setAnnEnabled(data.announcement?.enabled ?? false);
      setAnnText(data.announcement?.text ?? "");
      setAnnType(data.announcement?.type ?? "info");
      setAnnSize(data.announcement?.size ?? "md");
      setAnnBorder(data.announcement?.border ?? (data.announcement?.glow ? "glow" : "none"));
      setAnnLink(data.announcement?.link ?? "");
      setAnnDismissible(data.announcement?.dismissible ?? true);
      setInitialized(true);
    }
  }, [data, initialized]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(withBasePathApi("/api/admin/upload"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const json = (await res.json()) as { url: string };
      setLogoUrl(json.url);
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    } catch {
      toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);

    const newData: PortalSettings = {
      logo: { url: logoUrl, alt: logoAlt },
      iclaim: {
        baseUrl,
        confirmText,
        confirmOk,
        confirmCancel,
        claimTypePrompt,
      },
      announcement: {
        enabled: annEnabled,
        text: annText,
        type: annType,
        size: annSize,
        border: annBorder,
        link: annLink.trim() || null,
        dismissible: annDismissible,
      },
    };

    await save(newData);
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
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
          <Save className="size-4" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>

      {/* Announcement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ประกาศ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ann-enabled">เปิดใช้งานประกาศ</Label>
            <Switch
              id="ann-enabled"
              checked={annEnabled}
              onCheckedChange={setAnnEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ann-text">ข้อความประกาศ</Label>
            <Input
              id="ann-text"
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              placeholder="เช่น ระบบจะปิดปรับปรุงวันที่ 15 มี.ค."
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="ann-link">ลิงก์ (ไม่บังคับ)</Label>
              <Input
                id="ann-link"
                value={annLink}
                onChange={(e) => setAnnLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-type">ประเภท</Label>
              <select
                id="ann-type"
                value={annType}
                onChange={(e) => setAnnType(e.target.value as AlertType)}
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
              <Label htmlFor="ann-size">ขนาด</Label>
              <select
                id="ann-size"
                value={annSize}
                onChange={(e) => setAnnSize(e.target.value as AlertSize)}
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
              <Label htmlFor="ann-border">ขอบ</Label>
              <select
                id="ann-border"
                value={annBorder}
                onChange={(e) => setAnnBorder(e.target.value as AlertBorder)}
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
            <Label htmlFor="ann-dismissible">อนุญาตให้ปิดได้</Label>
            <Switch
              id="ann-dismissible"
              checked={annDismissible}
              onCheckedChange={setAnnDismissible}
            />
          </div>

          {/* Live preview */}
          {annText.trim() && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">ตัวอย่าง</Label>
              <AnnouncementBanner
                announcement={{
                  enabled: true,
                  text: annText,
                  type: annType,
                  size: annSize,
                  border: annBorder,
                  link: annLink.trim() || null,
                  dismissible: annDismissible,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">โลโก้</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Preview */}
          <div className="flex items-center gap-4">
            <div className="size-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <Image
                  src={withBasePath(logoUrl)}
                  alt={logoAlt || "Logo"}
                  width={96}
                  height={96}
                  className="object-contain size-full"
                />
              ) : (
                <ImageIcon className="size-8 text-gray-300" />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm text-gray-500">รูปแบบที่รองรับ: PNG, JPG, SVG, WebP</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url">URL รูปภาพ</Label>
            <Input
              id="logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/images/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-alt">Alt Text</Label>
            <Input
              id="logo-alt"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              placeholder="ชื่อทางเลือกของรูปภาพ"
            />
          </div>
        </CardContent>
      </Card>

      {/* iClaim Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">การตั้งค่า iClaim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iclaim-baseurl">Base URL</Label>
            <Input
              id="iclaim-baseurl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://iclaim.example.com/"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iclaim-confirmtext">ข้อความยืนยัน</Label>
            <Input
              id="iclaim-confirmtext"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ข้อความในกล่องยืนยัน"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iclaim-ok">ปุ่มยืนยัน</Label>
              <Input
                id="iclaim-ok"
                value={confirmOk}
                onChange={(e) => setConfirmOk(e.target.value)}
                placeholder="ตกลง"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iclaim-cancel">ปุ่มยกเลิก</Label>
              <Input
                id="iclaim-cancel"
                value={confirmCancel}
                onChange={(e) => setConfirmCancel(e.target.value)}
                placeholder="ยกเลิก"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iclaim-claimtype">ข้อความเลือกประเภทสิทธิ์</Label>
            <Input
              id="iclaim-claimtype"
              value={claimTypePrompt}
              onChange={(e) => setClaimTypePrompt(e.target.value)}
              placeholder="กรุณาเลือกประเภทการเบิก"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
