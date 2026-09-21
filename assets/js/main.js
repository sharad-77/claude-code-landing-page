import { animate, inView, stagger } from './vendor/motion.js';

document.body.classList.remove('no-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) document.body.classList.add('reduced-motion');

/* ---------------------------------------------------------
   Scroll reveal — fade/slide variants driven by data-anim
   --------------------------------------------------------- */
const VARIANTS = {
  'fade-up': { from: { opacity: 0, transform: 'translateY(22px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  'fade-left': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
  'fade-right': { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
};

function initReveal() {
  const groups = new Map();
  document.querySelectorAll('[data-animate]').forEach((el) => {
    const parent = el.closest('section, .side-col > *') || el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((els) => {
    inView(
      els[0],
      () => {
        els.forEach((el, i) => {
          const variant = VARIANTS[el.dataset.anim] || VARIANTS['fade-up'];
          Object.assign(el.style, { opacity: 0 });
          animate(
            el,
            reduceMotion ? { opacity: [0, 1] } : { opacity: [variant.from.opacity, variant.to.opacity], transform: [variant.from.transform, variant.to.transform] },
            { duration: reduceMotion ? 0.2 : 0.6, delay: reduceMotion ? 0 : i * 0.06, easing: [0.16, 1, 0.3, 1] }
          );
        });
      },
      { margin: '0px 0px -10% 0px' }
    );
  });
}

/* ---------------------------------------------------------
   Sticky header shadow on scroll
   --------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------------------------------------------------
   Progress bars — animate width when scrolled into view
   --------------------------------------------------------- */
function initProgressBars() {
  document.querySelectorAll('.progress-fill').forEach((bar) => {
    const target = parseFloat(bar.dataset.progress || '0');
    inView(bar, () => {
      animate(bar, { width: [`0%`, `${target}%`] }, { duration: 1.1, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

/* ---------------------------------------------------------
   Animated number counters (stats + CTA banner)
   --------------------------------------------------------- */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    inView(el, () => {
      animate(0, target, {
        duration: 1.4,
        easing: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => { el.textContent = Math.round(latest).toLocaleString('en-US'); },
      });
    });
  });
}

/* ---------------------------------------------------------
   Countdown timer — ticks toward a target time, digits pulse
   --------------------------------------------------------- */
function initCountdown() {
  const els = {
    d: document.querySelector('[data-count-unit="d"]'),
    h: document.querySelector('[data-count-unit="h"]'),
    m: document.querySelector('[data-count-unit="m"]'),
    s: document.querySelector('[data-count-unit="s"]'),
  };
  if (!els.d) return;

  const target = Date.now() + (2 * 86400 + 14 * 3600 + 32 * 60 + 9) * 1000;

  function render(force) {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const next = { d, h, m, s };
    Object.entries(next).forEach(([key, val]) => {
      const str = String(val).padStart(2, '0');
      const el = els[key];
      if (el.textContent !== str) {
        el.textContent = str;
        if (!force && !reduceMotion) {
          animate(el, { transform: ['scale(1.25)', 'scale(1)'], opacity: [0.4, 1] }, { duration: 0.35, easing: [0.16, 1, 0.3, 1] });
        }
      }
    });
  }
  render(true);
  setInterval(render, 1000);
}

/* ---------------------------------------------------------
   Circular progress ring (bottom CTA banner)
   --------------------------------------------------------- */
function initRing() {
  const ring = document.getElementById('ctaRing');
  if (!ring) return;
  const circumference = 2 * Math.PI * 73.5;
  const pct = parseFloat(ring.dataset.progress || '0') / 100;
  inView(ring, () => {
    animate(
      ring,
      { strokeDashoffset: [circumference, circumference * (1 - pct)] },
      { duration: 1.4, easing: [0.16, 1, 0.3, 1] }
    );
  });
}

/* ---------------------------------------------------------
   Tab groups (generic) — filter tabs, guide tabs, mini tabs, speech tabs
   --------------------------------------------------------- */
function initTabGroups(selector) {
  document.querySelectorAll(selector).forEach((group) => {
    const buttons = Array.from(group.children).filter((c) => c.tagName === 'BUTTON');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        if (!reduceMotion) animate(btn, { transform: ['scale(0.94)', 'scale(1)'] }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
      });
    });
  });
}

/* ---------------------------------------------------------
   Hero carousel dots + sidebar promo dots
   --------------------------------------------------------- */
function initDots() {
  document.querySelectorAll('.dots').forEach((group) => {
    const dots = Array.from(group.children);
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        dots.forEach((d) => d.classList.remove('is-active'));
        dot.classList.add('is-active');
      });
    });
  });
}

/* ---------------------------------------------------------
   FAQ accordion — animated height/opacity
   --------------------------------------------------------- */
function initAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    const p = a.querySelector('p');

    function setOpen(open, instant) {
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
      const target = open ? p.offsetHeight : 0;
      if (instant || reduceMotion) {
        a.style.height = target + 'px';
        return;
      }
      animate(a, { height: [a.offsetHeight + 'px', target + 'px'] }, { duration: 0.4, easing: [0.65, 0, 0.35, 1] });
    }

    setOpen(item.classList.contains('is-open'), true);

    q.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem !== item) setOpen.call(null, false);
      });
      document.querySelectorAll('.faq-item').forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          if (!reduceMotion) {
            animate(otherItem.querySelector('.faq-a'), { height: [otherItem.querySelector('.faq-a').offsetHeight + 'px', '0px'] }, { duration: 0.35, easing: [0.65, 0, 0.35, 1] });
          } else {
            otherItem.querySelector('.faq-a').style.height = '0px';
          }
        }
      });
      setOpen(willOpen);
    });

    window.addEventListener('resize', () => {
      if (item.classList.contains('is-open')) a.style.height = p.offsetHeight + 'px';
    });
  });
}

