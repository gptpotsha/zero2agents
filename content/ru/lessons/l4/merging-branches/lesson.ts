import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "merging-branches",
    title: "Слияние веток: merge",
    minutes: 5,
    goal: "Понять, как эксперимент из ветки попадает в основную линию",
    scope: "common",
    skills: ["git", "merge", "ветки"],
  },
  content: [
    {
      type: "p",
      text: "Эксперимент в ветке удался — пора перенести его в main. Это merge: git берёт работу из одной ветки и встраивает в другую.",
    },
    {
      type: "code",
      text: "git switch main          # вернуться в основную ветку\ngit merge new-feature    # влить работу из new-feature",
    },
    {
      type: "p",
      text: "Часто git сливает автоматически. Если обе ветки меняли одно и то же место по-разному — возникает конфликт: git остановится и попросит выбрать вариант. Конфликты — это нормально, они решаются руками (ты этому научишься позже).",
    },
    { type: "note", text: "Формула: switch на принимающую ветку → merge из приносящей. Порядок важен!" },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь понимание",
      exercise: {
        type: "fill-blank",
        template: "Чтобы влить работу из ветки feature в main, сначала переходишь на main командой ____ , затем выполняешь git merge feature.",
        blanks: [{ accept: ["git switch main", "switch main", "git checkout main"] }],
        explanation: "Merge всегда вливает в текущую ветку — поэтому сначала надо в неё перейти.",
      },
    },
    {
      id: "s2",
      title: "Итог",
      content: [
        { type: "p", text: "Ветка создана → работа закоммичена → слита в main. Полный круг эксперимента. Далее — как всё это выглядит в работе профессионала." },
      ],
    },
  ],
};
