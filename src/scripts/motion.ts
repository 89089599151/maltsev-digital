/**
 * Motion-система сайта (GSAP + ScrollTrigger + SplitText; появления — CSS-переходы).
 *
 * Атрибуты в разметке:
 *  [data-intro="scene|pane"]  — первый экран: сборка на CSS, здесь только прокрутка;
 *  [data-split]                 — заголовок, строки поднимаются из-под маски;
 *  [data-reveal="" | "rise" | "wipe"] — появление: подъём, рост снизу, раскрытие слева;
 *  [data-stagger]               — дети контейнера появляются по очереди;
 *  [data-speed="1.5"]           — параллакс (только крупные экраны);
 *  [data-tilt-area] / [data-tilt] / [data-float] — реакция на курсор;
 *  [data-magnetic]              — «магнитная» кнопка;
 *  [data-pixels]                — пиксельное слово собирается из пикселей при появлении.
 *
 * Без скрипта и при prefers-reduced-motion весь контент виден сразу.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const EASE = 'expo.out';

/** Отдать управление браузеру между фазами, чтобы запуск не был одной длинной задачей. */
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function initMotion(): Promise<void> {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add('motion-ready');

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = window.matchMedia('(min-width: 1024px)').matches;

  const phases = [heroIntro, splitHeadings, reveals, footerBlocks, pixels];
  if (wide) phases.push(parallax);
  if (finePointer) phases.push(tilt, magnetic);
  for (const run of phases) {
    run();
    await nextTask();
  }

  // Шрифты и картинки могли сдвинуть вёрстку — пересчитать позиции триггеров.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Сборка первого экрана — CSS-анимация (HeroGlass). Здесь только реакция на прокрутку. */
function heroIntro(): void {
  const scene = document.querySelector<HTMLElement>('[data-intro="scene"]');
  const pane = document.querySelector<HTMLElement>('[data-intro="pane"]');
  const hero = pane?.closest('section');
  if (!pane || !hero) return;
  const startScrollMotion = () => {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(pane, { y: -40, scale: 0.97, ease: 'none', scrollTrigger: st });
    if (scene) gsap.to(scene, { y: 120, rotate: 6, ease: 'none', scrollTrigger: { ...st } });
  };

  // GSAP должен считывать конечную позицию, а не transform вступительной CSS-анимации.
  const introAnimations = [pane, scene].flatMap((element) => element?.getAnimations() ?? []);
  if (introAnimations.length) {
    void Promise.allSettled(introAnimations.map((animation) => animation.finished)).then(startScrollMotion);
  } else {
    startScrollMotion();
  }
}

/**
 * Вызвать cb, когда элементы заходят в окно; bottom сдвигает нижнюю границу
 * (−10% — чуть выше края экрана, 25% — заранее). IntersectionObserver не заставляет браузер
 * пересчитывать раскладку, в отличие от сотни ScrollTrigger, — запуск не блокирует ввод.
 */
function onEnter(els: Element[], cb: (batch: HTMLElement[]) => void, bottom = '-10%'): void {
  const io = new IntersectionObserver(
    (entries) => {
      // Уже выше окна (быстрая прокрутка, переход по якорю) — тоже показать.
      const batch = entries
        .filter((e) => e.isIntersecting || e.boundingClientRect.bottom < 0)
        .map((e) => e.target as HTMLElement);
      if (!batch.length) return;
      batch.forEach((el) => io.unobserve(el));
      cb(batch);
    },
    { rootMargin: `0px 0px ${bottom} 0px` },
  );
  els.forEach((el) => io.observe(el));
}

/**
 * Разбивка на строки требует замера раскладки, поэтому заголовок разбивается не при запуске,
 * а когда подходит к экрану (за четверть окна до появления), — запуск не превращается в одну длинную задачу.
 */
function splitHeadings(): void {
  const headings = gsap.utils.toArray<HTMLElement>('[data-split]');
  const seen = new WeakSet<HTMLElement>();
  const tweens = new WeakMap<HTMLElement, gsap.core.Tween>();
  const split = (el: HTMLElement) =>
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        // Маска строки режет всё выше её верхнего края — дать место бревису Й и точкам Ё.
        self.masks.forEach((m) => {
          (m as HTMLElement).style.paddingTop = '0.16em';
          (m as HTMLElement).style.marginTop = '-0.16em';
        });
        // Повторная разбивка (смена ширины) после показа — без анимации.
        if (seen.has(el)) return;
        const tween = gsap.from(self.lines, { yPercent: 105, duration: 1.05, ease: EASE, stagger: 0.08, paused: true });
        tweens.set(el, tween);
        return tween;
      },
    });
  const play = (batch: HTMLElement[]) =>
    batch.forEach((el) => {
      seen.add(el);
      tweens.get(el)?.play();
    });
  onEnter(
    headings,
    (near) => {
      near.forEach(split);
      onEnter(near, play, '-12%');
    },
    '25%',
  );
}

