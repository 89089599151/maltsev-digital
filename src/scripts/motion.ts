/**
 * Motion-система сайта: GSAP для строк/параллакса, CSS для появления и карточек.
 *
 * [data-split] / [data-reveal="" | "rise" | "wipe"] / [data-stagger] — появления;
 * [data-intro="scene|pane"] / [data-speed] — реакция на прокрутку;
 * [data-tilt-area] / [data-tilt] / [data-float] / [data-magnetic] — курсор;
 * [data-hover-card] — подъём при наведении и фокусе, работает и без JS;
 * [data-spotlight] — мягкий свет под содержимым, только на десктопе с мышью.
 *
 * Без скрипта весь контент виден. Смена reduced-motion останавливает эффекты,
 * возвращает исходную разметку заголовков и сразу показывает все блоки.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const EASE = 'expo.out';
const POINTER_MEDIA = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
const seenHeadings = new WeakSet<HTMLElement>();
let disposeMotion: (() => void) | undefined;

/** Между фазами браузер может обработать ввод и отрисовать страницу. */
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Все отложенные эффекты принадлежат одному запуску и могут быть отменены вместе. */
class MotionScope {
  active = true;
  readonly controller = new AbortController();
  private readonly context = gsap.context(() => {});
  private readonly cleanups: (() => void)[] = [];
  private readonly timers = new Set<number>();

  run(callback: () => void): void {
    if (this.active) this.context.add(callback);
  }

  cleanup(callback: () => void): void {
    this.cleanups.push(callback);
  }

  after(delay: number, callback: () => void): void {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      if (this.active) callback();
    }, delay);
    this.timers.add(timer);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    document.documentElement.classList.remove('motion-ready');
    this.controller.abort();
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.cleanups.reverse().forEach((cleanup) => cleanup());
    this.context.revert();
  }
}

export async function initMotion(): Promise<void> {
  disposeMotion?.();
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const pointer = window.matchMedia(POINTER_MEDIA);
  let scope: MotionScope | undefined;
  const update = async () => {
    scope?.stop();
    scope = undefined;
    if (preference.matches) return;

    const current = new MotionScope();
    scope = current;
    document.documentElement.classList.add('motion-ready');
    const phases = [heroIntro, reveals, splitHeadings, footerBlocks];
    if (desktop.matches) phases.push(parallax);
    if (pointer.matches) phases.push(pointerEffects);

    try {
      for (const phase of phases) {
        if (!current.active) return;
        current.run(() => phase(current));
        await nextTask();
      }
      // Шрифты могут сдвинуть триггеры, но отменённый запуск не должен их создавать заново.
      void document.fonts?.ready.then(() => {
        if (current.active) ScrollTrigger.refresh();
      });
    } catch (error) {
      current.stop();
      console.warn('Motion disabled; content remains available.', error);
    }
  };

  const onPreferenceChange = () => { void update(); };
  preference.addEventListener('change', onPreferenceChange);
  desktop.addEventListener('change', onPreferenceChange);
  pointer.addEventListener('change', onPreferenceChange);
  disposeMotion = () => {
    preference.removeEventListener('change', onPreferenceChange);
    desktop.removeEventListener('change', onPreferenceChange);
    pointer.removeEventListener('change', onPreferenceChange);
    scope?.stop();
  };
  await update();
}

/** Вступление первого экрана остаётся CSS-анимацией. */
function heroIntro(scope: MotionScope): void {
  const scene = document.querySelector<HTMLElement>('[data-intro="scene"]');
  const pane = document.querySelector<HTMLElement>('[data-intro="pane"]');
  const hero = pane?.closest('section');
  if (!pane || !hero) return;
  const startScrollMotion = () => scope.run(() => {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(pane, { y: -40, scale: 0.97, ease: 'none', scrollTrigger: st });
    if (scene) gsap.to(scene, { y: 120, rotate: 6, ease: 'none', scrollTrigger: { ...st } });
  });

  // Считывать конечную позицию после CSS-вступления, а не его промежуточный кадр.
  const introAnimations = [pane, scene].flatMap((element) => element?.getAnimations() ?? []);
  if (introAnimations.length) {
    void Promise.allSettled(introAnimations.map((animation) => animation.finished)).then(startScrollMotion);
  } else {
    startScrollMotion();
  }
}

