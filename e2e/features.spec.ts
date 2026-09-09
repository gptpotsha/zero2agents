// Быстрые победы Ф1: шпаргалка уровня, экран завершения с «Дальше», смена пароля.
import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

test("шпаргалка уровня открывается с дашборда", async ({ page }) => {
  await page.goto("http://localhost:3000/register");
  await page.fill("#username", `cheat_${Date.now()}`);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });

  await page.getByRole("button", { name: "📋 Шпаргалка" }).first().click();
  await expect(page.getByText("Шпаргалка: Компьютеры — это не магия")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Список файлов и папок в текущей папке")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Шпаргалка: Компьютеры — это не магия")).toBeHidden({ timeout: 5000 });
});

test("смена пароля: неверный текущий отклоняется, корректный — принимается", async ({ page }) => {
  const USERNAME = `pwd_${Date.now()}`;
  await page.goto("http://localhost:3000/register");
  await page.fill("#username", USERNAME);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });

  await page.getByRole("link", { name: "Настройки" }).click();
  await page.waitForURL("**/settings");

  // Неверный текущий пароль
  await page.fill("#current_password", "wrong-pass-1");
  await page.fill("#new_password", "newpassword456");
  await page.fill("#confirm_password", "newpassword456");
  await page.getByRole("button", { name: "Сменить пароль" }).click();
  await expect(page.getByText("Текущий пароль неверный.")).toBeVisible({ timeout: 10000 });

  // Несовпадение подтверждения
  await page.fill("#current_password", PASSWORD);
  await page.fill("#new_password", "newpassword456");
  await page.fill("#confirm_password", "different789");
  await page.getByRole("button", { name: "Сменить пароль" }).click();
  await expect(page.getByText("не совпадают")).toBeVisible({ timeout: 10000 });

  // Успешная смена
  await page.fill("#current_password", PASSWORD);
  await page.fill("#new_password", "newpassword456");
  await page.fill("#confirm_password", "newpassword456");
  await page.getByRole("button", { name: "Сменить пароль" }).click();
  await expect(page.getByText("Пароль изменён")).toBeVisible({ timeout: 10000 });

  // Вход со старым паролем больше не работает, с новым — работает
  await page.getByRole("button", { name: "Выйти" }).click();
  await page.waitForURL("http://localhost:3000/");
  await page.goto("http://localhost:3000/login");
  await page.fill("#username", USERNAME);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByText("Неверное имя или пароль")).toBeVisible({ timeout: 10000 });

  // Свежая форма: перезагружаем страницу, чтобы второй submit гарантированно ушёл
  await page.goto("http://localhost:3000/login");
  await page.fill("#username", USERNAME);
  await page.fill("#password", "newpassword456");
  await page.getByRole("button", { name: "Войти" }).click();
  // Server Action может потребовать пару секунд на scrypt-верификацию
  await page.waitForURL("**/dashboard", { timeout: 30000 });
});
