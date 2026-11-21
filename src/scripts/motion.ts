/**
 * Появление крупных изображений при прокрутке — без библиотек, одна система на все страницы.
 *
 * [data-reveal] — изображение (сцена работ, карточка проекта, экраны кейса) мягко проявляется,
 * когда заходит в окно. Текст и заголовки не анимируются: переход по якорю сразу приводит
 * к готовому содержимому.
 *
 * Сама анимация описана в global.css; скрипт только ставит классы.
 * Без скрипта и при prefers-reduced-motion всё видно сразу. Первый экран этого файла не ждёт.
 */

const REVEAL = '[data-reveal]';

export function initMotion(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  reveals(document.documentElement);
}

/** Один наблюдатель на страницу, без замеров при прокрутке. */
function reveals(root: HTMLElement): void {
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
    const el = event.target instanceof Element ? event.target.closest<HTMLElement>(REVEAL) : null;
    el?.classList.add('is-in', 'is-static');
  });
}
