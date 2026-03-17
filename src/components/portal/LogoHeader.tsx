import type { PortalSettings } from "@/types/portal";
import { withBasePath } from "@/lib/base-path";

interface LogoHeaderProps {
  settings: PortalSettings;
}

export default function LogoHeader({ settings }: LogoHeaderProps) {
  return (
    <div className="flex flex-col items-center py-6">
      <img
        src={withBasePath(settings.logo.url)}
        alt={settings.logo.alt}
        className="max-h-28 w-auto object-contain drop-shadow-sm"
      />
      <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-portal-gold to-transparent" />
    </div>
  );
}
