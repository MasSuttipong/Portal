"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminContent } from "@/lib/useAdminContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PortalSettings, PortalTheme, AlertType, AlertSize, AlertBorder } from "@/types/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeDecorations from "@/components/portal/ThemeDecorations";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import AnnouncementBanner from "@/components/portal/AnnouncementBanner";

export default function SettingsPage() {
  const { data, loading, error, save } = useAdminContent<PortalSettings>("settings");
  const { t } = useLanguage();

  const THEME_OPTIONS: { value: PortalTheme; icon: string; label: string }[] = [
    { value: "default", icon: "🎨", label: t("settings.themeDefault") },
    { value: "christmas", icon: "🎄", label: t("settings.themeChristmas") },
    { value: "newyear", icon: "🎆", label: t("settings.themeNewyear") },
    { value: "songkran", icon: "💦", label: t("settings.themeSongkran") },
    { value: "valentine", icon: "💕", label: t("settings.themeValentine") },
    { value: "chinese-newyear", icon: "🏮", label: t("settings.themeChineseNewyear") },
    { value: "halloween", icon: "🎃", label: t("settings.themeHalloween") },
    { value: "mothers-day", icon: "🌸", label: t("settings.themeMothersDay") },
    { value: "fathers-day", icon: "💛", label: t("settings.themeFathersDay") },
    { value: "spring", icon: "🌷", label: t("settings.themeSpring") },
    { value: "summer", icon: "☀️", label: t("settings.themeSummer") },
    { value: "autumn", icon: "🍂", label: t("settings.themeAutumn") },
    { value: "winter", icon: "⛄", label: t("settings.themeWinter") },
    { value: "party", icon: "🎉", label: t("settings.themeParty") },
    { value: "pride", icon: "🌈", label: t("settings.themePride") },
  ];

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
  const [activeTheme, setActiveTheme] = useState<PortalTheme>("default");
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
      setActiveTheme(data.theme?.activeTheme ?? "default");
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

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const json = (await res.json()) as { url: string };
      setLogoUrl(json.url);
      toast.success(t("settings.uploadSuccess"));
    } catch {
      toast.error(t("settings.uploadFailed"));
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
      theme: { activeTheme },
    };

    await save(newData);
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
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t("settings.pageTitle")}</h1>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
          <Save className="size-4" />
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>

      {/* Announcement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.announcement")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ann-enabled">{t("settings.enableAnnouncement")}</Label>
            <Switch
              id="ann-enabled"
              checked={annEnabled}
              onCheckedChange={setAnnEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ann-text">{t("settings.announcementText")}</Label>
            <Input
              id="ann-text"
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              placeholder={t("settings.announcementPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="ann-link">{t("settings.linkOptional")}</Label>
              <Input
                id="ann-link"
                value={annLink}
                onChange={(e) => setAnnLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-type">{t("common.type")}</Label>
              <select
                id="ann-type"
                value={annType}
                onChange={(e) => setAnnType(e.target.value as AlertType)}
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
              <Label htmlFor="ann-size">{t("common.size")}</Label>
              <select
                id="ann-size"
                value={annSize}
                onChange={(e) => setAnnSize(e.target.value as AlertSize)}
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
              <Label htmlFor="ann-border">{t("common.border")}</Label>
              <select
                id="ann-border"
                value={annBorder}
                onChange={(e) => setAnnBorder(e.target.value as AlertBorder)}
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
            <Label htmlFor="ann-dismissible">{t("settings.allowDismiss")}</Label>
            <Switch
              id="ann-dismissible"
              checked={annDismissible}
              onCheckedChange={setAnnDismissible}
            />
          </div>

          {/* Live preview */}
          {annText.trim() && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">{t("settings.previewLabel")}</Label>
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
          <CardTitle className="text-base">{t("settings.logoSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Preview */}
          <div className="flex items-center gap-4">
            <div className="size-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
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
              <p className="text-sm text-gray-500">{t("settings.supportedFormats")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploading ? t("company.uploading") : t("settings.uploadImage")}
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
            <Label htmlFor="logo-url">{t("settings.imageUrl")}</Label>
            <Input
              id="logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/images/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-alt">{t("settings.altText")}</Label>
            <Input
              id="logo-alt"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              placeholder={t("settings.altTextPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* iClaim Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.iclaimSettings")}</CardTitle>
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
            <Label htmlFor="iclaim-confirmtext">{t("settings.confirmText")}</Label>
            <Input
              id="iclaim-confirmtext"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t("settings.confirmTextPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iclaim-ok">{t("settings.confirmButton")}</Label>
              <Input
                id="iclaim-ok"
                value={confirmOk}
                onChange={(e) => setConfirmOk(e.target.value)}
                placeholder="OK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iclaim-cancel">{t("settings.cancelButton")}</Label>
              <Input
                id="iclaim-cancel"
                value={confirmCancel}
                onChange={(e) => setConfirmCancel(e.target.value)}
                placeholder={t("common.cancel")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iclaim-claimtype">{t("settings.claimTypePrompt")}</Label>
            <Input
              id="iclaim-claimtype"
              value={claimTypePrompt}
              onChange={(e) => setClaimTypePrompt(e.target.value)}
              placeholder={t("settings.claimTypePromptPlaceholder")}
            />
          </div>

          {/* iClaim Modal Preview */}
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-xs text-gray-400 mb-2">{t("settings.previewLabel")}</p>
            <p className="text-sm text-gray-700">{confirmText || "คุณต้องการเข้าสู่ระบบ iClaim?"}</p>
            <p className="text-xs text-gray-500 mt-2">{claimTypePrompt || "กรุณาเลือกประเภทการเบิก"}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">{confirmCancel || "ยกเลิก"}</Button>
              <Button size="sm">{confirmOk || "ตกลง"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.theme")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">{t("settings.themeLabel")}</Label>
            <select
              id="theme-select"
              title={t("settings.themeLabel")}
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value as PortalTheme)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeTheme !== "default" && (
            <div className="relative h-40 rounded-lg border overflow-hidden" data-theme={activeTheme}>
              <div className="absolute inset-0 bg-background" />
              <ThemeDecorations theme={activeTheme} />
              <div className="relative z-10 flex items-center justify-center h-full">
                <span className="text-4xl">
                  {THEME_OPTIONS.find((o) => o.value === activeTheme)?.icon}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
