import type { LessonContent, LevelMeta } from "@/lib/content/types";
import { lesson as whatIsTerminal } from "./lessons/l1/what-is-terminal/lesson";
import { lesson as firstCommands } from "./lessons/l1/first-commands/lesson";
import { lesson as filesAndFolders } from "./lessons/l1/files-and-folders/lesson";
import { lesson as whereAmI } from "./lessons/l2/where-am-i/lesson";
import { lesson as whatsHere } from "./lessons/l2/whats-here/lesson";
import { lesson as movingIntoFolders } from "./lessons/l2/moving-into-folders/lesson";
import { lesson as goingBackUp } from "./lessons/l2/going-back-up/lesson";
import { lesson as goingHome } from "./lessons/l2/going-home/lesson";
import { lesson as creatingFolders } from "./lessons/l2/creating-folders/lesson";
import { lesson as creatingFiles } from "./lessons/l2/creating-files/lesson";
import { lesson as deletingFiles } from "./lessons/l2/deleting-files/lesson";
import { lesson as deletingFolders } from "./lessons/l2/deleting-folders/lesson";
import { lesson as copyingFiles } from "./lessons/l2/copying-files/lesson";
import { lesson as movingRenaming } from "./lessons/l2/moving-renaming/lesson";
import { lesson as puttingItTogether } from "./lessons/l2/putting-it-together/lesson";
import { lesson as l2Review } from "./lessons/l2/l2-review/lesson";
import { lesson as catFiles } from "./lessons/l3/cat-files/lesson";
import { lesson as headTail } from "./lessons/l3/head-tail/lesson";
import { lesson as echoPrint } from "./lessons/l3/echo-print/lesson";
import { lesson as redirect } from "./lessons/l3/redirect/lesson";
import { lesson as append } from "./lessons/l3/append/lesson";
import { lesson as copyContent } from "./lessons/l3/copy-content/lesson";
import { lesson as grepFiles } from "./lessons/l3/grep-files/lesson";
import { lesson as grepRecursive } from "./lessons/l3/grep-recursive/lesson";
import { lesson as pipes } from "./lessons/l3/pipes/lesson";
import { lesson as wcCount } from "./lessons/l3/wc-count/lesson";
import { lesson as grepPipeWc } from "./lessons/l3/grep-pipe-wc/lesson";
import { lesson as logDetective } from "./lessons/l3/log-detective/lesson";
import { lesson as l3Review } from "./lessons/l3/l3-review/lesson";
import { lesson as whyVersionControl } from "./lessons/l4/why-version-control/lesson";
import { lesson as startingRepo } from "./lessons/l4/starting-repo/lesson";
import { lesson as stagingChanges } from "./lessons/l4/staging-changes/lesson";
import { lesson as firstCommit } from "./lessons/l4/first-commit/lesson";
import { lesson as makingChanges } from "./lessons/l4/making-changes/lesson";
import { lesson as viewingHistory } from "./lessons/l4/viewing-history/lesson";
import { lesson as seeingDifferences } from "./lessons/l4/seeing-differences/lesson";
import { lesson as undoingChanges } from "./lessons/l4/undoing-changes/lesson";
import { lesson as understandingGithub } from "./lessons/l4/understanding-github/lesson";
import { lesson as pushingToGithub } from "./lessons/l4/pushing-to-github/lesson";
import { lesson as downloadingProjects } from "./lessons/l4/downloading-projects/lesson";
import { lesson as creatingBranches } from "./lessons/l4/creating-branches/lesson";
import { lesson as mergingBranches } from "./lessons/l4/merging-branches/lesson";
import { lesson as professionalWorkflow } from "./lessons/l4/professional-workflow/lesson";
import { lesson as writingGoodCommits } from "./lessons/l4/writing-good-commits/lesson";
import { lesson as fullWorkflowChallenge } from "./lessons/l4/full-workflow-challenge/lesson";
import { lesson as l4Review } from "./lessons/l4/l4-review/lesson";
import { lesson as whatIsCode } from "./lessons/l5/what-is-code/lesson";
import { lesson as programmingLanguages } from "./lessons/l5/programming-languages/lesson";
import { lesson as frontendBackend } from "./lessons/l5/frontend-backend/lesson";
import { lesson as whatIsClient } from "./lessons/l5/what-is-client/lesson";
import { lesson as whatIsServer } from "./lessons/l5/what-is-server/lesson";
import { lesson as httpConversation } from "./lessons/l5/http-conversation/lesson";
import { lesson as whatIsApi } from "./lessons/l5/what-is-api/lesson";
import { lesson as jsonFormat } from "./lessons/l5/json-format/lesson";
import { lesson as databases } from "./lessons/l5/databases/lesson";
import { lesson as sqlBasics } from "./lessons/l5/sql-basics/lesson";
import { lesson as whatIsCloud } from "./lessons/l5/what-is-cloud/lesson";
import { lesson as deploying } from "./lessons/l5/deploying/lesson";
import { lesson as domainsDns } from "./lessons/l5/domains-dns/lesson";
import { lesson as l5Review } from "./lessons/l5/l5-review/lesson";
import { lesson as meetYourAgent } from "./lessons/l8/meet-your-agent/lesson";
import { lesson as firstConversation } from "./lessons/l8/first-conversation/lesson";
import { lesson as agentReadsProject } from "./lessons/l8/agent-reads-project/lesson";
import { lesson as askingEffectively } from "./lessons/l8/asking-effectively/lesson";
import { lesson as l8Review } from "./lessons/l8/l8-review/lesson";
import { lesson as whatAreSkills } from "./lessons/l9/what-are-skills/lesson";
import { lesson as skillFile } from "./lessons/l9/skill-file/lesson";
import { lesson as writingSkill } from "./lessons/l9/writing-skill/lesson";
import { lesson as skillOrganization } from "./lessons/l9/skill-organization/lesson";
import { lesson as l9Review } from "./lessons/l9/l9-review/lesson";
import { lesson as whatIsMcp } from "./lessons/l10/what-is-mcp/lesson";
import { lesson as mcpServers } from "./lessons/l10/mcp-servers/lesson";
import { lesson as mcpConfig } from "./lessons/l10/mcp-config/lesson";
import { lesson as mcpSafety } from "./lessons/l10/mcp-safety/lesson";
import { lesson as l10Review } from "./lessons/l10/l10-review/lesson";
import { lesson as contextWindow } from "./lessons/l11/context-window/lesson";
import { lesson as projectInstructions } from "./lessons/l11/project-instructions/lesson";
import { lesson as writingProjectInstructions } from "./lessons/l11/writing-project-instructions/lesson";
import { lesson as contextManagement } from "./lessons/l11/context-management/lesson";
import { lesson as l11Review } from "./lessons/l11/l11-review/lesson";
import { lesson as subagents } from "./lessons/l12/subagents/lesson";
import { lesson as gitWorktrees } from "./lessons/l12/git-worktrees/lesson";
import { lesson as costControl } from "./lessons/l12/cost-control/lesson";
import { lesson as headlessAutomation } from "./lessons/l12/headless-automation/lesson";
import { lesson as l12Review } from "./lessons/l12/l12-review/lesson";

