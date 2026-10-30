# Задания на генерацию изображений — v2, ретро-оранжевый набор (GPT Image)

Первая версия (синее стекло и хром) больше не подходит: сайт перешёл на тёплую светлую палитру
с оранжевым и пиксельной типографикой. Старые промпты остались в истории git.

**Как генерировать.** ChatGPT → создать изображение (GPT Image). В каждом запросе вставляйте
промпт задания и в конце — блок «Общий стиль». Просите PNG с прозрачным фоном. Если прозрачность
не получилась — фон ровный `#DEDDD8` без градиента и теней, я вырежу сам.

**Как отдать.** Пришлите PNG с именем из задания. Я положу его в `src/assets/gen/`, сайт подхватит
файл автоматически, а временная оранжевая перекраска старой картинки отключится сама.

**Порядок важности:** 01 (первый экран) → 02–04 (парящие элементы) → 05–08 (услуги) → 09 (по желанию).
Начните с IMG-01: от него зависит, как выглядит первая страница. Сделайте 3–4 варианта и выберите
лучший, остальные можно не присылать.

---

## Общий стиль — добавлять в конец каждого промпта

```
Style: retro-futuristic 1980s industrial design shown as a premium 3D product render. Materials: warm off-white matte plastic (#F2F0EA), light warm grey soft-touch plastic (#D7D6D0), glossy safety-orange plastic accents (#FF6700), small graphite-black details (#202020), a few tiny brushed-steel screws. Chunky geometric forms with softly rounded edges, visible panel seams, tiny vents and buttons, toy-like but precise and expensive. Soft studio lighting from the top left with a large softbox, gentle ambient occlusion, a very soft contact shadow under the object only. Clean, calm, minimal, lots of empty space. Original design, no brand marks. No text, no letters, no numbers, no logos anywhere, including on screens. Transparent background.
```

**Палитра:** тёплый белый пластик, светло-серый, оранжевый `#FF6700` как акцент (не больше 30% объекта),
графит. **Нельзя для всех картинок:** текст и буквы (в том числе на экранах), логотипы и знакомые
бренды (Apple, Macintosh, IBM, Polaroid и т. п.), люди и руки, синий и фиолетовый, неон и свечение,
хром «жидкий металл», стекло как основной материал, пол, стол, подставка, фон-пейзаж, шум, мультяшный
и пластилиновый вид, «AI-глянец» с пересветом.

---

## IMG-01 · `hero-machine.png` — главный объект первого экрана

**Назначение.** Символ бренда: «машина, которая собирает сайты». Стоит в центре серой сцены первого
экрана, за ней — крупный заголовок, вокруг парят курсор, окно и кубики (IMG-02…04). Должна читаться
с первого взгляда и на телефоне.

**Формат.** 1536×1024 (горизонтально, 3:2), прозрачный PNG.

**Промпт — основной вариант (ретро-компьютер):**

```
A single hero object: an original retro-futuristic desktop computer that builds websites. A chunky all-in-one unit with a deep rounded CRT body in warm off-white plastic, a recessed screen with a slightly curved glass, a thick orange bezel ring around the screen, a small detached keyboard with oversized keys (a few keys orange) connected by a coiled graphite cable, a floppy-style slot and two small dials on the front. The screen shows an abstract orange-and-cream pixel-art layout of a web page built from simple rectangles and squares, no readable text. From the top of the screen a few small pixel cubes (cream and orange) float upward, as if the page is being assembled out of the machine. Three-quarter view from slightly above, camera at 35 mm, object centered and occupying about 65% of the frame width, generous empty space on all sides.
```

**Вариант B (сборочный автомат):**

```
A single hero object: an original retro-futuristic assembly machine that prints websites. A compact boxy device in warm off-white plastic with an orange articulated arm on top, the arm placing a small cream-colored pixel cube onto a growing stack of cubes that forms a tiny web page layout on a tray in front of the machine. Round porthole window on the side showing more cubes inside, two chunky orange buttons, a graphite rubber base. Three-quarter view from slightly above, 35 mm, object centered, about 65% of the frame width, generous empty space.
```

**Вариант C (монитор на ножках):**

```
A single hero object: an original retro-futuristic monitor-robot. A rounded CRT monitor in warm off-white plastic standing on four short orange legs with graphite feet, a small antenna with an orange ball on top, side handles, a front panel with dials. The screen shows an abstract pixel-art web page made of orange and cream rectangles, no readable text. Slight playful tilt, three-quarter view from slightly above, 35 mm, centered, about 60% of the frame width, generous empty space.
```

**Композиция.** Объект по центру, ничего не обрезано, слева и справа запас по 15–20% — на десктопе
слева от объекта стоит заголовок, на телефоне картинка кадрируется ближе к квадрату.
**Камера.** Чуть сверху, три четверти, без сильной перспективы.
**Интеграция.** `src/components/HeroRetro.astro` → `.hr__machine`. После получения файла пересоберу
композицию первого экрана: объект справа от заголовка без наложения на текст, пиксельное слово за ним.
**Анимация.** Медленное парение (±10 px, 7 с), лёгкий наклон за курсором, на прокрутке уходит вниз.

