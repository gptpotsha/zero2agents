// DoD Ф0: сквозной проход — регистрация → прохождение урока L1 с терминалом
// → завершение → прогресс переживает перезагрузку. Запуск: dev на :3000.
import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

test("сквозной сценарий Ф0", async ({ page }) => {
  const USERNAME = `e2e_${Date.now()}`;
  // 1. Регистрация
  await page.goto("http://localhost:3000/register");
  await page.fill("#username", USERNAME);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await expect(page.getByText(USERNAME).first()).toBeVisible();

  // 2. Карточка «Начать обучение» видна у новичка и ведёт на первый урок
  await expect(page.getByText("Начать обучение")).toBeVisible();
  await page.getByRole("link", { name: "Начать →" }).click();
  await page.waitForURL("**/learn/**", { timeout: 20000 });

  // 2a. Открыть первый урок

  // 3. Шаг 1: fill-blank
  const step1 = page.locator("section#step-0");
  await step1.locator("input").nth(0).fill("команды");
  await step1.locator("input").nth(1).fill("операционной системе");
  await step1.getByRole("button", { name: "Проверить" }).click();
  await expect(page.getByText("Верно!").first()).toBeVisible({ timeout: 10000 });

  // 4. Шаг 2: quiz — отметить все три верных варианта
  const step2 = page.locator("section#step-1");
  await step2.getByRole("button", { name: /Создавать и удалять файлы/ }).click();
  await step2.getByRole("button", { name: /Запускать программы/ }).click();
  await step2.getByRole("button", { name: /Управлять версиями/ }).click();
  await step2.getByRole("button", { name: "Проверить" }).click();
  await expect(page.getByText("Верно!").first()).toBeVisible({ timeout: 10000 });

  // 5. Финальный шаг — «Далее»
  const step3 = page.locator("section#step-2");
  await step3.getByRole("button", { name: "Далее" }).click();
  await expect(page.getByText("Урок пройден")).toBeVisible({ timeout: 10000 });

  // 6. На дашборд: урок пройден, карточка теперь предлагает следующий урок
  await page.getByRole("link", { name: "К списку уроков" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("пройден").first()).toBeVisible();
  // Карточка перешла на урок 2 («Урок 2 из 3»); запись in_progress нет, поэтому ярлык «Начать»
  await expect(page.getByText(/(Продолжить|Начать) обучение/)).toBeVisible();
  await expect(page.getByText("Урок 2 из 3")).toBeVisible();
});

test("терминальное задание и resume после перезагрузки", async ({ page }) => {
  // Регистрируем второго юзера
  await page.goto("http://localhost:3000/register");
  await page.fill("#username", `e2et_${Date.now()}`);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });

  // Открываем урок с терминалом (first-commands — второй урок)
  await page.goto("http://localhost:3000/learn/l1/first-commands");

  // Шаг 1 — терминал: pwd, ls, cd project, ls
  const step1 = page.locator("section#step-0");
  const term = step1.locator("[aria-label='Терминал-тренажёр']");
  await term.click();
  await page.keyboard.type("pwd\n");
  await page.keyboard.type("ls\n");
  await page.keyboard.type("cd project\n");
  await page.keyboard.type("ls\n");
  await expect(page.getByText("Задание выполнено").first()).toBeVisible({ timeout: 10000 });

  // Даём Server Action сохранить прогресс (persist асинхронный)
  await page.waitForTimeout(2000);

  // Перезагрузка — resume: шаг 1 должен быть «пройден»
  await page.reload();
  await expect(page.locator("text=пройден").first()).toBeVisible({ timeout: 15000 });
  // Активный шаг — второй (fill-blank)
  const step2 = page.locator("section#step-1");
  await expect(step2.getByText("Проверить")).toBeVisible({ timeout: 10000 });
});
