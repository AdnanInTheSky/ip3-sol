/**
 * IP3 Solutions — Alpine.js application
 * ---------------------------------------------------------------
 * All content is loaded from /data/*.json. Edit the JSON, not the HTML.
 * Structure:
 *   DATA_FILES   -> which JSON file feeds which key of the `site` store
 *   directives   -> x-reveal (scroll-in animation)
 *   components   -> site() root, counter() animated number
 */

const DATA_FILES = {
  site: 'data/site.json',
  services: 'data/services.json',
  projects: 'data/projects.json',
  stats: 'data/stats.json',
  process: 'data/process.json',
  comparison: 'data/comparison.json',
  engagement: 'data/engagement.json',
  testimonials: 'data/testimonials.json',
  faq: 'data/faq.json',
  tech: 'data/tech.json'
};

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

document.addEventListener('alpine:init', () => {
  /* ---------- x-reveal: fade/slide in when scrolled into view ---------- */
  Alpine.directive('reveal', (el, { modifiers, expression }, { evaluate }) => {
    const delay = expression ? Number(evaluate(expression)) || 0 : 0;
    el.classList.add('reveal');
    if (delay) el.style.transitionDelay = `${delay}ms`;
    if (!('IntersectionObserver' in window)) return el.classList.add('is-visible');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect(); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
  });

  /* ---------- counter: animates a number once it is visible ---------- */
  Alpine.data('counter', (target) => ({
    n: 0,
    run() {
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        this.n = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    init() {
      if (!('IntersectionObserver' in window)) { this.n = target; return; }
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) { this.run(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(this.$el);
    }
  }));

  /* ---------- root component ---------- */
  Alpine.data('site', () => ({
    ready: false,
    error: null,
    d: {},                 // all loaded JSON, keyed by DATA_FILES
    menuOpen: false,
    scrolled: false,
    filter: 'All',
    active: null,          // project shown in the modal
    openFaq: 0,
    testimonialIdx: 0,
    form: { name: '', email: '', company: '', service: '', budget: '', message: '' },
    sent: false,

    async init() {
      try {
        const keys = Object.keys(DATA_FILES);
        const results = await Promise.all(keys.map((k) => loadJSON(DATA_FILES[k])));
        keys.forEach((k, i) => (this.d[k] = results[i]));
        this.form.service = this.d.site.form.services[0];
        this.form.budget = this.d.site.form.budgets[0];
        document.title = this.d.site.meta.title;
        const md = document.querySelector('meta[name="description"]');
        if (md) md.content = this.d.site.meta.description;
        this.ready = true;
        this.$nextTick(() => this.scrollToHash());
      } catch (e) {
        console.error(e);
        this.error = e.message;
      }
      this.onScroll();
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this._auto = setInterval(() => this.nextTestimonial(true), 7000);
    },

    onScroll() { this.scrolled = window.scrollY > 24; },
    scrollToHash() {
      if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
    },

    /* helpers */
    icon(name, cls = 'size-5') {
      const body = window.IP3_ICONS[name] || '';
      const fill = name === 'star' ? 'currentColor' : 'none';
      return `<svg class="${cls}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    },
    get filtered() {
      const items = this.d.projects.items;
      return this.filter === 'All' ? items : items.filter((p) => p.category === this.filter);
    },
    countIn(cat) {
      const items = this.d.projects.items;
      return cat === 'All' ? items.length : items.filter((p) => p.category === cat).length;
    },
    openProject(p) { this.active = p; document.body.classList.add('overflow-hidden'); },
    closeProject() { this.active = null; document.body.classList.remove('overflow-hidden'); },
    nextTestimonial(auto = false) {
      if (auto && this._paused) return;
      this.testimonialIdx = (this.testimonialIdx + 1) % this.d.testimonials.length;
    },
    prevTestimonial() {
      const n = this.d.testimonials.length;
      this.testimonialIdx = (this.testimonialIdx - 1 + n) % n;
    },
    initials(name) { return name.split(' ').map((w) => w[0]).slice(0, 2).join(''); },

    /* contact form -> opens the visitor's mail client (no backend needed).
       Swap for fetch() to Formspree / Netlify Forms / your API when ready. */
    submitForm() {
      const f = this.form, cfg = this.d.site.form;
      const body = [
        `Name: ${f.name}`, `Email: ${f.email}`, `Company: ${f.company || '-'}`,
        `Service: ${f.service}`, `Budget: ${f.budget}`, '', f.message
      ].join('\n');
      const url = `mailto:${cfg.mailTo}?subject=${encodeURIComponent(cfg.subjectPrefix + f.name)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
      this.sent = true;
    }
  }));
});
