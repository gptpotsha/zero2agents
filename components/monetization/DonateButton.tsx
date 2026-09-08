import { isDonateEnabled, monetizationConfig } from "@/lib/monetization/config";

export function DonateButton() {
  if (!isDonateEnabled()) return null;
  return (
    <a
      href={monetizationConfig.donate.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-muted-foreground underline underline-offset-4"
    >
      Поддержать проект
    </a>
  );
}
