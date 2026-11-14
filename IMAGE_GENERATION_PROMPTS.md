# Задания на генерацию изображений — v5, серия «стеклянное море»

Прошлые промпты (медуза, сборка окон для услуг, галерея и диалог) остались в истории git.

## Почему переделываем

Картинки для «Работ» и «Вопросов» повторяют формулу страницы услуг: три стеклянные панели, лента
и хромовое кольцо. На трёх страницах подряд это читается как одна и та же картинка, а облачка
с вопросительным знаком и точками выглядят как иконка из мессенджера.

Материал серии задан исходной стеклянной медузой `hero-object-v2.png`: синий электрик, прозрачный
лазурный край и белые студийные блики. На первом экране её заменяет цельная стеклянная волна,
созданная под свободную область существующего макета. На остальных страницах — морские объекты
из того же стекла, со своим силуэтом и смыслом. Никаких панелей, символов и значков.

| Страница | Объект | Смысл | Файл |
|---|---|---|---|
| Главная | стеклянная волна | заполняет свободный контур без перестановки интерфейса | `hero-glass-wave.png` |
| Работы | раковина наутилуса в разрезе — **стоит на сайте** | камеры — проекты, спираль — рост | `works-nautilus.png` |
| Вопросы | морской конёк — **стоит на сайте** | силуэт сам похож на знак вопроса | `faq-seahorse.png` |
| Контакты | бутылка с посланием — **стоит на сайте** | «напишите мне» | `contacts-bottle.png` |
| 404 | спасательный круг — **стоит на сайте** | «вы заблудились — вот выход» | `notfound-buoy.png` |
| Главная, карточка цены | раковина с жемчужиной — **стоит на сайте** | ценность, цена | `price-pearl.png` |
| Услуги | осьминог — **стоит на сайте** | много дел в одних руках | `services-octopus.png` |

## Как генерировать

1. ChatGPT → создать изображение. **Приложите к запросу `src/assets/gen/hero-object-v2.png`**
   и напишите первой строкой: `Use the attached glass jellyfish as the exact material, colour and
   lighting reference.` Без образца стекло каждый раз получается разным.
2. Вставьте промпт задания, сразу за ним — блок «Общий стиль».
3. Просите PNG с прозрачным фоном. Если прозрачность не получилась — ровный белый фон `#FFFFFF`
   без градиента и теней, вырежу сам.
4. Делайте 3–4 варианта каждого объекта и выбирайте по силуэту: он должен узнаваться в размере
   со спичечный коробок.

Объекты IMG-01–06 сгенерированы и подключены 15.11.2026. Исходники лежат в `src/assets/gen/`: мусор по углам
убран, пустые поля обрезаны (скрипт не хранится, шаги простые: обнулить альфу ниже 12, обрезать по объекту
с запасом 4%). Для новой волны сохранена исходная прозрачность генерации; её отдельный промпт — ниже.

## Общий стиль — добавлять в конец каждого промпта

```
Material and look: thick, heavy, polished blown art glass. Deep electric blue (#1A2FFB) where the glass is thick, almost clear icy azure where it is thin. Strong refraction, soft caustics inside the glass, crisp white specular highlights. A few thin polished silver-chrome edges or threads are the only accent. The form is organic, flowing and sculptural — a museum glass piece, not an icon, not a toy, not a cartoon character. Premium CGI product render, bright clean studio light from the top left. The object floats in empty space on a fully transparent background (alpha): no floor, no pedestal, no ground shadow, no outer glow or haze around the object. Three-quarter view. Landscape 3:2 canvas, 1536x1024. The object fills about 70% of the frame, its main mass slightly right of centre, nothing cropped, clean margins on all sides. No text, letters, numbers, punctuation marks, logos, interface panels, browser windows, cursors, speech bubbles, people or hands. No purple, pink, orange or green. It must look like one more piece from the same collection as the attached jellyfish.
```

**Нельзя:** панели и окна браузера, ленты с хромовым кольцом вокруг объекта, знаки и буквы,
мультяшные глаза и улыбки, тёмный фон, свечение вокруг объекта, пол и тень на полу.

---

## IMG-00 · `hero-glass-wave.png` — первый экран (готово)

**Задача.** Вписать один красивый объект в отмеченную владельцем Г-образную область. Верхний завиток
занимает место над высокой карточкой цены, широкие складки уходят влево и вниз. Заголовок, CTA,
два факта, карточка цены и контакты сохраняют исходные позиции. По последней правке волна немного
сдвинута влево, чтобы сократить зазор около звёздочки.