/* ---------------------------------------------------------
   Pitch measurement widget — simulated live HZ readout
   --------------------------------------------------------- */
function initPitchWidget() {
  const btn = document.getElementById('pitchBtn');
  const hz = document.querySelector('[data-hz]');
  const pulses = document.querySelectorAll('.pitch-widget [data-pulse]');
  if (!btn) return;
  let running = false;
  let timer = null;

  function pulseLoop() {
    pulses.forEach((p, i) => {
      animate(p, { scale: [1, 1.7], opacity: [0.5, 0] }, { duration: 1.8, delay: i * 0.6, repeat: Infinity, easing: 'ease-out' });
    });
  }
  if (!reduceMotion) pulseLoop();

  btn.addEventListener('click', () => {
    running = !running;
    btn.textContent = running ? 'Stop Measuring' : 'Start Measuring';
    if (running) {
      timer = setInterval(() => {
        const val = Math.round(90 + Math.random() * 130);
        hz.textContent = val;
        if (!reduceMotion) animate(hz, { transform: ['scale(1.15)', 'scale(1)'] }, { duration: 0.25 });
      }, 700);
    } else {
      clearInterval(timer);
      hz.textContent = '—';
    }
  });
}

/* ---------------------------------------------------------
   Mic / speech test widget
   --------------------------------------------------------- */
function initMicWidget() {
  const btn = document.getElementById('micBtn');
  const rings = document.querySelectorAll('.mic-wrap [data-pulse]');
  if (!btn) return;
  let recording = false;
  let rafHandles = [];

  function startPulse() {
    rafHandles = Array.from(rings).map((ring, i) =>
      animate(ring, { scale: [1, 1.9], opacity: [0.55, 0] }, { duration: 1.6, delay: i * 0.5, repeat: Infinity, easing: 'ease-out' })
    );
  }
  function stopPulse() {
    rafHandles.forEach((h) => h.stop && h.stop());
    rings.forEach((r) => { r.style.opacity = 0; r.style.transform = 'scale(1)'; });
  }

  btn.addEventListener('click', () => {
    recording = !recording;
    btn.classList.toggle('is-recording', recording);
    btn.setAttribute('aria-label', recording ? 'Stop recording' : 'Start recording');
    if (recording && !reduceMotion) startPulse();
    if (!recording) stopPulse();
  });
}

/* ---------------------------------------------------------
   Card hover lift (subtle scale via Motion for cards using JS
   orchestration beyond what CSS transitions alone provide)
   --------------------------------------------------------- */
function initButtonPress() {
  document.querySelectorAll('.btn, .icon-btn, .tile, .mock-card, .skill-card').forEach((el) => {
    el.addEventListener('pointerdown', () => {
      if (reduceMotion) return;
      animate(el, { scale: [1, 0.97] }, { duration: 0.15, easing: [0.65, 0, 0.35, 1] });
    });
    el.addEventListener('pointerup', () => {
      if (reduceMotion) return;
      animate(el, { scale: [0.97, 1] }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

initHeader();
initReveal();
initProgressBars();
initCounters();
initCountdown();
initRing();
initTabGroups('.filter-tabs');
initTabGroups('.guide-tabs');
initTabGroups('.mini-tabs');
initTabGroups('.speech-tabs');
initDots();
initAccordion();
initPitchWidget();
initMicWidget();
initButtonPress();
