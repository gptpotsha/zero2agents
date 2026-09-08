import { isPlacementEnabled } from "@/lib/monetization/config";

/**
 * Рекламный слот. Пока конфиг выключен — рендерит null.
 * В Ф4 сюда подключаются спонсорские/рекламные блоки (только вне уроков).
 */
export function AdSlot({ placement }: { placement: string }) {
  if (!isPlacementEnabled(placement)) return null;
  return (
    <aside
      aria-label="Реклама"
      className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground"
    >
      Рекламное место ({placement})
    </aside>
  );
}
