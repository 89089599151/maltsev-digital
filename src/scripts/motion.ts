/**
 * Движение на сайте — без библиотек, одна система на все страницы.
 *
 * Атрибуты в разметке:
 *  [data-reveal]      — блок появляется, когда заходит в окно;
 *  [data-stagger]     — дети контейнера появляются по очереди;
 *  [data-split]       — заголовок поднимается из-под маски;
 *  [data-float-area]  — область, в которой [data-float="26"] мягко сдвигается за курсором
 *                       (число — размах в пикселях) и чуть отстаёт при прокрутке.
 *
 * Сами анимации описаны в global.css; скрипт только ставит классы и переменные.
 * Без скрипта и при prefers-reduced-motion весь контент виден сразу и стоит на месте.
 * Первый экран собирается на CSS и этого файла не ждёт.
 */

const REVEAL = '[data-reveal], [data-split]';
/** Сколько элементов подряд получают нарастающую задержку: дальше очередь не растёт. */
const MAX_STEPS = 5;

export function initMotion(): void {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  reveals(root);
  if (window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) pointerFloat();
}

/** Появление при прокрутке: один наблюдатель на страницу, без замеров при прокрутке. */
function reveals(root: HTMLElement): void {
  // Дети [data-stagger] появляются по очереди — номер в очереди задаёт задержку.
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
      (child as HTMLElement).style.setProperty('--i', String(Math.min(i, MAX_STEPS)));
    });
  });

  const items = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
  if (!items.length) return;

  // То, что уже на экране в момент запуска, остаётся как есть: без мигания «было — исчезло — появилось».
  const fold = window.innerHeight;
  const pending = items.filter((el) => {
    if (el.getBoundingClientRect().top < fold) {
      el.classList.add('is-in', 'is-static');
      return false;
    }
    return true;
  });
  root.classList.add('motion-ready');
  if (!pending.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Быстрая прокрутка или переход по якорю: пройденное тоже показываем.
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return;
        observer.unobserve(entry.target);
        entry.target.classList.add('is-in');
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  pending.forEach((el) => observer.observe(el));

  // Фокус с клавиатуры не должен попадать в ещё скрытый блок.
  document.addEventListener('focusin', (event) => {
    let el = event.target instanceof Element ? event.target.closest<HTMLElement>(REVEAL) : null;
    while (el) {
      el.classList.add('is-in', 'is-static');
      el = el.parentElement?.closest<HTMLElement>(REVEAL) ?? null;
    }
  });
}

/**
 * Объект первого экрана: сдвигается за курсором и отстаёт при прокрутке.
 * Кадры идут только пока значение не дошло до цели — в покое ничего не считается.
 */
function pointerFloat(): void {
  document.querySelectorAll<HTMLElement>('[data-float-area]').forEach((area) => {
    const targets = Array.from(area.querySelectorAll<HTMLElement>('[data-float]')).map((el) => ({
      el,
      amp: Number(el.dataset.float) || 20,
    }));
    if (!targets.length) return;

    let tx = 0;
    let ty = 0;
    let scroll = 0;
    let x = 0;
    let y = 0;
    let s = 0;
    let frame = 0;

    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      s += (scroll - s) * 0.14;
      targets.forEach(({ el, amp }) => {
        el.style.transform = `translate3d(${(x * amp).toFixed(2)}px, ${(y * amp + s).toFixed(2)}px, 0)`;
      });
      const settled = Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001 && Math.abs(scroll - s) < 0.1;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    area.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch') return;
        const r = area.getBoundingClientRect();
        tx = (event.clientX - r.left) / r.width - 0.5;
        ty = (event.clientY - r.top) / r.height - 0.5;
        wake();
      },
      { passive: true },
    );
    area.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      wake();
    });

    // Пока первый экран виден, объект уходит вниз в шесть раз медленнее страницы.
    let visible = true;
    new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(area);
    window.addEventListener(
      'scroll',
      () => {
        if (!visible) return;
        scroll = window.scrollY * 0.16;
        wake();
      },
      { passive: true },
    );
  });
}
