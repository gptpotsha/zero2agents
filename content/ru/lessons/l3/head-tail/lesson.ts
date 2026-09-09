import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "head-tail",
    title: "Начало и конец файла",
    minutes: 5,
    goal: "Понимать, как команды head и tail показывают начало и конец файла",
    scope: "common",
    skills: ["терминал", "head", "tail"],
  },
  content: [
    {
      type: "p",
      text: "Представь лог-файл на десять тысяч строк. Листать его через cat — мучение. Хорошая новость: обычно нужны только края — самое начало или самое свежее, что дописано в конец.",
    },
    {
      type: "ul",
      items: [
        "head <файл> — показать первые 10 строк файла",
        "tail <файл> — показать последние 10 строк файла",
        "head -n 5 <файл> — с флагом -n можно указать другое число строк (здесь — 5)",
        "tail -n 20 <файл> — а здесь последние 20 строк",
      ],
    },
    {
      type: "code",
      text: "head server.log\ntail -n 3 server.log",
    },
    {
      type: "note",
      text: "Хитрость, которую часто используют: tail -f <файл> не просто показывает конец файла, а следит за ним и печатает новые строки по мере появления. Так наблюдают за живым логом работающего сервера.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Quiz: какая команда что показывает",
      exercise: {
        type: "quiz",
        question: "Ты хочешь увидеть только последние 10 строк большого лог-файла. Какую команду набрать?",
        options: [
          "tail server.log",
          "head server.log",
          "cat server.log",
          "ls server.log",
        ],
        correct: [0],
        explanation: "tail показывает конец файла (по умолчанию 10 строк), а head — начало. cat печатает файл целиком.",
      },
    },
    {
      id: "s2",
      title: "Quiz: флаг -n",
      exercise: {
        type: "quiz",
        question: "Что сделает команда head -n 2 notes.txt?",
        options: [
          "Покажет первые две строки файла notes.txt",
          "Покажет последние две строки файла notes.txt",
          "Создаст файл notes.txt с двумя строками",
          "Удалит две строки из файла notes.txt",
        ],
        correct: [0],
        explanation: "Флаг -n задаёт количество строк, а head всегда берёт их с начала файла.",
      },
    },
    {
      id: "s3",
      title: "Заполни пропуски",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ показывает первые строки файла, а команда ____ — последние. Число строк можно изменить флагом -n.",
        blanks: [{ accept: ["head"] }, { accept: ["tail"] }],
        explanation: "head — «голова» (начало файла), tail — «хвост» (конец файла).",
      },
    },
  ],
};
