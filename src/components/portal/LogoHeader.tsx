import type { PortalSettings } from "@/types/portal";

interface LogoHeaderProps {
  settings: PortalSettings;
}

export default function LogoHeader({ settings }: LogoHeaderProps) {
  return (
    <div className="flex justify-center items-center py-6">
      <img
        src={settings.logo.url}
        alt={settings.logo.alt}
        className="max-h-24 w-auto object-contain"
      />
    </div>
  );
}
