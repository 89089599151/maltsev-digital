# Задания на генерацию изображений (GPT Image)

Генерируйте в ChatGPT (GPT Image). Скачайте PNG и пришлите мне файлы с указанными именами — я положу их
в `src/assets/gen/`, оптимизирую и подключу. Пока файлов нет, сайт показывает временную графику.

Общий стиль для всех изображений — **один визуальный мир**: матовое и прозрачное стекло, жидкий хром,
кобальтово-синий (#2457E6), небесно-голубой, белый и тёплый солнечный блик (#FFD9A0). Студийный свет,
мягкие отражения, никакого текста.

Порядок важности: 01 → 02 → 03–06 → 07.

---

## IMG-01 · `hero-sculpture.png` — Hero Visual: Liquid Glass Sculpture

**Назначение.** Главный объект первого экрана. Стоит за большой стеклянной панелью: часть видна
чётко по краям, часть — размыто сквозь стекло. Он создаёт глубину и делает стекло «настоящим».

**Промпт:**

```
A single abstract sculpture made of flowing liquid glass and polished chrome: a thick, smooth ribbon that twists into an elegant open loop, like a frozen wave of molten glass. Transparent cobalt-blue glass (#2457E6) with internal refraction, sky-blue and white highlights, a subtle warm golden rim light on one edge (#FFD9A0), crisp caustics inside the glass. Studio product photography, soft diffused key light from top left, gentle reflections, physically accurate glass. Camera at eye level, slight three-quarter angle, the object centered with generous empty space around it. Ultra-detailed, clean, premium, calm. Transparent background, no shadow on the ground.
```

**Формат.** 1536×1024 (горизонтально), **прозрачный фон PNG**.

**Нельзя.** Текст, логотипы, буквы, люди, лишние предметы, пол или подставка, капли воды, неоновое
свечение, фиолетовый и розовый оттенки, «пластиковый» вид, шум.

**Композиция.** Объект занимает 70–80% кадра по ширине, по центру. На телефоне кадрируется до
центральных 60% — важная часть петли должна быть в середине.

**Анимация.** Медленное «дыхание» (плавание вверх-вниз на 8–12 px, поворот ±3°), сдвиг за курсором
(параллакс глубже, чем у панели), лёгкое вращение и масштаб при скролле. Одно изображение — 2D-движение;
настоящее 3D-вращение не имитируется.

---

## IMG-02 · `bg-liquid-wide.png` — фон: жидкий кобальтовый пейзаж (десктоп)

**Назначение.** Фон всего сайта под стеклом (вместо текущей нарисованной волны). Должен быть
насыщеннее и глубже, чтобы стекло читалось.

**Промпт:**

```
Abstract glossy liquid landscape: large smooth flowing waves of glass-like fluid seen from a low angle, deep cobalt blue (#2457E6) and saturated ultramarine in the lower right, transitioning to pale sky blue and almost white in the upper left, with a soft warm golden sunlight glow (#FFD9A0) in the upper left corner. One long crisp white specular highlight runs along the crest of the main wave from lower left to upper right. Very smooth gradients, soft focus, macro product-photography feel, calm and premium. No objects, no text, no horizon line, no particles.
```

**Формат.** 1536×1024, без прозрачности.

**Нельзя.** Текст, объекты, пузыри, шум, полосы на градиентах (бандинг), розовый и фиолетовый цвета.

**Композиция.** Верхние левые 50% — светлые (на них лежит тёмный текст), насыщенный кобальт — внизу
справа. Изображение растягивается на весь экран и слегка размывается, поэтому мелкие детали не нужны.

**Анимация.** Медленный дрейф (масштаб 1.0 → 1.06 и сдвиг на 2–3% за 40 с), лёгкий сдвиг цвета при
скролле к кобальтовым секциям.

---

## IMG-03 · `bg-liquid-tall.png` — тот же фон для телефона

**Промпт.** Тот же, что у IMG-02, с добавкой в конце:

```
Vertical composition: the light area at the top, the main cobalt wave crossing the lower third diagonally.
```

**Формат.** 1024×1536, без прозрачности.

---

## IMG-04 · `obj-landing.png` — объект направления «Лендинги»

**Назначение.** Всплывает рядом со строкой «Лендинги» в блоке «Что я делаю».

**Промпт:**

```
A single tall rectangular sheet of frosted glass, gently curved like a page in mid-turn, with rounded corners and a bright polished edge. Cobalt blue tint (#2457E6) fading to clear glass, white specular highlights, a subtle warm golden reflection on the edge. Studio product render, soft light from top left, physically accurate refraction. Centered, floating, three-quarter view. Transparent background, no ground shadow.
```

**Формат.** 1024×1024, **прозрачный фон PNG**.

---

## IMG-05 · `obj-business.png` — объект «Сайты компаний»

**Промпт:**

```
Three floating rounded rectangular panes of frosted glass stacked in perspective with small gaps between them, like layers of an interface, each slightly offset. Cobalt blue (#2457E6), sky blue and clear glass, polished bright edges, white highlights, faint warm golden rim light. Studio product render, soft top-left light, physically accurate refraction. Centered, three-quarter view. Transparent background, no ground shadow.
```

**Формат.** 1024×1024, **прозрачный фон PNG**.

---

## IMG-06 · `obj-catalog.png` — объект «Каталоги»

**Промпт:**

```
A neat three-by-three grid of small rounded glass cubes floating together as one block, a few cubes slightly lifted out of the grid. Mix of clear glass, frosted glass and cobalt blue glass (#2457E6), polished edges, white highlights, subtle warm golden reflections. Studio product render, soft top-left light, physically accurate refraction. Centered, isometric three-quarter view. Transparent background, no ground shadow.
```

**Формат.** 1024×1024, **прозрачный фон PNG**.

---

## IMG-07 · `obj-personal.png` — объект «Сайты специалистов»

**Промпт:**

```
A thick rounded glass medallion with a soft circular dome in the center, like a premium glass badge, standing upright and slightly turned. Clear and frosted glass with cobalt blue (#2457E6) depth, polished chrome-like rim, white highlights, gentle warm golden rim light. Studio product render, soft top-left light, physically accurate refraction. Centered, three-quarter view. Transparent background, no ground shadow.
```

**Формат.** 1024×1024, **прозрачный фон PNG**.

---

## IMG-08 · `obj-plane.png` — объект для блока заявки (по желанию)

**Назначение.** Стеклянный бумажный самолётик над карточкой заявки — метафора отправки.

**Промпт:**

```
A paper airplane made of clear and cobalt-blue glass (#2457E6), elegant sharp folds, polished edges catching white highlights and a subtle warm golden glint, flying upward to the right. Studio product render, soft top-left light, physically accurate refraction. Centered with empty space around it. Transparent background, no ground shadow.
```

**Формат.** 1024×1024, **прозрачный фон PNG**.

**Анимация.** Плавный полёт по небольшой дуге при появлении секции, лёгкое покачивание.

---

## Общие запреты для всех изображений

Без текста и букв, без логотипов и водяных знаков, без людей и рук, без фиолетового и розового, без
неонового свечения, без зерна и шума, без обрезанных краёв объекта (для объектов на прозрачном фоне
вокруг должно оставаться свободное место).

## Если прозрачный фон не получился

Сгенерируйте на ровном светло-сером фоне (#EEF2F8) — фон уберу сам.
