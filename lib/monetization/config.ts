/**
 * Конфиг монетизации (Ф4 активирует поверхности).
 * Пока всё выключено — компоненты-слоты рендерят null.
 * Переключение конфига не требует правок контента.
 */
export interface AdPlacementConfig {
  enabled: boolean;
}

type PlacementsMap = Record<string, boolean>;

export const monetizationConfig = {
  ads: {
    enabled: false,
    placements: {
      "landing-footer": false,
      "dashboard-sidebar": false,
    } satisfies PlacementsMap,
  },
  donate: {
    enabled: false,
    url: "", // провайдер (Boosty/ЮMoney/...) подставляется в Ф4
  },
  affiliate: {
    enabled: false,
    registry: {} as Record<string, { provider: string; url: string }>,
  },
};

export function isPlacementEnabled(placement: string): boolean {
  const placements = monetizationConfig.ads.placements as PlacementsMap;
  return monetizationConfig.ads.enabled && placements[placement] === true;
}

export function isDonateEnabled(): boolean {
  return monetizationConfig.donate.enabled && monetizationConfig.donate.url.length > 0;
}

export function affiliateLink(id: string): { provider: string; url: string } | null {
  if (!monetizationConfig.affiliate.enabled) return null;
  return monetizationConfig.affiliate.registry[id] ?? null;
}
