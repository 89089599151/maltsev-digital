/**
 * Появление элементов при прокрутке.
 * [data-reveal]  — подъём и проявление, порядок задаётся --i;
 * [data-shutter] — шторка для главного изображения;
 * [data-blocks]  — вырастающие блоки логотипа в подвале;
 * [data-stagger] — контейнер, детям которого автоматически проставляется --i.
 */
export function initReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      const el = child as HTMLElement;
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      el.style.setProperty('--i', String(i));
    });
  });

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-shutter], [data-blocks]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => io.observe(el));
}
