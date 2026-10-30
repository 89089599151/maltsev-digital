/**
 * Motion-система сайта (GSAP + ScrollTrigger + SplitText).
 *
 * Атрибуты в разметке:
 *  [data-intro="scene|pane"]  — первый экран: сборка на CSS, здесь только прокрутка;
 *  [data-split]                 — заголовок, строки поднимаются из-под маски;
 *  [data-reveal="" | "rise" | "wipe"] — появление: подъём, рост снизу, раскрытие слева;
 *  [data-stagger]               — дети контейнера появляются по очереди;
 *  [data-scrub-words]           — текст «прочитывается» словами при скролле;
 *  [data-speed="1.5"]           — параллакс (только крупные экраны);
 *  [data-tilt-area] / [data-tilt] / [data-float] — реакция на курсор;
 *  [data-magnetic]              — «магнитная» кнопка;
 *  [data-blocks]                — блоки логотипа в подвале вырастают.
 *
 * Без скрипта и при prefers-reduced-motion весь контент виден сразу.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const EASE = 'expo.out';

export function initMotion(): void {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add('motion-ready');

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = window.matchMedia('(min-width: 1024px)').matches;

  heroIntro();
  splitHeadings();
  reveals();
  scrubWords();
  footerBlocks();
  if (wide) parallax();
  if (finePointer) {
    tilt();
    magnetic();
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

function splitHeadings(): void {
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.05,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

function reveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
    });
  });

  const kinds: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
    '': { from: { autoAlpha: 0, y: 30 }, to: { autoAlpha: 1, y: 0 } },
    rise: { from: { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, to: { clipPath: 'inset(0% 0% 0% 0% round 22px)' } },
    wipe: { from: { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, to: { clipPath: 'inset(0% 0% 0% 0% round 22px)' } },
  };

  for (const [kind, v] of Object.entries(kinds)) {
    const els = gsap.utils.toArray<HTMLElement>(`[data-reveal="${kind}"]`);
    if (!els.length) continue;
    gsap.set(els, v.from);
    revealFailsafe(els, v.to);
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          ...v.to,
          duration: kind ? 1.25 : 0.95,
          ease: kind ? 'expo.inOut' : EASE,
          stagger: 0.08,
          overwrite: true,
          clearProps: kind ? 'clipPath' : 'transform',
        }),
    });
  }
}

/** Если элемент уже на экране, а анимация не дошла до конца за 1,6 с, показать его сразу. */
function revealFailsafe(els: HTMLElement[], to: gsap.TweenVars): void {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      window.setTimeout(() => {
        const cs = getComputedStyle(el);
        if (Number(cs.opacity) < 0.95 || (cs.clipPath !== 'none' && !cs.clipPath.startsWith('inset(0'))) {
          gsap.set(el, { ...to, clearProps: 'transform,clipPath' });
        }
      }, 1600);
    }
  });
  els.forEach((el) => io.observe(el));
}

function scrubWords(): void {
  gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
    // aria: none — текст остаётся читаемым для скринридеров без aria-label на абзаце.
    // Анимируется цвет от читаемого серого (контраст ≈5:1) к основному.
    const split = SplitText.create(el, { type: 'words', aria: 'none' });
    gsap.fromTo(
      split.words,
      { color: '#5b6a84' },
      {
        color: '#0d1b33',
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );
  });
}

function footerBlocks(): void {
  const mark = document.querySelector<HTMLElement>('[data-blocks]');
  if (!mark) return;
  gsap.from(mark.children, {
    scaleY: 0.15,
    transformOrigin: '50% 100%',
    duration: 1.2,
    ease: EASE,
    stagger: 0.06,
    scrollTrigger: { trigger: mark, start: 'top 92%', once: true },
  });
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