/** Мета уровней. Уровни добавляются по мере наполнения контентом (см. план: Ф1). */
export const LEVELS: LevelMeta[] = [
  {
    id: "l1",
    order: 1,
    title: "Компьютеры — это не магия",
    subtitle: "Файлы, папки и что такое терминал",
    scope: "foundation",
    cheatSheet: [
      { cmd: "pwd", description: "Показать, где ты сейчас (путь текущей папки)" },
      { cmd: "ls", description: "Список файлов и папок в текущей папке" },
      { cmd: "cd <папка>", description: "Перейти в папку (например: cd project)" },
      { cmd: "cd ..", description: "Подняться на уровень выше" },
      { cmd: "cd ~", description: "Прыгнуть в домашнюю папку" },
      { cmd: "mkdir <имя>", description: "Создать папку (mkdir notes)" },
      { cmd: "touch <файл>", description: "Создать пустой файл (touch idea.txt)" },
      { cmd: "rm <путь>", description: "Удалить файл или папку (rm junk.txt)" },
      { cmd: "cp <из> <в>", description: "Скопировать файл (cp a.txt b.txt)" },
      { cmd: "mv <из> <в>", description: "Переместить или переименовать (mv a.txt b.txt)" },
      { cmd: "echo текст > файл", description: "Записать текст в файл (echo привет > note.txt)" },
      { cmd: "cat <файл>", description: "Показать содержимое файла" },
    ],
  },
  {
    id: "l2",
    order: 2,
    title: "Первые 30 минут в терминале",
    subtitle: "Навигация, создание и управление файлами как разработчик",
    scope: "foundation",
    cheatSheet: [
      { cmd: "pwd", description: "Где я — полный путь текущей папки" },
      { cmd: "ls [-a]", description: "Что здесь; -a покажет и скрытые файлы" },
      { cmd: "cd <папка>", description: "Зайти в папку" },
      { cmd: "cd ..", description: "На уровень выше" },
      { cmd: "cd ~", description: "Вернуться домой (/home/you)" },
      { cmd: "mkdir [-p] <имя>", description: "Создать папку; -p — сразу цепочку a/b/c" },
      { cmd: "touch <файл>", description: "Создать пустой файл" },
      { cmd: "rm <файл>", description: "Удалить файл — навсегда!" },
      { cmd: "rm -r <папка>", description: "Удалить папку со всем содержимым" },
      { cmd: "cp <из> <в>", description: "Копия; оригинал остаётся" },
      { cmd: "mv <из> <в>", description: "Переместить или переименовать" },
    ],
  },
  {
    id: "l3",
    order: 3,
    title: "Чтение и запись файлов",
    subtitle: "Загляни внутрь файлов, ищи текст и соединяй команды",
    scope: "foundation",
    cheatSheet: [
      { cmd: "cat <файл>", description: "Показать содержимое файла (cat note.txt)" },
      { cmd: "head / tail <файл>", description: "Первые / последние 10 строк файла (head -n 5 log.txt)" },
      { cmd: "echo текст > файл", description: "Записать текст в файл (перезаписывает!)" },
      { cmd: "echo текст >> файл", description: "Дописать текст в конец файла" },
      { cmd: "grep <слово> <файл>", description: "Найти строки со словом (grep ERROR server.log)" },
      { cmd: "grep -r <слово> <папка>", description: "Искать по всем файлам папки и подпапок" },
      { cmd: "cmd1 | cmd2", description: "Конвейер: вывод одной команды на вход другой" },
      { cmd: "wc -l <файл>", description: "Посчитать строки (wc -l notes.txt)" },
      { cmd: "grep слово файл | wc -l", description: "Посчитать совпадения" },
    ],
  },
  {
    id: "l4",
    order: 4,
    title: "История кода: git и GitHub",
    subtitle: "Никогда не теряй работу — фиксируй каждую версию",
    scope: "foundation",
    cheatSheet: [
      { cmd: "git init", description: "Создать репозиторий в текущей папке" },
      { cmd: "git status", description: "Что изменилось, что готово к коммиту" },
      { cmd: "git add <файл|.>", description: "Поместить изменения в индекс" },
      { cmd: 'git commit -m "текст"', description: "Снимок проекта в историю с сообщением" },
      { cmd: "git log", description: "История коммитов" },
      { cmd: "git branch / git switch", description: "Ветки: параллельные линии истории" },
      { cmd: "git push / git pull", description: "Выгрузить / скачать с облака (GitHub)" },
    ],
  },
  {
    id: "l5",
    order: 5,
    title: "Как софт работает на самом деле",
    subtitle: "Клиент, сервер, API, базы данных и облако — без магии",
    scope: "foundation",
    cheatSheet: [
      { cmd: "GET / POST", description: "HTTP-методы: «дай посмотреть» / «прими и сохрани»" },
      { cmd: "200 / 404 / 500", description: "Статус-коды: успех / не найдено / ошибка сервера" },
      { cmd: "endpoint", description: "Адрес, по которому API принимает свой вид запросов" },
      { cmd: 'JSON: {"ключ": "значение"}', description: "Текстовый формат данных для API и конфигов" },
      { cmd: "БД: таблицы → строки → столбцы", description: "Организованное хранилище данных приложения" },
      { cmd: "SELECT / INSERT", description: "SQL: прочитать / добавить данные в таблицу" },
      { cmd: "localhost → прод (deploy)", description: "Песочница у себя → боевой сервер для пользователей" },
      { cmd: "DNS: домен → IP", description: "Телефонная книга интернета: имя переводится в адрес" },
    ],
  },
  {
    id: "l8",
    order: 8,
    title: "Твой AI-агент",
    subtitle: "Первые шаги с агентом: запуск, контекст, эффективные запросы",
    scope: "agent",
    cheatSheet: [
      { cmd: "cd my-project", description: "Контекст агента = папка проекта" },
      { cmd: "{{agent.binary}}", description: "Запуск агента в текущей папке" },
      { cmd: "ЧТО + ГДЕ + признак + контекст", description: "Формула сильного запроса" },
      { cmd: "git log", description: "Агент читает и историю проекта" },
    ],
  },
  {
    id: "l9",
    order: 9,
    title: "Навыки агента",
    subtitle: "Научи {{agent.name}} своим процессам — один раз и навсегда",
    scope: "agent",
    cheatSheet: [
      { cmd: "SKILL.md", description: "Файл навыка: name + description + инструкции" },
      { cmd: "description — дверь", description: "Агент решает открыть навык по описанию" },
      { cmd: "личные vs проектные", description: "Свои привычки — себе; процессы команды — в репо" },
      { cmd: "git — версионирование навыков", description: "Навыки в репо = история и шаринг" },
    ],
  },
  {
    id: "l10",
    order: 10,
    title: "MCP: подключаем всё",
    subtitle: "Стандартные разъёмы агента: файлы, git, браузер, базы данных",
    scope: "agent",
    cheatSheet: [
      { cmd: "MCP", description: "Model Context Protocol — USB-порт для AI-агентов" },
      { cmd: "mcpServers", description: "Ключ конфига со списком подключённых серверов" },
      { cmd: "command + args", description: "Как запускается MCP-сервер" },
      { cmd: "наименьшие привилегии", description: "Давай агенту минимум прав, необходимых задаче" },
    ],
  },
  {
    id: "l11",
    order: 11,
    title: "Контекст — это всё",
    subtitle: "Окно контекста, память проекта и управление сессиями",
    scope: "agent",
    cheatSheet: [
      { cmd: "окно контекста", description: "Всё, что агент «видит» прямо сейчас; ограничено" },
      { cmd: "файл инструкций", description: "CLAUDE.md / AGENTS.md — правила и команды проекта" },
      { cmd: "/clear", description: "Сбросить сессию, когда контекст замусорен" },
      { cmd: "перечитай с диска", description: "Забылось? Информация на диске никуда не делась" },
    ],
  },
  {
    id: "l12",
    order: 12,
    title: "Продвинутые приёмы",
    subtitle: "Субагенты, worktrees, расходы и автономные пайплайны",
    scope: "agent",
    cheatSheet: [
      { cmd: "субагент", description: "Параллельная задача с чистым контекстом" },
      { cmd: "git worktree", description: "Несколько рабочих копий одного репо" },
      { cmd: "маленькие задачи", description: "Контроль расходов: точечные запросы вместо гигантских" },
      { cmd: "headless-режим", description: "Агент внутри скриптов и CI без человека" },
    ],
  },
];