/** IntersectionObserver не требует синхронного замера всех карточек при запуске. */
function onEnter(scope: MotionScope, els: Element[], callback: (batch: HTMLElement[]) => void, bottom = '-6%'): void {
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    if (!scope.active) return;
    // Якорь или быстрая прокрутка тоже должны раскрыть уже пройденный контент.
    const batch = entries
      .filter((entry) => entry.isIntersecting || entry.boundingClientRect.bottom < 0)
      .map((entry) => entry.target as HTMLElement);
    if (!batch.length) return;
    batch.forEach((element) => observer.unobserve(element));
    scope.run(() => callback(batch));
  }, { rootMargin: `0px 0px ${bottom} 0px` });
  scope.cleanup(() => observer.disconnect());
  els.forEach((element) => observer.observe(element));
}

/** Строки замеряются только при подходе заголовка к экрану. */
function splitHeadings(scope: MotionScope): void {
  const headings = gsap.utils.toArray<HTMLElement>('[data-split]').filter((element) => !seenHeadings.has(element));
  const tweens = new WeakMap<HTMLElement, gsap.core.Tween>();
  onEnter(scope, headings, (near) => {
    near.forEach((element) => {
      const split = SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          // Оставить место для бревиса Й и точек Ё над строкой.
          self.masks.forEach((mask) => {
            (mask as HTMLElement).style.paddingTop = '0.16em';
            (mask as HTMLElement).style.marginTop = '-0.16em';
          });
          if (seenHeadings.has(element)) return;
          const tween = gsap.from(self.lines, {
            yPercent: 112, duration: 0.95, ease: EASE, stagger: 0.09, paused: true,
          });
          tweens.set(element, tween);
          return tween;
        },
      });
      scope.cleanup(() => split.revert());
    });
    onEnter(scope, near, (batch) => batch.forEach((element) => {
      seenHeadings.add(element);
      tweens.get(element)?.play();
    }), '-5%');
  }, '25%');
}

/** CSS управляет появлением, JS только назначает очередь внутри каждой группы. */
function reveals(scope: MotionScope): void {
  const groups = new WeakMap<Element, Element>();
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
      groups.set(child, group);
    });
  });
  const elements = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  scope.cleanup(() => elements.forEach((element) => {
    element.classList.remove('is-revealing');
    element.style.removeProperty('--reveal-delay');
  }));
  // Клавиатурный переход не должен приводить фокус в ещё скрытую карточку.
  document.addEventListener('focusin', (event) => {
    let element = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-reveal]') : null;
    while (element) {
      element.classList.add('is-in');
      element.classList.remove('is-revealing');
      element.style.removeProperty('--reveal-delay');
      element = element.parentElement?.closest<HTMLElement>('[data-reveal]') ?? null;
    }
  }, { signal: scope.controller.signal });
  onEnter(scope, elements.filter((element) => !element.classList.contains('is-in')), (batch) => {
    const positions = new Map<Element, number>();
    batch.forEach((element) => {
      const group = groups.get(element);
      const position = group ? positions.get(group) ?? 0 : 0;
      if (group) positions.set(group, position + 1);
      // Длинный список не задерживает последние элементы на несколько секунд.
      const delay = Math.min(position, 4) * 95;
      element.style.setProperty('--reveal-delay', `${delay}ms`);
      element.classList.add('is-revealing', 'is-in');
      scope.after(delay + 1150, () => {
        element.classList.remove('is-revealing');
        element.style.removeProperty('--reveal-delay');
      });
    });
  });
}

function footerBlocks(scope: MotionScope): void {
  const mark = document.querySelector<HTMLElement>('[data-blocks]');
  if (!mark) return;
  onEnter(scope, [mark], (near) => {
    const tween = gsap.from(mark.children, {
      scaleY: 0.15, transformOrigin: '50% 100%', duration: 1.15, ease: EASE, stagger: 0.065, paused: true,
    });
    onEnter(scope, near, () => { tween.play(); }, '-5%');
  }, '25%');
}

