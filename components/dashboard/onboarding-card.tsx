"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RolePicker } from "./role-picker";
import { getRole } from "@/lib/content/plan";

export function OnboardingCard({
  currentRoleId,
  completedPriorityLessons,
  totalPriorityLessons,
}: {
  currentRoleId: string | null;
  completedPriorityLessons: number;
  totalPriorityLessons: number;
}) {
  const [isOpen, setIsOpen] = useState(!currentRoleId);
  const currentRole = getRole(currentRoleId);

  if (!isOpen && currentRole) {
    const percent = totalPriorityLessons > 0 ? Math.round((completedPriorityLessons / totalPriorityLessons) * 100) : 0;
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{currentRole.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Твой персональный план: {currentRole.name}</span>
                <Badge variant="outline" className="text-xs bg-background">
                  {percent}% фокуса
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedPriorityLessons} из {totalPriorityLessons} уроков приоритета пройдено · {currentRole.tagline}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="shrink-0 text-xs"
          >
            Сменить роль / цель
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 shadow-sm bg-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold text-base">Персонализация обучения (AI-план)</h3>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-xs border-0">
                Маршрут
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Выбери свою роль — мы подсветим обязательные уровни и подскажем, что можно пропустить, чтобы сэкономить твоё время и быстрее дойти до цели.
            </p>
          </div>
          {currentRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground"
            >
              Свернуть ✕
            </Button>
          )}
        </div>

        <RolePicker
          currentRoleId={currentRoleId}
          onSelected={() => {
            // Оставляем открытым на мгновение для подтверждения
            setTimeout(() => setIsOpen(false), 900);
          }}
        />
      </CardContent>
    </Card>
  );
}
