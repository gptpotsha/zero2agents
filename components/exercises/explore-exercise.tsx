"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen, FileText, CheckCircle2 } from "lucide-react";
import type { ExploreExercise as ExploreExerciseType } from "@/lib/content/types";

interface TreeNode {
  name: string;
  fullPath: string;
  isDir: boolean;
  children: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode {
  const root: TreeNode = { name: "/", fullPath: "", isDir: true, children: [] };

  for (const filePath of Object.keys(files)) {
    const parts = filePath.split("/").filter(Boolean);
    let current = root;
    let accumulated = "";

    parts.forEach((part, idx) => {
      accumulated += `/${part}`;
      const isFile = idx === parts.length - 1;
      let existing = current.children.find((c) => c.name === part);

      if (!existing) {
        existing = {
          name: part,
          fullPath: accumulated,
          isDir: !isFile,
          children: [],
        };
        current.children.push(existing);
      }
      current = existing;
    });
  }

  // Сортировка: сначала папки, затем файлы
  const sortNodes = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
      return a.isDir ? -1 : 1;
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root;
}

export function ExploreExercise({
  exercise,
  onSolved,
}: {
  exercise: ExploreExerciseType;
  onSolved: () => void;
}) {
  const tree = useMemo(() => buildTree(exercise.files), [exercise.files]);
  const allFilePaths = useMemo(() => Object.keys(exercise.files), [exercise.files]);
  const totalCount = allFilePaths.length;

  // Раскрытые папки по умолчанию
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { "": true };
    for (const p of allFilePaths) {
      const parts = p.split("/").filter(Boolean);
      let acc = "";
      for (let i = 0; i < parts.length - 1; i++) {
        acc += `/${parts[i]}`;
        initial[acc] = true;
      }
    }
    return initial;
  });

  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    return exercise.initialPath ?? allFilePaths[0] ?? null;
  });

  const [exploredFiles, setExploredFiles] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const first = exercise.initialPath ?? allFilePaths[0];
    if (first) initial.add(first);
    return initial;
  });

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    setExploredFiles((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  };

  const isCompleted = exploredFiles.size >= totalCount;
  const progressPercent = Math.round((exploredFiles.size / totalCount) * 100);

  const renderTree = (node: TreeNode, depth = 0) => {
    if (node !== tree && node.isDir) {
      const isFolderOpen = expanded[node.fullPath] ?? false;
      return (
        <div key={node.fullPath} className="select-none">
          <button
            type="button"
            onClick={() => toggleFolder(node.fullPath)}
            className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs font-medium text-foreground hover:bg-muted/60"
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
          >
            {isFolderOpen ? (
              <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isFolderOpen && (
            <div>{node.children.map((child) => renderTree(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    if (node !== tree && !node.isDir) {
      const isSelected = selectedFile === node.fullPath;
      const isExplored = exploredFiles.has(node.fullPath);
      return (
        <button
          key={node.fullPath}
          type="button"
          onClick={() => handleSelectFile(node.fullPath)}
          className={`flex w-full items-center justify-between rounded-md px-1.5 py-1 text-left text-xs transition-colors ${
            isSelected
              ? "bg-primary/15 font-semibold text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
          {isExplored && (
            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 ml-1" />
          )}
        </button>
      );
    }

    // Корень
    return <div>{node.children.map((child) => renderTree(child, depth))}</div>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">📂</span>
              <h4 className="font-semibold text-sm">Интерактивный проводник</h4>
              <Badge variant="outline" className="text-xs">
                {exploredFiles.size} / {totalCount} открыто
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{exercise.task}</p>
          </div>
          <div className="h-2 w-32 shrink-0 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-300 ${isCompleted ? "bg-green-600" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[240px_1fr] rounded-lg border overflow-hidden">
        {/* Дерево файлов */}
        <div className="border-b md:border-b-0 md:border-r bg-muted/10 p-2.5 max-h-[360px] overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-1">
            Файловая система
          </p>
          {renderTree(tree)}
        </div>

        {/* Просмотрщик файла */}
        <div className="flex flex-col bg-card min-h-[260px] max-h-[360px]">
          <div className="border-b px-3 py-2 bg-muted/20 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground truncate">
              {selectedFile ?? "Выберите файл слева"}
            </span>
            {selectedFile && exploredFiles.has(selectedFile) && (
              <Badge variant="outline" className="text-[10px] text-green-600 border-green-600/30">
                ✓ исследован
              </Badge>
            )}
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {selectedFile ? (
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                {exercise.files[selectedFile] || "(Файл пуст)"}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Кликните по любому файлу в дереве слева для просмотра.
              </p>
            )}
          </div>
        </div>
      </div>

      {isCompleted ? (
        <div className="rounded-lg border border-green-600/30 bg-green-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Отлично! Все файлы и папки исследованы.
            </span>
          </div>
          <Button onClick={onSolved} size="sm" className="bg-green-600 hover:bg-green-700 text-white shrink-0">
            Завершить шаг →
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Откройте все оставшиеся файлы ({totalCount - exploredFiles.size}), чтобы разблокировать продолжение.
        </p>
      )}
    </div>
  );
}