function parallax(_scope: MotionScope): void {
  gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((element) => {
    const speed = Number(element.dataset.speed) || 1;
    gsap.fromTo(element, { yPercent: speed * 8 }, {
      yPercent: -speed * 8, ease: 'none',
      scrollTrigger: { trigger: element.closest('section') ?? element, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/** Один замер только активной области за кадр; никакой геометрии всех карточек при запуске. */
function pointerEffects(scope: MotionScope): void {
  const viewportChanges = new Set<() => void>();
  const options = { signal: scope.controller.signal, passive: true };
  const invalidate = () => viewportChanges.forEach((callback) => callback());
  window.addEventListener('scroll', invalidate, { ...options, capture: true });
  window.addEventListener('resize', invalidate, options);

  const track = (
    element: HTMLElement,
    move: (x: number, y: number, bounds: DOMRect) => void,
    leave: () => void,
  ) => {
    let frame = 0;
    let bounds: DOMRect | undefined;
    let pointer: PointerEvent | undefined;
    const apply = () => {
      frame = 0;
      if (!pointer || !scope.active) return;
      bounds ??= element.getBoundingClientRect();
      if (bounds.width && bounds.height) move(pointer.clientX - bounds.left, pointer.clientY - bounds.top, bounds);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !window.matchMedia(POINTER_MEDIA).matches) return;
      pointer = event;
      schedule();
    };
    const reset = () => {
      pointer = undefined;
      bounds = undefined;
      cancelAnimationFrame(frame);
      frame = 0;
      leave();
    };
    viewportChanges.add(() => {
      bounds = undefined;
      if (pointer) schedule();
    });
    element.addEventListener('pointerenter', onMove, options);
    element.addEventListener('pointermove', onMove, options);
    element.addEventListener('pointerleave', reset, options);
    element.addEventListener('pointercancel', reset, options);
    window.addEventListener('blur', reset, options);
    scope.cleanup(() => cancelAnimationFrame(frame));
  };

  document.querySelectorAll<HTMLElement>('[data-tilt-area]').forEach((area) => {
    const tilts = Array.from(area.querySelectorAll<HTMLElement>('[data-tilt]'));
    const floats = Array.from(area.querySelectorAll<HTMLElement>('[data-float]'));
    if (!tilts.length && !floats.length) return;
    let apply: ((x: number, y: number) => void) | undefined;
    track(area, (x, y, bounds) => {
      if (!apply) scope.run(() => {
        gsap.set(tilts, { transformPerspective: 1400 });
        const targets = [
          ...tilts.map((element) => ({
            x: gsap.quickTo(element, 'rotateY', { duration: 0.65, ease: 'power3.out' }),
            y: gsap.quickTo(element, 'rotateX', { duration: 0.65, ease: 'power3.out' }),
            amplitude: Number(element.dataset.tilt) || 4, invertY: -1,
          })),
          ...floats.map((element) => ({
            x: gsap.quickTo(element, 'x', { duration: 0.95, ease: 'power3.out' }),
            y: gsap.quickTo(element, 'y', { duration: 0.95, ease: 'power3.out' }),
            amplitude: Number(element.dataset.float) || 20, invertY: 1,
          })),
        ];
        apply = (nx, ny) => targets.forEach((target) => {
          target.x(nx * target.amplitude);
          target.y(ny * target.amplitude * target.invertY);
        });
      });
      apply?.(x / bounds.width - 0.5, y / bounds.height - 0.5);
    }, () => apply?.(0, 0));
  });

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    let x: gsap.QuickToFunc | undefined;
    let y: gsap.QuickToFunc | undefined;
    track(element, (px, py, bounds) => {
      if (!x || !y) scope.run(() => {
        x = gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3.out' });
        y = gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3.out' });
      });
      x?.((px - bounds.width / 2) * 0.18);
      y?.((py - bounds.height / 2) * 0.24);
    }, () => { x?.(0); y?.(0); });
  });

  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((element) => {
    // Отдельный слой сохраняет авторские ::before/::after и остаётся под текстом/ссылками.
    const light = document.createElement('span');
    light.className = 'motion-spotlight';
    light.setAttribute('aria-hidden', 'true');
    element.classList.add('has-spotlight');
    element.append(light);
    scope.cleanup(() => {
      light.remove();
      element.classList.remove('has-spotlight', 'is-spotlit');
    });
    track(element, (x, y) => {
      light.style.setProperty('--spotlight-x', `${x}px`);
      light.style.setProperty('--spotlight-y', `${y}px`);
      element.classList.add('is-spotlit');
    }, () => element.classList.remove('is-spotlit'));
  });
}