/** Плоский список: какой урок лежит в каком уровне и в каком порядке. */
export type LessonDef = { levelId: string; order: number; lesson: LessonContent };

export const LESSON_DEFS: LessonDef[] = [
  { levelId: "l1", order: 1, lesson: whatIsTerminal },
  { levelId: "l1", order: 2, lesson: firstCommands },
  { levelId: "l1", order: 3, lesson: filesAndFolders },
  { levelId: "l2", order: 1, lesson: whereAmI },
  { levelId: "l2", order: 2, lesson: whatsHere },
  { levelId: "l2", order: 3, lesson: movingIntoFolders },
  { levelId: "l2", order: 4, lesson: goingBackUp },
  { levelId: "l2", order: 5, lesson: goingHome },
  { levelId: "l2", order: 6, lesson: creatingFolders },
  { levelId: "l2", order: 7, lesson: creatingFiles },
  { levelId: "l2", order: 8, lesson: deletingFiles },
  { levelId: "l2", order: 9, lesson: deletingFolders },
  { levelId: "l2", order: 10, lesson: copyingFiles },
  { levelId: "l2", order: 11, lesson: movingRenaming },
  { levelId: "l2", order: 12, lesson: puttingItTogether },
  { levelId: "l2", order: 13, lesson: l2Review },
  { levelId: "l3", order: 1, lesson: catFiles },
  { levelId: "l3", order: 2, lesson: headTail },
  { levelId: "l3", order: 3, lesson: echoPrint },
  { levelId: "l3", order: 4, lesson: redirect },
  { levelId: "l3", order: 5, lesson: append },
  { levelId: "l3", order: 6, lesson: copyContent },
  { levelId: "l3", order: 7, lesson: grepFiles },
  { levelId: "l3", order: 8, lesson: grepRecursive },
  { levelId: "l3", order: 9, lesson: pipes },
  { levelId: "l3", order: 10, lesson: wcCount },
  { levelId: "l3", order: 11, lesson: grepPipeWc },
  { levelId: "l3", order: 12, lesson: logDetective },
  { levelId: "l3", order: 13, lesson: l3Review },
  { levelId: "l4", order: 1, lesson: whyVersionControl },
  { levelId: "l4", order: 2, lesson: startingRepo },
  { levelId: "l4", order: 3, lesson: stagingChanges },
  { levelId: "l4", order: 4, lesson: firstCommit },
  { levelId: "l4", order: 5, lesson: makingChanges },
  { levelId: "l4", order: 6, lesson: viewingHistory },
  { levelId: "l4", order: 7, lesson: seeingDifferences },
  { levelId: "l4", order: 8, lesson: undoingChanges },
  { levelId: "l4", order: 9, lesson: understandingGithub },
  { levelId: "l4", order: 10, lesson: pushingToGithub },
  { levelId: "l4", order: 11, lesson: downloadingProjects },
  { levelId: "l4", order: 12, lesson: creatingBranches },
  { levelId: "l4", order: 13, lesson: mergingBranches },
  { levelId: "l4", order: 14, lesson: professionalWorkflow },
  { levelId: "l4", order: 15, lesson: writingGoodCommits },
  { levelId: "l4", order: 16, lesson: fullWorkflowChallenge },
  { levelId: "l4", order: 17, lesson: l4Review },
  { levelId: "l5", order: 1, lesson: whatIsCode },
  { levelId: "l5", order: 2, lesson: programmingLanguages },
  { levelId: "l5", order: 3, lesson: frontendBackend },
  { levelId: "l5", order: 4, lesson: whatIsClient },
  { levelId: "l5", order: 5, lesson: whatIsServer },
  { levelId: "l5", order: 6, lesson: httpConversation },
  { levelId: "l5", order: 7, lesson: whatIsApi },
  { levelId: "l5", order: 8, lesson: jsonFormat },
  { levelId: "l5", order: 9, lesson: databases },
  { levelId: "l5", order: 10, lesson: sqlBasics },
  { levelId: "l5", order: 11, lesson: whatIsCloud },
  { levelId: "l5", order: 12, lesson: deploying },
  { levelId: "l5", order: 13, lesson: domainsDns },
  { levelId: "l5", order: 14, lesson: l5Review },
  { levelId: "l8", order: 1, lesson: meetYourAgent },
  { levelId: "l8", order: 2, lesson: firstConversation },
  { levelId: "l8", order: 3, lesson: agentReadsProject },
  { levelId: "l8", order: 4, lesson: askingEffectively },
  { levelId: "l8", order: 5, lesson: l8Review },
  { levelId: "l9", order: 1, lesson: whatAreSkills },
  { levelId: "l9", order: 2, lesson: skillFile },
  { levelId: "l9", order: 3, lesson: writingSkill },
  { levelId: "l9", order: 4, lesson: skillOrganization },
  { levelId: "l9", order: 5, lesson: l9Review },
  { levelId: "l10", order: 1, lesson: whatIsMcp },
  { levelId: "l10", order: 2, lesson: mcpServers },
  { levelId: "l10", order: 3, lesson: mcpConfig },
  { levelId: "l10", order: 4, lesson: mcpSafety },
  { levelId: "l10", order: 5, lesson: l10Review },
  { levelId: "l11", order: 1, lesson: contextWindow },
  { levelId: "l11", order: 2, lesson: projectInstructions },
  { levelId: "l11", order: 3, lesson: writingProjectInstructions },
  { levelId: "l11", order: 4, lesson: contextManagement },
  { levelId: "l11", order: 5, lesson: l11Review },
  { levelId: "l12", order: 1, lesson: subagents },
  { levelId: "l12", order: 2, lesson: gitWorktrees },
  { levelId: "l12", order: 3, lesson: costControl },
  { levelId: "l12", order: 4, lesson: headlessAutomation },
  { levelId: "l12", order: 5, lesson: l12Review },
];