/**
 * Появление при прокрутке — CSS-переходы (global.css, [data-reveal]); скрипт только ставит классы.
 * Раньше начальное состояние задавал GSAP: он читал стиль каждого элемента, и браузер сотню раз
 * пересчитывал страницу. Классы — только запись, без чтения.
 */
function reveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
    });
  });
  onEnter(gsap.utils.toArray<HTMLElement>('[data-reveal]'), (batch) =>
    batch.forEach((el, i) => {
      const delay = i * 80;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('is-revealing', 'is-in');
      window.setTimeout(() => {
        el.classList.remove('is-revealing');
        el.style.transitionDelay = '';
      }, delay + 1300);
    }),
  );
}

/**
 * Твин, который готовится, когда элемент подходит к экрану, и играет, когда заходит в окно.
 * GSAP замеряет цели при создании — для сотен пикселей это дорого, поэтому не при запуске.
 */
function playOnEnter(els: Element[], make: (el: HTMLElement) => gsap.core.Tween, bottom = '-10%'): void {
  const tweens = new Map<Element, gsap.core.Tween>();
  onEnter(
    els,
    (near) => {
      near.forEach((el) => tweens.set(el, make(el)));
      onEnter(near, (batch) => batch.forEach((el) => tweens.get(el)?.play()), bottom);
    },
    '25%',
  );
}

function footerBlocks(): void {
  const mark = document.querySelector<HTMLElement>('[data-blocks]');
  if (!mark) return;
  playOnEnter(
    [mark],
    (el) =>
      gsap.from(el.children, {
        scaleY: 0.15,
        transformOrigin: '50% 100%',
        duration: 1.2,
        ease: EASE,
        stagger: 0.06,
        paused: true,
      }),
    '-8%',
  );
}

/** Пиксельные слова собираются в случайном порядке, когда попадают на экран. */
function pixels(): void {
  playOnEnter(gsap.utils.toArray<SVGSVGElement>('[data-pixels]'), (svg) =>
    gsap.from(svg.querySelectorAll('rect'), {
      opacity: 0,
      scale: 0.2,
      transformOrigin: '50% 50%',
      duration: 0.5,
      ease: EASE,
      stagger: { each: 0.004, from: 'random' },
      paused: true,
    }),
  );
}

function parallax(): void {
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = Number(el.dataset.speed) || 1;
    gsap.fromTo(
      el,
      { yPercent: speed * 8 },
      {
        yPercent: -speed * 8,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function tilt(): void {
  gsap.utils.toArray<HTMLElement>('[data-tilt-area]').forEach((area) => {
    const tilts = Array.from(area.querySelectorAll<HTMLElement>('[data-tilt]'));
    const floats = Array.from(area.querySelectorAll<HTMLElement>('[data-float]'));
    if (!tilts.length && !floats.length) return;
    if (tilts.length) gsap.set(tilts, { transformPerspective: 1400 });
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      tilts.forEach((t) => {
        const amp = Number(t.dataset.tilt) || 4;
        gsap.to(t, { rotateX: -ny * amp, rotateY: nx * amp, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      });
      floats.forEach((f) => {
        const amp = Number(f.dataset.float) || 20;
        gsap.to(f, { x: nx * amp, y: ny * amp, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      });
    };
    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    area.addEventListener('pointerleave', () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  });
}

function magnetic(): void {
  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.22);
      y((e.clientY - (r.top + r.height / 2)) * 0.32);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}
