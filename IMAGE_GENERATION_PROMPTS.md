# Задания на генерацию изображений — v3, белая тема с синим акцентом (GPT Image)

## 15 ноября — «Работы» и «Вопросы»

Встроенным генератором созданы два изображения с прозрачным фоном в стиле страницы услуг.
Используются в правой части первого экрана соответствующих страниц; реальные кейсы и ответы остаются вёрсткой.

### `src/assets/gen/works-gallery.png` — стеклянная галерея

```text
Use case: stylized-concept. Asset type: transparent 3D hero sculpture for the portfolio / Works page of Maltsev Digital, an established white and electric-blue independent web designer website. Primary request: a sculptural curated gallery of digital work. Three floating thick glass picture frames in a compact elegant fanned composition, connected by one fluid cobalt glass ribbon sweeping under and behind them. The front frame is a wide frosted-white glass card containing a tiny abstract embossed landscape composition of one smooth blue sphere and a curved arch, strictly decorative sculptural shapes, not a real website screenshot; rear frames are clear deep electric-blue refractive glass at subtly different angles. One slender polished silver chrome elliptical ring wraps diagonally around the lower third, linking the whole arrangement into one coherent object. Premium polished CGI product render, bright clean studio lighting, crisp white specular edges, substantial rounded glass, beautiful physically plausible refraction, silver highlights. Palette exclusively electric blue #1A2FFB, icy clear azure, frosted white and small polished chrome accents. Three-quarter view slightly from above. Landscape 3:2 composition, object fills 78 percent, centered with every extremity entirely inside and generous clean margin. Genuinely transparent alpha background outside the objects, clean edges, no outer haze or glow, no floor, no ground shadow, no pedestal. No words, no letters, no numerals, no logos, no watermarks, no people, no pink, purple or orange. Sophisticated restrained family resemblance to high-end blue-glass browser-panel sculptures, with a distinct art-gallery silhouette.
```

### `src/assets/gen/faq-dialogue.png` — диалог

```text
Use case: stylized-concept. Asset type: transparent 3D hero sculpture for the Questions and Answers page of Maltsev Digital, an established white and electric-blue independent web designer website. Primary request: an elegant sculptural conversation made from two large overlapping rounded speech bubbles in thick glass. One main front speech bubble in frosted white translucent glass angled slightly clockwise, bearing a single beautiful raised electric-blue glass question mark (punctuation only). One larger rear speech bubble in deep cobalt transparent glass angled slightly counterclockwise, containing three small evenly spaced frosted-white glass dots, visible clearly above and left of the front bubble. The chat bubbles have short soft rounded tails at opposite lower corners. A single flowing cobalt glass ribbon curls loosely below and behind the pair, with a very small polished silver chrome bead at the end, forming one cohesive floating composition. Premium polished CGI product render, bright clean studio lighting, crisp white specular edges, substantial rounded glass, beautiful physically plausible refraction and soft internal caustics. Palette exclusively electric blue #1A2FFB, icy clear azure, frosted white, and small polished chrome accents. Three-quarter view slightly from above. Landscape 3:2 composition, object fills 78 percent, centered with every extremity entirely inside, generous clean margins. Genuinely transparent alpha background outside the objects, clean edges, no outer haze or glow, no floor, no ground shadow, no pedestal. No words, no letters, no numerals, no logos, no watermark, no people, no pink, purple or orange. Sophisticated restrained family resemblance to high-end blue-glass browser-panel sculptures, instantly legible conversation silhouette.
```

## 14 ноября — объёмная сборка сайта для страницы услуг

Готовый файл: `src/assets/gen/services-assembly.png`. Создан встроенным генератором с прозрачным фоном.
Используется в `ServicesHero.astro`; отрисовка интерфейса и тарифов остаётся настоящей вёрсткой.

