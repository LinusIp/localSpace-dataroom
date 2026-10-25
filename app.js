// localSpace investor data room: contents highlight, market charts and the min/mid/max switcher, print.
// All text and tables are in index.html; this file only adds to them.
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  // Contents: open beside the page on wide screens, a button on phones.
  const toc = $('.toc');
  const narrow = window.matchMedia('(max-width: 999px)');
  const fitToc = () => { toc.open = !narrow.matches; };
  fitToc();
  narrow.addEventListener('change', fitToc);
  toc.addEventListener('click', (e) => { if (narrow.matches && e.target.closest('a')) toc.open = false; });

  // Highlight the section being read.
  const links = new Map($$('.toc a').map((a) => [a.getAttribute('href').slice(1), a]));
  const visible = new Set();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id));
      const current = [...links.keys()].find((id) => visible.has(id));
      if (current) links.forEach((a, id) => a.setAttribute('aria-current', String(id === current)));
    }, { rootMargin: '-10% 0px -70% 0px' });
    $$('main .sec').forEach((s) => io.observe(s));
  }

  // Tooltip for chart values: hover, keyboard focus or tap.
  const tip = $('.tip');
  let tipFor = null;
  const showTip = (el) => {
    tipFor = el;
    tip.textContent = el.getAttribute('aria-label');
    tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    tip.style.left = `${Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8)}px`;
    tip.style.top = `${r.top - t.height - 8 < 8 ? r.bottom + 8 : r.top - t.height - 8}px`;
  };
  const hideTip = () => { tip.hidden = true; tipFor = null; };
  const hookTips = (root) => $$('.pt', root).forEach((p) => {
    p.addEventListener('pointerenter', () => showTip(p));
    p.addEventListener('pointerleave', hideTip);
    p.addEventListener('focus', () => showTip(p));
    p.addEventListener('blur', hideTip);
    p.addEventListener('click', (e) => { e.stopPropagation(); if (tipFor === p) hideTip(); else showTip(p); });
  });
  document.addEventListener('click', hideTip);
  window.addEventListener('scroll', () => { if (tipFor) hideTip(); }, { passive: true });

  const CASES = ['min', 'mid', 'max'];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const el = (name, attrs = {}, text) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  // Axis: a round step, at most five steps up to the top value.
  const axis = (m) => {
    const p = 10 ** Math.floor(Math.log10(m / 5));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => Math.ceil(m / s) <= 5);
    const n = Math.ceil(m / step);
    return { max: n * step, ticks: Array.from({ length: n + 1 }, (_, k) => +(k * step).toPrecision(6)) };
  };
  // Charts are drawn at the box width, so text stays at its real size on phones.
  const widthOf = (plot) => Math.max(260, Math.min(520, Math.round(plot.clientWidth || 520)));

  // Fan chart: min and max dashed with a light band between them, mid solid; points on the chosen case.
  function fan(plot, { years, series, chosen, fmt, axisFmt, unit, title }) {
    // The right margin fits the longest end label ("Max $2,160,000").
    const longest = Math.max(...CASES.map((c) => `${cap(c)} ${fmt(series[c][series[c].length - 1])}`.length));
    const W = widthOf(plot), H = 240, L = 58, R = 12 + longest * 6.6, T = 12, B = 40;
    const { max, ticks } = axis(Math.max(...series.max));
    const x = (i) => L + (i * (W - L - R)) / (years.length - 1);
    const y = (v) => T + (H - T - B) * (1 - v / max);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title });
    for (const v of ticks) {
      svg.append(el('line', { class: v ? 'gridline' : 'axis', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      svg.append(el('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, axisFmt(v)));
    }
    years.forEach((yr, i) => svg.append(el('text', { x: x(i), y: H - B + 16, 'text-anchor': 'middle' }, String(yr))));
    svg.append(el('text', { x: L, y: H - 4 }, `Year · ${unit}`));
    const pts = (s) => series[s].map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    svg.append(el('polygon', { points: [...pts('max'), ...pts('min').reverse()].join(' '), fill: 'var(--series)', opacity: 0.08 }));
    for (const c of CASES) {
      svg.append(el('polyline', { points: pts(c).join(' '), fill: 'none', stroke: 'var(--series)', 'stroke-width': c === 'mid' ? 2 : 1.5, 'stroke-dasharray': c === 'mid' ? '' : '5 4' }));
      const last = series[c].length - 1;
      svg.append(el('text', { x: x(last) + 6, y: y(series[c][last]) + 4, class: c === chosen ? 't-strong' : '' }, `${cap(c)} ${fmt(series[c][last])}`));
    }
    series[chosen].forEach((v, i) => svg.append(el('circle', {
      class: 'pt', cx: x(i), cy: y(v), r: 4, fill: 'var(--bg)', stroke: 'var(--series)', 'stroke-width': 1.5, tabindex: 0, role: 'img',
      'aria-label': `${years[i]}, ${cap(chosen)} case: ${fmt(v)}`,
    })));
    plot.replaceChildren(svg);
    hookTips(plot);
  }

  function market(M) {
    let scn = 'mid';
    const fB = (v) => `$${v.toFixed(2)}B`, fM = (v) => `$${v.toFixed(1)}M`;
    const fUSD = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
    const pick = (k) => Object.fromEntries(CASES.map((c) => [c, M.scenarios[c][k]]));
    const rev = Object.fromEntries(CASES.map((c) => [c, M.scenarios[c].som_seats.map((n) => n * M.price_per_seat_year / 1e6)]));
    const draw = () => {
      fan($('[data-plot="tam"]'), { years: M.years, series: pick('tam_busd'), chosen: scn, fmt: fB, axisFmt: (v) => `$${v}B`, unit: 'TAM, USD billions', title: 'TAM 2025-2030, three cases' });
      fan($('[data-plot="sam"]'), { years: M.years, series: pick('sam_musd'), chosen: scn, fmt: fM, axisFmt: (v) => `$${v}M`, unit: 'SAM, USD millions', title: 'SAM 2025-2030, three cases' });
      fan($('#chart-rev .plot'), { years: M.years, series: rev, chosen: scn, fmt: (v) => fUSD(v * 1e6), axisFmt: (v) => `$${v}M`, unit: 'revenue, USD millions', title: 'Revenue 2025-2030, three cases' });
      const S = M.scenarios[scn], last = M.years.length - 1;
      $('[data-out="readout"]').textContent = `${cap(scn)} case, ${(S.growth_per_year * 100).toFixed(1)}% a year: 2030 TAM ${fB(S.tam_busd[last])}, SAM ${fM(S.sam_musd[last])}.`;
      $$('#market-table .c-on, #rev-table .c-on').forEach((n) => n.classList.remove('c-on'));
      $$(`#market-table .c-${scn}, #rev-table .c-${scn}`).forEach((n) => n.classList.add('c-on'));
    };
    $$('.controls [data-scn]').forEach((b) => b.addEventListener('click', () => {
      scn = b.dataset.scn;
      $$('.controls [data-scn]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    draw();
    let lastW = window.innerWidth, timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; draw(); } }, 150);
    });
  }

  fetch('data/market.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(market)
    .catch(() => {
      // Without the data the charts stay out; the tables carry every number.
      $$('#chart-market, #chart-rev, .controls').forEach((n) => { n.hidden = true; });
    });
})();