---

## IMG-02 · `float-cursor.png` — парящий курсор

**Назначение.** Маленький объект возле главного: «действие, клик, заявка».
**Формат.** 1024×1024, прозрачный PNG.

```
A single chunky 3D mouse-pointer arrow built from small extruded pixel cubes, like voxel art: glossy safety-orange cubes with a thin off-white outline layer, slightly thick, floating at a playful angle. Three-quarter view, centered, occupying about 55% of the frame, lots of empty space.
```

**Интеграция.** `.hr__bit--f1`, справа сверху от объекта. **Анимация.** Своё покачивание (6 с), сильнее
реагирует на курсор, чем главный объект.

---

## IMG-03 · `float-window.png` — парящее окно браузера

**Назначение.** «Сайт» как предмет: маленькое окно, будто вылетевшее из машины.
**Формат.** 1024×1024, прозрачный PNG.

```
A small chunky 3D browser window as a physical object: an off-white plastic frame with rounded corners and noticeable thickness, an orange title bar strip with three small round graphite buttons, the window area filled with an abstract pixel layout of cream and orange rectangles, no readable text. Tilted in three-quarter view about 20 degrees, centered, occupying about 55% of the frame.
```

**Интеграция.** `.hr__bit--f2`, слева от объекта. **Анимация.** Покачивание 8 с, сдвиг за курсором.

---

## IMG-04 · `float-cubes.png` — парящие пиксельные кубики

**Назначение.** «Сборка из блоков» — связывает 3D-объект с пиксельной типографикой сайта.
**Формат.** 1024×1024, прозрачный PNG.

```
A loose floating cluster of eight small 3D cubes, like pixels coming apart: five off-white matte plastic cubes, two glossy safety-orange cubes, one graphite cube, rounded edges, slightly different rotations, arranged in a loose diagonal group with small gaps. Centered, occupying about 50% of the frame.
```

**Интеграция.** `.hr__bit--f3`, внизу справа от объекта. **Анимация.** Покачивание 7,5 с.

---

## IMG-05 · `svc-landing.png` — услуга «Лендинг»

**Назначение.** Объект в карточке услуги, 150 px на десктопе. Метафора: громко рассказать об одном
предложении.
**Формат.** 1024×1024, прозрачный PNG.

```
A single object: an original retro-futuristic megaphone in warm off-white plastic with a glossy orange bell, a graphite grip with a trigger, a small coiled cable. Three-quarter view, slight upward tilt, centered, occupying about 70% of the frame.
```

## IMG-06 · `svc-business.png` — услуга «Сайт компании»

**Метафора:** несколько страниц и разделов — модульное здание.

```
A single object: a small retro-futuristic modular tower made of four stacked plastic modules of slightly different sizes, off-white and light grey, one module orange, each module with tiny window slits and vents, a short antenna on top. Three-quarter view from slightly above, centered, occupying about 70% of the frame.
```

## IMG-07 · `svc-catalog.png` — услуга «Каталог»

**Метафора:** карточки товаров — картотека.

```
A single object: a retro-futuristic card-index box in off-white plastic with a slightly open drawer, a row of cards inside with orange tabs sticking out, a graphite pull handle. Three-quarter view from slightly above, centered, occupying about 70% of the frame.
```

## IMG-08 · `svc-personal.png` — услуга «Сайт специалиста»

**Метафора:** личный бренд и портфолио — камера.

```
A single object: an original retro-futuristic instant camera in off-white plastic with a large round lens ring in orange, a small graphite viewfinder, a blank cream-colored photo card sliding out of the front slot. Three-quarter view, centered, occupying about 70% of the frame.
```

**Для IMG-05…08.** Одинаковый ракурс, свет и масштаб: в сетке 2×2 они должны выглядеть как серия.
**Интеграция.** `src/components/ServicesGrid.astro` → `.sv__obj`, в правом верхнем углу карточки.
**Анимация.** При наведении на карточку объект поворачивается на −10° и немного растёт.

---

## IMG-09 · `float-plane.png` — бумажный самолётик (по желанию)

**Назначение.** Акцент в блоке заявки «Расскажите о задаче» на тёмном фоне.
**Формат.** 1024×1024, прозрачный PNG.

```
A single paper plane folded from thick off-white and safety-orange plastic sheets, crisp folds, in flight, three-quarter view from below-left, centered, occupying about 60% of the frame. Lit so it reads well on a dark graphite background.
```

---

## Проверка перед отправкой

- На изображении нет текста, букв и цифр, в том числе на экранах.
- Оранжевый — акцент, а не основной цвет объекта.
- Фон прозрачный или ровный `#DEDDD8`.
- Объект целиком в кадре, вокруг есть пустое место.
- IMG-01…04 выглядят как одна сцена, IMG-05…08 — как одна серия.
