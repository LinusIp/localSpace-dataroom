// Checks the page against the data and content files. Plain node, no packages.
// Run from the repository root: node tools/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const json = (f) => JSON.parse(read(f));

const html = read('index.html');
const md = read('content/dataroom.md');
const hw = json('data/hardware.json');
const mk = json('data/market.json');
const funds = json('data/funds.json');
const gpu = json('data/gpu_plan.json');

const fails = [];
let passes = 0;
const check = (ok, msg) => { if (ok) passes++; else fails.push(msg); };
const text = (s) => s.replace(/<sup class="fn">[\s\S]*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const nums = (s) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
const all = (re, s = html) => [...s.matchAll(re)];
const table = (id) => {
  const m = html.match(new RegExp(`<table [^>]*id="${id}">([\\s\\S]*?)</table>`));
  check(m, `no table #${id}`);
  return m ? m[1] : '';
};
const n = (v) => v.toLocaleString('en-US');

// 1a. Appendix A: grid of speeds
const grid = table('grid-a');
for (const t of hw.tiers) {
  const row = grid.match(new RegExp(`<tr data-tier="${t.id}">([\\s\\S]*?)</tr>`));
  check(row, `grid: no row for ${t.id}`);
  if (!row) continue;
  if (t.price_usd) {
    const [lo, hi] = t.price_usd;
    const price = row[1].match(/<td class="num price" data-price-min="(\d+)" data-price-max="(\d+)">([^<]*)</);
    check(price && +price[1] === lo && +price[2] === hi, `grid: ${t.id} price attributes differ from ${lo}-${hi}`);
    const shown = price ? nums(price[3]) : [];
    const hiShown = shown[1] ?? shown[0];
    check(shown[0] === lo && (hiShown === hi || hiShown * 1000 === hi), `grid: ${t.id} price shows "${price?.[3]}", data says ${lo}-${hi}`);
  }
  const anyMeasured = Object.values(t.classes).some((x) => x.fit === 'measured');
  check(anyMeasured !== /class="stick">[^<]*<span class="badge e">estimate</.test(row[1]), `grid: ${t.id} estimate badge`);
  for (const c of hw.model_classes) {
    const cell = row[1].match(new RegExp(`<td class="num cell[^"]*" data-class="${c.id}" data-wps="([^"]*)"(?: data-fit="([^"]+)")?>([\\s\\S]*?)</td>`));
    check(cell, `grid: no cell ${t.id}/${c.id}`);
    if (!cell) continue;
    const want = t.classes[c.id];
    if (want.words_per_sec == null) {
      check(cell[1] === '' && text(cell[3]).startsWith('—'), `grid: ${t.id}/${c.id} should be "—"`);
      continue;
    }
    const fit = want.fit === 'measured' ? 'measured' : want.fit.startsWith('slow') ? 'slow' : 'fits';
    const v = cell[3].match(/<span class="v">(\d+)<\/span>/);
    check(+cell[1] === want.words_per_sec && v && +v[1] === want.words_per_sec, `grid: ${t.id}/${c.id} shows ${v?.[1]}, json ${want.words_per_sec}`);
    check(cell[2] === fit, `grid: ${t.id}/${c.id} fit "${cell[2]}", json "${want.fit}"`);
    check((fit === 'measured') === cell[3].includes('badge m">measured'), `grid: ${t.id}/${c.id} measured badge`);
    check((fit === 'slow') === cell[3].includes('class="dag"'), `grid: ${t.id}/${c.id} slow mark`);
  }
}

// 1b. Appendix A: people served and hardware cost per person, every row in hardware.json
const tableB = table('table-b');
for (const t of hw.tiers) {
  const body = tableB.match(new RegExp(`<tbody data-tier="${t.id}">([\\s\\S]*?)</tbody>`));
  check(Boolean(body) === t.serving.length > 0, `table B: ${t.id} ${t.serving.length ? 'missing' : 'should not be there'}`);
  if (!body) continue;
  const rows = all(/<tr data-class-name="([^"]+)">([\s\S]*?)<\/tr>/g, body[1]);
  check(rows.length === t.serving.length, `table B: ${t.id} has ${rows.length} rows, json ${t.serving.length}`);
  for (const s of t.serving) {
    const tr = rows.find((r) => r[1] === s.model_class)?.[2] ?? '';
    check(tr, `table B: ${t.id} has no row for "${s.model_class}"`);
    check(new RegExp(`data-chats="${s.chats_at_once}">${s.chats_at_once}<`).test(tr), `table B: ${t.id}/${s.model_class} chats at once`);
    check(new RegExp(`data-team-min="${s.team_size[0]}" data-team-max="${s.team_size[1]}">${s.team_size[0]}–${s.team_size[1]}<`).test(tr), `table B: ${t.id}/${s.model_class} team size`);
    check(tr.includes(`data-once="${s.hardware_cost_per_person_once_usd}">about ${n(s.hardware_cost_per_person_once_usd)}<`), `table B: ${t.id}/${s.model_class} one-time cost`);
    check(tr.includes(`data-month="${s.hardware_cost_per_person_month_usd}">about ${s.hardware_cost_per_person_month_usd.toFixed(1)}<`), `table B: ${t.id}/${s.model_class} monthly cost`);
  }
}

