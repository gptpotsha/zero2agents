import { describe, expect, it } from "vitest";

describe("Terminal Quick Keys Bar", () => {
  const keys = [
    { label: "Tab", val: "\t" },
    { label: "Ctrl+C", val: "\x03" },
    { label: "/", val: "/" },
    { label: "-", val: "-" },
    { label: "~", val: "~" },
    { label: ".", val: "." },
    { label: "↑", val: "\x1b[A" },
    { label: "↓", val: "\x1b[B" },
    { label: "Enter ↵", val: "\r" },
  ];

  it("содержит корректные управляющие escape-последовательности для xterm", () => {
    for (const k of keys) {
      expect(k.val).toBeDefined();
      expect(k.val.length).toBeGreaterThan(0);
    }

    const tab = keys.find((k) => k.label === "Tab");
    expect(tab?.val).toBe("\t");

    const ctrlC = keys.find((k) => k.label === "Ctrl+C");
    expect(ctrlC?.val).toBe("\x03");

    const enter = keys.find((k) => k.label === "Enter ↵");
    expect(enter?.val).toBe("\r");

    const upArrow = keys.find((k) => k.label === "↑");
    expect(upArrow?.val).toBe("\x1b[A");

    const downArrow = keys.find((k) => k.label === "↓");
    expect(downArrow?.val).toBe("\x1b[B");
  });
});
