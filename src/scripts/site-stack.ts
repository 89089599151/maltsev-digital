/** Поведение слоёв на первом экране: наклон за курсором, сборка по кнопке. */
export function initSiteStack(): void {
  const root = document.querySelector<HTMLElement>('[data-stack]');
  const toggle = root?.querySelector<HTMLButtonElement>('[data-stack-toggle]');
  if (!root || !toggle) return;

  const labelOpen = toggle.querySelector<HTMLElement>('[data-label-open]');
  const labelClosed = toggle.querySelector<HTMLElement>('[data-label-closed]');

  const spreadForScroll = () =>
    1 - Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.7))) * 0.85;

  const setState = (closed: boolean) => {
    root.dataset.state = closed ? 'closed' : 'open';
    root.style.setProperty('--spread', closed ? '0.04' : String(spreadForScroll()));
    toggle.setAttribute('aria-pressed', String(closed));
    if (labelOpen && labelClosed) {
      labelOpen.hidden = closed;
      labelClosed.hidden = !closed;
    }
  };

  toggle.addEventListener('click', () => setState(root.dataset.state !== 'closed'));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (reduce.matches) return;

  // Наклон за курсором — только на устройствах с мышью.
  if (finePointer.matches) {
    const area = root.closest<HTMLElement>('[data-stack-area]') ?? root;
    let raf = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      raf = 0;
      root.style.setProperty('--rx', `${56 - ty * 10}deg`);
      root.style.setProperty('--rz', `${-38 + tx * 14}deg`);
    };

    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    area.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  // При прокрутке первого экрана слои сходятся — сайт «собирается».
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    if (root.dataset.state === 'closed') return;
    root.style.setProperty('--spread', String(spreadForScroll()));
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
}