// 1c. Market: 2025 base, the TAM/SAM table, SOM seats and the revenue table
const base = html.match(/<div class="figures" id="base-2025">([\s\S]*?)<\/div>\s*<h3/)[1];
for (const [k, want] of [['tam', mk.base.tam_busd], ['sam', mk.base.sam_musd], ['som', mk.base.som_usd]]) {
  const m = base.match(new RegExp(`data-metric="${k}" data-v="([\\d.]+)"><p class="fig">([^<]+)<`));
  check(m && +m[1] === want && nums(m[2])[0] === want, `market: 2025 ${k} shows ${m?.[2]}, json ${want}`);
}
for (const c of ['min', 'mid', 'max']) {
  check(mk.scenarios[c].tam_busd[0] === mk.base.tam_busd && mk.scenarios[c].sam_musd[0] === mk.base.sam_musd, `market.json: ${c} 2025 differs from the base`);
  const g = mk.scenarios[c].growth_per_year;
  mk.scenarios[c].tam_busd.forEach((v, i) => check(Math.abs(v - mk.base.tam_busd * (1 + g) ** i) < 0.006, `market.json: ${c} TAM ${mk.years[i]} is not the base × growth`));
}
const mt = table('market-table');
for (const [, yr, tr] of all(/<tr data-year="(\d+)">([\s\S]*?)<\/tr>/g, mt)) {
  const i = mk.years.indexOf(+yr);
  const cells = all(/data-metric="(tam|sam)" data-scn="(min|mid|max)" data-v="([\d.]+)">([^<]+)</g, tr);
  check(cells.length === 6, `market table: ${yr} has ${cells.length} cells`);
  for (const [, k, c, v, shown] of cells) {
    const want = mk.scenarios[c][k === 'tam' ? 'tam_busd' : 'sam_musd'][i];
    check(+v === want && shown === (k === 'tam' ? want.toFixed(2) : want.toFixed(1)), `market table: ${yr} ${k} ${c} shows ${shown}, json ${want}`);
  }
}
check(all(/<tr data-year="/g, mt).length === mk.years.length, 'market table: years differ from json');
for (const id of ['som-table', 'rev-table']) {
  const tb = table(id);
  check(all(/<tr data-year="/g, tb).length === mk.years.length, `${id}: years differ from json`);
  for (const [, yr, tr] of all(/<tr data-year="(\d+)">([\s\S]*?)<\/tr>/g, tb)) {
    const i = mk.years.indexOf(+yr);
    for (const [, c, seats, shown] of all(/data-scn="(\w+)" data-seats="(\d+)">([^<]+)</g, tr)) {
      const w = mk.scenarios[c].som_seats[i];
      check(+seats === w && nums(shown)[0] === w, `${id}: ${yr}/${c} seats ${shown}, json ${w}`);
    }
    const revs = all(/data-scn="(\w+)" data-rev="(\d+)">([^<]+)</g, tr);
    check(revs.length === 3, `${id}: ${yr} has ${revs.length} revenue cells`);
    for (const [, c, rev, shown] of revs) {
      const w = mk.scenarios[c].som_seats[i] * mk.price_per_seat_year;
      check(+rev === w && nums(shown)[0] === w, `${id}: ${yr}/${c} revenue ${shown}, json ${w}`);
    }
  }
}
check(mk.price_per_seat_year === 9 * 12, 'market.json: price per seat is not $9 × 12');

// 1d. Use of funds
const ft = table('funds-table');
const fundRows = all(/<tr data-rank="(\d+)" data-usd="(\d+)">([\s\S]*?)<\/tr>/g, ft);
check(fundRows.length === funds.priority_order.length, `funds: ${fundRows.length} rows on the page, ${funds.priority_order.length} in json`);
for (const [, rank, usd, tr] of fundRows) {
  const f = funds.priority_order.find((x) => x.rank === +rank);
  check(f && f.usd === +usd, `funds: line ${rank} amount ${usd}`);
  if (!f) continue;
  const name = text(tr.match(/<th scope="row" class="stick">([\s\S]*?)<\/th>/)[1]);
  check(name === f.line || name === f.line.replace(/-/g, '–'), `funds: line ${rank} named "${name}", json "${f.line}"`);
  const cells = all(/<td class="num"[^>]*>([^<]+)<\/td>/g, tr).map((m) => m[1]);
  check(nums(cells[1] ?? '')[0] === f.usd, `funds: line ${rank} shows a different amount`);
  check(nums(cells[2] ?? '')[0] === +(f.usd / funds.total_usd * 100).toFixed(1), `funds: line ${rank} percentage`);
}
// 2. Sums
const fundSum = funds.priority_order.reduce((a, f) => a + f.usd, 0);
check(fundSum === 25000 && funds.total_usd === 25000, `funds: lines add up to ${fundSum}, not 25,000`);
check(/data-total="25000">25,000</.test(ft), 'funds: total on the page is not 25,000');
const bar = all(/flex-basis:([\d.]+)%/g, html.match(/<div class="stack"[\s\S]*?<\/div>/)?.[0] ?? '');
check(bar.length === funds.priority_order.length && Math.abs(bar.reduce((a, m) => a + +m[1], 0) - 100) < 0.01, 'funds: the stacked bar does not add up to 100%');

const gt = table('gpu-table');
const stepRows = all(/<tr data-step="(\w+)" data-hours="(\d+)">([\s\S]*?)<\/tr>/g, gt);
check(stepRows.length === gpu.steps.length + 1, 'GPU: steps on the page differ from json');
for (const [, step, hours, tr] of stepRows) {
  const s = gpu.steps.find((x) => x.step === +step);
  const want = step === 'repeats' ? gpu.repeats_hours : s?.hours;
  check(+hours === want && nums(text(tr.match(/<td class="num">([^<]+)<\/td><\/tr>|<td class="num">([^<]+)<\/td>$/)?.[0] ?? ''))[0] === want, `GPU: step ${step} hours`);
  if (s) {
    check(text(tr.match(/<th scope="row" class="stick">([\s\S]*?)<\/th>/)[1]) === s.name, `GPU: step ${step} name`);
    check(text(tr.match(/<\/th><td>([\s\S]*?)<\/td>/)[1]) === s.detail, `GPU: step ${step} detail`);
  }
}
const stepSum = gpu.steps.reduce((a, s) => a + s.hours, 0);
check(stepSum === gpu.core_hours, `GPU: steps add up to ${stepSum}, core_hours ${gpu.core_hours}`);
check(stepSum + gpu.repeats_hours === gpu.total_hours, `GPU: steps + repeats = ${stepSum + gpu.repeats_hours}, total ${gpu.total_hours}`);
check(gt.includes(`data-total-hours="${gpu.total_hours}">${n(gpu.total_hours)}<`), 'GPU: total hours on the page');
const goals = table('goals');
for (const g of gpu.goals) check(goals.includes(`>${g.name}</th><td>${g.target}</td><td>${g.effect}</td>`), `GPU: goal "${g.name}" not on the page as written`);

// The team-of-24 worked example adds up
const desk = hw.tiers.find((t) => t.id === 'desktop-16gb');
const mid = (desk.price_usd[0] + desk.price_usd[1]) / 2;
const cloud = 20 * 24 * 12, ours = 9 * 24 * 12 + Math.round(mid / 3);
const sv = table('savings');
check(sv.includes(`data-cloud-year="${cloud}">$${n(cloud)}<`) && sv.includes(`data-ls-year="${ours}">$${n(ours)}<`), `savings: per-year totals should be ${cloud} and ${ours}`);
check(sv.includes(`data-cloud-3y="${cloud * 3}">$${n(cloud * 3)}<`) && sv.includes(`data-ls-3y="${9 * 24 * 12 * 3 + mid}">$${n(9 * 24 * 12 * 3 + mid)}<`), 'savings: 3-year totals');

// 3. Sources: every section 15 link is in Appendix E, and every footnote points to a source
const appE = html.slice(html.indexOf('<section id="sources"'));
const listed = all(/<li id="src-(\d+)">[\s\S]*?href="([^"]+)"/g, appE).map((m) => [+m[1], m[2].replace(/&amp;/g, '&')]);
listed.forEach(([i], k) => check(i === k + 1, `sources: entry ${k + 1} is numbered ${i}`));
const sec15 = md.slice(md.indexOf('## 15. Sources'), md.indexOf('## 16.'));
const sources = [...new Set(all(/https?:\/\/[^\s)]+/g, sec15).map((m) => m[0]))];
check(sources.length > 30, `content: only ${sources.length} source links found in section 15`);
for (const s of sources) check(listed.some(([, u]) => u === s), `sources: ${s} is not in Appendix E`);
check(listed.length === sources.length, `sources: Appendix E has ${listed.length} entries, section 15 has ${sources.length}`);
const body = html.slice(0, html.indexOf('<section id="sources"'));
const refs = all(/<sup class="fn">([\s\S]*?)<\/sup>/g, body).flatMap((m) => all(/href="#src-(\d+)">(\d+)</g, m[1]).map((r) => [+r[1], +r[2]]));
check(refs.length > 40, `footnotes: only ${refs.length} found`);
let seen = 0;
for (const [to, label] of refs) {
  check(to === label && to >= 1 && to <= listed.length, `footnotes: [${label}] points to #src-${to}`);
  check(to <= seen + 1, `footnotes: [${to}] appears before [${seen + 1}]`);
  seen = Math.max(seen, to);
}

// 4. No requests to other sites; outside links only in Appendix E (plus download site, Telegram, mailto)
const allowedAnywhere = new Set(['https://linusip.github.io/localLabs/', 'https://t.me/localSpace_discussion']);
for (const [, attr, url] of all(/\b(src|href)="([^"]+)"/g)) {
  const u = url.replace(/&amp;/g, '&');
  if (u.startsWith('mailto:') || u.startsWith('#')) continue;
  if (/^(https?:)?\/\//.test(u)) {
    check(attr === 'href' && (sources.includes(u) || allowedAnywhere.has(u)), `external ${attr}: ${u}`);
    continue;
  }
  check(fs.existsSync(path.join(root, u.split(/[?#]/)[0])), `missing local file: ${u}`);
}
for (const [, url] of all(/\bhref="(https?:[^"]+)"/g, body)) check(allowedAnywhere.has(url.replace(/&amp;/g, '&')), `outside link in the body instead of a footnote: ${url}`);
const css = read('styles.css'), js = read('app.js');
check(!/url\(\s*['"]?(https?:)?\/\//.test(css) && !/@import/.test(css), 'styles.css loads something from another site');
check(!/(fetch|import)\s*\(\s*['"`](https?:)?\/\//.test(js) && !/XMLHttpRequest|sendBeacon|WebSocket|document\.cookie|localStorage/.test(js), 'app.js talks to another site or stores something');
for (const [, attr, url] of all(/\b(src|href)="([^"]+)"/g, read('404.html'))) check(!/^(https?:)?\/\//.test(url), `404.html: external ${attr} ${url}`);

// 5. Images
for (const [tag] of all(/<img\b[^>]*>/g)) {
  const alt = tag.match(/\balt="([^"]*)"/);
  check(alt && alt[1].trim(), `image without alt text: ${tag}`);
  check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `image without width/height: ${tag}`);
}
for (const f of fs.readdirSync(path.join(root, 'assets/img'))) {
  const kb = fs.statSync(path.join(root, 'assets/img', f)).size / 1024;
  check(kb <= 200, `assets/img/${f} is ${kb.toFixed(0)} KB, over 200 KB`);
}

// The "don't" list: no exclamation marks or buzzwords in the page text, no emoji
const words = text(body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, ''));
check(!words.includes('!'), 'page text has an exclamation mark');
for (const w of ['revolutionary', 'game-changing', 'seamless', 'unlock', 'empower', 'cutting-edge', 'next-gen']) check(!words.toLowerCase().includes(w), `page text uses "${w}"`);
check(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(words), 'page text has an emoji');
check(!/gradient\(|backdrop-filter|box-shadow/.test(css), 'styles.css has a gradient, blur or shadow');
for (const [, r] of all(/border-radius:\s*(\d+)px/g, css)) check(+r <= 8, `styles.css has a ${r}px corner (over 8 px)`);

// Footer date matches the content file
const updated = md.match(/Last updated: ([^.\n]+)/)[1];
check(html.includes(`>${updated}</time>`), `last-updated date differs from content ("${updated}")`);

if (fails.length) {
  console.error(`FAILED ${fails.length} of ${fails.length + passes} checks:`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`All ${passes} checks passed.`);