```text
Use case: stylized-concept. Asset type: transparent 3D sculpture for the services page of a premium independent web designer, on a white/electric-blue website. Primary request: a beautiful sculptural website being assembled in space: three large rounded rectangular browser-like glass panels floating in an elegant fanned, slightly exploded arrangement, held together by a fluid looping electric-blue glass ribbon. One main front panel is frosted white glass with tasteful embossed abstract interface blocks (one large image rectangle and two clean lines, no actual letters), two rear panels are clear cobalt-blue refractive glass. A single polished chrome arrow cursor rests at the lower-right edge of the front panel. Three-quarter view from slightly above, sophisticated product photography, tactile polished glass, soft silver edges, bright studio lighting, white specular highlights, saturated electric blue #1A2FFB and clear icy blue, no purple/pink/orange. Composition: coherent single connected object centered within a landscape 3:2 canvas, occupies 80 percent, all corners and the cursor fully inside with clear margins. Transparent alpha background, no outer haze, no floor, no ground shadow, no pedestal, no text, no logos, no watermark. Crisp high-end CGI, elegant restrained arrangement, visually striking and readable at medium size.
```

Вторая версия (ретро-оранжевый набор) больше не подходит: сайт перешёл на белую тему с холодным
лавандовым полем и одним акцентом — синим электриком `#1A2FFB`. Старые промпты остались в истории git.

**Как генерировать.** ChatGPT → создать изображение (GPT Image). В запрос вставьте промпт задания
и в конце — блок «Общий стиль». Просите PNG с прозрачным фоном. Если прозрачность не получилась —
фон ровный белый `#FFFFFF` без градиента и теней, я вырежу сам.

**Как отдать.** Пришлите PNG с именем из задания. Я положу его в `src/assets/gen/`, сайт подхватит
файл сам: сейчас в центре первого экрана временно стоит стеклянная лента из первого набора
(`hero-sculpture.png`), она отключится автоматически.

Нужна одна картинка — IMG-01. Сделайте 3–4 варианта и выберите лучший.

## Выполнено 14 ноября 2026

Встроенным генератором изображений подготовлена уточнённая версия медузы с прозрачностью:
`src/assets/gen/hero-object-v2.png`. Первый экран использует её и сохраняет исходник как запасной.
Изображения для кейса — реальные снимки сайта, а не сгенерированные макеты.

Финальный запрос редактирования (исходник — `hero-object.png`, прозрачный фон включён):

```text
Use case: background-extraction. Asset type: premium 3D glass jellyfish hero for the white-and-electric-blue Maltsev Digital website. Edit target: the supplied blue glass jellyfish image. Preserve its elegant jellyfish silhouette, bell in upper right, ribbon tentacles sweeping lower left, electric-blue #1A2FFB glass, white specular highlights, subtle silver edges, and three-quarter view. Remove the entire black/blue backdrop AND every diffuse outer glow or halo around the object. Produce genuinely transparent alpha outside the jellyfish with clean edges so it composites naturally on white or near-black. Preserve luminous glass details only INSIDE the object, no opaque rectangular background, no added objects, no text, no watermarks. Keep the entire jellyfish inside a horizontal 3:2 canvas with 10% clear margin around all extremities. High-end polished studio render, crisp glass refraction, no floor, no ground shadow.
```

---

## Превью для соцсетей — выполнено

Файл `public/og-white-blue.jpg`, 1200×630. Встроенный генератор заменил прежнюю скульптуру
на новую медузу, сохранив заголовок, бренд и подписи. Результат сжат в JPEG для быстрой загрузки.
Исходное `public/og.jpg` сохранено. Запрос:

```text
Use case: precise-object-edit. Asset type: 1200x630 social sharing preview for Maltsev Digital. Image 1 is the edit target: keep its whole layout, typography, every word and every character, blue m brand mark, white rounded card, pale lavender outer margin, left title and the three bottom pills completely unchanged. Image 2 is the supporting insert: the new blue glass jellyfish. Change ONLY the blue-and-chrome infinity-loop object on the right of Image 1: remove it and replace it with the jellyfish from Image 2, attractively fitted entirely in the right half, clear glass with electric-blue #1A2FFB accents. Bell at upper right, tentacles sweeping toward lower left. Give it clean natural edges on the white card, no black field and no dark halo, no clipping outside the card. Do not overlap or obscure any existing text or pills. Keep text exactly: MALTSEV DIGITAL; Сайты для бизнеса и экспертов под ключ; от 29 000 ₽; от 7 рабочих дней; один исполнитель. No new text, no added decorations, no watermark. Preserve the wide 1200:630 composition.
```

