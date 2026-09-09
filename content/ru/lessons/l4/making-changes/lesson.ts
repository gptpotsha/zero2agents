import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "making-changes",
    title: "Цикл изменений: правка → add → commit",
    minutes: 6,
    goal: "Пройти полный цикл работы: изменить файл и закоммитить изменение",
    scope: "common",
    skills: ["git", "цикл работы", "modified"],
  },
  content: [
    {
      type: "p",
      text: "Работа с git — это цикл. Меняешь файл → git status показывает «modified» → git add → git commit. И так весь день, всю карьеру.",
    },
    {
      type: "code",
      text: "echo Новый текст > index.html  # изменили файл\ngit status                     # modified: index.html\ngit add index.html\ngit commit -m \"Обновил заголовок\"",
    },
    {
      type: "p",
      text: "Обрати внимание: файл, уже отслеживаемый git'ом, после правки не «untracked», а «modified». Git помнит его последнее сохранённое состояние и сравнивает с текущим.",
    },
    { type: "note", text: "Commit не видит правок в рабочей папке, пока ты не сделаешь git add — частая ловушка новичков. Всегда проверяй git status перед коммитом." },
  ],
  steps: [
    {
      id: "s1",
      title: "Измени закоммиченное",
      content: [
        { type: "p", text: "В репозитории уже есть коммит с index.html. Перепиши файл командой echo Новая версия > index.html, посмотри git status — файл стал modified." },
      ],
      exercise: {
        type: "terminal",
        task: "echo Новая версия > index.html, затем git status — увидь «modified».",
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог</h1>" },
        },
        goals: [
          { kind: "git", state: "has-commits" },
          { kind: "output", contains: "modified:   index.html" },
        ],
      },
    },
    {
      id: "s2",
      title: "Закоммить изменение",
      exercise: {
        type: "terminal",
        task: 'git add index.html и git commit -m "Обновил заголовок". В конце git status — чисто.',
        goals: [
          { kind: "git", state: "committed" },
        ],
      },
    },
  ],
};
