export type RoleId = "developer" | "beginner" | "manager" | "designer" | "founder" | "ops";

export type LevelImportance = "priority" | "useful" | "skip";

export interface RoleProfile {
  id: RoleId;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  priorities: {
    priority: string[];
    useful: string[];
    skip: string[];
  };
}

export const ROLES: RoleProfile[] = [
  {
    id: "beginner",
    name: "Новичок",
    tagline: "С нуля без опыта",
    icon: "🌱",
    description: "Никогда не работал в терминале. Хочу понять основы с нуля и уверенно создавать софт с AI-агентами.",
    priorities: {
      priority: ["l1", "l2", "l3", "l4", "l5", "l8", "l9", "l10", "l11", "l12", "l13", "l14"],
      useful: [],
      skip: [],
    },
  },
  {
    id: "developer",
    name: "Разработчик",
    tagline: "Ускорение в 5x с агентами",
    icon: "💻",
    description: "Уже знаю базу терминала и Git. Хочу освоить AI-агентов, MCP, Skills, субагентов и паттерны отладки.",
    priorities: {
      priority: ["l4", "l5", "l8", "l9", "l10", "l11", "l12", "l13", "l14"],
      useful: ["l3"],
      skip: ["l1", "l2"],
    },
  },
  {
    id: "manager",
    name: "Менеджер / PM",
    tagline: "Управление и прототипы",
    icon: "📋",
    description: "Хочу понимать архитектуру софта, ставить четкие задачи агентам и команде, проверять идеи без программистов.",
    priorities: {
      priority: ["l1", "l5", "l8", "l9", "l11", "l13"],
      useful: ["l2", "l4", "l10"],
      skip: ["l3", "l12", "l14"],
    },
  },
  {
    id: "designer",
    name: "Дизайнер",
    tagline: "От макета к живому коду",
    icon: "🎨",
    description: "Хочу самостоятельно оживлять дизайн в коде: верстка, стили, интерактивные прототипы через AI-агента.",
    priorities: {
      priority: ["l1", "l2", "l5", "l8", "l9", "l11", "l14"],
      useful: ["l4", "l13"],
      skip: ["l3", "l10", "l12"],
    },
  },
  {
    id: "founder",
    name: "Фаундер / Инди-хакер",
    tagline: "Запуск продуктов в одиночку",
    icon: "🚀",
    description: "Нужно быстро проверять продуктовые гипотезы, собирать MVP от бэкенда до деплоя и экономить ресурсы.",
    priorities: {
      priority: ["l1", "l2", "l4", "l5", "l8", "l9", "l10", "l11", "l13", "l14"],
      useful: ["l3", "l12"],
      skip: [],
    },
  },
  {
    id: "ops",
    name: "DevOps / QA / Аналитик",
    tagline: "Автоматизация и пайплайны",
    icon: "⚙️",
    description: "Фокус на терминале, скриптах, автоматизации через MCP, тестировании и автономных headless-агентах.",
    priorities: {
      priority: ["l2", "l3", "l4", "l8", "l10", "l12", "l13"],
      useful: ["l1", "l5", "l9", "l11", "l14"],
      skip: [],
    },
  },
];

export function listRoles(): RoleProfile[] {
  return ROLES;
}

export function getRole(roleId: string | null | undefined): RoleProfile | null {
  if (!roleId) return null;
  return ROLES.find((r) => r.id === roleId) ?? null;
}

export function getLevelImportance(roleId: string | null | undefined, levelId: string): LevelImportance {
  const role = getRole(roleId);
  if (!role) return "priority"; // дефолт без выбора роли — всё важно
  if (role.priorities.skip.includes(levelId)) return "skip";
  if (role.priorities.useful.includes(levelId)) return "useful";
  return "priority";
}