**Референсы.** Первый — `src/assets/gen/hero-object-v2.png`, только материал, цвет и свет. Второй —
скриншот владельца с красным контуром, только форма свободной области. Элементы сайта и контур
не должны попадать в сгенерированное изображение.

**Получено.** Встроенная генерация `image_gen`, PNG 1448×1086 с альфа-каналом, сохранён в
`src/assets/gen/hero-glass-wave.png`. Формат задания — 4:3; общий блок 3:2 к этому промпту не добавляется.
Варианты со скатом остались рабочими материалами в `output/hero-composition/` и не подключены.

**Полный финальный промпт:**

```text
Generate ONE isolated premium glass sculpture on true transparent alpha. Landscape 4:3 canvas, 1536x1152.
REFERENCE ROLES: Image 1 supplies ONLY the exact polished electric-blue blown-glass material, colour and bright white studio highlights. Image 2 is a website screenshot with a RED OUTLINE showing the precise available area. It is a composition guide ONLY. DO NOT generate the website, letters, text, buttons, cards, screenshot, red outline or any background. Output only the new glass object. The webpage elements cannot move; the object must adapt to their empty space.
Subject: a single continuous sculptural OCEAN WAVE made of thick flowing blown art glass. An elegant asymmetric rising S-curve, like a museum glass masterpiece shaped by an ocean current. NOT a jellyfish, ray, fish, animal or character. No spheres or extra separate objects. The upper end is a broad beautifully rolled translucent wave crest in the UPPER RIGHT, with a large open curl and crisp cobalt edge. The main glass flow travels diagonally DOWN AND LEFT from this crest, widening into three generous flowing glass folds at the LOWER LEFT. The folds belong to one continuous wave sculpture, with rich refractive depth and beautiful internal gaps. They gently taper at their ends, no many tiny strings, no sharp spikes. Calm, precise, sophisticated, visually substantial but airy, strong elegant silhouette. Only a few delicate polished silver-chrome edges trace portions of the glass folds.
CRITICAL silhouette and transparent cut-outs: Imagine the whole asset bounding box mapped to the red outline in screenshot 2. Occupy a hooked diagonal L-shaped footprint. The upper wave crest lives in the TOP-RIGHT rectangle: x=51% to96%, y=4% to28%. From there the sculpture bends left through a narrower neck near x=61%,y=37%, then becomes a broad flowing lower mass spanning x=5% to66%,y=40% to91%, ending towards the bottom-left. The TOP-LEFT region x<49%,y<32% MUST remain fully transparent for the headline. The RIGHT side below the crest, x>71%,y>32%, MUST remain fully transparent because the existing tall price card occupies that space. Also keep x>48%,y>79% transparent for the existing contact buttons. All glass must stay inside this diagonal L-shaped footprint; do not place a large body behind the price-card area. The shape should fill the allowed area generously, not look small inside a huge empty frame. Nothing cropped; 4% clear outer margins.
Material: heavy polished blown art glass, deep electric blue #1A2FFB in thick folds, nearly clear icy azure at thin edges, strong refraction and soft internal caustics, crisp broad white specular highlights. Museum-quality CGI product render, bright clean studio light from the top left. The exact material family of image1. Blue, azure, white reflections and fine silver only. No purple, green, pink, orange or gold. NO aura or outer glow/haze, no floor, no pedestal, no cast ground shadow, no water background, no texture around the object, no bubbles, no ring, no surrounding confetti. Background must be fully transparent alpha including all negative spaces. No typography or logos.
```

---

## IMG-01 · `works-nautilus.png` — «Работы» (готово)

**Где стоит.** Справа в первом экране страницы «Работы», ширина до 480 px.

**Основной вариант — наутилус:**

```
A single hero object: a nautilus shell made of blown glass, cut open along its length so the perfect logarithmic spiral of its inner chambers is visible. The outer shell is deep electric-blue glass. The thin walls between the chambers are clear azure glass; each chamber is slightly lighter than the previous one towards the centre, and the innermost chamber is almost white and softly lit from inside. One thin silver-chrome line traces the outer edge of the spiral. The opening of the shell faces left and slightly towards the viewer. Calm, precise, jewellery-like.
```

**Вариант B — витрина** (если морская серия не понравится):

```
A single hero object: a tall blown-glass display dome (a bell jar) of clear azure glass, standing on a thin silver-chrome ring instead of a base. Inside the dome floats one smooth sphere of deep electric-blue glass with slow swirling lighter layers inside it, like a small planet on exhibition. Reflections of the sphere bend along the inner wall of the dome. Calm, precise, museum-like.
```

---

## IMG-02 · `faq-seahorse.png` — «Вопросы» (готово)

**Где стоит.** Справа в первом экране страницы «Вопросы и ответы»: вертикальный объект шириной
до 240 px на десктопе и до 150 px на небольшом экране.

