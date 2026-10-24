// localSpace investor data room: charts, the min/mid/max switcher, print and small helpers.
// All text and tables are in index.html; this file only adds to them.
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Print / "Download as PDF": open every collapsible box first.
  let reopened = [];
  window.addEventListener('beforeprint', () => {
    reopened = $$('details:not([open])').filter((d) => !d.classList.contains('menu'));
    reopened.forEach((d) => { d.open = true; });
  });
  window.addEventListener('afterprint', () => { reopened.forEach((d) => { d.open = false; }); reopened = []; });
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  // Phone menu closes after a choice.
  const menu = $('.menu');
  if (menu) {
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) menu.open = false; });
    document.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  // Gentle fade-in, none with reduced motion.
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.sec .wrap').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('fade'); io.observe(el); }
    });
  }

  // Tooltip for chart values: hover, keyboard focus or tap.
  const tip = $('.tip');
  let tipFor = null;
  const showTip = (el) => {
    tipFor = el;
    tip.textContent = el.getAttribute('aria-label');
    tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const x = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
    const y = r.top - t.height - 8 < 8 ? r.bottom + 8 : r.top - t.height - 8;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
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

  // Formatting, the same as the tables.
  const fB = (v) => `$${v.toFixed(2)}B`;
  const fM = (v) => `$${v.toFixed(1)}M`;
  const fUSD = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  const el = (name, attrs = {}, text) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  // Charts are drawn at the box width, so text stays at its real size on phones.
  const widthOf = (plot, max) => Math.max(260, Math.min(max, Math.round(plot.clientWidth || max)));
  const svgRoot = (w, h, label) => el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label });

  const color = { tam: 'var(--c-tam)', sam: 'var(--c-sam)', som: 'var(--c-som)' };
  const CASES = ['min', 'mid', 'max'];

  // Axis: a round step, at most five steps up to the top value.
  const axis = (m) => {
    const p = 10 ** Math.floor(Math.log10(m / 5));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => Math.ceil(m / s) <= 5);
    const n = Math.ceil(m / step);
    return { max: n * step, ticks: Array.from({ length: n + 1 }, (_, k) => +(k * step).toPrecision(6)) };
  };

  // Line chart: the chosen case bold with points, the other two thin.
  function lineChart(plot, { years, series, chosen, fmt, axisFmt, unit, key, label }) {
    const W = widthOf(plot, 560), H = 250, L = 70, R = 12, T = 14, B = 44;
    const { max, ticks } = axis(Math.max(...CASES.flatMap((c) => series[c])));
    const x = (i) => L + (i * (W - L - R)) / (years.length - 1);
    const y = (v) => T + (H - T - B) * (1 - v / max);
    const svg = svgRoot(W, H, label);
    for (const v of ticks) {
      svg.append(el('line', { class: v ? 'gridline' : 'axis', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      svg.append(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, axisFmt(v)));
    }
    years.forEach((yr, i) => svg.append(el('text', { x: x(i), y: H - B + 18, 'text-anchor': 'middle' }, String(yr))));
    svg.append(el('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle' }, 'Year'));
    svg.append(el('text', { x: 12, y: T + (H - T - B) / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${T + (H - T - B) / 2})` }, unit));
    for (const c of CASES.filter((c) => c !== chosen).concat(chosen)) {
      const on = c === chosen;
      const d = series[c].map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
      svg.append(el('path', { d, fill: 'none', stroke: color[key], 'stroke-width': on ? 3 : 1.5, 'stroke-dasharray': on ? '' : '4 4', opacity: on ? 1 : 0.55 }));
      const last = series[c].length - 1;
      svg.append(el('text', { x: x(last) - 4, y: y(series[c][last]) - 8, 'text-anchor': 'end', class: on ? 't-strong' : '' }, cap(c)));
      if (on) series[c].forEach((v, i) => svg.append(el('circle', {
        class: 'pt', cx: x(i), cy: y(v), r: 5.5, fill: color[key], tabindex: 0, role: 'img',
        'aria-label': `${key.toUpperCase()} ${years[i]}, ${cap(c)} case: ${fmt(v)}`,
      })));
    }
    plot.replaceChildren(svg);
    hookTips(plot);
  }

  // Nested circles for one year; not to scale (the levels differ by thousands of times).
  function circles(plot, M, scn, year) {
    const i = M.years.indexOf(year), S = M.scenarios[scn];
    const W = widthOf(plot, 420), s = W / 420, H = 270 * Math.max(s, 0.8), cx = 135 * s, bottom = H - 8;
    const rows = [
      ['tam', 'TAM, global', fB(S.tam_busd[i]), 125 * s],
      ['sam', 'SAM, Central Asia', fM(S.sam_musd[i]), 78 * s],
      ['som', 'SOM, Uzbekistan', fUSD(S.som_seats[i] * M.price_per_seat_year), 38 * s],
    ];
    const svg = svgRoot(W, H, `Market size, ${scn} case, ${year}`);
    rows.forEach(([k, name, val, r], j) => {
      const cy = bottom - r;
      svg.append(el('circle', {
        class: 'pt', cx, cy, r, fill: color[k], 'fill-opacity': k === 'tam' ? 0.5 : 0.9, tabindex: 0, role: 'img',
        'aria-label': `${name}, ${cap(scn)} case, ${year}: ${val}`,
      }));
      const ly = bottom - [226, 134, 48][j] * s;
      svg.append(el('line', { x1: cx + r * 0.45, y1: cy - r * 0.89 + 4, x2: 282 * s, y2: ly - 4, stroke: 'var(--sub)', 'stroke-width': 1 }));
      svg.append(el('text', { x: 288 * s, y: ly - 4, class: 't-strong' }, val));
      svg.append(el('text', { x: 288 * s, y: ly + 13 }, name));
    });
    plot.replaceChildren(svg);
    hookTips(plot);
  }

  // Grouped bars: yearly revenue 2027-2030 for the three cases.
  function revenue(plot, M) {
    const yrs = M.years.filter((y) => y >= 2027);
    const val = (c, y) => M.scenarios[c].som_seats[M.years.indexOf(y)] * M.price_per_seat_year;
    const W = widthOf(plot, 560), H = 260, L = 70, R = 10, T = 14, B = 46;
    const { max, ticks } = axis(Math.max(...yrs.flatMap((y) => CASES.map((c) => val(c, y)))));
    const y = (v) => T + (H - T - B) * (1 - v / max);
    const gw = (W - L - R) / yrs.length, bw = Math.min(26, (gw - 16) / 3);
    const fill = { min: 'var(--indigo-mid)', mid: 'var(--c-mid)', max: 'var(--amber)' };
    const svg = svgRoot(W, H, 'Revenue per year 2027-2030, min, mid and max cases');
    for (const v of ticks) {
      svg.append(el('line', { class: v ? 'gridline' : 'axis', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      svg.append(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, `$${+(v / 1e6).toPrecision(6)}M`));
    }
    yrs.forEach((yr, g) => {
      const x0 = L + g * gw + (gw - bw * 3 - 8) / 2;
      CASES.forEach((c, j) => {
        const v = val(c, yr);
        svg.append(el('rect', {
          class: 'pt', x: x0 + j * (bw + 4), y: y(v), width: bw, height: Math.max(1, y(0) - y(v)), rx: 3, fill: fill[c], tabindex: 0, role: 'img',
          'aria-label': `${yr}, ${cap(c)} case: ${fUSD(v)} a year`,
        }));
      });
      svg.append(el('text', { x: L + g * gw + gw / 2, y: H - B + 18, 'text-anchor': 'middle' }, String(yr)));
    });
    svg.append(el('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle' }, 'Year'));
    svg.append(el('text', { x: 12, y: T + (H - T - B) / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${T + (H - T - B) / 2})` }, 'Revenue, $ millions'));
    plot.replaceChildren(svg);
    const keyEl = document.createElement('p');
    keyEl.className = 'series-key';
    keyEl.innerHTML = CASES.map((c) => `<span><i style="background:${fill[c]}"></i>${cap(c)}</span>`).join('');
    plot.append(keyEl);
    hookTips(plot);
  }

  function market(M) {
    let scn = 'mid', year = 2030;
    const draw = () => {
      const S = (k) => Object.fromEntries(CASES.map((c) => [c, M.scenarios[c][k]]));
      const som = Object.fromEntries(CASES.map((c) => [c, M.scenarios[c].som_seats.map((n) => (n * M.price_per_seat_year) / 1e6)]));
      circles($('#chart-circles .plot'), M, scn, year);
      lineChart($('#chart-tam .plot'), { years: M.years, series: S('tam_busd'), chosen: scn, key: 'tam', fmt: fB, axisFmt: (v) => `$${v}B`, unit: '$ billions', label: 'TAM 2025-2030 in $ billions, three cases' });
      lineChart($('#chart-sam .plot'), { years: M.years, series: S('sam_musd'), chosen: scn, key: 'sam', fmt: fM, axisFmt: (v) => `$${v}M`, unit: '$ millions', label: 'SAM 2025-2030 in $ millions, three cases' });
      lineChart($('#chart-som .plot'), { years: M.years, series: som, chosen: scn, key: 'som', fmt: (v) => fUSD(v * 1e6), axisFmt: (v) => `$${v}M`, unit: '$ millions', label: 'SOM 2025-2030 in $ millions, three cases' });
      $$('[data-out="scn"]').forEach((n) => { n.textContent = scn; });
      $$('[data-out="year"]').forEach((n) => { n.textContent = year; });
    };
    $$('.controls [data-scn]').forEach((b) => b.addEventListener('click', () => {
      scn = b.dataset.scn;
      $$('.controls [data-scn]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    $$('.controls [data-year]').forEach((b) => b.addEventListener('click', () => {
      year = Number(b.dataset.year);
      $$('.controls [data-year]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    draw();
    revenue($('#chart-rev .plot'), M);
    let lastW = window.innerWidth, timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        draw();
        revenue($('#chart-rev .plot'), M);
      }, 150);
    });
  }

  fetch('data/market.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then(market)
    .catch(() => {
      // Without the data the charts stay out; the tables carry every number.
      $$('.market-charts, #chart-rev').forEach((n) => { n.hidden = true; });
      $('.controls')?.setAttribute('hidden', '');
    });
})();
