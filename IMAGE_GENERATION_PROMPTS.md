# Задания на генерацию изображений — v4, серия «стеклянное море»

Прошлые промпты (медуза, сборка окон для услуг, галерея и диалог) остались в истории git.

## Почему переделываем

Картинки для «Работ» и «Вопросов» повторяют формулу страницы услуг: три стеклянные панели, лента
и хромовое кольцо. На трёх страницах подряд это читается как одна и та же картинка, а облачка
с вопросительным знаком и точками выглядят как иконка из мессенджера.

Главный образ сайта — стеклянная медуза на первом экране. Новая серия продолжает его: на каждой
странице один морской объект из того же стекла, со своим силуэтом и смыслом. Никаких панелей,
символов и значков.

| Страница | Объект | Смысл | Файл |
|---|---|---|---|
| Главная | медуза (уже есть) | — | `hero-object-v2.png` |
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

Вся серия сгенерирована и подключена 15.11.2026. Исходники лежат в `src/assets/gen/`: мусор по углам убран,
пустые поля обрезаны (скрипт не хранится, шаги простые: обнулить альфу ниже 12, обрезать по объекту с запасом 4%).

## Общий стиль — добавлять в конец каждого промпта

```
Material and look: thick, heavy, polished blown art glass. Deep electric blue (#1A2FFB) where the glass is thick, almost clear icy azure where it is thin. Strong refraction, soft caustics inside the glass, crisp white specular highlights. A few thin polished silver-chrome edges or threads are the only accent. The form is organic, flowing and sculptural — a museum glass piece, not an icon, not a toy, not a cartoon character. Premium CGI product render, bright clean studio light from the top left. The object floats in empty space on a fully transparent background (alpha): no floor, no pedestal, no ground shadow, no outer glow or haze around the object. Three-quarter view. Landscape 3:2 canvas, 1536x1024. The object fills about 70% of the frame, its main mass slightly right of centre, nothing cropped, clean margins on all sides. No text, letters, numbers, punctuation marks, logos, interface panels, browser windows, cursors, speech bubbles, people or hands. No purple, pink, orange or green. It must look like one more piece from the same collection as the attached jellyfish.
```

**Нельзя:** панели и окна браузера, ленты с хромовым кольцом вокруг объекта, знаки и буквы,
мультяшные глаза и улыбки, тёмный фон, свечение вокруг объекта, пол и тень на полу.

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
