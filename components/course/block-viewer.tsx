import type { Block } from "@/lib/content/types";

export function BlockViewer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="leading-relaxed">
                {block.text}
              </p>
            );
          case "h":
            return (
              <h3 key={i} className="text-lg font-semibold">
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-sm leading-relaxed"
              >
                {block.text}
              </pre>
            );
          case "note":
            return (
              <aside
                key={i}
                className="rounded-lg border-l-4 border-primary bg-muted/60 p-3 text-sm text-muted-foreground"
              >
                {block.text}
              </aside>
            );
        }
      })}
    </div>
  );
}
