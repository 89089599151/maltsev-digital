# Mobile Island Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить мобильную шапку-капсулу и нижний лист на «Остров» — капсулу у нижнего края, которая
вырастает в меню и поддерживает переход одним жестом.

**Architecture:** `Header.astro` хранит разметку и стили шапки, острова и диалога. `mobile-menu.ts`
управляет диалогом, ростом из острова, жестом «зажал — провёл — отпустил» и смахиванием вниз.
`island.ts` отвечает за остров в покое: сжатие при прокрутке и уход при открытой клавиатуре.
`availability.ts` — чистая функция статуса «на связи».

**Tech Stack:** Astro, TypeScript, CSS, нативный `dialog`, Pointer и Touch Events; без новых зависимостей.

**Spec:** `docs/superpowers/specs/2026-11-16-mobile-island-menu-design.md`

## Global Constraints

- Мобильный режим — ширина меньше 1024 px; десктоп не меняется.
- Нативный `dialog`, блокировка прокрутки и возврат фокуса сохраняются.
- Области нажатия не меньше 44×44 px; ширина 320 px поддерживается; безопасные зоны учитываются.
- `prefers-reduced-motion`: без роста и сжатия, состояния сменяются сразу.
- Без JavaScript работают ссылка «Написать» и строка разделов под логотипом.
- Новых библиотек нет. В проекте нет тестового раннера — проверка через `npm run check` и превью.

## Review Focus

- Отпускание пальца мимо раздела оставляет меню открытым и не вызывает переход.
- Остров, открытый в сжатом состоянии, вырастает из своего текущего размера, а не из полного.
- Смахивание вниз не срабатывает, пока список разделов прокручен не до верха.
- Переход к десктопной ширине с открытым меню не оставляет заблокированную страницу и остров.
- В 20:00 по Москве статус меняется при следующем открытии меню, а не только после перезагрузки.

## Task 1: Часы работы и статус

**Files:** Modify `src/config/site.ts`; Create `src/lib/availability.ts`.

**Interfaces:**
- `site.contacts.workHours: { from: 10; to: 20; timeZone: 'Europe/Moscow' }`, `site.contacts.responseMinutes: 15`;
  строки `hours` и `responseTime.value` собираются из них и по тексту не меняются.
- `interface WorkHours { from: number; to: number; timeZone: string }`
- `isOnline(now: Date, hours: WorkHours): boolean` — час в `timeZone` в полуинтервале `[from, to)`.

- [x] Вынести числа в `site.ts`, собрать из них прежние строки.
- [x] Написать `isOnline` через `Intl.DateTimeFormat` с `hourCycle: 'h23'`.
- [x] `npm run check` — без ошибок.

## Task 2: Разметка и стили острова

**Files:** Modify `src/components/Header.astro`.

**Interfaces (для Task 3):**
- `[data-island]` — остров; классы `is-compact` (сжат), `is-away` (спрятан).
- `[data-menu-open]` — кнопка меню в острове; `[data-menu]`, `[data-menu-board]`, `[data-menu-close]`,
  `[data-menu-item]` (ссылки разделов и «Обсудить проект»), класс `is-target` у ссылки под пальцем.
- `[data-status]` с `data-from`, `data-to`, `data-tz`, `data-online-text`, `data-offline-text`;
  внутри `[data-status-text]`; атрибут `data-online="true|false"` ставит скрипт.
- Переменные роста на `[data-menu-board]`: `--isl-t`, `--isl-r`, `--isl-b`, `--isl-l`;
  переменная перетаскивания `--menu-drag`; классы диалога `is-closing`, `is-dropping`.

- [x] Мобильная шапка: только логотип, `position: static`, без капсулы; `.hdr__actions` удалить.
- [x] Остров: кнопка меню с названием текущего раздела («Контакты» на `/contacts/`, «Меню», если раздел
      не определён) и ссылка «Написать»; `view-transition-name`, чтобы остров не мигал при переходах.
- [x] Диалог: список разделов, строка статуса, кнопка закрытия и «Обсудить проект» внизу.
- [x] Анимации: рост и сжатие через `clip-path` из переменных, падение при смахивании.
- [x] Запас места внизу страницы под остров.

## Task 3: Поведение

**Files:** Modify `src/scripts/mobile-menu.ts`; Create `src/scripts/island.ts`.

**Interfaces:** `initMobileMenu(): void` (как раньше), `initIsland(): void`.

- [x] `initIsland`: `is-compact` при прокрутке вниз дальше 240 px, снятие при прокрутке вверх на 6 px и
      больше; `is-away`, пока фокус в поле ввода; на десктопе ничего не делает.
- [x] Перед `showModal()` измерять остров и записывать `--isl-*`; обновлять статус при каждом открытии.
- [x] Жест: `pointerdown` на кнопке, удержание 220 мс или сдвиг больше 10 px открывает меню; раздел под
      пальцем получает `is-target` и короткую вибрацию; отпускание на разделе — переход, мимо — меню открыто.
- [x] Смахивание вниз: при `scrollTop === 0` списка карточка следует за пальцем, от 80 px — закрытие
      с классом `is-dropping`, иначе возврат.
- [x] `npm run check` — без ошибок.

## Task 4: Проверка в превью

- [x] Ширины 375 и 320 px: остров, открытие, закрытие кнопкой, фоном и Escape.
- [x] Жест и смахивание — синтетическими событиями; сжатие при прокрутке; страница контактов.
- [x] Ширина 1280 px: остров не виден, десктопная шапка прежняя.
