// Practice Terminal: свободные команды работают, сброс среды очищает состояние.
import { test, expect } from "@playwright/test";

test("песочница: mkdir/touch/cat работают, сброс возвращает исходное состояние", async ({ page }) => {
  await page.goto("http://localhost:3000/practice");

  const term = page.locator("[aria-label='Песочница терминала']");
  await term.click();

  // Создаём файл и читаем его
  await page.keyboard.type("mkdir test-dir\n");
  await page.keyboard.type("touch test-dir/hello.txt\n");
  await page.keyboard.type("echo привет из песочницы > test-dir/hello.txt\n");
  await page.keyboard.type("cat test-dir/hello.txt\n");
  await expect(page.getByText("привет из песочницы", { exact: true })).toBeVisible({ timeout: 10000 });

  // ls показывает созданную папку: читаем весь текст .xterm-rows (DOM-рендер)
  const readTerm = async () =>
    (await page.locator(".xterm-rows").innerText()) ?? "";
  await page.keyboard.type("ls\n");
  await page.waitForTimeout(500);
  // Последний блок вывода между 'ls' и следующим промптом содержит обе папки
  const termText1 = await readTerm();
  const afterLs1 = termText1.slice(termText1.lastIndexOf("ls"));
  expect(afterLs1).toContain("test-dir");
  expect(afterLs1).toContain("documents");

  // Ошибка команды — обучающее сообщение
  await page.keyboard.type("foobar\n");
  await expect(page.getByText("foobar: команда не найдена")).toBeVisible({ timeout: 5000 });

  // Сброс среды: после reset созданная папка исчезает
  await page.getByRole("button", { name: "Сбросить среду" }).click();
  await page.waitForTimeout(800);
  await term.click();
  await page.keyboard.type("ls\n");
  await page.waitForTimeout(500);
  const termText2 = await readTerm();
  const afterLs2 = termText2.slice(termText2.lastIndexOf("ls"));
  expect(afterLs2).not.toContain("test-dir");
  expect(afterLs2).toContain("documents");
});
