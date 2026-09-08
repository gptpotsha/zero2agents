# Разведка zero2claude.dev (изнутри, аккаунт potsha) — что внедрить в zero2agents

Дата: 08.09.2026 · 36 скриншотов в `research/` · Session использовалась вживую.

## 1. Плеер урока — «секции», не просто шаги

**Урок = 4–5 секций**, у каждой секции свой тип (`📖Read`, `📂Explore`, `❓Quiz`, `Terminal`):

- **Read**: теория = абзац + «Think of it this way» (аналогия) + «Key points» (нумерованный список). Кнопка **«Listen to this section»** (TTS-озвучка!). Внизу — **Comments (N)** — комментарии к секции урока (у урока про папку — 26 комментариев).
- **Explore** (файловый пазл): интерактивное дерево папок (Users → sara → Desktop/Documents/Downloads/projects), файлы открываются кликом, счётчик «3/7 files». Пока не открыты все файлы — кнопка «Explore all files» заблокирована. Открытие всех = секция пройдена. Пример: resume.pdf лежит в Documents → открывается просмотр с путём `/Users/sara/Documents/resume.pdf`.
- **Quiz**: radio-варианты A/B/C/D, «Check Answer», можно ошибиться. Иногда **2 квиза подряд** в одном уроке.
- **Terminal**: слева терминал `user@terminal:~$` (это настоящий `<input>`), справа — панель «Files» (дерево виртуальной ФС). Валидация **мгновенная**: после `pwd` появилось «You're at /home/user — this is your home folder. Think of it as the 'You Are Here' dot on a mall map.» + кнопка Continue. Кнопка **Hint** в шапке секции.

**Шапка урока**: Home · «Section 2 of 4» · Font size · тема · **Add note** · **Skip lesson** · **Report a bug** · Dashboard. Хлебные крошки «Уровень / Урок».

**Экран завершения урока**: время прохождения («27m 15s»), ✅2 Today, 🔥1 Day streak, «2/6 Level progress», блок **Up next** → следующий урок.

## 2. Фичи платформы, которых у нас нет

| Фича | Механика | Приоритет для нас |
|---|---|---|
| **Practice Terminal** | Отдельная страница-песочница: свободный терминал + Quick Tips (ls/pwd/mkdir/touch/cat/cd/rm/clear) + «Reset environment» | Высокий — дёшево (наш VFS уже умеет) |
| **Cheat sheet** уровня | Модалка со списком команд уровня с пометкой Recommended | Высокий — дёшево |
| **Test out of this level** | Экзамен-пропуск уровня (для тех, кто знает тему) | Средний |
| **Комментарии к секциям** | У каждого урока/секции тред комментариев | Средний (нужен бэк) |
| **Notes** | Личные заметки: My Notes → New Note (привязка к урокам через Add note) | Средний |
| **AI-план онбординга** | Анкета из 6 ролей (PM/Designer/Ops/Founder/Support/Marketer) + свой текст → «Here's the shortest path for you»: каждому уровню ярлык **Priority / Useful / skip**, с перечнем конкретных уроков (напр. «Level 1: Priority, 7 of 13 lessons: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.13») + Regenerate Plan | Высокий (наш «движок траекторий» из Ф2) |
| **Палитры тем** | 10 палитр: Apple Clean, Terminal Noir (дефолт), ChatGPT Style, Ocean Depth, Forest, Dracula, Solarized Dark, Rosé Pine, Mario Kart Racer, GPT-4o Minimal, Claude's Clear Desk + «Reset to default» | Низкий (после базовой dark/light) |
| **Стрики и статистика** | Dashboard: STREAK (current + best), LESSONS PER WEEK (среднее), heatmap-календарь за 12/26/52 недели («1 lessons this week — you're at 1%»), завершённые уроки списком | Высокий (Ф2 по плану) |
| **Ачивки (16+)** | Прогресс-бары на каждой: 25/51/102 уроков, «Level N Master», стрики 3/7/30 дней, «Quick Learner» (5 уроков в день), форумные (First Post, Helpful Hand, Peer Mentor) | Высокий (Ф2) |
| **Карта студентов** | «104937 students across the globe · 186 learning now» — мировая карта с онлайн-статусом | Низкий/бэклог |
| **Счётчик онлайн** | «186 students online — View map» в шапке | Низкий |
| **Wishes-форум** | «Your wish is my command» — идеи фич с голосованием: статусы Trending/New/Considering/In progress/Granted + «powered by an AI agent» | Низкий |
| **Смена пароля** | Settings: Current/New/Confirm Password | Средний — дёшево |
| **Язык интерфейса** | Переключатель в шапке (у нас RU-дефолт, i18n-задел уже есть) | Уже в плане |

## 3. Геймификация прогресса (мелочи, которые работают)

- На главной: «**1/151 completed**» + «**Continue learning**»-карточка с «Resume →» (у нас есть resume, но нет выделенной карточки «продолжить с места остановки» поверх карты уровней).
- Режим отображения уровней: **Cards/List** переключатель.
- В карточке уровня: прогресс «0/13», кнопки Test out и Cheat sheet прямо в заголовке уровня.
- Дашборд-вкладки: Overview / Stats / Achievements / **My Plan** / Notes / Profile / Settings.

## 4. Настройки (у оригинала)

Language · Color Palette (10 шт., radio) · Reset to default (Terminal Noir) · Change Password. **Никакой подписки/оплаты нет вообще** — курс полностью бесплатен, монетизации не увидел.

## 5. Что берём в наш роадмап (предложение)

**Быстро (Ф1, поверх готового):**
1. Карточка «Продолжить обучение» на дашборде (resume + прогресс уровня).
2. Cheat sheet уровня (данные уже есть в manifests уроков — `skills`).
3. Practice Terminal (реюз нашего VFS + все команды).
4. Экран завершения урока: время + «Up next».
5. Смена пароля в настройках.

**Ф2:**
6. Стрики + heatmap + страница Stats.
7. Ачивки с прогресс-барами.
8. AI-план: анкета ролей → ярлыки Priority/Useful на уровни/уроки.
9. Комментарии к урокам (потребует таблицы + Server Actions).

**Позже/опционально:** Test out, Notes, палитры, карта, Wishes-форум.

## Скриншоты

01-dashboard, 02/03-dashboard-full, 04-stats, 05-achievements, 06–23 урок «What Is a Folder?» (Read → Explore-дерево → квизы → завершение), 24–28 Practice Terminal, 29–30 палитры, 31–32 AI-план, 33-notes, 34-profile, 35-settings, 36-cheatsheet, 37-test-out, 38-map, 39–44 терминальный урок (pwd выполнен, валидация), 45-forum.
