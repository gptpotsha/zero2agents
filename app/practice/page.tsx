import Link from "next/link";
import { PracticeTerminal } from "@/components/terminal/practice-terminal";

export const metadata = {
  title: "Песочница терминала",
  description: "Свободный терминал-тренажёр: командуй без риска — всё виртуально.",
};

export default function PracticePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-mono text-lg font-bold tracking-tight">
            &gt;_ Песочница
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            К урокам →
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-bold">Practice Terminal</h1>
        <p className="mt-1 text-muted-foreground">
          Экспериментируй с командами свободно: файлы виртуальные, среду можно сбросить в любой момент.
        </p>
        <div className="mt-6">
          <PracticeTerminal />
        </div>
      </main>
    </div>
  );
}
