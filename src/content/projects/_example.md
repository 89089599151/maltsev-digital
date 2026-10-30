---
# ШАБЛОН ПРОЕКТА. Файлы, имя которых начинается с «_», не публикуются.
# Скопируйте файл, переименуйте (например, coffee-shop.md — это станет адресом /portfolio/coffee-shop/),
# замените поля и картинки. Посмотреть шаблон локально: npm run dev:examples
title: Название проекта
summary: Одна строка о том, что это за сайт и для кого.
category: business          # landing | business | catalog | personal | concept
isConcept: true             # true — демонстрационный проект; на сайте получит пометку «Концепт»
year: 2026
order: 10                   # порядок в списках: меньше — выше
featured: true              # показывать в подборке на главной
cover: ../../assets/photos/panels.jpg
coverAlt: Главный экран сайта на ноутбуке
task: >-
  Опишите задачу клиента в двух-трёх предложениях: какой бизнес, какая была проблема
  и что сайт должен был изменить.
stack: [Astro, TypeScript, CSS, Formspree]
designNotes:
  - Особенность дизайна номер один — что и зачем сделано.
  - Особенность номер два.
  - Особенность номер три.
gallery:
  - src: ../../assets/photos/stepped-corner.jpg
    alt: Экран услуг
    caption: Раздел услуг с калькулятором
  - src: ../../assets/photos/bunker.jpg
    alt: Страница контактов
responsive:
  desktop: ../../assets/photos/facade-lattice.jpg
  tablet: ../../assets/photos/wedge.jpg
  mobile: ../../assets/photos/concrete-angle.jpg
results:                    # необязательно; только реальные цифры, которые можно подтвердить
  - value: '+40%'
    label: заявок за первый месяц
  - value: '0,8 с'
    label: загрузка первого экрана
liveUrl: https://example.com
---

Здесь — подробный рассказ о проекте в Markdown: как шла работа, какие решения приняты
и какой получился результат. Не указывайте цифры и отзывы, которых нет.

## Решение

Текст о решении.

## Результат

Текст о результате.