## Общий стиль — добавлять в конец промпта

```
Style: premium 3D product render, the look of a modern creative studio website. Materials: clear and deep-blue glass with strong refraction and soft caustics, electric blue (#1A2FFB) as the main color, lighter azure and white highlights, a small amount of polished silver chrome as an accent. Smooth flowing organic forms, no hard edges. Bright, clean studio lighting from the top left, crisp white speculars, gentle inner glow inside the glass, no outer glow or halo around the object. The object floats in empty space. No floor, no shadow on the ground, no background scene. No text, no letters, no numbers, no logos. Transparent background.
```

**Палитра:** синий `#1A2FFB` (основной), голубой и белые блики, немного серебряного хрома.
**Нельзя:** оранжевый, фиолетовый и розовый; пиксели, кубики и ретро-техника; текст и логотипы; люди
и руки; тёмный фон и внешнее свечение вокруг объекта (на белой странице оно даёт грязный ореол);
пол, подставка, пейзаж; шум и зерно.

---

## IMG-01 · `hero-object.png` — главный объект первого экрана

**Назначение.** Единственный крупный объект на белой сцене первого экрана: стоит в центре, чуть
правее и ниже заголовка, справа его частично перекрывает белая карточка с ценой. Тот же файл
в уменьшенном виде стоит на тёмной вставке этой карточки, поэтому он должен хорошо смотреться
и на белом, и на почти чёрном.

**Формат.** 1536×1024 (горизонтально, 3:2), прозрачный PNG.

**Промпт — основной вариант (медуза, как на референсе):**

```
A single hero object: a stylized jellyfish made of deep electric-blue glass. A large smooth translucent bell (dome) with a glossy surface and soft inner glow, visible delicate ribs inside the dome, a ruffled edge, and long flowing translucent tentacles and ribbon-like arms trailing down and slightly to the left, as if drifting in slow water. The glass is saturated blue in the thick parts and almost clear azure in the thin parts, with white specular highlights along the top of the bell and thin silver-chrome edges on a few ribbons. Three-quarter view, slightly from below, the bell in the upper right, tentacles sweeping to the lower left. The object occupies about 70% of the frame width, nothing is cropped, generous empty space on all sides.
```

**Вариант B (абстрактная лента — ближе к тому, что стоит сейчас):**

```
A single hero object: an abstract continuous ribbon of thick deep-blue glass twisted into a soft infinity-like loop, one side of the ribbon polished silver chrome, the other clear electric-blue glass with caustics inside. Smooth, heavy, liquid form. Three-quarter view from slightly above, object centered and occupying about 70% of the frame width, nothing cropped, generous empty space.
```

**Вариант C (капля-сфера):**

```
A single hero object: a large soft blob of deep electric-blue glass, like a drop of liquid frozen in weightlessness, with two smaller drops separating from it on the right side. Inside the glass — smooth swirling layers of lighter azure. One thin silver-chrome ring loosely orbits the main drop at an angle. Three-quarter view, object centered, about 60% of the frame width, nothing cropped, generous empty space.
```

**Композиция.** Основная масса объекта — в центре и справа, слева вверху пусто: там заголовок
и кнопка. Ничего не обрезано, по краям запас 10–15%.
**Камера.** Три четверти, без сильной перспективы.
**Интеграция.** `src/components/HeroNova.astro`: `genImage('hero-object')`, запасной —
`hero-sculpture`. Размер и положение на сцене — `.hn__object`, вставка в карточке — `.hn__card-pic`.
**Анимация.** Медленное парение (±14 px, 8 с) и лёгкий сдвиг за курсором — уже есть в коде.