**Основной вариант — морской конёк:**

Подключена финальная версия с естественным стеклянным гребнем, без декоративной короны
и хромовых шариков на голове. Прозрачные поля обрезаны с запасом 4%, чтобы сохранить вертикальную подачу.

```
A single hero object: a seahorse made of blown glass, seen in profile, facing left. Its body bends in one elegant S-curve and ends in a tightly curled tail, so the whole silhouette quietly resembles a question mark — but it is clearly an animal, with no punctuation anywhere. Ridged, segmented body in deep electric-blue glass; a translucent azure dorsal fin with fine ribs; a small delicate crown on the head; a single tiny silver-chrome bead for the eye. Realistic proportions of a real seahorse, elegant and slightly mysterious, not cute.
```

**Вариант B — компас:**

```
A single hero object: a navigator's compass made of glass. A thick round lens-like disc of clear azure glass with a thin silver-chrome rim, tilted towards the viewer. Inside the glass floats a slender needle of deep electric-blue glass, pointing up and to the right. No markings, no letters, no scale on the dial — only the disc, the rim and the needle. Strong refraction through the thick edge of the disc.
```

---

## IMG-03 · `contacts-bottle.png` — «Контакты» (готово)

**Где стоит.** Справа в первом экране страницы «Контакты». Прямые ссылки на Telegram и почту
перенесены под текст первого экрана; на телефоне плашки стоят друг под другом.

```
A single hero object: a message in a bottle, made entirely of glass. A rounded bottle lying at a slight upward angle, as if drifting on a slow current: deep electric blue at the base, fading to clear azure at the neck, closed with a small silver-chrome stopper. Inside it, a rolled sheet of frosted white glass tied with one thin chrome thread — completely blank, no writing. A few tiny glass bubbles trail away from the neck to the upper right.
```

---

## IMG-04 · `notfound-buoy.png` — страница 404 (готово)

**Где стоит.** Справа в первом экране вместо крупных цифр. Код ошибки 404 остаётся в пояснении;
слева доступны ссылки на основные разделы сайта.

```
A single hero object: a ring-shaped life buoy made of thick deep electric-blue glass, with four evenly spaced bands of frosted white glass around it. A thin silver-chrome rope is loosely looped along its outer edge and trails off to the lower left. The ring is tilted about 30 degrees towards the viewer and floats calmly. Seen through the hole of the ring, the glass edge bends the light.
```

---

## IMG-05 · `price-pearl.png` — карточка цены на главной (готово)

**Где стоит.** Маленькая тёмная вставка в карточке «от 29 000 ₽» на первом экране. Раковина
заменила вторую копию медузы и вписана целиком с полями. Светлая жемчужина остаётся центром
композиции на почти чёрном фоне.

**Формат другой:** квадрат 1024×1024, объект занимает около 80% кадра и стоит по центру.
В блоке «Общий стиль» замените `Landscape 3:2 canvas, 1536x1024` на `Square canvas, 1024x1024`
и уберите слова про смещение вправо.

```
A single hero object: an open scallop shell made of blown glass, the two halves parted like a slightly open book and facing the viewer. Fine radial ribs on the shell, deep electric-blue glass on the outside, clear azure inside. Resting in the lower half is one perfect pearl of frosted white glass, softly lit from within — the brightest point of the image. Thin silver-chrome line along the rim of the shell. Must read clearly at a very small size and on a near-black background.
```

---

## IMG-06 · `services-octopus.png` — «Услуги» (готово)

Осьминог заменил стеклянные окна браузера: теперь все объекты принадлежат одной морской серии.
Используется уточнённая версия с восемью различимыми щупальцами.

```
A single hero object: an octopus made of blown glass, seen from slightly above. A smooth rounded mantle of deep electric-blue glass and eight long arms of clear azure glass spreading out in one graceful swirl, each arm ending in a small tight curl, with fine rows of tiny suckers as delicate glass beads. Two or three arms sweep to the lower left, the rest fan out to the right. A thin silver-chrome line runs along the top of two arms. Elegant and calm, realistic anatomy, not cute, no face expression.
```

---

## Что генерировать не нужно

- **Портрет для «Обо мне».** Нужна настоящая дневная фотография: сгенерированное лицо на сайте,
  который обещает «только то, что можно проверить», — обман.
- **Скриншоты кейсов.** Это настоящие снимки сайта, я переснимаю их сам.
- **Превью для соцсетей.** Соберу из готовых объектов, когда серия будет утверждена.
- **Картинки к пакетам, этапам и вопросам.** Там изображения ничего не объясняют и только
  утяжеляют страницу.
