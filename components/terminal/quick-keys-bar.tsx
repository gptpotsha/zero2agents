"use client";

import { Button } from "@/components/ui/button";

interface QuickKeysBarProps {
  onKeyPress: (key: string) => void;
  className?: string;
}

export function QuickKeysBar({ onKeyPress, className = "" }: { onKeyPress: (key: string) => void; className?: string }) {
  const triggerKey = (val: string) => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    } catch {
      // Игнорируем вне TMA
    }
    onKeyPress(val);
  };

  const keys = [
    { label: "Tab", val: "\t", title: "Автодополнение" },
    { label: "Ctrl+C", val: "\x03", title: "Прервать команду" },
    { label: "/", val: "/", title: "Слэш" },
    { label: "-", val: "-", title: "Дефис / Флаг" },
    { label: "~", val: "~", title: "Домашняя папка" },
    { label: ".", val: ".", title: "Текущая папка" },
    { label: "↑", val: "\x1b[A", title: "Предыдущая команда" },
    { label: "↓", val: "\x1b[B", title: "Следующая команда" },
    { label: "Enter ↵", val: "\r", title: "Выполнить", highlight: true },
  ];

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto py-1 px-1 rounded-md bg-muted/60 border border-border/50 text-xs no-scrollbar ${className}`}
      aria-label="Панель быстрых клавиш для мобильного терминала"
    >
      <span className="text-[10px] text-muted-foreground font-mono px-1 select-none">Quick:</span>
      {keys.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => triggerKey(k.val)}
          title={k.title}
          className={`shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-all active:scale-95 select-none ${
            k.highlight
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "bg-background text-foreground border border-border hover:bg-accent"
          }`}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}
