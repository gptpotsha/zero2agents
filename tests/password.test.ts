import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("хэширование пароля (scrypt)", () => {
  it("хэш не равен паролю и верифицируется", () => {
    const hash = hashPassword("password123");
    expect(hash).not.toContain("password123");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("password123", hash)).toBe(true);
  });

  it("неверный пароль не проходит", () => {
    const hash = hashPassword("correct-horse");
    expect(verifyPassword("wrong-battery", hash)).toBe(false);
  });

  it("соль уникальна для каждого вызова", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("повреждённый хэш не бросает исключение", () => {
    expect(verifyPassword("x", "garbage")).toBe(false);
    expect(verifyPassword("x", "scrypt$1$1$1$!!!$!!!")).toBe(false);
  });
});
