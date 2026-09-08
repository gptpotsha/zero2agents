"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CheatSheetItem } from "@/lib/content/types";

/**
 * Шпаргалка уровня — как Cheat sheet в zero2claude:
 * список команд/ключевых приёмов уровня в модалке.
 */
export function CheatSheetButton({
  levelTitle,
  items,
}: {
  levelTitle: string;
  items: CheatSheetItem[];
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <Button {...props} variant="outline" size="sm">
            📋 Шпаргалка
          </Button>
        )}
      />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Шпаргалка: {levelTitle}
          </DialogTitle>
        </DialogHeader>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.cmd}
              className="flex flex-col gap-0.5 rounded-md border px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
                {item.cmd}
              </code>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Попробовать команды можно в{" "}
          <a href="/practice" className="underline underline-offset-2" target="_blank" rel="noreferrer">
            песочнице
          </a>{" "}
          — файлы там виртуальные.
        </p>
      </DialogContent>
    </Dialog>
  );
}
