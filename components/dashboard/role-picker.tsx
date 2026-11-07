"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listRoles } from "@/lib/content/plan";
import { selectRoleAction } from "@/app/actions/plan";

export function RolePicker({
  currentRoleId,
  onSelected,
}: {
  currentRoleId: string | null;
  onSelected?: () => void;
}) {
  const roles = listRoles();
  const [selected, setSelected] = useState<string | null>(currentRoleId);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSelect = (roleId: string) => {
    setSelected(roleId);
    startTransition(async () => {
      const res = await selectRoleAction(roleId);
      if (res.ok) {
        setStatusMsg(res.ok);
        onSelected?.();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => {
          const isCurrent = selected === r.id;
          return (
            <Card
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className={`cursor-pointer transition-all hover:border-primary/60 ${
                isCurrent
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border/60 hover:bg-muted/30"
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden="true">
                    {r.icon}
                  </span>
                  {isCurrent ? (
                    <Badge className="bg-primary text-primary-foreground text-xs">Выбрано</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {r.priorities.priority.length} уровней
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{r.name}</h4>
                  <p className="text-xs font-medium text-primary mt-0.5">{r.tagline}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {r.description}
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>{r.priorities.priority.length} в фокусе</span>
                  {r.priorities.skip.length > 0 && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-muted-foreground/70">{r.priorities.skip.length} пропуск</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {statusMsg && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
          ✓ {statusMsg}
        </p>
      )}
      {isPending && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">
          Перестраиваем план...
        </p>
      )}
    </div>
  );
}
